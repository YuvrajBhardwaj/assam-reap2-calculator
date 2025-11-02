import { useEffect, useState, forwardRef, useImperativeHandle, useMemo } from 'react';
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

interface DistrictDetails {
  id: number;
  name: string;
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


  const { toast } = useToast();

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

  const selectedLot = useMemo(() => {
    return lots.find(lot => lot.id === selectedLotId);
  }, [selectedLotId, lots]);

  const [plotNo, setPlotNo] = useState('');
  const [currentLandUse, setCurrentLandUse] = useState('');
  const [landUseChange, setLandUseChange] = useState(false);
  const [newLandUse, setNewLandUse] = useState('');
  const [currentLandType, setCurrentLandType] = useState('');
  const [areaType, setAreaType] = useState<'RURAL' | 'URBAN'>('RURAL');
  const [areaBigha, setAreaBigha] = useState('');
  const [areaKatha, setAreaKatha] = useState('');
  const [areaLessa, setAreaLessa] = useState('');

  const [locationMethod, setLocationMethod] = useState('manual');
  const [onRoad, setOnRoad] = useState(false);
  const [cornerPlot, setCornerPlot] = useState(false);
  const [litigatedPlot, setLitigatedPlot] = useState(false);
  const [hasTenant, setHasTenant] = useState(false);

  const [roadWidth, setRoadWidth] = useState('');
  const [distanceFromRoad, setDistanceFromRoad] = useState('');

  const [marketValue, setMarketValue] = useState<number | null>(null);
  const [mapDialogOpen, setMapDialogOpen] = useState(false);
  const [mapResetTrigger, setMapResetTrigger] = useState(0);
  const [isCalculating, setIsCalculating] = useState(false);

  const [selectedSubclauses, setSelectedSubclauses] = useState<string[]>([]);
  const [parameters, setParameters] = useState<any[]>([]);
  const [loadingParameters, setLoadingParameters] = useState<boolean>(true);

  // New: Daag lookup state
  const [isDaagLookupLoading, setIsDaagLookupLoading] = useState(false);
  const [daagFactorInfo, setDaagFactorInfo] = useState<import('@/types/masterData').CircleLotFactorResponse | null>(null);

  // Land use increase states
  const [basePriceLandUse, setBasePriceLandUse] = useState<number | null>(null);
  const [newBasePriceLandUse, setNewBasePriceLandUse] = useState<number | null>(null);

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
          bigha: parseFloat(areaBigha) || 0,
          katha: parseFloat(areaKatha) || 0,
          lessa: parseFloat(areaLessa) || 0,
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

  // Section completion states
  const isJurisdictionComplete = selectedDistrictCode && selectedCircleCode && selectedMouzaCode && selectedLotId && plotNo && currentLandUse;
  const isLandTypeComplete = currentLandType && areaBigha;
  const isLocationComplete = locationMethod === 'manual' ? 
    (onRoad ? roadWidth : distanceFromRoad) : 
    true;

  const handleCalculate = async () => {
    try {
      setIsCalculating(true);

      const payload: ComprehensiveValuationRequest = {
        jurisdictionInformation: {
          districtCode: selectedDistrictCode,
          circleCode: selectedCircleCode,
          mouzaCode: selectedMouzaCode,
          lotCode: selectedLot?.code, // Use the code from the found lot
          plotNo: plotNo || undefined,
          currentLandUse: currentLandUse
        },
        landTypeDetails: {
          currentLandType: currentLandType,
          landUseChange: landUseChange,
          newLandCategoryType: landUseChange ? newLandUse : undefined,
          areaType: areaType,
          areaDetails: {
            bigha: parseFloat(areaBigha) || 0,
            katha: parseFloat(areaKatha) || 0,
            lessa: parseFloat(areaLessa) || 0
          }
        },
        plotLandDetails: {
          locationMethod: locationMethod as 'manual' | 'gis',
          onRoad: onRoad,
          cornerPlot: cornerPlot,
          litigatedPlot: litigatedPlot,
          hasTenant: hasTenant,
          roadWidth: onRoad ? parseFloat(roadWidth) : undefined,
          distanceFromRoad: !onRoad ? parseFloat(distanceFromRoad) : undefined,
          selectedParameterIds: selectedSubclauses.length > 0 ? selectedSubclauses : undefined
        }
      };

      const result = await calculatePlotBaseValue(payload as ComprehensiveValuationRequest);

      setMarketValue(result.totalValue);
      if (onCalculate) onCalculate(result.totalValue);
      toast({ title: 'Market Value Calculated', description: `Base Value: ₹${result.totalValue.toLocaleString()}` });
    } catch (err: any) {
      console.error(err);
      toast({ title: 'Failed to calculate', description: err?.message || 'Unknown error', variant: 'destructive' });
    } finally {
      setIsCalculating(false);
    }
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
      toast({ title: 'Daag found', description: `Geographical factor: ${res.factor} (${res.source === 'EXISTING' ? 'Existing' : 'Derived average'})` });
    } catch (err: any) {
      console.error('Daag lookup failed', err);
      toast({ title: 'No specific factor found', description: 'Using default Lot-level factor or auto-derived average during calculation.', variant: 'default' });
    } finally {
      setIsDaagLookupLoading(false);
    }
  };

  // Fetch parameters for "Other Details"
  useEffect(() => {
    const fetchParameters = async () => {
      try {
        setLoadingParameters(true);
        const response = await getParameterDetails(0, 500);
        if (response.data) setParameters(response.data);
      } catch (error) {
        console.error('Failed to fetch parameters:', error);
        setParameters([]);
      } finally {
        setLoadingParameters(false);
      }
    };
    fetchParameters();
  }, []);

  const handleSubclauseChange = (parameterId: string) => {
    setSelectedSubclauses((prevSelected) =>
      prevSelected.includes(parameterId)
        ? prevSelected.filter((item) => item !== parameterId)
        : [...prevSelected, parameterId]
    );
  };

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

  console.log("PlotForm - lots:", lots);
  console.log("PlotForm - selectedLotId:", selectedLotId);

  return (
    <div className="space-y-6">
      {/* Jurisdiction Info */}
      <Card className={`relative overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl ${
        isJurisdictionComplete 
          ? 'ring-2 ring-blue-500/20 bg-gradient-to-br from-blue-50/50 to-blue-100/50 border-blue-200' 
          : 'border-gray-200 bg-gradient-to-br from-gray-50/50 to-gray-100/50'
      }`}>
        <div className={`absolute top-0 left-0 w-full h-1 transition-colors duration-300 ${
          isJurisdictionComplete ? 'bg-gradient-to-r from-blue-500 to-blue-600' : 'bg-gray-300'
        }`} />
        <CardHeader className={`relative z-10 rounded-t-lg p-4 ${
          isJurisdictionComplete 
            ? 'bg-gradient-to-r from-blue-500/10 via-blue-600/10 to-blue-700/10 border-b border-blue-200/50' 
            : 'bg-gradient-to-r from-gray-100/50 to-gray-200/50 border-b border-gray-200/50'
        }`}>
          <div className="flex items-center justify-between">
            <CardTitle className={`text-xl font-bold flex items-center gap-2 ${
              isJurisdictionComplete ? 'text-blue-800' : 'text-gray-700'
            }`}>
              <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
                isJurisdictionComplete ? 'bg-blue-500 scale-110' : 'bg-gray-400'
              }`}></div>
              Jurisdiction Information
            </CardTitle>
            {isJurisdictionComplete && (
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold animate-pulse">
                ✓
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium">District</Label>
              <Select value={selectedDistrictCode} onValueChange={setSelectedDistrictCode}>
                <SelectTrigger>
                  <SelectValue placeholder="Select District" />
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
              <Label className="text-sm font-medium">Circle</Label>
              <Select value={selectedCircleCode} onValueChange={setSelectedCircleCode}>
                <SelectTrigger>
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
              <Label className="text-sm font-medium">Mouza</Label>
              <Select value={selectedMouzaCode} onValueChange={(value) => {
                setSelectedMouzaCode(value);
                const selectedMouza = mouzas.find(m => m.code === value);
                if (selectedMouza) {
                  setBasePriceMouza(selectedMouza.basePriceMouza || null);
                } else {
                  setBasePriceMouza(null);
                }
              }}>
                <SelectTrigger>
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
                  <p className="text-sm text-gray-500 mt-1">
                    Base Price: ₹{basePriceMouza.toLocaleString()}
                  </p>
                )}
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Lot</Label>
              <Select value={selectedLotId} onValueChange={(val) => {
                console.log("Lot Select - onValueChange - val:", val);
                setSelectedLotId(val);
              }}>
                <SelectTrigger>
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
                <p className="text-sm text-gray-500 mt-1">
                  Lot Increase: {basePriceLot}%
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Current Land Use</Label>
              <Select value={currentLandUse} onValueChange={(val) => {
                setCurrentLandUse(val);
                setCurrentLandType(val); // Auto-populate current land type
                const category = landCategories.find(c => String(c.id) === val);
                console.log("PlotForm - category for Current Land Use:", category);
                console.log("PlotForm - basePriceMouzaIncrease for Current Land Use:", category?.basePriceMouzaIncrease);
                setBasePriceLandUse(category ? category.basePriceMouzaIncrease || null : null);
              }}>
                <SelectTrigger>
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
              {basePriceLandUse !== null && (
                <p className="text-sm text-gray-500 mt-1">
                  Land Use Increase: {basePriceLandUse}%
                </p>
              )}
            </div>

            <div className="space-y-2 md:col-span-1">
              <Label className="text-xs font-medium">Daag / Plot No.</Label>
              <div className="flex gap-2">
                <Input
                  value={plotNo}
                  onChange={(e) => setPlotNo(e.target.value)}
                  placeholder="Enter Daag / Plot No."
                  className="w-full" // Shorten the input field
                />
                <Button variant="secondary" onClick={handleDaagLookup} disabled={isDaagLookupLoading}>
                  {isDaagLookupLoading ? 'Looking...' : 'Lookup'}
                </Button>
              </div>
              {daagFactorInfo && (
                <p className="text-xs text-muted-foreground mt-1">
                  Factor: {daagFactorInfo.factor} ({daagFactorInfo.source === 'EXISTING' ? 'Existing' : 'Derived average'})
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Land Type */}
      <Card className={`relative overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl ${
        isLandTypeComplete 
          ? 'ring-2 ring-green-500/20 bg-gradient-to-br from-green-50/50 to-green-100/50 border-green-200' 
          : 'border-gray-200 bg-gradient-to-br from-gray-50/50 to-gray-100/50'
      }`}>
        <div className={`absolute top-0 left-0 w-full h-1 transition-colors duration-300 ${
          isLandTypeComplete ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gray-300'
        }`} />
        <CardHeader className={`relative z-10 rounded-t-lg p-4 ${
          isLandTypeComplete 
            ? 'bg-gradient-to-r from-green-500/10 via-green-600/10 to-green-700/10 border-b border-green-200/50' 
            : 'bg-gradient-to-r from-gray-100/50 to-gray-200/50 border-b border-gray-200/50'
        }`}>
          <div className="flex items-center justify-between">
            <CardTitle className={`text-xl font-bold flex items-center gap-2 ${
              isLandTypeComplete ? 'text-green-800' : 'text-gray-700'
            }`}>
              <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
                isLandTypeComplete ? 'bg-green-500 scale-110' : 'bg-gray-400'
              }`}></div>
              Land Type Details
            </CardTitle>
            {isLandTypeComplete && (
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold animate-pulse">
                ✓
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="space-y-2">
            <Label className="text-sm font-medium">New Land Use?</Label>
            <RadioGroup value={landUseChange ? 'yes' : 'no'} onValueChange={(v) => setLandUseChange(v === 'yes')}>
              <div className="flex items-center gap-6">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="no-change" />
                  <Label htmlFor="no-change">No</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="yes-change" />
                  <Label htmlFor="yes-change">Yes</Label>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Select if the plot is being used for the first time</p>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Area Type</Label>
            <RadioGroup value={areaType} onValueChange={(v) => setAreaType(v as 'RURAL' | 'URBAN')}>
              <div className="flex items-center gap-6">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="RURAL" id="rural" />
                  <Label htmlFor="rural">RURAL</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="URBAN" id="urban" />
                  <Label htmlFor="urban">URBAN</Label>
                </div>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Current Land Type</Label>
            <Select value={currentLandType} onValueChange={(val) => {
              setCurrentLandType(val);
              const category = landCategories.find(c => String(c.id) === val);
              setBasePriceLandUse(category ? category.basePriceMouzaIncrease || null : null);
            }} disabled={landUseChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select Current Land Type" />
              </SelectTrigger>
              <SelectContent>
                {landCategories
                  .filter(category => category.id != null && String(category.id).trim() !== '')
                  .map((category) => (
                    <SelectItem key={String(category.id)} value={String(category.id)}>
                      {category.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            {basePriceLandUse !== null && (
              <p className="text-sm text-gray-500 mt-1">
                Land Type Increase: {basePriceLandUse}%
              </p>
            )}
          </div>

          {landUseChange && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">New Land Use Type</Label>
              <Select value={newLandUse} onValueChange={(val) => {
                setNewLandUse(val);
                const category = landCategories.find(c => String(c.id) === val);
                setNewBasePriceLandUse(category ? category.basePriceMouzaIncrease || null : null);
              }}>
                <SelectTrigger>
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
              {newBasePriceLandUse !== null && (
                <p className="text-sm text-gray-500 mt-1">
                  New Land Use Increase: {newBasePriceLandUse}%
                </p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-sm font-medium">Area Details</Label>
            <div className="grid grid-cols-3 gap-4">
              <Input
                placeholder="Bigha"
                value={areaBigha}
                onChange={(e) => setAreaBigha(e.target.value)}
                type="number"
              />
              <Input
                placeholder="Katha"
                value={areaKatha}
                onChange={(e) => setAreaKatha(e.target.value)}
                type="number"
              />
              <Input
                placeholder="Lessa"
                value={areaLessa}
                onChange={(e) => setAreaLessa(e.target.value)}
                type="number"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plot Land Details */}
      <Card className={`relative overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl ${
        isLocationComplete 
          ? 'ring-2 ring-indigo-500/20 bg-gradient-to-br from-indigo-50/50 to-indigo-100/50 border-indigo-200' 
          : 'border-gray-200 bg-gradient-to-br from-gray-50/50 to-gray-100/50'
      }`}>
        <div className={`absolute top-0 left-0 w-full h-1 transition-colors duration-300 ${
          isLocationComplete ? 'bg-gradient-to-r from-indigo-500 to-indigo-600' : 'bg-gray-300'
        }`} />
        <CardHeader className={`relative z-10 rounded-t-lg p-4 ${
          isLocationComplete 
            ? 'bg-gradient-to-r from-indigo-500/10 via-indigo-600/10 to-indigo-700/10 border-b border-indigo-200/50' 
            : 'bg-gradient-to-r from-gray-100/50 to-gray-200/50 border-b border-gray-200/50'
        }`}>
          <div className="flex items-center justify-between">
            <CardTitle className={`text-xl font-bold flex items-center gap-2 ${
              isLocationComplete ? 'text-indigo-800' : 'text-gray-700'
            }`}>
              <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
                isLocationComplete ? 'bg-indigo-500 scale-110' : 'bg-gray-400'
              }`}></div>
              Plot Land Details
            </CardTitle>
            {isLocationComplete && (
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold animate-pulse">
                ✓
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Location Method</Label>
            <RadioGroup value={locationMethod} onValueChange={setLocationMethod}>
              <div className="flex items-center gap-6">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="manual" id="manual" />
                  <Label htmlFor="manual">Manual</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="gis" id="gis" />
                  <Label htmlFor="gis">GIS</Label>
                </div>
              </div>
            </RadioGroup>
          </div>

          {locationMethod === 'manual' ? (
            <div className="space-y-4">
              <Label className="text-sm font-medium">Select Parameters</Label>
              {loadingParameters ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-muted-foreground">Loading parameters...</div>
                </div>
              ) : parameters.length > 0 ? (
                <div className="space-y-3 max-h-48 overflow-y-auto p-2 border rounded-md">
                  {parameters.map((param) => (
                    <div key={param.parameterId} className="flex items-start space-x-3 p-2 hover:bg-muted/50 rounded">
                      <Checkbox
                        id={`parameter-${param.parameterId}`}
                        checked={selectedSubclauses.includes(param.parameterId.toString())}
                        onCheckedChange={() => handleSubclauseChange(param.parameterId.toString())}
                      />
                      <Label htmlFor={`parameter-${param.parameterId}`} className="text-sm text-foreground cursor-pointer flex-1">
                        {param.parameter}
                      </Label>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No parameters available. Please check your connection.
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-md">
                  <Checkbox 
                    checked={onRoad} 
                    onCheckedChange={(checked) => setOnRoad(Boolean(checked))} 
                    id="on-road" 
                  />
                  <Label htmlFor="on-road" className="text-sm font-medium">On Road</Label>
                </div>
                {onRoad ? (
                  <div className="space-y-2">
                    <Label className="text-sm">Road Width (ft)</Label>
                    <Input
                      type="number"
                      value={roadWidth}
                      onChange={(e) => setRoadWidth(e.target.value)}
                      placeholder="Enter road width"
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label className="text-sm">Distance from Road (ft)</Label>
                    <Input
                      type="number"
                      value={distanceFromRoad}
                      onChange={(e) => setDistanceFromRoad(e.target.value)}
                      placeholder="Enter distance from road"
                    />
                  </div>
                )}
              </div>
              <div className="space-y-3 pt-4 border-t">
                <Label className="text-sm font-medium">Additional Attributes</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-md">
                    <Checkbox 
                      checked={cornerPlot} 
                      onCheckedChange={(checked) => setCornerPlot(Boolean(checked))} 
                      id="corner-plot" 
                    />
                    <Label htmlFor="corner-plot" className="text-sm">Corner Plot</Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-md">
                    <Checkbox 
                      checked={litigatedPlot} 
                      onCheckedChange={(checked) => setLitigatedPlot(Boolean(checked))} 
                      id="litigated-plot" 
                    />
                    <Label htmlFor="litigated-plot" className="text-sm">Litigated Plot</Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-md">
                    <Checkbox 
                      checked={hasTenant} 
                      onCheckedChange={(checked) => setHasTenant(Boolean(checked))} 
                      id="has-tenant" 
                    />
                    <Label htmlFor="has-tenant" className="text-sm">Has Tenant</Label>
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

      {/* Market Value Display - Only show when calculate button is visible */}
      {!hideCalculateButton && marketValue !== null && (
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 shadow-lg text-center">
          <CardContent className="p-6">
            <div className="flex items-center justify-center mb-3">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              <CardTitle className="text-xl font-bold text-green-800">Property Valuation Result</CardTitle>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-inner">
              <p className="text-sm text-muted-foreground mb-2">Total Market Value</p>
              <p className="text-3xl font-bold text-green-700">₹{marketValue.toLocaleString('en-IN')}</p>
              <p className="text-xs text-muted-foreground mt-2">Based on current guideline rates and property specifications</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
});

export default PlotForm;