import React, { useEffect, useState } from 'react';
import { fetchMyTasks, approveTask, rejectTask, WorkflowTask } from '@/services/workflowService';
import { useToast } from '@/hooks/use-toast';

export default function ApprovalInbox() {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<WorkflowTask[]>([]);
  const [statusFilter, setStatusFilter] = useState<'PENDING' | 'WIP'>('PENDING');
  const [rejectReason, setRejectReason] = useState('');

  const load = async () => {
    try {
      const data = await fetchMyTasks(statusFilter);
      setTasks(data);
    } catch {
      toast({ title: 'Failed to load tasks', variant: 'destructive' });
    }
  };

  useEffect(() => { load(); }, [statusFilter]);

  const onApprove = async (id: string) => {
    try {
      await approveTask(id);
      toast({ title: 'Approved' });
      await load();
    } catch {
      toast({ title: 'Approve failed', variant: 'destructive' });
    }
  };

  const onReject = async (id: string) => {
    try {
      await rejectTask(id, rejectReason);
      setRejectReason('');
      toast({ title: 'Rejected' });
      await load();
    } catch {
      toast({ title: 'Reject failed', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-assam-blue">Approval Inbox</h2>
        <select className="border rounded p-2" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)}>
          <option value="PENDING">Pending</option>
          <option value="WIP">Work In Progress</option>
        </select>
      </div>

      <div className="overflow-auto border rounded">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-2">Type</th>
              <th className="text-left p-2">Entity</th>
              <th className="text-left p-2">Submitted By</th>
              <th className="text-left p-2">Submitted At</th>
              <th className="text-left p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map(t => (
              <tr key={t.id} className="border-t">
                <td className="p-2">{t.type}</td>
                <td className="p-2">{t.entityKey}</td>
                <td className="p-2">{t.submittedBy}</td>
                <td className="p-2">{new Date(t.submittedAt).toLocaleString()}</td>
                <td className="p-2 space-x-2">
                  <button className="text-green-700" onClick={() => onApprove(t.id)}>Approve</button>
                  <button className="text-red-700" onClick={() => onReject(t.id)}>Reject</button>
                </td>
              </tr>
            ))}
            {!tasks.length && (
              <tr><td className="p-4 text-gray-500" colSpan={5}>No tasks</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="border rounded p-3">
        <label className="block text-sm font-medium">Reject Reason</label>
        <input className="border rounded p-2 w-full mt-1" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Enter reason before rejecting" />
      </div>
    </div>
  );
}