import { useEffect, useState } from 'react';
import { getAllDistricts, getCirclesByDistrict, getMouzasByDistrictAndCircle, getVillagesByDistrictAndCircleAndMouzaAndLot, getLotsByDistrictAndCircleAndMouza, getPlotNumbersByLocation } from '@/services/locationService';
import type { District, Circle, Mouza, Village, Lot } from '@/types/masterData';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { MapPin, Home, Layers, Ruler, Search } from 'lucide-react';

export default function PlotLookup() {
  const [districts, setDistricts] = useState<District[]>([]);
  const [circles, setCircles] = useState<Circle[]>([]);
  const [mouzas, setMouzas] = useState<Mouza[]>([]);
  const [villages, setVillages] = useState<Village[]>([]);
  const [lots, setLots] = useState<Lot[]>([]);
  const [plotNumbers, setPlotNumbers] = useState<string[]>([]);
  
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedCircle, setSelectedCircle] = useState('');
  const [selectedMouza, setSelectedMouza] = useState('');
  const [selectedVillage, setSelectedVillage] = useState('');
  const [selectedLotId, setSelectedLotId] = useState('');
  const [selectedPlotNo, setSelectedPlotNo] = useState('');

  // Fetch districts on component mount
  useEffect(() => {
    const fetchDistricts = async () => {
      try {
        const data = await getAllDistricts();
        setDistricts(data);
      } catch (error) {
        console.error('Error fetching districts:', error);
      }
    };
    fetchDistricts();
  }, []);

  // Fetch circles when district changes
  useEffect(() => {
    const fetchCircles = async () => {
      if (selectedDistrict) {
        try {
          const data = await getCirclesByDistrict(selectedDistrict);
          setCircles(data);
          setSelectedCircle(''); // Reset circle when district changes
          setSelectedMouza('');
          setSelectedVillage('');
          setSelectedLotId('');
          setSelectedPlotNo('');
        } catch (error) {
          console.error('Error fetching circles:', error);
        }
      } else {
        setCircles([]);
        setSelectedCircle('');
      }
    };
    fetchCircles();
  }, [selectedDistrict]);

  // Fetch mouzas when circle changes
  useEffect(() => {
    const fetchMouzas = async () => {
      if (selectedDistrict && selectedCircle) {
        try {
          const data = await getMouzasByDistrictAndCircle(selectedDistrict, selectedCircle);
          setMouzas(data);
          setSelectedMouza(''); // Reset mouza when circle changes
          setSelectedVillage('');
          setSelectedLotId('');
          setSelectedPlotNo('');
        } catch (error) {
          console.error('Error fetching mouzas:', error);
        }
      } else {
        setMouzas([]);
        setSelectedMouza('');
      }
    };
    fetchMouzas();
  }, [selectedDistrict, selectedCircle]);

  // Fetch lots when mouza changes
  useEffect(() => {
    const fetchLots = async () => {
      if (selectedDistrict && selectedCircle && selectedMouza) {
        try {
          const data = await getLotsByDistrictAndCircleAndMouza(selectedDistrict, selectedCircle, selectedMouza);
          setLots(data);
          setSelectedLotId(''); // Reset selected lot when mouza changes
          setSelectedVillage('');
          setSelectedPlotNo('');
        } catch (error) {
          console.error('Error fetching lots:', error);
          setLots([]);
        }
      } else {
        setLots([]);
        setSelectedLotId('');
      }
    };
    fetchLots();
  }, [selectedDistrict, selectedCircle, selectedMouza]);

  // Fetch villages when lot changes
  useEffect(() => {
    const fetchVillages = async () => {
      if (selectedDistrict && selectedCircle && selectedMouza && selectedLotId) {
        try {
          const selectedLotObject = lots.find(lot => lot.code === selectedLotId);
          if (!selectedLotObject) {
            console.error('Selected lot object not found');
            setVillages([]);
            setSelectedVillage('');
            return;
          }
          const data = await getVillagesByDistrictAndCircleAndMouzaAndLot(
            selectedDistrict, 
            selectedCircle, 
            selectedMouza, 
            selectedLotObject.code
          );
          setVillages(data);
          setSelectedVillage(''); // Reset village when lot changes
          setSelectedPlotNo('');
        } catch (error) {
          console.error('Error fetching villages:', error);
          setVillages([]);
        }
      } else {
        setVillages([]);
        setSelectedVillage('');
      }
    };
    fetchVillages();
  }, [selectedDistrict, selectedCircle, selectedMouza, selectedLotId, lots]);

  // Fetch plot numbers when all location parameters are selected
  useEffect(() => {
    const fetchPlotNumbers = async () => {
      if (selectedDistrict && selectedCircle && selectedMouza && selectedVillage && selectedLotId) {
        try {
          const selectedLotObject = lots.find(lot => lot.code === selectedLotId);
          if (!selectedLotObject) {
            console.error('Selected lot object not found for plot numbers');
            setPlotNumbers([]);
            setSelectedPlotNo('');
            return;
          }
          const data = await getPlotNumbersByLocation(
            selectedDistrict, 
            selectedCircle, 
            selectedMouza, 
            selectedLotObject.code,
            selectedVillage
          );
          setPlotNumbers(data.map(plot => plot.plotNumber));
          setSelectedPlotNo(''); // Reset plot number when location changes
        } catch (error) {
          console.error('Error fetching plot numbers:', error);
          setPlotNumbers([]);
        }
      } else {
        setPlotNumbers([]);
        setSelectedPlotNo('');
      }
    };
    fetchPlotNumbers();
  }, [selectedDistrict, selectedCircle, selectedMouza, selectedVillage, selectedLotId, lots]);

  const handleFetch = () => {
    if (!selectedDistrict || !selectedCircle || !selectedMouza || !selectedLotId || !selectedVillage || !selectedPlotNo) {
      alert('Please select all required fields before fetching plot details.');
      return;
    }
    
    console.log('Fetching plot details for:', {
      district: selectedDistrict,
      circle: selectedCircle,
      mouza: selectedMouza,
      lot: selectedLotId,
      village: selectedVillage,
      plotNo: selectedPlotNo
    });
    
    // Here you would make the actual API call to fetch plot details
    alert(`Fetching details for Plot No: ${selectedPlotNo}`);
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Search className="w-5 h-5 text-blue-600" />
            </div>
            <CardTitle className="text-xl font-semibold text-gray-800">
              Plot Lookup
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {/* District Dropdown */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-1">
                <MapPin className="w-3 h-3 text-gray-500" />
                District
              </Label>
              <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
                <SelectTrigger className="ring-1 ring-border focus:ring-2 focus:ring-blue-500 transition-all duration-200">
                  <SelectValue placeholder="Select District" />
                </SelectTrigger>
                <SelectContent>
                  {districts.map((district) => (
                    <SelectItem key={district.code} value={district.code}>
                      {district.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Circle Dropdown */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-1">
                <Layers className="w-3 h-3 text-gray-500" />
                Circle
              </Label>
              <Select 
                value={selectedCircle} 
                onValueChange={setSelectedCircle}
                disabled={!selectedDistrict}
              >
                <SelectTrigger className="ring-1 ring-border focus:ring-2 focus:ring-blue-500 transition-all duration-200">
                  <SelectValue placeholder="Select Circle" />
                </SelectTrigger>
                <SelectContent>
                  {circles.map((circle) => (
                    <SelectItem key={circle.code} value={circle.code}>
                      {circle.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Mouza Dropdown */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-1">
                <Home className="w-3 h-3 text-gray-500" />
                Mouza
              </Label>
              <Select 
                value={selectedMouza} 
                onValueChange={setSelectedMouza}
                disabled={!selectedCircle}
              >
                <SelectTrigger className="ring-1 ring-border focus:ring-2 focus:ring-blue-500 transition-all duration-200">
                  <SelectValue placeholder="Select Mouza" />
                </SelectTrigger>
                <SelectContent>
                  {mouzas.map((mouza) => (
                    <SelectItem key={mouza.code} value={mouza.code}>
                      {mouza.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* LOT Dropdown */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-1">
                <Ruler className="w-3 h-3 text-gray-500" />
                LOT
              </Label>
              <Select 
                value={selectedLotId} 
                onValueChange={setSelectedLotId}
                disabled={!selectedMouza}
              >
                <SelectTrigger className="ring-1 ring-border focus:ring-2 focus:ring-blue-500 transition-all duration-200">
                  <SelectValue placeholder="Select LOT" />
                </SelectTrigger>
                <SelectContent>
                  {lots.map((lot) => (
                    <SelectItem key={lot.code} value={lot.code}>
                      {lot.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Village Dropdown */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-1">
                <Home className="w-3 h-3 text-gray-500" />
                Village
              </Label>
              <Select 
                value={selectedVillage} 
                onValueChange={setSelectedVillage}
                disabled={!selectedLotId}
              >
                <SelectTrigger className="ring-1 ring-border focus:ring-2 focus:ring-blue-500 transition-all duration-200">
                  <SelectValue placeholder="Select Village" />
                </SelectTrigger>
                <SelectContent>
                  {villages.map((village) => (
                    <SelectItem key={village.code} value={village.code}>
                      {village.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Plot No/Daag No Dropdown */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-1">
                <MapPin className="w-3 h-3 text-gray-500" />
                Plot No/Daag No
              </Label>
              <Select 
                value={selectedPlotNo} 
                onValueChange={setSelectedPlotNo}
                disabled={!selectedVillage}
              >
                <SelectTrigger className="ring-1 ring-border focus:ring-2 focus:ring-blue-500 transition-all duration-200">
                  <SelectValue placeholder="Select Plot No/Daag No" />
                </SelectTrigger>
                <SelectContent>
                  {plotNumbers.map((plotNumber) => (
                    <SelectItem key={plotNumber} value={plotNumber}>
                      {plotNumber}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Fetch Button */}
          <div className="flex justify-center mt-8">
            <Button 
              onClick={handleFetch}
              disabled={!selectedDistrict || !selectedCircle || !selectedMouza || !selectedLotId || !selectedVillage || !selectedPlotNo}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              Fetch Plot Details
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}