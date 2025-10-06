import { masterDataApi, coreApi } from './http';
import {
  BaseEntity,
  District,
  SRO,
  Circle,
  Mouza,
  Lot,
  Village,
  Zone,
  LandClass,
  LandSubClass,
  Parameter,
  ParameterWeightage,
  ParameterBand,
  ApprovingAuthority,
  LandClassMapping,
  LandSubClassMapping,
  AuditLog,
  CircleLotFactorRequest,
  CircleLotFactorResponse,
} from '@/types/masterData';
import { ComprehensiveValuationRequest } from '@/types/valuation';

// Generic CRUD operations for all entities
interface ChangeRequest {
  entityType: string;
  entityId?: string;
  operation: 'CREATE' | 'UPDATE' | 'DEACTIVATE' | 'MAP' | 'UNMAP';
  payload: Record<string, any>;
  reason: string;
  justification?: string;
  impactAnalysis?: string;
}

// ===== DISTRICT MANAGEMENT =====
export async function createDistrict(district: { districtName: string }): Promise<District> {
  const res = await masterDataApi.post('/add/district', { districtName: district.districtName });
  return res.data;
}

export async function updateDistrict(districtCode: string, districtName: string): Promise<District> {
  const res = await masterDataApi.post('/update/district', { districtCode, districtName });
  return res.data;
}

export async function deactivateDistrict(districtCode: string): Promise<void> {
  await masterDataApi.post(`/update/deleteDistrictDetails?districtCode=${districtCode}`);
}

// Added: Reactivate District
export async function reactivateDistrict(districtCode: string): Promise<void> {
  await masterDataApi.patch(`/districts/${districtCode}/reactivate`);
}

export async function getDistrictHistory(id: string): Promise<AuditLog[]> {
  const res = await masterDataApi.get(`/districts/${id}/history`);
  return res.data;
}

// ===== SRO MANAGEMENT =====
export async function fetchSROs(districtCode?: string): Promise<SRO[]> {
  const params = districtCode ? { districtCode } : {};
  const res = await masterDataApi.get('/sros', { params });
  return res.data;
}

export async function createSRO(sro: Omit<SRO, 'id'>): Promise<SRO> {
  const res = await masterDataApi.post('/sros', sro);
  return res.data;
}

export async function updateSRO(id: string, updates: Partial<SRO>): Promise<SRO> {
  const res = await masterDataApi.put(`/sros/${id}`, updates);
  return res.data;
}

export async function deactivateSRO(id: string): Promise<void> {
  await masterDataApi.patch(`/sros/${id}/deactivate`);
}

// ===== CIRCLE MANAGEMENT =====
export async function createCircle(circle: Omit<Circle, 'id'>): Promise<Circle> {
  const res = await masterDataApi.post('/circle/add', { circleName: circle.name, districtCode: circle.districtCode });
  return res.data;
}

export async function updateCircle(id: string, updates: Partial<Circle>): Promise<Circle> {
  const res = await masterDataApi.post('/circle/update', { circleCode: id, circleName: updates.name, districtCode: updates.districtCode });
  return res.data;
}

export async function deactivateCircle(id: string): Promise<void> {
  await masterDataApi.post(`/circle/delete?circleCode=${id}`);
}

export async function reactivateCircle(id: string): Promise<void> {
  await masterDataApi.patch(`/circles/${id}/reactivate`);
}

export async function getCircleHistory(id: string): Promise<AuditLog[]> {
  const res = await masterDataApi.get(`/circles/${id}/history`);
  return res.data;
}

// ===== MOUZA MANAGEMENT =====
export async function createMouza(mouza: any): Promise<Mouza> {
  const payload = {
    mouzaName: mouza.mouzaName || mouza.name,
    districtCode: mouza.districtCode,
    circleCode: mouza.circleCode,
    areaTypeId: mouza.areaTypeId
  };
  console.log('Creating Mouza with payload:', payload);
  const res = await masterDataApi.post('/add/mouza', payload);
  return res.data;
}

export async function updateMouza(id: string, updates: any): Promise<Mouza> {
  const payload = {
    mouzaCode: updates.mouzaCode || updates.code,
    mouzaName: updates.mouzaName || updates.name,
    districtCode: updates.districtCode,
    circleCode: updates.circleCode,
    areaTypeId: updates.areaTypeId
  };
  console.log('Updating Mouza with payload:', payload);
  const res = await masterDataApi.post('/update/mouza', payload);
  return res.data;
}

export async function deactivateMouza(id: string): Promise<void> {
  await masterDataApi.post(`/delete/mouza?mouzaCode=${id}`);
}



// ===== LOT MANAGEMENT =====
export async function fetchLots(districtCode?: string, circleCode?: string, mouzaCode?: string): Promise<Lot[]> {
  // Require minimum selections similar to village fetch
  if (!districtCode || !circleCode) {
    return [];
  }

  try {
    const params: any = { districtCode, circleCode };
    const res = await masterDataApi.get('/getLotByDistrictAndCircle', { params });

    // Normalize payload shape: support { data: [] } or []
    const raw = Array.isArray(res?.data?.data)
      ? res.data.data
      : Array.isArray(res?.data)
        ? res.data
        : [];

    const lots: Lot[] = raw.map((lot: any) => ({
      id: (lot.lotGenId ?? lot.id ?? '').toString(),
      code: lot.lotCode ?? lot.code ?? '',
      name: lot.lotName ?? lot.name ?? '',
      districtCode: lot.districtCode ?? districtCode,
      circleCode: lot.circleCode ?? circleCode,
      mouzaCode: lot.mouzaCode ?? '',
      isActive: lot.active ?? lot.isActive ?? true,
      createdAt: lot.createdDtm ?? lot.createdAt ?? '',
      updatedAt: lot.updatedDtm ?? lot.updatedAt ?? '',
    })).filter((l: Lot) => l.code && l.name);

    return lots;
  } catch (err) {
    console.error('Failed to fetch lots', { districtCode, circleCode, mouzaCode, err });
    return [];
  }
}

export async function fetchLotsByDistrictAndCircle(districtCode: string, circleCode: string): Promise<Lot[]> {
  try {
    const res = await masterDataApi.get(`/getLotByDistrictAndCircle?districtCode=${districtCode}&circleCode=${circleCode}`);
    const raw = Array.isArray(res?.data?.data)
      ? res.data.data
      : Array.isArray(res?.data)
        ? res.data
        : [];
    return raw.map((lot: any) => ({
      id: (lot.lotGenId ?? lot.id ?? '').toString(),
      code: lot.lotCode ?? lot.code ?? '',
      name: lot.lotName ?? lot.name ?? '',
      districtCode: lot.districtCode ?? districtCode,
      circleCode: lot.circleCode ?? circleCode,
      mouzaCode: lot.mouzaCode ?? '',
      isActive: lot.active ?? lot.isActive ?? true,
      createdAt: lot.createdDtm ?? lot.createdAt ?? '',
      updatedAt: lot.updatedDtm ?? lot.updatedAt ?? '',
    })).filter((l: Lot) => l.code && l.name);
  } catch (err) {
    console.error('Failed to fetch lots by district & circle', { districtCode, circleCode, err });
    return [];
  }
}

export async function createLot(lot: any): Promise<Lot> {
  const res = await masterDataApi.post('/add/lot', { lotName: lot.name || lot.lotName, districtCode: lot.districtCode, circleCode: lot.circleCode, areaTypeId: lot.areaTypeId || '' });
  return res.data;
}

export async function updateLot(id: string, updates: any): Promise<Lot> {
  const res = await masterDataApi.post('/update/lot', { lotCode: id, lotName: updates.name || updates.lotName, districtCode: updates.districtCode, circleCode: updates.circleCode, areaTypeId: updates.areaTypeId || '' });
  return res.data;
}

export async function deactivateLot(id: string): Promise<void> {
  await masterDataApi.post(`/delete/lot?lotCode=${id}`);
}

// ===== VILLAGE MANAGEMENT =====
export async function createVillage(village: any): Promise<Village> {
  const payload = {
    villageName: village.villageName || village.name,
    circleCode: village.circleCode,
    districtCode: village.districtCode
  };
  console.log('createVillage API payload:', payload);
  const res = await masterDataApi.post('/village/add', payload);
  return res.data;
}

export async function updateVillage(id: string, updates: any): Promise<Village> {
  const payload = {
    villageCode: id,
    villageName: updates.villageName || updates.name,
    districtCode: updates.districtCode,
    circleCode: updates.circleCode
  };
  console.log('updateVillage API payload:', payload);
  const res = await masterDataApi.post('/village/update', payload);
  return res.data;
}

export async function deactivateVillage(id: string): Promise<void> {
  await masterDataApi.post(`/village/delete?villageCode=${id}`);
}

// ===== ZONE MANAGEMENT =====
export async function fetchZones(): Promise<Zone[]> {
  const res = await masterDataApi.get('/zones');
  return res.data;
}

export async function createZone(zone: Omit<Zone, 'id'>): Promise<Zone> {
  const res = await masterDataApi.post('/zones', zone);
  return res.data;
}

export async function updateZone(id: string, updates: Partial<Zone>): Promise<Zone> {
  const res = await masterDataApi.put(`/zones/${id}`, updates);
  return res.data;
}

export async function deactivateZone(id: string): Promise<void> {
  await masterDataApi.patch(`/zones/${id}/deactivate`);
}

// ===== LAND CLASS MANAGEMENT =====
export async function createLandClass(landClass: Omit<LandClass, 'id'>): Promise<LandClass> {
  const res = await masterDataApi.post('/add/landCategory', { landCategoryName: landClass.name });
  return res.data;
}

export async function updateLandClass(id: string, updates: Partial<LandClass>): Promise<LandClass> {
  const res = await masterDataApi.put(`/land-classes/${id}`, updates);
  return res.data;
}

  

export async function deactivateLandClass(id: string): Promise<void> {
  await masterDataApi.post(`/delete/landCategory?landCategoryGenId=${id}`);
}

export async function reactivateLandClass(id: string): Promise<void> {
  await masterDataApi.patch(`/land-classes/${id}/reactivate`);
}

export async function getLandClassHistory(id: string): Promise<AuditLog[]> {
  const res = await masterDataApi.get(`/land-classes/${id}/history`);
  return res.data;
}

// ===== AREA TYPE MANAGEMENT =====
export async function fetchAreaTypes(): Promise<any[]> {
  const res = await masterDataApi.get('/getAreaType');
  return res.data;
}

export async function createAreaType(areaType: { areaType: string }): Promise<any> {
  const res = await masterDataApi.post('/add/areaType', areaType);
  return res.data;
}

export async function deleteAreaType(id: string): Promise<void> {
  await masterDataApi.post(`/delete/areaType?areaTypesGenId=${id}`);
}

// ===== LAND SUB-CLASS MANAGEMENT =====
export async function fetchLandSubClasses(parentClassCode?: string): Promise<LandSubClass[]> {
  const params: any = {};
  if (parentClassCode) params.parentClassCode = parentClassCode;
  const res = await masterDataApi.get('/land-sub-classes', { params });
  return res.data;
}

export async function createLandSubClass(subClass: Omit<LandSubClass, 'id'>): Promise<LandSubClass> {
  const res = await masterDataApi.post('/land-sub-classes', subClass);
  return res.data;
}

export async function updateLandSubClass(id: string, updates: Partial<LandSubClass>): Promise<LandSubClass> {
  const res = await masterDataApi.put(`/land-sub-classes/${id}`, updates);
  return res.data;
}

export async function deactivateLandSubClass(id: string): Promise<void> {
  await masterDataApi.patch(`/land-sub-classes/${id}/deactivate`);
}

export async function reassignSubClass(subClassId: string, newParentClassCode: string): Promise<void> {
  await masterDataApi.patch(`/land-sub-classes/${subClassId}/reassign`, { newParentClassCode });
}

// ===== PARAMETERS =====
export async function getAllParameters(): Promise<Parameter[]> {
  const res = await masterDataApi.get('/parameters');
  return res.data;
}

export async function fetchParametersWithDetails(): Promise<Parameter[]> {
  const res = await masterDataApi.get('/parameters/details');
  return res.data;
}

export async function createParameter(parameter: Omit<Parameter, 'id'>): Promise<Parameter> {
  const res = await masterDataApi.post('/parameters', parameter);
  return res.data;
}

export async function updateParameter(id: string, updates: Partial<Parameter>): Promise<Parameter> {
  const res = await masterDataApi.put(`/parameters/${id}`, updates);
  return res.data;
}

export async function deleteParameter(id: string): Promise<void> {
  await masterDataApi.delete(`/parameters/${id}`);
}

export async function deactivateParameter(id: string): Promise<void> {
  await masterDataApi.patch(`/parameters/${id}/deactivate`);
}

export async function getParameterHistory(id: string): Promise<AuditLog[]> {
  const res = await masterDataApi.get(`/parameters/${id}/history`);
  return res.data;
}

export async function submitParameterForApproval(id: string, justification: string): Promise<{ requestId: string }> {
  const res = await coreApi.post(`/parameters/${id}/submit`, { justification });
  return res.data;
}

// ===== PARAMETER WEIGHTAGES =====
export async function getAllParameterWeightages(): Promise<ParameterWeightage[]> {
  const res = await masterDataApi.get('/parameter-weightages');
  return res.data;
}

export async function fetchParameterWeightages(parameterCode?: string): Promise<ParameterWeightage[]> {
  const params: any = {};
  if (parameterCode) params.parameterCode = parameterCode;
  const res = await masterDataApi.get('/parameter-weightages', { params });
  return res.data;
}

export async function createParameterWeightage(weightage: ParameterWeightage): Promise<ParameterWeightage> {
  const res = await masterDataApi.post('/parameter-weightages', weightage);
  return res.data;
}

export async function updateParameterWeightage(id: string, weightage: ParameterWeightage): Promise<ParameterWeightage> {
  const res = await masterDataApi.put(`/parameter-weightages/${id}`, weightage);
  return res.data;
}

export async function deleteParameterWeightage(id: string): Promise<void> {
  await masterDataApi.delete(`/parameter-weightages/${id}`);
}

export async function getParameterWeightageHistory(id: string): Promise<AuditLog[]> {
  const res = await masterDataApi.get(`/parameter-weightages/${id}/history`);
  return res.data;
}

export async function submitParameterWeightageForApproval(id: string, justification: string): Promise<{ requestId: string }> {
  const res = await coreApi.post(`/parameter-weightages/${id}/submit`, { justification });
  return res.data;
}

export async function upsertParameterWeightage(weightage: ParameterWeightage): Promise<ParameterWeightage> {
  const res = await masterDataApi.post('/parameter-weightages/upsert', weightage);
  return res.data;
}

// ===== PARAMETER BANDS =====
export async function getAllParameterBands(): Promise<ParameterBand[]> {
  const res = await masterDataApi.get('/parameter-bands');
  return res.data;
}

export async function fetchParameterBands(parameterCode?: string): Promise<ParameterBand[]> {
  const params: any = {};
  if (parameterCode) params.parameterCode = parameterCode;
  const res = await masterDataApi.get('/parameter-bands', { params });
  return res.data;
}

export async function createParameterBand(band: ParameterBand): Promise<ParameterBand> {
  const res = await masterDataApi.post('/parameter-bands', band);
  return res.data;
}

export async function updateParameterBand(parameterCode: string, bandCode: string, updates: Partial<ParameterBand>): Promise<ParameterBand> {
  const res = await masterDataApi.put(`/parameter-bands/${parameterCode}/${bandCode}`, updates);
  return res.data;
}

export async function deleteParameterBand(parameterCode: string, bandCode: string): Promise<void> {
  await masterDataApi.delete(`/parameter-bands/${parameterCode}/${bandCode}`);
}

export async function getParameterBandHistory(id: string): Promise<AuditLog[]> {
  const res = await masterDataApi.get(`/parameter-bands/${id}/history`);
  return res.data;
}

export async function submitParameterBandForApproval(id: string, justification: string): Promise<{ requestId: string }> {
  const res = await coreApi.post(`/parameter-bands/${id}/submit`, { justification });
  return res.data;
}

// ===== APPROVING AUTHORITIES =====
export async function fetchApprovingAuthorities(): Promise<ApprovingAuthority[]> {
  const res = await masterDataApi.get('/approving-authorities');
  return res.data;
}

export async function createApprovingAuthority(authority: Omit<ApprovingAuthority, 'id'>): Promise<ApprovingAuthority> {
  const res = await masterDataApi.post('/approving-authorities', authority);
  return res.data;
}

export async function updateApprovingAuthority(id: string, updates: Partial<ApprovingAuthority>): Promise<ApprovingAuthority> {
  const res = await masterDataApi.put(`/approving-authorities/${id}`, updates);
  return res.data;
}

export async function deactivateApprovingAuthority(id: string): Promise<void> {
  await masterDataApi.patch(`/approving-authorities/${id}/deactivate`);
}

// ===== MAPPINGS =====
export async function fetchLandClassMappings(districtCode?: string, circleCode?: string, mouzaCode?: string, villageCode?: string): Promise<LandClassMapping[]> {
  const params: any = {};
  if (districtCode) params.districtCode = districtCode;
  if (circleCode) params.circleCode = circleCode;
  if (mouzaCode) params.mouzaCode = mouzaCode;
  if (villageCode) params.villageCode = villageCode;
  const res = await masterDataApi.get('/land-class-mappings', { params });
  return res.data;
}

export async function createLandClassMapping(mapping: LandClassMapping): Promise<LandClassMapping> {
  const res = await masterDataApi.post('/land-class-mappings', mapping);
  return res.data;
}

export async function deleteLandClassMapping(landCategoryGenId: string, districtCode?: string, circleCode?: string, mouzaCode?: string, villageCode?: string): Promise<void> {
  await masterDataApi.delete('/land-class-mappings', { data: { landCategoryGenId, districtCode, circleCode, mouzaCode, villageCode } });
}

export async function fetchLandSubClassMappings(districtCode?: string, circleCode?: string, mouzaCode?: string, villageCode?: string): Promise<LandSubClassMapping[]> {
  const params: any = {};
  if (districtCode) params.districtCode = districtCode;
  if (circleCode) params.circleCode = circleCode;
  if (mouzaCode) params.mouzaCode = mouzaCode;
  if (villageCode) params.villageCode = villageCode;
  const res = await masterDataApi.get('/land-sub-class-mappings', { params });
  return res.data;
}

export async function createLandSubClassMapping(mapping: LandSubClassMapping): Promise<LandSubClassMapping> {
  const res = await masterDataApi.post('/land-sub-class-mappings', mapping);
  return res.data;
}

export async function deleteLandSubClassMapping(landSubClassCode: string, districtCode?: string, circleCode?: string, mouzaCode?: string, villageCode?: string): Promise<void> {
  await masterDataApi.delete('/land-sub-class-mappings', { data: { landSubClassCode, districtCode, circleCode, mouzaCode, villageCode } });
}

// ===== CIRCLE LOT FACTOR =====
export async function fetchCircleLotFactor(request: CircleLotFactorRequest): Promise<CircleLotFactorResponse> {
  const res = await masterDataApi.get('/circle-lot-factor', { params: request });
  return res.data;
}

export async function saveCircleLotFactor(districtCode: string, circleCode: string, lotCode: string, factor: number, daagNumber?: string): Promise<void> {
  await masterDataApi.post('/circle-lot-factor', { districtCode, circleCode, lotCode, factor, daagNumber });
}

export async function getCircleLotFactorHistory(districtCode: string, circleCode: string, lotCode: string): Promise<AuditLog[]> {
  const res = await masterDataApi.get('/circle-lot-factor/history', { params: { districtCode, circleCode, lotCode } });
  return res.data;
}

// ===== CONVERSION FACTORS =====
export async function fetchConversionFactors(landCategoryGenId?: string, areaType?: 'RURAL' | 'URBAN'): Promise<any[]> {
  const params: any = {};
  if (landCategoryGenId) params.landCategoryGenId = landCategoryGenId;
  if (areaType) params.areaType = areaType;
  const res = await masterDataApi.get('/conversion-factors', { params });
  return res.data;
}

export async function saveConversionFactor(landCategoryGenId: string, areaType: 'RURAL' | 'URBAN', factor: number): Promise<void> {
  await masterDataApi.post('/conversion-factors', { landCategoryGenId, areaType, factor });
}

export async function getConversionFactorHistory(landCategoryGenId: string, areaType: 'RURAL' | 'URBAN'): Promise<AuditLog[]> {
  const res = await masterDataApi.get('/conversion-factors/history', { params: { landCategoryGenId, areaType } });
  return res.data;
}

// ===== CALCULATIONS =====


// ===== VALUATION SERVICES =====

export async function calculatePlotBaseValue(payload: ComprehensiveValuationRequest): Promise<any> {
  const res = await masterDataApi.post('/valuation/calculate', payload);
  return res.data;
}

// ===== CHANGE REQUEST WORKFLOWS =====
export async function submitChangeRequest(request: ChangeRequest): Promise<{ requestId: string }> {
  const res = await coreApi.post('/change-requests', request);
  return res.data;
}

export async function requestEntityChange(request: ChangeRequest): Promise<{ requestId: string }> {
  return submitChangeRequest(request);
}

// Added: Bulk deactivate districts
export async function bulkDeactivateDistricts(ids: string[], reason: string): Promise<void> {
  await masterDataApi.post('/districts/bulk-deactivate', { ids, reason });
}

export async function bulkDeactivateCircles(ids: string[], reason: string): Promise<void> {
  await masterDataApi.post('/circles/bulk-deactivate', { ids, reason });
}

export async function bulkDeactivateLandClasses(ids: string[], reason: string): Promise<void> {
  await masterDataApi.post('/land-classes/bulk-deactivate', { ids, reason });
}

export async function bulkDeactivateLandSubClasses(ids: string[], reason: string): Promise<void> {
  await masterDataApi.post('/land-sub-classes/bulk-deactivate', { ids, reason });
}

export async function fetchChangeRequests(entityType?: string, status?: 'PENDING' | 'APPROVED' | 'REJECTED'): Promise<any[]> {
  const params: any = {};
  if (entityType) params.entityType = entityType;
  if (status) params.status = status;
  const res = await coreApi.get('/change-requests', { params });
  return res.data;
}

export async function approveChangeRequest(requestId: string, comment?: string): Promise<void> {
  await coreApi.post(`/change-requests/${requestId}/approve`, { comment });
}

export async function rejectChangeRequest(requestId: string, reason: string): Promise<void> {
  await coreApi.post(`/change-requests/${requestId}/reject`, { reason });
}

export async function getEntityHistory(entityType: string, entityId: string): Promise<AuditLog[]> {
  const res = await coreApi.get('/audit/history', { params: { entityType, entityId } });
  return res.data;
}

export async function getAuditLogs(entityType?: string, fromDate?: string, toDate?: string, performedBy?: string): Promise<AuditLog[]> {
  const params: any = {};
  if (entityType) params.entityType = entityType;
  if (fromDate) params.fromDate = fromDate;
  if (toDate) params.toDate = toDate;
  if (performedBy) params.performedBy = performedBy;
  const res = await coreApi.get('/audit/logs', { params });
  return res.data;
}

// Generic functions for CRUD components with approval workflow
export async function requestChange(entityType: string, operation: 'CREATE' | 'UPDATE' | 'DEACTIVATE', payload: any, reason: string): Promise<{ requestId: string }> {
  const request: ChangeRequest = {
    entityType,
    entityId: payload.id || payload.code,
    operation,
    payload,
    reason
  };
  return requestEntityChange(request);
}

export async function getHistory(entityType: string, entityId: string): Promise<AuditLog[]> {
  return getEntityHistory(entityType, entityId);
}