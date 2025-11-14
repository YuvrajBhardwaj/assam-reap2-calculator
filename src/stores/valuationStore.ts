import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ValuationFormData {
  selectedDistrictCode: string;
  selectedCircleCode: string;
  selectedMouzaCode: string;
  selectedVillageCode: string;
  selectedLotId: string;
  plotNo: string;
  currentLandUse: string;
  landUseChange: boolean;
  newLandUse: string;
  currentLandType: string;
  areaType: 'RURAL' | 'URBAN';
  areaBigha: string;
  areaKatha: string;
  areaLessa: string;
  marketValue: number | null;
  perLessaValue: number | null;
  onRoad: boolean;
  cornerPlot: boolean;
  litigatedPlot: boolean;
  hasTenant: boolean;
  roadWidth: string;
  distanceFromRoad: string;
  locationMethod: 'manual' | 'gis';
  onMainRoad: boolean;
  onMetalRoad: boolean;
  onMainMarket: boolean;
  onApproachRoadWidth: boolean;
  onApproachRoad1stBand: boolean;
  onApproachRoad2ndBand: boolean;
  // Parameter IDs for persistence
  mainRoadBandId: string;
  metalRoadBandId: string;
  mainMarketBandId: string;
  approachRoad1stBandId: string;
  approachRoad2ndBandId: string;
  selectedSubclauseIds: string[];
}

interface ValuationStore {
  formData: ValuationFormData;
  lastUpdated: number;
 
  // Actions
  setFormData: (data: Partial<ValuationFormData>) => void;
  setMarketValue: (value: number | null) => void;
  setPerLessaValue: (value: number | null) => void;
  resetFormData: () => void;
  loadFromStorage: () => ValuationFormData | null;
}

const initialFormData: ValuationFormData = {
  selectedDistrictCode: '',
  selectedCircleCode: '',
  selectedMouzaCode: '',
  selectedVillageCode: '',
  selectedLotId: '',
  plotNo: '',
  currentLandUse: '',
  landUseChange: false,
  newLandUse: '',
  currentLandType: '',
  areaType: 'RURAL',
  areaBigha: '',
  areaKatha: '',
  areaLessa: '',
  marketValue: null,
  perLessaValue: null,
  onRoad: false,
  cornerPlot: false,
  litigatedPlot: false,
  hasTenant: false,
  roadWidth: '',
  distanceFromRoad: '',
  locationMethod: 'manual',
  onMainRoad: false,
  onMetalRoad: false,
  onMainMarket: false,
  onApproachRoadWidth: false,
  onApproachRoad1stBand: false,
  onApproachRoad2ndBand: false,
  mainRoadBandId: '',
  metalRoadBandId: '',
  mainMarketBandId: '',
  approachRoad1stBandId: '',
  approachRoad2ndBandId: '',
  selectedSubclauseIds: [],
};

export const useValuationStore = create<ValuationStore>()(
  persist(
    (set, get) => ({
      formData: initialFormData,
      lastUpdated: Date.now(),
     
      setFormData: (data) => set((state) => ({
        formData: { ...state.formData, ...data },
        lastUpdated: Date.now(),
      })),
     
      setMarketValue: (value) => set((state) => ({
        formData: { ...state.formData, marketValue: value },
        lastUpdated: Date.now(),
      })),
     
      setPerLessaValue: (value) => set((state) => ({
        formData: { ...state.formData, perLessaValue: value },
        lastUpdated: Date.now(),
      })),
     
      resetFormData: () => set({
        formData: initialFormData,
        lastUpdated: Date.now(),
      }),
     
      loadFromStorage: () => {
        const state = get();
        return state.formData;
      },
    }),
    {
      name: 'valuation-form-storage',
      partialize: (state) => ({
        formData: state.formData,
        lastUpdated: state.lastUpdated,
      }),
    }
  )
);