import { coreApi } from './http';

export interface RQAFilter {
  fromDate?: string;
  toDate?: string;
  districtCode?: string;
  circleCode?: string;
  mouzaCode?: string;
  villageCode?: string;
  sroCode?: string;
  landCategoryGenId?: string;
}

export interface RevenueReportRow {
  scope: string; // e.g., 'MOUZA', 'SRO'
  scopeCode: string;
  scopeName: string;
  transactionCount: number;
  totalMarketValue: number;
  totalConsideration: number;
  totalStampDuty: number;
}

export async function fetchRevenueReport(scope: 'MOUZA' | 'SRO' | 'CIRCLE' | 'VILLAGE' | 'DISTRICT', filter: RQAFilter): Promise<RevenueReportRow[]> {
  const res = await coreApi.get('/reports/revenue', { params: { scope, ...filter } });
  return res.data;
}

export async function fetchDeviationAnalysis(filter: RQAFilter): Promise<any[]> {
  const res = await coreApi.get('/reports/deviation', { params: filter });
  return res.data;
}

export async function fetchPriceChangeAnalysis(filter: RQAFilter): Promise<any[]> {
  const res = await coreApi.get('/reports/price-change', { params: filter });
  return res.data;
}