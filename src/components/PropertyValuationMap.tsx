import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Map, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useAssamDistrictDetails, DistrictDetails } from './building-types/plot';

import LocationDetails from './PropertyValuation/LocationDetails';
import LeafletMapComponent from './LeafletMapComponent';
import ArcGISMapComponent from './ArcGISMapComponent';

interface PropertyValuationMapProps {
  isFullWidth?: boolean;
  searchType?: string;
  searchText?: string;
  isMapSearchActive?: boolean;
}

const PropertyValuationMap = ({
  isFullWidth = false,
  searchType = "Agriculture ID",
  searchText = "",
  isMapSearchActive = false,
}: PropertyValuationMapProps) => {
  const { districts, loading } = useAssamDistrictDetails();
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictDetails | null>(null);
  const [resetMapTrigger, setResetMapTrigger] = useState(0);
  const [locationDetailsOpen, setLocationDetailsOpen] = useState(false);

  const mapSearchActive = isMapSearchActive || searchType === "By Address" || searchType === "Free Text";

  const handleResetMap = () => {
    setResetMapTrigger(t => t + 1);
    setSelectedDistrict(null);
    setLocationDetailsOpen(false);
    toast({
      title: "Map Reset",
      description: "Map view has been reset.",
    });
  };

  const handleDistrictSelect = (district: DistrictDetails) => {
    setSelectedDistrict(district);
    setLocationDetailsOpen(true);
    toast({
      title: "District Selected",
      description: `${district.name} district selected at coordinates: ${district.lat}, ${district.lng}`,
    });
  };

  const [debouncedSearchText, setDebouncedSearchText] = useState(searchText);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchText(searchText);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchText]);

  return (
    <div className={`relative space-y-4 z-10 ${isFullWidth ? 'w-full max-w-full' : 'w-full'}`}>
      <Card className="w-full shadow-xl border border-gray-200 rounded-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-maroon-700 to-maroon-900 text-white p-4 rounded-t-xl">
          <CardTitle className="flex items-center justify-between text-lg font-semibold">
            <div className="flex items-center gap-2">
              <Map className="h-5 w-5" />
              Assam District Selection
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetMap}
              className="text-white hover:bg-maroon-600 hover:text-white p-2 h-auto"
            >
              <RefreshCcw className="h-4 w-4 mr-1" />
              Reset
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 bg-gray-50">
          <div className="relative h-[600px] w-full rounded-lg overflow-hidden shadow-lg z-10">
            {/* <ArcGISMapComponent
              initialLocation={selectedDistrict ? `${selectedDistrict.name}, Assam, India` : "Assam, India"}
              markerLocations={assamDistrictDetails}
              onMarkerClick={handleDistrictSelect}
              selectedDistrict={selectedDistrict}
              searchText={mapSearchActive ? debouncedSearchText : undefined}
              searchType={mapSearchActive ? searchType : undefined}
            /> */}
            <LeafletMapComponent
              initialLocation={selectedDistrict ? `${selectedDistrict.name}, Assam, India` : "Assam, India"}
              markerLocations={districts}
              onMarkerClick={handleDistrictSelect}
              selectedDistrict={selectedDistrict}
              searchText={mapSearchActive ? searchText : undefined}
              searchType={mapSearchActive ? searchType : undefined}
              resetMapTrigger={resetMapTrigger}
            />
          </div>
          {selectedDistrict && (
            <div className="mt-4 p-3 bg-white rounded-lg border border-maroon-200 shadow-md">
              <h3 className="font-semibold text-maroon-800 text-base mb-1">Selected: {selectedDistrict.name}</h3>
              <p className="text-sm text-gray-600">Coordinates: {selectedDistrict.lat}, {selectedDistrict.lng}</p>
              <p className="text-sm text-gray-500 mt-1">Proceed with land type selection for {selectedDistrict.name}.</p>
            </div>
          )}
        </CardContent>
      </Card>
      {selectedDistrict && (
        <div className="absolute left-4 top-4 z-30 w-80">
          <LocationDetails
            district={selectedDistrict.name}
            districtCode={selectedDistrict.districtCode}
            // areaType={selectedDistrict.areaType}
            // localBody={selectedDistrict.localBody}
            // ward={selectedDistrict.ward}
            // guidelineLocation={selectedDistrict.guidelineLocation}
            circle={selectedDistrict.circle}
            mouza={selectedDistrict.village}
            open={locationDetailsOpen}
            setOpen={setLocationDetailsOpen}
            onDistrictChange={setSelectedDistrict}
          />
        </div>
      )}
    </div>
  );
};

export default PropertyValuationMap;