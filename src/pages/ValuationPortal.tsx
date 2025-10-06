import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator, FileText, TrendingUp, History } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ValuationCalculator from '@/components/ValuationCalculator/ValuationCalculator';
import StampDutyForm from '@/components/StampDutyForm/StampDutyForm';
import PropertyValuationUI from '@/components/PropertyValuationUI';
import QuickNavigationTabs from '@/components/QuickNavigationTabs';

const ValuationPortal = () => {
  const [activeTab, setActiveTab] = useState('map-valuation');

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Property Valuation Portal</h1>
          <p className="text-muted-foreground">Calculate property values and stamp duties for land and buildings</p>
        </div>

        <QuickNavigationTabs />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-2 lg:grid-cols-4 gap-2 bg-muted/50 p-2 h-auto">
            <TabsTrigger value="map-valuation" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span>Map Search</span>
            </TabsTrigger>
            <TabsTrigger value="calculator" className="flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              <span>Calculator</span>
            </TabsTrigger>
            <TabsTrigger value="stamp-duty" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>Stamp Duty</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              <span>History</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="map-valuation" className="space-y-4">
            <PropertyValuationUI />
          </TabsContent>

          <TabsContent value="calculator" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Property Valuation Calculator</CardTitle>
                <CardDescription>
                  Enter plot details to calculate base value and market value
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ValuationCalculator />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stamp-duty" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Stamp Duty Calculator</CardTitle>
                <CardDescription>
                  Calculate stamp duty and registration fees based on property type and transaction value
                </CardDescription>
              </CardHeader>
              <CardContent>
                <StampDutyForm />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Valuation History</CardTitle>
                <CardDescription>
                  View previous valuations and calculations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No valuation history available yet</p>
                  <p className="text-sm mt-2">Completed valuations will appear here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
    </div>
  );
};

export default ValuationPortal;
