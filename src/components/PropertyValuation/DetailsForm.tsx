
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { LAND_TYPES } from "@/constants/propertyValuation";

interface DetailsFormProps {
  selectedLandType: string;
  handleViewGuidelineRates: () => void;
}

const DetailsForm = ({ selectedLandType, handleViewGuidelineRates }: DetailsFormProps) => {
  const [totalArea, setTotalArea] = useState("");
  const [builtUpArea, setBuiltUpArea] = useState("");
  const [commonArea, setCommonArea] = useState("");
  const [unitType, setUnitType] = useState("sqm");
  const [isPartiallyTransacted, setIsPartiallyTransacted] = useState(false);
  const [floorType, setFloorType] = useState("");
  const [constructionYear, setConstructionYear] = useState("");
  const [hasLiftFacility, setHasLiftFacility] = useState(false);
  const [transactOpenTerrace, setTransactOpenTerrace] = useState(false);
  const [usageType, setUsageType] = useState("residential");
  const [selectedSubclauses, setSelectedSubclauses] = useState<string[]>([]);

  const handleSubclauseChange = (value: string) => {
    if (selectedSubclauses.includes(value)) {
      setSelectedSubclauses(selectedSubclauses.filter(item => item !== value));
    } else {
      setSelectedSubclauses([...selectedSubclauses, value]);
    }
  };

  const handleCalculate = () => {
    toast({
      title: "Calculating valuation",
      description: "Calculating property value with the provided details",
    });
  };

  // Modified handler for checkbox state changes to handle CheckedState properly
  const handleCheckedChange = (checked: boolean | "indeterminate", setterFn: (value: boolean) => void) => {
    // Convert "indeterminate" to false, or use the boolean value directly
    setterFn(checked === true);
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Lease Hold Property */}
          <div>
            <div className="flex items-center mb-2">
              <Checkbox id="housingBoard" />
              <Label htmlFor="housingBoard" className="ml-2">
                Whether the property is a lease hold property of the housing board?
              </Label>
            </div>
            <p className="text-yellow-600 text-sm">Note * The sum of all area field must be equal to total area</p>
          </div>
          
          {/* Total Area, Built-Up Area, Common Area, and Unit */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="totalArea" className="font-medium">
                Enter Total Area <span className="text-red-500">*</span>
              </Label>
              <Input 
                id="totalArea" 
                placeholder="Enter Total Area" 
                value={totalArea}
                onChange={(e) => setTotalArea(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="unit" className="font-medium">
                Unit
              </Label>
              <Select value={unitType} onValueChange={setUnitType}>
                <SelectTrigger id="unit" className="mt-1">
                  <SelectValue placeholder="Select Unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sqm">Square meter(SQM)</SelectItem>
                  <SelectItem value="sqft">Square feet(SQFT)</SelectItem>
                  <SelectItem value="acre">Acre</SelectItem>
                  <SelectItem value="hectare">Hectare</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Partially Transacted */}
          <div>
            <div className="flex items-center">
              <Checkbox 
                id="partiallyTransacted" 
                checked={isPartiallyTransacted}
                onCheckedChange={(checked) => handleCheckedChange(checked, setIsPartiallyTransacted)}
              />
              <Label htmlFor="partiallyTransacted" className="ml-2">
                Is the area being partially transacted?
              </Label>
            </div>
          </div>

          {/* Building specific fields */}
          {selectedLandType === LAND_TYPES.BUILDING && (
            <BuildingDetails 
              builtUpArea={builtUpArea}
              setBuiltUpArea={setBuiltUpArea}
              commonArea={commonArea}
              setCommonArea={setCommonArea}
              floorType={floorType}
              setFloorType={setFloorType}
              constructionYear={constructionYear}
              setConstructionYear={setConstructionYear}
              hasLiftFacility={hasLiftFacility}
              setHasLiftFacility={setHasLiftFacility}
              transactOpenTerrace={transactOpenTerrace}
              setTransactOpenTerrace={setTransactOpenTerrace}
              handleCheckedChange={handleCheckedChange}
            />
          )}

          {/* Agricultural specific fields */}
          {selectedLandType === LAND_TYPES.AGRICULTURAL && (
            <AgricultureDetails />
          )}

          {/* Plot specific fields */}
          {selectedLandType === LAND_TYPES.PLOT && (
            <PlotDetails 
              usageType={usageType}
              setUsageType={setUsageType}
            />
          )}

          {/* Subclause */}
          <SubclauseSection 
            selectedSubclauses={selectedSubclauses}
            handleSubclauseChange={handleSubclauseChange}
          />

          {/* Action Buttons */}
          <Button 
            className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-3"
            onClick={handleCalculate}
          >
            <Calculator className="mr-2 h-4 w-4" /> Show Market Value
          </Button>
          
          {/* View Guideline Rates Button */}
          <Button 
            className="w-full mt-4 bg-maroon-500 hover:bg-maroon-600 text-white font-bold py-3"
            onClick={handleViewGuidelineRates}
          >
            View Guideline Rates
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

interface BuildingDetailsProps {
  builtUpArea: string;
  setBuiltUpArea: (value: string) => void;
  commonArea: string;
  setCommonArea: (value: string) => void;
  floorType: string;
  setFloorType: (value: string) => void;
  constructionYear: string;
  setConstructionYear: (value: string) => void;
  hasLiftFacility: boolean;
  setHasLiftFacility: (value: boolean) => void;
  transactOpenTerrace: boolean;
  setTransactOpenTerrace: (value: boolean) => void;
  handleCheckedChange: (checked: boolean | "indeterminate", setterFn: (value: boolean) => void) => void;
}

const BuildingDetails = ({
  builtUpArea,
  setBuiltUpArea,
  commonArea,
  setCommonArea,
  floorType,
  setFloorType,
  constructionYear,
  setConstructionYear,
  hasLiftFacility,
  setHasLiftFacility,
  transactOpenTerrace,
  setTransactOpenTerrace,
  handleCheckedChange
}: BuildingDetailsProps) => {
  return (
    <>
      {/* Built-Up Area and Common Area */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="builtUpArea" className="font-medium">
            Built-Up Area <span className="text-red-500">*</span>
          </Label>
          <Input 
            id="builtUpArea" 
            placeholder="Built-Up Area" 
            value={builtUpArea}
            onChange={(e) => setBuiltUpArea(e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="commonArea" className="font-medium">
            Common Area <span className="text-red-500">*</span>
          </Label>
          <Input 
            id="commonArea" 
            placeholder="Common Area" 
            value={commonArea}
            onChange={(e) => setCommonArea(e.target.value)}
            className="mt-1"
          />
        </div>
      </div>

      {/* Floor Type */}
      <div>
        <Label className="font-medium">
          Floor Type <span className="text-red-500">*</span>
        </Label>
        <RadioGroup value={floorType} onValueChange={setFloorType} className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="basement" id="basement" />
            <Label htmlFor="basement">Basement</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="ground" id="ground" />
            <Label htmlFor="ground">Ground Floor</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="first" id="first" />
            <Label htmlFor="first">First Floor</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="second" id="second" />
            <Label htmlFor="second">Second Floor</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="third-and-above" id="third-and-above" />
            <Label htmlFor="third-and-above">Third Floor And Above</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="lower-ground" id="lower-ground" />
            <Label htmlFor="lower-ground">Lower Ground Floor</Label>
          </div>
        </RadioGroup>
        {!floorType && <p className="text-red-500 text-sm mt-2">PLEASE SELECT FLOOR TYPE</p>}
      </div>

      {/* Construction Year */}
      <div>
        <Label htmlFor="constructionYear" className="font-medium">
          Construction Year <span className="text-red-500">*</span>
        </Label>
        <Input 
          id="constructionYear" 
          placeholder="Construction Year" 
          value={constructionYear}
          onChange={(e) => setConstructionYear(e.target.value)}
          className="mt-1"
        />
      </div>

      {/* Construction Details */}
      <div>
        <Label className="font-medium block mb-2">
          Construction Details
        </Label>
        <div className="space-y-2">
          <div className="flex items-center">
            <Checkbox 
              id="liftFacility" 
              checked={hasLiftFacility}
              onCheckedChange={(checked) => handleCheckedChange(checked, setHasLiftFacility)}
            />
            <Label htmlFor="liftFacility" className="ml-2">
              Is the Lift Facility Available in the Building?
            </Label>
          </div>
          <div className="flex items-center">
            <Checkbox 
              id="transactOpenTerrace" 
              checked={transactOpenTerrace}
              onCheckedChange={(checked) => handleCheckedChange(checked, setTransactOpenTerrace)}
            />
            <Label htmlFor="transactOpenTerrace" className="ml-2">
              Do You Want to Transact Open Terrace?
            </Label>
          </div>
        </div>
      </div>
    </>
  );
};

const AgricultureDetails = () => {
  return (
    <div>
      <Label className="font-medium">
        Usage Type <span className="text-red-500">*</span>
      </Label>
      <RadioGroup defaultValue="no" className="flex items-center gap-4 mb-3">
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="yes" id="yes" />
          <Label htmlFor="yes">Yes</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="no" id="no" />
          <Label htmlFor="no">No</Label>
        </div>
      </RadioGroup>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="flex items-center">
          <Checkbox id="irrigated" />
          <Label htmlFor="irrigated" className="ml-2">Irrigated</Label>
        </div>
        <div className="flex items-center">
          <Checkbox id="unirrigatedSingleCrop" />
          <Label htmlFor="unirrigatedSingleCrop" className="ml-2">Unirrigated Single Crop</Label>
        </div>
        <div className="flex items-center">
          <Checkbox id="unirrigatedDoubleCrop" />
          <Label htmlFor="unirrigatedDoubleCrop" className="ml-2">Unirrigated Double Crop</Label>
        </div>
      </div>
    </div>
  );
};

interface PlotDetailsProps {
  usageType: string;
  setUsageType: (value: string) => void;
}

const PlotDetails = ({ usageType, setUsageType }: PlotDetailsProps) => {
  return (
    <div>
      <Label className="font-medium">
        Usage Type <span className="text-red-500">*</span>
      </Label>
      <p className="font-medium my-2">Residential Cum Commercial</p>
      <RadioGroup defaultValue="no" className="flex items-center gap-4 mb-3">
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="yes" id="yes" />
          <Label htmlFor="yes">Yes</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="no" id="no" />
          <Label htmlFor="no">No</Label>
        </div>
      </RadioGroup>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="flex items-center">
          <Checkbox id="residential" checked={usageType === "residential"} onCheckedChange={() => setUsageType("residential")} />
          <Label htmlFor="residential" className="ml-2">Residential</Label>
        </div>
        <div className="flex items-center">
          <Checkbox id="commercial" checked={usageType === "commercial"} onCheckedChange={() => setUsageType("commercial")} />
          <Label htmlFor="commercial" className="ml-2">Commercial</Label>
        </div>
        <div className="flex items-center">
          <Checkbox id="industrial" checked={usageType === "industrial"} onCheckedChange={() => setUsageType("industrial")} />
          <Label htmlFor="industrial" className="ml-2">Industrial</Label>
        </div>
        <div className="flex items-center">
          <Checkbox id="health" checked={usageType === "health"} onCheckedChange={() => setUsageType("health")} />
          <Label htmlFor="health" className="ml-2">Health</Label>
        </div>
        <div className="flex items-center">
          <Checkbox id="education" checked={usageType === "education"} onCheckedChange={() => setUsageType("education")} />
          <Label htmlFor="education" className="ml-2">Education</Label>
        </div>
        <div className="flex items-center">
          <Checkbox id="other" checked={usageType === "other"} onCheckedChange={() => setUsageType("other")} />
          <Label htmlFor="other" className="ml-2">Other</Label>
        </div>
      </div>
    </div>
  );
};

interface SubclauseSectionProps {
  selectedSubclauses: string[];
  handleSubclauseChange: (value: string) => void;
}

const SubclauseSection = ({ selectedSubclauses, handleSubclauseChange }: SubclauseSectionProps) => {
  return (
    <div>
      <Label className="font-medium block mb-2">
        Subclause
      </Label>
      <div className="space-y-2">
        <div className="flex items-center">
          <Checkbox 
            id="subclause1" 
            checked={selectedSubclauses.includes("paved-road")}
            onCheckedChange={(checked) => checked && handleSubclauseChange("paved-road")}
          />
          <Label htmlFor="subclause1" className="ml-2">
            Whether Property is Situated On Other Paved Road
          </Label>
        </div>
        <div className="flex items-center">
          <Checkbox 
            id="subclause2"
            checked={selectedSubclauses.includes("corner-plot")}
            onCheckedChange={(checked) => checked && handleSubclauseChange("corner-plot")}
          />
          <Label htmlFor="subclause2" className="ml-2">
            Whether Plot is A Corner Plot
          </Label>
        </div>
        <div className="flex items-center">
          <Checkbox 
            id="subclause3"
            checked={selectedSubclauses.includes("legal-colony")}
            onCheckedChange={(checked) => checked && handleSubclauseChange("legal-colony")}
          />
          <Label htmlFor="subclause3" className="ml-2">
            Whether Plot is Situated in Legal Colony And Its Reservation As Ews Is Approved By Competent Authority And Allotee's Name is Listed in Collector's Published List
          </Label>
        </div>
        <div className="flex items-center">
          <Checkbox 
            id="subclause4"
            checked={selectedSubclauses.includes("gandi-basti")}
            onCheckedChange={(checked) => checked && handleSubclauseChange("gandi-basti")}
          />
          <Label htmlFor="subclause4" className="ml-2">
            Whether Plot is Situated in Gandi Basti Declared By Competent Authority And Plot Area Is Upto 35 Sqm
          </Label>
        </div>
        <div className="flex items-center">
          <Checkbox 
            id="subclause5"
            checked={selectedSubclauses.includes("national-highway")}
            onCheckedChange={(checked) => checked && handleSubclauseChange("national-highway")}
          />
          <Label htmlFor="subclause5" className="ml-2">
            Whether Plot is Situated On National Highway Or Its Bypass
          </Label>
        </div>
        <div className="flex items-center">
          <Checkbox 
            id="subclause6"
            checked={selectedSubclauses.includes("state-highway")}
            onCheckedChange={(checked) => checked && handleSubclauseChange("state-highway")}
          />
          <Label htmlFor="subclause6" className="ml-2">
            Whether Plot is Situated On State Highway Or Its Bypass
          </Label>
        </div>
      </div>
    </div>
  );
};

export default DetailsForm;
