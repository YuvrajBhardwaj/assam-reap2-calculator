// ValuationCalculator.tsx
import { useEffect, useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import PlotForm, { PlotFormRef } from './PlotForm';
import PlotWithStructureForm, { PlotWithStructureFormRef } from './PlotWithStructureForm';
import { District, Circle, Village } from '@/types/masterData';
import { saveValuation } from '@/services/masterDataService';
import { useToast } from '@/hooks/use-toast';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import StampDutyForm from '../StampDutyForm/StampDutyForm';
import { Calculator, Home, MapPin, ArrowRight, CheckCircle2, TrendingUp } from 'lucide-react';

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
  const { toast } = useToast();
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

  const handleSave = async () => {
    try {
      if (effectiveSelectedType === 'plot' && plotFormRef.current) {
        const payload = plotFormRef.current.getSavePayload();
        await saveValuation(payload);
        toast({ title: 'Saved', description: 'Plot details saved successfully.' });
        return;
      }
      if (effectiveSelectedType === 'plot-with-structure' && plotWithStructureFormRef.current) {
        const payload = plotWithStructureFormRef.current.getSavePayload();
        await saveValuation(payload as any);
        toast({ title: 'Saved', description: 'Plot with structure details saved successfully.' });
        return;
      }
      toast({ title: 'Error', description: 'Form data is not ready to save.', variant: 'destructive' });
    } catch (err: any) {
      toast({ title: 'Save failed', description: err?.message || 'Unknown error', variant: 'destructive' });
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <Card className="bg-gradient-to-br from-slate-50 to-blue-50 shadow-xl border-0 rounded-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-red-400 to-maroon-800 px-8 py-6">
          <div className="flex items-center gap-3
           mb-2">
            <Calculator className="w-8 h-8 text-black" />
            <h1 className="text-3xl font-bold text-white">Property Valuation Calculator</h1>
          </div>
          <p className="text-blue-100 text-lg">Calculate property value as per government guideline rates</p>
        </div>
        
        <CardHeader className="pb-6 px-8 pt-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Select Property Type
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                variant={effectiveSelectedType === 'plot' ? "default" : "outline"}
                onClick={() => handleTypeChange('plot')}
                className={`flex items-center justify-center gap-3 h-16 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-[1.02] ${
                  effectiveSelectedType === 'plot' 
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-blue-200' 
                    : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50'
                }`}
              >
                <MapPin className="w-5 h-5" />
                <div className="text-left">
                  <div className="font-semibold text-lg">PLOT</div>
                  <div className="text-xs opacity-80">Land valuation only</div>
                </div>
                <ArrowRight className="w-4 h-4 ml-auto" />
              </Button>
              <Button
                variant={effectiveSelectedType === 'plot-with-structure' ? "default" : "outline"}
                onClick={() => handleTypeChange('plot-with-structure')}
                className={`flex items-center justify-center gap-3 h-16 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-[1.02] ${
                  effectiveSelectedType === 'plot-with-structure' 
                    ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-purple-200' 
                    : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-purple-400 hover:bg-purple-50'
                }`}
              >
                <Home className="w-5 h-5" />
                <div className="text-left">
                  <div className="font-semibold text-lg">PLOT WITH STRUCTURE</div>
                  <div className="text-xs opacity-80">Land + building valuation</div>
                </div>
                <ArrowRight className="w-4 h-4 ml-auto" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-2 px-8 pb-8">
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

          <div className="flex justify-end mt-6">
            {/* <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700 text-white">
              Save
            </Button> */}
          </div>

          {/* Conditionally render StampDutyForm if market value is calculated and showStampDuty is true */}
          {showStampDuty && marketValue !== null && (
            <div className="mt-8">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
                <h3 className="text-2xl font-bold text-gray-800">Stamp Duty Calculation</h3>
              </div>
              <StampDutyForm
                initialMarketValue={marketValue} // Pass the market value as a prop
                initialLocationData={initialLocationData}
              />
            </div>
          )}
        </CardContent>

        {marketValue !== null && (
          <div className="mx-8 mb-8 p-8 bg-gradient-to-r from-emerald-50 via-green-50 to-teal-50 border border-emerald-200 rounded-2xl shadow-2xl">
            <div className="text-center mb-6">
              <div className="flex items-center justify-center gap-3 mb-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 animate-pulse" />
                <h3 className="text-3xl font-bold bg-gradient-to-r from-emerald-700 to-green-700 bg-clip-text text-transparent">
                  Property Valuation Complete
                </h3>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-emerald-100">
                <p className="text-sm font-medium text-emerald-700 mb-2 uppercase tracking-wide">Total Market Value</p>
                <p className="text-5xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-2">
                  ₹ {marketValue.toLocaleString('en-IN')}
                </p>
                <p className="text-sm text-emerald-600 font-medium">Based on current government guideline rates</p>
              </div>
            </div>
            
            <div className="flex justify-center">
              <Button
                onClick={() => {
                  if (marketValue !== null) {
                    window.dispatchEvent(
                      new CustomEvent('navigate-to-tab', {
                        detail: { tab: 'stamp-duty-calculator', initialMarketValue: marketValue },
                      })
                    );
                  }
                }}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2 font-semibold"
              >
                <Calculator className="w-5 h-5" />
                Calculate Stamp Duty
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ValuationCalculator;
