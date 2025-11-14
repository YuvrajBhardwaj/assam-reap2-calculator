// src/components/PropertyValuation/LocationDetails.tsx
import { MapPin, ChevronLeft, ChevronRight, Map, Locate } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  getAllDistricts,
  getCirclesByDistrict,
  getMouzasByDistrictAndCircle,
} from "@/services/locationService";
import type { District, Circle, Mouza } from "@/types/masterData";
import { DistrictDetails, useAssamDistrictDetails } from "../building-types/plot";
import GuidelineRatesPage from "../GuidelineRatesPage";
import { useNavigate } from "react-router-dom";

export interface LocationDetailsProps {
  district?: string;
  districtCode?: string;
  // Remove these ↓
  // areaType?: string;
  // localBody?: string;
  // ward?: string;
  // guidelineLocation?: string;
  circle?: string;
  mouza?: string;
  onDistrictChange?: (districtData: DistrictDetails) => void;
  onCircleChange?: (circleData: Circle) => void;
  onMouzaChange?: (mouzaName: string) => void;
  open?: boolean;
  setOpen?: (open: boolean) => void;
}

const LocationDetails = ({
  district: propDistrict = "Select a district",
  districtCode: propDistrictCode,
  // areaType = "-",
  // localBody = "-",
  // ward = "-",
  // guidelineLocation = "-",
  circle: propCircle = "-",
  mouza: propMouza = "-",
  onDistrictChange,
  onCircleChange,
  onMouzaChange,
  open: controlledOpen,
  setOpen: setControlledOpen,
}: LocationDetailsProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined && setControlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? setControlledOpen : setInternalOpen;
  const [showGuidelineDialog, setShowGuidelineDialog] = useState(false);
  const navigate = useNavigate();

  // state
  const { districts, loading: loadingDistricts } = useAssamDistrictDetails();
  const [errorDistricts, setErrorDistricts] = useState<string | null>(null);

  const [circles, setCircles] = useState<Circle[]>([]);
  const [loadingCircles, setLoadingCircles] = useState(false);
  const [errorCircles, setErrorCircles] = useState<string | null>(null);

  const [mouzas, setMouzas] = useState<Mouza[]>([]);
  const [loadingMouzas, setLoadingMouzas] = useState(false);
  const [errorMouzas, setErrorMouzas] = useState<string | null>(null);

  // selected codes
  const [selectedDistrictCode, setSelectedDistrictCode] = useState<string | undefined>(propDistrictCode);
  const [selectedCircleCode, setSelectedCircleCode] = useState<string | undefined>(undefined);
  const [selectedMouzaCode, setSelectedMouzaCode] = useState<string | undefined>(undefined);

  // Compute current district name for display
  const currentDistrictName = districts.find(d => d.districtCode === selectedDistrictCode)?.name || propDistrict;

  // keep prop in sync
  useEffect(() => {
    setSelectedDistrictCode(propDistrictCode);
  }, [propDistrictCode]);

  // fetch circles when district changes
  useEffect(() => {
    if (!selectedDistrictCode) return;
    const fetchCircles = async () => {
      setLoadingCircles(true);
      setErrorCircles(null);
      setCircles([]);
      setSelectedCircleCode(undefined);
      setSelectedMouzaCode(undefined);
      try {
        const data = await getCirclesByDistrict(selectedDistrictCode);
        setCircles(data);
      } catch (err) {
        setErrorCircles('Failed to fetch circles.');
        console.error(err);
      } finally {
        setLoadingCircles(false);
      }
    };
    fetchCircles();
  }, [selectedDistrictCode]);

  // fetch mouzas when circle changes
  useEffect(() => {
    if (!selectedDistrictCode || !selectedCircleCode) return;
    const fetchMouzas = async () => {
      setLoadingMouzas(true);
      setErrorMouzas(null);
      setMouzas([]);
      setSelectedMouzaCode(undefined);
      try {
        const data = await getMouzasByDistrictAndCircle(
          selectedDistrictCode,
          selectedCircleCode
        );
        setMouzas(data);
      } catch (err) {
        setErrorMouzas('Failed to fetch mouzas.');
        console.error(err);
      } finally {
        setLoadingMouzas(false);
      }
    };
    fetchMouzas();
  }, [selectedDistrictCode, selectedCircleCode]);

  // handlers
  const handleViewZonalValues = () => setShowGuidelineDialog(true);

  const handleCalculatePropertyValue = () => {
    const district = districts.find(d => d.districtCode === selectedDistrictCode);
    const circle = circles.find(c => c.code === selectedCircleCode);
    const mouza = mouzas.find(m => m.code === selectedMouzaCode);

    const params = new URLSearchParams();
    if (district) params.set('district', district.districtCode);
    if (circle) params.set('circle', circle.code);
    if (mouza) params.set('mouza', mouza.code);
    window.history.pushState({}, '', `?${params.toString()}`);

    window.dispatchEvent(
      new CustomEvent('navigate-to-tab', {
        detail: {
          tab: 'valuation-calculator',
          locationData: {
            district: district ? { code: district.districtCode, name: district.name } : undefined,
            circle: circle ? { code: circle.code, name: circle.name } : undefined,
            // Send both for compatibility; consumers can map either
            village: mouza
              ? { villageCode: mouza.code, villageName: mouza.name }
              : undefined,
            mouza,
          },
        },
      })
    );
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className="fixed left-2 sm:left-4 top-1/2 -translate-y-1/2 z-[1050] bg-white border rounded-r-full shadow p-3"
          aria-label="Show Location Details"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </DialogTrigger>

      <DialogContent
        className="p-0 border-none shadow-2xl bg-white w-96 max-w-full left-0 top-1/2 -translate-y-1/2 translate-x-0 z-[1050] rounded-none"
        style={{ position: 'fixed', borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
      >
        <Card className="w-full rounded-none border-none bg-white relative">
          <button
            className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 bg-white border rounded-full shadow p-2 z-10"
            onClick={() => setOpen(false)}
            aria-label="Hide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Guideline Location
            </CardTitle>

            <Dialog open={showGuidelineDialog} onOpenChange={setShowGuidelineDialog}>
              <DialogContent className="max-w-4xl h-[90vh] mx-auto p-0 bg-white rounded-lg shadow-xl overflow-auto max-h-[80vh] z-[1050]">
                <GuidelineRatesPage />
              </DialogContent>
            </Dialog>

            <div className="mt-4 grid grid-cols-1 gap-2 text-sm text-gray-700">
              {/* District */}
              <div className="flex gap-2">
                <span className="font-semibold w-32">District:</span>
                <Select
                  value={currentDistrictName}
                  onValueChange={(value) => {
                    const selectedD = districts.find(d => d.name === value);
                    if (selectedD) {
                      setSelectedDistrictCode(selectedD.districtCode);
                      setSelectedCircleCode(undefined);
                      setSelectedMouzaCode(undefined);
                      if (onDistrictChange) {
                        const districtDetails: DistrictDetails = {
                          districtCode: selectedD.districtCode,
                          name: selectedD.name,
                          lat: selectedD.lat, // Assuming 'lat' and 'lng' exist on District
                          lng: selectedD.lng, // Assuming 'lat' and 'lng' exist on District
                        };
                        onDistrictChange(districtDetails);
                      }
                    }
                  }}
                  disabled={loadingDistricts}
                >
                  <SelectTrigger className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-assam-blue focus:border-transparent transition-all duration-200">
                    <SelectValue
                      placeholder={
                        loadingDistricts
                          ? "Loading..."
                          : errorDistricts || "Select District"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent className="z-[1050]">
                    {loadingDistricts ? (
                      <SelectItem value="loading" disabled>Loading...</SelectItem>
                    ) : errorDistricts ? (
                      <SelectItem value="error" disabled>{errorDistricts}</SelectItem>
                    ) : districts.length === 0 ? (
                      <SelectItem value="no-data" disabled>No districts</SelectItem>
                    ) : (
                      districts.map(d => (
                        <SelectItem key={d.districtCode || d.name} value={d.name}>
                          {d.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Circle */}
              <div className="flex gap-2">
                <span className="font-semibold w-32">Circle:</span>
                <Select
                  value={selectedCircleCode}
                  onValueChange={(value) => {
                    setSelectedCircleCode(value);
                    setSelectedMouzaCode(undefined);
                    if (onCircleChange) {
                      const c = circles.find(c => c.code === value);
                      if (c) onCircleChange(c);
                    }
                  }}
                  disabled={!selectedDistrictCode || loadingCircles || circles.length === 0}
                >
                  <SelectTrigger className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-assam-blue focus:border-transparent transition-all duration-200">
                    <SelectValue
                      placeholder={
                        loadingCircles
                          ? "Loading..."
                          : errorCircles || "Select Circle"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent className="z-[1050]">
                    {loadingCircles ? (
                      <SelectItem value="loading" disabled>Loading...</SelectItem>
                    ) : errorCircles ? (
                      <SelectItem value="error" disabled>{errorCircles}</SelectItem>
                    ) : circles.length === 0 ? (
                      <SelectItem value="no-data" disabled>No circles</SelectItem>
                    ) : (
                      circles.map(c => (
                        <SelectItem key={c.code} value={c.code}>
                          {c.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Mouza */}
              <div className="flex gap-2">
                <span className="font-semibold w-32">Mouza:</span>
                <Select
                  value={selectedMouzaCode}
                  onValueChange={(value) => {
                    setSelectedMouzaCode(value);
                    if (onMouzaChange) {
                      const m = mouzas.find(m => m.code === value);
                      if (m) onMouzaChange(m.name);
                    }
                  }}
                  disabled={!selectedCircleCode || loadingMouzas || mouzas.length === 0}
                >
                  <SelectTrigger className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-assam-blue focus:border-transparent transition-all duration-200">
                    <SelectValue
                      placeholder={
                        loadingMouzas
                          ? "Loading..."
                          : errorMouzas || "Select Mouza"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent className="z-[1050]">
                    {loadingMouzas ? (
                      <SelectItem value="loading" disabled>Loading...</SelectItem>
                    ) : errorMouzas ? (
                      <SelectItem value="error" disabled>{errorMouzas}</SelectItem>
                    ) : mouzas.length === 0 ? (
                      <SelectItem value="no-data" disabled>No mouzas</SelectItem>
                    ) : (
                      mouzas.map(m => (
                        <SelectItem key={m.code} value={m.code}>
                          {m.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Read-only fields */}
              {/* <div className="flex gap-2"><span className="font-semibold w-32">Area Type:</span><span>{areaType}</span></div>
              <div className="flex gap-2"><span className="font-semibold w-32">Local Body:</span><span>{localBody}</span></div>
              <div className="flex gap-2"><span className="font-semibold w-32">Ward:</span><span>{ward}</span></div>
              <div className="flex gap-2"><span className="font-semibold w-32">Guideline Location:</span><span>{guidelineLocation}</span></div> */}
            </div>
          </CardHeader>

          <CardContent className="p-4" />
          <CardFooter className="flex justify-between p-4">
            <Button variant="outline" onClick={handleViewZonalValues} className="flex-1 mr-2 border-assam-blue text-assam-blue hover:bg-assam-blue hover:text-white transition-colors duration-200">
              <Map className="mr-2 h-4 w-4" /> View Zonal Values
            </Button>
            <Button onClick={handleCalculatePropertyValue} className="flex-1 ml-2 bg-assam-blue text-white hover:bg-blue-700 transition-colors duration-200">
              <Locate className="mr-2 h-4 w-4" /> Calculate Property Value
            </Button>
          </CardFooter>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default LocationDetails;