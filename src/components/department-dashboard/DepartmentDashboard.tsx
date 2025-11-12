import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RefreshCw } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import MasterDataManagement, { EntityType } from "./department-workflow/MasterDataManagement";
import { MasterDataChangeRequest } from "@/types/masterData";

export default function DepartmentDashboard() {
  const { userRole } = useAuth();
  const { toast } = useToast();

  const [isDataLoading, setIsDataLoading] = useState(false);
  const [selectedMasterDataEntity, setSelectedMasterDataEntity] = useState<MasterDataChangeRequest["entityType"]>("Districts");
  const [showMasterDataRequestDialog, setShowMasterDataRequestDialog] = useState(false);
  const [masterDataRequestType, setMasterDataRequestType] = useState<"create" | "update" | "deactivate">("create");
  const [masterDataRequestReason, setMasterDataRequestReason] = useState("");
  const [masterDataChangeRequests, setMasterDataChangeRequests] = useState<MasterDataChangeRequest[]>([
    {
      id: 1,
      entityType: "Districts",
      operation: "create",
      requestedBy: "Junior Manager",
      requestDate: "2024-01-01",
      status: "Pending",
      currentApprover: "Manager",
      approvalLevel: 1,
      reason: "New district creation",
      payload: { name: "New District", code: "ND" },
      daysPending: 5,
    },
  ]);

  const [selectedMasterDataRequest, setSelectedMasterDataRequest] = useState<MasterDataChangeRequest | null>(null);
  const [actionType, setActionType] = useState<"approve" | "send-back" | "reject">("approve");
  const [actionReason, setActionReason] = useState("");
  const [showActionDialog, setShowActionDialog] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved":
        return "bg-green-100 text-green-800";
      case "Rejected":
        return "bg-red-100 text-red-800";
      case "Under Review":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleRefreshData = () => {
    setIsDataLoading(true);
    setTimeout(() => setIsDataLoading(false), 2000);
  };

  const handleMasterDataChangeRequest = (
    entityType: MasterDataChangeRequest["entityType"],
    operation: "create" | "update" | "deactivate",
    payload: any,
    reason: string
  ) => {
    const newRequest: MasterDataChangeRequest = {
      id: masterDataChangeRequests.length + 1,
      entityType,
      operation,
      requestedBy: userRole || "Requestor",
      requestDate: new Date().toISOString().split("T")[0],
      status: "Pending",
      currentApprover: "Manager",
      approvalLevel: 1,
      reason,
      payload,
      daysPending: 0,
    };
    setMasterDataChangeRequests((prev) => [...prev, newRequest]);
    toast({
      title: "Request Created",
      description: `New ${operation} request for ${entityType} has been submitted.`,
    });
    setShowMasterDataRequestDialog(false);
    setMasterDataRequestReason("");
  };

  const handleMasterDataActionSelect = (request: MasterDataChangeRequest, type: "approve" | "send-back" | "reject") => {
    setSelectedMasterDataRequest(request);
    setActionType(type);
    setShowActionDialog(true);
  };

  const handleConfirmMasterDataAction = () => {
    if (!selectedMasterDataRequest) return;

    const updatedRequests = masterDataChangeRequests.map((req) => {
      if (req.id === selectedMasterDataRequest.id) {
        let newStatus = req.status;
        let newApprover = req.currentApprover;
        let newLevel = req.approvalLevel;

        if (actionType === "approve") {
          if (req.approvalLevel < 4) {
            newStatus = "Under Review";
            newLevel += 1;
            newApprover =
              newLevel === 2
                ? "Manager"
                : newLevel === 3
                ? "Senior Manager"
                : newLevel === 4
                ? "Role Admin"
                : "N/A";
          } else {
            newStatus = "Approved";
            newApprover = "N/A";
          }
        } else if (actionType === "send-back") {
          newStatus = "Pending";
          newLevel = 1;
          newApprover = "Manager";
        } else if (actionType === "reject") {
          newStatus = "Rejected";
          newApprover = "N/A";
        }

        return { ...req, status: newStatus, currentApprover: newApprover, approvalLevel: newLevel };
      }
      return req;
    });

    setMasterDataChangeRequests(updatedRequests);
    setShowActionDialog(false);
    setActionReason("");
    toast({
      title: `Request ${actionType === "approve" ? "Approved" : actionType === "reject" ? "Rejected" : "Sent Back"}`,
      description: `Request #${selectedMasterDataRequest.id} has been updated.`,
    });
  };

  // Role-based View Filtering
  const isRequestor = userRole === "ROLE_JuniorManager";
  const isApprover =
    userRole === "ROLE_Manager" ||
    userRole === "ROLE_SeniorManager" ||
    userRole === "ROLE_ADMIN";
  const isDashboardViewer = userRole === "ROLE_ADMIN";

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Card className="mb-6">
        <CardHeader className="flex justify-between items-center">
          <CardTitle>Department Workflow Management</CardTitle>
          <div className="flex gap-3 items-center">
            

            {isRequestor && (
              <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setShowMasterDataRequestDialog(true)}>
                + New Request
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent>
          <MasterDataManagement
            userRole={userRole}
            toast={toast}
            selectedMasterDataEntity={selectedMasterDataEntity}
            setSelectedMasterDataEntity={setSelectedMasterDataEntity}
            showMasterDataRequestDialog={showMasterDataRequestDialog}
            setShowMasterDataRequestDialog={setShowMasterDataRequestDialog}
            selectedMasterDataRequest={selectedMasterDataRequest}
            setSelectedMasterDataRequest={setSelectedMasterDataRequest}
            masterDataRequestType={masterDataRequestType}
            setMasterDataRequestType={setMasterDataRequestType}
            masterDataRequestReason={masterDataRequestReason}
            setMasterDataRequestReason={setMasterDataRequestReason}
            masterDataChangeRequests={masterDataChangeRequests}
            handleMasterDataChangeRequest={handleMasterDataChangeRequest}
            handleMasterDataActionSelect={handleMasterDataActionSelect}
            handleConfirmMasterDataAction={handleConfirmMasterDataAction}
            getStatusColor={getStatusColor}
            actionType={actionType}
            setShowActionDialog={setShowActionDialog}
            setActionReason={setActionReason}
            handleRefreshData={handleRefreshData}
          />
        </CardContent>
      </Card>

      {/* Request Dialog for Requestor */}
      <Dialog open={showMasterDataRequestDialog} onOpenChange={setShowMasterDataRequestDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Master Data Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
  <label className="block text-sm font-medium mb-2">Entity Type</label>
              <Select
                value={selectedMasterDataEntity}
                onValueChange={(value) => setSelectedMasterDataEntity(value as EntityType)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select entity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Districts">Districts</SelectItem>
                  <SelectItem value="Circles">Circles</SelectItem>
                  <SelectItem value="Villages">Villages</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Operation</label>
              <Select value={masterDataRequestType} onValueChange={(v: any) => setMasterDataRequestType(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select operation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="create">Create</SelectItem>
                  <SelectItem value="update">Update</SelectItem>
                  <SelectItem value="deactivate">Deactivate</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Reason</label>
              <Textarea
                value={masterDataRequestReason}
                onChange={(e) => setMasterDataRequestReason(e.target.value)}
                placeholder="Enter reason..."
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowMasterDataRequestDialog(false)}>
                Cancel
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                disabled={!masterDataRequestReason.trim()}
                onClick={() =>
                  handleMasterDataChangeRequest(
                    selectedMasterDataEntity,
                    masterDataRequestType,
                    {},
                    masterDataRequestReason
                  )
                }
              >
                Submit
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

