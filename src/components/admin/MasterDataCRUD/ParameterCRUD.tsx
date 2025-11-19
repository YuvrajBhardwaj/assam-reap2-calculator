import React, { useState, useEffect } from 'react';
import GenericDataTable, { TableColumn, FormField, CRUDService } from './GenericDataTable';
import * as masterDataService from '@/services/masterDataService';
import { BaseEntity, Parameter, ParameterWeightage, ParameterBand } from '@/types/masterData';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Settings, Layers, Calculator } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface ParameterCRUDProps {
  className?: string;
}

// Extended types for UI (extending base with additional mappings)
interface ExtendedParameterWeightage extends BaseEntity, ParameterWeightage {
  bandCode?: string;
}

interface ExtendedParameterBand extends BaseEntity, ParameterBand {
  subParameterName: string;
  weightage: number;
  effectiveFrom: string;
}

export default function ParameterCRUD({ className = "" }: ParameterCRUDProps) {
  const [parameters, setParameters] = useState<Parameter[]>([]);
  const [weightages, setWeightages] = useState<ExtendedParameterWeightage[]>([]);
  const [bands, setBands] = useState<ExtendedParameterBand[]>([]);
  const [selectedParameter, setSelectedParameter] = useState<Parameter | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('parameters');
  const { toast } = useToast();
  const { userRole } = useAuth();
  const isAdmin = userRole === 'ROLE_ADMIN';
  const isDepartment = userRole === 'ROLE_JuniorManager' || userRole === 'ROLE_Manager' || userRole === 'ROLE_SeniorManager';
  const canModify = isAdmin || isDepartment;

  // local UI state to help dependent selects
  const [weightageParam, setWeightageParam] = useState<string>('');
  const [selectedBandForWeightage, setSelectedBandForWeightage] = useState<string>('');

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [paramData, weightageData, bandData] = await Promise.all([
        masterDataService.getAllParameters(),
        masterDataService.getAllParameterWeightages(),
        masterDataService.getAllParameterBands()
      ]);

      setParameters(paramData || []);

      // Build bands mapped to ExtendedParameterBand
      const mappedBands: ExtendedParameterBand[] = (bandData || []).map((b: ParameterBand) => ({
        ...b,
        id: `${b.parameterCode}-${b.bandCode}`,
        code: b.bandCode,
        name: b.subParameterName,
        isActive: true,
        weightage: b.weightage,
        effectiveFrom: b.effectiveFrom
      }));
      setBands(mappedBands);

      // Build weightages mapped to ExtendedParameterWeightage
      const mappedWeightages: ExtendedParameterWeightage[] = (weightageData || []).map((w: ParameterWeightage) => {
        const param = (paramData || []).find(p => p.code === w.parameterCode);
        const bc = (w as any).bandCode;
        return {
          ...(w as any),
          id: `${w.parameterCode}${bc ? `-${bc}` : ''}`,
          code: w.parameterCode,
          name: param ? param.name : w.parameterCode,
          isActive: true,
          bandCode: bc
        };
      });
      setWeightages(mappedWeightages);

    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to load parameter data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // helper: generate a unique code from name (slug + timestamp)
  const generateUniqueCode = (name?: string) => {
    if (!name) return `param-${Date.now()}`;
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
    return `${slug}-${Date.now().toString().slice(-5)}`;
  };

  // Parameter table configuration
  const parameterColumns: TableColumn<Parameter>[] = [
    { key: 'code', label: 'Code', sortable: true, searchable: true },
    { key: 'name', label: 'Parameter Name', sortable: true, searchable: true },
    { key: 'createdBy', label: 'Created By', sortable: true, searchable: true },
    { key: 'createdAt', label: 'Created Date', sortable: true, render: (value: string) => new Date(value).toLocaleString() },
    { key: 'updatedBy', label: 'Updated By', sortable: true, searchable: true },
    { key: 'updatedAt', label: 'Updated Date', sortable: true, render: (value: string) => value ? new Date(value).toLocaleString() : '-' },
    {
      key: 'isActive', label: 'Status', render: (value: boolean) => (
        <Badge variant={value ? "default" : "secondary"}>
          {value ? "Active" : "Inactive"}
        </Badge>
      )
    }
  ];

  // Parameter form: only Parameter Name visible to user on add/edit per your requirement
  const parameterFormFields: FormField<Parameter>[] = [
    {
      key: 'name',
      label: 'Parameter Name',
      type: 'text',
      required: true,
      placeholder: 'Enter parameter name'
    }
    // NOTE: we deliberately do not expose 'code' field to the user. We'll generate it on create/update.
  ];

  // Weightage table configuration
  const weightageColumns: TableColumn<ExtendedParameterWeightage>[] = [
    {
      key: 'parameterCode', label: 'Parameter', sortable: true,
      render: (value: string) => {
        const param = parameters.find(p => p.code === value);
        return param ? param.name : value;
      }
    },
    {
      key: 'bandCode', label: 'Band', sortable: true,
      render: (value: string) => {
        const band = bands.find(b => b.code === value);
        return band ? band.name : value;
      }
    },
    { key: 'weightage', label: 'Weightage (%)', sortable: true, render: (value: number) => `${value}%` }
  ];

  // Weightage form: parameter dropdown, then band dropdown (filtered), then weightage
  const weightageFormFields: FormField<ExtendedParameterWeightage>[] = [
    {
      key: 'parameterCode',
      label: 'Parameter',
      type: 'select',
      required: true,
      options: parameters.map(p => ({ value: p.code, label: p.name })),
      onChange: (_, val) => {
        setWeightageParam(val as string);
        // reset selected band when parameter changes
        setSelectedBandForWeightage('');
      }
    },
    {
      key: 'bandCode',
      label: 'Band',
      type: 'select',
      required: true,
      options: bands
        .filter(b => b.parameterCode === weightageParam)
        .map(b => ({ value: b.code, label: b.name }))
    },
    {
      key: 'weightage',
      label: 'Weightage (%)',
      type: 'number',
      required: true,
      placeholder: 'Enter weightage percentage'
    }
  ];

  // Band table configuration
  const bandColumns: TableColumn<ExtendedParameterBand>[] = [
    {
      key: 'parameterCode', label: 'Parameter', sortable: true,
      render: (value: string) => {
        const param = parameters.find(p => p.code === value);
        return param ? param.name : value;
      }
    },
    { key: 'name', label: 'Band Name', sortable: true }, // Use 'name' which maps to subParameterName
    { key: 'weightage', label: 'Weightage', render: (value?: number) => value !== undefined ? value.toString() : '-' },
    { key: 'effectiveFrom', label: 'Effective From', render: (value?: string) => value || '-' }
  ];

  // Band form: parameter dropdown, band name, effective from (only)
  const bandFormFields: FormField<ExtendedParameterBand>[] = [
    {
      key: 'parameterCode',
      label: 'Parameter',
      type: 'select',
      required: true,
      options: parameters.map(p => ({ value: p.code, label: p.name }))
    },
    {
      key: 'name',
      label: 'Band Name',
      type: 'text',
      required: true,
      placeholder: 'e.g. 0-100 m'
    },
    {
      key: 'effectiveFrom',
      label: 'Effective From',
      type: 'date',
      required: true
    },
    {
      key: 'weightage',
      label: 'Weightage',
      type: 'number',
      required: true,
      placeholder: 'Enter weightage'
    }
  ];

  // CRUD service for parameters
  const parameterCRUDService: CRUDService<Parameter> = {
    fetchAll: masterDataService.getAllParameters,
    create: async (data) => {
      // API expects { parameterName: string }, map 'name' to 'parameterName'
      const payload = {
        parameterName: (data as any).name
      };
      const result = await masterDataService.createParameter(payload);
      // refresh lists after create
      await loadAllData();
      return result;
    },
    update: async (id, data) => {
      // API expects { parameterName, parameterCode }
      const payload = {
        parameterName: (data as any).name,
        parameterCode: id
      };
      const result = await masterDataService.updateParameter(id, payload);
      await loadAllData();
      return result;
    },
    deactivate: async (id) => {
      await masterDataService.deleteParameter(id);
      await loadAllData();
    },
    getHistory: masterDataService.getParameterHistory,
    requestChange: undefined // Workflows commented out; disable approval
  };

  // CRUD service for weightages
  const weightageCRUDService: CRUDService<ExtendedParameterWeightage> = {
    fetchAll: async () => {
      const data = await masterDataService.getAllParameterWeightages();
      return (data || []).map((w: ParameterWeightage) => {
        const p = parameters.find(p => p.code === w.parameterCode);
        return {
          ...(w as any),
          id: `${w.parameterCode}${(w as any).bandCode ? `-${(w as any).bandCode}` : ''}`,
          code: w.parameterCode,
          name: p ? p.name : w.parameterCode,
          isActive: true,
          bandCode: (w as any).bandCode
        } as ExtendedParameterWeightage;
      });
    },
    create: async (data) => {
      // master API probably expects ParameterWeightage shape. Include bandCode if available.
      const payload: ParameterWeightage & { bandCode?: string } = {
        parameterCode: data.parameterCode,
        weightage: data.weightage,
        ...(data.bandCode ? { bandCode: data.bandCode } : {})
      } as any;
      const result = await masterDataService.createParameterWeightage(payload);
      const paramName = parameters.find(p => p.code === result.parameterCode)?.name || result.parameterCode;
      const mapped: ExtendedParameterWeightage = {
        ...(result as any),
        id: `${result.parameterCode}${(result as any).bandCode ? `-${(result as any).bandCode}` : ''}`,
        code: result.parameterCode,
        name: paramName,
        isActive: true,
        bandCode: (result as any).bandCode
      };
      await loadAllData();
      return mapped;
    },
    update: async (id, data) => {
      // attempt to parse parameterCode and bandCode from id if needed
      const result = await masterDataService.updateParameterWeightage(id, {
        parameterCode: data.parameterCode,
        weightage: data.weightage,
        ...(data.bandCode ? { bandCode: data.bandCode } : {})
      } as any);
      const paramName = parameters.find(p => p.code === result.parameterCode)?.name || result.parameterCode;
      await loadAllData();
      return {
        ...(result as any),
        id: `${result.parameterCode}${(result as any).bandCode ? `-${(result as any).bandCode}` : ''}`,
        code: result.parameterCode,
        name: paramName,
        isActive: true,
        bandCode: (result as any).bandCode
      } as ExtendedParameterWeightage;
    },
    deactivate: async (id) => {
      await masterDataService.deleteParameterWeightage(id);
      await loadAllData();
    },
    getHistory: masterDataService.getParameterWeightageHistory,
    requestChange: undefined // Workflows commented out; disable approval
  };

  // CRUD service for bands
  const bandCRUDService: CRUDService<ExtendedParameterBand> = {
    fetchAll: async () => {
      const data = await masterDataService.getAllParameterBands();
      return (data || []).map((b: ParameterBand) => ({
        ...b,
        id: `${b.parameterCode}-${b.bandCode}`,
        code: b.bandCode,
        name: b.subParameterName,
        isActive: true,
        weightage: b.weightage,
        effectiveFrom: b.effectiveFrom
      }));
    },
    create: async (data) => {
      // create payload - include only available fields
      const payload = {
        parameterCode: data.parameterCode,
        subParameterName: data.name,
        weightage: data.weightage,
        effectiveFrom: data.effectiveFrom
      };
      const result = await masterDataService.createParameterBand(payload as ParameterBand);
      await loadAllData();
      return {
        ...result,
        id: `${result.parameterCode}-${result.bandCode}`,
        code: result.bandCode,
        name: result.subParameterName,
        isActive: true,
        weightage: result.weightage,
        effectiveFrom: result.effectiveFrom
      } as ExtendedParameterBand;
    },
    update: async (id, data) => {
      const [parameterCode, bandCode] = id.split('-');
      const payload = {
        parameterCode,
        bandCode: bandCode,
        subParameterName: data.name,
        weightage: data.weightage,
        effectiveFrom: data.effectiveFrom
      };
      const result = await masterDataService.updateParameterBand(parameterCode, bandCode, payload);
      await loadAllData();
      return {
        ...result,
        id: `${result.parameterCode}-${result.bandCode}`,
        code: result.bandCode,
        name: result.subParameterName,
        isActive: true,
        weightage: result.weightage,
        effectiveFrom: result.effectiveFrom
      } as ExtendedParameterBand;
    },
    deactivate: async (id) => {
      const [parameterCode, bandCode] = id.split('-');
      await masterDataService.deleteParameterBand(parameterCode, bandCode);
      await loadAllData();
    },
    getHistory: (id) => {
      const [parameterCode, bandCode] = id.split('-');
      return masterDataService.getParameterBandHistory(`${parameterCode}-${bandCode}`);
    },
    requestChange: undefined // Workflows commented out; disable approval
  };

  // Small preview card for parameter
  

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Parameter Management System
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">

              <TabsTrigger value="parameters" className="flex items-center gap-2">
                <Calculator className="w-4 h-4" />
                Parameters
              </TabsTrigger>
              
              <TabsTrigger value="bands" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Bands
              </TabsTrigger>

              <TabsTrigger value="weightages" className="flex items-center gap-2">
                <Layers className="w-4 h-4" />
                Weightages
              </TabsTrigger>
              
            </TabsList>

            <TabsContent value="parameters" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Parameter Definitions</h3>
                <Badge variant="outline">
                  Total: {parameters.length}
                </Badge>
              </div>


              <GenericDataTable
                title="Parameters"
                data={parameters}
                columns={parameterColumns}
                service={parameterCRUDService}
                formFields={parameterFormFields}
                onItemSelect={(parameter) => setSelectedParameter(parameter)}
                canCreate={!!canModify}
                canEdit={!!canModify}
                canDeactivate={!!canModify}
                canViewHistory={true}
                requiresApproval={false}
                enableSearch={true}
                enableFilters={true}
                enableExport={true}
                customActions={[
                  {
                    label: 'Configure Bands',
                    icon: <Settings className="w-4 h-4" />,
                    onClick: (item) => {
                      setSelectedParameter(item);
                      setActiveTab('bands');
                    }
                  },
                  {
                    label: 'Set Weightages',
                    icon: <Layers className="w-4 h-4" />,
                    onClick: (item) => {
                      setSelectedParameter(item);
                      setActiveTab('weightages');
                    }
                  }
                ]}
              />
            </TabsContent>

            <TabsContent value="weightages" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Parameter Weightages</h3>
                <Badge variant="outline">
                  Total: {weightages.length}
                </Badge>
              </div>

              <GenericDataTable
                title="Parameter Weightages"
                data={weightages}
                columns={weightageColumns}
                service={weightageCRUDService}
                formFields={weightageFormFields}
                canCreate={canModify}
                canEdit={canModify}
                canDeactivate={canModify}
                canViewHistory={true}
                requiresApproval={false}
                enableSearch={true}
                enableFilters={false}
                enableExport={true}
              />
            </TabsContent>

            <TabsContent value="bands" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Parameter Bands</h3>
                <Badge variant="outline">
                  Total: {bands.length}
                </Badge>
              </div>

              <GenericDataTable
                title="Parameter Bands"
                data={bands}
                columns={bandColumns}
                service={bandCRUDService}
                formFields={bandFormFields}
                canCreate={canModify}
                canEdit={canModify}
                canDeactivate={canModify}
                canViewHistory={true}
                requiresApproval={false}
                enableSearch={true}
                enableFilters={false}
                enableExport={true}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}