import { coreApi } from './http';
import { computePlotBaseValue, getDistrictBase, getConversionFactor } from './valuationService';
import { autoAssignGeographicalFactor, GeographicalFactor, getGeographicalFactor as getCircleLotFactor } from './factorService';
import { DistrictBase, ConversionFactor, PlotValuationInput, PlotValuationResult, AreaType } from '@/types/valuation';
import { CircleLotFactorResponse } from '@/types/masterData';

// Enhanced Plot Base Value Calculation Interface
export interface PlotBaseValueRequest {
  districtCode: string;
  circleCode: string;
  lotCode: string;
  landCategoryGenId: string; // Changed from landClassCode
  areaType: AreaType;
  daagNumber?: string;
  plotArea?: number;
  plotUnit?: string;
}

export interface PlotBaseValueResponse {
  districtBase: number;
  geographicalFactor: number;
  conversionFactor: number;
  plotBaseValue: number;
  plotBaseValuePerUnit?: number;
  calculation: string;
  effectiveDate: string;
  factors: {
    districtBaseDetails: DistrictBase;
    geographicalFactorDetails: CircleLotFactorResponse;
    conversionFactorDetails: ConversionFactor;
  };
  breakdown: {
    formula: string;
    step1: string;
    step2: string;
    finalResult: string;
  };
}

export interface PlotValueHistory {
  id: string;
  plotId?: string;
  districtCode: string;
  circleCode: string;
  lotCode: string;
  landClassCode: string;
  areaType: AreaType;
  plotBaseValue: number;
  calculatedAt: string;
  calculatedBy: string;
  factors: PlotBaseValueResponse['factors'];
}

// ===== CORE CALCULATION FUNCTIONS =====

/**
 * Calculate plot base value using the formula:
 * Plot Base Value = District Base (min zonal value) × Geographical Factor (Circle-Lot) × Conversion Factor
 */
export async function calculatePlotBaseValue(request: PlotBaseValueRequest): Promise<PlotBaseValueResponse> {
  try {
    // Fetch all required factors concurrently
    const [districtBase, geographicalFactor, conversionFactor] = await Promise.all([
      getDistrictBase(request.districtCode),
      getCircleLotFactor(
        request.districtCode,
        request.circleCode,
        request.lotCode,
        request.daagNumber // Pass daagNumber directly (undefined is fine if not provided)
      ),
      getConversionFactor({
        landCategoryGenId: request.landCategoryGenId,
        areaType: request.areaType
      })
    ]);

    // Handle null geographicalFactor by auto-assigning
    const effectiveGeographicalFactor = geographicalFactor ?? await autoAssignGeographicalFactor(
      request.districtCode,
      request.circleCode,
      request.lotCode
    );

    // Perform the calculation
    const calculationInput: PlotValuationInput = {
      districtBase: districtBase.baseValue,
      geographicalFactor: effectiveGeographicalFactor.factor,
      conversionFactor: conversionFactor.factor
    };

    const result = computePlotBaseValue(calculationInput);

    // Calculate per-unit value if plot area is provided
    let plotBaseValuePerUnit: number | undefined;
    if (request.plotArea && request.plotArea > 0) {
      plotBaseValuePerUnit = result.plotBaseValue / request.plotArea;
    }

    // Build calculation breakdown
    const breakdown = {
      formula: "Plot Base Value = District Base × Geographical Factor × Conversion Factor",
      step1: `District Base = ₹${districtBase.baseValue.toLocaleString()}`,
      step2: `Geographical Factor = ${effectiveGeographicalFactor.factor} × Conversion Factor = ${conversionFactor.factor}`,
      finalResult: `Plot Base Value = ₹${districtBase.baseValue.toLocaleString()} × ${effectiveGeographicalFactor.factor} × ${conversionFactor.factor} = ₹${result.plotBaseValue.toLocaleString()}`
    };

    // Map GeographicalFactor to CircleLotFactorResponse
    const mapToCircleLotFactorResponse = (factor: GeographicalFactor): CircleLotFactorResponse => ({
      factor: factor.factor,
      source: factor.source === 'AUTO_AVERAGE' ? 'DERIVED_AVERAGE' : 'EXISTING',
      parents: factor.parentFactors
    });

    const response: PlotBaseValueResponse = {
      districtBase: districtBase.baseValue,
      geographicalFactor: effectiveGeographicalFactor.factor,
      conversionFactor: conversionFactor.factor,
      plotBaseValue: result.plotBaseValue,
      plotBaseValuePerUnit,
      calculation: `₹${districtBase.baseValue.toLocaleString()} × ${effectiveGeographicalFactor.factor} × ${conversionFactor.factor} = ₹${result.plotBaseValue.toLocaleString()}`,
      effectiveDate: new Date().toISOString(),
      factors: {
        districtBaseDetails: districtBase,
        geographicalFactorDetails: mapToCircleLotFactorResponse(effectiveGeographicalFactor),
        conversionFactorDetails: conversionFactor
      },
      breakdown
    };

    return response;
  } catch (error) {
    throw new Error(`Failed to calculate plot base value: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Calculate plot base value on server-side (if backend provides enhanced calculation)
 */
export async function calculatePlotBaseValueOnServer(request: PlotBaseValueRequest): Promise<PlotBaseValueResponse> {
  const res = await coreApi.post('/plot-base-value/calculate', request);
  return res.data;
}

/**
 * Batch calculate plot base values for multiple plots
 */
export async function batchCalculatePlotBaseValues(requests: PlotBaseValueRequest[]): Promise<PlotBaseValueResponse[]> {
  const res = await coreApi.post('/plot-base-value/batch-calculate', { requests });
  return res.data;
}

// ===== HISTORY AND AUDIT =====

/**
 * Save plot value calculation for history tracking
 */
export async function savePlotValueCalculation(
  request: PlotBaseValueRequest, 
  result: PlotBaseValueResponse,
  plotId?: string
): Promise<string> {
  const payload = {
    ...request,
    plotId,
    plotBaseValue: result.plotBaseValue,
    factors: result.factors,
    calculatedAt: new Date().toISOString()
  };
  
  const res = await coreApi.post('/plot-base-value/history', payload);
  return res.data.id;
}

/**
 * Get plot value calculation history
 */
export async function getPlotValueHistory(plotId?: string, filters?: {
  districtCode?: string;
  circleCode?: string;
  lotCode?: string;
  fromDate?: string;
  toDate?: string;
}): Promise<PlotValueHistory[]> {
  const params = new URLSearchParams();
  
  if (plotId) params.append('plotId', plotId);
  if (filters?.districtCode) params.append('districtCode', filters.districtCode);
  if (filters?.circleCode) params.append('circleCode', filters.circleCode);
  if (filters?.lotCode) params.append('lotCode', filters.lotCode);
  if (filters?.fromDate) params.append('fromDate', filters.fromDate);
  if (filters?.toDate) params.append('toDate', filters.toDate);

  const res = await coreApi.get(`/plot-base-value/history?${params.toString()}`);
  return res.data;
}

// ===== VALIDATION AND UTILITIES =====

/**
 * Validate plot base value calculation inputs
 */
export function validatePlotBaseValueRequest(request: PlotBaseValueRequest): string[] {
  const errors: string[] = [];

  if (!request.districtCode?.trim()) {
    errors.push('District code is required');
  }
  
  if (!request.circleCode?.trim()) {
    errors.push('Circle code is required');
  }
  
  if (!request.lotCode?.trim()) {
    errors.push('Lot code is required');
  }
  
  if (!request.landCategoryGenId?.trim()) {
    errors.push('Land category ID is required');
  }
  
  if (!request.areaType || !['RURAL', 'URBAN'].includes(request.areaType)) {
    errors.push('Valid area type (RURAL/URBAN) is required');
  }

  if (request.plotArea !== undefined && request.plotArea <= 0) {
    errors.push('Plot area must be greater than 0');
  }

  return errors;
}

/**
 * Compare plot base values across different scenarios
 */
export async function comparePlotBaseValues(requests: PlotBaseValueRequest[]): Promise<{
  calculations: PlotBaseValueResponse[];
  comparison: {
    highest: PlotBaseValueResponse;
    lowest: PlotBaseValueResponse;
    average: number;
    variance: number;
  };
}> {
  const calculations = await Promise.all(
    requests.map(request => calculatePlotBaseValue(request))
  );

  const values = calculations.map(calc => calc.plotBaseValue);
  const highest = calculations.reduce((max, calc) => 
    calc.plotBaseValue > max.plotBaseValue ? calc : max
  );
  const lowest = calculations.reduce((min, calc) => 
    calc.plotBaseValue < min.plotBaseValue ? calc : min
  );
  const average = values.reduce((sum, val) => sum + val, 0) / values.length;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - average, 2), 0) / values.length;

  return {
    calculations,
    comparison: {
      highest,
      lowest,
      average,
      variance
    }
  };
}

// ===== REAL-TIME UPDATES =====

/**
 * Subscribe to factor updates that might affect plot base values
 */
export async function subscribeToFactorUpdates(callback: (update: {
  type: 'DISTRICT_BASE' | 'GEO_FACTOR' | 'CONVERSION_FACTOR';
  affectedAreas: string[];
  message: string;
}) => void): Promise<() => void> {
  // This would typically use WebSocket or Server-Sent Events
  // For now, return a mock unsubscribe function
  return () => {
    console.log('Unsubscribed from factor updates');
  };
}

/**
 * Check if plot base value needs recalculation due to factor updates
 */
export async function checkForUpdatedFactors(
  lastCalculated: string,
  districtCode: string,
  circleCode: string,
  lotCode: string,
  landClassCode: string,
  areaType: AreaType
): Promise<{
  needsUpdate: boolean;
  updatedFactors: string[];
  lastUpdated: string;
}> {
  const res = await coreApi.get('/plot-base-value/check-updates', {
    params: {
      lastCalculated,
      districtCode,
      circleCode,
      lotCode,
      landClassCode,
      areaType
    }
  });
  return res.data;
}