
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, LandPlot, MapPin } from "lucide-react";
import { LAND_TYPES, BUILDING_SUBTYPES } from "@/constants/propertyValuation";

interface LandTypeSelectionProps {
  selectedLandType: string;
  setSelectedLandType: (landType: string) => void;
  selectedBuildingSubtype: string | null;
  setSelectedBuildingSubtype: (subtype: string) => void;
}

const LandTypeSelection = ({
  selectedLandType,
  setSelectedLandType,
  selectedBuildingSubtype,
  setSelectedBuildingSubtype,
}: LandTypeSelectionProps) => {
  return (
    <div className="mb-6 bg-gray-100 p-4 rounded-md">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Choose Option to Calculate Property Value as per Guideline Rate</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Button 
          variant={selectedLandType === LAND_TYPES.AGRICULTURAL ? "default" : "outline"} 
          className="flex items-center justify-center gap-2 h-12 bg-teal-500 hover:bg-teal-600 text-white"
          onClick={() => setSelectedLandType(LAND_TYPES.AGRICULTURAL)}
        >
          <LandPlot className="h-5 w-5" />
          AGRICULTURAL LAND
        </Button>
        <Button 
          variant={selectedLandType === LAND_TYPES.BUILDING ? "default" : "outline"} 
          className="flex items-center justify-center gap-2 h-12 bg-teal-500 hover:bg-teal-600 text-white"
          onClick={() => setSelectedLandType(LAND_TYPES.BUILDING)}
        >
          <Building className="h-5 w-5" />
          STRUCTURE PLOT
        </Button>
        <Button 
          variant={selectedLandType === LAND_TYPES.PLOT ? "default" : "outline"} 
          className="flex items-center justify-center gap-2 h-12 bg-maroon-500 hover:bg-maroon-600 text-white"
          onClick={() => setSelectedLandType(LAND_TYPES.PLOT)}
        >
          <MapPin className="h-5 w-5" />
          PLOT
        </Button>
      </div>
      
      {/* Card Grid for Building Subtypes */}iup
      {selectedLandType === LAND_TYPES.BUILDING && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <BuildingSubtypeCard 
            title="Independent Building" 
            type={BUILDING_SUBTYPES.INDEPENDENT_BUILDING}
            selectedSubtype={selectedBuildingSubtype}
            setSelectedSubtype={setSelectedBuildingSubtype}
          />
          <BuildingSubtypeCard 
            title="Independent Floor" 
            type={BUILDING_SUBTYPES.INDEPENDENT_FLOOR}
            selectedSubtype={selectedBuildingSubtype}
            setSelectedSubtype={setSelectedBuildingSubtype}
          />
          <BuildingSubtypeCard 
            title="Multistorey" 
            type={BUILDING_SUBTYPES.MULTISTOREY}
            selectedSubtype={selectedBuildingSubtype}
            setSelectedSubtype={setSelectedBuildingSubtype}
          />
          <BuildingSubtypeCard 
            title="Open Terrace" 
            type={BUILDING_SUBTYPES.OPEN_TERRACE}
            selectedSubtype={selectedBuildingSubtype}
            setSelectedSubtype={setSelectedBuildingSubtype}
          />
        </div>
      )}
    </div>
  );
};

interface BuildingSubtypeCardProps {
  title: string;
  type: string;
  selectedSubtype: string | null;
  setSelectedSubtype: (subtype: string) => void;
}

const BuildingSubtypeCard = ({ 
  title, 
  type, 
  selectedSubtype, 
  setSelectedSubtype 
}: BuildingSubtypeCardProps) => {
  return (
    <Card className={`border-2 ${selectedSubtype === type ? "border-maroon-500" : "border-gray-200"}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <img src="https://placehold.co/60x40" alt={title} className="mx-auto" />
      </CardContent>
      <Button 
        variant={selectedSubtype === type ? "default" : "outline"} 
        className="w-full"
        onClick={() => setSelectedSubtype(type)}
      >
        Select
      </Button>
    </Card>
  );
};

export default LandTypeSelection;
