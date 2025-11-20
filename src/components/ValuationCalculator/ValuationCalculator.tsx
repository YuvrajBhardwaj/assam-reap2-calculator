// ValuationCalculator.tsx
import { useEffect, useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import PlotForm, { PlotFormRef } from './PlotForm';
import PlotWithStructureForm, { PlotWithStructureFormRef } from './PlotWithStructureForm';
import { District, Circle, Village } from '@/types/masterData';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import StampDutyForm from '../StampDutyForm/StampDutyForm';

interface ValuationCalculatorState {
  selectedType: 'plot' | 'plot-with-structure' | null;
  setSelectedType: (type: 'plot' | 'plot-with-structure' | null) => void;
}

export const useCalculatorSettingsStore = create<ValuationCalculatorState>()(
  persist(
    (set) => ({
      selectedType: null,
      setSelectedType: (type) => set({ selectedType: type }),
    }),
    {
      name: 'calculator-settings-storage',
    }
  )
);

interface ValuationCalculatorProps {
  initialLocationData?: { district?: District; circle?: Circle; village?: Village };
}

const ValuationCalculator = ({ initialLocationData }: ValuationCalculatorProps) => {
  const { selectedType, setSelectedType } = useCalculatorSettingsStore();
  const [marketValue, setMarketValue] = useState<number | null>(null);
  const [showStampDuty, setShowStampDuty] = useState(false); // New state to control tab display

  const effectiveSelectedType = selectedType || 'plot';

  const plotFormRef = useRef<PlotFormRef>(null);
  const plotWithStructureFormRef = useRef<PlotWithStructureFormRef>(null);

  // Function to calculate market value
  const calculateMarketValue = (value: number) => {
    setMarketValue(value);
    // Optionally, automatically show the stamp duty tab
    setShowStampDuty(true);
  };

  // Function to handle type change
  const handleTypeChange = (type: 'plot' | 'plot-with-structure') => {
    setSelectedType(type);
    setMarketValue(null);
    setShowStampDuty(false); // Reset when changing type
  };

  // Function to show market value (if needed)
  const handleShowMarketValue = () => {
    if (effectiveSelectedType === 'plot' && plotFormRef.current) {
      plotFormRef.current.handleCalculate();
    } else if (effectiveSelectedType === 'plot-with-structure' && plotWithStructureFormRef.current) {
      plotWithStructureFormRef.current.handleCalculate();
    }
  };

  useEffect(() => {
    setMarketValue(null);
  }, [effectiveSelectedType]);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <Card className="bg-background shadow-sm">
        <CardHeader className="pb-4">
          <h2 className="text-lg font-semibold mb-4 text-foreground">
            Choose Option to Calculate Property Value as per Guideline Rate
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <Button
              variant={effectiveSelectedType === 'plot' ? "default" : "secondary"}
              onClick={() => handleTypeChange('plot')}
              className="flex items-center justify-center gap-2 h-12 rounded-lg shadow-md transition-all duration-200"
            >
              PLOT
            </Button>
            <Button
              variant={effectiveSelectedType === 'plot-with-structure' ? "default" : "secondary"}
              onClick={() => handleTypeChange('plot-with-structure')}
              className="flex items-center justify-center gap-2 h-12 rounded-lg shadow-md transition-all duration-200"
            >
              PLOT WITH STRUCTURE
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-2">
          {/* Render the form based on selected type */}
          {effectiveSelectedType === 'plot' && (
            <PlotForm
              ref={plotFormRef}
              onCalculate={calculateMarketValue}
              hideCalculateButton={true}
              initialLocationData={initialLocationData}
            />
          )}
          {effectiveSelectedType === 'plot-with-structure' && (
            <PlotWithStructureForm
              ref={plotWithStructureFormRef}
              onCalculate={calculateMarketValue}
              hideCalculateButton={true}
              initialLocationData={initialLocationData}
            />
          )}

          {/* Conditionally render StampDutyForm if market value is calculated and showStampDuty is true */}
          {showStampDuty && marketValue !== null && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4">Stamp Duty Calculation</h3>
              <StampDutyForm
                initialMarketValue={marketValue} // Pass the market value as a prop
                initialLocationData={initialLocationData}
              />
            </div>
          )}
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
            {/* Button to proceed to stamp duty */}
            <Button
              onClick={() => {
                if (marketValue !== null) {
                  window.dispatchEvent(
                    new CustomEvent('navigate-to-tab', {
                      detail: { tabId: 'stamp-duty-calculator', initialMarketValue: marketValue },
                    })
                  );
                }
              }}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
            >
              Calculate Stamp Duty
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ValuationCalculator;