// components/LandTypeComponents/Building/SubTypes/OpenTerrace.tsx
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info, AlertCircle } from "lucide-react";

const OpenTerrace = () => {
  const [transactOpenTerrace, setTransactOpenTerrace] = useState(false);
  const [conveyanceType, setConveyanceType] = useState("");
  
  return (
    <Card className="border-maroon-200 shadow-md">
      <CardHeader className="bg-maroon-50 border-b border-maroon-100">
        <CardTitle className="text-maroon-700 text-xl">Open Terrace Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 p-6">
        {/* Total Area */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="totalArea" className="text-primary font-medium">
              Total Area
            </Label>
            <span className="text-red-500">*</span>
            <div className="relative ml-1 cursor-pointer group">
              <Info className="h-4 w-4 text-maroon-500" />
              <div className="absolute left-0 -top-1 w-64 p-2 bg-white border border-maroon-100 rounded shadow-md hidden group-hover:block z-10 text-xs">
                Enter the total area of the open terrace
              </div>
            </div>
          </div>
          <Input 
            id="totalArea" 
            placeholder="Enter total area" 
            className="focus:border-maroon-500 focus:ring-maroon-200"
          />
          <div className="flex items-center gap-2 text-sm text-red-500">
            <AlertCircle className="h-4 w-4" />
            <span>This Input Field is Mandatory</span>
          </div>
        </div>
        
        {/* Usage Type */}
        <div className="space-y-2">
          <Label htmlFor="usageType" className="text-primary font-medium">Usage Type</Label>
          <Input 
            id="usageType" 
            placeholder="Enter usage type (e.g., Residential)" 
            className="focus:border-maroon-500 focus:ring-maroon-200"
          />
        </div>
        
        {/* Ownership Type */}
        <div className="space-y-2">
          <Label className="text-primary font-medium">Ownership Type</Label>
          <Select defaultValue="">
            <SelectTrigger id="ownershipType" className="w-full focus:ring-maroon-200">
              <SelectValue placeholder="Select ownership type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="individual">Individual</SelectItem>
              <SelectItem value="joint">Joint</SelectItem>
              <SelectItem value="corporate">Corporate</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Is the terrace covered? */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox id="isCovered" className="text-maroon-600" />
            <Label htmlFor="isCovered" className="text-primary">Is the terrace covered?</Label>
          </div>
        </div>
        
        {/* Has any construction been done? */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox id="hasConstruction" className="text-maroon-600" />
            <Label htmlFor="hasConstruction" className="text-primary">Has any construction been done on this terrace?</Label>
          </div>
        </div>
        
        {/* Do You Want to Transact Open Terrace? */}
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
            <Label htmlFor="transactOpenTerrace" className="text-primary">Do You Want to Transact Open Terrace?</Label>
          </div>
          
          {/* Conditional rendering based on checkbox */}
          {transactOpenTerrace && (
            <div className="mt-4 space-y-4 pl-6">
              {/* Conveyance Type Dropdown */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="conveyanceType" className="font-medium text-primary">
                    Select Conveyance Type of Open Terrace
                  </Label>
                  <span className="text-red-500">*</span>
                </div>
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
                <div className="flex items-center gap-2">
                  <Label htmlFor="openTerraceArea" className="font-medium text-primary">
                    Enter the Area of Open Terrace
                  </Label>
                  <span className="text-red-500">*</span>
                </div>
                <Input 
                  id="openTerraceArea" 
                  placeholder="Enter the Area of Open Terrace" 
                  className="focus:border-maroon-500 focus:ring-maroon-200"
                />
              </div>
            </div>
          )}
        </div>
        
        {/* Remarks */}
        <div className="space-y-2">
          <Label htmlFor="remarks" className="text-primary font-medium">Remarks</Label>
          <textarea 
            id="remarks"
            className="w-full min-h-[100px] p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-maroon-200 focus:border-maroon-500"
            placeholder="Enter any additional remarks"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default OpenTerrace;