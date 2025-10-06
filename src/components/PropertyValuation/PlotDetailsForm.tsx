import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import axios from 'axios';

interface DistrictData {
  districtName: string;
  districtCode: string;
}

interface CircleData {
  circleName: string;
  circleCode: string;
  lot: string | null;
}

interface VillageData {
  villageName: string;
  villageCode: string;
}

interface PlotDetailsProps {
  district: DistrictData | null;
  circle: CircleData | null;
  village: VillageData | null;
  mouza: string;
  plotNo: string;
  currentLandUse: string;
  currentLandType: string;
  onDistrictChange: (value: DistrictData) => void;
  onCircleChange: (value: CircleData) => void;
  onVillageChange: (value: VillageData) => void;
  onMouzaChange: (value: string) => void;
  onPlotNoChange: (value: string) => void;
  onCurrentLandUseChange: (value: string) => void;
  onCurrentLandTypeChange: (value: string) => void;
}

const PlotDetails = ({
  district,
  circle,
  village,
  mouza,
  plotNo,
  currentLandUse,
  currentLandType,
  onDistrictChange,
  onCircleChange,
  onVillageChange,
  onMouzaChange,
  onPlotNoChange,
  onCurrentLandUseChange,
  onCurrentLandTypeChange
}: PlotDetailsProps) => {
  const [landUseChange, setLandUseChange] = useState(false);
  const [plotLocationType, setPlotLocationType] = useState("manual");
  const [onRoad, setOnRoad] = useState(false);
  const [circles, setCircles] = useState<CircleData[]>([]);
  const [villages, setVillages] = useState<VillageData[]>([]);

  useEffect(() => {
    const fetchCircles = async () => {
      if (district) {
        try {
          const response = await axios.get(`http://localhost:8081/masterData/getCircleByDistrict?districtCode=${district.districtCode}`);
          setCircles(response.data.data);
        } catch (error) {
          console.error("Error fetching circles:", error);
          setCircles([]);
        }
      } else {
        setCircles([]);
      }
    };
    fetchCircles();
  }, [district]);

  useEffect(() => {
    const fetchVillages = async () => {
      if (district && circle) {
        try {
          const response = await axios.get(`http://localhost:8081/masterData/getVillageByDistrictAndCircle?districtCode=${district.districtCode}&circleCode=${circle.circleCode}`);
          setVillages(response.data.data);
        } catch (error) {
          console.error("Error fetching villages:", error);
          setVillages([]);
        }
      } else {
        setVillages([]);
      }
    };
    fetchVillages();
  }, [district, circle]);

  return (
    <div className="space-y-6">
      {/* Jurisdiction Info */}
      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle className="text-base font-medium">Jurisdiction Info</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <Label>District</Label>
            <Select
              value={district?.districtCode || ""}
              onValueChange={(value) => {
                const selected = assamDistrictDetails.find(d => d.name === value);
                if (selected) {
                  onDistrictChange({ districtName: selected.name, districtCode: selected.name });
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select District" />
              </SelectTrigger>
              <SelectContent>
                {assamDistrictDetails.map((d) => (
                  <SelectItem key={d.name} value={d.name}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-1">
            <Label>Circle</Label>
            <Select
              value={circle?.circleCode || ""}
              onValueChange={(value) => {
                const selected = circles.find(c => c.circleCode === value);
                if (selected) {
                  onCircleChange(selected);
                }
              }}
              disabled={!district}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Circle" />
              </SelectTrigger>
              <SelectContent>
                {circles.map((c) => (
                  <SelectItem key={c.circleCode} value={c.circleCode}>
                    {c.circleName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label>Village</Label>
            <Select
              value={village?.villageCode || ""}
              onValueChange={(value) => {
                const selected = villages.find(v => v.villageCode === value);
                if (selected) {
                  onVillageChange(selected);
                }
              }}
              disabled={!circle}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Village" />
              </SelectTrigger>
              <SelectContent>
                {villages.map((v) => (
                  <SelectItem key={v.villageCode} value={v.villageCode}>
                    {v.villageName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label>Mouza</Label>
            <Select value={mouza} onValueChange={onMouzaChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select Mouza" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Mouza 1">Mouza 1</SelectItem>
                <SelectItem value="Mouza 2">Mouza 2</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label>Plot No.</Label>
            <Input 
              placeholder="Plot No." 
              value={plotNo}
              onChange={(e) => onPlotNoChange(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <Label>Current Land Use</Label>
            <Select value={currentLandUse} onValueChange={onCurrentLandUseChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select Land Use" />
              </SelectTrigger>
              <SelectContent>
                {landUseOptions.map((use) => (
                  <SelectItem key={use} value={use}>
                    {use}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Land Type Change */}
      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle className="text-base font-medium">Land Type</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <Label>Current Land Type</Label>
            <Select 
              value={currentLandType} 
              onValueChange={onCurrentLandTypeChange}
              disabled={!landUseChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Land Type" />
              </SelectTrigger>
              <SelectContent>
                {landTypeOptions.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {landUseChange && (
            <div className="space-y-1 mt-4">
              <Label>New Land Use Type</Label>
              <Select onValueChange={onCurrentLandUseChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select New Land Use" />
                </SelectTrigger>
                <SelectContent>
                  {landUseOptions.map((use) => (
                    <SelectItem key={use} value={use}>
                      {use}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          <div className="grid grid-cols-3 gap-4 mt-4">
            <Input placeholder="Bigha" />
            <Input placeholder="Katha" />
            <Input placeholder="Lessa" />
          </div>
        </CardContent>
      </Card>

      {/* Land Type Change */}
      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle className="text-base font-medium">Land Type</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <Label>Current Land Type</Label>
            <Select 
              value={currentLandType} 
              onValueChange={onCurrentLandTypeChange}
              disabled={!landUseChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Land Type" />
              </SelectTrigger>
              <SelectContent>
                {landTypeOptions.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {landUseChange && (
            <div className="space-y-1 mt-4">
              <Label>New Land Use Type</Label>
              <Select onValueChange={onCurrentLandUseChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select New Land Use" />
                </SelectTrigger>
                <SelectContent>
                  {landUseOptions.map((use) => (
                    <SelectItem key={use} value={use}>
                      {use}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          <div className="grid grid-cols-3 gap-4 mt-4">
            <Input placeholder="Bigha" />
            <Input placeholder="Katha" />
            <Input placeholder="Lessa" />
          </div>
        </CardContent>
      </Card>

      {/* Land Type Change */}
      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle className="text-base font-medium">Land Type</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <Label>Current Land Type</Label>
            <Select 
              value={currentLandType} 
              onValueChange={onCurrentLandTypeChange}
              disabled={!landUseChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Land Type" />
              </SelectTrigger>
              <SelectContent>
                {landTypeOptions.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {landUseChange && (
            <div className="space-y-1 mt-4">
              <Label>New Land Use Type</Label>
              <Select onValueChange={onCurrentLandUseChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select New Land Use" />
                </SelectTrigger>
                <SelectContent>
                  {landUseOptions.map((use) => (
                    <SelectItem key={use} value={use}>
                      {use}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          <div className="grid grid-cols-3 gap-4 mt-4">
            <Input placeholder="Bigha" />
            <Input placeholder="Katha" />
            <Input placeholder="Lessa" />
          </div>
        </CardContent>
      </Card>

      {/* Land Type Change */}
      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle className="text-base font-medium">Land Type</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <Label>Current Land Type</Label>
            <Select 
              value={currentLandType} 
              onValueChange={onCurrentLandTypeChange}
              disabled={!landUseChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Land Type" />
              </SelectTrigger>
              <SelectContent>
                {landTypeOptions.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {landUseChange && (
            <div className="space-y-1 mt-4">
              <Label>New Land Use Type</Label>
              <Select onValueChange={onCurrentLandUseChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select New Land Use" />
                </SelectTrigger>
                <SelectContent>
                  {landUseOptions.map((use) => (
                    <SelectItem key={use} value={use}>
                      {use}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          <div className="grid grid-cols-3 gap-4 mt-4">
            <Input placeholder="Bigha" />
            <Input placeholder="Katha" />
            <Input placeholder="Lessa" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export { PlotDetails };


const landUseOptions = [
  "Residential",
  "Commercial",
  "Agricultural",
  "Industrial",
  "Other"
];

const landTypeOptions = [
  "Flat/Plot",
  "Independent House",
  "Villa",
  "Shop/Store",
  "Commercial Building",
  "Industrial Land",
  "Agricultural Land"
];
