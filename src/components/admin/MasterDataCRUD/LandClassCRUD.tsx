import React, { useState, useEffect } from 'react';
import GenericDataTable, { TableColumn, FormField, CRUDService } from './GenericDataTable';
import { LandClass } from '@/types/masterData';
import { getAllLandCategories } from '@/services/locationService';
import * as masterDataService from '@/services/masterDataService';
import { useToast } from "@/components/ui/use-toast";

// Land Class specific service implementation
const landClassService: CRUDService<LandClass> = {
  fetchAll: getAllLandCategories,
  create: masterDataService.createLandClass,
  update: masterDataService.updateLandClass,
  deactivate: masterDataService.deactivateLandClass,
  reactivate: masterDataService.reactivateLandClass,
  requestChange: async (operation, payload, reason) => {
    return masterDataService.requestEntityChange({
      entityType: 'LandClass',
      operation,
      payload,
      reason
    });
  },
  getHistory: masterDataService.getLandClassHistory,
  search: async (query, filters) => {
    const allLandClasses = await getAllLandCategories();
    return allLandClasses.filter(landClass =>
      landClass.landCategoryName.toLowerCase().includes(query.toLowerCase())
    );
  },
  validate: async (item) => {
    const errors: string[] = [];
    
    if (!item.name?.trim()) {
      errors.push('name: Land class name is required');
    }
    
    if (!item.code?.trim()) {
      errors.push('code: Land class code is required');
    } else if (item.code.length < 1 || item.code.length > 10) {
      errors.push('code: Land class code must be between 1 and 10 characters');
    }
      

    
    // Check for duplicate codes (excluding current item during edit)
    try {
      const existingLandClasses = await getAllLandCategories();
      const duplicateCode = existingLandClasses.find(lc => 
        lc.code.toLowerCase() === item.code?.toLowerCase() && lc.id !== item.id
      );
      
      if (duplicateCode) {
        errors.push('code: Land class code already exists');
      }
    } catch (error) {
      errors.push('validation: Unable to validate uniqueness');
    }
    
    return errors;
  },
  bulkDeactivate: async (ids, reason) => {
    return masterDataService.bulkDeactivateLandClasses(ids, reason);
  }
};

// Table columns configuration
const columns: TableColumn<LandClass>[] = [
  {
    key: 'landCategoryGenId',
    label: 'Gen ID',
    sortable: true,
    searchable: true
  },
  {
    key: 'landCategoryName',
    label: 'Class Name',
    sortable: true,
    searchable: true
  },


  {
    key: 'createdDtm',
    label: 'Created Date',
    render: (value: string) => value ? new Date(value).toLocaleDateString() : '-',
    sortable: true
  },
  {
    key: 'createdBy',
    label: 'Created By',
    sortable: true
  },
  {
    key: 'updatedDtm',
    label: 'Updated Date',
    render: (value: string) => value ? new Date(value).toLocaleDateString() : '-',
    sortable: true
  },
  {
    key: 'updatedBy',
    label: 'Updated By',
    sortable: true
  }
];

// Form fields configuration
const formFields: FormField<LandClass>[] = [
  {
    key: 'landCategoryGenId',
    label: 'Land Category Gen ID',
    type: 'number',
    required: true,
    placeholder: 'Enter Land Category Gen ID',
    validation: (value: number) => {
      if (!value) {
        return 'Land Category Gen ID is required';
      }
      return null;
    }
  },
  {
    key: 'landCategoryName',
    label: 'Land Class Name',
    type: 'text',
    required: true,
    placeholder: 'Enter class name',
    validation: (value: string) => {
      if (!value || value.length < 2) {
        return 'Name must be at least 2 characters';
      }
      return null;
    }
  },

];

interface LandClassCRUDProps {
  requiresApproval?: boolean;
  onLandClassSelect?: (landClass: LandClass) => void;
}

export default function LandClassCRUD({ 
  requiresApproval = false,
  onLandClassSelect 
}: LandClassCRUDProps) {
  const [data, setData] = useState<LandClass[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const landClasses = await getAllLandCategories();
      setData(landClasses);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load land classes",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <GenericDataTable
      title="Land Class Management"
      data={data}
      columns={columns}
      service={landClassService}
      formFields={formFields}
      requiresApproval={requiresApproval}
      onItemSelect={onLandClassSelect}
      canCreate={true}
      canEdit={true}
      canDeactivate={true}
      canViewHistory={true}
      enableSearch={true}
      enableFilters={true}
      enableExport={true}
      loading={loading}
      customActions={[
        // {
        //   label: 'View Sub-Classes',
        //   onClick: (landClass) => {
        //     // Navigate to sub-class management for this land class
        //     console.log('View sub-classes for:', landClass.name);
        //   },
        //   variant: 'secondary'
        // }
      ]}
    />
  );
}