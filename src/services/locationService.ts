import axios from 'axios';
import { masterDataApi } from './http';
import { District, Circle, Mouza, Village, LandClass, Lot } from '@/types/masterData';

export interface GeoLocation {
  lat: number;
  lng: number;
  displayName?: string;
}

// Helper to normalize array payloads coming from backend
function normalizeArray<T = any>(res: any): T[] {
  if (Array.isArray(res?.data?.data)) return res.data.data as T[];
  if (Array.isArray(res?.data)) return res.data as T[];
  return [] as T[];
}

// 1. Fetch all district details
export async function getAllDistricts(): Promise<District[]> {
  try {
    const res = await masterDataApi.get('/getAllDistrictDetails');
    const payload = (res?.data?.data ?? res?.data) as any[];
    const list = Array.isArray(payload) ? payload : [];
    return list.map((d: any) => ({
      id: (d.districtGenId?.toString?.() ?? d.districtCode ?? d.id ?? '').toString(),
      code: d.districtCode ?? '',
      name: d.districtName ?? d.name ?? '',
      districtName: d.districtName ?? d.name ?? '',
      isActive: d.active ?? d.isActive ?? true,
      districtGenId: Number(d.districtGenId ?? 0),
      createdBy: d.createdBy ?? '',
      createdDtm: d.createdDtm ?? '',
      updatedBy: d.updatedBy ?? '',
      updatedDtm: d.updatedDtm ?? '',
    }));
  } catch (err) {
    console.error('Failed to fetch districts', err);
    return [];
  }
}

// 2. Fetch circle details by district
export async function getCirclesByDistrict(districtCode?: string): Promise<Circle[]> {
  try {
    const params = districtCode ? { districtCode } : {};
    const res = await masterDataApi.get('/getCircleByDistrict', { params });
    const payload = (res?.data?.data ?? res?.data) as any[];
    const list = Array.isArray(payload) ? payload : [];
    return list.map((c: any) => ({
      id: (c.circleGenId?.toString?.() ?? c.circleCode ?? c.id ?? '').toString(),
      code: c.circleCode ?? '',
      name: c.circleName ?? c.name ?? '',
      circleName: c.circleName ?? c.name ?? '',
      isActive: c.active ?? c.isActive ?? true,
      circleGenId: Number(c.circleGenId ?? 0),
      districtCode: c.districtCode ?? districtCode ?? '',
      createdBy: c.createdBy ?? '',
      createdDtm: c.createdDtm ?? '',
      updatedBy: c.updatedBy ?? '',
      updatedDtm: c.updatedDtm ?? '',
    }));
  } catch (err) {
    console.error('Failed to fetch circles', { districtCode, err });
    return [];
  }
}

// 3. Fetch mouza details by district and circle
export async function getMouzasByDistrictAndCircle(districtCode?: string, circleCode?: string): Promise<Mouza[]> {
  try {
    const params: any = {};
    if (districtCode) params.districtCode = districtCode;
    if (circleCode) params.circleCode = circleCode;

    const res = await masterDataApi.get('/getMouzaDetailsByDistrictAndCircle', { params });

    const payload = (res?.data?.data ?? res?.data) as any[];
    const list = Array.isArray(payload) ? payload : [];

    return list.map((m: any) => ({
      id: (m.mouzaGenId?.toString?.() ?? m.mouzaCode ?? m.id ?? '').toString(),
      code: m.mouzaCode ?? '',
      name: m.mouzaName ?? m.name ?? '',
      mouzaName: m.mouzaName ?? m.name ?? '',
      isActive: m.active ?? m.isActive ?? true,
      districtCode: m.districtCode ?? districtCode ?? '',
      circleCode: m.circleCode ?? circleCode ?? '',
      areaTypeId: m.areaTypeId ?? m.areaType ?? undefined,
      basePriceMouza: m.basePriceMouza ?? null,
    }));
  } catch (err) {
    console.error('Failed to fetch mouzas', { districtCode, circleCode, err });
    return [];
  }
}


// 3. Fetch lot details by district, circle, and mouza
export async function getLotsByDistrictAndCircleAndMouza(
  districtCode?: string,
  circleCode?: string,
  mouzaCode?: string
): Promise<Lot[]> {
  try {
    const params: any = {};
    if (districtCode) params.districtCode = districtCode;
    if (circleCode) params.circleCode = circleCode;
    if (mouzaCode) params.mouzaCode = mouzaCode;

    const res = await masterDataApi.get('/getLotByDistrictAndCircleAndMouza', { params });

    const payload = (res?.data?.data ?? res?.data) as any[];
    const list = Array.isArray(payload) ? payload : [];

    return list.map((l: any) => ({
      id: (l.lotGenId?.toString?.() ?? l.lotCode ?? l.id ?? '').toString(),
      code: l.lotCode ?? '',
      name: l.lotName ?? l.name ?? '',
      lotName: l.lotName ?? l.name ?? '',
      isActive: l.active ?? l.isActive ?? true,
      districtCode: l.districtCode ?? districtCode ?? '',
      circleCode: l.circleCode ?? circleCode ?? '',
      mouzaCode: l.mouzaCode ?? mouzaCode ?? '',
      areaTypeId: l.areaTypeId ?? l.areaType ?? undefined,
      basePriceIncreaseLot: l.basePriceIncreaseLot ?? null,
    }));
  } catch (err) {
    console.error('Failed to fetch lots', { districtCode, circleCode, mouzaCode, err });
    return [];
  }
}

// 4. Fetch village details by district, circle, mouza, and lot
export async function getVillagesByDistrictAndCircleAndMouzaAndLot(
  districtCode?: string,
  circleCode?: string,
  mouzaCode?: string,
  lotCode?: string
): Promise<Village[]> {
  try {
    // Require all necessary filters
    if (!districtCode || !circleCode || !mouzaCode || !lotCode) {
      return [];
    }

    // IMPORTANT: backend expects "mauzaCode"
    const params = {
      districtCode,
      circleCode,
      mauzaCode: mouzaCode,
      lotCode
    };

    const res = await masterDataApi.get(
      "/getVillageByDistrictAndCircleAndMauzaAndLot",
      { params }
    );

    // Normalize payload like your other services
    const payload = Array.isArray(res?.data?.data)
      ? res.data.data
      : Array.isArray(res?.data)
      ? res.data
      : [];

  return payload.map((village: any) => ({
      id: (village.villageGenId ?? "").toString(),
      code: village.villageCode ?? "",
      name: village.villageName ?? "",
      villageName: village.villageName ?? "",
      districtCode: village.districtCode ?? districtCode,
      circleCode: village.circleCode ?? circleCode,
      mouzaCode: village.mouzaCode ?? mouzaCode,
      lotCode: village.lotCode ?? lotCode,
      isActive: village.active ?? true,
      isUrban: village.areaType === "Urban",
      areaType: village.areaType === "Urban" ? 'URBAN' : 'RURAL',
      landCategory: village.landCategory ?? undefined,
      basePriceVillage: village.basePriceVillage ?? 0,
      createdAt: village.createdDtm ?? "",
      updatedAt: village.updatedDtm ?? "",
    }));
  } catch (err) {
    console.error("Failed to fetch villages", { districtCode, circleCode, mouzaCode, lotCode, err });
    return [];
  }
}




// 5. Fetch all land categories
export async function getAllLandCategories(): Promise<LandClass[]> {
  try {
    const res = await masterDataApi.get('/getAllLandsCategoryDetails');
    const items = normalizeArray<any>(res);
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
    console.error('Failed to fetch land categories', err);
    return [];
  }
}

// 6. Fetch Zonal Values
export const getZonalValues = async (
  districtCode: string,
  circleCode: string,
  mouzaCode: string
): Promise<any[]> => {
  try {
    const res = await masterDataApi.get(`/getZonalValues`, { params: { districtCode, circleCode, mouzaCode } });
    return normalizeArray<any>(res);
  } catch (err) {
    console.error('Failed to fetch zonal values', { districtCode, circleCode, mouzaCode, err });
    return [];
  }
};

// 7. Geocode district name to lat/lng using OpenStreetMap
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

// 8. Fetch plot numbers by district, circle, mouza, lot, and village
export async function getPlotNumbersByLocation(
  districtCode?: string,
  circleCode?: string,
  mouzaCode?: string,
  lotCode?: string,
  villageCode?: string
): Promise<Array<{ id: string; code: string; name: string; plotNumber: string; daagNumber: string }>> {
  try {
    const params: any = {};
    if (districtCode) params.districtCode = districtCode;
    if (circleCode) params.circleCode = circleCode;
    if (mouzaCode) params.mouzaCode = mouzaCode;
    if (lotCode) params.lotCode = lotCode;
    if (villageCode) params.villageCode = villageCode;

    const res = await masterDataApi.get('/getPlotNumbersByLocation', { params });
    
    const payload = (res?.data?.data ?? res?.data) as any[];
    const list = Array.isArray(payload) ? payload : [];

    return list.map((plot: any) => ({
      id: (plot.plotGenId?.toString?.() ?? plot.id ?? '').toString(),
      code: plot.plotCode ?? plot.daagNumber ?? '',
      name: plot.plotNumber ?? plot.daagNumber ?? plot.plotName ?? 'Plot ' + (plot.plotNumber ?? plot.daagNumber ?? ''),
      plotNumber: plot.plotNumber ?? '',
      daagNumber: plot.daagNumber ?? '',
    }));
  } catch (err) {
    console.error('Failed to fetch plot numbers', { districtCode, circleCode, mouzaCode, lotCode, villageCode, err });
    return [];
  }
}
