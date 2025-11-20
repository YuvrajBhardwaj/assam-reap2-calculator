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
  await masterDataApi.post(`/delete/district?districtCode=${districtCode}`);
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
  const res = await masterDataApi.post('/add/circle', { circleName: circle.name, districtCode: circle.districtCode });
  return res.data;
}

export async function updateCircle(id: string, updates: Partial<Circle>): Promise<Circle> {
  const res = await masterDataApi.post('/update/circle', { circleCode: id, circleName: updates.name, districtCode: updates.districtCode });
  return res.data;
}

export async function deactivateCircle(id: string): Promise<void> {
  await masterDataApi.post(`/delete/circle?circleCode=${id}`);
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
export async function fetchLots(
  districtCode?: string,
  circleCode?: string,
  mouzaCode?: string
): Promise<Lot[]> {

  if (!districtCode || !circleCode || !mouzaCode) {
    return [];
  }

  try {
    const params = { districtCode, circleCode, mouzaCode };

    const res = await masterDataApi.get(
      '/getLotByDistrictAndCircleAndMouza',
      { params }
    );

    // Payload normalization
    const raw = Array.isArray(res?.data?.data)
      ? res.data.data
      : [];

    const lots: Lot[] = raw.map((lot: any): Lot => ({
      id: String(lot.lotGenId ?? ''),
      code: lot.lotCode ?? '',
      name: lot.lotName ?? '',
      districtCode: lot.districtCode ?? districtCode,
      circleCode: lot.circleCode ?? circleCode,
      mouzaCode: lot.mouzaCode ?? mouzaCode,
      isActive: lot.active ?? true,
      createdAt: lot.createdDtm ?? '',
      updatedAt: lot.updatedDtm ?? '',
      basePriceIncreaseLot: lot.basePriceIncreaseLot ?? 0,
    })).filter((lot) => lot.code && lot.name);

    // Remove duplicates if backend returns redundant rows
    const uniqueLots = lots.filter(
      (lot, index, self) =>
        index === self.findIndex(
          (x) => x.code === lot.code && x.name === lot.name
        )
    );

    return uniqueLots;
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
    const lots = raw.map((lot: any) => ({
      id: (lot.lotGenId ?? lot.id ?? '').toString(),
      code: lot.lotCode ?? lot.code ?? '',
      name: lot.lotName ?? lot.name ?? '',
      districtCode: lot.districtCode ?? districtCode,
      circleCode: lot.circleCode ?? circleCode,
      mouzaCode: lot.mouzaCode ?? '',
      isActive: lot.active ?? lot.isActive ?? true,
      createdAt: lot.createdDtm ?? lot.createdAt ?? '',
      updatedAt: lot.updatedDtm ?? lot.updatedAt ?? '',
      basePriceIncreaseLot: lot.basePriceIncreaseLot ?? 0,
    })).filter((l: Lot) => l.code && l.name);

    // Deduplicate lots by name and code
    return lots.filter((lot, index, self) =>
      index === self.findIndex((l) => l.name === lot.name && l.code === lot.code)
    );
  } catch (err) {
    console.error('Failed to fetch lots by district & circle', { districtCode, circleCode, err });
    return [];
  }
}

export async function createLot(lot: any): Promise<Lot> {
  const res = await masterDataApi.post('/add/lot', lot);
  return res.data;
}

export async function updateLot(id: string, updates: any): Promise<Lot> {
  const res = await masterDataApi.post('/update/lot', { lotCode: updates.lotCode, ...updates });
  return res.data;
}

export async function deactivateLot(id: string): Promise<void> {
  await masterDataApi.post(`/delete/lot?lotCode=${id}`);
}

// ===== VILLAGE MANAGEMENT =====
export async function createVillage(village: any): Promise<Village> {
  const payload = {
    districtCode: village.districtCode,
    circleCode: village.circleCode,
    mouzaCode: village.mouzaCode,
    lotCode: village.lotCode,
    villageName: village.villageName || village.name,
    areaType: village.areaType
  };
  console.log('createVillage API payload:', payload);
  const res = await masterDataApi.post('/add/village', payload);
  return res.data;
}

export async function updateVillage(id: string, updates: any): Promise<Village> {
  const payload = {
    villageCode: id,
    districtCode: updates.districtCode,
    circleCode: updates.circleCode,
    mouzaCode: updates.mouzaCode,
    lotCode: updates.lotCode,
    villageName: updates.villageName || updates.name,
    areaType: updates.areaType
  };
  console.log('updateVillage API payload:', payload);
  const res = await masterDataApi.post('/update/village', payload);
  return res.data;
}

export async function deactivateVillage(id: string): Promise<void> {
  await masterDataApi.post(`/delete/village?villageCode=${id}`);
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
  const res = await masterDataApi.post('/add/landCategory', {
    landCategoryGenId: landClass.landCategoryGenId,
    landCategoryName: landClass.landCategoryName,
    code: landClass.code,
    name: landClass.name,
    description: landClass.description,
    baseRate: landClass.baseRate,
    reason: landClass.reasonForRequest,
    isActive: landClass.isActive,
  });
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

export async function getAllLandCategoriesByMouza(mouzaCode: string): Promise<LandClass[]> {
  try {
    const res = await masterDataApi.get(`/getAllLandCategoriesByMouza?mouzaCode=${mouzaCode}`);
    const items = Array.isArray(res?.data?.data) ? res.data.data : Array.isArray(res?.data) ? res.data : [];
    return items.map((lc: any) => ({
      id: (lc.landCategoryGenId ?? lc.id ?? '').toString(),
      code: lc.landCategoryGenId?.toString() ?? lc.code ?? '',
      name: lc.landCategoryName ?? lc.name ?? '',
      isActive: lc.active ?? lc.isActive ?? true,
      landCategoryGenId: lc.landCategoryGenId,
      landCategoryName: lc.landCategoryName,
      active: lc.active,
      createdBy: lc.createdBy,
      createdDtm: lc.createdDtm,
      updatedBy: lc.updatedBy,
      updatedDtm: lc.updatedDtm,
      status: lc.status,
      statusCode: lc.statusCode,
      basePriceMouzaIncrease: lc.basePriceMouzaIncrease ?? 0,
    }));
  } catch (err) {
    console.error('Failed to fetch land categories by mouza', { mouzaCode, err });
    return [];
  }
}

// ===== AREA TYPE MANAGEMENT =====
export async function fetchAreaTypes(): Promise<{ data: any[] }> {
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

export async function updateAreaType(id: string, data: Partial<any>): Promise<any> {
  const res = await masterDataApi.post('/update/areaType', { areaTypesGenId: id, ...data });
  return res.data;
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
  const res = await masterDataApi.get('/getParameterDetailsAll');
  const rawData = res.data.data || []; // Assuming the structure { message: "", data: [...] }
  return rawData.map((item: any) => ({
    id: item.parameterGenId?.toString() || '',
    code: item.parameterCode || '',
    name: item.parameterName || '',
    isActive: item.active ?? false,
    createdAt: item.createdDtm || '',
    updatedAt: item.updatedDtm || '',
    createdBy: item.createdBy || '',
    updatedBy: item.updatedBy || '',
    category: 'Default', // Placeholder, as not in JSON
    dataType: 'String', // Placeholder, as not in JSON
    isMandatory: false, // Placeholder, as not in JSON
    effectiveFrom: item.createdDtm || '', // Using createdDtm as effectiveFrom
  }));
}

export async function fetchParametersWithDetails(): Promise<Parameter[]> {
  const res = await masterDataApi.get('/parameters/details');
  return res.data;
}

export async function createParameter(parameter: { parameterName: string }): Promise<Parameter> {
  const res = await masterDataApi.post('/add/parameter', parameter);
  return res.data;
}

export async function updateParameter(id: string, updates: { parameterName: string; parameterCode: string }): Promise<Parameter> {
  const res = await masterDataApi.post('/update/parameter', { ...updates, parameterCode: id });
  return res.data;
}

export async function deleteParameter(id: string): Promise<void> {
  await masterDataApi.post(`/delete/parameter?parameterCode=${id}`);
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
  // Note: No direct endpoint; fetch via parameters and their bands
  try {
    const parameters = await getAllParameters();
    const allBands: ParameterBand[] = [];
    for (const param of parameters) {
      const bands = await fetchParameterBands(param.code);
      allBands.push(...bands);
    }
    return allBands;
  } catch (err) {
    console.error('Failed to fetch all parameter bands', err);
    return [];
  }
}

export async function fetchParameterBands(parameterCode?: string): Promise<ParameterBand[]> {
  if (!parameterCode) {
    return [];
  }
  try {
    const res = await masterDataApi.get(`/getSubParameterDetailsAllByParameterCode?parameterCode=${parameterCode}`);
    // Normalize payload
    const raw = Array.isArray(res?.data?.data)
      ? res.data.data
      : Array.isArray(res?.data)
        ? res.data
        : [];
    return raw.map((band: any) => ({
      id: (band.subParameterCode ?? band.id ?? '').toString(),
      parameterCode: band.parameterCode ?? parameterCode,
      name: band.subParameterName ?? band.name ?? '',
      subParameterName: band.subParameterName ?? band.name ?? '',
      weightage: parseFloat(band.weightage ?? '0'),
      effectiveFrom: band.effectiveFrom ?? '',
      isActive: band.active ?? band.isActive ?? true,
      createdAt: band.createdDtm ?? band.createdAt ?? '',
      updatedAt: band.updatedDtm ?? band.updatedAt ?? '',
    }));
  } catch (err) {
    console.error('Failed to fetch parameter bands', { parameterCode, err });
    return [];
  }
}

export async function createParameterBand(band: ParameterBand): Promise<ParameterBand> {
  const payload = {
    parameterCode: band.parameterCode,
    subParameterName: band.subParameterName || band.name,
    weightage: band.weightage.toString(),
    effectiveFrom: band.effectiveFrom,
  };
  const res = await masterDataApi.post('/add/subParameter', payload);
  return {
    ...band,
    id: res.data?.subParameterCode?.toString() ?? '',
    ...res.data,
  };
}

export async function updateParameterBand(parameterCode: string, bandCode: string, updates: Partial<ParameterBand>): Promise<ParameterBand> {
  const payload = {
    parameterCode,
    subParameterCode: bandCode,
    subParameterName: updates.subParameterName || updates.name,
    weightage: updates.weightage?.toString(),
    effectiveFrom: updates.effectiveFrom,
  };
  const res = await masterDataApi.post('/update/subParameter', payload);
  return {
    parameterCode,
    id: bandCode,
    ...updates,
    ...res.data,
  };
}

export async function deleteParameterBand(parameterCode: string, bandCode: string): Promise<void> {
  await masterDataApi.post(`/delete/subParameter?subParameterCode=${bandCode}`);
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
// Commented out as unlisted in API design

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
// Commented out as unlisted in API design

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
// Commented out as unlisted in API design
/*
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
*/

// ===== CALCULATIONS =====


// ===== VALUATION SERVICES =====

export async function calculatePlotBaseValue(payload: ComprehensiveValuationRequest): Promise<any> {
  const res = await masterDataApi.post('/valuation/calculate', payload);
  // return res.data;
}

// ===== CHANGE REQUEST WORKFLOWS =====
// Commented out as unlisted in API design

export async function submitChangeRequest(request: ChangeRequest): Promise<{ requestId: string }> {
  const res = await coreApi.post('/change-requests', request);
  return res.data;
}

export async function requestEntityChange(request: ChangeRequest): Promise<{ requestId: string }> {
  return submitChangeRequest(request);
}


// ===== GEOLOCATION =====
// Commented out as unlisted in API design

export interface GeoLocation {
  lat: number;
  lng: number;
  displayName?: string;
}
import axios from 'axios';
export const geocodeDistrict = async (
  districtName: string
): Promise<GeoLocation | null> => {
  try {
    const encodedName = encodeURIComponent(`${districtName}, Assam, India`);
    const res = await axios.get(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodedName}&limit=1`
    );
    if (res.data && res.data.length > 0) {
      return {
        lat: parseFloat(res.data[0].lat),
        lng: parseFloat(res.data[0].lon),
        displayName: res.data[0].display_name,
      };
    }
    return null;
  } catch (err) {
    console.error('Geocoding failed:', err);
    return null;
  }
};
