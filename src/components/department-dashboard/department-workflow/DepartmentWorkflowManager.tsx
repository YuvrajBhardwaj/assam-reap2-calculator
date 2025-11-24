import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  FileText,
  Search,
  RefreshCw,
  Clock,
  User,
  Building,
  Calendar,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { AuditService, type WorkflowActionRequest } from "@/services/auditService";
import type { AuditItem } from "@/services/auditService";
import { useToast } from "@/hooks/use-toast";

interface DepartmentWorkflowItem {
  id: string;
  masterType: string;
  masterCode: string;
  statusCode: string;
  requestorName?: string;
  currentApprover?: string;
  approvalLevel?: string;
  daysPending?: number;
  reason?: string;
  submittedDate: string;
  status: 'pending' | 'approved' | 'rejected';
  priority: 'low' | 'medium' | 'high';
  operation?: string; // Operation type (CREATE, UPDATE, DEACTIVATE)
  level?: string; // Approval level
  // Additional fields from actual API response
  districtGenId?: number;
  districtName?: string;
  districtCode?: string;
  active?: boolean;
  createdBy?: string;
  createdDtm?: string;
  updatedBy?: string | null;
  updatedDtm?: string | null;
  statusText?: string; // From "status" field in API response
  // Circle-specific fields
  circleGenId?: number;
  circleName?: string;
  circleCode?: string;
}

interface DepartmentWorkflowManagerProps {
  userRole?: string;
}

const DepartmentWorkflowManager: React.FC<DepartmentWorkflowManagerProps> = ({ userRole }) => {
  const [workflowItems, setWorkflowItems] = useState<DepartmentWorkflowItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [selectedItem, setSelectedItem] = useState<DepartmentWorkflowItem | null>(null);
  const { loginId } = useAuth();
  const { toast } = useToast();

  // Role mapping for approval levels
  const roleMapping = {
    'jm': 'Junior Manager',
    'man': 'Manager',
    'sman': 'Senior Manager',
    'admin': 'Admin'
  };

  // Load pending workflow requests from department
  const loadWorkflowRequests = async () => {
    setLoading(true);
    try {
      // Support District, Mauza, and Circle master types
      const masterTypes = ["District", "Mauza", "Circle"];
      const statusCode = "22-2"; // Pending status
      
      let allPendingData: any[] = [];
      
      // Fetch data for all master types
      for (const masterType of masterTypes) {
        try {
          const pendingData = await AuditService.getPendingAuditManagement(masterType, statusCode);
          allPendingData = [...allPendingData, ...pendingData];
        } catch (error) {
          console.warn(`Failed to load data for ${masterType}:`, error);
        }
      }
      
      // Transform API response to workflow items
      const transformedItems: DepartmentWorkflowItem[] = allPendingData.map((item) => {
        // Handle District master type data structure
        if (item.districtGenId) {
          return {
            id: item.districtGenId.toString(),
            masterType: "District",
            masterCode: item.districtCode || "N/A",
            statusCode: item.statusCode || "22-2",
            requestorName: item.createdBy || "Unknown User",
            currentApprover: item.status || "Pending Assignment", // Using "status" field as current approver info
            approvalLevel: "1",
            daysPending: Math.floor((Date.now() - new Date(item.createdDtm).getTime()) / (1000 * 60 * 60 * 24)),
            reason: `District: ${item.districtName}`,
            submittedDate: new Date(item.createdDtm).toISOString().split('T')[0],
            status: 'pending' as const,
            priority: Math.floor((Date.now() - new Date(item.createdDtm).getTime()) / (1000 * 60 * 60 * 24)) > 7 ? 'high' : 'medium',
            operation: item.operation || "UPDATE",
            level: "Level 1",
            // Original API fields
            districtGenId: item.districtGenId,
            districtName: item.districtName,
            districtCode: item.districtCode,
            active: item.active,
            createdBy: item.createdBy,
            createdDtm: item.createdDtm,
            updatedBy: item.updatedBy,
            updatedDtm: item.updatedDtm,
            statusText: item.status
          };
        }
        
        // Handle Circle master type data structure
        if (item.circleGenId) {
          return {
            id: item.circleGenId.toString(),
            masterType: "Circle",
            masterCode: item.circleCode || "N/A",
            statusCode: item.statusCode || "22-2",
            requestorName: item.createdBy || "Unknown User",
            currentApprover: item.status || "Pending Assignment",
            approvalLevel: "1",
            daysPending: Math.floor((Date.now() - new Date(item.createdDtm).getTime()) / (1000 * 60 * 60 * 24)),
            reason: `Circle: ${item.circleName}`,
            submittedDate: new Date(item.createdDtm).toISOString().split('T')[0],
            status: 'pending' as const,
            priority: Math.floor((Date.now() - new Date(item.createdDtm).getTime()) / (1000 * 60 * 60 * 24)) > 7 ? 'high' : 'medium',
            operation: item.operation || "UPDATE",
            level: "Level 1",
            // Original API fields
            circleGenId: item.circleGenId,
            circleName: item.circleName,
            circleCode: item.circleCode,
            active: item.active,
            createdBy: item.createdBy,
            createdDtm: item.createdDtm,
            updatedBy: item.updatedBy,
            updatedDtm: item.updatedDtm,
            statusText: item.status
          };
        }
        
        // Handle Mauza master type data structure (existing logic)
        return {
          id: item.id || item.mauzaGenId?.toString() || "unknown",
          masterType: item.masterType || "Mauza",
          masterCode: item.mauzaCode || item.payload?.masterCode || "N/A",
          statusCode: item.statusCode || "22-2",
          requestorName: item.createdBy || item.requestorName || "Unknown User",
          currentApprover: item.status || item.currentApprover || "Pending Assignment",
          approvalLevel: "1",
          daysPending: Math.floor((Date.now() - new Date(item.createdDtm || item.createdDtm).getTime()) / (1000 * 60 * 60 * 24)),
          reason: item.reason || `Mauza: ${item.mauzaName || item.payload?.mauzaName}`,
          submittedDate: new Date(item.createdDtm || item.createdDtm).toISOString().split('T')[0],
          status: 'pending' as const,
          priority: Math.floor((Date.now() - new Date(item.createdDtm || item.createdDtm).getTime()) / (1000 * 60 * 60 * 24)) > 7 ? 'high' : 'medium',
          operation: item.operation || "UPDATE",
          level: "Level 1"
        };
      });
      
      setWorkflowItems(transformedItems);
      
      toast({
        title: "Success",
        description: `Loaded ${transformedItems.length} workflow requests`
      });
      
    } catch (error) {
      console.error("Failed to load workflow requests:", error);
      toast({
        title: "Error",
        description: "Failed to load workflow requests from department",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle workflow approval/rejection actions
  const handleWorkflowAction = async (
    item: DepartmentWorkflowItem,
    action: 'approve' | 'reject',
    role: 'jm' | 'man' | 'sman' | 'admin'
  ) => {
    try {
      const request: WorkflowActionRequest = {
        id: item.id,
        masterType: item.masterType,
        masterCode: item.masterCode,
        action: action,
        currentStatusCode: item.statusCode
      };

      let result: string;
      switch (role) {
        case 'jm':
          result = await AuditService.juniorManagerAction(request);
          break;
        case 'man':
          result = await AuditService.managerAction(request);
          break;
        case 'sman':
          result = await AuditService.seniorManagerAction(request);
          break;
        case 'admin':
          result = await AuditService.adminAction(request);
          break;
        default:
          throw new Error('Invalid role specified');
      }

      toast({
        title: "Success",
        description: `Request ${action}d successfully.`
      });

      // Refresh data after action
      loadWorkflowRequests();
      
    } catch (error) {
      console.error(`Failed to ${action} request:`, error);
      toast({
        title: "Error",
        description: `Failed to ${action} request. Please try again.`,
        variant: "destructive"
      });
    }
  };

  // Get role-based pending requests
  const getRoleBasedRequests = async (role: 'jm' | 'man' | 'sman' | 'admin') => {
    try {
      const masterTypes = ["District", "Mauza", "Circle"];
      const statusCode = "22-2";
      
      let allRoleData: any[] = [];
      
      // Fetch data for all master types for specific role
      for (const masterType of masterTypes) {
        try {
          const roleRequests = await AuditService.getControllerPending(role, masterType, statusCode);
          allRoleData = [...allRoleData, ...roleRequests];
        } catch (error) {
          console.warn(`Failed to load ${role} data for ${masterType}:`, error);
        }
      }
      
      const transformedItems: DepartmentWorkflowItem[] = allRoleData.map((item) => {
        // Handle District master type data structure
        if (item.districtGenId) {
          return {
            id: item.districtGenId.toString(),
            masterType: "District",
            masterCode: item.districtCode || "N/A",
            statusCode: item.statusCode || "22-2",
            requestorName: item.createdBy || "Unknown User",
            currentApprover: item.status || roleMapping[role],
            approvalLevel: "1",
            daysPending: Math.floor((Date.now() - new Date(item.createdDtm).getTime()) / (1000 * 60 * 60 * 24)),
            reason: `District: ${item.districtName}`,
            submittedDate: new Date(item.createdDtm).toISOString().split('T')[0],
            status: 'pending' as const,
            priority: Math.floor((Date.now() - new Date(item.createdDtm).getTime()) / (1000 * 60 * 60 * 24)) > 7 ? 'high' : 'medium',
            operation: item.operation || "UPDATE",
            level: "Level 1",
            // Original API fields
            districtGenId: item.districtGenId,
            districtName: item.districtName,
            districtCode: item.districtCode,
            active: item.active,
            createdBy: item.createdBy,
            createdDtm: item.createdDtm,
            updatedBy: item.updatedBy,
            updatedDtm: item.updatedDtm,
            statusText: item.status
          };
        }
        
        // Handle Circle master type data structure
        if (item.circleGenId) {
          return {
            id: item.circleGenId.toString(),
            masterType: "Circle",
            masterCode: item.circleCode || "N/A",
            statusCode: item.statusCode || "22-2",
            requestorName: item.createdBy || "Unknown User",
            currentApprover: item.status || roleMapping[role],
            approvalLevel: "1",
            daysPending: Math.floor((Date.now() - new Date(item.createdDtm).getTime()) / (1000 * 60 * 60 * 24)),
            reason: `Circle: ${item.circleName}`,
            submittedDate: new Date(item.createdDtm).toISOString().split('T')[0],
            status: 'pending' as const,
            priority: Math.floor((Date.now() - new Date(item.createdDtm).getTime()) / (1000 * 60 * 60 * 24)) > 7 ? 'high' : 'medium',
            operation: item.operation || "UPDATE",
            level: "Level 1",
            // Original API fields
            circleGenId: item.circleGenId,
            circleName: item.circleName,
            circleCode: item.circleCode,
            active: item.active,
            createdBy: item.createdBy,
            createdDtm: item.createdDtm,
            updatedBy: item.updatedBy,
            updatedDtm: item.updatedDtm,
            statusText: item.status
          };
        }
        
        // Handle Mauza master type data structure
        return {
          id: item.id || item.mauzaGenId?.toString() || "unknown",
          masterType: item.masterType || "Mauza",
          masterCode: item.mauzaCode || item.payload?.masterCode || "N/A",
          statusCode: item.statusCode || "22-2",
          requestorName: item.createdBy || item.requestorName || "Unknown User",
          currentApprover: item.status || item.currentApprover || roleMapping[role],
          approvalLevel: "1",
          daysPending: Math.floor((Date.now() - new Date(item.createdDtm || item.createdDtm).getTime()) / (1000 * 60 * 60 * 24)),
          reason: item.reason || `Mauza: ${item.mauzaName || item.payload?.mauzaName}`,
          submittedDate: new Date(item.createdDtm || item.createdDtm).toISOString().split('T')[0],
          status: 'pending' as const,
          priority: Math.floor((Date.now() - new Date(item.createdDtm || item.createdDtm).getTime()) / (1000 * 60 * 60 * 24)) > 7 ? 'high' : 'medium',
          operation: item.operation || "UPDATE",
          level: "Level 1"
        };
      });
      
      setWorkflowItems(transformedItems);
      
      toast({
        title: "Success",
        description: `Loaded ${transformedItems.length} requests for ${roleMapping[role]}`
      });
      
    } catch (error) {
      console.error(`Failed to load ${role} requests:`, error);
      toast({
        title: "Error",
        description: `Failed to load requests for ${roleMapping[role]}`,
        variant: "destructive"
      });
    }
  };

  // Filter workflow items
  const filteredItems = workflowItems.filter((item) => {
    const matchSearch =
      item.requestorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.masterType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.masterCode.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchStatus = statusFilter === "all" || item.status === statusFilter;
    const matchRole = roleFilter === "all" || item.currentApprover?.toLowerCase().includes(roleFilter);
    
    return matchSearch && matchStatus && matchRole;
  });

  // Get status badge color
  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
    };
    return variants[status as keyof typeof variants] || "bg-gray-100 text-gray-800";
  };

  // Get priority badge color
  const getPriorityBadge = (priority: string) => {
    const variants = {
      high: "bg-red-100 text-red-800",
      medium: "bg-yellow-100 text-yellow-800",
      low: "bg-green-100 text-green-800",
    };
    return variants[priority as keyof typeof variants] || "bg-gray-100 text-gray-800";
  };

  // Load data on component mount
  useEffect(() => {
    loadWorkflowRequests();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Department Workflow Management</h2>
          <p className="text-gray-600 mt-1">
            Manage approval workflows across Junior Manager, Manager, Senior Manager, and Admin levels
          </p>
        </div>
        <Button onClick={loadWorkflowRequests} variant="outline" disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Loading...' : 'Refresh'}
        </Button>
      </div>

      {/* Role-based Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { role: 'jm' as const, title: 'Junior Manager', color: 'blue', icon: TrendingUp },
          { role: 'man' as const, title: 'Manager', color: 'green', icon: CheckCircle },
          { role: 'sman' as const, title: 'Senior Manager', color: 'orange', icon: AlertTriangle },
          { role: 'admin' as const, title: 'Admin', color: 'purple', icon: FileText }
        ].map((item) => (
          <Card key={item.role} className="border-2 hover:border-gray-300 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <item.icon className={`w-6 h-6 text-${item.color}-600`} />
                <Badge className={`bg-${item.color}-100 text-${item.color}-800 text-xs`}>
                  {item.title}
                </Badge>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{item.title} Queue</h3>
              <p className="text-sm text-gray-600 mb-3">
                View and manage requests awaiting {item.title} approval
              </p>
              <Button 
                className="w-full" 
                variant="outline" 
                size="sm"
                onClick={() => getRoleBasedRequests(item.role)}
                disabled={loading}
              >
                View Queue
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search by applicant, type, or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>

            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by approver role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="junior">Junior Manager</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="senior">Senior Manager</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Workflow Requests Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Workflow Requests</CardTitle>
            <Badge variant="outline">{filteredItems.length} requests</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {filteredItems.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Building className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No workflow requests found</p>
              <p className="text-sm mt-1">Try adjusting your filters or refresh the data</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
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
                  {filteredItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.id}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building className="w-4 h-4 text-gray-500" />
                          <span>{item.masterType} ({item.masterCode})</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.operation || "UPDATE"}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusBadge(item.status)}>
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-500" />
                          <span>{item.requestorName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">
                          {item.currentApprover}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {item.level || "Level 1"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedItem(item)}
                          >
                            View
                          </Button>
                          {item.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-green-600 hover:text-green-700"
                                onClick={() => {
                                  // Determine current role based on approver
                                  const currentRole = item.currentApprover?.toLowerCase();
                                  if (currentRole?.includes('junior')) {
                                    handleWorkflowAction(item, 'approve', 'jm');
                                  } else if (currentRole?.includes('manager')) {
                                    handleWorkflowAction(item, 'approve', 'man');
                                  } else if (currentRole?.includes('senior')) {
                                    handleWorkflowAction(item, 'approve', 'sman');
                                  } else if (currentRole?.includes('admin')) {
                                    handleWorkflowAction(item, 'approve', 'admin');
                                  }
                                }}
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-orange-600 hover:text-orange-700"
                                onClick={() => {
                                  // For send back, we can use reject action with a different status
                                  // or implement a separate sendBack action in the future
                                  const currentRole = item.currentApprover?.toLowerCase();
                                  if (currentRole?.includes('junior')) {
                                    handleWorkflowAction(item, 'reject', 'jm');
                                  } else if (currentRole?.includes('manager')) {
                                    handleWorkflowAction(item, 'reject', 'man');
                                  } else if (currentRole?.includes('senior')) {
                                    handleWorkflowAction(item, 'reject', 'sman');
                                  } else if (currentRole?.includes('admin')) {
                                    handleWorkflowAction(item, 'reject', 'admin');
                                  }
                                  toast({
                                    title: "Sent Back",
                                    description: "Request sent back for corrections"
                                  });
                                }}
                              >
                                Send Back
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 hover:text-red-700"
                                onClick={() => {
                                  // Determine current role based on approver
                                  const currentRole = item.currentApprover?.toLowerCase();
                                  if (currentRole?.includes('junior')) {
                                    handleWorkflowAction(item, 'reject', 'jm');
                                  } else if (currentRole?.includes('manager')) {
                                    handleWorkflowAction(item, 'reject', 'man');
                                  } else if (currentRole?.includes('senior')) {
                                    handleWorkflowAction(item, 'reject', 'sman');
                                  } else if (currentRole?.includes('admin')) {
                                    handleWorkflowAction(item, 'reject', 'admin');
                                  }
                                }}
                              >
                                Reject
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Item Detail Dialog */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Request Details</h3>
            <div className="space-y-4">
              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-medium text-gray-700">ID:</span>
                  <div className="text-sm">{selectedItem.id}</div>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Type:</span>
                  <div className="text-sm">{selectedItem.masterType}</div>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Code:</span>
                  <div className="text-sm">{selectedItem.masterCode}</div>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Status:</span>
                  <div className="text-sm">
                    <Badge className={getStatusBadge(selectedItem.status)}>
                      {selectedItem.status}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* District-specific Information */}
              {selectedItem.masterType === 'District' && selectedItem.districtName && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-900 mb-2">District Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">District Name:</span>
                      <div className="text-gray-900">{selectedItem.districtName}</div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">District Code:</span>
                      <div className="text-gray-900">{selectedItem.districtCode}</div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Active:</span>
                      <div className="text-gray-900">{selectedItem.active ? 'Yes' : 'No'}</div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Status:</span>
                      <div className="text-gray-900">{selectedItem.statusText}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Circle-specific Information */}
              {selectedItem.masterType === 'Circle' && selectedItem.circleName && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Circle Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">Circle Name:</span>
                      <div className="text-gray-900">{selectedItem.circleName}</div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Circle Code:</span>
                      <div className="text-gray-900">{selectedItem.circleCode}</div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Active:</span>
                      <div className="text-gray-900">{selectedItem.active ? 'Yes' : 'No'}</div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Status:</span>
                      <div className="text-gray-900">{selectedItem.statusText}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Workflow Information */}
              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-900 mb-2">Workflow Information</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Requestor:</span>
                    <div className="text-gray-900">{selectedItem.requestorName}</div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Current Approver:</span>
                    <div className="text-gray-900">{selectedItem.currentApprover}</div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Days Pending:</span>
                    <div className="text-gray-900">{selectedItem.daysPending} days</div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Submitted Date:</span>
                    <div className="text-gray-900">{selectedItem.submittedDate}</div>
                  </div>
                  {selectedItem.reason && (
                    <div>
                      <span className="font-medium text-gray-600">Reason/Description:</span>
                      <div className="text-gray-900">{selectedItem.reason}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Creation Information */}
              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-900 mb-2">Creation Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Created By:</span>
                    <div className="text-gray-900">{selectedItem.createdBy}</div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Created Date:</span>
                    <div className="text-gray-900">{new Date(selectedItem.createdDtm || '').toLocaleString()}</div>
                  </div>
                  {selectedItem.updatedBy && (
                    <div>
                      <span className="font-medium text-gray-600">Updated By:</span>
                      <div className="text-gray-900">{selectedItem.updatedBy}</div>
                    </div>
                  )}
                  {selectedItem.updatedDtm && (
                    <div>
                      <span className="font-medium text-gray-600">Updated Date:</span>
                      <div className="text-gray-900">{new Date(selectedItem.updatedDtm).toLocaleString()}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setSelectedItem(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentWorkflowManager;