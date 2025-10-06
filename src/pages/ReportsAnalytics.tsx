import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, FileBarChart, Download } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import RQADashboard from '@/components/rqa/RQADashboard';
import { Button } from '@/components/ui/button';
import QuickNavigationTabs from '@/components/QuickNavigationTabs';

const ReportsAnalytics = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Reports, Queries & Analysis</h1>
          <p className="text-muted-foreground">Comprehensive reporting and analytical insights for land valuation data</p>
        </div>

        <QuickNavigationTabs />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-2 lg:grid-cols-4 gap-2 bg-muted/50 p-2 h-auto">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span>Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="revenue" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span>Revenue Reports</span>
            </TabsTrigger>
            <TabsTrigger value="transactions" className="flex items-center gap-2">
              <FileBarChart className="h-4 w-4" />
              <span>Transactions</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span>Analytics</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-4">
            <RQADashboard />
          </TabsContent>

          <TabsContent value="revenue" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Reports</CardTitle>
                <CardDescription>
                  Generate revenue reports by SRO, Circle, Village, Mouza, and District
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">District-wise Revenue</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold mb-2">₹45.2 Cr</div>
                      <Button variant="outline" size="sm" className="w-full">
                        <Download className="h-4 w-4 mr-2" />
                        Download Report
                      </Button>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Circle-wise Revenue</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold mb-2">₹12.8 Cr</div>
                      <Button variant="outline" size="sm" className="w-full">
                        <Download className="h-4 w-4 mr-2" />
                        Download Report
                      </Button>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">SRO-wise Revenue</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold mb-2">₹8.3 Cr</div>
                      <Button variant="outline" size="sm" className="w-full">
                        <Download className="h-4 w-4 mr-2" />
                        Download Report
                      </Button>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Monthly Trend</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold mb-2 text-green-600">+15.3%</div>
                      <Button variant="outline" size="sm" className="w-full">
                        <Download className="h-4 w-4 mr-2" />
                        Download Report
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Transaction Reports</CardTitle>
                <CardDescription>
                  Analyze transactions by location, type, and time period
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">8,234</div>
                      <p className="text-xs text-muted-foreground">This month</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Average Transaction Value</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">₹5.2 L</div>
                      <p className="text-xs text-muted-foreground">+12% from last month</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Land Class Conversions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">456</div>
                      <p className="text-xs text-muted-foreground">Agricultural to Residential</p>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Advanced Analytics</CardTitle>
                <CardDescription>
                  Deep insights and trend analysis for decision support
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Card className="border-l-4 border-l-blue-500">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Deviation Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-2">
                        Transaction vs. Market Value Deviations
                      </p>
                      <div className="text-2xl font-bold text-blue-600">±8.5%</div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-l-4 border-l-green-500">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Price Trends</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-2">
                        Location and Time-based Price Analysis
                      </p>
                      <div className="text-2xl font-bold text-green-600">+12.3%</div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-l-4 border-l-orange-500">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Frequency Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-2">
                        Transaction Frequency by Buyers/Sellers
                      </p>
                      <div className="text-2xl font-bold text-orange-600">3,456</div>
                    </CardContent>
                  </Card>
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

export default ReportsAnalytics;
