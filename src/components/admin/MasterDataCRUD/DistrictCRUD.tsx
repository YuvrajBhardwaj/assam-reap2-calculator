import React, { useState, useEffect } from 'react';
import GenericDataTable, { TableColumn, FormField, CRUDService } from './GenericDataTable';
import { District } from '@/types/masterData';
import { getAllDistricts } from '@/services/locationService';
import * as masterDataService from '@/services/masterDataService';
import { useToast } from "@/components/ui/use-toast";

// Helper to map API data to the District entity
const mapApiDataToDistrict = (data: any): District => {
  // Some APIs may nest the district object within a field
  const nested = data?.district || data?.districtVO || data?.districtMaster || {};
  const src = (typeof nested === 'object' && Object.keys(nested).length > 0) ? nested : data;

  // Normalize possible key variants
  const rawId = src.id ?? src.districtGenId ?? src.districtCode ?? data?.id ?? data?.districtGenId ?? data?.districtCode;
  const rawName = src.name ?? src.districtName ?? src.distName ?? src.d_name ?? src["district_name"] ?? src["DISTRICT_NAME"];
  const rawCode = src.code ?? src.districtCode ?? src.distCode ?? src.d_code ?? src["district_code"] ?? src["DISTRICT_CODE"] ?? rawId;
  const rawActive = src.isActive ?? src.active ?? data?.active ?? data?.isActive;

  return {
    id: (rawId ?? '').toString(),
    name: (rawName ?? '').toString(),
    code: (rawCode ?? '').toString(),
    isActive: rawActive !== undefined ? !!rawActive : true,
    districtGenId: Number(src.districtGenId ?? data?.districtGenId ?? rawId ?? 0) || 0,
    createdBy: data?.createdBy ?? src?.createdBy ?? '',
    createdDtm: data?.createdDtm ?? src?.createdDtm ?? data?.createdAt ?? src?.createdAt ?? '',
    updatedBy: data?.updatedBy ?? src?.updatedBy ?? '',
    updatedDtm: data?.updatedDtm ?? src?.updatedDtm ?? data?.updatedAt ?? src?.updatedAt ?? '',
  } as District;
};

// Helper to map District entity to API data before sending
const mapDistrictToApiData = (item: Partial<District>): any => {
  const { name } = item;
  return { districtName: name };
};



// District-specific service implementation
const districtService: CRUDService<District> = {
  fetchAll: async () => {
    const data = await getAllDistricts();
    return data;
  },
  create: async (item: Partial<District>) => {
    const data = await masterDataService.createDistrict(mapDistrictToApiData(item));
    // Map API response to normalized District using existing helper to be safe
    // If response is already normalized, this will keep fields intact
    const normalizedList = await getAllDistricts();
    // Try to find by name; fallback to mapping the response if not found
    const byName = normalizedList.find(d => d.name?.toLowerCase() === (item.name ?? '').toLowerCase());
    return byName ?? (data as any);
  },
  update: async (id: string, updates: Partial<District>) => {
    const data = await masterDataService.updateDistrict(updates.code , updates.name as string);
    // After update, prefer returning the freshly fetched normalized item
    const normalizedList = await getAllDistricts();
    const byId = normalizedList.find(d => d.id === id || d.code === updates.code);
    return byId ?? (data as any);
  },
  deactivate: async (id: string) => {
    const allDistricts = await getAllDistricts();
    const districtToDeactivate = allDistricts.find(district => district.id === id);
    if (districtToDeactivate) {
      await masterDataService.deactivateDistrict(districtToDeactivate.code);
    } else {
      throw new Error(`District with id ${id} not found for deactivation.`);
    }
  },
  reactivate: async (id: string) => {
    const allDistricts = await getAllDistricts();
    const districtToReactivate = allDistricts.find(district => district.id === id);
    if (districtToReactivate) {
      await masterDataService.reactivateDistrict(districtToReactivate.code);
    } else {
      throw new Error(`District with id ${id} not found for reactivation.`);
    }
  },
  // requestChange: async (operation, payload, reason) => {
  //   return masterDataService.requestEntityChange({
  //     entityType: 'District',
  //     operation,
  //     payload: mapDistrictToApiData(payload),
  //     reason
  //   });
  // },
  getHistory: masterDataService.getDistrictHistory,
  search: async (query, _filters) => {
    const allDistricts = await getAllDistricts();
    return allDistricts.filter(district =>
      district.name.toLowerCase().includes(query.toLowerCase())
    );
  },
  validate: async (item) => {
    const errors: string[] = [];
    
    if (!item.name?.trim()) {
      errors.push('name: District name is required');
    }
    
    // Check for duplicate names (excluding current item during edit)
    try {
      const existingDistricts = await getAllDistricts();
      const duplicateName = existingDistricts.find(d => 
        d.name.toLowerCase() === item.name?.toLowerCase() && d.id !== item.id
      );
      
      if (duplicateName) {
        errors.push('name: District name already exists');
      }
    } catch (error) {
      // Handle validation error gracefully
    }
    
    return errors;
  },
  bulkDeactivate: async (ids: string[], reason: string) => {
    const allDistricts = await getAllDistricts();
    const districtCodesToDeactivate = allDistricts
      .filter(district => ids.includes(district.id))
      .map(district => district.code);
    await masterDataService.bulkDeactivateDistricts(districtCodesToDeactivate, reason);
  }
};

// Table columns configuration
const columns: TableColumn<District>[] = [
  {
    key: 'name',
    label: 'District Name',
    sortable: true,
    searchable: true
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
const formFields: FormField<District>[] = [
  {
    key: 'name',
    label: 'District Name',
    type: 'text',
    required: true,
    placeholder: 'Enter district name',
    validation: (value: string) => {
      if (!value?.trim()) return 'District name is required';
      if (value.length < 2) return 'Name must be at least 2 characters';
      return null;
    }
  }
];

interface DistrictCRUDProps {
  requiresApproval?: boolean;
  onDistrictSelect?: (district: District) => void;
}

export default function DistrictCRUD({ 
  requiresApproval = false,
  onDistrictSelect 
}: DistrictCRUDProps) {
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Load districts on component mount
  useEffect(() => {
    loadDistricts();
  }, []);

  const loadDistricts = async () => {
    try {
      setLoading(true);
      const data = await getAllDistricts();
      setDistricts((data as any[]).map(mapApiDataToDistrict));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load districts.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Custom actions for districts
  const customActions = [
  ];

  return (
    <GenericDataTable
      title="District"
      data={districts}
      columns={columns}
      service={districtService}
      formFields={formFields}
      requiresApproval={requiresApproval}
      canCreate={true}
      canEdit={true}
      canDeactivate={true}
      canViewHistory={true}
      enableSearch={true}
      enableFilters={true}
      enableExport={true}
      onItemSelect={onDistrictSelect}
      getItemName={(item: District) => item.name}
      customActions={customActions}
      pageSize={15}
      loading={loading}
    />
  );
}