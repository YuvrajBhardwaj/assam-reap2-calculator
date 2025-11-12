import React, { useEffect, useState } from "react";
import { AuditService } from "@/services/auditService";
import type { WorkflowActionRequest } from "@/services/auditService";
import {
  createAreaType,
  createCircle,
  createDistrict,
  createLandClass,
  createLot,
  createMouza,
  createVillage,
  deactivateCircle,
  deactivateDistrict,
  deactivateLandClass,
  deactivateLot,
  deactivateMouza,
  deactivateVillage,
  deleteAreaType,
  submitChangeRequest,
  updateAreaType,
  updateCircle,
  updateDistrict,
  updateLot,
  updateMouza,
  updateVillage,
} from "@/services/masterDataService";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  Building,
  Database,
  Home,
  Layers,
  MapPin,
  RefreshCw,
  CheckCircle,
  Check,
  Send,
  X,
} from "lucide-react";

import { MasterDataChangeRequest } from "@/types/masterData";
import DistrictCRUD from "@/components/admin/MasterDataCRUD/DistrictCRUD";
import CircleCRUD from "@/components/admin/MasterDataCRUD/CircleCRUD";
import MouzaCRUD from "@/components/admin/MasterDataCRUD/MouzaCRUD";
import VillageCRUD from "@/components/admin/MasterDataCRUD/VillageCRUD";
import LotCRUD from "@/components/admin/MasterDataCRUD/LotCRUD";
import LandClassCRUD from "@/components/admin/MasterDataCRUD/LandClassCRUD";
import AreaTypeCRUD from "@/components/admin/MasterDataCRUD/AreaTypeCRUD";
import SROCascadingCRUD from "@/components/admin/MasterDataCRUD/SROCascadingCRUD";

export type EntityType =
  | "Districts"
  | "Circles"
  | "Mouzas"
  | "Villages"
  | "Lots"
  | "Land Classes"
  | "Area Types"
  | "SRO Hierarchy"
  | "Parameters";

interface MasterDataManagementProps {
  userRole: string | null;
  toast: ReturnType<typeof useToast>["toast"];
  selectedMasterDataEntity: EntityType;
  setSelectedMasterDataEntity: React.Dispatch<React.SetStateAction<EntityType>>;
  showMasterDataRequestDialog: boolean;
  setShowMasterDataRequestDialog: (show: boolean) => void;
  selectedMasterDataRequest: MasterDataChangeRequest | null;
  setSelectedMasterDataRequest: (request: MasterDataChangeRequest | null) => void;
  masterDataRequestType: "create" | "update" | "deactivate";
  setMasterDataRequestType: (type: "create" | "update" | "deactivate") => void;
  masterDataRequestReason: string;
  setMasterDataRequestReason: (reason: string) => void;
  masterDataChangeRequests: MasterDataChangeRequest[];
  handleMasterDataChangeRequest: (
    entityType: string,
    operation: "create" | "update" | "deactivate",
    payload: any,
    reason: string
  ) => void;
  handleMasterDataActionSelect: (
    request: MasterDataChangeRequest,
    action: "approve" | "send-back" | "reject"
  ) => void;
  handleConfirmMasterDataAction: () => void;
  handleRefreshData: () => void;
  getStatusColor: (status: string) => string;
  actionType: "approve" | "send-back" | "reject";
  setShowActionDialog: (show: boolean) => void;
  setActionReason: (reason: string) => void;
}

const MasterDataManagement: React.FC<MasterDataManagementProps> = ({
  userRole,
  toast,
  selectedMasterDataEntity,
  setSelectedMasterDataEntity,
  showMasterDataRequestDialog,
  setShowMasterDataRequestDialog,
  selectedMasterDataRequest,
  setSelectedMasterDataRequest,
  masterDataRequestType,
  setMasterDataRequestType,
  masterDataRequestReason,
  setMasterDataRequestReason,
  masterDataChangeRequests,
  handleMasterDataChangeRequest,
  handleMasterDataActionSelect,
  handleRefreshData,
  getStatusColor,
}) => {
  const [requests, setRequests] = useState<MasterDataChangeRequest[]>([]);
  const [requestEntityId, setRequestEntityId] = useState<string>("");
  const [requestPayloadText, setRequestPayloadText] = useState<string>("{}");
  const { loginId } = useAuth();
  const [showDeptApprovalsDialog, setShowDeptApprovalsDialog] = useState(false);
  const [activeEntityTab, setActiveEntityTab] = useState<"District" | "Circle" | "Lot">("District");
  const [pendingDistrict, setPendingDistrict] = useState<any[]>([]);
  const [pendingCircle, setPendingCircle] = useState<any[]>([]);
  const [pendingLot, setPendingLot] = useState<any[]>([]);

  useEffect(() => {
    setRequests(masterDataChangeRequests);
  }, [masterDataChangeRequests]);

  // Map display name to backend masterType
  const toMasterTypeParam = (entity: string): string => {
    switch (entity) {
      case "Districts": return "District";
      case "Circles": return "Circle";
      case "Mouzas": return "Mouza";
      case "Villages": return "Village";
      case "Lots": return "Lot";
      case "Land Classes": return "LandCategory";
      case "Area Types": return "AreaType";
      case "SRO Hierarchy": return "SRO";
      case "Parameters": return "Parameter";
      default: return "District";
    }
  };

  const fetchPendingRequests = async () => {
    try {
      const masterType = toMasterTypeParam(selectedMasterDataEntity);
      const items = await AuditService.getPendingAuditManagement(masterType, "22-3");
      const mapped: MasterDataChangeRequest[] = (items || []).map((it: any) => ({
        id: Number(it.id),
        entityType: selectedMasterDataEntity,
        operation: (it?.payload?.operation ?? "update") as MasterDataChangeRequest["operation"],
        requestedBy: it.requestorName ?? "",
        requestDate: it.requestDate ?? "",
        status: "Under Review",
        currentApprover: (it.currentApprover ?? "N/A") as MasterDataChangeRequest["currentApprover"],
        approvalLevel: Number(it.approvalLevel ?? 1),
        reason: it.reason ?? "",
        payload: it.payload ?? {},
        daysPending: Number(it.daysPending ?? 0),
      }));
      setRequests(mapped);
      toast({ title: "Pending requests refreshed" });
    } catch (err) {
      console.error("Pending request fetch failed", err);
      toast({ title: "Failed to fetch pending approvals", variant: "destructive" });
    }
  };

  const handleSubmitMasterDataRequest = async () => {
    try {
      const entityType = toMasterTypeParam(selectedMasterDataEntity);
      const operation = masterDataRequestType.toUpperCase() as "CREATE" | "UPDATE" | "DEACTIVATE";

      let payloadObj: Record<string, any> = {};
      if (requestPayloadText.trim()) {
        try {
          payloadObj = JSON.parse(requestPayloadText);
        } catch {
          toast({ title: "Invalid JSON in payload", variant: "destructive" });
          return;
        }
      }

      const res = await submitChangeRequest({
        entityType,
        entityId: requestEntityId || undefined,
        operation,
        payload: payloadObj,
        reason: masterDataRequestReason.trim(),
      });

      toast({ title: "Change request submitted", description: `ID: ${res.requestId}` });
      setShowMasterDataRequestDialog(false);
      setRequestEntityId("");
      setRequestPayloadText("{}");
      setMasterDataRequestReason("");
      fetchPendingRequests();
    } catch (err) {
      console.error("Submit change request failed", err);
      toast({ title: "Failed to submit change request", variant: "destructive" });
    }
  };

  const renderDeptView = () => {
    switch (selectedMasterDataEntity) {
      case "Districts": return <DistrictCRUD />;
      case "Circles": return <CircleCRUD />;
      case "Mouzas": return <MouzaCRUD />;
      case "Villages": return <VillageCRUD />;
      case "Lots": return <LotCRUD />;
      case "Land Classes": return <LandClassCRUD />;
      case "Area Types": return <AreaTypeCRUD />;
      case "SRO Hierarchy": return <SROCascadingCRUD />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Entity Selection */}
      <div className="grid grid-cols-3 md:grid-cols-9 gap-2 mb-6">
        {[
          "Districts",
          "Circles",
          "Mouzas",
          "Villages",
          "Lots",
          "Land Classes",
          "Area Types",
          "SRO Hierarchy",
          "Parameters",
        ].map((entity) => (
          <Card
            key={entity}
            className={`cursor-pointer transition-all duration-200 ${
              selectedMasterDataEntity === entity ? "ring-2 ring-blue-500 bg-blue-50" : ""
            }`}
            onClick={() =>
              setSelectedMasterDataEntity(entity as EntityType)
            }
          >
            <CardContent className="p-3 text-center text-sm font-medium">
              {entity}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Render CRUD view */}
      <div className="mb-6">{renderDeptView()}</div>

      {/* Requests Table */}
      <Card>
        <CardHeader className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" /> Dept Workflow Management - {selectedMasterDataEntity}
          </CardTitle>
          <div className="flex gap-2">

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeptApprovalsDialog(true)}
            >
              <CheckCircle className="w-4 h-4" /> Dept Approvals
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>Operation</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Requested By</TableHead>
                <TableHead>Approver</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{r.id}</TableCell>
                  <TableCell>{r.entityType}</TableCell>
                  <TableCell>{r.operation}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(r.status)}>{r.status}</Badge>
                  </TableCell>
                  <TableCell>{r.requestedBy}</TableCell>
                  <TableCell>{r.currentApprover}</TableCell>
                  <TableCell>{r.approvalLevel}</TableCell>
                  <TableCell>
                    {r.status === "Pending" && (
                      <div className="flex gap-2">
                        <Button size="sm" className="bg-green-600 text-white" onClick={() => handleMasterDataActionSelect(r, "approve")}>
                          Approve
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleMasterDataActionSelect(r, "send-back")}>
                          Send Back
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleMasterDataActionSelect(r, "reject")}>
                          Reject
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Request Dialog */}
      <Dialog open={showMasterDataRequestDialog} onOpenChange={setShowMasterDataRequestDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Request Master Data Change</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Entity Type</label>
              <Select
                value={selectedMasterDataEntity}
                onValueChange={(value) =>
                  setSelectedMasterDataEntity(value as EntityType)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select entity type" />
                </SelectTrigger>
                <SelectContent>
                  {[
                    "Districts",
                    "Circles",
                    "Mouzas",
                    "Villages",
                    "Lots",
                    "Land Classes",
                    "Area Types",
                    "SRO Hierarchy",
                    "Parameters",
                  ].map((e) => (
                    <SelectItem key={e} value={e}>
                      {e}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Reason</label>
              <Textarea
                value={masterDataRequestReason}
                onChange={(e) => setMasterDataRequestReason(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowMasterDataRequestDialog(false)}>
                Cancel
              </Button>
              <Button
                className="bg-blue-600 text-white"
                onClick={handleSubmitMasterDataRequest}
              >
                Submit
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MasterDataManagement;
