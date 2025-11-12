import { useEffect, useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import PlotForm, { PlotFormRef } from './PlotForm';
import PlotWithStructureForm, { PlotWithStructureFormRef } from './PlotWithStructureForm';
import { District, Circle, Village } from '@/types/masterData';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { getParameterDetails, type Parameter } from "@/services/parameterService";

interface ValuationCalculatorProps {
  initialLocationData?: { district?: District; circle?: Circle; village?: Village };
}

const ValuationCalculator = ({ initialLocationData }: ValuationCalculatorProps) => {
  const [marketValue, setMarketValue] = useState<number | null>(null);
  const [selectedType, setSelectedType] = useState<'plot' | 'plot-with-structure' | null>('plot'); // Set 'plot' as initial default

  const plotFormRef = useRef<PlotFormRef>(null);
  const plotWithStructureFormRef = useRef<PlotWithStructureFormRef>(null);

  const calculateMarketValue = (value: number) => {
    setMarketValue(value);
    // Note: Navigation to stamp duty is now handled by the PlotForm component
    // Users can click the "Calculate Stamp Duty" button when ready
  };

  const handleTypeChange = (type: 'plot' | 'plot-with-structure') => {
    setSelectedType(type);
    setMarketValue(null); // Reset market value when switching types
  };

  const handleShowMarketValue = () => {
    if (selectedType === 'plot' && plotFormRef.current) {
      plotFormRef.current.handleCalculate();
    } else if (selectedType === 'plot-with-structure' && plotWithStructureFormRef.current) {
      plotWithStructureFormRef.current.handleCalculate();
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <Card className="bg-background shadow-sm">
        <CardHeader className="pb-4">
          <h2 className="text-lg font-semibold mb-4 text-foreground">
            Choose Option to Calculate Property Value as per Guideline Rate
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <Button
              variant={selectedType === 'plot' ? "default" : "secondary"}
              onClick={() => handleTypeChange('plot')}
              className="flex items-center justify-center gap-2 h-12 rounded-lg shadow-md transition-all duration-200"
            >
              PLOT
            </Button>
            <Button
              variant={selectedType === 'plot-with-structure' ? "default" : "secondary"}
              onClick={() => handleTypeChange('plot-with-structure')}
              className="flex items-center justify-center gap-2 h-12 rounded-lg shadow-md transition-all duration-200"
            >
              PLOT WITH STRUCTURE
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="pt-2">
          {selectedType === 'plot' && <PlotForm ref={plotFormRef} onCalculate={calculateMarketValue} hideCalculateButton={true} initialLocationData={initialLocationData} />}
          {selectedType === 'plot-with-structure' && <PlotWithStructureForm ref={plotWithStructureFormRef} onCalculate={calculateMarketValue} hideCalculateButton={true} initialLocationData={initialLocationData} />}
          
        </CardContent>

        {marketValue !== null && (
          <div className="mt-4 mx-6 mb-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl shadow-lg text-center">
            <div className="flex items-center justify-center mb-3">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              <h3 className="text-xl font-bold text-green-800">Property Valuation Result</h3>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-inner">
              <p className="text-sm text-gray-600 mb-2">Total Market Value</p>
              <p className="text-3xl font-bold text-green-700">₹ {marketValue.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-2">Based on current guideline rates and property specifications</p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ValuationCalculator;
