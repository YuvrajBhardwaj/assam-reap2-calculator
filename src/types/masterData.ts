// Domain entities and shared types for Master Data Management

export type UUID = string;

export interface AuditLog {
  id: UUID;
  entityType: string; // e.g. "LandClass", "SubClass", "District"
  entityId: UUID | string;
  action: 'CREATE' | 'UPDATE' | 'DEACTIVATE' | 'APPROVE' | 'REJECT' | 'MAP' | 'UNMAP';
  performedBy: string; // userId or loginId
  timestamp: string;   // ISO datetime
  details?: Record<string, unknown>;
}

export interface BaseEntity {
  id: UUID | string;
  code: string;
  name: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface District extends BaseEntity {
  districtGenId: number;
  createdBy: string;
  createdDtm: string;
  updatedBy: string;
  updatedDtm: string;
}

export interface SRO extends BaseEntity {
  districtCode: string;
}

export interface Circle extends BaseEntity {
  circleGenId: number;
  districtCode: string;
  createdBy: string;
  createdDtm: string;
  updatedBy: string;
  updatedDtm: string;
}

// Map Circle properties to BaseEntity
export function mapCircleToBaseEntity(circle: Circle): Circle {
  return {
    ...circle,
    id: circle.circleGenId.toString(),
    code: circle.code,
    name: circle.name,
    isActive: circle.isActive
  };
}

export interface Mouza extends BaseEntity {
  districtCode: string;
  circleCode: string;
  areaTypeId?: string;
}

export interface Lot extends BaseEntity {
  districtCode: string;
  circleCode: string;
  mouzaCode: string;
  areaTypeId?: string;
}

export interface Village extends BaseEntity {
  districtCode: string;
  circleCode: string;
  mouzaCode: string;
  isUrban: boolean;
}

export interface Zone extends BaseEntity {}

export interface LandClass extends BaseEntity {
  landCategoryGenId: number;
  landCategoryName: string;
  createdBy?: string;
  createdDtm?: string;
  updatedBy?: string;
  updatedDtm?: string;
  status?: any;
  statusCode?: any;
  reasonForRequest?: string;
  description?: string;
  baseRate?: number;
}

export interface LandSubClass extends BaseEntity {
  parentClassCode: string; // LandClass.code
}

export interface Parameter extends BaseEntity {
  category: string;
  dataType: string;
  unit?: string;
  description?: string;
  formula?: string;
  minValue?: number;
  maxValue?: number;
  defaultValue?: string;
  isMandatory: boolean;
  effectiveFrom: string;
  effectiveTo?: string;
  // Banding/weightage will map here
}

export interface ParameterWeightage {
  parameterCode: string;
  weightage: number; // e.g., 0-1 or percentage as per backend
}


export interface ParameterBand {
  parameterCode: string;
  bandCode: string;
  label: string;      // e.g., "0-100m"
  minValue?: number;  // optional if categorical
  maxValue?: number;  // optional if categorical
}

export interface ApprovingAuthority extends BaseEntity {
  roleCode: string; // maps to Auth roles for workflow
}

// Mappings: Land classes and sub-classes mapped to admin units
export interface LandClassMapping {
  landClassCode: string;
  districtCode?: string;
  circleCode?: string;
  mouzaCode?: string;
  villageCode?: string;
}

export interface LandSubClassMapping {
  landSubClassCode: string;
  districtCode?: string;
  circleCode?: string;
  mouzaCode?: string;
  villageCode?: string;
}

// Circle-Lot Factor
export interface CircleLotFactorRequest {
  districtCode: string;
  circleCode: string;
  lotCode: string;
  daagNumber: string;
}

export interface CircleLotFactorResponse {
  factor: number;
  source: 'EXISTING' | 'DERIVED_AVERAGE';
  parents?: Array<{ circleCode: string; lotCode: string; factor: number }>;
}