// components/LandTypeComponents/PlotLand.jsx
import { useState, Dispatch, SetStateAction } from 'react';
import { Card } from "@/components/ui/card";
import { CardContent } from "@/components/ui/card";
import { CardHeader } from "@/components/ui/card";
import { CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup } from "@/components/ui/radio-group";
import { RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Select } from "@/components/ui/select";
import { SelectContent } from "@/components/ui/select";
import { SelectItem } from "@/components/ui/select";
import { SelectTrigger } from "@/components/ui/select";
import { SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";

const PlotLand = () => {
  // State for form inputs
  const [totalArea, setTotalArea] = useState("");
  const [isPartiallyTransacted, setIsPartiallyTransacted] = useState(false);
  const [plotArea, setPlotArea] = useState("");
  const [unitType, setUnitType] = useState("sqm");
  const [enableExistingUsageType, setEnableExistingUsageType] = useState(false);
  const [existingUsageType, setExistingUsageType] = useState('');
  const [enableProposedUsageType, setEnableProposedUsageType] = useState(false);
  const [proposedUsageType, setProposedUsageType] = useState('');
  const [selectedSubclauses, setSelectedSubclauses] = useState<string[]>([]);

  // Handle Subclause Changes
  const handleSubclauseChange = (value: string) => {
    if (selectedSubclauses.includes(value)) {
      setSelectedSubclauses(selectedSubclauses.filter(item => item !== value));
    } else {
      setSelectedSubclauses([...selectedSubclauses, value]);
    }
  };

  // Handle Calculate Market Value
  const handleCalculateMarketValue = () => {
    alert("Calculating market value with the provided details");
  };

  return (
    <Card className="border-maroon-200 shadow-md">
      <CardHeader className="bg-maroon-50 border-b border-maroon-100">
        <CardTitle className="text-maroon-700 text-xl">Plot Land Details</CardTitle>
        <div className="relative ml-1 cursor-pointer group">
          <Info className="h-4 w-4 text-maroon-500" />
          <div className="absolute left-0 -top-1 w-64 p-2 bg-white border border-maroon-100 rounded shadow-md hidden group-hover:block z-10 text-xs">
            Check 'Is the area being partially transacted?' to enter plot area for partial transactions
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 p-6">
        <div className="flex flex-wrap items-start gap-6">
          {/* Total Area and Partial Transaction Checkbox */}
          <div className="flex-1 min-w-[300px] space-y-6">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="partiallyTransacted"
                checked={isPartiallyTransacted}
                onCheckedChange={(checked) => {
                  if (typeof checked === 'boolean') {
                    setIsPartiallyTransacted(checked);
                  }
                }}
                className="h-5 w-5 border-maroon-300 text-maroon-600"
              />
              <Label htmlFor="partiallyTransacted" className="text-gray-700">
                Is the area being partially transacted?
              </Label>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="totalArea" className="text-primary font-medium">
                  Enter Total Area
                </Label>
                <span className="text-red-500">*</span>
                <div className="relative ml-1 cursor-pointer group">
                  <Info className="h-4 w-4 text-maroon-500" />
                  <div className="absolute left-0 -top-1 w-64 p-2 bg-white border border-maroon-100 rounded shadow-md hidden group-hover:block z-10 text-xs">
                    Enter the total area of the plot land
                  </div>
                </div>
              </div>
              <div className="flex items-end gap-2">
                <Input
                  id="totalArea"
                  placeholder="Enter Total Area"
                  value={totalArea}
                  onChange={(e) => setTotalArea(e.target.value)}
                  className="w-full md:w-1/2 focus:border-maroon-500 focus:ring-maroon-500"
                  disabled={isPartiallyTransacted}
                />
                <div className="space-y-2 flex-1 min-w-[100px]">
                  <Label htmlFor="unit" className="text-primary font-medium">
                    Unit
                  </Label>
                  <Select value={unitType} onValueChange={setUnitType}>
                    <SelectTrigger id="unit" className="w-full border-gray-300 focus:border-maroon-500 focus:ring-maroon-500" disabled={isPartiallyTransacted}>
                      <SelectValue placeholder="Select Unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sqm">Square meter(SQM)</SelectItem>
                      <SelectItem value="sqft">Square feet(SQFT)</SelectItem>
                      <SelectItem value="acre">Acre</SelectItem>
                      <SelectItem value="bigha">Bigha</SelectItem>
                      <SelectItem value="katha">Katha</SelectItem>
                      <SelectItem value="lessa">Lessa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            {isPartiallyTransacted && (
              <div className="space-y-2 mt-4">
                <Label htmlFor="plotArea" className="text-primary font-medium">
                  Enter Plot Area (for partial transaction)
                </Label>
                <div className="flex items-end gap-2">
                  <Input
                    id="plotArea"
                    placeholder="Enter Plot Area"
                    value={plotArea}
                    onChange={(e) => setPlotArea(e.target.value)}
                    className="w-full md:w-1/2 focus:border-maroon-500 focus:ring-maroon-500"
                  />
                  <div className="space-y-2 flex-1 min-w-[100px]">
                    <Label htmlFor="unit" className="text-primary font-medium">
                      Unit
                    </Label>
                    <Select value={unitType} onValueChange={setUnitType}>
                      <SelectTrigger id="unit" className="w-full border-gray-300 focus:border-maroon-500 focus:ring-maroon-500">
                        <SelectValue placeholder="Select Unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sqm">Square meter(SQM)</SelectItem>
                        <SelectItem value="sqft">Square feet(SQFT)</SelectItem>
                        <SelectItem value="acre">Acre</SelectItem>
                        <SelectItem value="bigha">Bigha</SelectItem>
                        <SelectItem value="katha">Katha</SelectItem>
                        <SelectItem value="lessa">Lessa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            <p className="text-amber-600 text-sm bg-amber-50 p-2 rounded border border-amber-200 flex items-center">
              <Info className="h-4 w-4 mr-2" />
              Note: The sum of all area fields must be equal to total area
            </p>
          </div>

          {/* Unit Selection (This block will be removed from here) */}
          
        </div>

        {/* Usage Type */}
        <div className="space-y-3 bg-maroon-50 p-4 rounded-md border border-maroon-100">
          <Label className="text-maroon-700 font-medium text-lg">Usage Type</Label>
          <p className="text-gray-600 text-sm">Residential Cum Commercial</p>

          {/* Existing Usage Type Checkbox and Dropdown */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="enableExistingUsageType"
                checked={enableExistingUsageType}
                onCheckedChange={(checked) => {
                  if (typeof checked === 'boolean') {
                    setEnableExistingUsageType(checked);
                    if (!checked) setExistingUsageType('');
                  }
                }}
                className="h-5 w-5 border-maroon-300 text-maroon-600"
              />
              <Label htmlFor="enableExistingUsageType" className="text-primary font-medium">
                 Existing Usage Type
              </Label>
            </div>
            <Select value={existingUsageType} onValueChange={setExistingUsageType} disabled={!enableExistingUsageType}>
              <SelectTrigger id="existingUsageType" className="w-full md:w-1/3 border-gray-300 focus:border-maroon-500 focus:ring-maroon-500">
                <SelectValue placeholder="Select Existing Usage Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="residential">Residential</SelectItem>
                <SelectItem value="commercial">Commercial</SelectItem>
                <SelectItem value="industrial">Industrial</SelectItem>
                <SelectItem value="health">Health</SelectItem>
                <SelectItem value="education">Education</SelectItem>
                <SelectItem value="institute">Institute</SelectItem>
                <SelectItem value="kabristan">Kabristan</SelectItem>
                <SelectItem value="tea-land">Tea Land</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Proposed Usage Type Checkbox and Dropdown */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="enableProposedUsageType"
                checked={enableProposedUsageType}
                onCheckedChange={(checked) => {
                  if (typeof checked === 'boolean') {
                    setEnableProposedUsageType(checked);
                    if (!checked) setProposedUsageType(''); // Clear selection if disabled
                  }
                }}
                className="h-5 w-5 border-maroon-300 text-maroon-600"
              />
              <Label htmlFor="enableProposedUsageType" className="text-primary font-medium">
                 Proposed Usage Type
              </Label>
            </div>
            <Select value={proposedUsageType} onValueChange={setProposedUsageType} disabled={!enableProposedUsageType}>
              <SelectTrigger id="proposedUsageType" className="w-full md:w-1/3 border-gray-300 focus:border-maroon-500 focus:ring-maroon-500">
                <SelectValue placeholder="Select Proposed Usage Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="residential">Residential</SelectItem>
                <SelectItem value="commercial">Commercial</SelectItem>
                <SelectItem value="industrial">Industrial</SelectItem>
                <SelectItem value="health">Health</SelectItem>
                <SelectItem value="education">Education</SelectItem>
                <SelectItem value="institute">Institute</SelectItem>
                <SelectItem value="kabristan">Kabristan</SelectItem>
                <SelectItem value="tea-land">Tea Land</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div> 
            


        {/* Subclause */}
        <div className="space-y-3 bg-maroon-50 p-4 rounded-md border border-maroon-100">
          <h3 className="text-maroon-700 font-medium text-lg">Other Details</h3>
          <div className="space-y-3">
            <div className="flex items-start">
              <Checkbox
                id="subclause1"
                checked={selectedSubclauses.includes("paved-road")}
                onCheckedChange={() => handleSubclauseChange("paved-road")}
                className="h-5 w-5 mt-0.5 border-maroon-300 text-maroon-600"
              />
              <Label htmlFor="subclause1" className="ml-2 text-gray-700">
                Whether Property is Situated On Other Paved Road
              </Label>
            </div>
            <div className="flex items-start">
              <Checkbox
                id="subclause1"
                checked={selectedSubclauses.includes("metal-road")}
                onCheckedChange={() => handleSubclauseChange("metal-road")}
                className="h-5 w-5 mt-0.5 border-maroon-300 text-maroon-600"
              />
              <Label htmlFor="subclause1" className="ml-2 text-gray-700">
                Whether Property is Situated On Other Metal Road
              </Label>
            </div>
            <div className="flex items-start">
              <Checkbox
                id="subclause2"
                checked={selectedSubclauses.includes("corner-plot")}
                onCheckedChange={() => handleSubclauseChange("corner-plot")}
                className="h-5 w-5 mt-0.5 border-maroon-300 text-maroon-600"
              />
              <Label htmlFor="subclause2" className="ml-2 text-gray-700">
                Whether Plot is A Corner Plot
              </Label>
            </div>
            <div className="flex items-start">
              <Checkbox
                id="subclause3"
                checked={selectedSubclauses.includes("litigated-plot")}
                onCheckedChange={() => handleSubclauseChange("litigated-plot")}
                className="h-5 w-5 mt-0.5 border-maroon-300 text-maroon-600"
              />
              <Label htmlFor="subclause3" className="ml-2 text-gray-700">
                Whether it is a litigated plot
              </Label>
            </div>
            <div className="flex items-start">
              <Checkbox
                id="subclause4"
                checked={selectedSubclauses.includes("plot-has-tenant")}
                onCheckedChange={() => handleSubclauseChange("plot-has-tenant")}
                className="h-5 w-5 mt-0.5 border-maroon-300 text-maroon-600"
              />
              <Label htmlFor="subclause4" className="ml-2 text-gray-700">
                Whether plot has a tenant
              </Label>
            </div>
            <div className="flex items-start">
              <Checkbox
                id="subclause5"
                checked={selectedSubclauses.includes("national-highway")}
                onCheckedChange={() => handleSubclauseChange("national-highway")}
                className="h-5 w-5 mt-0.5 border-maroon-300 text-maroon-600"
              />
              <Label htmlFor="subclause5" className="ml-2 text-gray-700">
                Whether Plot is Situated On National Highway Or Its Bypass
              </Label>
            </div>
            <div className="flex items-start">
              <Checkbox
                id="subclause6"
                checked={selectedSubclauses.includes("gandi-basti")}
                onCheckedChange={() => handleSubclauseChange("gandi-basti")}
                className="h-5 w-5 mt-0.5 border-maroon-300 text-maroon-600"
              />
              <Label htmlFor="subclause6" className="ml-2 text-gray-700">
                Whether Plot is Situated In Gandi Basti Declared By Competent Authority And Plot Area Is Upto 40 Sqm
              </Label>
            </div>
          </div>
        </div>

        {/* Show Market Value Button */}
        <Button
          className="w-full bg-maroon-600 hover:bg-maroon-700 text-white font-medium py-2.5 rounded-md"
          onClick={handleCalculateMarketValue}
        >
          Show Market Value
        </Button>
      </CardContent>
    </Card>
  );
};

export default PlotLand;
