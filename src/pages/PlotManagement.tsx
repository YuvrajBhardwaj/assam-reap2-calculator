import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GitBranch, GitMerge, Search, Map } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import QuickNavigationTabs from '@/components/QuickNavigationTabs';

const PlotManagement = () => {
  const [activeTab, setActiveTab] = useState('search');

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Plot Management</h1>
          <p className="text-muted-foreground">Search, bifurcate, and merge land plots with cadastral map integration</p>
        </div>

        <QuickNavigationTabs />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-2 lg:grid-cols-4 gap-2 bg-muted/50 p-2 h-auto">
            <TabsTrigger value="search" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              <span>Search Plot</span>
            </TabsTrigger>
            <TabsTrigger value="bifurcation" className="flex items-center gap-2">
              <GitBranch className="h-4 w-4" />
              <span>Bifurcation</span>
            </TabsTrigger>
            <TabsTrigger value="merger" className="flex items-center gap-2">
              <GitMerge className="h-4 w-4" />
              <span>Merger</span>
            </TabsTrigger>
            <TabsTrigger value="map-view" className="flex items-center gap-2">
              <Map className="h-4 w-4" />
              <span>Map View</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Plot Search</CardTitle>
                <CardDescription>
                  Search for plots by Daag number, location, or other identifiers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="district">District</Label>
                      <Select>
                        <SelectTrigger id="district">
                          <SelectValue placeholder="Select District" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="kamrup">Kamrup</SelectItem>
                          <SelectItem value="jorhat">Jorhat</SelectItem>
                          <SelectItem value="dibrugarh">Dibrugarh</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="circle">Revenue Circle</Label>
                      <Select>
                        <SelectTrigger id="circle">
                          <SelectValue placeholder="Select Circle" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="guwahati">Guwahati</SelectItem>
                          <SelectItem value="dispur">Dispur</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="mouza">Mouza</Label>
                      <Select>
                        <SelectTrigger id="mouza">
                          <SelectValue placeholder="Select Mouza" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mouza1">Mouza 1</SelectItem>
                          <SelectItem value="mouza2">Mouza 2</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="daag">Daag Number</Label>
                      <Input id="daag" placeholder="Enter Daag Number" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="property-id">Property ID</Label>
                      <Input id="property-id" placeholder="Enter Property ID" />
                    </div>
                  </div>
                  
                  <Button size="lg" className="w-full md:w-auto">
                    <Search className="h-4 w-4 mr-2" />
                    Search Plot
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bifurcation" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Plot Bifurcation</CardTitle>
                <CardDescription>
                  Divide a plot into multiple sub-plots with automatic cadastral updates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="parent-plot">Parent Plot ID</Label>
                      <Input id="parent-plot" placeholder="Enter Parent Plot ID" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="num-subplots">Number of Sub-Plots</Label>
                      <Input id="num-subplots" type="number" min="2" placeholder="Enter number" />
                    </div>
                  </div>
                  
                  <Card className="bg-muted/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Parent Plot Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Total Area:</span>
                          <span className="ml-2 font-medium">500 sq.m</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Land Class:</span>
                          <span className="ml-2 font-medium">Residential</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Current Value:</span>
                          <span className="ml-2 font-medium">₹25,00,000</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Owner:</span>
                          <span className="ml-2 font-medium">John Doe</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <div className="flex gap-3">
                    <Button size="lg">
                      <GitBranch className="h-4 w-4 mr-2" />
                      Initiate Bifurcation
                    </Button>
                    <Button size="lg" variant="outline">
                      <Map className="h-4 w-4 mr-2" />
                      View on Map
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="merger" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Plot Merger</CardTitle>
                <CardDescription>
                  Combine adjacent plots into a single plot with automatic updates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Select Plots to Merge</Label>
                      <div className="space-y-2">
                        <Input placeholder="Enter Plot ID 1" />
                        <Input placeholder="Enter Plot ID 2" />
                        <Button variant="outline" size="sm" className="w-full">
                          + Add More Plots
                        </Button>
                      </div>
                    </div>
                    
                    <Card className="bg-muted/50">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">Merged Plot Preview</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Total Area:</span>
                            <span className="ml-2 font-medium">1,200 sq.m</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Combined Value:</span>
                            <span className="ml-2 font-medium">₹60,00,000</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Number of Plots:</span>
                            <span className="ml-2 font-medium">2 plots</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Status:</span>
                            <span className="ml-2 font-medium text-green-600">Adjacent</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="flex gap-3">
                    <Button size="lg">
                      <GitMerge className="h-4 w-4 mr-2" />
                      Merge Plots
                    </Button>
                    <Button size="lg" variant="outline">
                      <Map className="h-4 w-4 mr-2" />
                      View on Map
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="map-view" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Cadastral Map View</CardTitle>
                <CardDescription>
                  Interactive map showing plot boundaries and details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Map className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">Cadastral map integration will be displayed here</p>
                    <p className="text-sm text-muted-foreground mt-2">Integration with Bhunaksha/GatiShakti</p>
                  </div>
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

export default PlotManagement;
