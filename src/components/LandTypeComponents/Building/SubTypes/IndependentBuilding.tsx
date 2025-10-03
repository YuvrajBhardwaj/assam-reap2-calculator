// components/LandTypeComponents/Building/SubTypes/IndependentBuilding.tsx
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info, AlertCircle } from "lucide-react";

const IndependentBuilding = () => {
  const [transactOpenTerrace, setTransactOpenTerrace] = useState(false);
  const [conveyanceType, setConveyanceType] = useState("");
  
  return (
    <Card className="border-maroon-200 shadow-md">
      <CardHeader className="bg-maroon-50 border-b border-maroon-100">
        <CardTitle className="text-maroon-700 text-xl">Independent Building Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 p-6">
        {/* Built-Up Area */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="builtUpArea" className="text-primary font-medium">
              Built-Up Area
            </Label>
            <span className="text-red-500">*</span>
            <div className="relative ml-1 cursor-pointer group">
              <Info className="h-4 w-4 text-maroon-500" />
              <div className="absolute left-0 -top-1 w-64 p-2 bg-white border border-maroon-100 rounded shadow-md hidden group-hover:block z-10 text-xs">
                Enter the total built-up area of the building
              </div>
            </div>
          </div>
          <Input 
            id="builtUpArea" 
            placeholder="Enter built-up area" 
            className="focus:border-maroon-500 focus:ring-maroon-200"
          />
          <div className="flex items-center gap-2 text-sm text-red-500">
            <AlertCircle className="h-4 w-4" />
            <span>This Input Field is Mandatory</span>
          </div>
        </div>
        
        {/* Common Area */}
        <div className="space-y-2">
          <Label htmlFor="commonArea" className="text-primary font-medium">Common Area</Label>
          <Input 
            id="commonArea" 
            placeholder="Enter common area" 
            className="focus:border-maroon-500 focus:ring-maroon-200"
          />
        </div>
        
        {/* Floor Type */}
        <div className="space-y-3 p-4 bg-white rounded-md border border-gray-200">
          <div className="flex items-center gap-2">
            <Label className="text-primary font-medium">Floor Type</Label>
            <span className="text-red-500">*</span>
          </div>
          <RadioGroup defaultValue="basement" className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <div className="flex items-center space-x-2 p-3 rounded-md border border-gray-200 hover:bg-maroon-50 hover:border-maroon-200 transition-colors">
              <RadioGroupItem value="basement" id="basement" className="text-maroon-600" />
              <Label htmlFor="basement">Basement</Label>
            </div>
            <div className="flex items-center space-x-2 p-3 rounded-md border border-gray-200 hover:bg-maroon-50 hover:border-maroon-200 transition-colors">
              <RadioGroupItem value="ground" id="ground" className="text-maroon-600" />
              <Label htmlFor="ground">Ground Floor</Label>
            </div>
            <div className="flex items-center space-x-2 p-3 rounded-md border border-gray-200 hover:bg-maroon-50 hover:border-maroon-200 transition-colors">
              <RadioGroupItem value="first" id="first" className="text-maroon-600" />
              <Label htmlFor="first">First Floor</Label>
            </div>
            <div className="flex items-center space-x-2 p-3 rounded-md border border-gray-200 hover:bg-maroon-50 hover:border-maroon-200 transition-colors">
              <RadioGroupItem value="second" id="second" className="text-maroon-600" />
              <Label htmlFor="second">Second Floor</Label>
            </div>
            <div className="flex items-center space-x-2 p-3 rounded-md border border-gray-200 hover:bg-maroon-50 hover:border-maroon-200 transition-colors">
              <RadioGroupItem value="third" id="third" className="text-maroon-600" />
              <Label htmlFor="third">Third Floor And Above</Label>
            </div>
            <div className="flex items-center space-x-2 p-3 rounded-md border border-gray-200 hover:bg-maroon-50 hover:border-maroon-200 transition-colors">
              <RadioGroupItem value="lower-ground" id="lower-ground" className="text-maroon-600" />
              <Label htmlFor="lower-ground">Lower Ground Floor</Label>
            </div>
          </RadioGroup>
        </div>
        
        {/* Construction Year */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="constructionYear" className="text-primary font-medium">Construction Year</Label>
            <span className="text-red-500">*</span>
          </div>
          <Input 
            id="constructionYear" 
            type="text" 
            placeholder="Enter construction year" 
            className="focus:border-maroon-500 focus:ring-maroon-200"
          />
        </div>
        
        {/* Lift Facility */}
        <div className="p-4 bg-maroon-50 rounded-md border border-maroon-100">
          <div className="flex items-center space-x-2">
            <Checkbox id="liftFacility" className="text-maroon-600" />
            <Label htmlFor="liftFacility">Is the Lift Facility Available in the Building?</Label>
          </div>
        </div>
        
        {/* Open Terrace Transaction */}
        <div className="p-4 bg-maroon-50 rounded-md border border-maroon-100">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="transactOpenTerrace" 
              checked={transactOpenTerrace}
              onCheckedChange={(checked) => {
                if (typeof checked === 'boolean') {
                  setTransactOpenTerrace(checked);
                }
              }}
              className="text-maroon-600"
            />
            <Label htmlFor="transactOpenTerrace">Do You Want to Transact Open Terrace?</Label>
          </div>
        
          {/* Conditional rendering based on checkbox */}
          {transactOpenTerrace && (
            <div className="mt-4 pl-6 space-y-4">
              {/* Conveyance Type Dropdown */}
              <div className="space-y-2">
                <Label htmlFor="conveyanceType" className="font-medium">
                  Select Conveyance Type of Open Terrace <span className="text-red-500">*</span>
                </Label>
                <Select value={conveyanceType} onValueChange={setConveyanceType}>
                  <SelectTrigger id="conveyanceType" className="w-full focus:ring-maroon-200">
                    <SelectValue placeholder="Select Conveyance Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="residential">Residential</SelectItem>
                    <SelectItem value="commercial">Commercial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Area of Open Terrace */}
              <div className="space-y-2">
                <Label htmlFor="openTerraceArea" className="font-medium">
                  Enter the Area of Open Terrace <span className="text-red-500">*</span>
                </Label>
                <Input 
                  id="openTerraceArea" 
                  placeholder="Enter the Area of Open Terrace" 
                  className="focus:border-maroon-500 focus:ring-maroon-200"
                />
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default IndependentBuilding;