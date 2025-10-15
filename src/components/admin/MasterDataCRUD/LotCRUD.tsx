import React, { useState, useEffect } from 'react';
import GenericDataTable, { TableColumn, FormField, CRUDService } from './GenericDataTable';
import * as masterDataService from '@/services/masterDataService';
import { Lot, District, Circle } from '@/types/masterData';
import { getCirclesByDistrict, getAllDistricts } from '@/services/locationService';
import { fetchLotsByDistrictAndCircle } from '@/services/masterDataService';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { MapPin, Filter, RefreshCw } from 'lucide-react';

interface LotCRUDProps {
  className?: string;
}

export default function LotCRUD({ className = "" }: LotCRUDProps) {
  const [lots, setLots] = useState<Lot[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [circles, setCircles] = useState<Circle[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [selectedCircle, setSelectedCircle] = useState<string>('');
  
  const { toast } = useToast();

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedDistrict) {
      loadCirclesByDistrict(selectedDistrict);
      setSelectedCircle('');
    } else {
      setCircles([]);
    }
  }, [selectedDistrict]);

  useEffect(() => {
    loadFilteredLots();
  }, [selectedDistrict, selectedCircle]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const districtData = await getAllDistricts();
      setDistricts(districtData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load district data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadCirclesByDistrict = async (districtCode: string) => {
    try {
      const circleData = await getCirclesByDistrict(districtCode);
      setCircles(circleData);
    } catch (error) {
      console.error('Error loading circles:', error);
    }
  };

  const loadFilteredLots = async () => {
    if (!selectedDistrict || !selectedCircle) {
        setLots([]);
        return;
    }
    try {
      setLoading(true);
      const filteredData = await fetchLotsByDistrictAndCircle(
        selectedDistrict,
        selectedCircle
      );
      setLots(filteredData);
    } catch (error) {
      console.error('Error loading filtered lots:', error);
    } finally {
        setLoading(false);
    }
  };

  const clearFilters = () => {
    setSelectedDistrict('');
    setSelectedCircle('');
    setCircles([]);
    setLots([]);
  };

  const columns: TableColumn<Lot>[] = [
    { key: 'code', label: 'Lot Code', sortable: true, searchable: true },
    { key: 'name', label: 'Lot Name', sortable: true, searchable: true },
    { 
      key: 'districtCode', 
      label: 'District', 
      sortable: true, 
      searchable: true,
      render: (_value, item) => {
        const district = districts.find(d => d.code === item.districtCode);
        return district ? district.name : item.districtCode;
      }
    },
    { 
      key: 'circleCode', 
      label: 'Circle', 
      sortable: true, 
      searchable: true,
      render: (_value, item) => {
        const circle = circles.find(c => c.code === item.circleCode);
        return circle ? circle.name : item.circleCode;
      }
    },
    { key: 'isActive', label: 'Active' }
  ];

  const formFields: FormField<Lot>[] = React.useMemo(() => [
    {
      key: 'code',
      label: 'Lot Code',
      type: 'text',
      required: false,
      placeholder: 'Lot code will be generated',
      disabled: true,
    },
    {
      key: 'name',
      label: 'Lot Name',
      type: 'text',
      required: true,
      placeholder: 'Enter lot name',
    },
    {
      key: 'districtCode',
      label: 'District',
      type: 'select',
      required: true,
      options: districts.map(d => ({ value: d.code, label: d.name })),
      onChange: async (value) => {
        if (value) {
          const circleData = await getCirclesByDistrict(value);
          setCircles(circleData);
        } else {
          setCircles([]);
        }
      }
    },
    {
      key: 'circleCode',
      label: 'Circle',
      type: 'select',
      required: true,
      options: circles.map(c => ({ value: c.code, label: c.name })),
      dependsOn: 'districtCode',
    },
    {
      key: 'areaTypeId',
      label: 'Area Type ID',
      type: 'text',
      required: false, // As per user spec, it can be empty
      placeholder: 'Enter Area Type ID (optional)',
    }
  ], [districts, circles]);

  const lotService: CRUDService<Lot> = {
    fetchAll: async () => {
        if (!selectedDistrict || !selectedCircle) return [];
        return fetchLotsByDistrictAndCircle(selectedDistrict, selectedCircle);
    },
    create: async (item) => {
      const payload = {
        lotName: item.name,
        districtCode: item.districtCode,
        circleCode: item.circleCode,
        areaTypeId: item.areaTypeId || "",
      };
      return masterDataService.createLot(payload);
    },
    update: async (id, item) => {
      const payload = {
        lotCode: item.code,
        lotName: item.name,
        districtCode: item.districtCode,
        circleCode: item.circleCode,
        areaTypeId: item.areaTypeId || "",
      };
      return masterDataService.updateLot(id, payload);
    },
    deactivate: async (id, _reason) => {
      await masterDataService.deactivateLot(id);
      await loadFilteredLots();
    },
    requestChange: async (operation, payload, reason) => {
      return masterDataService.requestEntityChange({
        entityType: 'Lot',
        operation,
        payload,
        reason
      });
    },
    getHistory: async (id) => masterDataService.getEntityHistory('Lot', id),
    validate: async (item) => {
      const errors: string[] = [];
      if (!item.name?.trim()) errors.push('name: Lot name is required');
      if (!item.districtCode) errors.push('districtCode: District is required');
      if (!item.circleCode) errors.push('circleCode: Circle is required');
      return errors;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Lot Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-1">District</label>
              <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
                <SelectTrigger>
                  <SelectValue placeholder="Select district" />
                </SelectTrigger>
                <SelectContent>
                  {districts.map(district => (
                    <SelectItem key={district.code} value={district.code}>
                      {district.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Circle</label>
              <Select 
                value={selectedCircle} 
                onValueChange={setSelectedCircle}
                disabled={!selectedDistrict}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select circle" />
                </SelectTrigger>
                <SelectContent>
                  {circles.map(circle => (
                    <SelectItem key={circle.code} value={circle.code}>
                      {circle.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end gap-2">
              <Button 
                variant="outline" 
                onClick={clearFilters}
                className="flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Clear
              </Button>
              <Button 
                variant="outline" 
                onClick={loadFilteredLots}
                disabled={loading || !selectedCircle}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>

          <GenericDataTable
            title="Lots"
            data={lots}
            columns={columns}
            service={lotService}
            formFields={formFields}
            requiresApproval={false}
            canViewHistory={true}
          />
        </CardContent>
      </Card>
    </div>
  );
}
