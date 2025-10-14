import React, { useState, useEffect } from 'react';
import GenericDataTable, { TableColumn, FormField, CRUDService } from './GenericDataTable';
import * as masterDataService from '@/services/masterDataService';
import { BaseEntity, Parameter, ParameterWeightage, ParameterBand } from '@/types/masterData';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Settings, Layers, Calculator, History } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface ParameterCRUDProps {
  className?: string;
}

// Extended interfaces to handle composite keys for weightage and bands
interface ExtendedParameterWeightage extends ParameterWeightage, BaseEntity {
  id: string; // Composite key: parameterCode
  code: string; // Mapped from parameterCode
  name: string; // Mapped from parameterCode (or parameter name)
  isActive: boolean; // Default to true for weightages
}

interface ExtendedParameterBand extends ParameterBand, BaseEntity {
  id: string; // Composite key: parameterCode-bandCode
  code: string; // Mapped from bandCode
  name: string; // Mapped from label
  isActive: boolean; // Default to true for bands
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

  // Load data on component mount
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
      
      setParameters(paramData);
      // Add synthetic id fields for weightages and bands
      setWeightages(weightageData.map(w => ({
        ...w,
        id: w.parameterCode,
        code: w.parameterCode,
        name: parameters.find(p => p.code === w.parameterCode)?.name || w.parameterCode,
        isActive: true
      })));
      setBands(bandData.map(b => ({
        ...b,
        id: `${b.parameterCode}-${b.bandCode}`,
        code: b.bandCode,
        name: b.label,
        isActive: true
      })));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load parameter data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Parameter table configuration
  const parameterColumns: TableColumn<Parameter>[] = [
    { key: 'code', label: 'Code', sortable: true, searchable: true },
    { key: 'name', label: 'Parameter Name', sortable: true, searchable: true },
    { key: 'category', label: 'Category', sortable: true, searchable: true },
    { key: 'dataType', label: 'Data Type', sortable: true },
    { key: 'unit', label: 'Unit' },
    { key: 'description', label: 'Description', render: (value: string) => value ? (value.length > 50 ? `${value.substring(0, 50)}...` : value) : '-' },
    { key: 'isMandatory', label: 'Mandatory', render: (value: boolean) => value ? 'Yes' : 'No' },
    { key: 'isActive', label: 'Status', render: (value: boolean) => (
      <Badge variant={value ? "default" : "secondary"}>
        {value ? "Active" : "Inactive"}
      </Badge>
    )}
  ];

  const parameterFormFields: FormField<Parameter>[] = [
    { key: 'code', label: 'Parameter Code', type: 'text', required: true, placeholder: 'Enter parameter code' },
    { key: 'name', label: 'Parameter Name', type: 'text', required: true, placeholder: 'Enter parameter name' },
    { key: 'category', label: 'Category', type: 'select', required: true, 
      options: [
        { value: 'Geographical', label: 'Geographical' },
        { value: 'Infrastructure', label: 'Infrastructure' },
        { value: 'Market', label: 'Market' },
        { value: 'Legal', label: 'Legal' },
        { value: 'Development', label: 'Development' }
      ]
    },
    { key: 'dataType', label: 'Data Type', type: 'select', required: true,
      options: [
        { value: 'Numeric', label: 'Numeric' },
        { value: 'Text', label: 'Text' },
        { value: 'Boolean', label: 'Boolean' },
        { value: 'Percentage', label: 'Percentage' },
        { value: 'Distance', label: 'Distance' }
      ]
    },
    { key: 'unit', label: 'Unit', type: 'text', placeholder: 'Enter unit (e.g., meters, percentage)' },
    { key: 'description', label: 'Description', type: 'textarea', placeholder: 'Enter detailed description' },
    { key: 'formula', label: 'Calculation Formula', type: 'textarea', placeholder: 'Enter calculation formula' },
    { key: 'minValue', label: 'Min Value', type: 'number' },
    { key: 'maxValue', label: 'Max Value', type: 'number' },
    { key: 'defaultValue', label: 'Default Value', type: 'text' },
    { key: 'isMandatory', label: 'Mandatory', type: 'checkbox' },
    { key: 'effectiveFrom', label: 'Effective From', type: 'date', required: true },
    { key: 'effectiveTo', label: 'Effective To', type: 'date' }
  ];

  // Weightage table configuration
  const weightageColumns: TableColumn<ExtendedParameterWeightage>[] = [
    { key: 'parameterCode', label: 'Parameter', sortable: true, 
      render: (value: string) => {
        const param = parameters.find(p => p.code === value);
        return param ? param.name : value;
      }
    },
    { key: 'weightage', label: 'Weightage (%)', sortable: true, render: (value: number) => `${value}%` }
  ];

  const weightageFormFields: FormField<ExtendedParameterWeightage>[] = [
    { key: 'parameterCode', label: 'Parameter', type: 'select', required: true,
      options: parameters.map(p => ({ value: p.code, label: p.name }))
    },
    { key: 'weightage', label: 'Weightage (%)', type: 'number', required: true, placeholder: 'Enter weightage percentage' }
  ];

  // Band table configuration  
  const bandColumns: TableColumn<ExtendedParameterBand>[] = [
    { key: 'parameterCode', label: 'Parameter', sortable: true,
      render: (value: string) => {
        const param = parameters.find(p => p.code === value);
        return param ? param.name : value;
      }
    },
    { key: 'bandCode', label: 'Band Code', sortable: true },
    { key: 'label', label: 'Band Label', sortable: true },
    { key: 'minValue', label: 'Min Value', render: (value?: number) => value !== undefined ? value.toString() : '-' },
    { key: 'maxValue', label: 'Max Value', render: (value?: number) => value !== undefined ? value.toString() : '-' }
  ];

  const bandFormFields: FormField<ExtendedParameterBand>[] = [
    { key: 'parameterCode', label: 'Parameter', type: 'select', required: true,
      options: parameters.map(p => ({ value: p.code, label: p.name }))
    },
    { key: 'bandCode', label: 'Band Code', type: 'text', required: true, placeholder: 'Enter band code' },
    { key: 'label', label: 'Band Label', type: 'text', required: true, placeholder: 'Enter band label (e.g., 0-100m)' },
    { key: 'minValue', label: 'Min Value', type: 'number', placeholder: 'Enter minimum value' },
    { key: 'maxValue', label: 'Max Value', type: 'number', placeholder: 'Enter maximum value' }
  ];

  // CRUD service for parameters
  const parameterCRUDService: CRUDService<Parameter> = {
    fetchAll: masterDataService.getAllParameters,
    create: masterDataService.createParameter,
    update: masterDataService.updateParameter,
    deactivate: masterDataService.deactivateParameter,
    getHistory: masterDataService.getParameterHistory,
    requestChange: (operation, payload, reason) => 
      masterDataService.submitChangeRequest({
        entityType: 'Parameter',
        entityId: payload.id,
        operation,
        payload,
        reason
      })
  };

  // CRUD service for weightages
  const weightageCRUDService: CRUDService<ExtendedParameterWeightage> = {
    fetchAll: async () => {
      const data = await masterDataService.getAllParameterWeightages();
      return data.map(w => ({
        ...w,
        id: w.parameterCode,
        code: w.parameterCode,
        name: parameters.find(p => p.code === w.parameterCode)?.name || w.parameterCode,
        isActive: true
      }));
    },
    create: async (data) => {
      const result = await masterDataService.createParameterWeightage({
        parameterCode: data.parameterCode,
        weightage: data.weightage
      } as ParameterWeightage);
      const parameterName = parameters.find(p => p.code === result.parameterCode)?.name || result.parameterCode;
      return { ...result, id: result.parameterCode, code: result.parameterCode, name: parameterName, isActive: true };
    },
    update: async (id, data) => {
      const result = await masterDataService.updateParameterWeightage(id, {
        parameterCode: data.parameterCode,
        weightage: data.weightage
      } as ParameterWeightage);
      const parameterName = parameters.find(p => p.code === result.parameterCode)?.name || result.parameterCode;
      return { ...result, id: result.parameterCode, code: result.parameterCode, name: parameterName, isActive: true };
    },
    deactivate: async (id) => {
      await masterDataService.deleteParameterWeightage(id);
    },
    getHistory: masterDataService.getParameterWeightageHistory,
    requestChange: (operation, payload, reason) => 
      masterDataService.submitChangeRequest({
        entityType: 'ParameterWeightage',
        entityId: payload.parameterCode,
        operation,
        payload,
        reason
      })
  };

  // CRUD service for bands
  const bandCRUDService: CRUDService<ExtendedParameterBand> = {
    fetchAll: async () => {
      const data = await masterDataService.getAllParameterBands();
      return data.map(b => ({
        ...b,
        id: `${b.parameterCode}-${b.bandCode}`,
        code: b.bandCode,
        name: b.label,
        isActive: true
      }));
    },
    create: async (data) => {
      const result = await masterDataService.createParameterBand({
        parameterCode: data.parameterCode,
        bandCode: data.bandCode,
        label: data.label,
        minValue: data.minValue,
        maxValue: data.maxValue
      } as ParameterBand);
      return { ...result, id: `${result.parameterCode}-${result.bandCode}`, code: result.bandCode, name: result.label, isActive: true };
    },
    update: async (id, data) => {
      const [parameterCode, bandCode] = id.split('-');
      const result = await masterDataService.updateParameterBand(parameterCode, bandCode, {
        parameterCode: data.parameterCode,
        bandCode: data.bandCode,
        label: data.label,
        minValue: data.minValue,
        maxValue: data.maxValue
      });
      return { ...result, id: `${result.parameterCode}-${result.bandCode}`, code: result.bandCode, name: result.label, isActive: true };
    },
    deactivate: async (id) => {
      const [parameterCode, bandCode] = id.split('-');
      await masterDataService.deleteParameterBand(parameterCode, bandCode);
    },
    getHistory: (id) => {
      const [parameterCode, bandCode] = id.split('-');
      return masterDataService.getParameterBandHistory(`${parameterCode}-${bandCode}`);
    },
    requestChange: (operation, payload, reason) => {
      const id = payload.parameterCode && payload.bandCode ? 
        `${payload.parameterCode}-${payload.bandCode}` : 
        payload.id;
      return masterDataService.submitChangeRequest({
        entityType: 'ParameterBand',
        entityId: id,
        operation,
        payload,
        reason
      });
    }
  };

  // Custom parameter preview component
  const ParameterPreview = ({ parameter }: { parameter: Parameter }) => (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-semibold">{parameter.name}</h4>
          <div className="flex gap-2">
            <Badge variant={parameter.isActive ? "default" : "secondary"}>
              {parameter.isActive ? "Active" : "Inactive"}
            </Badge>
            <Badge variant={parameter.isMandatory ? "destructive" : "outline"}>
              {parameter.isMandatory ? "Mandatory" : "Optional"}
            </Badge>
          </div>
        </div>
        <p className="text-sm text-gray-600 mb-2">{parameter.description}</p>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <Label className="font-medium">Category:</Label>
            <p>{parameter.category}</p>
          </div>
          <div>
            <Label className="font-medium">Data Type:</Label>
            <p>{parameter.dataType} {parameter.unit && `(${parameter.unit})`}</p>
          </div>
          {parameter.minValue !== undefined && (
            <div>
              <Label className="font-medium">Range:</Label>
              <p>{parameter.minValue} - {parameter.maxValue}</p>
            </div>
          )}
          {parameter.formula && (
            <div className="col-span-2">
              <Label className="font-medium">Formula:</Label>
              <pre className="text-xs bg-gray-100 p-2 rounded mt-1">{parameter.formula}</pre>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

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
              <TabsTrigger value="weightages" className="flex items-center gap-2">
                <Layers className="w-4 h-4" />
                Weightages
              </TabsTrigger>
              <TabsTrigger value="bands" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Bands
              </TabsTrigger>
            </TabsList>

            <TabsContent value="parameters" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Parameter Definitions</h3>
                <Badge variant="outline">
                  Total: {parameters.length}
                </Badge>
              </div>
              
              {selectedParameter && <ParameterPreview parameter={selectedParameter} />}
              
              {/* Parameters Table */}
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
                 requiresApproval={true}
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
                 requiresApproval={true}
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
                 requiresApproval={true}
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