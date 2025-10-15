import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import {
  Building,
  Database,
  Home,
  Layers,
  MapPin,
  Plus,
  RefreshCw,
  Settings,
  Check,
  Send,
  X
} from 'lucide-react';

import { MasterDataChangeRequest } from '@/types/masterData';

interface MasterDataManagementProps {
  userRole: string | null;
  toast: ReturnType<typeof useToast>['toast'];
  selectedMasterDataEntity: string;
  setSelectedMasterDataEntity: (entity: string) => void;
  showMasterDataRequestDialog: boolean;
  setShowMasterDataRequestDialog: (show: boolean) => void;
  selectedMasterDataRequest: MasterDataChangeRequest | null;
  setSelectedMasterDataRequest: (request: MasterDataChangeRequest | null) => void;
  masterDataRequestType: 'create' | 'update' | 'deactivate';
  setMasterDataRequestType: (type: 'create' | 'update' | 'deactivate') => void;
  masterDataRequestReason: string;
  setMasterDataRequestReason: (reason: string) => void;
  masterDataChangeRequests: MasterDataChangeRequest[];
  handleMasterDataChangeRequest: (entityType: string, operation: 'create' | 'update' | 'deactivate', payload: any, reason: string) => void;
  handleMasterDataActionSelect: (request: MasterDataChangeRequest, action: 'approve' | 'send-back' | 'reject') => void;
  handleConfirmMasterDataAction: () => void;
  handleRefreshData: () => void;
  getStatusColor: (status: string) => string;
  actionType: 'approve' | 'send-back' | 'reject';
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
  actionType,
  setShowActionDialog,
  setActionReason,
}) => {



  return (
    <div className="space-y-6">
      {/* Entity Selection */}
      <div className="grid grid-cols-3 md:grid-cols-9 gap-2 mb-6">
        {[
          { id: 'Districts', icon: MapPin, label: 'Districts' },
          { id: 'Circles', icon: MapPin, label: 'Circles' },
          { id: 'Mouzas', icon: MapPin, label: 'Mouzas' },
          { id: 'Villages', icon: Home, label: 'Villages' },
          { id: 'Lots', icon: MapPin, label: 'Lots' },
          { id: 'Land Classes', icon: Layers, label: 'Land Classes' },
          { id: 'Area Types', icon: Layers, label: 'Area Types' },
          { id: 'SRO Hierarchy', icon: Building, label: 'SRO Hierarchy' },
          { id: 'Parameters', icon: Settings, label: 'Parameters' }
        ].map((entity) => (
          <Card
            key={entity.id}
            className={`cursor-pointer transition-all duration-200 ${selectedMasterDataEntity === entity.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
              }`}
            onClick={() => setSelectedMasterDataEntity(entity.id)}
          >
            <CardContent className="p-3">
              <div className="flex flex-col items-center text-center">
                <entity.icon className="w-6 h-6 mb-2 text-blue-600" />
                <span className="text-xs font-medium">{entity.label}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Master Data Change Requests Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Master Data Change Requests - {selectedMasterDataEntity}
            </CardTitle>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowMasterDataRequestDialog(true)}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                New Request
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefreshData}
                className="flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Entity Type</TableHead>
                <TableHead>Operation</TableHead>
                <TableHead>Requested By</TableHead>
                <TableHead>Request Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Current Approver</TableHead>
                <TableHead>Approval Level</TableHead>
                <TableHead>Days Pending</TableHead>
                {userRole && <TableHead>Action</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {masterDataChangeRequests.filter(req => selectedMasterDataEntity === 'All' || req.entityType === selectedMasterDataEntity).map((request) => (
                <TableRow key={request.id}>
                  <TableCell>{request.id}</TableCell>
                  <TableCell>{request.entityType}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {request.operation}
                    </Badge>
                  </TableCell>
                  <TableCell>{request.requestedBy}</TableCell>
                  <TableCell>{request.requestDate}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(request.status)}>
                      {request.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{request.currentApprover}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span>{request.approvalLevel}/4</span>
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${(request.approvalLevel / 4) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{request.daysPending}</TableCell>
                  {userRole && (
                    <TableCell>
                      {request.status === 'Pending' || request.status === 'Under Review' ? (
                        <div className="flex gap-1">
                          {((userRole === 'ROLE_JuniorManager' && request.currentApprover === 'Junior Manager') ||
                            (userRole === 'ROLE_Manager' && request.currentApprover === 'Manager') ||
                            (userRole === 'ROLE_SeniorManager' && request.currentApprover === 'Senior Manager') ||
                            (userRole === 'ROLE_ADMIN' && request.currentApprover === 'Role Admin')) && (
                              <>
                                <Button
                                  size="sm"
                                  variant="default"
                                  className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 text-xs"
                                  onClick={() => handleMasterDataActionSelect(request, 'approve')}
                                >
                                  <Check className="w-3 h-3 mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-orange-500 text-orange-600 hover:bg-orange-50 px-2 py-1 text-xs"
                                  onClick={() => handleMasterDataActionSelect(request, 'send-back')}
                                >
                                  <Send className="w-3 h-3 mr-1" />
                                  Send Back
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  className="px-2 py-1 text-xs"
                                  onClick={() => handleMasterDataActionSelect(request, 'reject')}
                                >
                                  <X className="w-3 h-3 mr-1" />
                                  Reject
                                </Button>
                              </>
                            )}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">No action required</span>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))}
              {!masterDataChangeRequests.filter(req => selectedMasterDataEntity === 'All' || req.entityType === selectedMasterDataEntity).length && (
                <TableRow>
                  <TableCell colSpan={10} className="h-24 text-center">
                    No change requests found for {selectedMasterDataEntity}.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Master Data Request Dialog */}
      <Dialog open={showMasterDataRequestDialog} onOpenChange={setShowMasterDataRequestDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Request Master Data Change</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Entity Type</label>
              <Select value={selectedMasterDataEntity} onValueChange={setSelectedMasterDataEntity}>
                <SelectTrigger>
                  <SelectValue placeholder="Select entity type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Districts">Districts</SelectItem>
                  <SelectItem value="Circles">Circles</SelectItem>
                  <SelectItem value="Mouzas">Mouzas</SelectItem>
                  <SelectItem value="Villages">Villages</SelectItem>
                  <SelectItem value="Lots">Lots</SelectItem>
                  <SelectItem value="Land Classes">Land Classes</SelectItem>
                  <SelectItem value="Area Types">Area Types</SelectItem>
                  <SelectItem value="SRO Hierarchy">SRO Hierarchy</SelectItem>
                  <SelectItem value="Parameters">Parameters</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Operation Type</label>
              <Select value={masterDataRequestType} onValueChange={(value: 'create' | 'update' | 'deactivate') => setMasterDataRequestType(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select operation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="create">Create New</SelectItem>
                  <SelectItem value="update">Update Existing</SelectItem>
                  <SelectItem value="deactivate">Deactivate</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Reason for Change</label>
              <Textarea
                value={masterDataRequestReason}
                onChange={(e) => setMasterDataRequestReason(e.target.value)}
                placeholder="Enter detailed reason for this master data change request..."
                required
              />
            </div>
            <div className="p-3 bg-blue-50 rounded text-sm">
              <p className="font-medium text-blue-800 mb-1">Approval Workflow:</p>
              <p className="text-blue-600">Junior Manager → Manager → Senior Manager → Role Admin</p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowMasterDataRequestDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => handleMasterDataChangeRequest(selectedMasterDataEntity, masterDataRequestType, {}, masterDataRequestReason)}
                disabled={!masterDataRequestReason.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Submit Request
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MasterDataManagement;