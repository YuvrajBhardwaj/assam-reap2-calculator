import { coreApi } from './http';
import { AuditLog } from '@/types/masterData';

export interface GeographicalFactor {
  id?: string;
  districtCode: string;
  circleCode: string;
  lotCode: string;
  daagNumber?: string;
  factor: number;
  source: 'MANUAL' | 'AUTO_PARENT' | 'AUTO_AVERAGE';
  effectiveFrom: string;
  effectiveTo?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  parentFactors?: Array<{
    circleCode: string;
    lotCode: string;
    factor: number;
  }>;
}

export interface ConversionFactor {
  id?: string;
  landCategoryGenId: string;
  areaType: 'RURAL' | 'URBAN';
  factor: number;
  isHardcoded: boolean;
  districtCode?: string; // Optional district-specific override
  effectiveFrom: string;
  effectiveTo?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface FactorChangeRequest {
  id?: string;
  type: 'GEOGRAPHICAL' | 'CONVERSION';
  targetEntityId: string;
  requestedChanges: Record<string, any>;
  justification: string;
  impactAnalysis?: string;
  submittedBy: string;
  submittedAt: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewedBy?: string;
  reviewedAt?: string;
  reviewComments?: string;
}

// ===== GEOGRAPHICAL FACTOR OPERATIONS =====

export async function fetchGeographicalFactors(
  districtCode?: string,
  circleCode?: string,
  lotCode?: string,
  includeInactive: boolean = false
): Promise<GeographicalFactor[]> {
  const params: any = { includeInactive };
  if (districtCode) params.districtCode = districtCode;
  if (circleCode) params.circleCode = circleCode;
  if (lotCode) params.lotCode = lotCode;
  
  const res = await coreApi.get('/geographical-factors', { params });
  return res.data;
}

export async function getGeographicalFactor(
  districtCode: string,
  circleCode: string,
  lotCode: string,
  daagNumber?: string
): Promise<GeographicalFactor | null> {
  try {
    const res = await coreApi.get('/geographical-factors/single', {
      params: { districtCode, circleCode, lotCode, daagNumber }
    });
    return res.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null; // Factor not found, will need auto-assignment
    }
    throw error;
  }
}

export async function autoAssignGeographicalFactor(
  districtCode: string,
  circleCode: string,
  lotCode: string
): Promise<GeographicalFactor> {
  const res = await coreApi.post('/geographical-factors/auto-assign', {
    districtCode,
    circleCode,
    lotCode
  });
  return res.data;
}

export async function saveGeographicalFactor(factor: Omit<GeographicalFactor, 'id'>): Promise<GeographicalFactor> {
  const res = await coreApi.post('/geographical-factors', factor);
  return res.data;
}

export async function updateGeographicalFactor(
  id: string,
  updates: Partial<GeographicalFactor>
): Promise<GeographicalFactor> {
  const res = await coreApi.put(`/geographical-factors/${id}`, updates);
  return res.data;
}

export async function deactivateGeographicalFactor(id: string, effectiveTo: string): Promise<void> {
  await coreApi.patch(`/geographical-factors/${id}/deactivate`, { effectiveTo });
}

export async function getGeographicalFactorHistory(
  districtCode: string,
  circleCode: string,
  lotCode: string
): Promise<GeographicalFactor[]> {
  const res = await coreApi.get('/geographical-factors/history', {
    params: { districtCode, circleCode, lotCode }
  });
  return res.data;
}

// ===== CONVERSION FACTOR OPERATIONS =====

export async function fetchConversionFactors(
  landCategoryGenId?: string,
  areaType?: 'RURAL' | 'URBAN',
  districtCode?: string,
  includeInactive: boolean = false
): Promise<ConversionFactor[]> {
  const params: any = { includeInactive };
  if (landCategoryGenId) params.landCategoryGenId = landCategoryGenId;
  if (areaType) params.areaType = areaType;
  if (districtCode) params.districtCode = districtCode;
  
  const res = await coreApi.get('/conversion-factors', { params });
  return res.data;
}

export async function getConversionFactor(
  landCategoryGenId: string,
  areaType: 'RURAL' | 'URBAN',
  districtCode?: string
): Promise<ConversionFactor | null> {
  try {
    const res = await coreApi.get('/conversion-factors/single', {
      params: { landCategoryGenId, areaType, districtCode }
    });
    return res.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null;
    }
    throw error;
  }
}

export async function saveConversionFactor(factor: Omit<ConversionFactor, 'id'>): Promise<ConversionFactor> {
  const res = await coreApi.post('/conversion-factors', factor);
  return res.data;
}

export async function updateConversionFactor(
  id: string,
  updates: Partial<ConversionFactor>
): Promise<ConversionFactor> {
  const res = await coreApi.put(`/conversion-factors/${id}`, updates);
  return res.data;
}

export async function deactivateConversionFactor(id: string, effectiveTo: string): Promise<void> {
  await coreApi.patch(`/conversion-factors/${id}/deactivate`, { effectiveTo });
}

export async function getConversionFactorHistory(
  landCategoryGenId: string,
  areaType: 'RURAL' | 'URBAN',
  districtCode?: string
): Promise<ConversionFactor[]> {
  const res = await coreApi.get('/conversion-factors/history', {
    params: { landCategoryGenId, areaType, districtCode }
  });
  return res.data;
}

// ===== FACTOR CHANGE REQUESTS =====

export async function submitFactorChangeRequest(request: Omit<FactorChangeRequest, 'id' | 'submittedAt' | 'status'>): Promise<{ requestId: string }> {
  const res = await coreApi.post('/factor-change-requests', {
    ...request,
    submittedAt: new Date().toISOString(),
    status: 'PENDING'
  });
  return res.data;
}

export async function fetchFactorChangeRequests(
  type?: 'GEOGRAPHICAL' | 'CONVERSION',
  status?: 'PENDING' | 'APPROVED' | 'REJECTED'
): Promise<FactorChangeRequest[]> {
  const params: any = {};
  if (type) params.type = type;
  if (status) params.status = status;
  
  const res = await coreApi.get('/factor-change-requests', { params });
  return res.data;
}

export async function approveFactorChangeRequest(requestId: string, reviewComments?: string): Promise<void> {
  await coreApi.post(`/factor-change-requests/${requestId}/approve`, {
    reviewComments,
    reviewedAt: new Date().toISOString()
  });
}

export async function rejectFactorChangeRequest(requestId: string, reviewComments: string): Promise<void> {
  await coreApi.post(`/factor-change-requests/${requestId}/reject`, {
    reviewComments,
    reviewedAt: new Date().toISOString()
  });
}

// ===== DISTRICT BASE VALUE OPERATIONS =====

export interface DistrictBase {
  id?: string;
  districtCode: string;
  minZonalValue: number;
  effectiveFrom: string;
  effectiveTo?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  source?: string;
  remarks?: string;
}

export async function fetchDistrictBases(includeInactive: boolean = false): Promise<DistrictBase[]> {
  const res = await coreApi.get('/district-bases', { params: { includeInactive } });
  return res.data;
}

export async function getDistrictBase(districtCode: string): Promise<DistrictBase | null> {
  try {
    const res = await coreApi.get('/district-bases/single', {
      params: { districtCode }
    });
    return res.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null;
    }
    throw error;
  }
}

export async function saveDistrictBase(base: Omit<DistrictBase, 'id'>): Promise<DistrictBase> {
  const res = await coreApi.post('/district-bases', base);
  return res.data;
}

export async function updateDistrictBase(id: string, updates: Partial<DistrictBase>): Promise<DistrictBase> {
  const res = await coreApi.put(`/district-bases/${id}`, updates);
  return res.data;
}

export async function getDistrictBaseHistory(districtCode: string): Promise<DistrictBase[]> {
  const res = await coreApi.get('/district-bases/history', {
    params: { districtCode }
  });
  return res.data;
}

// ===== ALERTS AND MONITORING =====

export interface FactorAlert {
  id: string;
  type: 'OUTDATED_FACTOR' | 'MISSING_FACTOR' | 'DEVIATION_THRESHOLD';
  entityType: 'GEOGRAPHICAL' | 'CONVERSION' | 'DISTRICT_BASE';
  entityId: string;
  message: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  createdAt: string;
  resolvedAt?: string;
  isResolved: boolean;
}

export async function fetchActiveAlerts(): Promise<FactorAlert[]> {
  const res = await coreApi.get('/factor-alerts/active');
  return res.data;
}

export async function resolveAlert(alertId: string): Promise<void> {
  await coreApi.patch(`/factor-alerts/${alertId}/resolve`);
}

export async function checkForOutdatedFactors(): Promise<FactorAlert[]> {
  const res = await coreApi.post('/factor-alerts/check-outdated');
  return res.data;
}