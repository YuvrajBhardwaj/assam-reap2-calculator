import React, { useState, useEffect } from 'react';
import GenericDataTable, { TableColumn, FormField, CRUDService } from './GenericDataTable';
import { Circle, District } from '@/types/masterData';
import * as locationService from '@/services/locationService';
import * as masterDataService from '@/services/masterDataService';
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Filter, RefreshCw, MapPin } from 'lucide-react';

const mapApiDataToDistrict = (data: any): District => ({
  ...data,
  id: data.districtGenId,
  name: data.districtName,
  code: data.districtCode,
  isActive: data.active,
});

interface CircleCRUDProps {
  requiresApproval?: boolean;
  selectedDistrictCode?: string;
  onCircleSelect?: (circle: Circle) => void;
}

export default function CircleCRUD({ 
  requiresApproval = false,
  selectedDistrictCode,
  onCircleSelect 
}: CircleCRUDProps) {
  const [circles, setCircles] = useState<Circle[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [currentDistrictCode, setCurrentDistrictCode] = useState<string>(selectedDistrictCode || '');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Circle-specific service implementation
  const circleService: CRUDService<Circle> = {
    fetchAll: async () => {
      if (!currentDistrictCode) return [];
      return locationService.getCirclesByDistrict(currentDistrictCode);
    },
    create: async (item) => {
      return masterDataService.createCircle({
        ...item,
        name: item.name, // Ensure name is passed
        districtCode: currentDistrictCode,
      });
    },
    update: async (id, item) => {
        return masterDataService.updateCircle(item.code, {
            name: item.name,
            districtCode: currentDistrictCode,
        });
    },
    deactivate: masterDataService.deactivateCircle,
    reactivate: masterDataService.reactivateCircle,
    // requestChange: async (operation, payload, reason) => {
    //   return masterDataService.submitChangeRequest({
    //     entityType: 'Circle',
    //     operation,
    //     payload: { ...payload, districtCode: currentDistrictCode },
    //     reason
    //   });
    // },
    getHistory: masterDataService.getCircleHistory,
    search: async (query, filters) => {
      if (!currentDistrictCode) return [];
      const allCircles = await locationService.getCirclesByDistrict(currentDistrictCode);
      return allCircles.filter(circle =>
        circle.name.toLowerCase().includes(query.toLowerCase()) ||
        circle.code.toLowerCase().includes(query.toLowerCase())
      );
    },
    validate: async (item) => {
      const errors: string[] = [];
      
      if (!item.name?.trim()) {
        errors.push('name: Circle name is required');
      }
      
      if (!currentDistrictCode) {
        errors.push('districtCode: Please select a district first');
      }
      
      return errors;
    },
    // bulkDeactivate: async (ids, reason) => {
    //   await masterDataService.bulkDeactivateCircles(ids, reason);
    // }
  };

  // Table columns configuration
  const columns: TableColumn<Circle>[] = [
    {
      key: 'code',
      label: 'Circle Code',
      sortable: true,
      searchable: true
    },
    {
      key: 'name',
      label: 'Circle Name',
      sortable: true,
      searchable: true
    },
    {
      key: 'districtCode',
      label: 'District',
      render: (districtCode: string) => {
        const district = districts.find(d => d.code === districtCode);
        return district ? `${district.name} (${districtCode})` : districtCode;
      }
    },
    {
      key: 'createdBy',
      label: 'Created By',
      sortable: true
    },
    {
      key: 'createdDtm',
      label: 'Created Date',
      render: (value: string) => value ? new Date(value).toLocaleDateString() : '-',
      sortable: true
    },
    {
      key: 'updatedBy',
      label: 'Updated By',
      sortable: true
    },
    {
      key: 'updatedDtm',
      label: 'Last Updated',
      render: (value: string) => value ? new Date(value).toLocaleDateString() : '-',
      sortable: true
    }
  ];

  // Form fields configuration
  const formFields: FormField<Circle>[] = [
    {
      key: 'code',
      label: 'Circle Code',
      type: 'text',
      required: false,
      placeholder: 'Circle code',
      disabled: true,
      editOnly: true,
    },
    {
      key: 'name',
      label: 'Circle Name',
      type: 'text',
      required: true,
      placeholder: 'Enter circle name',
      validation: (value: string) => {
        if (!value?.trim()) return 'Circle name is required';
        if (value.length < 2) return 'Name must be at least 2 characters';
        return null;
      }
    }
  ];

  useEffect(() => {
    loadDistricts();
  }, []);

  useEffect(() => {
    if (currentDistrictCode) {
      loadCircles();
    } else {
      setCircles([]);
    }
  }, [currentDistrictCode]);

  useEffect(() => {
    if (selectedDistrictCode && selectedDistrictCode !== currentDistrictCode) {
      setCurrentDistrictCode(selectedDistrictCode);
    }
  }, [selectedDistrictCode]);

  const loadDistricts = async () => {
    try {
      const data = await locationService.getAllDistricts();
      setDistricts(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load districts.",
        variant: "destructive"
      });
    }
  };

  const loadCircles = async () => {
    if (!currentDistrictCode) return;
    
    try {
      setLoading(true);
      const data = await locationService.getCirclesByDistrict(currentDistrictCode);
      setCircles(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load circles.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleClearFilters = () => {
    setCurrentDistrictCode('');
  };

  // Custom actions for circles
  const customActions = [
    // {
    //   label: 'View Mouzas',
    //   onClick: (circle: Circle) => {
    //     console.log('View mouzas for circle:', circle.code);
    //   }
    // },
    // {
    //   label: 'View Lots',
    //   onClick: (circle: Circle) => {
    //     console.log('View lots for circle:', circle.code);
    //   }
    // }
  ];

  return (
    <div className="space-y-6">
      {/* District Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Circle Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="district-select">Select District</Label>
              <Select
                value={currentDistrictCode}
                onValueChange={setCurrentDistrictCode}
              >
                <SelectTrigger id="district-select">
                  <SelectValue placeholder="Select a district to manage its circles" />
                </SelectTrigger>
                <SelectContent>
                  {districts.map(district => (
                    <SelectItem key={district.code} value={district.code}>
                      {district.name} ({district.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end gap-2">
              <Button
                variant="outline"
                onClick={handleClearFilters}
                className="w-full flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Clear
              </Button>
              <Button
                variant="outline"
                onClick={loadCircles}
                disabled={loading || !currentDistrictCode}
                className="w-full flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Circles Table */}
      {currentDistrictCode ? (
        <GenericDataTable
          title={`Circles in ${districts.find(d => d.code === currentDistrictCode)?.name || currentDistrictCode}`}
          data={circles}
          columns={columns}
          service={circleService}
          formFields={formFields}
          requiresApproval={requiresApproval}
          canCreate={true}
          canEdit={true}
          canDeactivate={true}
          canViewHistory={true}
          enableSearch={true}
          enableFilters={true}
          enableExport={true}
          onItemSelect={onCircleSelect}
          customActions={customActions}
          pageSize={15}
          loading={loading}
        />
      ) : (
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center text-gray-500">
              <p className="text-lg">Please select a district to view and manage circles</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
