import React, { useState, useEffect } from 'react';
import GenericDataTable, { TableColumn, CRUDService, FormField } from './GenericDataTable';
import { SRO, District, AuditLog } from '@/types/masterData';
import * as masterDataService from '@/services/masterDataService';
import * as locationService from '@/services/locationService'

const SROCascadingCRUD: React.FC = () => {
  const [districts, setDistricts] = useState<District[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [sroData, setSroData] = useState<SRO[]>([]);

  // Fetch districts on mount
  useEffect(() => {
    loadDistricts();
  }, []);

  // Fetch SROs when selectedDistrict changes
  useEffect(() => {
    loadSROs();
  }, [selectedDistrict]);

  const loadDistricts = async () => {
    try {
      const districtData = await locationService.getAllDistricts();
      setDistricts(districtData.filter(d => d.isActive));
    } catch (error) {
      console.error('Failed to load districts:', error);
    }
  };

  const loadSROs = async () => {
    try {
      const sroData = await masterDataService.fetchSROs(selectedDistrict || undefined);
      setSroData(sroData);
    } catch (error) {
      console.error('Failed to fetch SROs:', error);
    }
  };

  // Define formFields to match FormField<SRO> interface
  const formFields: FormField<SRO>[] = [
    {
      key: 'name',
      label: 'SRO Name',
      type: 'text',
      required: true,
      placeholder: 'Enter SRO name'
    },
    {
      key: 'code',
      label: 'SRO Code',
      type: 'text',
      required: true,
      placeholder: 'Enter SRO code'
    },
    {
      key: 'districtCode',
      label: 'District',
      type: 'select',
      required: true,
      options: districts.map(d => ({ value: d.code, label: d.name })),
      placeholder: 'Select District'
    }
  ];

  // Define columns for the table
  const columns: TableColumn<SRO>[] = [
    {
      key: 'name',
      label: 'SRO Name',
      searchable: true
    },
    {
      key: 'code',
      label: 'SRO Code',
      searchable: true
    },
    {
      key: 'districtCode',
      label: 'District Code',
      searchable: true
    }
  ];

  // Define service object to match CRUDService<SRO> interface
  const sroService: CRUDService<SRO> = {
    fetchAll: async () => {
      return await masterDataService.fetchSROs(selectedDistrict || undefined);
    },
    create: async (sro: Omit<SRO, 'id'>) => {
      const result = await masterDataService.createSRO(sro);
      // Update local state to reflect the new SRO
      setSroData(prev => [...prev, result]);
      return result;
    },
    update: async (id: string, updates: Partial<SRO>) => {
      const result = await masterDataService.updateSRO(id, updates);
      // Update local state to reflect the updated SRO
      setSroData(prev => prev.map(item => (item.id === id ? result : item)));
      return result;
    },
    deactivate: async (id: string) => {
      await masterDataService.deactivateSRO(id);
      // Update local state to reflect deactivation
      setSroData(prev => prev.map(item => (item.id === id ? { ...item, isActive: false } : item)));
    },
    // requestChange: async (operation: 'CREATE' | 'UPDATE' | 'DEACTIVATE', payload: any, reason: string) => {
    //   return await masterDataService.submitChangeRequest({
    //     entityType: 'SRO',
    //     entityId: operation !== 'CREATE' ? payload.id : undefined,
    //     operation,
    //     payload,
    //     reason
    //   });
    // },
    // getHistory: async (id: string) => {
    //   return await masterDataService.getEntityHistory('SRO', id);
    // },
    search: async (query, filters) => {
      const allSROs = await masterDataService.fetchSROs();
      return allSROs.filter(sro =>
        sro.name.toLowerCase().includes(query.toLowerCase()) ||
        sro.code.toLowerCase().includes(query.toLowerCase())
      );
    },
    validate: async (item) => {
      const errors: string[] = [];
      if (!item.name?.trim()) {
        errors.push('name: SRO name is required');
      }
      if (!item.code?.trim()) {
        errors.push('code: SRO code is required');
      }
      if (!item.districtCode?.trim()) {
        errors.push('districtCode: District is required');
      }
      return errors;
    },
    bulkDeactivate: async (ids, reason) => {
      const promises = ids.map(id => masterDataService.deactivateSRO(id));
      await Promise.all(promises);
    }
  };

  return (
    <div className="space-y-4">
      {/* District Filter */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Filter by District (Optional)
        </label>
        <select
          value={selectedDistrict}
          onChange={(e) => setSelectedDistrict(e.target.value)}
          className="border px-3 py-2 rounded w-full sm:w-auto"
        >
          <option value="">All Districts</option>
          {districts.map(district => (
            <option key={district.code} value={district.code}>
              {district.name}
            </option>
          ))}
        </select>
      </div>

      <GenericDataTable
        title="SRO"
        data={sroData}
        columns={columns}
        service={sroService}
        formFields={formFields}
        canCreate={true}
        canEdit={true}
        canDeactivate={true}
        canViewHistory={true}
        requiresApproval={true}
        enableSearch={true}
        enableFilters={true}
        enableExport={true}
      />
    </div>
  );
};

export default SROCascadingCRUD;