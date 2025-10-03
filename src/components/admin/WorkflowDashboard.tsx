import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserManagement } from './UserManagement';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Search,
  Download,
  RefreshCw,
  Users,
  TrendingUp,
  Calendar
} from 'lucide-react';
import ApprovalInbox from './ApprovalInbox';
import { useAuth } from '@/context/AuthContext';
import { getAuditLogs } from '@/services/masterDataService';
import type { AuditLog } from '@/types/masterData';

interface WorkflowItem {
  id: number;
  type: string;
  applicant: string;
  property: string;
  location: string;
  submittedDate: string;
  status: 'pending' | 'in-progress' | 'approved' | 'rejected' | 'on-hold';
  assignedTo: string;
  priority: 'low' | 'medium' | 'high';
  daysElapsed: number;
}

const WorkflowDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowItem | null>(null);
  const { userRole } = useAuth();
  const isAdmin = userRole === 'admin';
  const isDepartment = userRole === 'department';

  // Audit Logs state
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [filters, setFilters] = useState<{ entityType: string; fromDate: string; toDate: string; performedBy: string }>({
    entityType: '',
    fromDate: '',
    toDate: '',
    performedBy: ''
  });

  const loadLogs = async () => {
    setLogsLoading(true);
    try {
      const data = await getAuditLogs(
        filters.entityType || undefined,
        filters.fromDate || undefined,
        filters.toDate || undefined,
        filters.performedBy || undefined
      );
      setLogs(data);
    } catch (e) {
      console.error('Failed to fetch audit logs', e);
    } finally {
      setLogsLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      // Preload logs for admin
      loadLogs();
    }
  }, [isAdmin]);

  // Mock workflow data
  const workflowData: WorkflowItem[] = [
    {
      id: 1,
      type: 'Property Valuation',
      applicant: 'Rajesh Kumar',
      property: 'Residential Plot',
      location: 'Guwahati, Kamrup Metro',
      submittedDate: '2024-01-15',
      status: 'pending',
      assignedTo: 'Valuator Team A',
      priority: 'high',
      daysElapsed: 5
    },
    {
      id: 2,
      type: 'Land Registration',
      applicant: 'Priya Sharma',
      property: 'Agricultural Land',
      location: 'Jorhat, Jorhat',
      submittedDate: '2024-01-14',
      status: 'in-progress',
      assignedTo: 'Registration Officer B',
      priority: 'medium',
      daysElapsed: 6
    },
    {
      id: 3,
      type: 'Stamp Duty Assessment',
      applicant: 'Amit Das',
      property: 'Commercial Building',
      location: 'Dibrugarh, Dibrugarh',
      submittedDate: '2024-01-13',
      status: 'approved',
      assignedTo: 'Assessment Team C',
      priority: 'low',
      daysElapsed: 7
    },
    {
      id: 4,
      type: 'Title Verification',
      applicant: 'Meera Singh',
      property: 'Independent House',
      location: 'Silchar, Cachar',
      submittedDate: '2024-01-12',
      status: 'on-hold',
      assignedTo: 'Legal Team D',
      priority: 'high',
      daysElapsed: 8
    },
    {
      id: 5,
      type: 'Mutation Request',
      applicant: 'Ravi Borah',
      property: 'Apartment',
      location: 'Tezpur, Sonitpur',
      submittedDate: '2024-01-11',
      status: 'rejected',
      assignedTo: 'Mutation Officer E',
      priority: 'medium',
      daysElapsed: 9
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'in-progress': return <AlertTriangle className="w-4 h-4 text-blue-600" />;
      case 'approved': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'rejected': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'on-hold': return <AlertTriangle className="w-4 h-4 text-orange-600" />;
      default: return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'in-progress': 'bg-blue-100 text-blue-800',
      'approved': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800',
      'on-hold': 'bg-orange-100 text-orange-800'
    };
    return variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityBadge = (priority: string) => {
    const variants = {
      'high': 'bg-red-100 text-red-800',
      'medium': 'bg-yellow-100 text-yellow-800',
      'low': 'bg-green-100 text-green-800'
    };
    return variants[priority as keyof typeof variants] || 'bg-gray-100 text-gray-800';
  };

  const filteredData = workflowData.filter(item => {
    const matchesSearch = item.applicant.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.property.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || item.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const statusCounts = {
    total: workflowData.length,
    pending: workflowData.filter(item => item.status === 'pending').length,
    inProgress: workflowData.filter(item => item.status === 'in-progress').length,
    approved: workflowData.filter(item => item.status === 'approved').length,
    rejected: workflowData.filter(item => item.status === 'rejected').length,
    onHold: workflowData.filter(item => item.status === 'on-hold').length
  };

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Applications</p>
                <p className="text-2xl font-bold text-blue-600">{statusCounts.total}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{statusCounts.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">{statusCounts.inProgress}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-green-600">{statusCounts.approved}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{statusCounts.rejected}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">On Hold</p>
                <p className="text-2xl font-bold text-orange-600">{statusCounts.onHold}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="workflows" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="workflows">Workflow Management</TabsTrigger>
          {(isAdmin || isDepartment) && (
            <TabsTrigger value="approval">Approval Inbox</TabsTrigger>
          )}
          {isAdmin && (
            <TabsTrigger value="audit-logs">Audit Logs</TabsTrigger>
          )}
          <TabsTrigger value="users">User Management</TabsTrigger>
        </TabsList>
        
        <TabsContent value="workflows">
          <Card>
            <CardHeader>
              <CardTitle>Workflow Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-gray-500" />
                  <Input
                    placeholder="Search by applicant, property, or location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-80"
                  />
                </div>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="on-hold">On Hold</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priority</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Workflow Table */}
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Applicant</TableHead>
                      <TableHead>Property</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Assigned To</TableHead>
                      <TableHead>Days Elapsed</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData.map((item) => (
                      <TableRow key={item.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">{item.id}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(item.status)}
                            {item.type}
                          </div>
                        </TableCell>
                        <TableCell>{item.applicant}</TableCell>
                        <TableCell>{item.property}</TableCell>
                        <TableCell>{item.location}</TableCell>
                        <TableCell>{item.submittedDate}</TableCell>
                        <TableCell>
                          <Badge className={getStatusBadge(item.status)}>
                            {item.status.charAt(0).toUpperCase() + item.status.slice(1).replace('-', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getPriorityBadge(item.priority)}>
                            {item.priority.charAt(0).toUpperCase() + item.priority.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>{item.assignedTo}</TableCell>
                        <TableCell>
                          <span className={item.daysElapsed > 7 ? 'text-red-600 font-semibold' : 'text-gray-600'}>
                            {item.daysElapsed} days
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => setSelectedWorkflow(item)}>
                              View
                            </Button>
                            {item.status === 'pending' && (
                              <Button variant="default" size="sm" className="bg-blue-600">
                                Process
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {filteredData.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No workflow items found matching your criteria.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {(isAdmin || isDepartment) && (
          <TabsContent value="approval">
            <Card>
              <CardHeader>
                <CardTitle>Approval Inbox</CardTitle>
              </CardHeader>
              <CardContent>
                <ApprovalInbox />
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {isAdmin && (
          <TabsContent value="audit-logs">
            <Card>
              <CardHeader>
                <CardTitle>Audit Logs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4 mb-4">
                  <Input
                    placeholder="Entity Type (e.g., District, Circle, Parameter)"
                    className="w-64"
                    value={filters.entityType}
                    onChange={(e) => setFilters({ ...filters, entityType: e.target.value })}
                  />
                  <Input
                    type="date"
                    className="w-48"
                    value={filters.fromDate}
                    onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })}
                  />
                  <Input
                    type="date"
                    className="w-48"
                    value={filters.toDate}
                    onChange={(e) => setFilters({ ...filters, toDate: e.target.value })}
                  />
                  <Input
                    placeholder="Performed By (loginId)"
                    className="w-56"
                    value={filters.performedBy}
                    onChange={(e) => setFilters({ ...filters, performedBy: e.target.value })}
                  />
                  <Button onClick={loadLogs} disabled={logsLoading} variant="outline">
                    {logsLoading ? 'Loading...' : 'Search'}
                  </Button>
                  <Button
                    onClick={() => { setFilters({ entityType: '', fromDate: '', toDate: '', performedBy: '' }); setLogs([]); }}
                    variant="ghost"
                  >
                    Reset
                  </Button>
                </div>

                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Time</TableHead>
                        <TableHead>Entity Type</TableHead>
                        <TableHead>Entity ID</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Performed By</TableHead>
                        <TableHead>Details</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {logs.map((log) => (
                        <TableRow key={log.id} className="hover:bg-gray-50">
                          <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                          <TableCell>{log.entityType}</TableCell>
                          <TableCell>{log.entityId}</TableCell>
                          <TableCell>
                            <Badge className="bg-gray-100 text-gray-800">{log.action}</Badge>
                          </TableCell>
                          <TableCell>{log.performedBy}</TableCell>
                          <TableCell>
                            <span className="text-xs text-gray-600 break-all">
                              {log.details ? JSON.stringify(log.details) : '-'}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                      {!logs.length && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-gray-500 py-6">
                            {logsLoading ? 'Loading logs...' : 'No logs to display'}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
        
        <TabsContent value="users">
          <UserManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WorkflowDashboard;