import { useEffect, useState } from 'react';
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
import { useAuth } from '@/context/AuthContext';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { fetchLots } from '@/services/masterDataService';
import { calculatePlotBaseValue } from '@/services/masterDataService';
import { useToast } from '@/hooks/use-toast';
import { getParameterDetails, type Parameter } from "@/services/parameterService";

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
}



// Placeholder data
const PlotForm = ({ onCalculate, hideCalculateButton, initialLocationData }: PlotFormProps) => {
  const { userRole } = useAuth();
  const { toast } = useToast();

  const [landCategories, setLandCategories] = useState<LandClass[]>([]);

  const [districts, setDistricts] = useState<District[]>([]);
  const [circles, setCircles] = useState<Circle[]>([]);
  const [mouzas, setMouzas] = useState<Mouza[]>([]);
  const [lots, setLots] = useState<Lot[]>([]);

  const [selectedDistrictCode, setSelectedDistrictCode] = useState('');
  const [selectedCircleCode, setSelectedCircleCode] = useState('');
  const [selectedMouzaCode, setSelectedMouzaCode] = useState('');
  const [selectedLotCode, setSelectedLotCode] = useState('');

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

  // Section completion states
  const isJurisdictionComplete = selectedDistrictCode && selectedCircleCode && selectedMouzaCode && selectedLotCode && plotNo && currentLandUse;
  const isLandTypeComplete = currentLandType && areaBigha;
  const isLocationComplete = locationMethod === 'manual' ? 
    (onRoad ? roadWidth : distanceFromRoad) : 
    true;

  const handleCalculate = async () => {
    try {
      // No request object needed, directly pass parameters
      // No validatePlotBaseValueRequest call, as it's not from masterDataService

      setIsCalculating(true);
      const result = await calculatePlotBaseValue(
        selectedDistrictCode,
        selectedCircleCode,
        selectedLotCode,
        currentLandType, // Assuming currentLandType is the landCategoryGenId
        areaType,
        plotNo || undefined
      );
      setMarketValue(result.plotBaseValue);
      if (onCalculate) onCalculate(result.plotBaseValue);
      toast({ title: 'Market Value Calculated', description: `Base Value: ₹${result.plotBaseValue.toLocaleString()}` });
    } catch (err: any) {
      console.error(err);
      toast({ title: 'Failed to calculate', description: err?.message || 'Unknown error', variant: 'destructive' });
    } finally {
      setIsCalculating(false);
    }
  };

  // New: handler to lookup daag-based geographical factor
  const handleDaagLookup = async () => {
    if (!selectedDistrictCode || !selectedCircleCode || !selectedMouzaCode || !selectedLotCode) {
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
        lotCode: selectedLotCode,
        daagNumber: plotNo.trim(),
      });
      setDaagFactorInfo(res);
      toast({ title: 'Daag found', description: `Geographical factor: ${res.factor} (${res.source === 'EXISTING' ? 'Existing' : 'Derived average'})` });
    } catch (err: any) {
      console.error('Daag lookup failed', err);
      toast({ title: 'No specific factor found', description: 'Using default Lot-level factor or auto-derived average during calculation.', variant: 'default' });
    } finally {
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
        try {
          const data = await getMouzasByDistrictAndCircle(selectedDistrictCode, selectedCircleCode);
          setMouzas(data);
          const mouzaCode = initialLocationData?.mouza?.code || initialLocationData?.village?.code;
          if (mouzaCode) {
            setSelectedMouzaCode(mouzaCode);
          }
        } catch (error) {
          console.error('Error fetching mouzas:', error);
        }
      };
      fetchMouzas();
    } else {
      setMouzas([]);
      setSelectedMouzaCode('');
    }
  }, [selectedDistrictCode, selectedCircleCode, initialLocationData]);

  useEffect(() => {
    // Fetch Lots when circle changes. Note: The API does not support filtering lots by mouza.
    const shouldFetchLots = selectedDistrictCode && selectedCircleCode;
    if (!shouldFetchLots) {
      setLots([]);
      setSelectedLotCode('');
      return;
    }
    const loadLots = async () => {
      try {
        const data = await fetchLots(selectedDistrictCode, selectedCircleCode);
        setLots(data);
        // Auto-select if only one lot
        if (data.length === 1) setSelectedLotCode(data[0].code);
        toast({ title: 'Lots Loaded', description: 'Please select a lot. The list is not filtered by mouza.' });
      } catch (error) {
        console.error('Error fetching lots:', error);
      }
    };
    loadLots();
  }, [selectedDistrictCode, selectedCircleCode]);

  return (
    <div className="space-y-6">
      {/* Jurisdiction Info */}
      <Card className="border-2 border-primary/20 shadow-lg bg-gradient-to-br from-background to-muted/30">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-t-lg">
          <CardTitle className="text-xl font-bold text-primary flex items-center gap-2">
            <div className="w-2 h-2 bg-primary rounded-full"></div>
            Jurisdiction Information
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
          <Select value={selectedDistrictCode} onValueChange={setSelectedDistrictCode}>
            <SelectTrigger>
              <SelectValue placeholder="District" />
            </SelectTrigger>
            <SelectContent>
              {districts.map((dist) => (
                <SelectItem key={dist.code} value={dist.code}>
                  {dist.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedCircleCode} onValueChange={setSelectedCircleCode}>
            <SelectTrigger>
              <SelectValue placeholder="Circle" />
            </SelectTrigger>
            <SelectContent>
              {circles.map((circ) => (
                <SelectItem key={circ.code} value={circ.code}>
                  {circ.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>



          <Select value={selectedMouzaCode} onValueChange={setSelectedMouzaCode}>
            <SelectTrigger>
              <SelectValue placeholder="Mouza">
                {selectedMouzaCode ? mouzas.find(m => m.code === selectedMouzaCode)?.name : "Mouza"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {mouzas.map((mouza) => (
                <SelectItem key={mouza.code} value={mouza.code}>
                  {mouza.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Lot dropdown */}
          <Select value={selectedLotCode} onValueChange={setSelectedLotCode}>
            <SelectTrigger>
              <SelectValue placeholder="Lot" />
            </SelectTrigger>
            <SelectContent>
              {lots.map((lot) => (
                <SelectItem key={lot.code} value={lot.code}>
                  {lot.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex flex-col gap-1">
            <div className="flex gap-2">
              <Input
                value={plotNo}
                onChange={(e) => setPlotNo(e.target.value)}
                placeholder="Daag / Plot No."
              />
              <Button variant="secondary" onClick={handleDaagLookup} disabled={isDaagLookupLoading}>
                {isDaagLookupLoading ? 'Looking...' : 'Lookup'}
              </Button>
            </div>
            {daagFactorInfo && (
              <div className="text-xs text-muted-foreground">
                Factor: {daagFactorInfo.factor} ({daagFactorInfo.source === 'EXISTING' ? 'Existing' : 'Derived average'})
              </div>
            )}
          </div>

          <Select value={currentLandUse} onValueChange={(val) => {
            setCurrentLandUse(val);
            setCurrentLandType(val); // Auto-populate current land type
          }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Current Land Use" />
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
        </CardContent>
      </Card>

      {/* Land Type */}
      <Card className={`border-2 shadow-lg bg-gradient-to-br from-background ${
        isJurisdictionComplete 
          ? 'border-blue-500/50 to-blue-50/50' 
          : 'border-gray-300/50 to-gray-50/50'
      }`}>
        <CardHeader className={`rounded-t-lg ${
          isJurisdictionComplete 
            ? 'bg-gradient-to-r from-blue-500/10 to-blue-600/20' 
            : 'bg-gradient-to-r from-gray-300/10 to-gray-400/20'
        }`}>
          <CardTitle className={`text-xl font-bold flex items-center gap-2 ${
            isJurisdictionComplete ? 'text-blue-700' : 'text-gray-600'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              isJurisdictionComplete ? 'bg-blue-500' : 'bg-gray-400'
            }`}></div>
            Land Type Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-4">
            <Label className="flex items-center space-x-1">
              New Land? 
              <span className="text-sm text-gray-500">
                (Select if the plot is being used for the first time)
              </span>

              <input
                type="radio"
                checked={!landUseChange}
                onChange={() => setLandUseChange(false)}
              />
              <span>No</span>
            </Label>
            <Label className="flex items-center space-x-1">
              <input
                type="radio"
                checked={landUseChange}
                onChange={() => setLandUseChange(true)}
              />
              <span>Yes</span>
            </Label>
          </div>

          {/* Area Type Selection */}
          <div className="mb-4">
            <Label className="mb-2 block">Area Type</Label>
            <RadioGroup value={areaType} onValueChange={(v) => setAreaType((v as 'RURAL' | 'URBAN'))}>
              <div className="flex items-center gap-6">
                <Label className="flex items-center gap-2"><RadioGroupItem value="RURAL" /> RURAL</Label>
                <Label className="flex items-center gap-2"><RadioGroupItem value="URBAN" /> URBAN</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="mt-2">
            <Select value={currentLandType} onValueChange={setCurrentLandType} disabled={landUseChange}>
              <SelectTrigger>
                <SelectValue placeholder="Current Land Type" />
              </SelectTrigger>
              <SelectContent>
              {landCategories
                .filter(category => category.id != null && String(category.id).trim() !== '') // Filter out categories with null, undefined, or empty string id
                .map((category) => (
                <SelectItem key={String(category.id)} value={String(category.id)}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
            </Select>
          </div>

          {landUseChange && (
            <div className="mt-2">
              <Select value={newLandUse} onValueChange={setNewLandUse} disabled={!landUseChange}>
                <SelectTrigger>
                  <SelectValue placeholder="New Land Use Type" />
                </SelectTrigger>
                <SelectContent>
              {landCategories
                .filter(category => category.id !== null && category.id !== undefined && String(category.id).trim() !== '') // Filter out categories with null, undefined, or empty string id
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
          </div>
          )}

          <div className="grid grid-cols-3 gap-4 mt-4">
            <Input
              placeholder="Bigha"
              value={areaBigha}
              onChange={(e) => setAreaBigha(e.target.value)}
            />
            <Input
              placeholder="Katha"
              value={areaKatha}
              onChange={(e) => setAreaKatha(e.target.value)}
            />
            <Input
              placeholder="Lessa"
              value={areaLessa}
              onChange={(e) => setAreaLessa(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Plot Land Details */}
      <Card className={`border-2 shadow-lg bg-gradient-to-br from-background ${
        isLandTypeComplete 
          ? 'border-blue-500/50 to-blue-50/50' 
          : 'border-gray-300/50 to-gray-50/50'
      }`}>
        <CardHeader className={`rounded-t-lg ${
          isLandTypeComplete 
            ? 'bg-gradient-to-r from-blue-500/10 to-blue-600/20' 
            : 'bg-gradient-to-r from-gray-300/10 to-gray-400/20'
        }`}>
          <CardTitle className={`text-xl font-bold flex items-center gap-2 ${
            isLandTypeComplete ? 'text-blue-700' : 'text-gray-600'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              isLandTypeComplete ? 'bg-blue-500' : 'bg-gray-400'
            }`}></div>
            Plot Land Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-4">
            <Label className="flex items-center space-x-1">
              <input
                type="radio"
                name="locationType"
                value="manual"
                checked={locationMethod === 'manual'}
                onChange={() => setLocationMethod('manual')}
              />
              <span>Manual</span>
            </Label>
            <Label className="flex items-center space-x-1">
              <input
                type="radio"
                name="locationType"
                value="gis"
                checked={locationMethod === 'gis'}
                onChange={() => setLocationMethod('gis')}
              />
              <span>GIS</span>
            </Label>
          </div>

          {locationMethod === 'manual' ? (
            <div className="space-y-3">
              {loadingParameters ? (
                <div className="flex items-center justify-center py-4">
                  <div className="text-gray-500">Loading parameters...</div>
                </div>
              ) : parameters.length > 0 ? (
                <div className="space-y-3">
                  {parameters.map((param) => (
                    <div key={param.parameterId} className="flex items-start">
                      <Checkbox
                        id={`parameter-${param.parameterId}`}
                        checked={selectedSubclauses.includes(param.parameterId.toString())}
                        onCheckedChange={() => handleSubclauseChange(param.parameterId.toString())}
                        className="h-5 w-5 mt-0.5 border-maroon-300 text-maroon-600"
                      />
                      <Label htmlFor={`parameter-${param.parameterId}`} className="ml-2 text-gray-700">
                        {param.parameter}
                      </Label>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500 text-center py-4">
                  No parameters available. Please check your connection.
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-cols-3 gap-6 mt-4">
              <div className="lg:col-span-2 space-y-4">
                <div className="space-y-2">
                  <Label className="flex items-center space-x-2">
                    <Checkbox checked={cornerPlot} onCheckedChange={(checked) => setCornerPlot(!!checked)} />
                    <span>Corner Plot</span>
                  </Label>
                  <Label className="flex items-center space-x-2">
                    <Checkbox checked={litigatedPlot} onCheckedChange={(checked) => setLitigatedPlot(!!checked)} />
                    <span>Litigated Plot</span>
                  </Label>
                  <Label className="flex items-center space-x-2">
                    <Checkbox checked={hasTenant} onCheckedChange={(checked) => setHasTenant(!!checked)} />
                    <span>Has Tenant</span>
                  </Label>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Admin Section - Previous Transactions */}
      {userRole === 'admin' && (
        <Card className="border-2 border-destructive/20 shadow-lg bg-gradient-to-br from-background to-destructive/5">
          <CardHeader className="bg-gradient-to-r from-destructive/5 to-destructive/10 rounded-t-lg">
            <CardTitle className="text-xl font-bold text-destructive-foreground flex items-center gap-2">
              <div className="w-2 h-2 bg-destructive rounded-full"></div>
              Previous Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="outline">Download Past Transactions</Button>
          </CardContent>
        </Card>
      )}

      {/* Calculate Button - Only show when not explicitly hidden */}
      {!hideCalculateButton && (
        <div className="flex justify-end">
          <Button onClick={handleCalculate} disabled={isCalculating}>{isCalculating ? 'Calculating...' : 'Show Market Value'}</Button>
        </div>
      )}

      {/* Market Value Display - Only show when calculate button is visible */}
      {!hideCalculateButton && marketValue !== null && (
        <div className="bg-green-50 p-4 rounded-lg text-center">
          <h3 className="text-lg font-semibold text-green-800">Market Value Calculated</h3>
          <p className="text-2xl font-bold text-green-700">₹{marketValue.toLocaleString()}</p>
        </div>
      )}
    </div>
  );
};

export default PlotForm;
