import React, { useState } from 'react';
import { fetchRevenueReport, fetchDeviationAnalysis, fetchPriceChangeAnalysis, RQAFilter } from '@/services/reportingService';
import { useToast } from '@/hooks/use-toast';

export default function RQADashboard() {
  const { toast } = useToast();
  const [filter, setFilter] = useState<RQAFilter>({});
  const [revenue, setRevenue] = useState<any[]>([]);
  const [deviations, setDeviations] = useState<any[]>([]);
  const [priceChanges, setPriceChanges] = useState<any[]>([]);

  const runReports = async () => {
    try {
      const [rev, dev, pc] = await Promise.all([
        fetchRevenueReport('DISTRICT', filter),
        fetchDeviationAnalysis(filter),
        fetchPriceChangeAnalysis(filter),
      ]);
      setRevenue(rev); setDeviations(dev); setPriceChanges(pc);
    } catch {
      toast({ title: 'Report fetch failed', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-assam-blue">Reports, Queries and Analysis (RQA)</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <input className="border rounded p-2" placeholder="From Date (YYYY-MM-DD)" onChange={(e) => setFilter({ ...filter, fromDate: e.target.value })} />
        <input className="border rounded p-2" placeholder="To Date (YYYY-MM-DD)" onChange={(e) => setFilter({ ...filter, toDate: e.target.value })} />
        <input className="border rounded p-2" placeholder="District Code" onChange={(e) => setFilter({ ...filter, districtCode: e.target.value })} />
      </div>
      <button className="bg-assam-blue text-white px-4 py-2 rounded" onClick={runReports}>Run</button>

      <section className="border rounded p-4">
        <h3 className="font-semibold mb-2">Revenue Report (District-wise)</h3>
        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-2">District</th>
                <th className="text-left p-2">Transactions</th>
                <th className="text-left p-2">Market Value</th>
                <th className="text-left p-2">Consideration</th>
                <th className="text-left p-2">Stamp Duty</th>
              </tr>
            </thead>
            <tbody>
              {revenue.map((r: any, idx) => (
                <tr key={idx} className="border-t">
                  <td className="p-2">{r.scopeName}</td>
                  <td className="p-2">{r.transactionCount}</td>
                  <td className="p-2">{r.totalMarketValue}</td>
                  <td className="p-2">{r.totalConsideration}</td>
                  <td className="p-2">{r.totalStampDuty}</td>
                </tr>
              ))}
              {!revenue.length && <tr><td className="p-4 text-gray-500" colSpan={5}>No data</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      <section className="border rounded p-4">
        <h3 className="font-semibold mb-2">Deviation Analysis</h3>
        <pre className="bg-gray-50 p-3 rounded text-xs overflow-auto">{JSON.stringify(deviations, null, 2)}</pre>
      </section>

      <section className="border rounded p-4">
        <h3 className="font-semibold mb-2">Price Change Analysis</h3>
        <pre className="bg-gray-50 p-3 rounded text-xs overflow-auto">{JSON.stringify(priceChanges, null, 2)}</pre>
      </section>
    </div>
  );
}