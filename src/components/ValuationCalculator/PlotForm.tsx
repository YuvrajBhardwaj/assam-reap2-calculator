// PlotForm.tsx
import { useEffect, useState, forwardRef, useImperativeHandle, useMemo, useRef, useCallback, MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useValuationStore } from '@/stores/valuationStore';
import { getCirclesByDistrict, getAllDistricts, getMouzasByDistrictAndCircle, getAllLandCategories, getVillagesByDistrictAndCircleAndMouzaAndLot } from '@/services/locationService';
import type { District, Circle, Mouza, Village, LandClass, Lot } from '@/types/masterData';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  RadioGroup,
  RadioGroupItem,
} from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { fetchLots, fetchLandClassMappings, saveValuation } from '@/services/masterDataService';
import { calculatePlotBaseValue, fetchCircleLotFactor } from '@/services/masterDataService';
import { useToast } from '@/hooks/use-toast';
import { getParameterDetailsAll, getSubParameterDetailsAllByParameterCode, type Parameter, type SubParameter } from "@/services/parameterService";
import { ComprehensiveValuationRequest } from '@/types/valuation';
import { Badge } from '@/components/ui/badge';
import { Info, MapPin, Home, Layers, AlertTriangle, Users, Ruler, CheckCircle, Calculator, FileText, History, ExternalLink, Copy, RotateCcw, Loader2 } from 'lucide-react';

interface PlotLandDetailsPayload {
  locationMethod: string;
  parameters?: {
    parameterCode: string;
    parameterName: string;
    subParameters: { subParameterCode: string; subParameterName: string }[];
  }[];
  onRoad?: boolean;
  cornerPlot?: boolean;
  litigatedPlot?: boolean;
  hasTenant?: boolean;
  roadWidth?: number;
  distanceFromRoad?: number;
}

interface JurisdictionInformationExternal {
  districtCode: string;
  circleCode: string;
  mouzaCode: string;
  villageCode: string;
  lotCode: string;
  plotNo?: string;
  currentLandUse: string;
}

interface LandTypeDetailsExternal {
  currentLandType: string;
  landUseChange: boolean;
  newLandCategoryType?: string;
  areaType: 'RURAL' | 'URBAN';
  areaDetailsExternal: { totalLessa: number };
}

interface StructureDetailsExternal {
  structureType?: string;
  constructionYear?: number;
  totalFloors?: number;
  builtUpArea?: number;
  structureCondition?: string;
  structureAge?: number;
}

interface PayloadExternal {
  jurisdictionInformationExternal: JurisdictionInformationExternal;
  landTypeDetailsExternal: LandTypeDetailsExternal;
  plotLandDetailsExternal: PlotLandDetailsPayload;
  structureDetails?: StructureDetailsExternal;
  totalMarketValuation?: number;
}

interface ConsolePayload {
  mode: string;
  payloadExternal: PayloadExternal;
  gisInfo?: {
    factor: number;
    source: string;
    areaDetails: { bigha?: number; katha?: number; lessa?: number } | null;
  };
}

interface FullParameter extends Parameter {
  parameterId: number;
  parameter: string;
  parameterCode: string;
  parameterType: string | null;
  areaTypeId: number;
  minRangeInMeters: number;
  maxRangeInMeters: number;
  minMaxRange: string;
  active: boolean;
  createdBy: string;
  createdDtm: string;
  updatedBy: string;
  updatedDtm: string;
  approvedBy: string;
  approvedDtm: string;
  status: string;
  statusCode: string;
}

interface DistrictDetails {
  id: number;
  name: string;
}

interface CalculationHistory {
  id: string;
  timestamp: number;
  formData: any;
  result: {
    totalValue: number;
    breakdown?: any;
  };
  description: string;
}

interface PlotFormProps {
  onCalculate?: (value: number) => void;
  hideCalculateButton?: boolean;
  initialLocationData?: {
    district?: District;
    circle?: Circle;
    mouza?: Mouza;
    village?: Village; // Fixed: typed as Village instead of any
  };
  // New: allow parent to receive live form data
  onDataChange?: (data: any) => void;
  getStructureDetails?: () => StructureDetailsExternal | undefined;
}

export interface PlotFormRef {
  handleCalculate: () => void;
  getSavePayload: () => ConsolePayload;
}

// Placeholder data
const PlotForm = forwardRef<PlotFormRef, PlotFormProps>(({ onCalculate, hideCalculateButton, initialLocationData, onDataChange, getStructureDetails }, ref) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { formData: storedFormData, setFormData, setMarketValue, setPerLessaValue } = useValuationStore();

  // All states grouped at the top
  const [landCategories, setLandCategories] = useState<LandClass[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [circles, setCircles] = useState<Circle[]>([]);
  const [mouzas, setMouzas] = useState<Mouza[]>([]);
  const [villages, setVillages] = useState<Village[]>([]);
  const [lots, setLots] = useState<Lot[]>([]);
  const [selectedDistrictCode, setSelectedDistrictCode] = useState(storedFormData.selectedDistrictCode);
  const [selectedCircleCode, setSelectedCircleCode] = useState(storedFormData.selectedCircleCode);
  const [selectedMouzaCode, setSelectedMouzaCode] = useState(storedFormData.selectedMouzaCode);
  const [selectedVillageCode, setSelectedVillageCode] = useState(storedFormData.selectedVillageCode);
  const [basePriceMouza, setBasePriceMouza] = useState<number | null>(null);
  const [selectedLotId, setSelectedLotId] = useState(storedFormData.selectedLotId);
  const [basePriceLot, setBasePriceLot] = useState<number | null>(null);
  const [plotNo, setPlotNo] = useState(storedFormData.plotNo);
  const [currentLandUse, setCurrentLandUse] = useState(storedFormData.currentLandUse);
  const [landUseChange, setLandUseChange] = useState(storedFormData.landUseChange);
  const [newLandUse, setNewLandUse] = useState(storedFormData.newLandUse);
  const [currentLandType, setCurrentLandType] = useState(storedFormData.currentLandType);
  const [areaType, setAreaType] = useState<'RURAL' | 'URBAN'>(storedFormData.areaType);
  const [marketValue, setMarketValueState] = useState<number | null>(storedFormData.marketValue);
  const [perLessaValue, setPerLessaValueState] = useState<number | null>(storedFormData.perLessaValue);
  const [areaBigha, setAreaBigha] = useState(storedFormData.areaBigha);
  const [areaKatha, setAreaKatha] = useState(storedFormData.areaKatha);
  const [areaLessa, setAreaLessa] = useState(storedFormData.areaLessa);

  // Updated: Band selections now hold FullParameter objects
  const [mainRoadBand, setMainRoadBand] = useState<FullParameter | null>(null);
  const [metalRoadBand, setMetalRoadBand] = useState<FullParameter | null>(null);
  const [mainMarketBand, setMainMarketBand] = useState<FullParameter | null>(null);
  // New: Approach Road Width Band states
  const [onApproachRoadWidth, setOnApproachRoadWidth] = useState(storedFormData.onApproachRoadWidth);
  const [approachRoad1stBand, setApproachRoad1stBand] = useState<FullParameter | null>(null);
  const [approachRoad2ndBand, setApproachRoad2ndBand] = useState<FullParameter | null>(null);
  const [onApproachRoad1stBand, setOnApproachRoad1stBand] = useState(storedFormData.onApproachRoad1stBand);
  const [onApproachRoad2ndBand, setOnApproachRoad2ndBand] = useState(storedFormData.onApproachRoad2ndBand);

  const [totalLessa, setTotalLessa] = useState(0);
  const [locationMethod, setLocationMethod] = useState(storedFormData.locationMethod);
  const [onRoad, setOnRoad] = useState(storedFormData.onRoad);
  const [cornerPlot, setCornerPlot] = useState(storedFormData.cornerPlot);
  const [litigatedPlot, setLitigatedPlot] = useState(storedFormData.litigatedPlot);
  const [hasTenant, setHasTenant] = useState(storedFormData.hasTenant);
  const [roadWidth, setRoadWidth] = useState(storedFormData.roadWidth);
  const [distanceFromRoad, setDistanceFromRoad] = useState(storedFormData.distanceFromRoad);
  const [onMainRoad, setOnMainRoad] = useState(storedFormData.onMainRoad);
  const [onMetalRoad, setOnMetalRoad] = useState(storedFormData.onMetalRoad);
  const [onMainMarket, setOnMainMarket] = useState(storedFormData.onMainMarket);
  const [onNonRoad, setOnNonRoad] = useState(storedFormData.onNonRoad);
  const [isCalculating, setIsCalculating] = useState(false);
  const isCalculatingRef = useRef(isCalculating);

  useEffect(() => {
    isCalculatingRef.current = isCalculating;
  }, [isCalculating]);

  const [selectedSubclauses, setSelectedSubclauses] = useState<FullParameter[]>([]);
  const [parameters, setParameters] = useState<FullParameter[]>([]);
  const [loadingParameters, setLoadingParameters] = useState<boolean>(true);

  // Dynamic parameter-subparameter state
  const [dynamicParameters, setDynamicParameters] = useState<Parameter[]>([]);
  const [subParametersMap, setSubParametersMap] = useState<Map<string, SubParameter[]>>(new Map());
  const [selectedParameters, setSelectedParameters] = useState<Set<string>>(new Set());
  const [selectedSubParameters, setSelectedSubParameters] = useState<Map<string, string>>(new Map());
  const [loadingSubParams, setLoadingSubParams] = useState<Set<string>>(new Set());

  // New: Daag lookup state
  const [isDaagLookupLoading, setIsDaagLookupLoading] = useState(false);
  const [daagFactorInfo, setDaagFactorInfo] = useState<import('@/types/masterData').CircleLotFactorResponse | null>(null);

  // Land use increase states
  const [basePriceLandUse, setBasePriceLandUse] = useState<number | null>(null);
  const [newBasePriceLandUse, setNewBasePriceLandUse] = useState<number | null>(null);

  // History and cache management
  const [calculationHistory, setCalculationHistory] = useState<CalculationHistory[]>([]);
  const [selectedHistoryId, setSelectedHistoryId] = useState<string>('');
  const [calculationResult, setCalculationResult] = useState<any>(null);
  const [showDetailedBreakdown, setShowDetailedBreakdown] = useState(false);

  const selectedLot = useMemo(() => {
    return lots.find(lot => lot.id === selectedLotId);
  }, [selectedLotId, lots]);

  // Computed selected land use code
  const selectedLandUseCode = useMemo(() => landUseChange ? newLandUse : currentLandUse, [landUseChange, newLandUse, currentLandUse]);

  // Computed land use increase
  const landUseIncrease = useMemo(() => {
    if (landUseChange) {
      return newBasePriceLandUse ?? 0;
    } else {
      return basePriceLandUse ?? 0;
    }
  }, [landUseChange, newBasePriceLandUse, basePriceLandUse]);

  const bandWeights = useMemo(() => ({
    12: 15,
    13: 10,
    5: 10,
    18: 5,
    19: 2.5,
    2: 1,
    15: 15,
    16: 10,
  }), []);

  const parameterWeightPercent = useMemo(() => {
    const selectedIds: number[] = [];
    selectedSubclauses.forEach(p => selectedIds.push(p.parameterId));
    if (onMainRoad && mainRoadBand) selectedIds.push(mainRoadBand.parameterId);
    if (onMetalRoad && metalRoadBand) selectedIds.push(metalRoadBand.parameterId);
    if (onMainMarket && mainMarketBand) selectedIds.push(mainMarketBand.parameterId);
    if (onNonRoad) {
      const nonRoadParam = parameters.find(p => p.parameterCode === '10005');
      if (nonRoadParam) selectedIds.push(nonRoadParam.parameterId);
    }
    if (onApproachRoadWidth && onApproachRoad1stBand && approachRoad1stBand) selectedIds.push(approachRoad1stBand.parameterId);
    if (onApproachRoadWidth && onApproachRoad2ndBand && approachRoad2ndBand) selectedIds.push(approachRoad2ndBand.parameterId);
    return selectedIds.reduce((sum, id) => sum + ((bandWeights as any)[id] || 0), 0);
  }, [selectedSubclauses, onMainRoad, mainRoadBand, onMetalRoad, metalRoadBand, onMainMarket, mainMarketBand, onNonRoad, onApproachRoadWidth, onApproachRoad1stBand, approachRoad1stBand, onApproachRoad2ndBand, approachRoad2ndBand, bandWeights, parameters]);

  // NEW: Computed Plot Level Base Value
  // Formula: Plot Level Base = Mouza Base × (1 + Lot % / 100) × (1 + Land Use % / 100)
  // Note: basePriceMouza already includes District Base × Geo × Conversion (pre-computed)
  const plotLevelBaseValue = useMemo(() => {
    // Allow landUseIncrease to be 0; still a valid calculation (multiplier = 1)
    if (basePriceMouza === null || basePriceLot === null) {
      return null;
    }
    const lotMultiplier = 1 + (basePriceLot / 100);
    const landUseMultiplier = 1 + (landUseIncrease / 100);
    const parameterMultiplier = 1 + ((parameterWeightPercent || 0) / 100);
    return Math.round(basePriceMouza * lotMultiplier * landUseMultiplier * parameterMultiplier);
  }, [basePriceMouza, basePriceLot, landUseIncrease, parameterWeightPercent]);

  const hasBaseValue = useMemo(() => {
    return selectedDistrictCode && selectedCircleCode && selectedMouzaCode && selectedVillageCode && selectedLotId && !!selectedLandUseCode;
  }, [selectedDistrictCode, selectedCircleCode, selectedMouzaCode, selectedVillageCode, selectedLotId, selectedLandUseCode]);

  // Local total value based on per lessa * total lessa
  const localTotalValue = useMemo(() => {
    if (perLessaValue !== null && totalLessa > 0) {
      return Math.round(perLessaValue * totalLessa);
    }
    return null;
  }, [perLessaValue, totalLessa]);

  // Rate percent based on area type (kept for reference, but not used in calculation)
  // const ratePercent = useMemo(() => areaType === 'RURAL' ? 0.02 : 0.01, [areaType]);

  // Total Market Valuation with Rate (removed Rural 2% and Urban 1%)
  const totalMarketValuationWithRate = useMemo(() => {
    if (plotLevelBaseValue !== null && totalLessa > 0) {
      return Math.round(plotLevelBaseValue * totalLessa);
    }
    return null;
  }, [plotLevelBaseValue, totalLessa]);

  // NEW: Grouped bands for cascading
  const paramGroups = useMemo(() => ({
    mainRoad: {
      label: 'Whether on Main Road',
      bands: parameters
        .filter(p => p.parameter && p.parameter.includes('Distance from Main Road') && p.areaTypeId === 1)
        .sort((a, b) => a.minRangeInMeters - b.minRangeInMeters)
    },
    metalRoad: {
      label: 'Whether on Metal Road',
      bands: parameters
        .filter(p => p.parameter && p.parameter.includes('Distance from Main Road') && p.areaTypeId === 2)
        .sort((a, b) => a.minRangeInMeters - b.minRangeInMeters)
    },
    mainMarket: {
      label: null, // Always visible
      bands: parameters
        .filter(p => p.parameter && p.parameter.includes('Distance from Main Market'))
        .sort((a, b) => a.minRangeInMeters - b.minRangeInMeters)
    },
    approachRoadWidth: {
      label: 'Width of Approach Road',
      bands: parameters
        .filter(p => p.parameter && p.parameter.includes('width of approach road'))
        .sort((a, b) => a.minRangeInMeters - b.minRangeInMeters)
    }
    // Add more groups e.g., approachRoadWidth if replacing input with bands
  }), [parameters]);

  // NEW: Flat parameters excluding cascading ones
  const flatParameters = useMemo(() =>
    parameters.filter(p => p.parameter 
    ), [parameters]);

  // Section completion states
  const isJurisdictionComplete = selectedDistrictCode && selectedCircleCode && selectedMouzaCode && selectedVillageCode && selectedLotId && plotNo && currentLandUse && totalLessa > 0;
  const isLandTypeComplete = !!selectedLandUseCode && totalLessa > 0;
  const isLocationComplete = locationMethod === 'manual' ?
    (onRoad ? roadWidth : distanceFromRoad) :
    true;

  // Fixed: Complete useEffect to load form data from zustand store on component mount
  useEffect(() => {
    const formData = storedFormData;
    setSelectedDistrictCode(formData.selectedDistrictCode || '');
    setSelectedCircleCode(formData.selectedCircleCode || '');
    setSelectedMouzaCode(formData.selectedMouzaCode || '');
    setSelectedVillageCode(formData.selectedVillageCode || '');
    setSelectedLotId(formData.selectedLotId || '');
    setPlotNo(formData.plotNo || '');
    setCurrentLandUse(formData.currentLandUse || '');
    setLandUseChange(formData.landUseChange || false);
    setNewLandUse(formData.newLandUse || '');
    setCurrentLandType(formData.currentLandType || '');
    setAreaType(formData.areaType || 'RURAL');
    setAreaBigha(formData.areaBigha || '');
    setAreaKatha(formData.areaKatha || '');
    setAreaLessa(formData.areaLessa || '');
    setMarketValueState(formData.marketValue || null);
    setPerLessaValueState(formData.perLessaValue || null);
    setOnRoad(formData.onRoad || false);
    setCornerPlot(formData.cornerPlot || false);
    setLitigatedPlot(formData.litigatedPlot || false);
    setHasTenant(formData.hasTenant || false);
    setRoadWidth(formData.roadWidth || '');
    setDistanceFromRoad(formData.distanceFromRoad || '');
    setLocationMethod(formData.locationMethod || 'manual');
    setOnMainRoad(formData.onMainRoad || false);
    setOnMetalRoad(formData.onMetalRoad || false);
    setOnMainMarket(formData.onMainMarket || false);
    setOnNonRoad(formData.onNonRoad || false);
    setOnApproachRoadWidth(formData.onApproachRoadWidth || false);
    setOnApproachRoad1stBand(formData.onApproachRoad1stBand || false);
    setOnApproachRoad2ndBand(formData.onApproachRoad2ndBand || false);
  }, [storedFormData]); // Depend on storedFormData to react to changes

  // Effect to load parameter-related saved data after parameters are loaded
  useEffect(() => {
    if (parameters.length === 0) return;
    // Load parameter data from zustand store
    const formData = storedFormData;
    if (formData.mainRoadBandId) {
      const param = parameters.find(p => p.parameterId.toString() === formData.mainRoadBandId);
      setMainRoadBand(param || null);
    }
    if (formData.metalRoadBandId) {
      const param = parameters.find(p => p.parameterId.toString() === formData.metalRoadBandId);
      setMetalRoadBand(param || null);
    }
    if (formData.mainMarketBandId) {
      const param = parameters.find(p => p.parameterId.toString() === formData.mainMarketBandId);
      setMainMarketBand(param || null);
    }
    if (formData.approachRoad1stBandId) {
      const param = parameters.find(p => p.parameterId.toString() === formData.approachRoad1stBandId);
      setApproachRoad1stBand(param || null);
    }
    if (formData.approachRoad2ndBandId) {
      const param = parameters.find(p => p.parameterId.toString() === formData.approachRoad2ndBandId);
      setApproachRoad2ndBand(param || null);
    }
    if (formData.selectedSubclauseIds) {
      const params = formData.selectedSubclauseIds
        .map(idStr => parameters.find(p => p.parameterId.toString() === idStr))
        .filter((p): p is FullParameter => p !== null);
      setSelectedSubclauses(params);
    }
  }, [parameters, storedFormData]); // Depend on parameters and storedFormData

  // Effect to fetch land class mappings when village changes
  useEffect(() => {
    const applyVillageLandCategory = async () => {
      if (!selectedDistrictCode || !selectedCircleCode || !selectedMouzaCode || !selectedVillageCode) {
        setCurrentLandUse('');
        return;
      }
      const selectedVillage = villages.find(v => v.code === selectedVillageCode);
      if (selectedVillage?.landCategory && landCategories.length > 0) {
        const match = landCategories.find(c => (c.name?.toLowerCase?.() || '') === selectedVillage.landCategory!.toLowerCase());
        if (match && match.id !== undefined) {
          const idStr = String(match.id);
          setCurrentLandUse(idStr);
          setCurrentLandType(idStr);
          setBasePriceLandUse(match.basePriceMouzaIncrease ?? null);
          return;
        }
      }
      try {
        const res = await fetchLandClassMappings(selectedDistrictCode, selectedCircleCode, selectedMouzaCode, selectedVillageCode);
        if (Array.isArray(res) && res.length > 0) {
          const first = res[0];
          const matchByCode = landCategories.find(c => String(c.code) === String(first.landClassCode));
          if (matchByCode) {
            const idStr = String(matchByCode.id);
            setCurrentLandUse(idStr);
            setCurrentLandType(idStr);
            setBasePriceLandUse(matchByCode.basePriceMouzaIncrease ?? null);
          } else {
            setCurrentLandUse('');
          }
        } else {
          setCurrentLandUse('');
        }
      } catch (error) {
        console.error('Failed to fetch land class mappings:', error);
        setCurrentLandUse('');
      }
    };
    applyVillageLandCategory();
  }, [selectedDistrictCode, selectedCircleCode, selectedMouzaCode, selectedVillageCode, villages, landCategories]);

  // Effect to save form data to zustand store whenever relevant state changes
  // Note: To avoid infinite loops, we've moved sync to a throttled or batched approach if needed, but for now, it's fine as states are local
  useEffect(() => {
    const formDataToSave = {
      selectedDistrictCode,
      selectedCircleCode,
      selectedMouzaCode,
      selectedVillageCode,
      selectedLotId,
      plotNo,
      currentLandUse,
      landUseChange,
      newLandUse,
      currentLandType,
      areaType,
      areaBigha,
      areaKatha,
      areaLessa,
      marketValue,
      perLessaValue,
      // Save parameter IDs
      mainRoadBandId: mainRoadBand?.parameterId?.toString() || '',
      metalRoadBandId: metalRoadBand?.parameterId?.toString() || '',
      mainMarketBandId: mainMarketBand?.parameterId?.toString() || '',
      approachRoad1stBandId: approachRoad1stBand?.parameterId?.toString() || '',
      approachRoad2ndBandId: approachRoad2ndBand?.parameterId?.toString() || '',
      selectedSubclauseIds: selectedSubclauses.map(p => p.parameterId.toString()),
      locationMethod,
      onRoad,
      cornerPlot,
      litigatedPlot,
      hasTenant,
      roadWidth,
      distanceFromRoad,
      onMainRoad,
      onMetalRoad,
      onMainMarket,
      onNonRoad,
      onApproachRoadWidth,
      onApproachRoad1stBand,
      onApproachRoad2ndBand,
    };
    setFormData(formDataToSave);
    // Also update store-specific fields
    if (marketValue !== undefined) setMarketValue(marketValue);
    if (perLessaValue !== undefined) setPerLessaValue(perLessaValue);
  }, [
    selectedDistrictCode, selectedCircleCode, selectedMouzaCode, selectedVillageCode, selectedLotId, plotNo, currentLandUse, landUseChange, newLandUse, currentLandType, areaType, areaBigha, areaKatha, areaLessa, marketValue, perLessaValue, mainRoadBand, metalRoadBand, mainMarketBand, approachRoad1stBand, approachRoad2ndBand, selectedSubclauses, locationMethod, onRoad, cornerPlot, litigatedPlot, hasTenant, roadWidth, distanceFromRoad, onMainRoad, onMetalRoad, onMainMarket, onNonRoad, onApproachRoadWidth, onApproachRoad1stBand, onApproachRoad2ndBand,
    setFormData, setMarketValue, setPerLessaValue // Explicit deps for actions
  ]);

  useEffect(() => {
    const bigha = parseFloat(areaBigha) || 0;
    const katha = parseFloat(areaKatha) || 0;
    const lessa = parseFloat(areaLessa) || 0;
    // 1 Bigha = 5 Katha, 1 Katha = 20 Lessa, so 1 Bigha = 100 Lessa
    setTotalLessa(bigha * 100 + katha * 20 + lessa);
  }, [areaBigha, areaKatha, areaLessa]);

  const areaBighaInvalid = useMemo(() => areaBigha !== '' && (isNaN(parseFloat(areaBigha)) || parseFloat(areaBigha) < 0), [areaBigha]);
  const areaKathaInvalid = useMemo(() => areaKatha !== '' && (isNaN(parseFloat(areaKatha)) || parseFloat(areaKatha) < 0), [areaKatha]);
  const areaLessaInvalid = useMemo(() => areaLessa !== '' && (isNaN(parseFloat(areaLessa)) || parseFloat(areaLessa) < 0), [areaLessa]);

  // Load history from localStorage on component mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('plot-calculation-history');
    if (savedHistory) {
      try {
        setCalculationHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error('Error loading calculation history:', error);
      }
    }
  }, []);

  // Effect to call onDataChange whenever relevant state changes
  useEffect(() => {
    if (onDataChange) {
      onDataChange({
        selectedDistrictCode,
        selectedCircleCode,
        selectedMouzaCode,
        selectedVillageCode,
        selectedLotId,
        plotNo,
        currentLandUse,
        landUseChange,
        newLandUse,
        currentLandType,
        areaType,
        areaDetails: {
          totalLessa: totalLessa
        },
        locationMethod,
        onRoad,
        cornerPlot,
        litigatedPlot,
        hasTenant,
        roadWidth,
        distanceFromRoad,
        selectedSubclauses,
        selectedSubParameters: Array.from(selectedSubParameters.entries()),
        subParametersMap: Array.from(subParametersMap.entries()),
      });
    }
  }, [
    onDataChange,
    selectedDistrictCode,
    selectedCircleCode,
    selectedMouzaCode,
    selectedVillageCode,
    selectedLotId,
    plotNo,
    currentLandUse,
    landUseChange,
    newLandUse,
    currentLandType,
    areaType,
    areaBigha,
    areaKatha,
    areaLessa,
    locationMethod,
    onRoad,
    cornerPlot,
    litigatedPlot,
    hasTenant,
    roadWidth,
    distanceFromRoad,
    selectedSubclauses,
    selectedSubParameters,
    subParametersMap,
    totalLessa // Added for areaDetails
  ]);

  useEffect(() => {
    const fetchLandCategories = async () => {
      try {
        const categories = await getAllLandCategories();
        setLandCategories(categories);
      } catch (error) {
        console.error('Error fetching land categories:', error);
      }
    };
    fetchLandCategories();
  }, []);

  useEffect(() => {
    const fetchDistricts = async () => {
      try {
        const data = await getAllDistricts();
        setDistricts(data);
        if (initialLocationData?.district?.code) {
          setSelectedDistrictCode(initialLocationData.district.code);
        }
      } catch (error) {
        console.error('Error fetching districts:', error);
      }
    };
    fetchDistricts();
  }, [initialLocationData]);

  // Fetch villages when district, circle, or mouza changes
  useEffect(() => {
    if (selectedDistrictCode && selectedCircleCode && selectedMouzaCode && selectedLot?.code) {
      const fetchVillages = async () => {
        try {
          const data = await getVillagesByDistrictAndCircleAndMouzaAndLot(selectedDistrictCode, selectedCircleCode, selectedMouzaCode, selectedLot?.code);
          setVillages(data);
          // Set initial village if provided
          if (initialLocationData?.village?.code) {
            setSelectedVillageCode(initialLocationData.village.code);
          }
        } catch (error) {
          console.error('Error fetching villages:', error);
        }
      };
      fetchVillages();
    } else {
      setVillages([]);
      setSelectedVillageCode('');
    }
  }, [selectedDistrictCode, selectedCircleCode, selectedMouzaCode, selectedLot?.code, initialLocationData]);

  useEffect(() => {
    if (selectedDistrictCode) {
      const fetchCircles = async () => {
        try {
          const data = await getCirclesByDistrict(selectedDistrictCode);
          setCircles(data);
          if (initialLocationData?.circle?.code) {
            setSelectedCircleCode(initialLocationData.circle.code);
          }
        } catch (error) {
          console.error('Error fetching circles:', error);
        }
      };
      fetchCircles();
    } else {
      setCircles([]);
      setSelectedCircleCode('');
    }
  }, [selectedDistrictCode, initialLocationData]);

  useEffect(() => {
    if (selectedDistrictCode && selectedCircleCode) {
      const fetchMouzas = async () => {
        const mouzaCode = initialLocationData?.mouza?.code;
        try {
          const data = await getMouzasByDistrictAndCircle(selectedDistrictCode, selectedCircleCode);
          setMouzas(data);
          if (mouzaCode) {
            setSelectedMouzaCode(mouzaCode);
            const selectedMouza = data.find(m => m.code === mouzaCode);
            setBasePriceMouza(selectedMouza?.basePriceMouza ?? null);
          }
        } catch (error) {
          console.error('Error fetching mouzas:', error);
        } finally {
          if (!mouzaCode) {
            setBasePriceMouza(null);
          }
        }
      };
      fetchMouzas();
    } else {
      setMouzas([]);
      setSelectedMouzaCode('');
      setBasePriceMouza(null);
    }
  }, [selectedDistrictCode, selectedCircleCode, initialLocationData]);

  useEffect(() => {
    if (selectedMouzaCode && mouzas.length > 0) {
      const m = mouzas.find(m => m.code === selectedMouzaCode);
      setBasePriceMouza(m?.basePriceMouza ?? null);
    }
  }, [selectedMouzaCode, mouzas]);

  useEffect(() => {
    if (selectedVillageCode) {
      const selectedVillage = villages.find(v => v.code === selectedVillageCode);
      if (selectedVillage?.areaType) {
        setAreaType(selectedVillage.areaType.toUpperCase() as 'RURAL' | 'URBAN');
      }
    }
  }, [selectedVillageCode, villages]);

  useEffect(() => {
    // Fetch Lots when circle changes. Note: The API does not support filtering lots by mouza.
    const shouldFetchLots = selectedDistrictCode && selectedCircleCode;
    if (!shouldFetchLots) {
      setLots([]);
      setSelectedLotId('');
      return;
    }
    const loadLots = async () => {
      try {
        const data = await fetchLots(selectedDistrictCode, selectedCircleCode, selectedMouzaCode);
        setLots(data);
        // Removed console.log for production
        // Auto-select if only one lot
        if (data.length === 1) {
          setSelectedLotId(data[0].id);
          setBasePriceLot(data[0].basePriceIncreaseLot);
        }
        toast({ title: 'Lots Loaded', description: 'Please select a lot. The list is not filtered by mouza.' });
      } catch (error) {
        console.error('Error fetching lots:', error);
      }
    };
    loadLots();
  }, [selectedDistrictCode, selectedCircleCode]);

  useEffect(() => {
    if (selectedLotId) {
      const lot = lots.find((l) => l.id === selectedLotId);
      if (lot) {
        setBasePriceLot(lot.basePriceIncreaseLot);
      } else {
        setBasePriceLot(null);
      }
    } else {
      setBasePriceLot(null);
    }
  }, [selectedLotId, lots]);

  // Fetch parameters for "Other Details"
  useEffect(() => {
    const fetchParameters = async () => {
      try {
        setLoadingParameters(true);
        const response = await getParameterDetailsAll();
        if (response.data) {
          setParameters(response.data as FullParameter[]);
          setDynamicParameters(response.data); // Store dynamic parameters
        }
      } catch (error) {
        console.error('Failed to fetch parameters:', error);
        setParameters([]);
        setDynamicParameters([]);
      } finally {
        setLoadingParameters(false);
      }
    };
    fetchParameters();
  }, []);

  useEffect(() => {
    if (currentLandUse && landCategories.length > 0) {
      const category = landCategories.find(c => String(c.id) === currentLandUse);
      setBasePriceLandUse(category ? category.basePriceMouzaIncrease ?? null : null);
      setCurrentLandType(currentLandUse);
    }
  }, [currentLandUse, landCategories]);

  useEffect(() => {
    if (landUseChange && newLandUse && landCategories.length > 0) {
      const category = landCategories.find(c => String(c.id) === newLandUse);
      setNewBasePriceLandUse(category ? category.basePriceMouzaIncrease ?? null : null);
    }
  }, [newLandUse, landUseChange, landCategories]);

  // NEW: Memoized payload for per-lessa calculation (with totalLessa: 1)
  const perLessaPayload = useMemo(() => {
    if (!hasBaseValue) return null;
    const effectiveRoadWidth = onRoad && roadWidth ? parseFloat(roadWidth) : undefined;
    const effectiveDistanceFromRoad = !onRoad && distanceFromRoad ? parseFloat(distanceFromRoad) : undefined;
    const landTypeDetails: any = {
      landUseChange: landUseChange,
      areaType: areaType,
      areaDetails: {
        totalLessa: 1
      }
    };
    if (!landUseChange) {
      landTypeDetails.currentLandType = currentLandType;
    } else {
      landTypeDetails.newLandCategoryType = newLandUse;
    }
    // Updated: Include cascading bands in per-lessa calc too
    const allSelectedParams = [...selectedSubclauses, mainRoadBand, metalRoadBand, mainMarketBand].filter((p): p is FullParameter => p !== null);
    if (onApproachRoadWidth) {
      if (onApproachRoad1stBand && approachRoad1stBand) allSelectedParams.push(approachRoad1stBand);
      if (onApproachRoad2ndBand && approachRoad2ndBand) allSelectedParams.push(approachRoad2ndBand);
    }
    
    // Add dynamically selected sub-parameters
    const dynamicSubParamIds: string[] = [];
    selectedSubParameters.forEach((subParamCode, paramCode) => {
      const subParams = subParametersMap.get(paramCode);
      const subParam = subParams?.find(sp => sp.subParameterCode === subParamCode);
      if (subParam) {
        // Use the subParameterGenId as the parameter ID
        dynamicSubParamIds.push(subParam.subParameterGenId.toString());
      }
    });
    
    const allSelectedParamIds = [
      ...allSelectedParams.map(p => p.parameterId.toString()),
      ...dynamicSubParamIds
    ];
    const plotLandDetails = locationMethod === 'manual'
      ? {
          locationMethod: locationMethod as 'manual' | 'gis',
          onRoad: onRoad,
          cornerPlot: cornerPlot,
          litigatedPlot: litigatedPlot,
          hasTenant: hasTenant,
          roadWidth: effectiveRoadWidth,
          distanceFromRoad: effectiveDistanceFromRoad
        }
      : {
          locationMethod: locationMethod as 'manual' | 'gis',
          onRoad: false,
          cornerPlot: cornerPlot,
          litigatedPlot: litigatedPlot,
          hasTenant: hasTenant,
          selectedParameterIds: allSelectedParamIds.length > 0 ? allSelectedParamIds : undefined
        };

    return {
      jurisdictionInformation: {
        districtCode: selectedDistrictCode,
        circleCode: selectedCircleCode,
        mouzaCode: selectedMouzaCode,
        villageCode: selectedVillageCode,
        lotCode: selectedLot?.code, // Use the code from the found lot
        plotNo: plotNo || undefined,
        currentLandUse: currentLandUse
      },
      landTypeDetails,
      plotLandDetails
    } as ComprehensiveValuationRequest;
  }, [
    hasBaseValue, onRoad, roadWidth, distanceFromRoad, landUseChange, areaType, currentLandType, newLandUse,
    selectedSubclauses, mainRoadBand, metalRoadBand, mainMarketBand, onApproachRoadWidth, onApproachRoad1stBand,
    approachRoad1stBand, onApproachRoad2ndBand, approachRoad2ndBand, selectedDistrictCode, selectedCircleCode,
    selectedMouzaCode, selectedVillageCode, selectedLot, plotNo, currentLandUse, locationMethod, cornerPlot,
    litigatedPlot, hasTenant, selectedParameters, selectedSubParameters, subParametersMap
  ]);

  // NEW: Memoized payload for full calculation (reuses per-lessa but with actual totalLessa)
  const fullPayload = useMemo(() => {
    if (!perLessaPayload || totalLessa <= 0) return null;
    return {
      ...perLessaPayload,
      landTypeDetails: {
        ...perLessaPayload.landTypeDetails,
        areaDetails: {
          totalLessa
        }
      }
    } as ComprehensiveValuationRequest;
  }, [perLessaPayload, totalLessa]);

  // Auto-calculate per lessa when payload is ready (debounced to avoid loops)
  const handleCalculatePerLessa = useCallback(async () => {
    if (!perLessaPayload || isCalculatingRef.current) {
      return;
    }
    try {
      setIsCalculating(true);
      const result = await calculatePlotBaseValue(perLessaPayload);
      setPerLessaValueState(result.totalValue);
      setPerLessaValue(result.totalValue); // Update store
      toast({ title: 'Market Value per Lessa Calculated', description: `₹${result.totalValue.toLocaleString()} per Lessa` });
    } catch (err: any) {
      console.error(err);
      toast({ title: 'Failed to calculate per Lessa', description: err?.message || 'Unknown error', variant: 'destructive' });
      navigate('/', { state: { tab: 'stamp-duty-calculator' } });
    } finally {
      setIsCalculating(false);
    }
  }, [perLessaPayload, setPerLessaValueState, setPerLessaValue, toast, navigate]);

  useEffect(() => {
    if (!perLessaPayload || isCalculatingRef.current) return;
    const timer = setTimeout(() => {
      handleCalculatePerLessa();
    }, 500); // Debounce: wait 500ms after last change
    return () => clearTimeout(timer);
  }, [perLessaPayload, handleCalculatePerLessa]);

  const handleSubclauseChange = (param: FullParameter) => {
    setSelectedSubclauses(prev =>
      prev.some(p => p.parameterId === param.parameterId)
        ? prev.filter(p => p.parameterId !== param.parameterId)
        : [...prev, param]
    );
  };

  const handleCalculate = useCallback(async () => {
    if (!fullPayload || isCalculatingRef.current) {
      return;
    }
    try {
      setIsCalculating(true);
      const result = await calculatePlotBaseValue(fullPayload);
      setMarketValueState(result.totalValue);
      setMarketValue(result.totalValue); // Update store
      setCalculationResult(result); // Store detailed result
      saveToHistory(result); // Save to history
      if (onCalculate) onCalculate(result.totalValue);
      toast({ title: 'Market Value Calculated', description: `Base Value: ₹${result.totalValue.toLocaleString()}` });
    } catch (err: any) {
      console.error(err);
      toast({ title: 'Failed to calculate', description: err?.message || 'Unknown error', variant: 'destructive' });
    } finally {
      setIsCalculating(false);
    }
  }, [fullPayload, onCalculate, toast]);

  // Navigate to stamp duty page with pre-filled market value
  const navigateToStampDuty = () => {
    const valueToUse = marketValue || totalMarketValuationWithRate || localTotalValue;

    if (!valueToUse) {
      toast({
        title: 'No Market Value',
        description: 'Please calculate the market value first before proceeding to stamp duty calculation.',
        variant: 'destructive'
      });
      return;
    }

    window.dispatchEvent(
      new CustomEvent('navigate-to-tab', {
        detail: { tab: 'stamp-duty-calculator', initialMarketValue: valueToUse },
      })
    );
  };

  const getSelectedParameterCodes = () => {
    const allSelectedParams = [
      ...selectedSubclauses,
      mainRoadBand,
      metalRoadBand,
      mainMarketBand,
    ].filter((p): p is FullParameter => p !== null);
    if (onApproachRoadWidth) {
      if (onApproachRoad1stBand && approachRoad1stBand) allSelectedParams.push(approachRoad1stBand);
      if (onApproachRoad2ndBand && approachRoad2ndBand) allSelectedParams.push(approachRoad2ndBand);
    }
    const dynamicSubParamCodes: string[] = [];
    selectedSubParameters.forEach((subParamCode, paramCode) => {
      const subParams = subParametersMap.get(paramCode);
      const subParam = subParams?.find(sp => sp.subParameterCode === subParamCode);
      if (subParam) dynamicSubParamCodes.push(subParam.subParameterCode.toString());
    });
    return [
      ...allSelectedParams.map(p => (p as any).parameterCode?.toString() || (p as any).code?.toString() || ''),
      ...dynamicSubParamCodes,
    ].filter(code => code !== '');
  };

  const getSavePayload = () => {
    const getSelectedParametersForPayload = () => {
       const params: FullParameter[] = [];
       selectedSubclauses.forEach(p => params.push(p));
       if (onMainRoad && mainRoadBand) params.push(mainRoadBand);
       if (onMetalRoad && metalRoadBand) params.push(metalRoadBand);
       if (onMainMarket && mainMarketBand) params.push(mainMarketBand);
       if (onApproachRoadWidth && approachRoad1stBand) params.push(approachRoad1stBand);
       if (onApproachRoadWidth && approachRoad2ndBand) params.push(approachRoad2ndBand);
       return params;
     };

    const getSelectedDynamicParameters = () => {
       const dynamicParams: { parameterCode: string; parameterName: string }[] = [];
       selectedParameters.forEach(paramCode => {
         const param = dynamicParameters.find(p => p.parameterCode === paramCode);
         if (param) {
           dynamicParams.push({
             parameterCode: param.parameterCode,
             parameterName: param.parameterName
           });
         }
       });
       return dynamicParams;
     };

    const selectedParametersForPayload = getSelectedParametersForPayload();
    const selectedDynamicParams = getSelectedDynamicParameters();
    const effectiveRoadWidth = onRoad && roadWidth ? parseFloat(roadWidth) : undefined;
    const effectiveDistanceFromRoad = !onRoad && distanceFromRoad ? parseFloat(distanceFromRoad) : undefined;
    
    // Build plotLandDetails conditionally based on locationMethod
    const plotLandDetails: PlotLandDetailsPayload = {
      locationMethod: locationMethod,
    };
    
    if (locationMethod === 'manual') {
      // For manual method: send parameters with their sub-parameters
      const allParameters = [
        ...selectedParametersForPayload.map(param => ({
          parameterCode: param.parameterCode,
          parameterName: param.parameter,
          subParameters: Array.from(selectedSubParameters.entries())
            .filter(([key, value]) => key.startsWith(param.parameterCode) && value !== '')
            .map(([key, value]) => {
              const subParamCode = value;
              const subParam = subParametersMap.get(param.parameterCode)?.find(sp => sp.subParameterCode === subParamCode);
              return {
                subParameterCode: subParamCode,
                subParameterName: subParam?.subParameterName || '',
              };
            }),
        })),
        ...selectedDynamicParams.map(param => ({
          parameterCode: param.parameterCode,
          parameterName: param.parameterName,
          subParameters: Array.from(selectedSubParameters.entries())
            .filter(([key, value]) => key === param.parameterCode && value !== '')
            .map(([key, value]) => {
              const subParamCode = value;
              const subParam = subParametersMap.get(param.parameterCode)?.find(sp => sp.subParameterCode === subParamCode);
              return {
                subParameterCode: subParamCode,
                subParameterName: subParam?.subParameterName || '',
              };
            }),
        }))
      ];
      plotLandDetails.parameters = allParameters;
    } else {
      // For GIS method: only send checkbox fields
      plotLandDetails.onRoad = onRoad;
      plotLandDetails.cornerPlot = cornerPlot;
      plotLandDetails.litigatedPlot = litigatedPlot;
      plotLandDetails.hasTenant = hasTenant;
      plotLandDetails.roadWidth = effectiveRoadWidth;
      plotLandDetails.distanceFromRoad = effectiveDistanceFromRoad;
    }
    
    const basePayload: PayloadExternal = {
       jurisdictionInformationExternal: {
         districtCode: selectedDistrictCode,
         circleCode: selectedCircleCode,
         mouzaCode: selectedMouzaCode,
         villageCode: selectedVillageCode,
         lotCode: selectedLot?.code || '',
         plotNo: plotNo || undefined,
         currentLandUse: currentLandUse,
       },
       landTypeDetailsExternal: {
         currentLandType: landUseChange ? (newLandUse || '') : (currentLandType || ''),
         landUseChange: landUseChange,
         newLandCategoryType: landUseChange ? (newLandUse || undefined) : undefined,
         areaType: areaType,
         areaDetailsExternal: { totalLessa },
       },
       plotLandDetailsExternal: plotLandDetails,
        structureDetails: getStructureDetails ? (getStructureDetails() || {}) : {},
       totalMarketValuation: totalMarketValuationWithRate || undefined,
     };
     const consolePayload: ConsolePayload = {
       mode: locationMethod,
       payloadExternal: basePayload,
     };
    if (locationMethod === 'gis' && daagFactorInfo) {
      consolePayload.gisInfo = {
        factor: daagFactorInfo.factor,
        source: daagFactorInfo.source,
        areaDetails: daagFactorInfo.areaDetails || null,
      };
    }
    return consolePayload;
  };

  // Save to backend at `VITE_JURISDICTION_API_BASE_URL` or fallback to localhost:8081
  const [isSaving, setIsSaving] = useState(false);
  const handleSaveToServer = async () => {
    const payload = getSavePayload();
    if (!payload) {
      toast({ title: 'Nothing to save', description: 'Payload is empty.', variant: 'destructive' });
      return;
    }

    const base = import.meta.env?.VITE_JURISDICTION_API_BASE_URL || 'http://localhost:8081';
    const url = `${base.replace(/\/$/, '')}/valuation/calculate`;
    const token = localStorage.getItem('authToken') || localStorage.getItem('jwtToken') || '';
    try {
      setIsSaving(true);
      const resp = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: token.startsWith('Bearer ') ? token : `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(text || `HTTP ${resp.status}`);
      }

      const data = await resp.json();
      // Expecting { savedId: number, message: string, status: 'SUCCESS' }
      toast({ title: 'Saved', description: data?.message || 'Valuation saved successfully.' });

      if (data?.savedId) {
        // Optionally fetch the saved record to confirm and maybe update UI
        try {
          const getUrl = `${base.replace(/\/$/, '')}/valuation/by-plot/${encodeURIComponent(String(data.savedId))}`;
          const getResp = await fetch(getUrl, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              ...(token ? { Authorization: token.startsWith('Bearer ') ? token : `Bearer ${token}` } : {}),
            },
          });
          if (getResp.ok) {
            const savedRecord = await getResp.json();
            // Optionally update UI/store with savedRecord
            console.debug('Saved valuation record:', savedRecord);
          }
        } catch (err) {
          console.debug('Failed to fetch saved record', err);
        }
      }
    } catch (err: any) {
      console.error('Save failed', err);
      toast({ title: 'Save failed', description: err?.message || 'Unknown error', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  // Reset function to clear all form data
  const handleReset = () => {
    // Reset all form states to initial values
    setSelectedDistrictCode('');
    setSelectedCircleCode('');
    setSelectedMouzaCode('');
    setSelectedVillageCode('');
    setSelectedLotId('');
    setCurrentLandUse('');
    setNewLandUse('');
    setLandUseChange(false);
    setAreaType('RURAL');
    setAreaBigha('');
    setAreaKatha('');
    setAreaLessa('');
    setCornerPlot(false);
    setLitigatedPlot(false);
    setHasTenant(false);
    setRoadWidth('');
    setDistanceFromRoad('');
    setOnMainRoad(false);
    setOnMetalRoad(false);
    setOnMainMarket(false);
    setOnNonRoad(false);
    setOnApproachRoadWidth(false);
    setSelectedSubclauses([]);
    setDynamicParameters([]);
    setSubParametersMap(new Map());
    setSelectedParameters(new Set());
    setSelectedSubParameters(new Map());
    setCalculationResult(null);
    setSelectedHistoryId('');
    setBasePriceLandUse(null);
    setNewBasePriceLandUse(null);
    setDaagFactorInfo(null);
    
    // Clear localStorage
    localStorage.removeItem('plotFormData');
    
    toast({
      title: 'Form Reset',
      description: 'All form data has been cleared.',
      duration: 3000,
    });
  };

  useImperativeHandle(ref, () => ({
    handleCalculate,
    getSavePayload,
  }));

  // New: handler to lookup daag-based geographical factor
  // Handle dynamic parameter selection and sub-parameter fetching
  const handleParameterToggle = async (parameterCode: string, checked: boolean) => {
    const newSelected = new Set(selectedParameters);
    
    if (checked) {
      newSelected.add(parameterCode);
      // Fetch sub-parameters when parameter is selected
      if (!subParametersMap.has(parameterCode)) {
        setLoadingSubParams(prev => new Set(prev).add(parameterCode));
        try {
          const response = await getSubParameterDetailsAllByParameterCode(parameterCode);
          if (response.data && response.data.length > 0) {
            setSubParametersMap(prev => new Map(prev).set(parameterCode, response.data));
          }
        } catch (error) {
          console.error(`Failed to fetch sub-parameters for ${parameterCode}:`, error);
          toast({ 
            title: 'Error loading bands', 
            description: 'Could not load parameter bands. Please try again.', 
            variant: 'destructive' 
          });
        } finally {
          setLoadingSubParams(prev => {
            const next = new Set(prev);
            next.delete(parameterCode);
            return next;
          });
        }
      }
    } else {
      newSelected.delete(parameterCode);
      // Remove selected sub-parameter when parameter is unchecked
      setSelectedSubParameters(prev => {
        const next = new Map(prev);
        next.delete(parameterCode);
        return next;
      });
    }
    
    setSelectedParameters(newSelected);
  };

  const handleSubParameterSelect = (parameterCode: string, subParameterCode: string) => {
    setSelectedSubParameters(prev => new Map(prev).set(parameterCode, subParameterCode));
  };

  const handleDaagLookup = async () => {
    if (!selectedDistrictCode || !selectedCircleCode || !selectedMouzaCode || !selectedVillageCode || !selectedLotId) {
      toast({ title: 'Missing selection', description: 'Please select District, Circles, Mouza, Village and Lot before lookup.', variant: 'destructive' });
      return;
    }
    if (!plotNo?.trim()) {
      toast({ title: 'Daag number required', description: 'Enter a Daag / Plot No. to lookup.', variant: 'destructive' });
      return;
    }
    try {
      setIsDaagLookupLoading(true);
      setDaagFactorInfo(null);

      const res = await fetchCircleLotFactor({
        districtCode: selectedDistrictCode,
        circleCode: selectedCircleCode,
        mouzaCode: selectedMouzaCode,
        villageCode: selectedVillageCode,
        lotCode: selectedLot?.code, // Use the code from the found lot
        daagNumber: plotNo.trim(),
      });
      setDaagFactorInfo(res);
      // Autofill area details (assuming res includes area info; adjust based on actual API response)
      if (res.areaDetails) {
        setAreaBigha(res.areaDetails.bigha?.toString() || '');
        setAreaKatha(res.areaDetails.katha?.toString() || '');
        setAreaLessa(res.areaDetails.lessa?.toString() || '');
        toast({ title: 'Daag found & Area autofilled', description: `Geographical factor: ${res.factor} (${res.source === 'EXISTING' ? 'Existing' : 'Derived average'})` });
      } else {
        toast({ title: 'Daag found', description: `Geographical factor: ${res.factor} (${res.source === 'EXISTING' ? 'Existing' : 'Derived average'})` });
      }
    } catch (err: any) {
      console.error('Daag lookup failed', err);
      toast({ title: 'No specific factor found', description: 'Using default Lot-level factor or auto-derived average during calculation.', variant: 'default' });
    } finally {
      setIsDaagLookupLoading(false);
    }
  };

  // Cache management functions
  const saveToHistory = (result: any) => {
    const historyItem: CalculationHistory = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      formData: {
        selectedDistrictCode,
        selectedCircleCode,
        selectedMouzaCode,
        selectedVillageCode,
        selectedLotId,
        plotNo,
        currentLandUse,
        landUseChange,
        newLandUse,
        currentLandType,
        areaType,
        areaBigha,
        areaKatha,
        areaLessa,
        locationMethod,
        onRoad,
        cornerPlot,
        litigatedPlot,
        hasTenant,
        roadWidth,
        distanceFromRoad,
        selectedSubclauseIds: selectedSubclauses.map(p => p.parameterId.toString()),
        // Include cascading bands
        mainRoadBandId: mainRoadBand?.parameterId?.toString() || '',
        metalRoadBandId: metalRoadBand?.parameterId?.toString() || '',
        mainMarketBandId: mainMarketBand?.parameterId?.toString() || '',
        onMainRoad,
        onMetalRoad,
      },
      result,
      description: `${districts.find(d => d.code === selectedDistrictCode)?.name || 'Unknown'} - ${circles.find(c => c.code === selectedCircleCode)?.name || 'Unknown'} - Plot ${plotNo || 'N/A'}`
    };
    const updatedHistory = [historyItem, ...calculationHistory.slice(0, 9)]; // Keep only 10 most recent
    setCalculationHistory(updatedHistory);
    localStorage.setItem('plot-calculation-history', JSON.stringify(updatedHistory));
  };

  const loadFromHistory = (historyId: string) => {
    const historyItem = calculationHistory.find(item => item.id === historyId);
    if (!historyItem) return;
    const { formData } = historyItem;
    // Restore form state
    setSelectedDistrictCode(formData.selectedDistrictCode || '');
    setSelectedCircleCode(formData.selectedCircleCode || '');
    setSelectedMouzaCode(formData.selectedMouzaCode || '');
    setSelectedVillageCode(formData.selectedVillageCode || '');
    setSelectedLotId(formData.selectedLotId || '');
    setPlotNo(formData.plotNo || '');
    setCurrentLandUse(formData.currentLandUse || '');
    setLandUseChange(formData.landUseChange || false);
    setNewLandUse(formData.newLandUse || '');
    setCurrentLandType(formData.currentLandType || '');
    setAreaType(formData.areaType || 'RURAL');
    setAreaBigha(formData.areaBigha || '');
    setAreaKatha(formData.areaKatha || '');
    setAreaLessa(formData.areaLessa || '');
    setLocationMethod(formData.locationMethod || 'manual');
    setOnRoad(formData.onRoad || false);
    setCornerPlot(formData.cornerPlot || false);
    setLitigatedPlot(formData.litigatedPlot || false);
    setHasTenant(formData.hasTenant || false);
    setRoadWidth(formData.roadWidth || '');
    setDistanceFromRoad(formData.distanceFromRoad || '');
    setOnMainRoad(formData.onMainRoad || false);
    setOnMetalRoad(formData.onMetalRoad || false);
    // Restore parameters
    if (formData.selectedSubclauseIds && parameters.length > 0) {
      const params = formData.selectedSubclauseIds
        .map(idStr => parameters.find(p => p.parameterId.toString() === idStr))
        .filter((p): p is FullParameter => p !== null);
      setSelectedSubclauses(params);
    }
    if (formData.mainRoadBandId && parameters.length > 0) {
      const param = parameters.find(p => p.parameterId.toString() === formData.mainRoadBandId);
      setMainRoadBand(param || null);
    }
    if (formData.metalRoadBandId && parameters.length > 0) {
      const param = parameters.find(p => p.parameterId.toString() === formData.metalRoadBandId);
      setMetalRoadBand(param || null);
    }
    if (formData.mainMarketBandId && parameters.length > 0) {
      const param = parameters.find(p => p.parameterId.toString() === formData.mainMarketBandId);
      setMainMarketBand(param || null);
    }
    // Set calculation result
    setCalculationResult(historyItem.result);
    setMarketValueState(historyItem.result.totalValue);
  };

  // Helper to get band suffix (1st, 2nd, 3rd)
  const getBandSuffix = (index: number) => {
    if (index === 0) return '1st';
    if (index === 1) return '2nd';
    return '3rd';
  };

  function handleSave(event: MouseEvent<HTMLButtonElement>): void {
    handleSaveToServer();
  }

  return (
    <div className="space-y-6 w-full max-w-full">
      {/* Jurisdiction Info - Modern gradient design */}
      <Card className="relative overflow-hidden shadow-md border border-border rounded-lg bg-card">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent" />
        <CardHeader className="p-5 bg-muted/30 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <CardTitle className="text-lg font-semibold text-foreground">
                Jurisdiction Information
              </CardTitle>
            </div>
            {isJurisdictionComplete && (
              <div className="flex items-center gap-1.5 bg-success/10 text-success px-2.5 py-1 rounded-full text-xs font-medium">
                <CheckCircle className="w-3.5 h-3.5" />
                Complete
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-1">
                <MapPin className="w-3 h-3 text-gray-500" />
                District
              </Label>
              <Select value={selectedDistrictCode} onValueChange={setSelectedDistrictCode}>
              <SelectTrigger className="ring-1 ring-border focus:ring-gray-500 transition-all duration-200 focus:ring-2 focus:ring-ring">
                <SelectValue placeholder="Select Districts" />
              </SelectTrigger>
                <SelectContent>
                  {districts.map((dist) => (
                    <SelectItem key={dist.code} value={dist.code}>
                      {dist.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-1">
                <Layers className="w-3 h-3 text-gray-500" />
                Circle
              </Label>
              <Select value={selectedCircleCode} onValueChange={setSelectedCircleCode}>
              <SelectTrigger className="ring-1 ring-border focus:ring-gray-500 transition-all duration-200 focus:ring-2 focus:ring-ring">
                <SelectValue placeholder="Select Circle" />
              </SelectTrigger>
                <SelectContent>
                  {circles.map((circ) => (
                    <SelectItem key={circ.code} value={circ.code}>
                      {circ.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-1">
                <Home className="w-3 h-3 text-gray-500" />
                Mouza
              </Label>
              <Select value={selectedMouzaCode} onValueChange={(value) => {
                setSelectedMouzaCode(value);
                const selectedMouza = mouzas.find(m => m.code === value);
                if (selectedMouza) {
                  setBasePriceMouza(selectedMouza.basePriceMouza || null);
                } else {
                  setBasePriceMouza(null);
                }
              }}>
                <SelectTrigger className="ring-1 ring-border focus:ring-gray-500 transition-all duration-200 focus:ring-2 focus:ring-ring">
                  <SelectValue placeholder="Select Mouza" />
                </SelectTrigger>
                <SelectContent>
                  {mouzas.map((mouza) => (
                    <SelectItem key={mouza.code} value={mouza.code}>
                      {mouza.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {basePriceMouza !== null && (
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    Mouza Base: ₹{basePriceMouza.toLocaleString()}
                  </p>
                )}
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-1">
                <Ruler className="w-3 h-3 text-gray-500" />
                Lot
              </Label>
              <Select value={selectedLotId} onValueChange={(val) => {
                // Removed console.log for production
                setSelectedLotId(val);
              }}>
              <SelectTrigger className="ring-1 ring-border focus:ring-gray-500 transition-all duration-200 focus:ring-2 focus:ring-ring">
                <SelectValue>
                  {lots.find((lot) => lot.id === selectedLotId)?.name ||
                      "Select Lot"}
                </SelectValue>
              </SelectTrigger>
                <SelectContent>
                  {lots.map((lot) => (
                    <SelectItem key={lot.id} value={lot.id}>
                      {lot.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedLot && basePriceLot !== null && (
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-amber-500" />
                  Lot Increase: {basePriceLot}%
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-1">
                <Home className="w-3 h-3 text-gray-500" />
                Village
              </Label>
              <Select value={selectedVillageCode} onValueChange={(value) => {
    setSelectedVillageCode(value);
    const selectedVillage = villages.find((v) => v.code === value);
    if (selectedVillage?.areaType) {
      setAreaType(selectedVillage.areaType);
    } else if (selectedVillage?.isUrban !== undefined) {
      setAreaType(selectedVillage.isUrban ? 'URBAN' : 'RURAL');
    }
    if (selectedVillage?.landCategory && landCategories.length > 0) {
      const match = landCategories.find((c) => (c.name?.toLowerCase?.() || '') === selectedVillage.landCategory.toLowerCase());
      if (match && match.id !== undefined) {
        const idStr = String(match.id);
        setCurrentLandUse(idStr);
        setCurrentLandType(idStr);
        setBasePriceLandUse(match.basePriceMouzaIncrease ?? null);
      }
    }
  }}>
              <SelectTrigger className="ring-1 ring-border focus:ring-gray-500 transition-all duration-200 focus:ring-2 focus:ring-ring">
                <SelectValue placeholder="Select Village" />
              </SelectTrigger>
                <SelectContent>
                  {villages.map((village) => (
                    <SelectItem key={village.code} value={village.code}>
                      {village.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Current Land Use / Type - Always shown */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-1">
                <Home className="w-3 h-3 text-gray-500" />
                Current Land Use / Type
              </Label>
              <Select value={currentLandUse} onValueChange={(val) => {
                setCurrentLandUse(val);
                setCurrentLandType(val); // Auto-populate current land type
                const category = landCategories.find(c => String(c.id) === val);
                // Removed console.logs for production
                setBasePriceLandUse(category ? category.basePriceMouzaIncrease || null : null);
              }} disabled={true}>
                <SelectTrigger className="ring-1 ring-border focus:ring-gray-500 transition-all duration-200 focus:ring-2 focus:ring-ring">
                  <SelectValue placeholder="Select Current Land Use" />
                </SelectTrigger>
                <SelectContent>
                  {landCategories
                    .filter(category => category && category.id !== null && category.id !== undefined && String(category.id).trim() !== '')
                    .map((category) => (
                      <SelectItem
                        key={String(category.id)}
                        value={String(category.id)}
                      >
                        {category?.name ?? `Category ${String(category.id)}`}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {/* Show old calc (basePriceLandUse) only if No change */}
              {!landUseChange && basePriceLandUse !== null && (
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                  <Home className="w-3 h-3 text-gray-500" />
                  Land Use Increase: {basePriceLandUse}%
                </p>
              )}
            </div>
          </div>
          {selectedMouzaCode && selectedVillageCode && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6 pt-4 border-t border-border">
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-1">
                  <Ruler className="w-3 h-3 text-gray-500" />
                  Daag / Plot No.
                </Label>
                <div className="flex gap-2">
                  <Input
                    value={plotNo}
                    onChange={(e) => setPlotNo(e.target.value)}
                    placeholder="Enter Daag / Plot No."
                    className="w-full ring-1 ring-border focus:ring-gray-500 transition-all duration-200 focus:ring-2 focus:ring-ring"
                  />
                  <Button variant="secondary" onClick={handleDaagLookup} disabled={isDaagLookupLoading} className="px-3 py-2 text-sm h-9 transition-transform hover:scale-[0.99] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed w-full md:w-auto">
                    {isDaagLookupLoading ? (<span className="flex items-center gap-2"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Looking...</span>) : 'Lookup'}
                  </Button>
                </div>
                {daagFactorInfo && (
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    Factor: {daagFactorInfo.factor} ({daagFactorInfo.source === 'EXISTING' ? 'Existing' : 'Derived average'})
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-1">
                  <Ruler className="w-3 h-3 text-gray-500" />
                  Area Details
                </Label>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <Input
                      placeholder="Bigha"
                      value={areaBigha}
                      onChange={(e) => setAreaBigha(e.target.value)}
                      type="number"
                      aria-invalid={areaBighaInvalid}
                      className="ring-1 ring-border focus:ring-gray-500 transition-all duration-200 focus:ring-2 focus:ring-ring aria-[invalid=true]:border-destructive aria-[invalid=true]:focus:ring-destructive"
                    />
                    <p className="text-xs text-muted-foreground">Bigha</p>
                    {areaBighaInvalid && (<p className="text-xs text-destructive">Enter a valid non-negative number</p>)}
                  </div>
                  <div className="space-y-1">
                    <Input
                      placeholder="Katha"
                      value={areaKatha}
                      onChange={(e) => setAreaKatha(e.target.value)}
                      type="number"
                      aria-invalid={areaKathaInvalid}
                      className="ring-1 ring-border focus:ring-gray-500 transition-all duration-200 focus:ring-2 focus:ring-ring aria-[invalid=true]:border-destructive aria-[invalid=true]:focus:ring-destructive"
                    />
                    <p className="text-xs text-muted-foreground">Katha</p>
                    {areaKathaInvalid && (<p className="text-xs text-destructive">Enter a valid non-negative number</p>)}
                  </div>
                  <div className="space-y-1">
                    <Input
                      placeholder="Lessa"
                      value={areaLessa}
                      onChange={(e) => setAreaLessa(e.target.value)}
                      type="number"
                      aria-invalid={areaLessaInvalid}
                      className="ring-1 ring-border focus:ring-gray-500 transition-all duration-200 focus:ring-2 focus:ring-ring aria-[invalid=true]:border-destructive aria-[invalid=true]:focus:ring-destructive"
                    />
                    <p className="text-xs text-muted-foreground">Lessa</p>
                    {areaLessaInvalid && (<p className="text-xs text-destructive">Enter a valid non-negative number</p>)}
                  </div>
                </div>
                {totalLessa > 0 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Total Area: {totalLessa} Lessa
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-1">
                  <Layers className="w-3 h-3 text-gray-500" />
                  Area Type
                </Label>
                <RadioGroup value={areaType} onValueChange={(value) => setAreaType(value as 'RURAL' | 'URBAN')} className="space-y-2" disabled={true}>
                  <div className="flex items-center justify-start gap-6 p-2 bg-muted/50 rounded-md">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="RURAL" id="rural" />
                      <Label htmlFor="rural" className="text-sm">Rural</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="URBAN" id="urban" />
                      <Label htmlFor="urban" className="text-sm">Urban</Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Land Type - Modern gradient design */}
      <Card className="relative overflow-hidden shadow-md border border-border rounded-lg bg-card">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent" />
        <CardHeader className="p-5 bg-muted/30 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Home className="w-5 h-5 text-primary" />
              </div>
              <CardTitle className="text-lg font-semibold text-foreground">
                Land Type Details
              </CardTitle>
            </div>
            {isLandTypeComplete && (
              <div className="flex items-center gap-1.5 bg-success/10 text-success px-2.5 py-1 rounded-full text-xs font-medium">
                <CheckCircle className="w-3.5 h-3.5" />
                Complete
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-amber-500" />
              New Land Use?
            </Label>
            <RadioGroup value={landUseChange ? 'yes' : 'no'} onValueChange={(v) => setLandUseChange(v === 'yes')} className="space-y-2">
              <div className="flex items-center justify-start gap-6 p-2 bg-muted/50 rounded-md">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="no-change" />
                  <Label htmlFor="no-change" className="text-sm">No</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="yes-change" />
                  <Label htmlFor="yes-change" className="text-sm">Yes</Label>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Select if the plot is being used for the first time</p>
            </RadioGroup>
          </div>

          {/* New Land Use Type and Area Type - Only when change */}
          {landUseChange && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-1">
                  <Home className="w-3 h-3 text-gray-500" />
                  New Land Use Type
                </Label>
                <Select value={newLandUse} onValueChange={(val) => {
                  setNewLandUse(val);
                  const category = landCategories.find(c => String(c.id) === val);
                  setNewBasePriceLandUse(category ? category.basePriceMouzaIncrease || null : null);
                }}>
                  <SelectTrigger className="ring-1 ring-border focus:ring-gray-500">
                    <SelectValue placeholder="Select New Land Use Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {landCategories
                      .filter(category => category.id !== null && category.id !== undefined && String(category.id).trim() !== '')
                      .map((category) => (
                        <SelectItem
                          key={String(category.id)}
                          value={String(category.id)}
                        >
                          {category.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {/* Show new calc (newBasePriceLandUse) when Yes */}
                {newBasePriceLandUse !== null && (
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <Home className="w-3 h-3 text-gray-500" />
                    New Land Use Increase: {newBasePriceLandUse}%
                  </p>
                )}
              </div>
            </div>
          )}



          {/* Display Per Lessa Value */}
          {perLessaValue !== null && (
            <Card className="border-success/30 bg-success/5">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-1">Market Value per Lessa</p>
                  <p className="text-2xl font-bold text-success">₹{perLessaValue.toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Display Local Total Value */}
          {localTotalValue !== null && (
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-1">Total Market Value (Area Based)</p>
                  <p className="text-2xl font-bold text-primary">₹{localTotalValue.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground mt-1">Based on {totalLessa} Lessa (without location factors)</p>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Plot Land Details - Industrial Maroon Design */}
      <Card className="relative overflow-hidden shadow-md border border-border rounded-lg bg-card w-full">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent" />
        <CardHeader className="p-5 bg-muted/30 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Ruler className="w-5 h-5 text-primary" />
              </div>
              <CardTitle className="text-lg font-semibold text-foreground">
                Plot Land Details
              </CardTitle>
            </div>
            {isLocationComplete && (
              <div className="flex items-center gap-1.5 bg-success/10 text-success px-2.5 py-1 rounded-full text-xs font-medium">
                <CheckCircle className="w-3.5 h-3.5" />
                Complete
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-1">
              <MapPin className="w-3 h-3 text-gray-500" />
              Geographical Characteristics of the Land
            </Label>
            <RadioGroup value={locationMethod} onValueChange={(value: "manual" | "gis") => setLocationMethod(value)} className="space-y-2">
              <div className="flex items-center justify-start gap-6 p-2 bg-muted/50 rounded-md">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="manual" id="manual" />
                  <Label htmlFor="manual" className="text-sm">Manual</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="gis" id="gis" />
                  <Label htmlFor="gis" className="text-sm">GIS</Label>
                </div>
              </div>
            </RadioGroup>
          </div>

          {locationMethod === 'manual' ? (
            <div className="space-y-4">
              <Label className="text-sm font-medium flex items-center gap-1">
                <Layers className="w-3 h-3 text-gray-500" />
                Select Parameters
              </Label>

              {/* Dynamic Parameters with Cascading Sub-parameters */}
              {loadingParameters ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  <span className="text-muted-foreground">Loading parameters...</span>
                </div>
              ) : dynamicParameters.length > 0 ? (
                <div className="space-y-4">
                  {dynamicParameters.map((param) => (
                    <div key={param.parameterCode} className="space-y-2 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`param-${param.parameterCode}`}
                          checked={selectedParameters.has(param.parameterCode)}
                          onCheckedChange={(checked) => handleParameterToggle(param.parameterCode, Boolean(checked))}
                        />
                        <Label htmlFor={`param-${param.parameterCode}`} className="text-sm font-medium cursor-pointer flex-1">
                          {param.parameterName}
                        </Label>
                      </div>
                      
                      {/* Show sub-parameter dropdown when parameter is selected */}
                      {selectedParameters.has(param.parameterCode) && (
                        <div className="ml-6 mt-2">
                          {loadingSubParams.has(param.parameterCode) ? (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                              <Loader2 className="w-3 h-3 animate-spin" />
                              Loading bands...
                            </div>
                          ) : subParametersMap.get(param.parameterCode)?.length ? (
                            <div className="space-y-2">
                              <Select
                                value={selectedSubParameters.get(param.parameterCode) || ''}
                                onValueChange={(value) => handleSubParameterSelect(param.parameterCode, value)}
                              >
                                <SelectTrigger className="w-full bg-background">
                                  <SelectValue placeholder="Select band / range" />
                                </SelectTrigger>
                                <SelectContent className="bg-background z-50">
                                  {subParametersMap.get(param.parameterCode)!.map((subParam) => (
                                    <SelectItem key={subParam.subParameterCode} value={subParam.subParameterCode}>
                                      {subParam.subParameterName}
                                      {subParam.basePriceIncreaseSubParameter && 
                                        ` (+${subParam.basePriceIncreaseSubParameter}%)`}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              {selectedSubParameters.get(param.parameterCode) && (
                                <p className="text-xs text-muted-foreground">
                                  Selected: {subParametersMap.get(param.parameterCode)?.find(
                                    sp => sp.subParameterCode === selectedSubParameters.get(param.parameterCode)
                                  )?.subParameterName}
                                </p>
                              )}
                            </div>
                          ) : (
                            <p className="text-xs text-muted-foreground py-2">
                              No bands available for this parameter
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No parameters available
                </div>
              )}
              {loadingParameters ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-muted-foreground">Loading parameters...</div>
                </div>
              ) : flatParameters.length > 0 ? (
                <div className="space-y-3 p-2 border rounded-md">
                  {flatParameters.map((param) => (
                    <div key={param.parameterId} className="flex items-start space-x-3 p-3 hover:bg-muted/50 rounded-lg transition-colors">
                      <Checkbox
                        id={`parameter-${param.parameterId}`}
                        checked={selectedSubclauses.some(p => p.parameterId === param.parameterId)}
                        onCheckedChange={() => handleSubclauseChange(param)}
                      />
                      <Label htmlFor={`parameter-${param.parameterId}`} className="text-sm text-foreground cursor-pointer flex-1">
                        {param.parameter} {param.minMaxRange ? `(${param.minMaxRange})` : ''}
                      </Label>
                    </div>
                  ))}
                </div>
              ) : parameters.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No additional parameters available.
                </div>
              ) : null}



              {!hideCalculateButton && marketValue !== null && (
                <div className="space-y-4 pt-4">
                  <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-300 shadow-lg animate-in fade-in slide-in-from-bottom-1">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-center mb-4">
                        <CheckCircle className="w-6 h-6 text-green-500 mr-2" />
                        <CardTitle className="text-xl font-bold text-gray-800">Property Valuation Result</CardTitle>
                      </div>
                      <div className="bg-white rounded-lg p-6 shadow-inner mb-4">
                        <p className="text-sm text-muted-foreground mb-2">Total Market Value</p>
                        <p className="text-4xl font-bold text-gray-800 mb-2">₹{marketValue.toLocaleString('en-IN')}</p>
                        <p className="text-xs text-muted-foreground">Based on current guideline rates and property specifications</p>
                      </div>
                      <div className="flex flex-wrap gap-2 justify-center">
                        <Button
                          onClick={() => setShowDetailedBreakdown(!showDetailedBreakdown)}
                          variant="outline"
                          className="flex items-center gap-2 transition-transform hover:scale-[0.99] active:scale-[0.98] w-full md:w-auto h-9 px-3 py-2 text-sm"
                        >
                          <Calculator className="w-3.5 h-3.5" />
                          {showDetailedBreakdown ? 'Hide Details' : 'Show Breakdown'}
                        </Button>
                        <Button
                          onClick={handleSaveToServer}
                          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 transition-transform hover:scale-[0.99] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed w-full md:w-auto h-9 px-3 py-2 text-sm text-white"
                          disabled={!isJurisdictionComplete || !isLandTypeComplete || !isLocationComplete || isSaving}
                        >
                          {isSaving ? 'Saving...' : 'Save'}
                        </Button>
                        <Button
                          onClick={navigateToStampDuty}
                          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 transition-transform hover:scale-[0.99] active:scale-[0.98] w-full md:w-auto h-9 px-3 py-2 text-sm"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          Stamp Duty
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                        <Button
                          onClick={() => {
                            const valueToCopy = marketValue || totalMarketValuationWithRate || localTotalValue;
                            if (!valueToCopy) {
                              toast({ title: 'No value to copy', description: 'Calculate a value first.', variant: 'destructive' });
                              return;
                            }
                            navigator.clipboard.writeText(String(valueToCopy));
                            toast({ title: 'Copied', description: `₹${valueToCopy.toLocaleString('en-IN')} copied to clipboard` });
                          }}
                          variant="secondary"
                          className="flex items-center gap-2 transition-transform hover:scale-[0.99] active:scale-[0.98] w-full md:w-auto h-9 px-3 py-2 text-sm"
                        >
                          <Copy className="w-3.5 h-3.5" /> Copy
                        </Button>
                        <Button
                          onClick={() => {
                            setSelectedDistrictCode('');
                            setSelectedCircleCode('');
                            setSelectedMouzaCode('');
                            setSelectedVillageCode('');
                            setSelectedLotId('');
                            setPlotNo('');
                            setCurrentLandUse('');
                            setLandUseChange(false);
                            setNewLandUse('');
                            setCurrentLandType('');
                            setAreaType('RURAL');
                            setAreaBigha('');
                            setAreaKatha('');
                            setAreaLessa('');
                            setMarketValueState(null);
                            setPerLessaValueState(null);
                            setOnRoad(false);
                            setCornerPlot(false);
                            setLitigatedPlot(false);
                            setHasTenant(false);
                            setRoadWidth('');
                            setDistanceFromRoad('');
                            setLocationMethod('manual');
                            setOnMainRoad(false);
                            setOnMetalRoad(false);
                            setOnMainMarket(false);
                            setOnNonRoad(false);
                            setOnApproachRoadWidth(false);
                            setOnApproachRoad1stBand(false);
                            setOnApproachRoad2ndBand(false);
                            setMainRoadBand(null);
                            setMetalRoadBand(null);
                            setMainMarketBand(null);
                            setApproachRoad1stBand(null);
                            setApproachRoad2ndBand(null);
                            setSelectedSubclauses([]);
                            setCalculationResult(null);
                            setShowDetailedBreakdown(false);
                            toast({ title: 'Form reset', description: 'All inputs cleared.' });
                          }}
                          variant="outline"
                          className="flex items-center gap-2 transition-transform hover:scale-[0.99] active:scale-[0.98] w-full md:w-auto h-9 px-3 py-2 text-sm"
                        >
                          <RotateCcw className="w-3.5 h-3.5" /> Reset
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {showDetailedBreakdown && calculationResult && (
                    <Card className="border-border bg-card">
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base">
                          <Calculator className="w-4 h-4" />
                          Detailed Calculation Breakdown
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                          <div className="bg-muted/30 rounded-md p-3 text-center border border-border/50">
                            <div className="text-xs text-muted-foreground mb-1">Mouza Base</div>
                            <div className="text-sm font-semibold text-foreground">₹{basePriceMouza?.toLocaleString('en-IN') || 'N/A'}</div>
                          </div>
                          <div className="bg-muted/30 rounded-md p-3 text-center border border-border/50">
                            <div className="text-xs text-muted-foreground mb-1">Lot Factor</div>
                            <div className="text-sm font-semibold text-foreground">{basePriceLot ? `${basePriceLot}%` : 'N/A'}</div>
                          </div>
                          <div className="bg-muted/30 rounded-md p-3 text-center border border-border/50">
                            <div className="text-xs text-muted-foreground mb-1">Land Use</div>
                            <div className="text-sm font-semibold text-foreground">{landUseIncrease ? `${landUseIncrease}%` : 'N/A'}</div>
                          </div>
                          <div className="bg-muted/30 rounded-md p-3 text-center border border-border/50">
                            <div className="text-xs text-muted-foreground mb-1">Plot Base</div>
                            <div className="text-sm font-semibold text-foreground">₹{plotLevelBaseValue?.toLocaleString('en-IN') || 'N/A'}</div>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="bg-muted/30 rounded-md p-3 text-center border border-border/50">
                            <div className="text-xs text-muted-foreground mb-1">Area Type</div>
                            <div className="text-sm font-semibold text-foreground">{areaType}</div>
                          </div>
                          <div className="bg-muted/30 rounded-md p-3 text-center border border-border/50">
                            <div className="text-xs text-muted-foreground mb-1">Total Area</div>
                            <div className="text-sm font-semibold text-foreground">
                              {areaBigha && `${areaBigha}B `}
                              {areaKatha && `${areaKatha}K `}
                              {areaLessa && `${areaLessa}L`}
                            </div>
                          </div>
                          <div className="bg-muted/30 rounded-md p-3 text-center border border-border/50">
                            <div className="text-xs text-muted-foreground mb-1">Location</div>
                            <div className="text-sm font-semibold text-foreground">
                              {[onRoad && 'Road', cornerPlot && 'Corner', litigatedPlot && 'Litigated'].filter(Boolean).join(', ') || 'Standard'}
                            </div>
                          </div>
                        </div>
                        {/* Calculation Formula */}
                        <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                          <h4 className="font-semibold mb-3 text-blue-800 flex items-center gap-2">
                            <Calculator className="w-4 h-4" />
                            Calculation Formula
                          </h4>
                          <div className="space-y-2 text-sm">
                            <div className="bg-white/70 rounded-md p-3 border border-blue-100">
                              <div className="text-blue-700 font-medium mb-1">Step 1: Base Price Calculation</div>
                              <div className="text-gray-700 font-mono text-xs">
                                Mouza Base × Lot Factor × Land Use Factor × Parameters = Plot Level Base
                              </div>
                              <div className="text-gray-600 font-mono text-xs mt-1">
                                ₹{basePriceMouza?.toLocaleString('en-IN')} × {basePriceLot ? `${basePriceLot}%` : '0%'} × {landUseIncrease !== 0 ? `${landUseIncrease}%` : '0%'} × {parameterWeightPercent !== 0 ? `${parameterWeightPercent}%` : '0%'} = ₹{plotLevelBaseValue?.toLocaleString('en-IN') || '0'}
                              </div>
                            </div>
                            <div className="bg-white/70 rounded-md p-3 border border-blue-100">
                              <div className="text-blue-700 font-medium mb-1">Step 2: Total Market Value</div>
                              <div className="text-gray-700 font-mono text-xs">
                                Plot Level Base × Total Area = Total Market Value
                              </div>
                              <div className="text-gray-600 font-mono text-xs mt-1">
                                ₹{plotLevelBaseValue?.toLocaleString('en-IN') || '0'} × {totalLessa} Lessa = ₹{marketValue?.toLocaleString('en-IN') || '0'}
                              </div>
                            </div>
                          </div>
                        </div>
                        {calculationResult.breakdown && (
                          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                            <h4 className="font-semibold mb-2">Additional Calculation Details:</h4>
                            <pre className="text-xs text-gray-600 overflow-x-auto">
                              {JSON.stringify(calculationResult.breakdown, null, 2)}
                            </pre>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                  <Checkbox
                    checked={onRoad}
                    onCheckedChange={(checked) => setOnRoad(Boolean(checked))}
                    id="on-road"
                  />
                  <Label htmlFor="on-road" className="text-sm font-medium flex items-center gap-1">
                    <Ruler className="w-3 h-3 text-gray-500" />
                    On Road
                  </Label>
                </div>
                {onRoad ? (
                  <div className="space-y-2 p-3 bg-muted/30 rounded-lg">
                    <Label className="text-sm flex items-center gap-1">
                      <Ruler className="w-3 h-3 text-gray-500" />
                      Road Width (ft)
                    </Label>
                    <Input
                      type="number"
                      value={roadWidth}
                      onChange={(e) => setRoadWidth(e.target.value)}
                      placeholder="Enter road width"
                      className="ring-1 ring-border focus:ring-gray-500 transition-all duration-200 focus:ring-2 focus:ring-ring"
                    />
                  </div>
                ) : (
                  <div className="space-y-2 p-3 bg-muted/30 rounded-lg">
                    <Label className="text-sm flex items-center gap-1">
                      <Ruler className="w-3 h-3 text-gray-500" />
                      Distance from Road (ft)
                    </Label>
                    <Input
                      type="number"
                      value={distanceFromRoad}
                      onChange={(e) => setDistanceFromRoad(e.target.value)}
                      placeholder="Enter distance from road"
                      className="ring-1 ring-border focus:ring-gray-500 transition-all duration-200 focus:ring-2 focus:ring-ring"
                    />
                  </div>
                )}
              </div>
              <div className="space-y-3 pt-4 border-t border-border">
                <Label className="text-sm font-medium flex items-center gap-1">
                  <Users className="w-3 h-3 text-gray-500" />
                  Additional Attributes
                </Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors">
                    <Checkbox
                      checked={cornerPlot}
                      onCheckedChange={(checked) => setCornerPlot(Boolean(checked))}
                      id="corner-plot"
                    />
                    <Label htmlFor="corner-plot" className="text-sm flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-amber-500" />
                      Corner Plot
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors">
                    <Checkbox
                      checked={litigatedPlot}
                      onCheckedChange={(checked) => setLitigatedPlot(Boolean(checked))}
                      id="litigated-plot"
                    />
                    <Label htmlFor="litigated-plot" className="text-sm flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-red-500" />
                      Litigated Plot
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors">
                    <Checkbox
                      checked={hasTenant}
                      onCheckedChange={(checked) => setHasTenant(Boolean(checked))}
                      id="has-tenant"
                    />
                    <Label htmlFor="has-tenant" className="text-sm flex items-center gap-1">
                      <Users className="w-3 h-3 text-gray-500" />
                      Has Tenant
                    </Label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Calculated Values and Actions Card - Industrial Maroon Design */}
      <Card className="relative overflow-hidden shadow-md border border-border rounded-lg bg-card w-full">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent" />
        <CardHeader className="p-5 bg-muted/30 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Calculator className="w-5 h-5 text-primary" />
            </div>
            <CardTitle className="text-lg font-semibold text-foreground">
              Calculated Values
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-5 space-y-5">
          {/* Plot Level Base Value */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-1.5 text-foreground">
              <Info className="w-3.5 h-3.5 text-primary" />
              Calculated Plot Level Base Value
            </Label>
            <div className="p-4 bg-muted/30 rounded-lg border border-border">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Base Value per Lessa:</span>
                <span className="font-bold text-xl text-primary">
                  ₹{plotLevelBaseValue?.toLocaleString('en-IN') || '0'}
                </span>
              </div>
              {basePriceMouza !== null && (
                <div className="mt-3 pt-3 border-t border-border">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Calculation Factors:</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <div className="bg-white/50 rounded-md p-2 text-center border border-border/50">
                      <div className="text-xs text-muted-foreground">Mouza Base</div>
                      <div className="text-sm font-semibold text-foreground">₹{basePriceMouza.toLocaleString('en-IN')}</div>
                    </div>
                    <div className="bg-white/50 rounded-md p-2 text-center border border-border/50">
                      <div className="text-xs text-muted-foreground">Lot Factor</div>
                      <div className="text-sm font-semibold text-foreground">{basePriceLot !== null ? `${basePriceLot}%` : '0%'}</div>
                    </div>
                    <div className="bg-white/50 rounded-md p-2 text-center border border-border/50">
                      <div className="text-xs text-muted-foreground">Land Use</div>
                      <div className="text-sm font-semibold text-foreground">{landUseIncrease !== 0 ? `${landUseIncrease}%` : '0%'}</div>
                    </div>
                    <div className="bg-white/50 rounded-md p-2 text-center border border-border/50">
                      <div className="text-xs text-muted-foreground">Parameters</div>
                      <div className="text-sm font-semibold text-foreground">{parameterWeightPercent !== 0 ? `${parameterWeightPercent}%` : '0%'}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Total Market Valuation */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-1.5 text-foreground">
              <Home className="w-3.5 h-3.5 text-success" />
              Total Market Valuation
            </Label>
            <div className="p-4 bg-success/5 rounded-lg border border-success/30">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Value:</span>
                <span className="font-bold text-xl text-success">
                  ₹{totalMarketValuationWithRate?.toLocaleString('en-IN') || '0'}
                </span>
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                {totalLessa > 0 ? `For ${totalLessa} Lessa` : 'Enter area to calculate'}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4 pt-4 border-t border-border">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Button 
                onClick={navigateToStampDuty}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium h-9 px-3 py-2 text-sm"
                disabled={!totalMarketValuationWithRate}
              >
                <Calculator className="w-3.5 h-3.5 mr-2" />
                Stamp Duty
              </Button>
              
              <Button 
                onClick={handleSaveToServer}
                className="bg-success hover:bg-success/90 text-success-foreground font-medium h-9 px-3 py-2 text-sm"
                disabled={!totalMarketValuationWithRate || isSaving}
              >
                <FileText className="w-3.5 h-3.5 mr-2" />
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
                
              <Button 
                onClick={handleReset}
                variant="destructive"
                className="font-medium h-9 px-3 py-2 text-sm"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-2" />
                Reset
              </Button>
            </div>
            
            {!hideCalculateButton && (
              <Button 
                onClick={handleCalculate}
                className={`w-full h-9 text-sm font-medium rounded-md shadow-sm transition-all duration-200 ${
                  isCalculating || !hasBaseValue
                    ? 'bg-muted text-muted-foreground cursor-not-allowed'
                    : 'bg-primary hover:bg-primary/90 text-primary-foreground hover:shadow-md'
                }`}
                disabled={isCalculating || !hasBaseValue}
              >
                {isCalculating ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                    Calculating...
                  </>
                ) : (
                  <>
                    <Calculator className="w-3.5 h-3.5 mr-2" />
                    Calculate
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* History Dropdown - Industrial Maroon Design */}
      {!hideCalculateButton && calculationHistory.length > 0 && (
        <Card className="relative overflow-hidden shadow-md border border-border rounded-lg bg-card w-full">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent" />
          <CardHeader className="p-5 bg-muted/30 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <History className="w-5 h-5 text-primary" />
              </div>
              <CardTitle className="text-lg font-semibold text-foreground">
                Calculation History
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-5">
            <div className="space-y-3">
              <Select value={selectedHistoryId} onValueChange={(value) => {
                setSelectedHistoryId(value);
                if (value) loadFromHistory(value);
              }}>
                <SelectTrigger className="border-input">
                  <SelectValue placeholder="Load previous calculation..." />
                </SelectTrigger>
                <SelectContent>
                  {calculationHistory.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground">{item.description}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(item.timestamp).toLocaleDateString()} - ₹{item.result.totalValue.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {calculationHistory.length} calculation{calculationHistory.length !== 1 ? 's' : ''} saved
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
});

PlotForm.displayName = 'PlotForm';

export default PlotForm;

