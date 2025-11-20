import { masterDataApi as api } from './http';

// -----------------------------
// Interfaces
// -----------------------------

export interface Parameter {
  parameterGenId: number;
  parameterName: string;
  parameterCode: string;
  parameterId: number | null;
  active: boolean;
  createdBy: string;
  createdDtm: string;
  updatedBy: string | null;
  updatedDtm: string | null;
  approvedBy: string | null;
  approvedDtm: string | null;
  status: string;
  statusCode: string;
  basePriceIncreaseParameter: number | null;
}

export interface SubParameter {
  subParameterGenId: number;
  parameterCode: string;
  subParameterName: string;
  subParameterCode: string;
  effectiveFrom: string;
  active: boolean;
  createdBy: string;
  createdDtm: string;
  updatedBy: string | null;
  updatedDtm: string | null;
  approvedBy: string | null;
  approvedDtm: string | null;
  status: string;
  statusCode: string;
  basePriceIncreaseSubParameter: number;
}

export interface ParameterResponse {
  message: string;
  data: Parameter[];
  httpStatus: string;
  name: string | null;
}

export interface SubParameterResponse {
  message: string;
  data: SubParameter[];
  httpStatus: string;
  name: string | null;
}


// -----------------------------
// Service Methods
// -----------------------------

/**
 * Fetch all parameters
 * GET /masterData/getParameterDetailsAll
 */
export const getParameterDetailsAll = async (): Promise<ParameterResponse> => {
  const res = await api.get(`/getParameterDetailsAll`);
  return res.data;
};


export const getSubParameterDetailsAllByParameterCode = async (
  parameterCode: string
): Promise<SubParameterResponse> => {
  const res = await api.get(`/getSubParameterDetailsAllByParameterCode`, {
    params: { parameterCode }
  });
  return res.data;
};
