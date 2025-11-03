import { useState, useEffect, forwardRef, useImperativeHandle, useRef } from 'react';
import PlotForm, { PlotFormRef } from './PlotForm';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { calculatePlotBaseValue } from '@/services/masterDataService';
import { useToast } from '@/hooks/use-toast';
import { ComprehensiveValuationRequest } from '@/types/valuation';

// Define structure types and conditions for better maintainability
const structureTypes = [
  { value: 'rcc', label: 'RCC' },
  { value: 'rbc', label: 'RBC' },
  { value: 'tin-shade', label: 'Tin Shade' },
  { value: 'kaccha-kabelu', label: 'Kaccha Kabelu' },
];

const structureConditions = [
  { value: 'excellent', label: 'Excellent' },
  { value: 'good', label: 'Good' },
  { value: 'average', label: 'Average' },
  { value: 'poor', label: 'Poor' },
  { value: 'dilapidated', label: 'Dilapidated' },
];

interface StructureData {
  structureType: string;
  constructionYear: string;
  totalFloors: string;
  builtUpArea: string;
  structureCondition: string;
  structureAge: string;
}

export interface PlotWithStructureFormRef {
  handleCalculate: () => void;
}

import { District, Circle, Village } from '@/types/masterData';


interface PlotWithStructureFormProps {
  onCalculate?: (value: number, payload: ComprehensiveValuationRequest) => void;
  hideCalculateButton?: boolean;
  initialLocationData?: {
    district?: District;
    circle?: Circle;
    village?: Village;
  };
}

const PlotWithStructureForm = forwardRef<PlotWithStructureFormRef, PlotWithStructureFormProps>(({ onCalculate, hideCalculateButton, initialLocationData }, ref) => {
  const [structureData, setStructureData] = useState<StructureData>({
    structureType: '',
    constructionYear: '',
    totalFloors: '',
    builtUpArea: '',
    structureCondition: '',
    structureAge: '',
  });

  const [plotFormData, setPlotFormData] = useState<any>({
    areaDetails: { bigha: 0, katha: 0, lessa: 0 },
    selectedDistrictCode: '',
    selectedCircleCode: '',
    selectedMouzaCode: '',
    lotCode: '',
    plotNo: '',
    currentLandCategoryGenId: '',
    currentLandUse: '', // Added missing property
    landUseChange: false,
    newLandCategoryGenId: '',
    areaType: 'RURAL',
    locationMethod: 'manual',
    onRoad: false,
    cornerPlot: false,
    litigatedPlot: false,
    hasTenant: false,
    roadWidth: '',
    distanceFromRoad: '',
    selectedParameterIds: [],
  }); // Initialize with default values

  const { toast } = useToast();

  const plotFormRef = useRef<PlotFormRef>(null);

  const [selectedDistrictCode, setSelectedDistrictCode] = useState('');
  const [selectedCircleCode, setSelectedCircleCode] = useState('');
  const [selectedMouzaCode, setSelectedMouzaCode] = useState('');

  useEffect(() => {
    if (initialLocationData) {
      if (initialLocationData.district) {
        setSelectedDistrictCode(initialLocationData.district.code);
      }
      if (initialLocationData.circle) {
        setSelectedCircleCode(initialLocationData.circle.code);
      }
      if (initialLocationData.village) {
        setSelectedMouzaCode(initialLocationData.village.code);
      }
    }
  }, [initialLocationData]);
  const handleStructureChange = (field: keyof StructureData, value: string) => {
    setStructureData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCalculate = async () => {
    if (!plotFormData) {
      toast({ title: 'Error', description: 'Plot details are not yet loaded.', variant: 'destructive' });
      return;
    }

    try {
      const payload: ComprehensiveValuationRequest = {
        jurisdictionInformation: {
          districtCode: plotFormData.selectedDistrictCode,
          circleCode: plotFormData.selectedCircleCode,
          mouzaCode: plotFormData.selectedMouzaCode,
          lotCode: plotFormData.lotCode,
          plotNo: plotFormData.plotNo,
          currentLandUse: plotFormData.currentLandUse // Added missing property
        },
        landTypeDetails: {
          currentLandType: plotFormData.currentLandCategoryGenId, // Corrected property name
          landUseChange: plotFormData.landUseChange,
          newLandCategoryType: plotFormData.newLandCategoryGenId, // Corrected property name
          areaType: plotFormData.areaType,
          areaDetails: {
            bigha: plotFormData.areaDetails.bigha,
            katha: plotFormData.areaDetails.katha,
            lessa: plotFormData.areaDetails.lessa
          }
        },
        plotLandDetails: {
          locationMethod: plotFormData.locationMethod,
          onRoad: plotFormData.onRoad,
          cornerPlot: plotFormData.cornerPlot,
          litigatedPlot: plotFormData.litigatedPlot,
          hasTenant: plotFormData.hasTenant,
          roadWidth: plotFormData.roadWidth,
          distanceFromRoad: plotFormData.distanceFromRoad,
          selectedParameterIds: plotFormData.selectedParameterIds
        },
        structureDetails: {
          structureType: structureData.structureType,
          constructionYear: parseFloat(structureData.constructionYear) || 0,
          totalFloors: parseFloat(structureData.totalFloors) || 0,
          builtUpArea: parseFloat(structureData.builtUpArea) || 0,
          structureCondition: structureData.structureCondition,
          structureAge: parseFloat(structureData.structureAge) || 0
        }
      };

      // Call the new comprehensive valuation API
      const result = await calculatePlotBaseValue(payload);

      if (onCalculate) onCalculate(result.totalValue, payload);
      toast({ title: 'Market Value Calculated', description: `Total Value: ₹${result.totalValue.toLocaleString()}` });
    } catch (err: any) {
      console.error(err);
      toast({ title: 'Failed to calculate', description: err?.message || 'Unknown error', variant: 'destructive' });
    }
  };

  useImperativeHandle(ref, () => ({
    handleCalculate,
  }));

  return (
    <div className="space-y-6">
      {/* Structure Details Section */}
      <Card className="border-t-4 border-blue-500 bg-blue-50">
        <CardHeader>
          <CardTitle>Structure Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Structure Type */}
            <div>
              <Label htmlFor="structureType">Structure Type</Label>
              <Select
                value={structureData.structureType}
                onValueChange={(value) =>
                  handleStructureChange('structureType', value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Structure Type" />
                </SelectTrigger>
                <SelectContent>
                  {structureTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Construction Year */}
            <div>
              <Label htmlFor="constructionYear">Construction Year</Label>
              <Input
                id="constructionYear"
                type="number"
                min="1900"
                max={new Date().getFullYear()}
                value={structureData.constructionYear}
                onChange={(e) =>
                  handleStructureChange('constructionYear', e.target.value)
                }
                placeholder="Enter Year"
              />
            </div>

            {/* Total Floors */}
            <div>
              <Label htmlFor="totalFloors">Total Floors</Label>
              <Input
                id="totalFloors"
                type="number"
                min="1"
                value={structureData.totalFloors}
                onChange={(e) =>
                  handleStructureChange('totalFloors', e.target.value)
                }
                placeholder="Enter Number of Floors"
              />
            </div>

            {/* Built-up Area */}
            <div>
              <Label htmlFor="builtUpArea">Built-up Area (Sq. Ft.)</Label>
              <Input
                id="builtUpArea"
                type="number"
                value={structureData.builtUpArea}
                onChange={(e) =>
                  handleStructureChange('builtUpArea', e.target.value)
                }
                placeholder="Enter Built-up Area"
              />
            </div>

            {/* Structure Condition */}
            <div>
              <Label htmlFor="structureCondition">Structure Condition</Label>
              <Select
                value={structureData.structureCondition}
                onValueChange={(value) =>
                  handleStructureChange('structureCondition', value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Condition" />
                </SelectTrigger>
                <SelectContent>
                  {structureConditions.map((condition) => (
                    <SelectItem key={condition.value} value={condition.value}>
                      {condition.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Structure Age */}
            <div>
              <Label htmlFor="structureAge">Structure Age (Years)</Label>
              <Input
                id="structureAge"
                type="number"
                value={structureData.structureAge}
                onChange={(e) =>
                  handleStructureChange('structureAge', e.target.value)
                }
                placeholder="Auto-calculated or manual"
              />
            </div>
          </div>

          {/* Note Section */}
          <div className="mt-4 p-3 bg-blue-100 rounded-md">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Structure parameters will be used in
              conjunction with plot details to calculate the total property value,
              including both land and structure components.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Reuse the refined PlotForm */}
      <PlotForm
        ref={plotFormRef}
        hideCalculateButton={true}
        initialLocationData={initialLocationData}
        onDataChange={setPlotFormData} // Pass setPlotFormData to update the state
      />

      {!hideCalculateButton && (
        <div className="flex justify-end">
          <Button onClick={handleCalculate}>
            Show Market Value
          </Button>
        </div>
      )}
    </div>
  );
});

export default PlotWithStructureForm;