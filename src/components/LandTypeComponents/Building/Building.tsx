import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import IndependentBuilding from "./SubTypes/IndependentBuilding";
import IndependentFloor from "./SubTypes/IndependentFloor";
import Multistorey from "./SubTypes/Multistorey";
import OpenTerrace from "./SubTypes/OpenTerrace";
import BuildingSubclauses from "./BuildingSubclauses";
import { BUILDING_SUBTYPES } from "@/constants/propertyValuation";

const Building = () => {
  const [selectedBuildingSubtype, setSelectedBuildingSubtype] = useState(
    BUILDING_SUBTYPES.INDEPENDENT_BUILDING
  );
  const [selectedSubclauses, setSelectedSubclauses] = useState<string[]>([]);

  // Handle Subclause Changes
  const handleSubclauseChange = (value: string) => {
    if (selectedSubclauses.includes(value)) {
      setSelectedSubclauses(selectedSubclauses.filter(item => item !== value));
    } else {
      setSelectedSubclauses([...selectedSubclauses, value]);
    }
  };

  // Function to check if the selected building subtype has subclauses
  const hasSubclauses = (subtype: string) => {
    return subtype === BUILDING_SUBTYPES.INDEPENDENT_BUILDING || 
           subtype === BUILDING_SUBTYPES.MULTISTOREY;
  };

  return (
    <div className="space-y-6">
      <Card className="border-maroon-200 shadow-md">
        <CardHeader className="bg-maroon-50 border-b border-maroon-100">
          <CardTitle className="text-maroon-700 text-xl">Building Type Selection</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {/* Building Subtype Selection Cards */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-2 lg:grid-cols-2">
            {/* Independent Building Card */}
            <Card
              className={`border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                selectedBuildingSubtype === BUILDING_SUBTYPES.INDEPENDENT_BUILDING
                  ? "border-maroon-500 bg-maroon-50"
                  : "border-gray-200 hover:border-maroon-200"
              }`}
              onClick={() =>
                setSelectedBuildingSubtype(BUILDING_SUBTYPES.INDEPENDENT_BUILDING)
              }
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Independent Building
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 text-sm text-gray-600">
                Select this if the property is a standalone structure.
              </CardContent>
            </Card>

            {/* Independent Floor Card */}
            <Card
              className={`border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                selectedBuildingSubtype === BUILDING_SUBTYPES.INDEPENDENT_FLOOR
                  ? "border-maroon-500 bg-maroon-50"
                  : "border-gray-200 hover:border-maroon-200"
              }`}
              onClick={() =>
                setSelectedBuildingSubtype(BUILDING_SUBTYPES.INDEPENDENT_FLOOR)
              }
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Independent Floor
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 text-sm text-gray-600">
                Choose this if it's an independent floor within a larger building.
              </CardContent>
            </Card>

            {/* Multistorey Card */}
            <Card
              className={`border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                selectedBuildingSubtype === BUILDING_SUBTYPES.MULTISTOREY
                  ? "border-maroon-500 bg-maroon-50"
                  : "border-gray-200 hover:border-maroon-200"
              }`}
              onClick={() =>
                setSelectedBuildingSubtype(BUILDING_SUBTYPES.MULTISTOREY)
              }
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Multistorey</CardTitle>
              </CardHeader>
              <CardContent className="p-4 text-sm text-gray-600">
                Select this if the building has multiple floors.
              </CardContent>
            </Card>

            {/* Open Terrace Card */}
            <Card
              className={`border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                selectedBuildingSubtype === BUILDING_SUBTYPES.OPEN_TERRACE
                  ? "border-maroon-500 bg-maroon-50"
                  : "border-gray-200 hover:border-maroon-200"
              }`}
              onClick={() =>
                setSelectedBuildingSubtype(BUILDING_SUBTYPES.OPEN_TERRACE)
              }
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Open Terrace</CardTitle>
              </CardHeader>
              <CardContent className="p-4 text-sm text-gray-600">
                For terrace areas without any construction on top.
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Render Subtype Components Conditionally */}
      {selectedBuildingSubtype === BUILDING_SUBTYPES.INDEPENDENT_BUILDING && (
        <IndependentBuilding />
      )}
      {selectedBuildingSubtype === BUILDING_SUBTYPES.INDEPENDENT_FLOOR && (
        <IndependentFloor />
      )}
      {selectedBuildingSubtype === BUILDING_SUBTYPES.MULTISTOREY && (
        <Multistorey />
      )}
      {selectedBuildingSubtype === BUILDING_SUBTYPES.OPEN_TERRACE && (
        <OpenTerrace />
      )}

      {/* Building Subclauses - Only show for subtypes that have subclauses */}
      {hasSubclauses(selectedBuildingSubtype) && (
        <BuildingSubclauses
          selectedSubclauses={selectedSubclauses}
          handleSubclauseChange={handleSubclauseChange}
          buildingSubtype={selectedBuildingSubtype}
        />
      )}
    </div>
  );
};

export default Building;