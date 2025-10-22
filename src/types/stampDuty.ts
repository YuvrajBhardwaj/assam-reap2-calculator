import { AreaType } from '@/types/valuation';

export interface StampDutyCalculationInput {
  marketValue?: number;
  considerationValue?: number;
  instrumentType: string;
  gender?: string;
  areaType?: AreaType;
  districtCode?: string;
  circleCode?: string;
  sroCode?: string;
  additionalParams?: Record<string, unknown>;
}

export interface StampDutyBreakdown {
  stampDuty: number;
  registrationFee: number;
  cesses?: Record<string, number>;
  rebates?: Record<string, number>;
  surcharges?: Record<string, number>;
  totalPayable: number;
}

export interface StampDutyCalculationResult extends StampDutyBreakdown {
  basis: 'MARKET_VALUE' | 'CONSIDERATION_VALUE';
  effectiveRateVersion?: string;
}

// Backend-driven instrument and selection types
export interface Instrument {
  id: number;
  name: string;
  maleDuty: number;
  femaleDuty: number;
  jointDuty: number;
  isFixed?: boolean; // Added to differentiate fixed vs percentage duties
}

export type GenderOption = 'Male' | 'Female' | 'Joint';

export interface SelectionRequest {
  instrumentId: number;
  selectedOption: GenderOption;
}

export interface SelectionResponse {
  id: number;
  instrumentId: number;
  instrumentName: string;
  selectedOption: GenderOption;
  dutyValue: number;
  createdAt: string | null;
}