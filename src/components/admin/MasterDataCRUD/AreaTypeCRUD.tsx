import React, { useState, useEffect } from 'react';
import GenericDataTable, { TableColumn, FormField, CRUDService } from './GenericDataTable';
import * as masterDataService from '@/services/masterDataService';
import { useToast } from "@/components/ui/use-toast";
import { BaseEntity } from '@/types/masterData';

// Define a type for AreaType, extending BaseEntity for compatibility with GenericDataTable
interface AreaType extends BaseEntity {
  areaType: string;
  areaTypesGenId: string;
}

export default function AreaTypeCRUD() {
  const [areaTypes, setAreaTypes] = useState<AreaType[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadAreaTypes();
  }, []);

  const loadAreaTypes = async () => {
    try {
      setLoading(true);
      const data = await masterDataService.fetchAreaTypes();
      // We need to map the data to our AreaType interface
      const mappedData = data.map(item => ({
        id: item.areaTypesGenId.toString(),
        name: item.areaType,
        code: item.areaTypesGenId.toString(), // Use id as code for simplicity
        isActive: true, // Assuming all fetched types are active
        areaType: item.areaType,
        areaTypesGenId: item.areaTypesGenId.toString(),
      }));
      setAreaTypes(mappedData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load area types.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const areaTypeService: CRUDService<AreaType> = {
    fetchAll: async () => {
      const data = await masterDataService.fetchAreaTypes();
      return data.map(item => ({
        id: item.areaTypesGenId.toString(),
        name: item.areaType,
        code: item.areaTypesGenId.toString(),
        isActive: true,
        areaType: item.areaType,
        areaTypesGenId: item.areaTypesGenId.toString(),
      }));
    },
    create: async (item) => {
      await masterDataService.createAreaType({ areaType: item.name });
      // The create service doesn't return the created item, so we have to reload.
      await loadAreaTypes();
      // We can't return the created item directly, so we return the submitted item.
      // This is a limitation of the current setup.
      return { ...item, id: '', code: '', isActive: true, areaType: item.name, areaTypesGenId: '' };
    },
    deactivate: async (id) => {
      await masterDataService.deleteAreaType(id);
      await loadAreaTypes();
    },
    update: function (id: string, item: Partial<AreaType>): Promise<AreaType> {
      throw new Error('Function not implemented.');
    }
  };

  const columns: TableColumn<AreaType>[] = [
    { key: 'name', label: 'Area Type Name', sortable: true, searchable: true },
  ];

  const formFields: FormField<AreaType>[] = [
    {
      key: 'name',
      label: 'Area Type Name',
      type: 'text',
      required: true,
      placeholder: 'Enter area type name',
      validation: (value: string) => {
        if (!value?.trim()) return 'Area type name is required';
        return null;
      }
    }
  ];

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <GenericDataTable
      title="Area Type Management"
      data={areaTypes}
      columns={columns}
      service={areaTypeService}
      formFields={formFields}
      canEdit={false} // No update endpoint specified
    />
  );
}
