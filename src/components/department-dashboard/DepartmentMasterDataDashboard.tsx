import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Database, MapPin, Home, Layers, Building, Calculator } from 'lucide-react';

// Reuse existing admin CRUD components for department users' view
import DistrictCRUD from "@/components/admin/MasterDataCRUD/DistrictCRUD";
import CircleCRUD from "@/components/admin/MasterDataCRUD/CircleCRUD";
import MouzaCRUD from "@/components/admin/MasterDataCRUD/MouzaCRUD";
import VillageCRUD from "@/components/admin/MasterDataCRUD/VillageCRUD";
import LotCRUD from "@/components/admin/MasterDataCRUD/LotCRUD";
import LandClassCRUD from "@/components/admin/MasterDataCRUD/LandClassCRUD";
import AreaTypeCRUD from "@/components/admin/MasterDataCRUD/AreaTypeCRUD";
import SROCascadingCRUD from "@/components/admin/MasterDataCRUD/SROCascadingCRUD";
import ParameterCRUD from "@/components/admin/MasterDataCRUD/ParameterCRUD";

interface DepartmentMasterDataDashboardProps {
  className?: string;
}

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

// Dummy status counts for department users
const dummyStatusByEntity = {
  districts: { pending: 5, approved: 12, rejected: 2 },
  circles: { pending: 3, approved: 8, rejected: 1 },
  mouzas: { pending: 4, approved: 10, rejected: 2 },
  villages: { pending: 7, approved: 15, rejected: 3 },
  lots: { pending: 2, approved: 6, rejected: 0 },
  landclass: { pending: 1, approved: 9, rejected: 1 },
  areatypes: { pending: 2, approved: 7, rejected: 1 },
  sro: { pending: 0, approved: 5, rejected: 0 },
  parameters: { pending: 3, approved: 11, rejected: 2 },
};

function StatusSummary({ entity }: { entity: keyof typeof dummyStatusByEntity }) {
  const s = dummyStatusByEntity[entity];
  return (
    <div className="flex flex-wrap items-center justify-center gap-3 mb-4">
      <Badge className={`${statusColors.pending} px-3 py-1.5 text-sm md:text-base`}>Pending: {s.pending}</Badge>
      <Badge className={`${statusColors.approved} px-3 py-1.5 text-sm md:text-base`}>Approved: {s.approved}</Badge>
      <Badge className={`${statusColors.rejected} px-3 py-1.5 text-sm md:text-base`}>Rejected: {s.rejected}</Badge>
    </div>
  );
}

export default function DepartmentMasterDataDashboard({ className = "" }: DepartmentMasterDataDashboardProps) {
  const [activeTab, setActiveTab] = useState('districts');

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-6 h-6" />
            Master Data Management Dashboard – Department Users
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
              <StatusSummary entity="districts" />
              <DistrictCRUD requiresApproval={true} />
            </TabsContent>

            <TabsContent value="circles" className="space-y-4">
              <StatusSummary entity="circles" />
              <CircleCRUD requiresApproval={true} />
            </TabsContent>

            <TabsContent value="mouzas" className="space-y-4">
              <StatusSummary entity="mouzas" />
              <MouzaCRUD />
            </TabsContent>

            <TabsContent value="villages" className="space-y-4">
              <StatusSummary entity="villages" />
              <VillageCRUD />
            </TabsContent>

            <TabsContent value="lots" className="space-y-4">
              <StatusSummary entity="lots" />
              <LotCRUD />
            </TabsContent>

            <TabsContent value="landclass" className="space-y-4">
              <StatusSummary entity="landclass" />
              <LandClassCRUD requiresApproval={true} />
            </TabsContent>

            <TabsContent value="areatypes" className="space-y-4">
              <StatusSummary entity="areatypes" />
              <AreaTypeCRUD />
            </TabsContent>

            <TabsContent value="sro" className="space-y-4">
              <StatusSummary entity="sro" />
              <SROCascadingCRUD />
            </TabsContent>

            <TabsContent value="parameters" className="space-y-4">
              <StatusSummary entity="parameters" />
              <ParameterCRUD />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}