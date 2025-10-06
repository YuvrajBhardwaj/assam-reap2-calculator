import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import MasterDataCRUDDashboard from '@/components/admin/MasterDataCRUD/MasterDataCRUDDashboard';
import ParameterManager from '@/components/admin/ParameterManager';
import { UserManagement } from '@/components/admin/UserManagement';
import ApprovalInbox from '@/components/admin/ApprovalInbox';
import WorkflowDashboard from '@/components/admin/WorkflowDashboard';
import { Database, Users, Settings, FileCheck, GitBranch, BarChart } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('master-data');

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Administration Dashboard</h1>
          <p className="text-muted-foreground">Manage master data, users, workflows, and system parameters</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-3 lg:grid-cols-6 gap-2 bg-muted/50 p-2 h-auto">
            <TabsTrigger value="master-data" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              <span className="hidden sm:inline">Master Data</span>
            </TabsTrigger>
            <TabsTrigger value="parameters" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Parameters</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Users</span>
            </TabsTrigger>
            <TabsTrigger value="approvals" className="flex items-center gap-2">
              <FileCheck className="h-4 w-4" />
              <span className="hidden sm:inline">Approvals</span>
            </TabsTrigger>
            <TabsTrigger value="workflows" className="flex items-center gap-2">
              <GitBranch className="h-4 w-4" />
              <span className="hidden sm:inline">Workflows</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart className="h-4 w-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="master-data" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Master Data Management</CardTitle>
                <CardDescription>
                  Manage districts, circles, mouzas, villages, lots, land classes, and all reference data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MasterDataCRUDDashboard />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="parameters" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Parameter Management</CardTitle>
                <CardDescription>
                  Configure valuation parameters, bands, weightages, and formulas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ParameterManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                  Create and manage user accounts, assign roles, and configure access rights
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UserManagement />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="approvals" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Approval Inbox</CardTitle>
                <CardDescription>
                  Review and approve pending change requests for master data and configurations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ApprovalInbox />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="workflows" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Workflow Management</CardTitle>
                <CardDescription>
                  Monitor and manage approval workflows, track request statuses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <WorkflowDashboard />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>System Analytics</CardTitle>
                <CardDescription>
                  View system usage statistics and audit logs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Total Master Data Records</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">12,458</div>
                      <p className="text-xs text-muted-foreground">+180 from last month</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">23</div>
                      <p className="text-xs text-muted-foreground">5 urgent requests</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">156</div>
                      <p className="text-xs text-muted-foreground">12 logged in now</p>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
    </div>
  );
};

export default AdminDashboard;
