import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { getAllDistricts, getCirclesByDistrict, getMouzasByDistrictAndCircle, getVillagesByDistrictAndCircle } from '@/services/locationService';
import { requestChange, getHistory } from '@/services/masterDataService';
import { Circle, District, Mouza, Village, AuditLog } from '@/types/masterData';
import { useToast } from '@/hooks/use-toast';

const VillagesDeptTable: React.FC = () => {
  const { toast } = useToast();
  const [districts, setDistricts] = useState<District[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [circles, setCircles] = useState<Circle[]>([]);
  const [selectedCircle, setSelectedCircle] = useState<string>('');
  const [mouzas, setMouzas] = useState<Mouza[]>([]);
  const [selectedMouza, setSelectedMouza] = useState<string>('');
  const [rows, setRows] = useState<Village[]>([]);
  const [loading, setLoading] = useState(false);

  const [createOpen, setCreateOpen] = useState(false);
  const [createName, setCreateName] = useState('');
  const [createReason, setCreateReason] = useState('');

  const [updateOpen, setUpdateOpen] = useState(false);
  const [updateRow, setUpdateRow] = useState<Village | null>(null);
  const [updateName, setUpdateName] = useState('');
  const [updateReason, setUpdateReason] = useState('');

  const [deactivateOpen, setDeactivateOpen] = useState(false);
  const [deactivateRow, setDeactivateRow] = useState<Village | null>(null);
  const [deactivateReason, setDeactivateReason] = useState('');

  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyLogs, setHistoryLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    (async () => setDistricts(await getAllDistricts()))();
  }, []);

  useEffect(() => {
    (async () => {
      if (selectedDistrict) {
        setCircles(await getCirclesByDistrict(selectedDistrict));
      } else {
        setCircles([]);
      }
      setSelectedCircle('');
      setSelectedMouza('');
      setMouzas([]);
      setRows([]);
    })();
  }, [selectedDistrict]);

  useEffect(() => {
    (async () => {
      if (selectedDistrict && selectedCircle) {
        setMouzas(await getMouzasByDistrictAndCircle(selectedDistrict, selectedCircle));
      } else {
        setMouzas([]);
      }
      setSelectedMouza('');
      setRows([]);
    })();
  }, [selectedCircle]);

  useEffect(() => {
    (async () => {
      if (selectedDistrict && selectedCircle) {
        setLoading(true);
        setRows(await getVillagesByDistrictAndCircle(selectedDistrict, selectedCircle, selectedMouza || undefined));
        setLoading(false);
      } else {
        setRows([]);
      }
    })();
  }, [selectedMouza]);

  const refresh = async () => {
    if (!selectedDistrict || !selectedCircle) return;
    setLoading(true);
    setRows(await getVillagesByDistrictAndCircle(selectedDistrict, selectedCircle, selectedMouza || undefined));
    setLoading(false);
  };

  const submitCreate = async () => {
    if (!selectedDistrict || !selectedCircle) {
      toast({ title: 'Select district & circle first', variant: 'destructive' });
      return;
    }
    try {
      await requestChange('Villages', 'CREATE', { districtCode: selectedDistrict, circleCode: selectedCircle, mouzaCode: selectedMouza || '', villageName: createName }, createReason);
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
      await requestChange(
        'Villages',
        'UPDATE',
        {
          code: updateRow.code,
          districtCode: updateRow.districtCode,
          circleCode: updateRow.circleCode,
          mouzaCode: updateRow.mouzaCode,
          villageName: updateName
        },
        updateReason
      );
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
      await requestChange(
        'Villages',
        'DEACTIVATE',
        { code: deactivateRow.code },
        deactivateReason
      );
      toast({ title: 'Deactivate request submitted' });
      setDeactivateOpen(false);
      setDeactivateRow(null);
      setDeactivateReason('');
      refresh();
    } catch {
      toast({ title: 'Failed to submit deactivate request', variant: 'destructive' });
    }
  };

  const openHistory = async (row: Village) => {
    try {
      const logs = await getHistory('Villages', String(row.code));
      setHistoryLogs(logs || []);
      setHistoryOpen(true);
    } catch {
      toast({ title: 'Failed to load history', variant: 'destructive' });
    }
  };

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle>Villages</CardTitle>
        <div className="flex gap-2">
          <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Select District" />
            </SelectTrigger>
            <SelectContent>
              {districts.map(d => (<SelectItem key={d.code} value={d.code}>{d.name}</SelectItem>))}
            </SelectContent>
          </Select>
          <Select value={selectedCircle} onValueChange={setSelectedCircle} disabled={!selectedDistrict}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Select Circle" />
            </SelectTrigger>
            <SelectContent>
              {circles.map(c => (<SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>))}
            </SelectContent>
          </Select>
          <Select value={selectedMouza} onValueChange={setSelectedMouza} disabled={!selectedDistrict || !selectedCircle}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Select Mouza (optional)" />
            </SelectTrigger>
            <SelectContent>
              {mouzas.map(m => (<SelectItem key={m.code} value={m.code}>{m.name}</SelectItem>))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => setCreateOpen(true)} disabled={!selectedDistrict || !selectedCircle}>Request Create</Button>
          <Button variant="outline" onClick={refresh} disabled={!selectedDistrict || !selectedCircle || loading}>{loading ? 'Refreshing...' : 'Refresh'}</Button>
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
                  <Button variant="default" size="sm" onClick={() => { setUpdateRow(row); setUpdateName(row.name); setUpdateOpen(true); }}>Request Update</Button>
                  <Button variant="destructive" size="sm" onClick={() => { setDeactivateRow(row); setDeactivateOpen(true); }}>Request Deactivate</Button>
                </TableCell>
              </TableRow>
            ))}
            {!rows.length && (
              <TableRow>
                <TableCell colSpan={4} className="text-center">No villages found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>

      {/* Create */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Request Create Village</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input value={createName} onChange={(e) => setCreateName(e.target.value)} placeholder="Village Name" />
            <Textarea value={createReason} onChange={(e) => setCreateReason(e.target.value)} placeholder="Reason for change" />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button onClick={submitCreate} disabled={!createName.trim() || !createReason.trim()}>Submit</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Update */}
      <Dialog open={updateOpen} onOpenChange={setUpdateOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Request Update Village</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input value={updateName} onChange={(e) => setUpdateName(e.target.value)} placeholder="Village Name" />
            <Textarea value={updateReason} onChange={(e) => setUpdateReason(e.target.value)} placeholder="Reason for change" />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setUpdateOpen(false)}>Cancel</Button>
              <Button onClick={submitUpdate} disabled={!updateName.trim() || !updateReason.trim()}>Submit</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Deactivate */}
      <Dialog open={deactivateOpen} onOpenChange={setDeactivateOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Request Deactivate Village</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Textarea value={deactivateReason} onChange={(e) => setDeactivateReason(e.target.value)} placeholder="Reason for deactivation" />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDeactivateOpen(false)}>Cancel</Button>
              <Button onClick={submitDeactivate} disabled={!deactivateReason.trim()}>Submit</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* History */}
      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Village Change History</DialogTitle></DialogHeader>
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

export default VillagesDeptTable;