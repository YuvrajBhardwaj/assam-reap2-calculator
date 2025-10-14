import React, { useEffect, useState } from 'react';
import GenericDataTable, { TableColumn, FormField, CRUDService } from './GenericDataTable';
import { LandSubClass, LandClass } from '@/types/masterData';
import { getAllLandCategories } from '@/services/locationService';
import * as masterDataService from '@/services/masterDataService';
import { useToast } from '@/components/ui/use-toast';

// Land Sub-Class specific service implementation
const landSubClassService: CRUDService<LandSubClass> = {
  fetchAll: masterDataService.fetchLandSubClasses,
  create: masterDataService.createLandSubClass,
  update: masterDataService.updateLandSubClass,
  deactivate: masterDataService.deactivateLandSubClass,
  requestChange: async (operation, payload, reason) => {
    return masterDataService.requestEntityChange({
      entityType: 'LandSubClass',
      operation,
      payload,
      reason
    });
  },
  getHistory: async (id: string) => masterDataService.getHistory('LandSubClass', id),
  search: async (query, filters) => {
    const all = await masterDataService.fetchLandSubClasses(filters?.parentClassCode);
    return all.filter(item =>
      item.name.toLowerCase().includes(query.toLowerCase()) ||
      item.code.toLowerCase().includes(query.toLowerCase()) ||
      item.parentClassCode?.toLowerCase().includes(query.toLowerCase())
    );
  },
  validate: async (item) => {
    const errors: string[] = [];
    if (!item.name?.trim()) errors.push('name: Sub-class name is required');
    if (!item.code?.trim()) {
      errors.push('code: Sub-class code is required');
    } else if ((item.code as string).length < 1 || (item.code as string).length > 15) {
      errors.push('code: Code must be between 1 and 15 characters');
    }
    if (!item.parentClassCode?.trim()) errors.push('parentClassCode: Parent class is required');

    try {
      const existing = await masterDataService.fetchLandSubClasses();
      const duplicate = existing.find(sc => sc.code.toLowerCase() === (item.code as string)?.toLowerCase() && sc.id !== item.id);
      if (duplicate) errors.push('code: Sub-class code already exists');
    } catch (e) {
      errors.push('validation: Unable to validate uniqueness');
    }

    return errors;
  },
  bulkDeactivate: async (ids, reason) => {
    return masterDataService.bulkDeactivateLandSubClasses(ids, reason);
  }
};

// Table columns configuration
const columns: TableColumn<LandSubClass>[] = [
  { key: 'code', label: 'Sub-Class Code', sortable: true, searchable: true },
  { key: 'name', label: 'Sub-Class Name', sortable: true, searchable: true },
  { key: 'parentClassCode', label: 'Parent Class', sortable: true, searchable: true },
  {
    key: 'isActive',
    label: 'Status',
    render: (value: boolean) => (
      <span className={`px-2 py-1 rounded-full text-xs ${value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{value ? 'Active' : 'Inactive'}</span>
    )
  },
  { key: 'createdAt', label: 'Created Date', render: (v: string) => (v ? new Date(v).toLocaleDateString() : '-'), sortable: true },
  { key: 'updatedAt', label: 'Updated Date', render: (v: string) => (v ? new Date(v).toLocaleDateString() : '-'), sortable: true }
];

interface LandSubClassCRUDProps {
  requiresApproval?: boolean;
}

export default function LandSubClassCRUD({ requiresApproval = false }: LandSubClassCRUDProps) {
  const [data, setData] = useState<LandSubClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [landClasses, setLandClasses] = useState<LandClass[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [subClasses, classes] = await Promise.all([
        masterDataService.fetchLandSubClasses(),
        getAllLandCategories()
      ]);
      setData(subClasses);
      setLandClasses(classes);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to load land sub-classes', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const formFields: FormField<LandSubClass>[] = [
    {
      key: 'code',
      label: 'Sub-Class Code',
      type: 'text',
      required: true,
      placeholder: 'Enter sub-class code (e.g., A1, R2)',
      validation: (value: string) => (!value || value.length < 1 || value.length > 15) ? 'Code must be between 1 and 15 characters' : null
    },
    {
      key: 'name',
      label: 'Sub-Class Name',
      type: 'text',
      required: true,
      placeholder: 'Enter sub-class name',
      validation: (value: string) => (!value || value.length < 2) ? 'Name must be at least 2 characters' : null
    },
    {
      key: 'parentClassCode',
      label: 'Parent Class',
      type: 'select',
      required: true,
      options: landClasses.map(lc => ({ value: lc.code, label: `${lc.code} - ${lc.name}` }))
    }
  ];

  return (
    <GenericDataTable
      title="Land Sub-Class Management"
      data={data}
      columns={columns}
      service={landSubClassService}
      formFields={formFields}
      requiresApproval={requiresApproval}
      canCreate={true}
      canEdit={true}
      canDeactivate={true}
      canViewHistory={true}
      enableSearch={true}
      enableFilters={true}
      enableExport={true}
      loading={loading}
      customActions={[
        {
          label: 'Reassign Parent Class',
          onClick: async (subClass) => {
            try {
              const newParent = window.prompt('Enter new parent class code:');
              if (!newParent) return;
              const exists = landClasses.find(lc => lc.code.toLowerCase() === newParent.toLowerCase());
              if (!exists) {
                toast({ title: 'Invalid parent class', description: 'Please enter a valid land class code', variant: 'destructive' });
                return;
              }
              await masterDataService.reassignSubClass(subClass.id as string, newParent);
              toast({ title: 'Reassigned', description: `Sub-class ${subClass.code} reassigned to ${newParent}` });
              await loadData();
            } catch (e) {
              toast({ title: 'Error', description: 'Failed to reassign sub-class', variant: 'destructive' });
            }
          },
          variant: 'secondary'
        }
      ]}
    />
  );
}