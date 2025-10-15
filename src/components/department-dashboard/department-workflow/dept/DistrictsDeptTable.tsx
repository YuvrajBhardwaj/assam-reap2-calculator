import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { getAllDistricts } from '@/services/locationService';
import { requestChange, getHistory } from '@/services/masterDataService';
import { District, AuditLog } from '@/types/masterData';
import { useToast } from '@/hooks/use-toast';

const DistrictsDeptTable: React.FC = () => {
  const { toast } = useToast();
  const [rows, setRows] = useState<District[]>([]);
  const [loading, setLoading] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [createName, setCreateName] = useState('');
  const [createReason, setCreateReason] = useState('');

  const [updateOpen, setUpdateOpen] = useState(false);
  const [updateRow, setUpdateRow] = useState<District | null>(null);
  const [updateName, setUpdateName] = useState('');
  const [updateReason, setUpdateReason] = useState('');

  const [deactivateOpen, setDeactivateOpen] = useState(false);
  const [deactivateRow, setDeactivateRow] = useState<District | null>(null);
  const [deactivateReason, setDeactivateReason] = useState('');

  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyLogs, setHistoryLogs] = useState<AuditLog[]>([]);

  const refresh = async () => {
    try {
      setLoading(true);
      const list = await getAllDistricts();
      setRows(list);
    } catch (err: any) {
      toast({ title: 'Failed to fetch districts', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const submitCreate = async () => {
    try {
      await requestChange('Districts', 'CREATE', { districtName: createName }, createReason);
      toast({ title: 'Create request submitted', description: 'Awaiting approvals.' });
      setCreateOpen(false);
      setCreateName('');
      setCreateReason('');
      refresh();
    } catch {
      toast({ title: 'Failed to submit create request', variant: 'destructive' });
    }
  };

  const submitUpdate = async () => {
    if (!updateRow) return;
    try {
      await requestChange('Districts', 'UPDATE', { id: updateRow.id, districtName: updateName }, updateReason);
      toast({ title: 'Update request submitted', description: 'Awaiting approvals.' });
      setUpdateOpen(false);
      setUpdateRow(null);
      setUpdateName('');
      setUpdateReason('');
      refresh();
    } catch {
      toast({ title: 'Failed to submit update request', variant: 'destructive' });
    }
  };

  const submitDeactivate = async () => {
    if (!deactivateRow) return;
    try {
      await requestChange('Districts', 'DEACTIVATE', { id: deactivateRow.id }, deactivateReason);
      toast({ title: 'Deactivate request submitted', description: 'Awaiting approvals.' });
      setDeactivateOpen(false);
      setDeactivateRow(null);
      setDeactivateReason('');
      refresh();
    } catch {
      toast({ title: 'Failed to submit deactivate request', variant: 'destructive' });
    }
  };

  const openHistory = async (row: District) => {
    try {
      const logs = await getHistory('Districts', String(row.id));
      setHistoryLogs(logs || []);
      setHistoryOpen(true);
    } catch {
      toast({ title: 'Failed to load history', variant: 'destructive' });
    }
  };

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle>Districts</CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setCreateOpen(true)}>Request Create</Button>
          <Button variant="outline" onClick={refresh} disabled={loading}>{loading ? 'Refreshing...' : 'Refresh'}</Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Active</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.code}</TableCell>
                <TableCell>{row.name}</TableCell>
                <TableCell>
                  <Badge variant={row.isActive ? 'default' : 'outline'}>
                    {row.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => openHistory(row)}>View History</Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => { setUpdateRow(row); setUpdateName(row.name); setUpdateOpen(true); }}
                  >
                    Request Update
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => { setDeactivateRow(row); setDeactivateOpen(true); }}
                  >
                    Request Deactivate
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {!rows.length && (
              <TableRow>
                <TableCell colSpan={4} className="text-center">No districts found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Request Create District</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input value={createName} onChange={(e) => setCreateName(e.target.value)} placeholder="District Name" />
            <Textarea value={createReason} onChange={(e) => setCreateReason(e.target.value)} placeholder="Reason for change" />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button onClick={submitCreate} disabled={!createName.trim() || !createReason.trim()}>Submit</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Update dialog */}
      <Dialog open={updateOpen} onOpenChange={setUpdateOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Request Update District</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input value={updateName} onChange={(e) => setUpdateName(e.target.value)} placeholder="District Name" />
            <Textarea value={updateReason} onChange={(e) => setUpdateReason(e.target.value)} placeholder="Reason for change" />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setUpdateOpen(false)}>Cancel</Button>
              <Button onClick={submitUpdate} disabled={!updateName.trim() || !updateReason.trim()}>Submit</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Deactivate dialog */}
      <Dialog open={deactivateOpen} onOpenChange={setDeactivateOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Request Deactivate District</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Textarea value={deactivateReason} onChange={(e) => setDeactivateReason(e.target.value)} placeholder="Reason for deactivation" />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDeactivateOpen(false)}>Cancel</Button>
              <Button onClick={submitDeactivate} disabled={!deactivateReason.trim()}>Submit</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* History dialog */}
      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>District Change History</DialogTitle></DialogHeader>
          <div className="space-y-2 max-h-80 overflow-auto">
            {historyLogs.map((log) => (
              <div key={log.id} className="text-sm border-b pb-2">
                <div className="font-medium">{log.action}</div>
                <div className="text-gray-600">{new Date(log.timestamp).toLocaleString()}</div>
                {log.details && <pre className="text-xs bg-gray-50 p-2 rounded mt-1">{JSON.stringify(log.details, null, 2)}</pre>}
              </div>
            ))}
            {!historyLogs.length && <div className="text-sm text-center">No history found.</div>}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default DistrictsDeptTable;