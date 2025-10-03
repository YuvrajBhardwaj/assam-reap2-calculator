import { masterDataApi as api } from './http';

export interface Parameter {
  parameterId: number;
  parameter: string;
}

export interface ParameterResponse {
  message: string;
  data: Parameter[];
  httpStatus: string;
  name: string | null;
}

export const getParameterDetails = async (
  minRange: number = 0,
  maxRange: number = 500
): Promise<ParameterResponse> => {
  const res = await api.get(`/getParameterDetails`, { params: { minRange, maxRange } });
  return res.data;
};
