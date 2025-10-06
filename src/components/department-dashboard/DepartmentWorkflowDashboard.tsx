import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { useAuth } from '@/context/AuthContext';
import { WorkflowTask, fetchDepartmentTasks, approveTask, rejectTask } from '@/services/workflowService';
import { useToast } from '@/hooks/use-toast';

interface DepartmentWorkflowItem {
  id: string;
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

const DepartmentWorkflowDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedWorkflow, setSelectedWorkflow] = useState<DepartmentWorkflowItem | null>(null);
  const { userRole } = useAuth();
  const { toast } = useToast();

  const [tasks, setTasks] = useState<WorkflowTask[]>([]);
  const [rejectReason, setRejectReason] = useState('');

  const loadTasks = async () => {
    try {
      const data = await fetchDepartmentTasks(); // Assuming a new service function for department tasks
      setTasks(data);
    } catch (e) {
      console.error('Failed to fetch department tasks', e);
      toast({ title: 'Failed to load department tasks', variant: 'destructive' });
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const onApprove = async (id: string) => {
    try {
      await approveTask(id);
      toast({ title: 'Approved' });
      await loadTasks();
    } catch {
      toast({ title: 'Approve failed', variant: 'destructive' });
    }
  };

  const onReject = async (id: string) => {
    try {
      await rejectTask(id, rejectReason);
      setRejectReason('');
      toast({ title: 'Rejected' });
      await loadTasks();
    } catch {
      toast({ title: 'Reject failed', variant: 'destructive' });
    }
  };


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

  const filteredTasks = tasks.filter(item => {
    const matchesSearch = item.entityKey.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.submittedBy.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status.toLowerCase() === statusFilter;
    // Assuming priority is part of WorkflowTask or can be derived
    // const matchesPriority = priorityFilter === 'all' || item.priority === priorityFilter;
    
    return matchesSearch && matchesStatus; // && matchesPriority;
  });

  const statusCounts = {
    total: tasks.length,
    pending: tasks.filter(item => item.status === 'PENDING').length,
    inProgress: tasks.filter(item => item.status === 'WIP').length,
    approved: tasks.filter(item => item.status === 'APPROVED').length,
    rejected: tasks.filter(item => item.status === 'REJECTED').length,
    // onHold: tasks.filter(item => item.status === 'on-hold').length // Assuming 'on-hold' status might exist
  };


  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Department Workflow Overview</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{statusCounts.total} Total Tasks</div>
          <p className="text-xs text-muted-foreground">
            {statusCounts.pending} Pending, {statusCounts.inProgress} In Progress, {statusCounts.approved} Approved
          </p>
        </CardContent>
      </Card>

      <Tabs defaultValue="workflows" className="w-full">
        <TabsList>
          <TabsTrigger value="workflows">My Workflows</TabsTrigger>
        </TabsList>
        <TabsContent value="workflows">
          <Card>
            <CardHeader>
              <CardTitle>Workflow Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Search workflows..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                  />
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="wip">In Progress</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="on-hold">On Hold</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priorities</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={loadTasks}>
                  <RefreshCw className="mr-2 h-4 w-4" /> Refresh
                </Button>
              </div>

              <div className="overflow-auto border rounded">
                <Table className="min-w-full text-sm">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-left p-2">ID</TableHead>
                      <TableHead className="text-left p-2">Type</TableHead>
                      <TableHead className="text-left p-2">Entity Key</TableHead>
                      <TableHead className="text-left p-2">Submitted By</TableHead>
                      <TableHead className="text-left p-2">Submitted At</TableHead>
                      <TableHead className="text-left p-2">Status</TableHead>
                      <TableHead className="text-left p-2">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTasks.map(item => (
                      <TableRow key={item.id}>
                        <TableCell className="p-2">{item.id}</TableCell>
                        <TableCell className="p-2">{item.type}</TableCell>
                        <TableCell className="p-2">{item.entityKey}</TableCell>
                        <TableCell className="p-2">{item.submittedBy}</TableCell>
                        <TableCell className="p-2">{new Date(item.submittedAt).toLocaleString()}</TableCell>
                        <TableCell className="p-2">
                          <Badge className={getStatusBadge(item.status.toLowerCase())}>
                            <span className="flex items-center">
                              {getStatusIcon(item.status.toLowerCase())}
                              <span className="ml-1">{item.status}</span>
                            </span>
                          </Badge>
                        </TableCell>
                        <TableCell className="p-2 space-x-2">
                          <Button variant="outline" size="sm" onClick={() => onApprove(item.id)}>Approve</Button>
                          <Button variant="outline" size="sm" onClick={() => setSelectedWorkflow(item as any)}>Reject</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {!filteredTasks.length && (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          No workflow items found matching your criteria.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {selectedWorkflow && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Reject Workflow Item: {selectedWorkflow.id}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Are you sure you want to reject this workflow item?</p>
              <Input
                placeholder="Reason for rejection"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="mb-4"
              />
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setSelectedWorkflow(null)}>Cancel</Button>
                <Button variant="destructive" onClick={() => {
                  onReject(selectedWorkflow.id);
                  setSelectedWorkflow(null);
                }}>Reject</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default DepartmentWorkflowDashboard;