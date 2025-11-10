import { useEffect, useState, forwardRef, useImperativeHandle, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCirclesByDistrict, getAllDistricts, getMouzasByDistrictAndCircle, getAllLandCategories } from '@/services/locationService';
import type { District, Circle, Mouza, LandClass, Lot } from '@/types/masterData';
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
import { fetchLots } from '@/services/masterDataService';
import { calculatePlotBaseValue } from '@/services/masterDataService';
import { useToast } from '@/hooks/use-toast';
import { getParameterDetails, type Parameter } from "@/services/parameterService";
import { ComprehensiveValuationRequest } from '@/types/valuation';
import { Badge } from '@/components/ui/badge';
import { Info, MapPin, Home, Layers, AlertTriangle, Users, Ruler, CheckCircle, Calculator, FileText, History, ExternalLink } from 'lucide-react'; // Assuming Lucide React for icons

interface FullParameter extends Parameter {
  parameterId: number;
  parameter: string;
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
    village?: any; // For backward compatibility
  };
  // New: allow parent to receive live form data
  onDataChange?: (data: any) => void;
}
export interface PlotFormRef {
  handleCalculate: () => void;
}
// Placeholder data
const PlotForm = forwardRef<PlotFormRef, PlotFormProps>(({ onCalculate, hideCalculateButton, initialLocationData, onDataChange }, ref) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // All states grouped at the top
  const [landCategories, setLandCategories] = useState<LandClass[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [circles, setCircles] = useState<Circle[]>([]);
  const [mouzas, setMouzas] = useState<Mouza[]>([]);
  const [lots, setLots] = useState<Lot[]>([]);
  const [selectedDistrictCode, setSelectedDistrictCode] = useState('');
  const [selectedCircleCode, setSelectedCircleCode] = useState('');
  const [selectedMouzaCode, setSelectedMouzaCode] = useState('');
  const [basePriceMouza, setBasePriceMouza] = useState<number | null>(null);
  const [selectedLotId, setSelectedLotId] = useState('');
  const [basePriceLot, setBasePriceLot] = useState<number | null>(null);
  const [plotNo, setPlotNo] = useState('');
  const [currentLandUse, setCurrentLandUse] = useState('');
  const [landUseChange, setLandUseChange] = useState(false);
  const [newLandUse, setNewLandUse] = useState('');
  const [currentLandType, setCurrentLandType] = useState('');
  const [areaType, setAreaType] = useState<'RURAL' | 'URBAN'>('RURAL');
  const [marketValue, setMarketValue] = useState<number | null>(null);
  const [perLessaValue, setPerLessaValue] = useState<number | null>(null);
  const [areaBigha, setAreaBigha] = useState('');
  const [areaKatha, setAreaKatha] = useState('');
  const [areaLessa, setAreaLessa] = useState('');
  // Updated: Band selections now hold FullParameter objects
  const [mainRoadBand, setMainRoadBand] = useState<FullParameter | null>(null);
  const [metalRoadBand, setMetalRoadBand] = useState<FullParameter | null>(null);
  const [mainMarketBand, setMainMarketBand] = useState<FullParameter | null>(null);
  const [totalLessa, setTotalLessa] = useState(0);
  const [locationMethod, setLocationMethod] = useState('manual');
  const [onRoad, setOnRoad] = useState(false);
  const [cornerPlot, setCornerPlot] = useState(false);
  const [litigatedPlot, setLitigatedPlot] = useState(false);
  const [hasTenant, setHasTenant] = useState(false);
  const [roadWidth, setRoadWidth] = useState('');
  const [distanceFromRoad, setDistanceFromRoad] = useState('');
  const [onMainRoad, setOnMainRoad] = useState(false);
  const [onMetalRoad, setOnMetalRoad] = useState(false);
  const [onMainMarket, setOnMainMarket] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [selectedSubclauses, setSelectedSubclauses] = useState<FullParameter[]>([]);
  const [parameters, setParameters] = useState<FullParameter[]>([]);
  const [loadingParameters, setLoadingParameters] = useState<boolean>(true);
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
    return Math.round(basePriceMouza * lotMultiplier * landUseMultiplier);
  }, [basePriceMouza, basePriceLot, landUseIncrease]);
  const hasBaseValue = useMemo(() => {
    return selectedDistrictCode && selectedCircleCode && selectedMouzaCode && selectedLotId && !!selectedLandUseCode && plotLevelBaseValue !== null;
  }, [selectedDistrictCode, selectedCircleCode, selectedMouzaCode, selectedLotId, selectedLandUseCode, plotLevelBaseValue]);
  // Local total value based on per lessa * total lessa
  const localTotalValue = useMemo(() => {
    if (perLessaValue !== null && totalLessa > 0) {
      return Math.round(perLessaValue * totalLessa);
    }
    return null;
  }, [perLessaValue, totalLessa]);
  // Rate percent based on area type
  const ratePercent = useMemo(() => areaType === 'RURAL' ? 0.02 : 0.01, [areaType]);
  // Total Market Valuation with Rate
  const totalMarketValuationWithRate = useMemo(() => {
    if (plotLevelBaseValue !== null && totalLessa > 0) {
      const baseSubtotal = plotLevelBaseValue * totalLessa;
      return Math.round(baseSubtotal * (1 + ratePercent));
    }
    return null;
  }, [plotLevelBaseValue, totalLessa, ratePercent]);
  // NEW: Band weights map (hardcoded based on business logic; can be fetched from API if added)
  const bandWeights = useMemo(() => ({
    // Main Road bands (areaTypeId 1 - Rural example)
    12: 15, // 1st band Distance from Main Road (0-150m)
    13: 10, // 2nd band (150-450m)
    // Assume 14: 5 for 3rd band if exists
    // Metal Road bands (areaTypeId 2 - Urban example)
    5: 10, // 1st band Distance from Main Road (0-500m)
    // Assume more for 2nd/3rd
    // Main Market bands (mixed areaTypeId)
    18: 5, // 1st band Distance from Main Market (0-100m)
    19: 2.5, // 2nd band (100-200m)
    2: 1, // 3rd band (200-400m)
    // Approach road width bands
    15: 15, // 1st band width (0-10ft) - assume weight
    16: 10, // 2nd band (10-20ft)
    // Add more as per business rules or API enhancement
  }), []);
  // NEW: Grouped bands for cascading
  const paramGroups = useMemo(() => ({
    mainRoad: {
      label: 'Whether on Main Road',
      bands: parameters
        .filter(p => p.parameter.includes('Distance from Main Road') && p.areaTypeId === 1)
        .sort((a, b) => a.minRangeInMeters - b.minRangeInMeters)
    },
    metalRoad: {
      label: 'Whether on Metal Road',
      bands: parameters
        .filter(p => p.parameter.includes('Distance from Main Road') && p.areaTypeId === 2)
        .sort((a, b) => a.minRangeInMeters - b.minRangeInMeters)
    },
    mainMarket: {
      label: null, // Always visible
      bands: parameters
        .filter(p => p.parameter.includes('Distance from Main Market'))
        .sort((a, b) => a.minRangeInMeters - b.minRangeInMeters)
    }
    // Add more groups e.g., approachRoadWidth if replacing input with bands
  }), [parameters]);
  // NEW: Flat parameters excluding cascading ones
  const flatParameters = useMemo(() =>
    parameters.filter(p =>
      !p.parameter.includes('band') &&
      !p.parameter.startsWith('Whether on') &&
      !p.parameter.includes('Distance from Main') &&
      !p.parameter.includes('width of approach road')
    ), [parameters]);

  // Section completion states
  const isJurisdictionComplete = selectedDistrictCode && selectedCircleCode && selectedMouzaCode && selectedLotId && plotNo && currentLandUse;
  const isLandTypeComplete = !!selectedLandUseCode && totalLessa > 0;
  const isLocationComplete = locationMethod === 'manual' ?
    (onRoad ? roadWidth : distanceFromRoad) :
    true;

  // Effect to load saved form data from sessionStorage
  useEffect(() => {
    const savedFormData = sessionStorage.getItem('plotFormState');
    if (savedFormData) {
      const formData = JSON.parse(savedFormData);
      setSelectedDistrictCode(formData.selectedDistrictCode || '');
      setSelectedCircleCode(formData.selectedCircleCode || '');
      setSelectedMouzaCode(formData.selectedMouzaCode || '');
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
      setMarketValue(formData.marketValue || null);
      setPerLessaValue(formData.perLessaValue || null);
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
    }
  }, []);

  // Effect to load parameter-related saved data after parameters are loaded
  useEffect(() => {
    if (parameters.length === 0) return;
    const savedFormData = sessionStorage.getItem('plotFormState');
    if (savedFormData) {
      const formData = JSON.parse(savedFormData);
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
      if (formData.selectedSubclauseIds) {
        const params = formData.selectedSubclauseIds
          .map(idStr => parameters.find(p => p.parameterId.toString() === idStr))
          .filter((p): p is FullParameter => p !== null);
        setSelectedSubclauses(params);
      }
    }
  }, [parameters]);

  // Effect to save form data to sessionStorage whenever relevant state changes
  useEffect(() => {
    const formData = {
      selectedDistrictCode,
      selectedCircleCode,
      selectedMouzaCode,
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
    };
    sessionStorage.setItem('plotFormState', JSON.stringify(formData));
  }, [selectedDistrictCode, selectedCircleCode, selectedMouzaCode, selectedLotId, plotNo, currentLandUse, landUseChange, newLandUse, currentLandType, areaType, areaBigha, areaKatha, areaLessa, marketValue, perLessaValue, mainRoadBand, metalRoadBand, mainMarketBand, selectedSubclauses, locationMethod, onRoad, cornerPlot, litigatedPlot, hasTenant, roadWidth, distanceFromRoad, onMainRoad, onMetalRoad]);

  useEffect(() => {
    const bigha = parseFloat(areaBigha) || 0;
    const katha = parseFloat(areaKatha) || 0;
    const lessa = parseFloat(areaLessa) || 0;
    // 1 Bigha = 5 Katha, 1 Katha = 20 Lessa, so 1 Bigha = 100 Lessa
    setTotalLessa(bigha * 100 + katha * 20 + lessa);
  }, [areaBigha, areaKatha, areaLessa]);

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
      });
    }
  }, [
    onDataChange,
    selectedDistrictCode,
    selectedCircleCode,
    selectedMouzaCode,
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
        let mouzaCode = initialLocationData?.mouza?.code || initialLocationData?.village?.code;
        try {
          const data = await getMouzasByDistrictAndCircle(selectedDistrictCode, selectedCircleCode);
          setMouzas(data);
          if (mouzaCode) {
            setSelectedMouzaCode(mouzaCode);
            const selectedMouza = data.find(m => m.code === mouzaCode);
            if (selectedMouza) {
              setBasePriceMouza(selectedMouza.basePriceMouza || null);
            }
          }
        } catch (error) {
          console.error('Error fetching mouzas:', error);
        } finally {
          // Ensure basePriceMouza is reset if no mouza is selected or an error occurs
          if (!selectedMouzaCode) {
            setBasePriceMouza(null);
          }
        }
      };
      fetchMouzas();
    } else {
      setMouzas([]);
      setSelectedMouzaCode('');
      setBasePriceMouza(null); // Reset base price when no mouza is selected
    }
  }, [selectedDistrictCode, selectedCircleCode, initialLocationData]);

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
        const data = await fetchLots(selectedDistrictCode, selectedCircleCode);
        setLots(data);
        console.log("Fetched Lots:", data); // Log the fetched lots
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
        const response = await getParameterDetails(0, 500);
        if (response.data) setParameters(response.data as FullParameter[]);
      } catch (error) {
        console.error('Failed to fetch parameters:', error);
        setParameters([]);
      } finally {
        setLoadingParameters(false);
      }
    };
    fetchParameters();
  }, []);

  // Auto-calculate per lessa when base value is ready
  useEffect(() => {
    if (hasBaseValue && !isCalculating) {
      handleCalculatePerLessa();
    }
  }, [hasBaseValue]);

  const handleSubclauseChange = (param: FullParameter) => {
    setSelectedSubclauses(prev =>
      prev.some(p => p.parameterId === param.parameterId)
        ? prev.filter(p => p.parameterId !== param.parameterId)
        : [...prev, param]
    );
  };

  const handleCalculate = async () => {
    try {
      setIsCalculating(true);
      const effectiveRoadWidth = onRoad && roadWidth ? parseFloat(roadWidth) : undefined;
      const effectiveDistanceFromRoad = !onRoad && distanceFromRoad ? parseFloat(distanceFromRoad) : undefined;
      const landTypeDetails: any = {
        landUseChange: landUseChange,
        areaType: areaType,
        areaDetails: {
          totalLessa: totalLessa
        }
      };
      if (!landUseChange) {
        landTypeDetails.currentLandType = currentLandType;
      } else {
        landTypeDetails.newLandCategoryType = newLandUse;
      }
      // Updated: All selected parameter IDs (flat + cascading bands)
      const allSelectedParams = [...selectedSubclauses, mainRoadBand, metalRoadBand, mainMarketBand].filter((p): p is FullParameter => p !== null);
      const allSelectedParamIds = allSelectedParams.map(p => p.parameterId.toString());
      const payload: ComprehensiveValuationRequest = {
        jurisdictionInformation: {
          districtCode: selectedDistrictCode,
          circleCode: selectedCircleCode,
          mouzaCode: selectedMouzaCode,
          lotCode: selectedLot?.code, // Use the code from the found lot
          plotNo: plotNo || undefined,
          currentLandUse: currentLandUse
        },
        landTypeDetails,
        plotLandDetails: {
          locationMethod: locationMethod as 'manual' | 'gis',
          onRoad: onRoad,
          cornerPlot: cornerPlot,
          litigatedPlot: litigatedPlot,
          hasTenant: hasTenant,
          roadWidth: effectiveRoadWidth,
          distanceFromRoad: effectiveDistanceFromRoad,
          selectedParameterIds: allSelectedParamIds.length > 0 ? allSelectedParamIds : undefined
        }
      };
      const result = await calculatePlotBaseValue(payload as ComprehensiveValuationRequest);
      setMarketValue(result.totalValue);
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
  };

  const handleCalculatePerLessa = async () => {
    if (!hasBaseValue) {
      toast({ title: 'Insufficient Data', description: 'Please complete Jurisdiction Information and Land Use selection first.', variant: 'destructive' });
      return;
    }
    try {
      setIsCalculating(true);
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
      const allSelectedParamIds = allSelectedParams.map(p => p.parameterId.toString());
      const payload: ComprehensiveValuationRequest = {
        jurisdictionInformation: {
          districtCode: selectedDistrictCode,
          circleCode: selectedCircleCode,
          mouzaCode: selectedMouzaCode,
          lotCode: selectedLot?.code, // Use the code from the found lot
          plotNo: plotNo || undefined,
          currentLandUse: currentLandUse
        },
        landTypeDetails,
        plotLandDetails: {
          locationMethod: locationMethod as 'manual' | 'gis',
          onRoad: onRoad,
          cornerPlot: cornerPlot,
          litigatedPlot: litigatedPlot,
          hasTenant: hasTenant,
          roadWidth: effectiveRoadWidth,
          distanceFromRoad: effectiveDistanceFromRoad,
          selectedParameterIds: allSelectedParamIds.length > 0 ? allSelectedParamIds : undefined
        }
      };
      const result = await calculatePlotBaseValue(payload as ComprehensiveValuationRequest);
      setPerLessaValue(result.totalValue);
      toast({ title: 'Market Value per Lessa Calculated', description: `₹${result.totalValue.toLocaleString()} per Lessa` });
    } catch (err: any) {
      console.error(err);
      toast({ title: 'Failed to calculate per Lessa', description: err?.message || 'Unknown error', variant: 'destructive' });
    } finally {
      setIsCalculating(false);
    }
  };

  // Navigate to stamp duty page with pre-filled market value
  const navigateToStampDuty = () => {
    if (!marketValue) {
      toast({
        title: 'No Market Value',
        description: 'Please calculate the market value first before proceeding to stamp duty calculation.',
        variant: 'destructive'
      });
      return;
    }
    // Navigate to stamp duty page, passing marketValue as state
     navigate('/', { state: { tab: 'stamp-duty-calculator', initialMarketValue: marketValue } });
  };

  useImperativeHandle(ref, () => ({
    handleCalculate,
  }));

  // New: handler to lookup daag-based geographical factor
  const handleDaagLookup = async () => {
    if (!selectedDistrictCode || !selectedCircleCode || !selectedMouzaCode || !selectedLotId) {
      toast({ title: 'Missing selection', description: 'Please select District, Circles, Mouza and Lot before lookup.', variant: 'destructive' });
      return;
    }
    if (!plotNo?.trim()) {
      toast({ title: 'Daag number required', description: 'Enter a Daag / Plot No. to lookup.', variant: 'destructive' });
      return;
    }
    try {
      setIsDaagLookupLoading(true);
      setDaagFactorInfo(null);
      const { fetchCircleLotFactor } = await import('@/services/masterDataService');
      const res = await fetchCircleLotFactor({
        districtCode: selectedDistrictCode,
        circleCode: selectedCircleCode,
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
    setMarketValue(historyItem.result.totalValue);
  };

  // Helper to get band suffix (1st, 2nd, 3rd)
  const getBandSuffix = (index: number) => {
    if (index === 0) return '1st';
    if (index === 1) return '2nd';
    return '3rd';
  };

  return (
    <div className="space-y-6">
      {/* Jurisdiction Info - Neutral theme with icons */}
      <Card className={`relative overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl border-gray-200 bg-gradient-to-br from-gray-50/50 to-gray-100/50`}>
        <div className={`absolute top-0 left-0 w-full h-1 transition-colors duration-300 bg-gray-300`} />
        <CardHeader className={`relative z-10 rounded-t-lg p-4 bg-gradient-to-r from-gray-100/50 to-gray-200/50 border-b border-gray-200/50`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-gray-600" />
              <CardTitle className="text-xl font-bold text-gray-700">
                Jurisdiction Information
              </CardTitle>
            </div>
            {isJurisdictionComplete && (
              <div className="flex items-center gap-1 text-sm font-medium text-gray-600">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Complete
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-1">
                <MapPin className="w-3 h-3 text-gray-500" />
                District
              </Label>
              <Select value={selectedDistrictCode} onValueChange={setSelectedDistrictCode}>
                <SelectTrigger className="ring-1 ring-border focus:ring-gray-500">
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
                <SelectTrigger className="ring-1 ring-border focus:ring-gray-500">
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
                <SelectTrigger className="ring-1 ring-border focus:ring-gray-500">
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
                console.log("Lot Select - onValueChange - val:", val);
                setSelectedLotId(val);
              }}>
                <SelectTrigger className="ring-1 ring-border focus:ring-gray-500">
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
                console.log("PlotForm - category for Current Land Use:", category);
                console.log("PlotForm - basePriceMouzaIncrease for Current Land Use:", category?.basePriceMouzaIncrease);
                setBasePriceLandUse(category ? category.basePriceMouzaIncrease || null : null);
              }}>
                <SelectTrigger className="ring-1 ring-border focus:ring-gray-500">
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
        </CardContent>
      </Card>
      {/* Land Type - Neutral theme with icons */}
      <Card className={`relative overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl border-gray-200 bg-gradient-to-br from-gray-50/50 to-gray-100/50`}>
        <div className={`absolute top-0 left-0 w-full h-1 transition-colors duration-300 bg-gray-300`} />
        <CardHeader className={`relative z-10 rounded-t-lg p-4 bg-gradient-to-r from-gray-100/50 to-gray-200/50 border-b border-gray-200/50`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Home className="w-5 h-5 text-gray-600" />
              <CardTitle className="text-xl font-bold text-gray-700">
                Land Type Details
              </CardTitle>
            </div>
            {isLandTypeComplete && (
              <div className="flex items-center gap-1 text-sm font-medium text-gray-600">
                <CheckCircle className="w-4 h-4 text-green-500" />
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
          {/* NEW: Base Value Calculation Display - Moved to Land Type Details when fields are filled - Neutral theme */}
          {hasBaseValue && (
            <div className="mt-6 pt-4 border-t border-border bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <Info className="w-4 h-4 text-gray-600" />
                  Calculated Plot Level Base Value
                </h3>
                <Badge variant="secondary" className="text-gray-600 border-gray-200 bg-gray-100">
                  Formula: District Base × Geo Factor × Conversion
                </Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="bg-white rounded-md p-3 shadow-sm border">
                  <p className="text-gray-500 text-xs uppercase tracking-wide">Mouza Base</p>
                  <p className="font-mono font-semibold text-gray-800">₹{basePriceMouza?.toLocaleString()}</p>
                </div>
                <div className="bg-white rounded-md p-3 shadow-sm border">
                  <p className="text-gray-500 text-xs uppercase tracking-wide">Lot Adjustment</p>
                  <p className={`font-mono font-semibold ${basePriceLot > 0 ? 'text-green-600' : 'text-gray-600'}`}>
                    +{basePriceLot}%
                  </p>
                </div>
                <div className="bg-white rounded-md p-3 shadow-sm border">
                  <p className="text-gray-500 text-xs uppercase tracking-wide">Land Use Adjustment</p>
                  <p className={`font-mono font-semibold ${landUseIncrease > 0 ? 'text-green-600' : 'text-gray-600'}`}>
                    +{landUseIncrease}%
                  </p>
                </div>
              </div>
              <div className="mt-4 p-3 bg-gray-100 text-gray-800 rounded-lg border border-gray-200">
                <p className="text-sm opacity-90">Plot Level Base Value</p>
                <p className="text-2xl font-bold">₹{plotLevelBaseValue.toLocaleString()}</p>
                <p className="text-xs opacity-75 mt-1">Per unit area (in lessa)</p>
              </div>
            </div>
          )}
          {/* Moved: Daag/Plot No, Area Details, Area Type, and Displays under Base Value */}
          <div className="mt-6 space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                    className="w-full ring-1 ring-border focus:ring-gray-500" // Shorten the input field
                  />
                  <Button variant="secondary" onClick={handleDaagLookup} disabled={isDaagLookupLoading} className="px-3">
                    {isDaagLookupLoading ? 'Looking...' : 'Lookup'}
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
                      className="ring-1 ring-border focus:ring-gray-500"
                    />
                    <p className="text-xs text-muted-foreground">Bigha</p>
                  </div>
                  <div className="space-y-1">
                    <Input
                      placeholder="Katha"
                      value={areaKatha}
                      onChange={(e) => setAreaKatha(e.target.value)}
                      type="number"
                      className="ring-1 ring-border focus:ring-gray-500"
                    />
                    <p className="text-xs text-muted-foreground">Katha</p>
                  </div>
                  <div className="space-y-1">
                    <Input
                      placeholder="Lessa"
                      value={areaLessa}
                      onChange={(e) => setAreaLessa(e.target.value)}
                      type="number"
                      className="ring-1 ring-border focus:ring-gray-500"
                    />
                    <p className="text-xs text-muted-foreground">Lessa</p>
                  </div>
                </div>
                {totalLessa > 0 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Total Area: {totalLessa} Lessa
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-1">
                <MapPin className="w-3 h-3 text-gray-500" />
                Area Type
              </Label>
              <RadioGroup value={areaType} onValueChange={(v) => setAreaType(v as 'RURAL' | 'URBAN')} className="space-y-2">
                <div className="flex items-center justify-start gap-6 p-2 bg-muted/50 rounded-md">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="RURAL" id="rural" />
                    <Label htmlFor="rural" className="text-sm">RURAL</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="URBAN" id="urban" />
                    <Label htmlFor="urban" className="text-sm">URBAN</Label>
                  </div>
                </div>
              </RadioGroup>
              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-gray-500" />
                Selected Area Type: {areaType} ({areaType === 'RURAL' ? '2%' : '1%'})
              </p>
              {/* New Card: Total Market Valuation with Rate - Placed under Area Type */}
              {totalMarketValuationWithRate !== null && (
                <Card className="border-purple-200 bg-purple-50">
                  <CardContent className="p-4">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-1">Total Market Valuation (incl. {areaType} Rate)</p>
                      <p className="text-2xl font-bold text-purple-800">₹{totalMarketValuationWithRate.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground mt-1">Based on {totalLessa} Lessa + {ratePercent * 100}% adjustment</p>
                      <Button
                        onClick={() => navigate('/', { state: { tab: 'stamp-duty-calculator', initialMarketValue: totalMarketValuationWithRate } })}
                        className="mt-4 bg-purple-600 hover:bg-purple-700 text-white"
                      >
                        Calculate Stamp Duty
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
            {/* Display Per Lessa Value */}
            {perLessaValue !== null && (
              <Card className="border-green-200 bg-green-50">
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-1">Market Value per Lessa</p>
                    <p className="text-2xl font-bold text-green-800">₹{perLessaValue.toLocaleString()}</p>
                  </div>
                </CardContent>
              </Card>
            )}
            {/* Display Local Total Value */}
            {localTotalValue !== null && (
              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-1">Total Market Value (Area Based)</p>
                    <p className="text-2xl font-bold text-blue-800">₹{localTotalValue.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground mt-1">Based on {totalLessa} Lessa (without location factors)</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>
      {/* Plot Land Details - Neutral theme with icons */}
      <Card className={`relative overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl border-gray-200 bg-gradient-to-br from-gray-50/50 to-gray-100/50`}>
        <div className={`absolute top-0 left-0 w-full h-1 transition-colors duration-300 bg-gray-300`} />
        <CardHeader className={`relative z-10 rounded-t-lg p-4 bg-gradient-to-r from-gray-100/50 to-gray-200/50 border-b border-gray-200/50`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Ruler className="w-5 h-5 text-gray-600" />
              <CardTitle className="text-xl font-bold text-gray-700">
                Plot Land Details
              </CardTitle>
            </div>
            {isLocationComplete && (
              <div className="flex items-center gap-1 text-sm font-medium text-gray-600">
                <CheckCircle className="w-4 h-4 text-green-500" />
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
            <RadioGroup value={locationMethod} onValueChange={setLocationMethod} className="space-y-2">
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
              {/* NEW: Cascading Parameters - Replace hardcoded with dynamic groups */}
              {/* Main Road Group */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="onMainRoad"
                    checked={onMainRoad}
                    onCheckedChange={(checked) => {
                      setOnMainRoad(Boolean(checked));
                      if (!checked && mainRoadBand) {
                        setMainRoadBand(null);
                      }
                    }}
                  />
                  <Label htmlFor="onMainRoad" className="text-sm">Whether on Main Road</Label>
                </div>
                {onMainRoad && paramGroups.mainRoad.bands.length > 0 && (
                  <Select
                    value={mainRoadBand?.parameterId?.toString() || ''}
                    onValueChange={(val) => {
                      const param = paramGroups.mainRoad.bands.find(p => p.parameterId.toString() === val);
                      setMainRoadBand(param || null);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Distance Band" />
                    </SelectTrigger>
                    <SelectContent>
                      {paramGroups.mainRoad.bands.map((p) => (
                        <SelectItem key={p.parameterId} value={p.parameterId.toString()}>
                          {p.parameter}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {mainRoadBand && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Selected: {mainRoadBand.parameter} ({mainRoadBand.minMaxRange}) - Weight: {bandWeights[mainRoadBand.parameterId] || 0}%
                  </p>
                )}
              </div>
              {/* Metal Road Group */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="onMetalRoad"
                    checked={onMetalRoad}
                    onCheckedChange={(checked) => {
                      setOnMetalRoad(Boolean(checked));
                      if (!checked && metalRoadBand) {
                        setMetalRoadBand(null);
                      }
                    }}
                  />
                  <Label htmlFor="onMetalRoad" className="text-sm">Whether on Metal Road</Label>
                </div>
                {onMetalRoad && paramGroups.metalRoad.bands.length > 0 && (
                  <Select
                    value={metalRoadBand?.parameterId?.toString() || ''}
                    onValueChange={(val) => {
                      const param = paramGroups.metalRoad.bands.find(p => p.parameterId.toString() === val);
                      setMetalRoadBand(param || null);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Distance Band" />
                    </SelectTrigger>
                    <SelectContent>
                      {paramGroups.metalRoad.bands.map((p) => (
                        <SelectItem key={p.parameterId} value={p.parameterId.toString()}>
                          {p.parameter}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {metalRoadBand && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Selected: {metalRoadBand.parameter} ({metalRoadBand.minMaxRange}) - Weight: {bandWeights[metalRoadBand.parameterId] || 0}%
                  </p>
                )}
              </div>
              {/* Main Market Group */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="onMainMarket"
                    checked={onMainMarket}
                    onCheckedChange={(checked) => {
                      setOnMainMarket(Boolean(checked));
                      if (!checked && mainMarketBand) {
                        setMainMarketBand(null);
                      }
                    }}
                  />
                  <Label htmlFor="onMainMarket" className="text-sm">Distance from Main Market</Label>
                </div>
                {onMainMarket && paramGroups.mainMarket.bands.length > 0 && (
                  <Select
                    value={mainMarketBand?.parameterId?.toString() || ''}
                    onValueChange={(val) => {
                      const param = paramGroups.mainMarket.bands.find(p => p.parameterId.toString() === val);
                      setMainMarketBand(param || null);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Distance Band" />
                    </SelectTrigger>
                    <SelectContent>
                      {paramGroups.mainMarket.bands.map((p) => (
                        <SelectItem key={p.parameterId} value={p.parameterId.toString()}>
                          {p.parameter}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {onMainMarket && mainMarketBand && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Selected: {mainMarketBand.parameter} ({mainMarketBand.minMaxRange}) - Weight: {bandWeights[mainMarketBand.parameterId] || 0}%
                  </p>
                )}
              </div>
              {/* Flat Parameters (non-cascading) */}
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
              ) : (
                <div className="text-center py-8 text-muted-foreground">
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
                      className="ring-1 ring-border focus:ring-gray-500"
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
                      className="ring-1 ring-border focus:ring-gray-500"
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
      {/* Calculate Button - Only show when not explicitly hidden */}
      {!hideCalculateButton && (
        <div className="flex justify-end">
          <Button
            onClick={handleCalculate}
            disabled={isCalculating || !isJurisdictionComplete || !isLandTypeComplete || !isLocationComplete}
            className="px-8 py-3 text-lg font-semibold rounded-lg shadow-lg transition-all duration-200 hover:shadow-xl"
          >
            {isCalculating ? 'Calculating...' : 'Show Market Value'}
          </Button>
        </div>
      )}
      {/* Market Value Display - Enhanced with detailed breakdown and actions */}
      {!hideCalculateButton && marketValue !== null && (
        <div className="space-y-4">
          {/* Main Result Card */}
          <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-300 shadow-lg">
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
              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 justify-center">
                <Button
                  onClick={() => setShowDetailedBreakdown(!showDetailedBreakdown)}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Calculator className="w-4 h-4" />
                  {showDetailedBreakdown ? 'Hide Details' : 'Show Breakdown'}
                </Button>
             
                <Button
                  onClick={navigateToStampDuty}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                >
                  <FileText className="w-4 h-4" />
                  Calculate Stamp Duty
                  <ExternalLink className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
          {/* Detailed Breakdown */}
          {showDetailedBreakdown && calculationResult && (
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="w-5 h-5" />
                  Detailed Calculation Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Base Price (Mouza):</span>
                      <span className="font-medium">₹{basePriceMouza?.toLocaleString('en-IN') || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Lot Factor:</span>
                      <span className="font-medium">{basePriceLot ? `${basePriceLot}%` : 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Land Use Factor:</span>
                      <span className="font-medium">{landUseIncrease ? `${landUseIncrease}%` : 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Plot Level Base:</span>
                      <span className="font-medium">₹{plotLevelBaseValue?.toLocaleString('en-IN') || 'N/A'}</span>
                    </div>
                  </div>
               
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Area Type:</span>
                      <span className="font-medium">{areaType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Area:</span>
                      <span className="font-medium">
                        {areaBigha && `${areaBigha}B `}
                        {areaKatha && `${areaKatha}K `}
                        {areaLessa && `${areaLessa}L`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Location Factors:</span>
                      <span className="font-medium">
                        {onRoad && 'On Road'} {cornerPlot && 'Corner'} {litigatedPlot && 'Litigated'}
                      </span>
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
      {/* History Dropdown */}
      {!hideCalculateButton && calculationHistory.length > 0 && (
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="w-5 h-5" />
              Calculation History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Select value={selectedHistoryId} onValueChange={(value) => {
                setSelectedHistoryId(value);
                if (value) loadFromHistory(value);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Load previous calculation..." />
                </SelectTrigger>
                <SelectContent>
                  {calculationHistory.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{item.description}</span>
                        <span className="text-xs text-gray-500">
                          {new Date(item.timestamp).toLocaleDateString()} - ₹{item.result.totalValue.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
           
              <p className="text-xs text-gray-500">
                {calculationHistory.length} calculation{calculationHistory.length !== 1 ? 's' : ''} saved
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
});

export default PlotForm;