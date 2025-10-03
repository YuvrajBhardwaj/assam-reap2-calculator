import React, { useState, useEffect } from 'react';
import GenericDataTable, { TableColumn, FormField, CRUDService } from './GenericDataTable';
import * as masterDataService from '@/services/masterDataService';
import { Mouza, District, Circle } from '@/types/masterData';
import { getCirclesByDistrict, getAllDistricts, getMouzasByDistrictAndCircle } from '@/services/locationService';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { MapPin, Filter, RefreshCw } from 'lucide-react';

interface MouzaCRUDProps {
  className?: string;
}

export default function MouzaCRUD({ className = "" }: MouzaCRUDProps) {
  const [mouzas, setMouzas] = useState<Mouza[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [circles, setCircles] = useState<Circle[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Filter states (store codes as values)
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [selectedCircle, setSelectedCircle] = useState<string>('');
  
  const { toast } = useToast();

  const [circleFormOptions, setCircleFormOptions] = useState<{ value: string; label: string }[]>([]);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  // Load filtered circles when district changes
  useEffect(() => {
    if (selectedDistrict) {
      loadCirclesByDistrict(selectedDistrict);
      setSelectedCircle('');
    } else {
      setCircles([]);
    }
  }, [selectedDistrict]);

  // Load filtered mouzas when filters change
  useEffect(() => {
    loadFilteredMouzas();
  }, [selectedDistrict, selectedCircle]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [mouzaData, districtData] = await Promise.all([
        getMouzasByDistrictAndCircle(),
        getAllDistricts()
      ]);
      setMouzas(mouzaData);
      setDistricts(districtData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load mouza data",
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

  const loadFilteredMouzas = async () => {
    try {
      const filteredData = await getMouzasByDistrictAndCircle(
        selectedDistrict || undefined,
        selectedCircle || undefined
      );
      setMouzas(filteredData);
    } catch (error) {
      console.error('Error loading filtered mouzas:', error);
    }
  };

  const clearFilters = () => {
    setSelectedDistrict('');
    setSelectedCircle('');
    setCircles([]);
  };

  // Table columns configuration
  const columns: TableColumn<Mouza>[] = [
    { key: 'code', label: 'Mouza Code', sortable: true, searchable: true },
    { key: 'name', label: 'Mouza Name', sortable: true, searchable: true },
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
    { key: 'areaTypeId', label: 'Area Type ID', sortable: true, searchable: true },
    { key: 'isActive', label: 'Active' }
  ];

  // Form fields for Mouza creation/editing
  const formFields: FormField<Mouza>[] = [
    {
      key: 'code',
      label: 'Mouza Code',
      type: 'text',
      required: false,
      placeholder: 'Mouza code will be generated',
      disabled: true,
    },
    {
      key: 'name',
      label: 'Mouza Name',
      type: 'text',
      required: true,
      placeholder: 'Enter mouza name',
      validation: (value: string) => {
        if (!value?.trim()) return 'Mouza name is required';
        if (value.length < 2) return 'Mouza name must be at least 2 characters';
        return null;
      }
    },
    {
      key: 'districtCode',
      label: 'District',
      type: 'select',
      required: true,
      options: districts.map(d => ({ value: d.code, label: d.name })),
      onChange: async (value: string) => {
        // Load circles for the selected district
        if (value) {
          try {
            const circleData = await getCirclesByDistrict(value);
            setCircles(circleData);
          } catch (error) {
            console.error('Error loading circles for form:', error);
            setCircles([]);
          }
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
      required: true,
      placeholder: 'Enter Area Type ID',
    }
  ];

  // CRUD service aligned with GenericDataTable
  const mouzaService: CRUDService<Mouza> = {
    fetchAll: async () => {
      const data = await getMouzasByDistrictAndCircle(
        selectedDistrict || undefined,
        selectedCircle || undefined
      );
      return data;
    },
    create: async (item) => {
      const payload = {
        mouzaName: item.name,
        districtCode: item.districtCode,
        circleCode: item.circleCode,
        areaTypeId: item.areaTypeId,
      };
      const created = await masterDataService.createMouza(payload as any);
      await loadFilteredMouzas();
      return created;
    },
    update: async (id, item) => {
      const payload = {
        mouzaCode: item.code,
        mouzaName: item.name,
        districtCode: item.districtCode,
        circleCode: item.circleCode,
        areaTypeId: item.areaTypeId,
      };
      const updated = await masterDataService.updateMouza(id, payload as any);
      await loadFilteredMouzas();
      return updated;
    },
    deactivate: async (id, _reason) => {
      await masterDataService.deactivateMouza(id);
      await loadFilteredMouzas();
    },
    requestChange: async (operation, payload, reason) => {
      return masterDataService.requestEntityChange({
        entityType: 'Mouza',
        operation,
        payload,
        reason
      });
    },
    getHistory: async (id) => masterDataService.getEntityHistory('Mouza', id),
    search: async (query) => {
      const all = await getMouzasByDistrictAndCircle();
      return all.filter(m =>
        m.name?.toLowerCase().includes(query.toLowerCase()) ||
        m.code?.toLowerCase().includes(query.toLowerCase()) ||
        m.districtCode?.toLowerCase().includes(query.toLowerCase()) ||
        m.circleCode?.toLowerCase().includes(query.toLowerCase())
      );
    },
    validate: async (item) => {
      const errors: string[] = [];
      if (!item.name?.trim()) errors.push('name: Mouza name is required');
      if (!item.districtCode) errors.push('districtCode: District is required');
      if (!item.circleCode) errors.push('circleCode: Circle is required');
      if (!item.areaTypeId) errors.push('areaTypeId: Area Type ID is required');
      return errors;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Mouza Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filters */}
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
                onClick={loadFilteredMouzas}
                disabled={loading}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>

          {/* Mouza Data Table */}
          <GenericDataTable
            title="Mouzas"
            data={mouzas}
            columns={columns}
            service={mouzaService}
            formFields={formFields}
            requiresApproval={true}
            canCreate={true}
            canEdit={true}
            canDeactivate={true}
            canViewHistory={true}
            enableSearch={true}
            enableFilters={true}
            enableExport={true}
            pageSize={15}
          />
        </CardContent>
      </Card>
    </div>
  );
}
