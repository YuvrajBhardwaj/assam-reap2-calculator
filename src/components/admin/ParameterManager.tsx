import React, { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  fetchParameters,
  upsertParameter,
  deactivateParameter,
  getParameterHistory,
  requestParameterChange,
} from '@/services/valuationService';

export default function ParameterManager() {
  const { toast } = useToast();
  const [params, setParams] = useState<any[]>([]);
  const [editing, setEditing] = useState<any | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [reqReason, setReqReason] = useState('');

  const load = async () => {
    try {
      const data = await fetchParameters();
      setParams(data);
    } catch {
      toast({ title: 'Failed to load parameters', variant: 'destructive' });
    }
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    try {
      await upsertParameter(editing);
      setEditing(null);
      await load();
      toast({ title: 'Parameter saved' });
    } catch {
      toast({ title: 'Save failed', variant: 'destructive' });
    }
  };

  const handleDeactivate = async (code: string) => {
    try {
      await deactivateParameter(code);
      await load();
      toast({ title: 'Parameter deactivated' });
    } catch {
      toast({ title: 'Deactivation failed', variant: 'destructive' });
    }
  };

  const openHistory = async (code: string) => {
    try {
      const h = await getParameterHistory(code);
      setHistory(h);
    } catch {
      toast({ title: 'Failed to load history', variant: 'destructive' });
    }
  };

  const submitChangeRequest = async (code: string) => {
    try {
      await requestParameterChange({
        parameterCode: code,
        changeType: 'UPDATE',
        payload: {},
        reason: reqReason,
      });
      setReqReason('');
      toast({ title: 'Change request submitted' });
    } catch {
      toast({ title: 'Request failed', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-assam-blue">Parameters</h2>
        <button className="bg-assam-blue text-white px-4 py-2 rounded" onClick={() => setEditing({})}>Add Parameter</button>
      </div>

      <div className="overflow-auto border rounded">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-2">Code</th>
              <th className="text-left p-2">Name</th>
              <th className="text-left p-2">Category</th>
              <th className="text-left p-2">Active</th>
              <th className="text-left p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {params.map((p) => (
              <tr key={p.parameterCode} className="border-t">
                <td className="p-2">{p.parameterCode}</td>
                <td className="p-2">{p.name}</td>
                <td className="p-2">{p.category}</td>
                <td className="p-2">{p.active ? 'Yes' : 'No'}</td>
                <td className="p-2 space-x-2">
                  <button className="text-assam-blue" onClick={() => setEditing(p)}>Edit</button>
                  <button className="text-gray-600" onClick={() => openHistory(p.parameterCode)}>History</button>
                  {p.active && <button className="text-red-600" onClick={() => handleDeactivate(p.parameterCode)}>Deactivate</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="border rounded p-4">
          <h3 className="font-semibold mb-2">{editing.parameterCode ? 'Edit' : 'Add'} Parameter</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input className="border rounded p-2" placeholder="Code" value={editing.parameterCode || ''} onChange={(e) => setEditing({ ...editing, parameterCode: e.target.value })} />
            <input className="border rounded p-2" placeholder="Name" value={editing.name || ''} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
            <select className="border rounded p-2" value={editing.category || ''} onChange={(e) => setEditing({ ...editing, category: e.target.value })}>
              <option value="">Category</option>
              <option value="DEPRECIATION">Depreciation</option>
              <option value="APPRECIATION">Appreciation</option>
            </select>
          </div>
          <div className="mt-3 space-x-2">
            <button className="bg-assam-blue text-white px-4 py-2 rounded" onClick={handleSave}>Save</button>
            <button className="border px-4 py-2 rounded" onClick={() => setEditing(null)}>Cancel</button>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium">Submit Change Request</label>
            <div className="flex gap-2 mt-1">
              <input className="border rounded p-2 flex-1" placeholder="Justification/Reason" value={reqReason} onChange={(e) => setReqReason(e.target.value)} />
              <button className="border px-4 py-2 rounded" onClick={() => submitChangeRequest(editing.parameterCode)}>Submit</button>
            </div>
          </div>
        </div>
      )}

      {!!history.length && (
        <div className="border rounded p-4">
          <h3 className="font-semibold mb-2">Audit History</h3>
          <ul className="list-disc pl-5 text-sm">
            {history.map((h, idx) => (
              <li key={idx}>{h.action} by {h.performedBy} on {new Date(h.timestamp).toLocaleString()}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}