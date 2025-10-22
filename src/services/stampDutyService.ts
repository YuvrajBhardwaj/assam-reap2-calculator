import { coreApi, jurisdictionApi } from './http';
import {
  StampDutyCalculationInput,
  StampDutyCalculationResult,
  Instrument,
} from '@/types/stampDuty';

export async function calculateStampDuty(
  input: StampDutyCalculationInput
): Promise<StampDutyCalculationResult> {
  const res = await coreApi.post('/stamp-duty/calculate', input);
  return res.data;
}

export async function getInstrumentTypes(): Promise<string[]> {
  const res = await coreApi.get('/stamp-duty/instruments');
  return res.data;
}

// New: GET instruments from jurisdiction backend
export async function fetchInstruments(): Promise<Instrument[]> {
  const res = await jurisdictionApi.get('/jurisdictionInfo/instruments');
  return res.data;
}