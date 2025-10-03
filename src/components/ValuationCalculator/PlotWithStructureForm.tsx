import { useState, useEffect } from 'react';
import PlotForm from './PlotForm';
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

import { District, Circle, Village } from '@/types/masterData';


interface PlotWithStructureFormProps {
  onCalculate?: (value: number) => void;
  hideCalculateButton?: boolean;
  initialLocationData?: {
    district?: District;
    circle?: Circle;
    village?: Village;
  };
}

const PlotWithStructureForm = ({ onCalculate, hideCalculateButton, initialLocationData }: PlotWithStructureFormProps) => {
  const [structureData, setStructureData] = useState<StructureData>({
    structureType: '',
    constructionYear: '',
    totalFloors: '',
    builtUpArea: '',
    structureCondition: '',
    structureAge: '',
  });

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

  return (
    <div className="space-y-6">
      {/* Reuse the refined PlotForm */}
      <PlotForm onCalculate={onCalculate} hideCalculateButton={true} initialLocationData={initialLocationData} />

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

      {!hideCalculateButton && (
        <div className="flex justify-end">
          <Button onClick={() => {
            // Replace this with actual calculation logic
            const mockValue = Math.floor(Math.random() * 1000000) + 500000;
            onCalculate && onCalculate(mockValue);
          }}>
            Show Market Value
          </Button>
        </div>
      )}
    </div>
  );
};

export default PlotWithStructureForm;