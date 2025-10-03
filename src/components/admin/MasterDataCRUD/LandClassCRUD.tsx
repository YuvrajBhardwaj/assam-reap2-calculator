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
      landClass.name.toLowerCase().includes(query.toLowerCase()) ||
      landClass.code.toLowerCase().includes(query.toLowerCase()) ||
      landClass.category?.toLowerCase().includes(query.toLowerCase())
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
    
    if (!item.category?.trim()) {
      errors.push('category: Category is required');
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
    key: 'code',
    label: 'Class Code',
    sortable: true,
    searchable: true
  },
  {
    key: 'name',
    label: 'Class Name',
    sortable: true,
    searchable: true
  },
  {
    key: 'category',
    label: 'Category',
    sortable: true,
    searchable: true
  },
  {
    key: 'description',
    label: 'Description',
    render: (value: string) => value ? (value.length > 50 ? `${value.substring(0, 50)}...` : value) : '-'
  },
  {
    key: 'baseRate',
    label: 'Base Rate (₹/sq ft)',
    render: (value: number) => value ? `₹${value.toLocaleString()}` : '-',
    sortable: true
  },
  {
    key: 'isActive',
    label: 'Status',
    render: (value: boolean) => (
      <span className={`px-2 py-1 rounded-full text-xs ${
        value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}>
        {value ? 'Active' : 'Inactive'}
      </span>
    )
  },
  {
    key: 'createdAt',
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
    key: 'updatedAt',
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
    key: 'code',
    label: 'Land Class Code',
    type: 'text',
    required: true,
    placeholder: 'Enter class code (e.g., A, B, C1)',
    validation: (value: string) => {
      if (!value || value.length < 1 || value.length > 10) {
        return 'Code must be between 1 and 10 characters';
      }
      return null;
    }
  },
  {
    key: 'name',
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
  {
    key: 'category',
    label: 'Category',
    type: 'select',
    required: true,
    options: [
      { value: 'Agricultural', label: 'Agricultural' },
      { value: 'Residential', label: 'Residential' },
      { value: 'Commercial', label: 'Commercial' },
      { value: 'Industrial', label: 'Industrial' },
      { value: 'Institutional', label: 'Institutional' },
      { value: 'Government', label: 'Government' },
      { value: 'Forest', label: 'Forest' },
      { value: 'Water Body', label: 'Water Body' },
      { value: 'Waste Land', label: 'Waste Land' },
      { value: 'Other', label: 'Other' }
    ]
  },
  {
    key: 'description',
    label: 'Description',
    type: 'textarea',
    placeholder: 'Enter detailed description of the land class'
  },
  {
    key: 'baseRate',
    label: 'Base Rate (₹/sq ft)',
    type: 'number',
    placeholder: 'Enter base rate per square foot',
    validation: (value: number) => {
      if (value && value < 0) {
        return 'Base rate must be positive';
      }
      return null;
    }
  }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

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