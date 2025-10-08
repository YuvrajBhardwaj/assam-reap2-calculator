
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ValuationCalculator from '@/components/ValuationCalculator/ValuationCalculator';
import PropertyValuationUI from '@/components/PropertyValuationUI';
import LandingPage from '@/components/LandingPage';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Building,
  Calculator,
  Database,
  ChartBar,
  MapPin,
  Home
} from "lucide-react";
import { useAuth } from '@/context/AuthContext';
import WorkflowDashboard from '@/components/admin/WorkflowDashboard';
import StampDutyForm from '@/components/StampDutyForm/StampDutyForm';
import ZonalView from '@/components/ZonalView/ZonalView';
import MasterDataTable from '@/components/admin/MasterDataTable';
import LandTypeRequests from '@/components/admin/LandTypeRequests';
import { useEffect } from 'react';
import CertifiedCopiesServices from '@/components/CertifiedCopiesServices';
import ParametersSection from '@/components/admin/ParametersSection';
import LandTypeSection from '@/components/admin/LandTypeSection';
import DepartmentDashboard from '@/components/department-dashboard/DepartmentDashboard';
import { Helmet } from "react-helmet-async";
import ParameterManager from '@/components/admin/ParameterManager';
import ApprovalInbox from '@/components/admin/ApprovalInbox';
import RQADashboard from '@/components/rqa/RQADashboard';
import MasterDataCRUDDashboard from '@/components/admin/MasterDataCRUD/MasterDataCRUDDashboard';
import RoleSwitcher from '@/components/RoleSwitcher';
import DepartmentWorkflowDashboard from '@/components/department-dashboard/DepartmentWorkflowDashboard';
import { UserManagement } from '@/components/admin/UserManagement';
import { UserHistoryLog } from '@/components/admin/UserHistoryLog';

const Index = () => {
  const navigate = useNavigate();
  const { userRole, isAuthenticated, simpleLogin, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("landing");
  const [initialLocationData, setInitialLocationData] = useState<any>(null); // New state for location data
  const [selectedMasterBox, setSelectedMasterBox] = useState<'jurisdiction' | 'parameters' | 'land-type' | 'approvals' | 'rqa'>('jurisdiction');
  const [prefilledStampDuty, setPrefilledStampDuty] = useState<{ marketValue?: number } | null>(null);

  useEffect(() => {
    const handleHomeEvent = () => setActiveTab("landing");
    const handleTabNavigation = (event: CustomEvent) => {
      const { tab, locationData, stampDutyData } = event.detail || {};
      if (tab) setActiveTab(tab);

      // If locationData is provided, update initialLocationData so the calculator receives it via props
      if (locationData) {
        const mapped = {
          district: locationData.district
            ? { code: locationData.district.code, name: locationData.district.name || '' }
            : undefined,
          circle: locationData.circle
            ? { code: locationData.circle.code, name: locationData.circle.name || '' }
            : undefined,
          // Support both `village` and `mouza` payloads
          village: locationData.village
            ? { code: locationData.village.code, name: locationData.village.name || '' }
            : locationData.mouza
            ? { code: locationData.mouza.code, name: locationData.mouza.name || '' }
            : undefined,
        } as any;
        setInitialLocationData(mapped);
      }

      // If stamp duty data present, store for StampDutyForm prefill
      if (stampDutyData && typeof stampDutyData.marketValue === 'number') {
        setPrefilledStampDuty({ marketValue: stampDutyData.marketValue });
      }
    };
    
    // Check for initial district, circle, mouza parameters
    const searchParams = new URLSearchParams(window.location.search);
    const districtCode = searchParams.get('district');
    const circleCode = searchParams.get('circle');
    const mouzaCode = searchParams.get('mouza');

    // Activate valuation-calculator if district and circle are present (mouza is optional)
    if (districtCode && circleCode) {
      const locationData = {
        district: { code: districtCode, name: '' },
        circle: { code: circleCode, name: '' },
        village: mouzaCode ? { code: mouzaCode, name: '' } : undefined // Set village only if mouzaCode exists
      };
      setInitialLocationData(locationData);
      setActiveTab('valuation-calculator');
      // Dispatch the custom event to trigger updates in ValuationCalculator
      window.dispatchEvent(new CustomEvent('navigate-to-tab', {
        detail: { tab: 'valuation-calculator', locationData: locationData }
      }));
    } else {
      const initialTab = searchParams.get('tab');
      if (initialTab) setActiveTab(initialTab);
    }
    
    window.addEventListener("landing", handleHomeEvent);
    window.addEventListener("navigate-to-tab", handleTabNavigation as EventListener);
    
    return () => {
      window.removeEventListener("landing", handleHomeEvent);
      window.removeEventListener("navigate-to-tab", handleTabNavigation as EventListener);
    };
  }, []);

  const handleMasterBoxChange = (box: 'jurisdiction' | 'parameters' | 'land-type' | 'approvals' | 'rqa') => {
    setSelectedMasterBox(box);
  };
  const isAdmin = userRole === 'admin';
  const isDepartmentUser = userRole === 'department';

  const handleTabChange = (value: string) => {
    console.log("Tab changed to:", value);

    // Restrict access for non-admin users
    if (!isAdmin && !isDepartmentUser && !["landing", "property-valuation", "valuation-calculator", "zonal-value-database", "certified-copies", "stamp-duty-calculator"].includes(value)) {
      console.log("Access denied: User role insufficient");
      return;
    }
    
    if (isDepartmentUser && value === "department-dashboard") {
      setActiveTab(value);
      return;
    }

    setActiveTab(value);

    // Clear initialLocationData if not on the valuation-calculator tab
    if (value !== "valuation-calculator") {
      setInitialLocationData(null);
      // Clear URL query parameters and reset to base URL
      window.history.pushState({}, '', '/');
    }
  };

  const handleGetStarted = () => {
    setActiveTab("property-valuation");
  };

  const handleNavigateToSection = (section: string) => {
    // Check access before navigating
    if (!isAdmin && !isDepartmentUser && !["landing", "property-valuation", "valuation-calculator", "stamp-duty-calculator", "zonal-value-database", "certified-copies"].includes(section)) {
      console.log("Access denied: User role insufficient");
      return;
    }
    
    // Allow department users to access department dashboard
    if (isDepartmentUser && section === "department-dashboard") {
      setActiveTab(section);
      return;
    }
    
    setActiveTab(section);
  };

  return (
    <div className="min-h-screen flex flex-col bg-assam-gray">
      <Helmet>
        <title>Assam Land Value & Stamp Duty Calculator | Official Portal</title>
        <meta name="description" content="Calculate property valuation and stamp duty for Assam. Access zonal values, zonal database, and digital land records." />
        <link rel="canonical" href="/" />
      </Helmet>
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6">
        <RoleSwitcher />

        <Tabs defaultValue="landing" value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="flex flex-nowrap gap-x-2 mb-8 rounded-lg p-1 justify-start overflow-x-auto sm:overflow-x-visible">
            <TabsTrigger value="property-valuation" className={`flex items-center gap-2 flex-shrink-0 truncate whitespace-nowrap ${activeTab === 'property-valuation' ? 'bg-white text-[#595959] border border-[#595959]' : 'bg-[#595959] text-white'} transition-colors`}>
              <Building className="h-4 w-4" />
              <span>Property Valuation</span>
            </TabsTrigger>
            <TabsTrigger value="stamp-duty-calculator" className={`flex items-center gap-2 flex-shrink-0 truncate whitespace-nowrap ${activeTab === 'stamp-duty-calculator' ? 'bg-white text-[#595959] border border-[#595959]' : 'bg-[#595959] text-white'} transition-colors`}>
              <Calculator className="h-4 w-4" />
              <span>Stamp Duty Calculation</span>
            </TabsTrigger>
            <TabsTrigger value="zonal-value-database" className={`flex items-center gap-2 flex-shrink-0 truncate whitespace-nowrap ${activeTab === 'zonal-value-database' ? 'bg-white text-[#595959] border border-[#595959]' : 'bg-[#595959] text-white'} transition-colors`}>
              <Database className="h-4 w-4" />
              <span>View Zonal Values</span>
            </TabsTrigger>
            <TabsTrigger value="certified-copies" className={`flex items-center gap-2 flex-shrink-0 truncate whitespace-nowrap ${activeTab === 'certified-copies' ? 'bg-white text-[#595959] border border-[#595959]' : 'bg-[#595959] text-white'} transition-colors`}>
              <Database className="h-4 w-4" />
              <span>Services related to Certified Copies</span>
            </TabsTrigger>
            {isDepartmentUser && (
              <>
                <TabsTrigger value="department-dashboard" className={`flex items-center gap-2 flex-shrink-0 truncate whitespace-nowrap ${activeTab === 'department-dashboard' ? 'bg-white text-[#595959] border border-[#595959]' : 'bg-[#595959] text-white'} transition-colors`}>
                  <Database className="h-4 w-4" />
                  <span>Department Dashboard</span>
                </TabsTrigger>
                <TabsTrigger value="workflow-management" className={`flex items-center gap-2 flex-shrink-0 truncate whitespace-nowrap ${activeTab === 'workflow-management' ? 'bg-white text-[#595959] border border-[#595959]' : 'bg-[#595959] text-white'} transition-colors`}>
                  <ChartBar className="h-4 w-4" />
                  <span>Workflow Management</span>
                </TabsTrigger>
              </>
            )}
            {isAdmin && (
              <>
                <TabsTrigger value="master-data" className={`flex items-center gap-2 flex-shrink-0 truncate whitespace-nowrap ${activeTab === 'master-data' ? 'bg-white text-[#595959] border border-[#595959]' : 'bg-[#595959] text-white'} transition-colors`}>
                  <Database className="h-4 w-4" />
                  <span>Master Data</span>
                </TabsTrigger>
                <TabsTrigger value="reports" className={`flex items-center gap-2 flex-shrink-0 truncate whitespace-nowrap ${activeTab === 'reports' ? 'bg-white text-[#595959] border border-[#595959]' : 'bg-[#595959] text-white'} transition-colors`}>
                  <ChartBar className="h-4 w-4" />
                  <span>Reports</span>
                </TabsTrigger>
                <TabsTrigger value="workflow" className={`flex items-center gap-2 flex-shrink-0 truncate whitespace-nowrap ${activeTab === 'workflow' ? 'bg-white text-[#595959] border border-[#595959]' : 'bg-[#595959] text-white'} transition-colors`}>
                  <ChartBar className="h-4 w-4" />
                  <span>Workflow</span>
                </TabsTrigger>
                <TabsTrigger value="user-management" className={`flex items-center gap-2 flex-shrink-0 truncate whitespace-nowrap ${activeTab === 'user-management' ? 'bg-white text-[#595959] border border-[#595959]' : 'bg-[#595959] text-white'} transition-colors`}>
                  <span>User Management</span>
                </TabsTrigger>
              </>
            )}
          </TabsList>

          <TabsContent value="landing" className="space-y-4">
            <LandingPage onGetStarted={handleGetStarted} onNavigateToSection={handleNavigateToSection} />
          </TabsContent>

          <TabsContent value="property-valuation" className="space-y-4">
            <PropertyValuationUI />
            
          </TabsContent>

          <TabsContent value="valuation-calculator" className="space-y-4">
            <ValuationCalculator initialLocationData={initialLocationData} /> {/* Pass initialLocationData */}
          </TabsContent>

          <TabsContent value="stamp-duty-calculator" className="space-y-4">
            <StampDutyForm initialMarketValue={prefilledStampDuty?.marketValue} />
          </TabsContent>

          <TabsContent value="zonal-value-database" className="space-y-4">
            <ZonalView />
          </TabsContent>

          <TabsContent value="certified-copies" className="space-y-4">
            <CertifiedCopiesServices />
          </TabsContent>

          {isDepartmentUser && (
            <>
              <TabsContent value="department-dashboard" className="space-y-4">
                <DepartmentDashboard />
              </TabsContent>
              <TabsContent value="workflow-management" className="space-y-4">
                <DepartmentWorkflowDashboard />
              </TabsContent>
            </>
          )}

          {isAdmin && (
            <>
              <TabsContent value="master-data" className="space-y-4">
                <MasterDataCRUDDashboard />
              </TabsContent>

              <TabsContent value="reports" className="space-y-4">
                <div className="bg-white p-6 rounded-md shadow-sm">
                  <h2 className="text-xl font-medium text-assam-blue mb-4">Reports & Analysis</h2>
                  <p className="text-gray-600">This section provides various reports and analytical tools for land valuation data.</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <div className="border border-gray-200 rounded-md p-4">
                      <h3 className="font-medium text-assam-blue">Transaction Analysis</h3>
                      <p className="text-sm text-gray-500 mb-3">Time period wise, location wise transaction and market value analysis</p>
                      <button className="bg-assam-blue text-white px-4 py-2 rounded-md text-sm">Generate Report</button>
                    </div>
                    <div className="border border-gray-200 rounded-md p-4">
                      <h3 className="font-medium text-assam-blue">Deviation Analysis</h3>
                      <p className="text-sm text-gray-500 mb-3">Analysis of deviations in Transaction Value vis-à-vis Market Value</p>
                      <button className="bg-assam-blue text-white px-4 py-2 rounded-md text-sm">Generate Report</button>
                    </div>
                    <div className="border border-gray-200 rounded-md p-4">
                      <h3 className="font-medium text-assam-blue">Price Change Analysis</h3>
                      <p className="text-sm text-gray-500 mb-3">Analysis of sudden change in land price by location or type</p>
                      <button className="bg-assam-blue text-white px-4 py-2 rounded-md text-sm">Generate Report</button>
                    </div>
                    <div className="border border-gray-200 rounded-md p-4">
                      <h3 className="font-medium text-assam-blue">Revenue Reports</h3>
                      <p className="text-sm text-gray-500 mb-3">Mouza wise, block wise, district wise revenue reports</p>
                      <button className="bg-assam-blue text-white px-4 py-2 rounded-md text-sm">Generate Report</button>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="workflow" className="space-y-4">
                <WorkflowDashboard />
              </TabsContent>

              <TabsContent value="user-management" className="space-y-4">
                <Tabs defaultValue="add-user" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="add-user">Add New User</TabsTrigger>
                    <TabsTrigger value="user-history">User History Log</TabsTrigger>
                  </TabsList>
                  <TabsContent value="add-user" className="space-y-4">
                    {activeTab === "user-management" && <UserManagement />}
                  </TabsContent>
                  <TabsContent value="user-history" className="space-y-4">
                    {activeTab === "user-management" && <UserHistoryLog />}
                  </TabsContent>
                </Tabs>
              </TabsContent>
            </>
          )}
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default Index;

