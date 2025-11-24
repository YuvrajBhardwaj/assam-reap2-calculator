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
  Clock,
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
import ParameterCRUD from "@/components/admin/MasterDataCRUD/ParameterCRUD";

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
  const [pendingApprovals, setPendingApprovals] = useState<MasterDataChangeRequest[]>([]);
  const [isLoadingApprovals, setIsLoadingApprovals] = useState(false);
  const [selectedViewRequest, setSelectedViewRequest] = useState<MasterDataChangeRequest | null>(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    setRequests(masterDataChangeRequests);
  }, [masterDataChangeRequests]);

  const getStatusCodeForRole = (role: string | null): string => {
    switch (role) {
      case "JR_MANAGER":
      case "ROLE_JuniorManager":
        return "22-1"; // PEN_J_M_CODE
      case "MANAGER":
      case "ROLE_Manager":
        return "22-2"; // PEN_M_CODE
      case "SR_MANAGER":
      case "ROLE_SeniorManager":
        return "22-3"; // PEN_S_M_CODE
      case "ADMIN":
      case "ROLE_ADMIN":
        return "22-3"; // Admin also uses Senior Manager status code
      default:
        return "22-1";
    }
  };

  const fetchDeptPendingRequests = async (entityType: EntityType) => {
    try {
      const statusCode = getStatusCodeForRole(userRole);
      const masterType = toMasterTypeParam(entityType);
      const items = await AuditService.getPendingAuditManagement(masterType, statusCode);
      
      const mapped: MasterDataChangeRequest[] = (items || []).map((it: any) => {
        // Handle different data structures based on entity type
        let id = it.id;
        let entityName = "";
        let entityCode = "";
        
        // Extract entity-specific fields
        if (it.districtGenId) {
          id = it.districtGenId;
          entityName = it.districtName || "";
          entityCode = it.districtCode || "";
        } else if (it.circleGenId) {
          id = it.circleGenId;
          entityName = it.circleName || "";
          entityCode = it.circleCode || "";
        } else if (it.mauzaGenId) {
          id = it.mauzaGenId;
          entityName = it.mauzaName || "";
          entityCode = it.mauzaCode || "";
        } else if (it.villageGenId) {
          id = it.villageGenId;
          entityName = it.villageName || "";
          entityCode = it.villageCode || "";
        } else if (it.lotGenId) {
          id = it.lotGenId;
          entityName = it.lotName || "";
          entityCode = it.lotCode || "";
        } else if (it.landClassGenId) {
          id = it.landClassGenId;
          entityName = it.landClassName || "";
          entityCode = it.landClassCode || "";
        } else if (it.areaTypeGenId) {
          id = it.areaTypeGenId;
          entityName = it.areaTypeName || "";
          entityCode = it.areaTypeCode || "";
        }

        // Calculate days pending
        const daysPending = it.createdDtm 
          ? Math.floor((Date.now() - new Date(it.createdDtm).getTime()) / (1000 * 60 * 60 * 24))
          : 0;

        return {
          id: Number(id),
          entityType: entityType,
          operation: (it.operation || "update") as MasterDataChangeRequest["operation"],
          requestedBy: it.createdBy || "Unknown",
          requestDate: it.createdDtm ? new Date(it.createdDtm).toISOString().split('T')[0] : "",
          status: "Pending",
          currentApprover: (it.status || "N/A") as MasterDataChangeRequest["currentApprover"],
          approvalLevel: 1,
          reason: `${entityName} (${entityCode})`,
          payload: {
            ...it,
            entityName,
            entityCode,
            masterCode: entityCode,
          },
          daysPending,
        };
      });
      
      return mapped;
    } catch (err) {
      console.error(`Failed to fetch pending ${entityType} approvals`, err);
      toast({ title: `Failed to fetch pending ${entityType} approvals`, variant: "destructive" });
      return [];
    }
  };

  const loadPendingApprovalsForEntity = async (entityType: EntityType) => {
    setIsLoadingApprovals(true);
    try {
      const approvals = await fetchDeptPendingRequests(entityType);
      setPendingApprovals(approvals);
    } finally {
      setIsLoadingApprovals(false);
    }
  };

  const getRoleFromUserRole = (): 'jm' | 'man' | 'sman' | 'admin' => {
    switch (userRole) {
      case "JR_MANAGER":
      case "ROLE_JuniorManager":
        return "jm";
      case "MANAGER":
      case "ROLE_Manager":
        return "man";
      case "SR_MANAGER":
      case "ROLE_SeniorManager":
        return "sman";
      case "ADMIN":
      case "ROLE_ADMIN":
        return "admin";
      default:
        return "man";
    }
  };

  const handleApproveAction = async (request: MasterDataChangeRequest) => {
    setActionLoading(true);
    try {
      const role = getRoleFromUserRole();
      const masterType = toMasterTypeParam(request.entityType);
      const masterCode = request.payload?.entityCode || request.payload?.masterCode || "";
      const currentStatusCode = request.payload?.statusCode || getStatusCodeForRole(userRole);

      const actionRequest: WorkflowActionRequest = {
        id: request.id.toString(),
        masterType: masterType,
        masterCode: masterCode,
        action: 'approve',
        currentStatusCode: currentStatusCode
      };

      let result: string;
      switch (role) {
        case 'jm':
          result = await AuditService.juniorManagerAction(actionRequest);
          break;
        case 'man':
          result = await AuditService.managerAction(actionRequest);
          break;
        case 'sman':
          result = await AuditService.seniorManagerAction(actionRequest);
          break;
        case 'admin':
          result = await AuditService.adminAction(actionRequest);
          break;
      }

      toast({ 
        title: "Success", 
        description: "Request approved successfully." 
      });

      // Refresh the list
      await loadPendingApprovalsForEntity(selectedMasterDataEntity);
    } catch (error) {
      console.error('Failed to approve request:', error);
      toast({ 
        title: "Error", 
        description: "Failed to approve request. Please try again.", 
        variant: "destructive" 
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectAction = async (request: MasterDataChangeRequest) => {
    setActionLoading(true);
    try {
      const role = getRoleFromUserRole();
      const masterType = toMasterTypeParam(request.entityType);
      const masterCode = request.payload?.entityCode || request.payload?.masterCode || "";
      const currentStatusCode = request.payload?.statusCode || getStatusCodeForRole(userRole);

      const actionRequest: WorkflowActionRequest = {
        id: request.id.toString(),
        masterType: masterType,
        masterCode: masterCode,
        action: 'reject',
        currentStatusCode: currentStatusCode
      };

      let result: string;
      switch (role) {
        case 'jm':
          result = await AuditService.juniorManagerAction(actionRequest);
          break;
        case 'man':
          result = await AuditService.managerAction(actionRequest);
          break;
        case 'sman':
          result = await AuditService.seniorManagerAction(actionRequest);
          break;
        case 'admin':
          result = await AuditService.adminAction(actionRequest);
          break;
      }

      toast({ 
        title: "Success", 
        description: "Request rejected successfully." 
      });

      // Refresh the list
      await loadPendingApprovalsForEntity(selectedMasterDataEntity);
    } catch (error) {
      console.error('Failed to reject request:', error);
      toast({ 
        title: "Error", 
        description: "Failed to reject request. Please try again.", 
        variant: "destructive" 
      });
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    loadPendingApprovalsForEntity(selectedMasterDataEntity);
  }, [selectedMasterDataEntity, userRole]);

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
      case "Parameters": return <ParameterCRUD />;
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

      {/* Department Workflow Management - Always Visible */}
      <Card>
          <CardHeader className="flex flex-row justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-blue-600" /> 
                Department Workflow Management - {selectedMasterDataEntity}
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Manage pending approvals for {selectedMasterDataEntity.toLowerCase()}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadPendingApprovalsForEntity(selectedMasterDataEntity)}
              disabled={isLoadingApprovals}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoadingApprovals ? 'animate-spin' : ''}`} />
              {isLoadingApprovals ? 'Loading...' : 'Refresh'}
            </Button>
          </CardHeader>
          <CardContent>
            {isLoadingApprovals ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
                <span className="ml-3 text-gray-600">Loading {selectedMasterDataEntity} approvals...</span>
              </div>
            ) : (
              <div className="rounded-lg border border-gray-200 max-h-[500px] overflow-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-gray-50 z-10">
                    <TableRow>
                      <TableHead className="font-semibold">ID</TableHead>
                      <TableHead className="font-semibold">Name</TableHead>
                      <TableHead className="font-semibold">Code</TableHead>
                      <TableHead className="font-semibold">Requested By</TableHead>
                      <TableHead className="font-semibold">Days Pending</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingApprovals.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-12">
                          <div className="flex flex-col items-center justify-center text-gray-500">
                            <Database className="w-12 h-12 mb-3 text-gray-300" />
                            <p className="text-lg font-medium">No Pending Approvals</p>
                            <p className="text-sm mt-1">There are no pending {selectedMasterDataEntity.toLowerCase()} approvals at the moment.</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      pendingApprovals.map((r) => (
                        <TableRow key={r.id} className="hover:bg-gray-50 transition-colors">
                          <TableCell className="font-medium text-blue-600">{r.id}</TableCell>
                          <TableCell className="font-medium">{r.payload?.entityName || "N/A"}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="font-mono text-xs">{r.payload?.entityCode || "N/A"}</Badge>
                          </TableCell>
                          <TableCell>{r.requestedBy}</TableCell>
                          <TableCell>
                            <Badge className={r.daysPending > 7 ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"}>
                              {r.daysPending}d
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-xs px-2 py-1 rounded bg-blue-50 text-blue-700">
                              {r.currentApprover}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2 justify-center">
                              <Button 
                                size="sm" 
                                className="bg-green-600 text-white hover:bg-green-700" 
                                onClick={() => handleApproveAction(r)}
                                disabled={actionLoading}
                              >
                                Approve
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => handleRejectAction(r)}
                                disabled={actionLoading}
                              >
                                Reject
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => {
                                  setSelectedViewRequest(r);
                                  setShowViewDialog(true);
                                }}
                              >
                                View
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
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

      {/* View Request Details Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-600" />
              Request Details - {selectedViewRequest?.entityType}
            </DialogTitle>
          </DialogHeader>
          {selectedViewRequest && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-gray-500">Request ID</span>
                    <p className="text-sm font-medium text-blue-600">{selectedViewRequest.id}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Entity Type</span>
                    <p className="text-sm font-medium">{selectedViewRequest.entityType}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Entity Name</span>
                    <p className="text-sm font-medium">{selectedViewRequest.payload?.entityName || "N/A"}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Entity Code</span>
                    <p className="text-sm font-medium">{selectedViewRequest.payload?.entityCode || "N/A"}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Operation</span>
                    <Badge variant="outline" className="capitalize">{selectedViewRequest.operation}</Badge>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Status</span>
                    <Badge className="bg-yellow-100 text-yellow-800">{selectedViewRequest.status}</Badge>
                  </div>
                </div>
              </div>

              {/* Request Details */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Request Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-gray-500">Requested By</span>
                    <p className="text-sm font-medium">{selectedViewRequest.requestedBy}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Request Date</span>
                    <p className="text-sm font-medium">{selectedViewRequest.requestDate}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Days Pending</span>
                    <Badge className={selectedViewRequest.daysPending > 7 ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"}>
                      {selectedViewRequest.daysPending} days
                    </Badge>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Current Approver</span>
                    <p className="text-sm font-medium">{selectedViewRequest.currentApprover}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Approval Level</span>
                    <p className="text-sm font-medium">Level {selectedViewRequest.approvalLevel}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Active Status</span>
                    <Badge variant={selectedViewRequest.payload?.active ? "default" : "secondary"}>
                      {selectedViewRequest.payload?.active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Audit Information */}
              {selectedViewRequest.payload?.createdBy && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Audit Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs text-gray-500">Created By</span>
                      <p className="text-sm font-medium">{selectedViewRequest.payload.createdBy}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">Created Date</span>
                      <p className="text-sm font-medium">
                        {selectedViewRequest.payload.createdDtm 
                          ? new Date(selectedViewRequest.payload.createdDtm).toLocaleString() 
                          : "N/A"}
                      </p>
                    </div>
                    {selectedViewRequest.payload.updatedBy && (
                      <>
                        <div>
                          <span className="text-xs text-gray-500">Updated By</span>
                          <p className="text-sm font-medium">{selectedViewRequest.payload.updatedBy}</p>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500">Updated Date</span>
                          <p className="text-sm font-medium">
                            {selectedViewRequest.payload.updatedDtm 
                              ? new Date(selectedViewRequest.payload.updatedDtm).toLocaleString() 
                              : "N/A"}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Full Payload */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Full Data Payload</h3>
                <pre className="text-xs bg-white p-3 rounded border border-gray-200 overflow-auto max-h-[200px]">
                  {JSON.stringify(selectedViewRequest.payload, null, 2)}
                </pre>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => setShowViewDialog(false)}
                >
                  Close
                </Button>
                <Button 
                  className="bg-green-600 text-white hover:bg-green-700"
                  onClick={() => {
                    setShowViewDialog(false);
                    handleApproveAction(selectedViewRequest);
                  }}
                  disabled={actionLoading}
                >
                  Approve
                </Button>
                <Button 
                  variant="destructive"
                  onClick={() => {
                    setShowViewDialog(false);
                    handleRejectAction(selectedViewRequest);
                  }}
                  disabled={actionLoading}
                >
                  Reject
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MasterDataManagement;
