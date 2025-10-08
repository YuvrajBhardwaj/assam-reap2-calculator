import React, { useState, useEffect } from 'react';
import {
  Card, CardContent, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { FileText, Clock, CheckCircle, XCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import {
  WorkflowTask,
  fetchDepartmentTasks,
  approveTask,
  rejectTask,
  referBackTask,
} from '@/services/workflowService';
import { useToast } from '@/hooks/use-toast';

const DepartmentWorkflowDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [tasks, setTasks] = useState<WorkflowTask[]>([
    {
      id: '1',
      type: 'PARAMETER_CHANGE',
      entityKey: 'Property Valuation - 123',
      submittedBy: 'Rajesh Kumar',
      submittedAt: '2024-01-15T10:00:00Z',
      status: 'PENDING',
      payloadSummary: 'Change in land value parameters',
    },
    {
      id: '2',
      type: 'GEO_FACTOR_CHANGE',
      entityKey: 'Land Registration - 456',
      submittedBy: 'Priya Sharma',
      submittedAt: '2024-01-14T11:30:00Z',
      status: 'WIP',
      payloadSummary: 'Update in geographical factors for Jorhat',
    },
    {
      id: '3',
      type: 'FORMULA_APPROVAL',
      entityKey: 'Stamp Duty Assessment - 789',
      submittedBy: 'Amit Das',
      submittedAt: '2024-01-13T14:00:00Z',
      status: 'APPROVED',
      payloadSummary: 'Approval for new stamp duty calculation formula',
    },
    {
      id: '4',
      type: 'USER_RIGHTS',
      entityKey: 'User Access Request - 101',
      submittedBy: 'Meera Singh',
      submittedAt: '2024-01-12T09:15:00Z',
      status: 'REJECTED',
      payloadSummary: 'Request for admin access rejected',
    },
    {
      id: '5',
      type: 'OTHER',
      entityKey: 'General Inquiry - 202',
      submittedBy: 'John Doe',
      submittedAt: '2024-01-11T16:45:00Z',
      status: 'REFERRED_BACK',
      payloadSummary: 'Additional information required for inquiry',
    },
  ]);
  const [actionModal, setActionModal] = useState<{ type: 'reject' | 'referback'; task: WorkflowTask | null }>({ type: 'reject', task: null });
  const [reason, setReason] = useState('');
  const { userRole } = useAuth();
  const { toast } = useToast();

  // Fetch department workflow tasks
  const loadTasks = async () => {
    try {
      const data = await fetchDepartmentTasks();
      setTasks(data);
    } catch (e) {
      console.error('Failed to fetch department tasks', e);
      toast({ title: 'Failed to load department tasks', variant: 'destructive' });
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  // === Actions ===
  const onApprove = async (id: string) => {
    try {
      await approveTask(id);
      toast({ title: 'Workflow approved successfully!' });
      await loadTasks();
    } catch {
      toast({ title: 'Failed to approve', variant: 'destructive' });
    }
  };

  const onReject = async (id: string) => {
    try {
      await rejectTask(id, reason);
      setReason('');
      toast({ title: 'Workflow rejected.' });
      await loadTasks();
    } catch {
      toast({ title: 'Reject failed', variant: 'destructive' });
    }
  };

  const onReferBack = async (id: string) => {
    try {
      await referBackTask(id, reason);
      setReason('');
      toast({ title: 'Workflow referred back to applicant.' });
      await loadTasks();
    } catch {
      toast({ title: 'Refer back failed', variant: 'destructive' });
    }
  };

  // === Helpers ===
  const getStatusBadge = (status: string) => {
    const variants = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      WIP: 'bg-blue-100 text-blue-800',
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
      REFERRED_BACK: 'bg-purple-100 text-purple-800',
    };
    return variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'WIP': return <AlertTriangle className="w-4 h-4 text-blue-600" />;
      case 'APPROVED': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'REJECTED': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'REFERRED_BACK': return <AlertTriangle className="w-4 h-4 text-purple-600" />;
      default: return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  // === Filters ===
  const filteredTasks = tasks.filter(item => {
    const matchesSearch = item.entityKey.toLowerCase().includes(searchTerm.toLowerCase())
      || item.submittedBy.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusCounts = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'PENDING').length,
    wip: tasks.filter(t => t.status === 'WIP').length,
    approved: tasks.filter(t => t.status === 'APPROVED').length,
  };

  return (
    <div className="space-y-6">
      {/* === Overview Card === */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Department Workflow Overview</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{statusCounts.total} Total Tasks</div>
          <p className="text-xs text-muted-foreground">
            {statusCounts.pending} Pending, {statusCounts.wip} In Progress, {statusCounts.approved} Approved
          </p>
        </CardContent>
      </Card>

      {/* === Workflow Table === */}
      <Card>
        <CardHeader>
          <CardTitle>Department Workflow Management</CardTitle>
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
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="wip">In Progress</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="referred_back">Referred Back</SelectItem>
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
                  <TableHead>ID</TableHead>
                  <TableHead>Entity Key</TableHead>
                  <TableHead>Submitted By</TableHead>
                  <TableHead>Submitted At</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell>{task.id}</TableCell>
                    <TableCell>{task.entityKey}</TableCell>
                    <TableCell>{task.submittedBy}</TableCell>
                    <TableCell>{new Date(task.submittedAt).toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge className={getStatusBadge(task.status)}>
                        <span className="flex items-center">
                          {getStatusIcon(task.status)}
                          <span className="ml-1">{task.status}</span>
                        </span>
                      </Badge>
                    </TableCell>
                    <TableCell className="space-x-2">
                      <Button size="sm" onClick={() => onApprove(task.id)}>Approve</Button>
                      <Button size="sm" variant="outline" onClick={() => setActionModal({ type: 'reject', task })}>Reject</Button>
                      <Button size="sm" variant="secondary" onClick={() => setActionModal({ type: 'referback', task })}>Refer Back</Button>
                    </TableCell>
                  </TableRow>
                ))}
                {!filteredTasks.length && (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-gray-500">
                      No workflow items found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* === Modal for Reject/ReferBack === */}
      {actionModal.task && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>
                {actionModal.type === 'reject'
                  ? `Reject Workflow #${actionModal.task.id}`
                  : `Refer Back Workflow #${actionModal.task.id}`}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                {actionModal.type === 'reject'
                  ? 'Please provide a reason for rejection.'
                  : 'Provide details for referring back this workflow.'}
              </p>
              <Input
                placeholder="Enter reason..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="mb-4"
              />
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setActionModal({ type: 'reject', task: null })}>Cancel</Button>
                <Button
                  variant={actionModal.type === 'reject' ? 'destructive' : 'secondary'}
                  onClick={() => {
                    if (actionModal.task) {
                      actionModal.type === 'reject'
                        ? onReject(actionModal.task.id)
                        : onReferBack(actionModal.task.id);
                    }
                    setActionModal({ type: 'reject', task: null });
                  }}
                >
                  {actionModal.type === 'reject' ? 'Reject' : 'Refer Back'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default DepartmentWorkflowDashboard;
