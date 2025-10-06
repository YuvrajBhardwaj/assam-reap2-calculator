import { useState } from "react";
import { CheckedState } from "@radix-ui/react-checkbox";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface JurisdictionData {
  district: string;
  circle: string;
  village: string;
  mouza: string;
  plotNo: string;
  currentLandUse: string;
  currentLandType: string;
}

const StructureDetails = () => {
  const [jurisdiction, setJurisdiction] = useState<JurisdictionData>({
    district: "",
    circle: "",
    village: "",
    mouza: "",
    plotNo: "",
    currentLandUse: "",
    currentLandType: ""
  });
  const [transactOpenTerrace, setTransactOpenTerrace] = useState(false);

  const landUseOptions = [
    { value: "residential", label: "Residential" },
    { value: "commercial", label: "Commercial" },
    { value: "agricultural", label: "Agricultural" },
    { value: "industrial", label: "Industrial" },
    { value: "other", label: "Other" },
  ];

  return (
    <Card className="border border-gray-200 mt-6">
      <CardHeader>
        <CardTitle className="text-base font-medium">Structure Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Jurisdiction Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Select 
            value={jurisdiction.district} 
            onValueChange={(value) => setJurisdiction({...jurisdiction, district: value})}
          >
            <SelectTrigger><SelectValue placeholder="District" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Baksa">Baksa</SelectItem>
              <SelectItem value="Barpeta">Barpeta</SelectItem>
              {/* Add more districts */}
            </SelectContent>
          </Select>
          
          <Select
            value={jurisdiction.circle}
            onValueChange={(value) => setJurisdiction({...jurisdiction, circle: value})}
          >
            <SelectTrigger><SelectValue placeholder="Circle" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="demo">Demo Circle</SelectItem>
            </SelectContent>
          </Select>
          
          <Select
            value={jurisdiction.village}
            onValueChange={(value) => setJurisdiction({...jurisdiction, village: value})}
          >
            <SelectTrigger><SelectValue placeholder="Village" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="demo">Demo Village</SelectItem>
            </SelectContent>
          </Select>
          
          <Select
            value={jurisdiction.mouza}
            onValueChange={(value) => setJurisdiction({...jurisdiction, mouza: value})}
          >
            <SelectTrigger><SelectValue placeholder="Mouza" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="demo">Demo Mouza</SelectItem>
            </SelectContent>
          </Select>
          
          <Input 
            placeholder="Plot No." 
            value={jurisdiction.plotNo}
            onChange={(e) => setJurisdiction({...jurisdiction, plotNo: e.target.value})}
          />
          
          <Select
            value={jurisdiction.currentLandUse}
            onValueChange={(value) => setJurisdiction({...jurisdiction, currentLandUse: value})}
          >
            <SelectTrigger><SelectValue placeholder="Current Land Use" /></SelectTrigger>
            <SelectContent>
              {landUseOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select
            value={jurisdiction.currentLandType}
            onValueChange={(value) => setJurisdiction({...jurisdiction, currentLandType: value})}
          >
            <SelectTrigger><SelectValue placeholder="Current Land Type" /></SelectTrigger>
            <SelectContent>
              {landUseOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Input placeholder="Built-Up Area" />
        <Input placeholder="Common Area" />

        <div>
          <Label>Floor Type</Label>
          <Select defaultValue="ground">
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="basement">Basement</SelectItem>
              <SelectItem value="ground">Ground Floor</SelectItem>
              <SelectItem value="first">First Floor</SelectItem>
              <SelectItem value="second">Second Floor</SelectItem>
              <SelectItem value="third">Third Floor and Above</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Input placeholder="Construction Year" type="number" />

        <div className="flex items-center space-x-2">
          <Checkbox id="liftFacility" />
          <Label htmlFor="liftFacility">Is Lift Facility Available?</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="transactOpenTerrace"
            checked={transactOpenTerrace}
            onCheckedChange={(checked: CheckedState) =>
              setTransactOpenTerrace(checked === true)
            }
          />
          <Label htmlFor="transactOpenTerrace">Do You Want to Transact Open Terrace?</Label>
        </div>

        {transactOpenTerrace && (
          <div className="ml-6 space-y-4">
            <div>
              <Label>Select Conveyance Type of Open Terrace</Label>
              <Select>
                <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="residential">Residential</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Input placeholder="Enter Area of Open Terrace" />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export { StructureDetails };
