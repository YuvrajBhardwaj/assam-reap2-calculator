import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Database, MapPin, Settings, Users, Building, Layers, Calculator, Map, Home } from 'lucide-react';
import LandSubClassCRUD from './LandSubClassCRUD'
import LandClassMapping from './LandClassMapping'
import LandSubClassMapping from './LandSubClassMapping'

// Import CRUD components
import DistrictCRUD from './DistrictCRUD';
import SROCascadingCRUD from './SROCascadingCRUD';
import LandClassCRUD from './LandClassCRUD';
import ParameterCRUD from './ParameterCRUD';
import VillageCRUD from './VillageCRUD';
import CircleCRUD from './CircleCRUD';
import AreaTypeCRUD from './AreaTypeCRUD';
import MouzaCRUD from './MouzaCRUD';
import LotCRUD from './LotCRUD';

interface MasterDataCRUDDashboardProps {
  className?: string;
}

export default function MasterDataCRUDDashboard({ className = "" }: MasterDataCRUDDashboardProps) {
  const [activeTab, setActiveTab] = useState('districts');

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-6 h-6" />
            Master Data Management Dashboard
          </CardTitle>
          <p className="text-sm text-gray-600">
            Comprehensive management system for all master data entities with approval workflows and enhanced mapping
          </p>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-9">
              <TabsTrigger value="districts" className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Districts
              </TabsTrigger>
              <TabsTrigger value="circles" className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Circles
              </TabsTrigger>
              <TabsTrigger value="mouzas" className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Mouzas
              </TabsTrigger>
              <TabsTrigger value="villages" className="flex items-center gap-2">
                <Home className="w-4 h-4" />
                Villages
              </TabsTrigger>
              <TabsTrigger value="lots" className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Lots
              </TabsTrigger>
              <TabsTrigger value="landclass" className="flex items-center gap-2">
                <Layers className="w-4 h-4" />
                Land Classes
              </TabsTrigger>
              <TabsTrigger value="areatypes" className="flex items-center gap-2">
                <Layers className="w-4 h-4" />
                Area Types
              </TabsTrigger>
              <TabsTrigger value="sro" className="flex items-center gap-2">
                <Building className="w-4 h-4" />
                SRO Hierarchy
              </TabsTrigger>
              <TabsTrigger value="parameters" className="flex items-center gap-2">
                <Calculator className="w-4 h-4" />
                Parameters
              </TabsTrigger>
            </TabsList>

            <TabsContent value="districts" className="space-y-4">
              <DistrictCRUD requiresApproval={true} />
            </TabsContent>

            <TabsContent value="sro" className="space-y-4">
              <SROCascadingCRUD />
            </TabsContent>

            <TabsContent value="villages" className="space-y-4">
              <VillageCRUD />
            </TabsContent>

            <TabsContent value="lots" className="space-y-4">
              <LotCRUD />
            </TabsContent>

            <TabsContent value="landclass" className="space-y-4">
              <LandClassCRUD requiresApproval={true} />
            </TabsContent>

            <TabsContent value="areatypes" className="space-y-4">
              <AreaTypeCRUD />
            </TabsContent>

            <TabsContent value="parameters" className="space-y-4">
              <ParameterCRUD />
            </TabsContent>

            <TabsContent value="circles" className="space-y-4">
              <CircleCRUD requiresApproval={true} />
            </TabsContent>

            <TabsContent value="mouzas" className="space-y-4">
              <MouzaCRUD />
            </TabsContent>
            <TabsContent value="landsubclass" className="space-y-4">
              <LandSubClassCRUD requiresApproval={true} />
            </TabsContent>
            <TabsContent value="classmapping" className="space-y-4">
              <LandClassMapping />
            </TabsContent>
            <TabsContent value="subclassmapping" className="space-y-4">
              <LandSubClassMapping />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}