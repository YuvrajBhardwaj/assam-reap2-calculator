import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { getAllDistricts, getCirclesByDistrict } from '@/services/locationService';
import { requestChange, getHistory } from '@/services/masterDataService';
import { Circle, District, AuditLog } from '@/types/masterData';
import { useToast } from '@/hooks/use-toast';

const CirclesDeptTable: React.FC = () => {
  const { toast } = useToast();
  const [districts, setDistricts] = useState<District[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [rows, setRows] = useState<Circle[]>([]);
  const [loading, setLoading] = useState(false);

  const [createOpen, setCreateOpen] = useState(false);
  const [createName, setCreateName] = useState('');
  const [createReason, setCreateReason] = useState('');

  const [updateOpen, setUpdateOpen] = useState(false);
  const [updateRow, setUpdateRow] = useState<Circle | null>(null);
  const [updateName, setUpdateName] = useState('');
  const [updateReason, setUpdateReason] = useState('');

  const [deactivateOpen, setDeactivateOpen] = useState(false);
  const [deactivateRow, setDeactivateRow] = useState<Circle | null>(null);
  const [deactivateReason, setDeactivateReason] = useState('');

  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyLogs, setHistoryLogs] = useState<AuditLog[]>([]);

  const loadDistricts = async () => {
    try {
      const list = await getAllDistricts();
      setDistricts(list);
    } catch {}
  };

  const refresh = async () => {
    if (!selectedDistrict) return;
    try {
      setLoading(true);
      const list = await getCirclesByDistrict(selectedDistrict);
      setRows(list);
    } catch (err) {
      toast({ title: 'Failed to fetch circles', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadDistricts(); }, []);
  useEffect(() => { refresh(); }, [selectedDistrict]);

  const submitCreate = async () => {
    if (!selectedDistrict) {
      toast({ title: 'Select a district first', variant: 'destructive' });
      return;
    }
    try {
      await requestChange('Circles', 'CREATE', { districtCode: selectedDistrict, circleName: createName }, createReason);
      toast({ title: 'Create request submitted' });
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
      await requestChange('Circles', 'UPDATE', { id: updateRow.id, districtCode: updateRow.districtCode, circleName: updateName }, updateReason);
      toast({ title: 'Update request submitted' });
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
      await requestChange('Circles', 'DEACTIVATE', { id: deactivateRow.id }, deactivateReason);
      toast({ title: 'Deactivate request submitted' });
      setDeactivateOpen(false);
      setDeactivateRow(null);
      setDeactivateReason('');
      refresh();
    } catch {
      toast({ title: 'Failed to submit deactivate request', variant: 'destructive' });
    }
  };

  const openHistory = async (row: Circle) => {
    try {
      const logs = await getHistory('Circles', String(row.id));
      setHistoryLogs(logs || []);
      setHistoryOpen(true);
    } catch {
      toast({ title: 'Failed to load history', variant: 'destructive' });
    }
  };

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle>Circles</CardTitle>
        <div className="flex gap-2">
          <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
            <SelectTrigger className="w-56">
              <SelectValue placeholder="Select District" />
            </SelectTrigger>
            <SelectContent>
              {districts.map(d => (
                <SelectItem key={d.code} value={d.code}>{d.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => setCreateOpen(true)} disabled={!selectedDistrict}>Request Create</Button>
          <Button variant="outline" onClick={refresh} disabled={!selectedDistrict || loading}>{loading ? 'Refreshing...' : 'Refresh'}</Button>
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
                <TableCell colSpan={4} className="text-center">No circles found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Request Create Circle</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input value={createName} onChange={(e) => setCreateName(e.target.value)} placeholder="Circle Name" />
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
          <DialogHeader><DialogTitle>Request Update Circle</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input value={updateName} onChange={(e) => setUpdateName(e.target.value)} placeholder="Circle Name" />
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
          <DialogHeader><DialogTitle>Request Deactivate Circle</DialogTitle></DialogHeader>
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
          <DialogHeader><DialogTitle>Circle Change History</DialogTitle></DialogHeader>
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

export default CirclesDeptTable;