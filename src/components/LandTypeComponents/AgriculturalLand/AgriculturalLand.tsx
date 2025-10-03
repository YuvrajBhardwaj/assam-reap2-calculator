// components/AgriculturalLand.tsx
import { useState } from "react";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Card,
  CardContent, 
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Info, AlertCircle } from "lucide-react";

const AgriculturalLand = () => {
  const [usageType, setUsageType] = useState("both");
  const [subType, setSubType] = useState("irrigated");

  return (
    <Card className="border-maroon-200 shadow-md">
      <CardHeader className="bg-maroon-50 border-b border-maroon-100">
        <CardTitle className="text-maroon-700 text-xl">Agricultural Land Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 p-6">
        {/* Total Area */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="totalArea" className="text-primary font-medium">
              Enter Total Area
            </Label>
            <span className="text-red-500">*</span>
            <div className="relative ml-1 cursor-pointer group">
              <Info className="h-4 w-4 text-maroon-500" />
              <div className="absolute left-0 -top-1 w-64 p-2 bg-white border border-maroon-100 rounded shadow-md hidden group-hover:block z-10 text-xs">
                Enter the total area of the agricultural land
              </div>
            </div>
          </div>
          <div className="flex gap-4">
            <Input
              id="totalArea"
              name="totalArea"
              type="text"
              placeholder="Enter Total Area"
              maxLength={12}
              className="w-full focus:border-maroon-500 focus:ring-maroon-200"
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-red-500">
            <AlertCircle className="h-4 w-4" />
            <span>This Input Field is Mandatory</span>
          </div>
        </div>

        {/* Unit Selection */}
        <div className="space-y-2">
          <Label className="text-primary font-medium">Unit</Label>
          <Select defaultValue="HA">
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select unit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="HA">Hectare (HA)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Partial Transaction Checkbox */}
        <div className="p-4 bg-maroon-50 rounded-md border border-maroon-100">
          <div className="flex items-start space-x-2">
            <Checkbox id="isPartialTransact" name="isPartialTransact" value="true" className="mt-1" />
            <Label htmlFor="isPartialTransact" className="text-sm">
              Do You Wish To Transact The Partial Area Received From Land Record Corresponding To Particular Khasra?
            </Label>
          </div>

          {/* Transact Area Input */}
          <div className="mt-4 pl-6">
            <Label htmlFor="partialTransactArea" className="font-medium text-sm">
              Transact Area
            </Label>
            <Input
              id="partialTransactArea"
              name="partialTransactArea"
              type="text"
              placeholder="Transact Area"
              disabled
              className="w-full mt-1 bg-gray-50"
            />
          </div>
        </div>

        {/* Usage Type Radios */}
        <div className="space-y-3 p-4 bg-white rounded-md border border-gray-200">
          <div className="flex items-center gap-2">
            <Label className="text-primary font-medium">
              Usage Type
            </Label>
            <span className="text-red-500">*</span>
          </div>
          <RadioGroup
            value={usageType}
            onValueChange={setUsageType}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2"
          >
            <div className="flex items-center space-x-2 p-3 rounded-md border border-gray-200 hover:bg-maroon-50 hover:border-maroon-200 transition-colors">
              <RadioGroupItem value="diverted" id="diverted" className="text-maroon-600" />
              <Label htmlFor="diverted">Diverted</Label>
            </div>
            <div className="flex items-center space-x-2 p-3 rounded-md border border-gray-200 hover:bg-maroon-50 hover:border-maroon-200 transition-colors">
              <RadioGroupItem value="undiverted" id="undiverted" className="text-maroon-600" />
              <Label htmlFor="undiverted">Un-Diverted</Label>
            </div>
            <div className="flex items-center space-x-2 p-3 rounded-md border border-gray-200 hover:bg-maroon-50 hover:border-maroon-200 transition-colors">
              <RadioGroupItem value="both" id="both" defaultChecked className="text-maroon-600" />
              <Label htmlFor="both">Both</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Sub-Type Fields - Irrigated / Unirrigated */}
        {(usageType === "undiverted" || usageType === "both") && (
          <div className="space-y-4 p-4 bg-maroon-50 rounded-md border border-maroon-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-primary font-medium">
                  Sub-Type
                </h3>
                <span className="text-red-500">*</span>
              </div>
              <div className="relative cursor-pointer group">
                <Info className="h-4 w-4 text-maroon-500" />
                <div className="absolute right-0 -top-1 w-64 p-2 bg-white border border-maroon-100 rounded shadow-md hidden group-hover:block z-10 text-xs">
                  Select the appropriate sub-type for your agricultural land
                </div>
              </div>
            </div>
            <small className="text-sm text-maroon-600 block mb-2 italic">
              The Sum of All Subtype Area Must Be Equal or Less Than Usage Type Area
            </small>

            <RadioGroup value={subType} onValueChange={setSubType} className="space-y-3">
              {/* Irrigated */}
              <div className="flex items-center justify-between flex-wrap md:flex-nowrap gap-4 p-3 bg-white rounded-md border border-gray-200">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="irrigated" id="irrigated" className="text-maroon-600" />
                  <Label htmlFor="irrigated" className="font-medium">Irrigated</Label>
                </div>
                <Input
                  id="irrigatedArea"
                  name="irrigatedArea"
                  type="text"
                  placeholder="Enter Irrigated Area"
                  maxLength={12}
                  className="w-full md:w-1/3 focus:border-maroon-500 focus:ring-maroon-200"
                />
              </div>

              {/* Unirrigated Single Crop */}
              <div className="flex items-center justify-between flex-wrap md:flex-nowrap gap-4 p-3 bg-white rounded-md border border-gray-200">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="unirrigatedSingle" id="unirrigatedSingle" className="text-maroon-600" />
                  <Label htmlFor="unirrigatedSingle" className="font-medium">Unirrigated Single Crop</Label>
                </div>
                <Input
                  id="unirrigatedSArea"
                  name="singleCropArea"
                  type="text"
                  placeholder="Enter Area in Hectare"
                  maxLength={12}
                  className="w-full md:w-1/3 focus:border-maroon-500 focus:ring-maroon-200"
                />
              </div>

              {/* Unirrigated Double Crop */}
              <div className="flex items-center justify-between flex-wrap md:flex-nowrap gap-4 p-3 bg-white rounded-md border border-gray-200">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="unirrigatedDouble" id="unirrigatedDouble" className="text-maroon-600" />
                  <Label htmlFor="unirrigatedDouble" className="font-medium">Unirrigated Double Crop</Label>
                </div>
                <Input
                  id="unirrigatedDArea"
                  name="doubleCropArea"
                  type="text"
                  placeholder="Enter Area in Hectare"
                  maxLength={12}
                  className="w-full md:w-1/3 focus:border-maroon-500 focus:ring-maroon-200"
                />
              </div>
            </RadioGroup>
          </div>
        )}

        {/* Diverted Area Input (for Both or Diverted) */}
        {(usageType === "diverted" || usageType === "both") && (
          <div className="space-y-2 p-4 bg-white rounded-md border border-gray-200">
            <Label htmlFor="totalSellableAreaDiverted" className="text-primary font-medium">
              Diverted Area
            </Label>
            <Input
              id="totalSellableAreaDiverted"
              name="totalSellableAreaDiverted"
              type="text"
              placeholder="Diverted Area"
              maxLength={12}
              className="w-full md:w-1/3 focus:border-maroon-500 focus:ring-maroon-200"
            />
          </div>
        )}

        {/* Un-Diverted Area Input (only for Both) */}
        {usageType === "both" && (
          <div className="space-y-2 p-4 bg-white rounded-md border border-gray-200">
            <Label htmlFor="totalSellableAreaUndiverted" className="text-primary font-medium">
              Un-Diverted Area
            </Label>
            <Input
              id="totalSellableAreaUndiverted"
              name="totalSellableAreaUndiverted"
              type="text"
              placeholder="Un-Diverted Area"
              maxLength={12}
              disabled
              className="w-full md:w-1/3 bg-gray-50"
            />
          </div>
        )}

        {/* Owner / Seller Section */}
        <Card className="border-maroon-200">
          <CardHeader className="py-3 px-4 bg-maroon-50 border-b border-maroon-100">
            <div className="flex items-center gap-2">
              <CardTitle className="text-primary text-base font-medium">
                Owner / Seller
              </CardTitle>
              <sup className="text-red-500">*</sup>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center space-x-2 p-2 rounded-md border border-gray-200 hover:bg-maroon-50 hover:border-maroon-200 transition-colors">
                <input type="radio" id="do_all_SellersYes" name="inlineRadioOptions1" className="text-maroon-600" />
                <Label htmlFor="do_all_SellersYes">Yes</Label>
              </div>
              <div className="flex items-center space-x-2 p-2 rounded-md border border-gray-200 hover:bg-maroon-50 hover:border-maroon-200 transition-colors">
                <input type="radio" id="do_all_SellersNo" name="inlineRadioOptions1" className="text-maroon-600" />
                <Label htmlFor="do_all_SellersNo">No</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Buyer Section */}
        <Card className="border-maroon-200">
          <CardHeader className="py-3 px-4 bg-maroon-50 border-b border-maroon-100">
            <div className="flex items-center gap-2">
              <CardTitle className="text-primary text-base font-medium">
                Buyer
              </CardTitle>
              <sup className="text-red-500">*</sup>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center space-x-2 p-2 rounded-md border border-gray-200 hover:bg-maroon-50 hover:border-maroon-200 transition-colors">
                <input type="radio" id="oneBuyerYes" name="isMoreBuyers" className="text-maroon-600" />
                <Label htmlFor="oneBuyerYes">Yes</Label>
              </div>
              <div className="flex items-center space-x-2 p-2 rounded-md border border-gray-200 hover:bg-maroon-50 hover:border-maroon-200 transition-colors">
                <input type="radio" id="oneBuyerNo" name="isMoreBuyers" className="text-maroon-600" />
                <Label htmlFor="oneBuyerNo">No</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subclauses Section */}
        <Card className="border-maroon-200">
          <CardHeader className="py-3 px-4 bg-maroon-50 border-b border-maroon-100">
            <CardTitle className="text-primary text-base font-medium">
              Subclause
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-start space-x-2 p-2 rounded-md border border-gray-200 hover:bg-maroon-50 hover:border-maroon-200 transition-colors">
              <Checkbox id="subclause11" name="subclause" className="mt-1 text-maroon-600" />
              <Label htmlFor="subclause11" className="text-sm">
                Land Earmarked For The Purpose Of Major Mineral Excavation Except Minor Mineral
              </Label>
            </div>
            <div className="flex items-start space-x-2 p-2 rounded-md border border-gray-200 hover:bg-maroon-50 hover:border-maroon-200 transition-colors">
              <Checkbox id="subclause12" name="subclause" className="mt-1 text-maroon-600" />
              <Label htmlFor="subclause12" className="text-sm">
                Whether Agri Land Is Situated On National Highway Or Its Bypass
              </Label>
            </div>
            <div className="flex items-start space-x-2 p-2 rounded-md border border-gray-200 hover:bg-maroon-50 hover:border-maroon-200 transition-colors">
              <Checkbox id="subclause14" name="subclause" className="mt-1 text-maroon-600" />
              <Label htmlFor="subclause14" className="text-sm">
                Whether agriculture land is situated on other paved road
              </Label>
            </div>
            <div className="flex items-start space-x-2 p-2 rounded-md border border-gray-200 hover:bg-maroon-50 hover:border-maroon-200 transition-colors">
              <Checkbox id="subclause13" name="subclause" className="mt-1 text-maroon-600" />
              <Label htmlFor="subclause13" className="text-sm">
                Whether Agri Land Is Situated On State Highway Or Its Bypass
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Construction Checkbox */}
        <div className="flex items-start space-x-2 p-4 bg-maroon-50 rounded-md border border-maroon-100">
          <Checkbox id="isThereCostructionB" name="inlineRadioOptionsB" value="false" className="mt-1 text-maroon-600" />
          <Label htmlFor="isThereCostructionB" className="text-sm">
            Is There Any Construction Done on the Agriculture Land?
          </Label>
        </div>
      </CardContent>
      <CardFooter className="bg-gray-50 border-t p-4 flex justify-end">
        {/* <Button 
          type="button" 
          className="bg-maroon-600 hover:bg-maroon-700 text-white flex items-center gap-2"
        >
          Show Market Value
        </Button> */}
      </CardFooter>
    </Card>
  );
};

export default AgriculturalLand;