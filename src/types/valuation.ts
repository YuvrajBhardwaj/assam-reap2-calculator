export type UUID = string;

export type AreaType = 'RURAL' | 'URBAN';

export interface AuditEntry {
  id: UUID;
  entityType: 'GEO_FACTOR' | 'CONVERSION_FACTOR' | 'DISTRICT_BASE' | 'PLOT_BASE' | 'PARAMETER' | 'FORMULA' | 'PLOT' | 'ALERT' | 'GEO_ATTR';
  entityKey: string; // e.g., "DISTRICT|CIRCLE|LOT" or "LAND_CLASS|AREA_TYPE"
  action: 'CREATE' | 'UPDATE' | 'DEACTIVATE' | 'APPROVE' | 'REJECT';
  performedBy: string;  // loginId or userId
  timestamp: string;    // ISO date
  details?: Record<string, unknown>;
}

export interface CircleLotIdentifier {
  districtCode: string;
  circleCode: string;
  lotCode: string;
}

export interface CircleLotFactor extends CircleLotIdentifier {
  factor: number;
  source: 'EXISTING' | 'DERIVED_AVERAGE';
  effectiveFrom?: string; // ISO date
  parents?: Array<CircleLotIdentifier & { factor: number }>;
}

export interface CircleLotFactorChangeRequest extends CircleLotIdentifier {
  requestedFactor: number;
  reason: string;
}

export interface ConversionFactorKey {
  landCategoryGenId: string;
  areaType: AreaType;
}

export interface ConversionFactor extends ConversionFactorKey {
  factor: number;
  effectiveFrom?: string; // ISO date
}

export interface ConversionFactorChangeRequest extends ConversionFactorKey {
  requestedFactor: number;
  reason: string;
}

export interface DistrictBase {
  districtCode: string;
  baseValue: number; // Minimum Zonal Value in the district
  effectiveFrom?: string;
}

export interface PlotValuationInput {
  districtBase: number;
  geographicalFactor: number;
  conversionFactor: number;
}

export interface PlotValuationResult extends PlotValuationInput {
  plotBaseValue: number; // District Base x Geographical Factor x Conversion Factor
}

// Alerts and versioning

export interface AlertConfig {
  entity: 'DISTRICT_BASE' | 'GEO_FACTOR' | 'CONVERSION_FACTOR' | 'FORMULA';
  maxStaleDays: number; // threshold for generating alerts
}

export interface StaleStatus {
  key: string;         // e.g., districtCode or composite key
  lastUpdatedAt: string | null;
  isStale: boolean;
  daysSinceUpdate?: number;
}

export interface DistrictBaseVersion extends DistrictBase {
  version: number;
  changedAt: string;
  changedBy: string;
  approvalRef?: string;
}

// GIS and plots

export interface PlotIdentifier {
  districtCode: string;
  circleCode: string;
  mouzaCode?: string;
  lotCode: string;
  dagNo: string;
  plotId: string; // canonical unique plot id
}

export type GeoLocationSource = 'GIS' | 'MANUAL';

export interface PlotGeoAttributes {
  plotId: string;
  distances?: {
    toMainRoad?: number;           // meters
    toMarket?: number;             // meters
    toHigherEducation?: number;    // meters
    toHospital?: number;           // meters
  };
  coordinates?: { lat: number; lng: number };
  source: GeoLocationSource;
  updatedAt: string;
}

// Bifurcation / Merger

export interface BifurcationRequest {
  parent: PlotIdentifier;
  subPlots: Array<{ area: number; shape?: string; proposedPlotId?: string }>;
  reason: string;
}

export interface MergeRequest {
  plots: PlotIdentifier[];
  reason: string;
}

export interface PlotRelation {
  parentPlotId?: string;
  childPlotId?: string;
  relation: 'BIFURCATED_FROM' | 'MERGED_FROM';
  createdAt: string;
}

// Parameters

export type ParameterFactorType = 'PERCENTAGE' | 'FIXED_AMOUNT';
export type ParameterCategory = 'DEPRECIATION' | 'TEMPORARY_APPRECIATION' | 'OTHER';

export interface ValuationParameter {
  code: string;
  name: string;
  description?: string;
  factorType: ParameterFactorType;
  category?: ParameterCategory;
  isActive: boolean;
  expiryDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ParameterBandDefinition {
  parameterCode: string;
  bandCode: string;
  label: string;
  minValue?: number;
  maxValue?: number;
}

export interface ParameterWeightageByArea {
  parameterCode: string;
  bandCode: string;
  districtCode: string;
  areaType: AreaType;
  weightage: number;
}

export interface ParameterChangeRequest {
  parameterCode: string;
  changeType: 'CREATE' | 'UPDATE' | 'DEACTIVATE';
  payload: Partial<ValuationParameter> & {
    bands?: ParameterBandDefinition[];
    weightages?: ParameterWeightageByArea[];
  };
  reason: string;
}

// Formulas (versioned)

export interface FormulaScope {
  areaType?: AreaType;
  landClassCode?: string;
  districtCode?: string;
}

export interface ValuationFormulaDefinition {
  id: UUID;
  name: string;
  scope: FormulaScope;
  expression: string; // backend-validated expression
  version: number;
  effectiveFrom: string;
  expiresAt?: string;
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'ACTIVE' | 'DEPRECATED';
  createdBy?: string;
  createdAt?: string;
}

export interface FormulaSimulationInput {
  plotId: string;
  expression?: string; // override for ad-hoc simulation
  formulaId?: UUID;
  districtBase: number;
  geographicalFactor: number;
  conversionFactor: number;
  parameterValues: Record<string, number>; // resolved values per parameter
}

export interface FormulaSimulationResult {
  plotId: string;
  computedValue: number;
  breakdown?: Record<string, number>;
  usedFormula?: { id?: UUID; version?: number };
}

export interface ComprehensiveValuationRequest {
  jurisdictionInformation: {
    districtCode: string;
    circleCode: string;
    mouzaCode: string;
    villageCode?: string;
    lotCode: string;
    plotNo?: string;
    currentLandUse: string;
  };
  landTypeDetails: {
    currentLandType: string;
    landUseChange: boolean;
    newLandCategoryType?: string;
    areaType: 'RURAL' | 'URBAN';
    areaDetails: {
      totalLessa: number;
    };
  };
  plotLandDetails: {
    selectedSubParameterCodes: any[];
    locationMethod: 'manual' | 'gis';
    onRoad: boolean;
    cornerPlot: boolean;
    litigatedPlot: boolean;
    hasTenant: boolean;
    roadWidth?: number;
    distanceFromRoad?: number | null;
    selectedParameterIds?: string[];
  };
  structureDetails?: {
    structureType: string;
    constructionYear: number;
    totalFloors: number;
    builtUpArea: number;
    structureCondition: string;
    structureAge: number;
  };
}