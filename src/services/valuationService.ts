// Top-level imports
import { coreApi as api } from './http';

import axios from 'axios';
import {
  AreaType,
  AuditEntry,
  CircleLotFactor,
  CircleLotFactorChangeRequest,
  CircleLotIdentifier,
  ConversionFactor,
  ConversionFactorChangeRequest,
  DistrictBase,
  PlotValuationInput,
  PlotValuationResult,
} from '@/types/valuation';

// Configure base URL consistent with existing services (adjust if your backend exposes different paths)
// const API_BASE_URL = 'http://192.168.1.5:8082/areap2';

// Single-purpose axios instance with default headers + auth from localStorage
// const api = axios.create({
//   baseURL: API_BASE_URL,
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('jwtToken');
//     if (token) {
//       // Ensure Bearer format
//       const hasBearer = token.startsWith('Bearer ');
//       config.headers.Authorization = hasBearer ? token : `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// Pure client-side helpers

export function computeGeographicalFactorAverage(parentFactors: number[]): number {
  if (!parentFactors.length) return 0;
  const sum = parentFactors.reduce((acc, v) => acc + (isFinite(v) ? v : 0), 0);
  return sum / parentFactors.length;
}

export function computePlotBaseValue(input: PlotValuationInput): PlotValuationResult {
  const { districtBase, geographicalFactor, conversionFactor } = input;
  const plotBaseValue = districtBase * geographicalFactor * conversionFactor;
  return { ...input, plotBaseValue };
}

// API stubs (replace endpoint paths with your backend routes when available)

// Geographical Factor

export async function saveCircleLotFactor(payload: CircleLotFactor): Promise<CircleLotFactor> {
  const res = await api.post('/valuation/geo-factors', payload);
  return res.data;
}

export async function requestGeographicalFactorChange(
  payload: CircleLotFactorChangeRequest
): Promise<{ requestId: string }> {
  // e.g., POST /valuation/geo-factors/change-requests
  const res = await api.post('/valuation/geo-factors/change-requests', payload);
  return res.data;
}

export async function getGeographicalFactorHistory(
  id: CircleLotIdentifier
): Promise<AuditEntry[]> {
  const { districtCode, circleCode, lotCode } = id;
  // e.g., GET /valuation/geo-factors/history?district=..&circle=..&lot=..
  const res = await api.get('/valuation/geo-factors/history', {
    params: { district: districtCode, circle: circleCode, lot: lotCode },
  });
  return res.data;
}

// Conversion Factor

export async function getConversionFactor(
  key: { landCategoryGenId: string; areaType: AreaType }
): Promise<ConversionFactor> {
  // e.g., GET /valuation/conversion-factors?landClass=..&areaType=..
  const res = await api.get('/valuation/conversion-factors', {
    params: { landClass: key.landCategoryGenId, areaType: key.areaType },
  });
  return res.data;
}

export async function upsertConversionFactor(payload: ConversionFactor): Promise<ConversionFactor> {
  // e.g., POST /valuation/conversion-factors
  const res = await api.post('/valuation/conversion-factors', payload);
  return res.data;
}

export async function requestConversionFactorChange(
  payload: ConversionFactorChangeRequest
): Promise<{ requestId: string }> {
  // e.g., POST /valuation/conversion-factors/change-requests
  const res = await api.post('/valuation/conversion-factors/change-requests', payload);
  return res.data;
}

export async function getConversionFactorHistory(
  landCategoryGenId: string,
  areaType: AreaType
): Promise<AuditEntry[]> {
  // e.g., GET /valuation/conversion-factors/history?landClass=..&areaType=..
  const res = await api.get('/valuation/conversion-factors/history', {
    params: { landClass: landCategoryGenId, areaType },
  });
  return res.data;
}

// District Base

export async function getDistrictBase(districtCode: string): Promise<DistrictBase> {
  // e.g., GET /valuation/district-base?district=..
  const res = await api.get('/valuation/district-base', { params: { district: districtCode } });
  return res.data;
}

// Optional: server-side calculation endpoint (if backend provides)
// Otherwise, use computePlotBaseValue on the client

export async function calculatePlotBaseOnServer(input: PlotValuationInput): Promise<PlotValuationResult> {
  const res = await api.post('/valuation/plot-base', input);
  return res.data;
}

// ===== Alerts and Versioning =====

import {
  AlertConfig,
  StaleStatus,
  DistrictBaseVersion,
  PlotIdentifier,
  PlotGeoAttributes,
  BifurcationRequest,
  MergeRequest,
  PlotRelation,
  ValuationParameter,
  ParameterBandDefinition,
  ParameterWeightageByArea,
  ParameterChangeRequest,
  ValuationFormulaDefinition,
  FormulaSimulationInput,
  FormulaSimulationResult,
} from '@/types/valuation';

export async function getAlertConfig(): Promise<AlertConfig[]> {
  const res = await api.get('/valuation/alerts/config');
  return res.data;
}

export async function updateAlertConfig(configs: AlertConfig[]): Promise<AlertConfig[]> {
  const res = await api.put('/valuation/alerts/config', configs);
  return res.data;
}

export async function getStaleDistrictBaseStatuses(): Promise<StaleStatus[]> {
  const res = await api.get('/valuation/district-base/stale-status');
  return res.data;
}

export async function getDistrictBaseHistory(districtCode: string): Promise<DistrictBaseVersion[]> {
  const res = await api.get('/valuation/district-base/history', { params: { district: districtCode } });
  return res.data;
}

// ===== GIS / Plot Geo Attributes =====

export async function getPlotGeo(plotId: string): Promise<PlotGeoAttributes | null> {
  const res = await api.get('/valuation/plots/geo', { params: { plotId } });
  return res.data;
}

export async function upsertPlotGeo(payload: PlotGeoAttributes): Promise<PlotGeoAttributes> {
  const res = await api.post('/valuation/plots/geo', payload);
  return res.data;
}

// ===== Bifurcation / Merger =====

export async function bifurcatePlot(req: BifurcationRequest): Promise<{ childPlotIds: string[] }> {
  const res = await api.post('/valuation/plots/bifurcate', req);
  return res.data;
}

export async function mergePlots(req: MergeRequest): Promise<{ mergedPlotId: string }> {
  const res = await api.post('/valuation/plots/merge', req);
  return res.data;
}

export async function getPlotRelations(plotId: string): Promise<PlotRelation[]> {
  const res = await api.get('/valuation/plots/relations', { params: { plotId } });
  return res.data;
}

// ===== Parameters (CRUD + Workflow + History) =====

export async function fetchParameters(): Promise<ValuationParameter[]> {
  const res = await api.get('/valuation/parameters');
  return res.data;
}

export async function upsertParameter(p: ValuationParameter): Promise<ValuationParameter> {
  const res = await api.post('/valuation/parameters', p);
  return res.data;
}

export async function deactivateParameter(parameterCode: string): Promise<void> {
  await api.delete(`/valuation/parameters/${encodeURIComponent(parameterCode)}`);
}

export async function upsertParameterBands(bands: ParameterBandDefinition[]): Promise<void> {
  await api.post('/valuation/parameters/bands', bands);
}

export async function upsertParameterWeightages(weights: ParameterWeightageByArea[]): Promise<void> {
  await api.post('/valuation/parameters/weightages', weights);
}

export async function requestParameterChange(req: ParameterChangeRequest): Promise<{ requestId: string }> {
  const res = await api.post('/valuation/parameters/change-requests', req);
  return res.data;
}

export async function getParameterHistory(parameterCode: string): Promise<AuditEntry[]> {
  const res = await api.get('/valuation/parameters/history', { params: { parameterCode } });
  return res.data;
}

// ===== Formulas (Versioned) =====

export async function createFormula(f: Omit<ValuationFormulaDefinition, 'id' | 'version' | 'status'>): Promise<ValuationFormulaDefinition> {
  const res = await api.post('/valuation/formulas', f);
  return res.data;
}

export async function updateFormula(f: ValuationFormulaDefinition): Promise<ValuationFormulaDefinition> {
  const res = await api.put(`/valuation/formulas/${encodeURIComponent(f.id)}`, f);
  return res.data;
}

export async function deactivateFormula(formulaId: string): Promise<void> {
  await api.delete(`/valuation/formulas/${encodeURIComponent(formulaId)}`);
}

export async function requestFormulaApproval(formulaId: string, reason: string): Promise<{ requestId: string }> {
  const res = await api.post(`/valuation/formulas/${encodeURIComponent(formulaId)}/approval`, { reason });
  return res.data;
}

export async function getFormulaVersions(scope: { districtCode?: string; areaType?: AreaType; landClassCode?: string }): Promise<ValuationFormulaDefinition[]> {
  const res = await api.get('/valuation/formulas/versions', { params: scope });
  return res.data;
}

export async function simulateFormula(input: FormulaSimulationInput): Promise<FormulaSimulationResult> {
  const res = await api.post('/valuation/formulas/simulate', input);
  return res.data;
}