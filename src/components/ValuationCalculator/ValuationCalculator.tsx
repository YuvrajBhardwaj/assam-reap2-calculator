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
import { Calculator, Home, MapPin, ArrowRight, CheckCircle2, TrendingUp, Building2 } from 'lucide-react';

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
  const [showStampDuty, setShowStampDuty] = useState(false);

  const effectiveSelectedType = selectedType || 'plot';

  const plotFormRef = useRef<PlotFormRef>(null);
  const plotWithStructureFormRef = useRef<PlotWithStructureFormRef>(null);

  const calculateMarketValue = (value: number) => {
    setMarketValue(value);
    setShowStampDuty(true);
  };

  const handleTypeChange = (type: 'plot' | 'plot-with-structure') => {
    setSelectedType(type);
    setMarketValue(null);
    setShowStampDuty(false);
  };

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
    <div className="max-w-6xl mx-auto p-4 md:p-6">
      <Card className="bg-card shadow-lg border border-border rounded-lg overflow-hidden">
        {/* Industrial Header */}
        <div className="bg-gradient-to-r from-primary via-primary to-accent px-6 py-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary-foreground/10 rounded-lg">
              <Calculator className="w-7 h-7 text-primary-foreground" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-primary-foreground tracking-tight">
              Property Valuation Calculator
            </h1>
          </div>
          <p className="text-primary-foreground/80 text-sm md:text-base">
            Calculate property value as per government guideline rates
          </p>
        </div>
        
        <CardHeader className="pb-4 px-6 pt-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold mb-4 text-foreground flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Select Property Type
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                variant={effectiveSelectedType === 'plot' ? "default" : "outline"}
                onClick={() => handleTypeChange('plot')}
                className={`flex items-center justify-start gap-3 h-auto py-4 px-5 rounded-lg transition-all duration-200 ${
                  effectiveSelectedType === 'plot' 
                    ? 'bg-primary text-primary-foreground shadow-md border-2 border-primary' 
                    : 'bg-card text-foreground border-2 border-border hover:border-primary/50 hover:bg-primary/5'
                }`}
              >
                <div className={`p-2 rounded-lg ${effectiveSelectedType === 'plot' ? 'bg-primary-foreground/20' : 'bg-muted'}`}>
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="text-left flex-1">
                  <div className="font-semibold text-base">PLOT</div>
                  <div className="text-xs opacity-75">Land valuation only</div>
                </div>
                <ArrowRight className="w-4 h-4 opacity-60" />
              </Button>
              <Button
                variant={effectiveSelectedType === 'plot-with-structure' ? "default" : "outline"}
                onClick={() => handleTypeChange('plot-with-structure')}
                className={`flex items-center justify-start gap-3 h-auto py-4 px-5 rounded-lg transition-all duration-200 ${
                  effectiveSelectedType === 'plot-with-structure' 
                    ? 'bg-primary text-primary-foreground shadow-md border-2 border-primary' 
                    : 'bg-card text-foreground border-2 border-border hover:border-primary/50 hover:bg-primary/5'
                }`}
              >
                <div className={`p-2 rounded-lg ${effectiveSelectedType === 'plot-with-structure' ? 'bg-primary-foreground/20' : 'bg-muted'}`}>
                  <Building2 className="w-5 h-5" />
                </div>
                <div className="text-left flex-1">
                  <div className="font-semibold text-base">PLOT WITH STRUCTURE</div>
                  <div className="text-xs opacity-75">Land + building valuation</div>
                </div>
                <ArrowRight className="w-4 h-4 opacity-60" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-2 px-6 pb-6">
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

          {showStampDuty && marketValue !== null && (
            <div className="mt-8">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-1 h-8 bg-gradient-to-b from-primary to-accent rounded-full"></div>
                <h3 className="text-xl font-bold text-foreground">Stamp Duty Calculation</h3>
              </div>
              <StampDutyForm
                initialMarketValue={marketValue}
                initialLocationData={initialLocationData}
              />
            </div>
          )}
        </CardContent>

        {marketValue !== null && (
          <div className="mx-6 mb-6 p-6 bg-gradient-to-r from-success/10 via-success/5 to-success/10 border border-success/30 rounded-lg">
            <div className="text-center mb-5">
              <div className="flex items-center justify-center gap-3 mb-4">
                <CheckCircle2 className="w-7 h-7 text-success" />
                <h3 className="text-2xl font-bold text-foreground">
                  Property Valuation Complete
                </h3>
              </div>
              <div className="bg-card rounded-lg p-5 shadow-sm border border-border">
                <p className="text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wide">Total Market Value</p>
                <p className="text-4xl font-bold text-primary mb-2">
                  ₹ {marketValue.toLocaleString('en-IN')}
                </p>
                <p className="text-sm text-muted-foreground">Based on current government guideline rates</p>
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
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2 font-semibold"
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
