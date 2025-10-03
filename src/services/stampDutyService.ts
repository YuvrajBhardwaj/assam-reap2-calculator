import { coreApi } from './http';
import {
  StampDutyCalculationInput,
  StampDutyCalculationResult,
  StampDutyRateFilter,
  StampDutyRateItem,
} from '@/types/stampDuty';

export async function calculateStampDuty(
  input: StampDutyCalculationInput
): Promise<StampDutyCalculationResult> {
  const res = await coreApi.post('/stamp-duty/calculate', input);
  return res.data;
}

export async function fetchStampDutyRates(
  filter?: StampDutyRateFilter
): Promise<StampDutyRateItem[]> {
  const res = await coreApi.get('/stamp-duty/rates', { params: filter });
  return res.data;
}

export async function getInstrumentTypes(): Promise<string[]> {
  const res = await coreApi.get('/stamp-duty/instruments');
  return res.data;
}