import React, { useState, useEffect } from 'react';
import GenericDataTable, { TableColumn, FormField, CRUDService } from './GenericDataTable';
import * as masterDataService from '@/services/masterDataService';
import { Village, District, Circle } from '@/types/masterData';
import { getCirclesByDistrict, getAllDistricts, getVillagesByDistrictAndCircleAndMouzaAndLot } from '@/services/locationService';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { MapPin, Filter, RefreshCw } from 'lucide-react';

interface VillageCRUDProps {
  className?: string;
}

export default function VillageCRUD({ className = "" }: VillageCRUDProps) {
  const [villages, setVillages] = useState<Village[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [circles, setCircles] = useState<Circle[]>([]);
  
  const [loading, setLoading] = useState(false);
  
  // Filter states (store codes as values)
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [selectedCircle, setSelectedCircle] = useState<string>('');
  const [selectedVillage, setSelectedVillage] = useState<string>('');
  
  const { toast } = useToast();

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  // Load filtered circles when district changes
  useEffect(() => {
    if (selectedDistrict) {
      loadCirclesByDistrict(selectedDistrict);
      setSelectedCircle('');
      setSelectedVillage('');
    } else {
      setCircles([]);
    }
  }, [selectedDistrict]);

  // Load filtered villages when filters change
  useEffect(() => {
    loadFilteredVillages();
  }, [selectedDistrict, selectedCircle, selectedVillage]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [villageData, districtData] = await Promise.all([
        getVillagesByDistrictAndCircleAndMouzaAndLot(),
        getAllDistricts()
      ]);
      setVillages(villageData);
      setDistricts(districtData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load village data",
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



  const loadFilteredVillages = async () => {
    try {
      const filteredData = await getVillagesByDistrictAndCircleAndMouzaAndLot(
        selectedDistrict || undefined,
        selectedCircle || undefined,
        selectedVillage || undefined
      );
      setVillages(filteredData);
    } catch (error) {
      console.error('Error loading filtered villages:', error);
    }
  };

  const clearFilters = () => {
    setSelectedDistrict('');
    setSelectedCircle('');
    setSelectedVillage('');
    setCircles([]);
  };

  // Table columns configuration
  const columns: TableColumn<Village>[] = [
    { key: 'code', label: 'Village Code', sortable: true, searchable: true },
    { key: 'name', label: 'Village Name', sortable: true, searchable: true },
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
    
    { 
      key: 'isUrban', 
      label: 'Area Type',
      render: (value: boolean) => (
        <Badge variant={value ? "default" : "secondary"}>
          {value ? "Urban" : "Rural"}
        </Badge>
      )
    },

  ];

  // Form fields for Village creation/editing - using dynamic options
  const getFormFields = (): FormField<Village>[] => [
    {
      key: 'code',
      label: 'Village Code',
      type: 'text',
      required: false, // Not required for user input
      placeholder: 'Village code will be generated', // Placeholder text
      disabled: true, // Disabled for both add and edit
    },
    {
      key: 'name',
      label: 'Village Name',
      type: 'text',
      required: true,
      placeholder: 'Enter village name',
      validation: (value: string) => {
        if (!value?.trim()) return 'Village name is required';
        if (value.length < 2) return 'Village name must be at least 2 characters';
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
      onChange: async (value: string, formData: any) => {
        // Load mouzas for the selected district and circle
        if (value && formData?.districtCode) {
          try {
            const villageData = await getVillagesByDistrictAndCircleAndMouzaAndLot(formData.districtCode, value);
            setVillages(villageData);
          } catch (error) {
            console.error('Error loading villages for form:', error);
          }
        } else {
          setVillages([]);
          console.log('No villages found for the selected circle.');
        }
      }
    },

  ];

  // CRUD service aligned with GenericDataTable
  const villageService: CRUDService<Village> = {
    fetchAll: async () => {
      const data = await getVillagesByDistrictAndCircleAndMouzaAndLot(
        selectedDistrict || undefined,
        selectedCircle || undefined,
        selectedVillage || undefined
      );
      return data;
    },
    create: async (item) => {
      const payload = {
        villageName: item.name,
        districtCode: item.districtCode,
        circleCode: item.circleCode,
      };
      console.log('Creating Village with payload:', payload);
      const created = await masterDataService.createVillage(payload as any);
      await loadFilteredVillages();
      return created;
    },
    update: async (id, item) => {
      const payload = {
        villageCode: id,
        villageName: item.name,
        districtCode: item.districtCode,
        circleCode: item.circleCode,
      };
      console.log('Updating Village with payload:', payload);
      const updated = await masterDataService.updateVillage(id, payload as any);
      await loadFilteredVillages();
      return updated;
    },
    deactivate: async (id, _reason) => {
      await masterDataService.deactivateVillage(id);
      await loadFilteredVillages();
    },
    // requestChange: async (operation, payload, reason) => {
    //   return masterDataService.requestEntityChange({
    //     entityType: 'Village',
    //     operation,
    //     payload,
    //     reason
    //   });
    // },
    // getHistory: async (id) => masterDataService.getEntityHistory('Village', id),
    search: async (query) => {
      const all = await getVillagesByDistrictAndCircleAndMouzaAndLot();
      return all.filter(v =>
        v.name?.toLowerCase().includes(query.toLowerCase()) ||
        v.code?.toLowerCase().includes(query.toLowerCase()) ||
        v.districtCode?.toLowerCase().includes(query.toLowerCase()) ||
        v.circleCode?.toLowerCase().includes(query.toLowerCase()) ||
        v.mouzaCode?.toLowerCase().includes(query.toLowerCase())
      );
    },
    validate: async (item) => {
      const errors: string[] = [];
      if (!item.name?.trim()) errors.push('name: Village name is required');
      if (!item.districtCode) errors.push('districtCode: District is required');
      if (!item.circleCode) errors.push('circleCode: Circle is required');
      return errors;
    }
  };

  // Statistics
  const stats = {
    total: villages.length,
    urban: villages.filter(v => v.isUrban).length,
    rural: villages.filter(v => !v.isUrban).length,
    active: villages.filter(v => v.isActive).length
  };

  // Optional custom actions for each row
  const customActions = [
    {
      label: 'View Details',
      onClick: (item: Village) => {
        toast({ title: 'Village', description: `${item.name} (${item.code})` });
      }
    }
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Village Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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

            <div>
              <label className="block text-sm font-medium mb-1">Village</label>
              <Select 
                value={selectedVillage} 
                onValueChange={setSelectedVillage}
                disabled={!selectedCircle}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select village" />
                </SelectTrigger>
                <SelectContent>
                  {villages.map(village => (
                    <SelectItem key={village.code} value={village.code}>
                      {village.name}
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
                onClick={loadFilteredVillages}
                disabled={loading}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                <div className="text-sm text-gray-600">Total Villages</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{stats.active}</div>
                <div className="text-sm text-gray-600">Active Villages</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.urban}</div>
                <div className="text-sm text-gray-600">Urban Villages</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">{stats.rural}</div>
                <div className="text-sm text-gray-600">Rural Villages</div>
              </CardContent>
            </Card>
          </div>

          {/* Village Data Table */}
          <GenericDataTable
            title="Villages"
            data={villages}
            columns={columns}
            service={villageService}
            formFields={getFormFields()}
            requiresApproval={false}
            canCreate={true}
            canEdit={true}
            canDeactivate={true}
            canViewHistory={true}
            enableSearch={true}
            enableFilters={true}
            enableExport={true}
            customActions={customActions}
            pageSize={15}
          />
        </CardContent>
      </Card>
    </div>
  );
}