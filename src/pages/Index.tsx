import { lazy, Suspense, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from '../context/AuthContext';
import LandingPage from '../components/LandingPage';
import PropertyValuationUI from '../components/PropertyValuationUI';
import ValuationCalculator from '../components/ValuationCalculator/ValuationCalculator';
import StampDutyForm from '../components/StampDutyForm/StampDutyForm';
import ZonalView from '../components/ZonalView/ZonalView';
import CertifiedCopiesServices from '../components/CertifiedCopiesServices';
import MasterDataCRUDDashboard from '@/components/admin/MasterDataCRUD/MasterDataCRUDDashboard';
import DepartmentDashboard from '../components/department-dashboard/DepartmentDashboard';
import DepartmentWorkflowDashboard from '@/components/department-dashboard/department-workflow/DepartmentWorkflowDashboard';
import { AlertCircle, Building, Calculator, Database, ChartBar } from 'lucide-react';
import { getAllDistricts, getCirclesByDistrict, getMouzasByDistrictAndCircle } from '../services/locationService';
import { Helmet } from "react-helmet-async";
import RoleSwitcher from '@/components/RoleSwitcher';
import { UserManagement } from '@/components/admin/UserManagement';
import { UserHistoryLog } from '@/components/admin/UserHistoryLog';

const Index = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userRole } = useAuth();
  const [activeTab, setActiveTab] = useState("landing");
  const [initialLocationData, setInitialLocationData] = useState<any>(null);
  const [prefilledStampDuty, setPrefilledStampDuty] = useState<{ marketValue?: number } | null>(null);

  // ✅ Role flags (fixed logic: avoid truthy string coercion)
  const isAdmin = userRole === 'ROLE_ADMIN';
  const isDepartmentUser =
    userRole === 'ROLE_Manager' ||
    userRole === 'ROLE_JuniorManager' ||
    userRole === 'ROLE_SeniorManager';
  const isNormalUser = userRole === 'ROLE_NormalUser';
  const isGuest = userRole === null;

  // ✅ Role-based allowed tabs
  const roleAccessMap = {
    admin: [
      "property-valuation",
      "valuation-calculator",
      "stamp-duty-calculator",
      "zonal-value-database",
      "certified-copies",
      "master-data",
      "reports",
      "workflow",
      "user-management",

      "landing",
      "upcoming-initiatives",
      "important-links",
      "news-updates",
    ],
    department: [
      "property-valuation",
      "valuation-calculator",
      "stamp-duty-calculator",
      "zonal-value-database",
      "certified-copies",
      "department-dashboard",
      "workflow-dept",

      "landing",
      "upcoming-initiatives",
      "important-links",
      "news-updates",
    ],
    basicUser: [

      "property-valuation",
      "valuation-calculator",
      "stamp-duty-calculator",
      "zonal-value-database",
      "certified-copies",
      "workflow-dept",

      "landing",
      "upcoming-initiatives",
      "important-links",
      "news-updates",
    ],
    guest: ["landing"],
  };

  const getAllowedTabs = () => {
    if (isAdmin) return roleAccessMap.admin;
    if (isDepartmentUser) return roleAccessMap.department;
    if (isNormalUser || userRole === null) return roleAccessMap.basicUser; // guests get basic access
    return ["landing"];
  };

  // ✅ Secure tab change handler
  const handleTabChange = (value: string) => {
    console.log("handleTabChange called with value:", value); // Add this line
    const allowedTabs = getAllowedTabs();
    if (!allowedTabs.includes(value)) {
      console.warn(`Access denied: Role "${userRole}" cannot access tab "${value}"`);
      setActiveTab("unauthorized");
      return;
    }
    setActiveTab(value);

    // Reset state when leaving calculator
    if (value !== "valuation-calculator" && value !== "stamp-duty-calculator") {
      setInitialLocationData(null);
      setPrefilledStampDuty(null);
      window.history.pushState({}, '', '/');
    }
  };

  const handleNavigateToSection = (section: string) => {
    handleTabChange(section); // Reuse secure handler
  };

  const handleGetStarted = () => handleTabChange("property-valuation");

  useEffect(() => {
    const state = location.state as { tab?: string; initialMarketValue?: number; initialLocationData?: any };
    let targetTab = activeTab;

    console.log("Index useEffect(location.state):", state);

    if (state?.tab) {
      targetTab = state.tab;
    } else if (state?.initialMarketValue) {
      setPrefilledStampDuty({ marketValue: state.initialMarketValue });
      targetTab = "stamp-duty-calculator";
    } else if (state?.initialLocationData) {
      setInitialLocationData(state.initialLocationData);
      targetTab = "valuation-calculator";
    }

    if (targetTab !== activeTab) {
      handleTabChange(targetTab);
    }
  }, [location.state, navigate, location.pathname, activeTab]);

  const handleTabNavigation = (event: CustomEvent) => {
    const { tab, locationData, initialMarketValue } = event.detail as { tab?: string; locationData?: any; initialMarketValue?: number };
    let targetTab = activeTab; // Start with current active tab

    console.log('handleTabNavigation:', { tab, initialMarketValue, locationData });

    if (tab) {
      targetTab = tab;
    }
    
    if (typeof initialMarketValue === 'number') {
      console.log('Setting prefilledStampDuty with marketValue:', initialMarketValue);
      setPrefilledStampDuty({ marketValue: initialMarketValue });
      if (!tab) {
        targetTab = 'stamp-duty-calculator';
      }
    }

    if (locationData) {
      setInitialLocationData(locationData);
      // If locationData is present, and no specific tab was requested, default to valuation-calculator
      if (!tab && !initialMarketValue) {
        targetTab = 'valuation-calculator';
      }
    }

    if (targetTab !== activeTab) {
      handleTabChange(targetTab);
    }
  };

  const searchParams = new URLSearchParams(location.search);

  useEffect(() => {
    const initialTab = searchParams.get('tab');
    if (initialTab && getAllowedTabs().includes(initialTab)) {
      handleTabChange(initialTab);
    } else if (initialTab) {
      handleTabChange(initialTab);
    }

    // Handle deep link with location
    const districtCode = searchParams.get('district');
    const circleCode = searchParams.get('circle');
    const mouzaCode = searchParams.get('mouza');

    if (districtCode && circleCode) {
      const fetchLocationNames = async () => {
        const allDistricts = await getAllDistricts();
        const district = allDistricts.find(d => d.code === districtCode);
        let circle = undefined;
        let mouza = undefined;

        if (district) {
          const allCircles = await getCirclesByDistrict(districtCode);
          circle = allCircles.find(c => c.code === circleCode);

          if (circle && mouzaCode) {
            const allMouzas = await getMouzasByDistrictAndCircle(districtCode, circleCode);
            mouza = allMouzas.find(m => m.code === mouzaCode);
          }
        }

        const locationData = {
          district: district ? { code: district.code, name: district.name } : undefined,
          circle: circle ? { code: circle.code, name: circle.name } : undefined,
          village: mouza ? { code: mouza.code, name: mouza.name } : undefined, // Use mouza name here
          mouza: mouza ? { code: mouza.code, name: mouza.name } : undefined, // Also pass mouza object
        };
        // Trigger secure navigation
        window.dispatchEvent(
          new CustomEvent('navigate-to-tab', {
            detail: { tab: 'valuation-calculator', locationData },
          })
        );
      };
      fetchLocationNames();
    } else if (initialTab) {
      handleTabChange(initialTab);
    }

    window.addEventListener("navigate-to-tab", handleTabNavigation as EventListener);
    return () => window.removeEventListener("navigate-to-tab", handleTabNavigation as EventListener);
  }, [userRole, location.search]);

  // ✅ Render Unauthorized Tab
  const renderUnauthorized = () => (
    <div className="flex flex-col items-center justify-center py-12 bg-white rounded-lg shadow-sm border border-red-200">
      <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
      <h2 className="text-xl font-bold text-red-600 mb-2">Access Denied</h2>
      <p className="text-gray-600 text-center max-w-md">
        Your role <strong>({userRole || 'Guest'})</strong> does not have permission to access this section.
      </p>
      <button
        onClick={() => setActiveTab("landing")}
        className="mt-4 px-4 py-2 bg-assam-blue text-white rounded-md hover:bg-blue-700 transition"
      >
        Return to Home
      </button>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-white to-maroon-50">
      <Helmet>
        <title>Assam Land Value & Stamp Duty Calculator | Official Portal</title>
        <meta name="description" content="Calculate property valuation and stamp duty for Assam. Access zonal values, zonal database, and digital land records." />
        <link rel="canonical" href="/" />
      </Helmet>

      <Header />
      <main className="flex-1 container mx-auto px-4 py-6 animate-fade-in">
        <RoleSwitcher />

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          {/* Tab List */}
          <TabsList className="flex flex-nowrap gap-x-2 mb-8 rounded-xl p-2 justify-start overflow-x-auto sm:overflow-x-visible bg-white/80 backdrop-blur-sm shadow-lg border border-gray-200">
            {/* Common Tabs */}
            <TabsTrigger
              value="property-valuation"
              className={`flex items-center gap-2 flex-shrink-0 truncate whitespace-nowrap rounded-lg px-4 py-2.5 font-medium transition-all duration-300 ${
                activeTab === 'property-valuation'
                  ? 'bg-maroon-700 text-white shadow-md scale-105'
                  : 'bg-transparent text-gray-700 hover:bg-maroon-50'
              }`}
            >
              <Building className="h-4 w-4" /> <span>Map</span>
            </TabsTrigger>

            <TabsTrigger
              value="valuation-calculator"
              className={`flex items-center gap-2 flex-shrink-0 truncate whitespace-nowrap rounded-lg px-4 py-2.5 font-medium transition-all duration-300 ${
                activeTab === 'valuation-calculator'
                  ? 'bg-maroon-700 text-white shadow-md scale-105'
                  : 'bg-transparent text-gray-700 hover:bg-maroon-50'
              }`}
            >
              <Calculator className="h-4 w-4" /> <span>Property Valuation</span>
            </TabsTrigger>

            <TabsTrigger
              value="stamp-duty-calculator"
              className={`flex items-center gap-2 flex-shrink-0 truncate whitespace-nowrap rounded-lg px-4 py-2.5 font-medium transition-all duration-300 ${
                activeTab === 'stamp-duty-calculator'
                  ? 'bg-maroon-700 text-white shadow-md scale-105'
                  : 'bg-transparent text-gray-700 hover:bg-maroon-50'
              }`}
            >
              <Calculator className="h-4 w-4" /> <span>Stamp Duty</span>
            </TabsTrigger>

            <TabsTrigger
              value="zonal-value-database"
              className={`flex items-center gap-2 flex-shrink-0 truncate whitespace-nowrap rounded-lg px-4 py-2.5 font-medium transition-all duration-300 ${
                activeTab === 'zonal-value-database'
                  ? 'bg-maroon-700 text-white shadow-md scale-105'
                  : 'bg-transparent text-gray-700 hover:bg-maroon-50'
              }`}
            >
              <Database className="h-4 w-4" /> <span>Zonal Values</span>
            </TabsTrigger>

            <TabsTrigger
              value="certified-copies"
              className={`flex items-center gap-2 flex-shrink-0 truncate whitespace-nowrap rounded-lg px-4 py-2.5 font-medium transition-all duration-300 ${
                activeTab === 'certified-copies'
                  ? 'bg-maroon-700 text-white shadow-md scale-105'
                  : 'bg-transparent text-gray-700 hover:bg-maroon-50'
              }`}
            >
              <Database className="h-4 w-4" /> <span>Certified Copies</span>
            </TabsTrigger>

            {/* Department Tabs */}
            {isDepartmentUser && (
              <>
                <TabsTrigger
                  value="department-dashboard"
                  className={`flex items-center gap-2 flex-shrink-0 truncate whitespace-nowrap rounded-lg px-4 py-2.5 font-medium transition-all duration-300 ${
                    activeTab === 'department-dashboard'
                      ? 'bg-maroon-700 text-white shadow-md scale-105'
                      : 'bg-transparent text-gray-700 hover:bg-maroon-50'
                  }`}
                >
                  <Database className="h-4 w-4" /> <span>Department Dashboard</span>
                </TabsTrigger>
                <TabsTrigger
                  value="workflow-dept"
                  className={`flex items-center gap-2 flex-shrink-0 truncate whitespace-nowrap rounded-lg px-4 py-2.5 font-medium transition-all duration-300 ${
                    activeTab === 'workflow-dept'
                      ? 'bg-maroon-700 text-white shadow-md scale-105'
                      : 'bg-transparent text-gray-700 hover:bg-maroon-50'
                  }`}
                >
                  <ChartBar className="h-4 w-4" /> <span>Workflow</span>
                </TabsTrigger>
              </>
            )}

            {/* Admin Tabs */}
            {isAdmin && (
              <>
                <TabsTrigger
                  value="master-data"
                  className={`flex items-center gap-2 flex-shrink-0 truncate whitespace-nowrap rounded-lg px-4 py-2.5 font-medium transition-all duration-300 ${
                    activeTab === 'master-data'
                      ? 'bg-maroon-700 text-white shadow-md scale-105'
                      : 'bg-transparent text-gray-700 hover:bg-maroon-50'
                  }`}
                >
                  <Database className="h-4 w-4" /> <span>Master Data</span>
                </TabsTrigger>
                <TabsTrigger
                  value="reports"
                  className={`flex items-center gap-2 flex-shrink-0 truncate whitespace-nowrap rounded-lg px-4 py-2.5 font-medium transition-all duration-300 ${
                    activeTab === 'reports'
                      ? 'bg-maroon-700 text-white shadow-md scale-105'
                      : 'bg-transparent text-gray-700 hover:bg-maroon-50'
                  }`}
                >
                  <ChartBar className="h-4 w-4" /> <span>Reports</span>
                </TabsTrigger>
                <TabsTrigger
                  value="workflow"
                  className={`flex items-center gap-2 flex-shrink-0 truncate whitespace-nowrap rounded-lg px-4 py-2.5 font-medium transition-all duration-300 ${
                    activeTab === 'workflow'
                      ? 'bg-maroon-700 text-white shadow-md scale-105'
                      : 'bg-transparent text-gray-700 hover:bg-maroon-50'
                  }`}
                >
                  <ChartBar className="h-4 w-4" /> <span>Workflow</span>
                </TabsTrigger>
                <TabsTrigger
                  value="user-management"
                  className={`flex items-center gap-2 flex-shrink-0 truncate whitespace-nowrap rounded-lg px-4 py-2.5 font-medium transition-all duration-300 ${
                    activeTab === 'user-management'
                      ? 'bg-maroon-700 text-white shadow-md scale-105'
                      : 'bg-transparent text-gray-700 hover:bg-maroon-50'
                  }`}
                >
                  <span>User Management</span>
                </TabsTrigger>
              </>
            )}
          </TabsList>

          {/* Tab Contents */}
          <TabsContent value="landing" className="space-y-4 animate-fade-in">
            <LandingPage onGetStarted={handleGetStarted} onNavigateToSection={handleNavigateToSection} />
          </TabsContent>

          <TabsContent value="property-valuation" className="space-y-4 animate-fade-in">
            <PropertyValuationUI />
          </TabsContent>

          <TabsContent value="valuation-calculator" className="space-y-4 animate-fade-in">
            <ValuationCalculator initialLocationData={initialLocationData} />
          </TabsContent>

          <TabsContent value="stamp-duty-calculator" className="space-y-4 animate-fade-in">
            <StampDutyForm 
              key={prefilledStampDuty?.marketValue || 'stamp-duty'} 
              initialMarketValue={prefilledStampDuty?.marketValue} 
              initialLocationData={initialLocationData} 
            />
          </TabsContent>

          <TabsContent value="zonal-value-database" className="space-y-4 animate-fade-in">
            <ZonalView />
          </TabsContent>

          <TabsContent value="certified-copies" className="space-y-4 animate-fade-in">
            <CertifiedCopiesServices />
          </TabsContent>
          

          <TabsContent value="upcoming-initiatives" className="space-y-4">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-bold text-maroon-700 mb-4">Upcoming Initiatives</h2>
              <p className="text-gray-700">Details about upcoming initiatives will be displayed here.</p>
            </div>
          </TabsContent>

          <TabsContent value="important-links" className="space-y-4">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-bold text-maroon-700 mb-4">Important Links</h2>
              <p className="text-gray-700">A collection of important links will be displayed here.</p>
            </div>
          </TabsContent>

          <TabsContent value="news-updates" className="space-y-4">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-bold text-maroon-700 mb-4">News & Updates</h2>
              <p className="text-gray-700">The latest news and updates will be displayed here.</p>
            </div>
          </TabsContent>

          {isDepartmentUser && (
            <>
              <TabsContent value="department-dashboard" className="space-y-4">
                <DepartmentDashboard />
              </TabsContent>
              <TabsContent value="workflow-dept" className="space-y-4">
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
                <DepartmentWorkflowDashboard />
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

          {/* Unauthorized Tab */}
          <TabsContent value="unauthorized" className="space-y-4">
            {renderUnauthorized()}
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
