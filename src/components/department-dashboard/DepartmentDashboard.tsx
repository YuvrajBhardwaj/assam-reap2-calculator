import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import {
  CheckCircle,
  BarChart3,
  Building,
  FileText,
  Users,
  TrendingUp,
  Search,
  Download,
  Eye,
  Clock,
  AlertCircle,
  Settings,
  Database,
  PieChart,
  DollarSign,
  MapPin,
  Calendar,
  ChevronDown,
  Languages,
  RefreshCw,
  Plus,
  Send,
  X,
  Check,
  Layers,
  Home
} from 'lucide-react';
import MasterDataManagement from './department-workflow/MasterDataManagement';
import { MasterDataChangeRequest } from '@/types/masterData';
import MainModuleSelector from './dashboard-components/MainModuleSelector';
import SubModuleSelector from './dashboard-components/SubModuleSelector';
import AnalyticsModuleSelector from './dashboard-components/AnalyticsModuleSelector';
import DashboardTypeSelector from './dashboard-components/DashboardTypeSelector';

interface RequestData {
  id: number;
  particulars: string;
  dateOfRequest: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Under Review';
  requestStartDate: string;
  daysPending: number;
  action?: string;
}

interface DepartmentStats {
  slNo: number;
  departmentName: string;
  applicationsReceived: number;
  applicationsProcessed: number;
  averageApprovalDays: number;
  medianApprovalDays: number;
}

// Method: DepartmentDashboard component
export default function DepartmentDashboard() {
  const { userRole } = useAuth();
  const { toast } = useToast();
  const [activeMainTab, setActiveMainTab] = useState<'approvals' | 'master-data' | 'analytics' | 'property'>('master-data');
  const [activeSubTab, setActiveSubTab] = useState('requestor');
  const [analyticsView, setAnalyticsView] = useState('reports');
  const [selectedFilter, setSelectedFilter] = useState('for-action');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentLanguage, setCurrentLanguage] = useState('english');
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [showReportPopup, setShowReportPopup] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState('');
  const [showNewRequestDialog, setShowNewRequestDialog] = useState(false);
  const [showActionDialog, setShowActionDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<RequestData | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'send-back' | 'reject'>('approve');
  const [actionReason, setActionReason] = useState('');

  // Master Data Change Request states
  const [selectedMasterDataEntity, setSelectedMasterDataEntity] = useState('Districts');
  const [showMasterDataRequestDialog, setShowMasterDataRequestDialog] = useState(false);
  const [selectedMasterDataRequest, setSelectedMasterDataRequest] = useState<MasterDataChangeRequest | null>(null);
  const [masterDataRequestType, setMasterDataRequestType] = useState<'create' | 'update' | 'deactivate'>('create');
  const [masterDataRequestReason, setMasterDataRequestReason] = useState('');
  const [masterDataChangeRequests, setMasterDataChangeRequests] = useState<MasterDataChangeRequest[]>([
    {
      id: 1,
      entityType: 'Districts',
      operation: 'create',
      requestedBy: 'Junior Manager',
      requestDate: '2024-01-01',
      status: 'Pending',
      currentApprover: 'Manager',
      approvalLevel: 1,
      reason: 'New district creation',
      payload: { name: 'New District', code: 'ND' },
      daysPending: 5,
    },
    {
      id: 2,
      entityType: 'Circles',
      operation: 'update',
      requestedBy: 'Manager',
      requestDate: '2024-01-05',
      status: 'Under Review',
      currentApprover: 'Senior Manager',
      approvalLevel: 2,
      reason: 'Update circle boundary',
      payload: { id: 'C1', newBoundary: '...' },
      daysPending: 3,
    },
    {
      id: 3,
      entityType: 'Villages',
      operation: 'deactivate',
      requestedBy: 'Senior Manager',
      requestDate: '2024-01-08',
      status: 'Approved',
      currentApprover: 'Role Admin',
      approvalLevel: 3,
      reason: 'Village merged',
      payload: { id: 'V1' },
      daysPending: 1,
    },
  ]);

  // Mock data for requests
  const requestsData: RequestData[] = [
    {
      id: 1,
      particulars: "Property Valuation Request - Plot 123, Guwahati",
      dateOfRequest: "2024-01-15",
      status: "Pending",
      requestStartDate: "2024-01-15",
      daysPending: 5
    },
    {
      id: 2,
      particulars: "Land Registration - Agricultural Land, Jorhat",
      dateOfRequest: "2024-01-14",
      status: "Under Review",
      requestStartDate: "2024-01-14",
      daysPending: 6
    },
    {
      id: 3,
      particulars: "Building Permit - Commercial Complex, Dibrugarh",
      dateOfRequest: "2024-01-13",
      status: "Approved",
      requestStartDate: "2024-01-13",
      daysPending: 7
    },
    {
      id: 4,
      particulars: "Stamp Duty Calculation - Residential Plot, Silchar",
      dateOfRequest: "2024-01-12",
      status: "Pending",
      requestStartDate: "2024-01-12",
      daysPending: 8
    },
    {
      id: 5,
      particulars: "Certified Copy Request - Land Record, Tezpur",
      dateOfRequest: "2024-01-11",
      status: "Under Review",
      requestStartDate: "2024-01-11",
      daysPending: 9
    }
  ];

  // Mock data for department statistics
  const departmentStats: DepartmentStats[] = [
    {
      slNo: 1,
      departmentName: "Administrative Reforms and Training",
      applicationsReceived: 44473,
      applicationsProcessed: 34294,
      averageApprovalDays: 45,
      medianApprovalDays: 25
    },
    {
      slNo: 2,
      departmentName: "Revenue and Disaster Management Department",
      applicationsReceived: 21296,
      applicationsProcessed: 18900,
      averageApprovalDays: 95,
      medianApprovalDays: 58
    },
    {
      slNo: 3,
      departmentName: "Tribal Affairs (Plain)",
      applicationsReceived: 13378,
      applicationsProcessed: 11795,
      averageApprovalDays: 34,
      medianApprovalDays: 27
    }
  ];

  const handleStartNewRequest = () => {
    setShowNewRequestDialog(true);
  };

  const handleCreateNewRequest = () => {
    toast({
      title: "New Request Created",
      description: "Your request has been submitted successfully.",
    });
    setShowNewRequestDialog(false);
  };

  const handleActionSelect = (request: RequestData, action: 'approve' | 'send-back' | 'reject') => {
    setSelectedRequest(request);
    setActionType(action);
    setShowActionDialog(true);
  };

  const handleConfirmAction = () => {
    if (!selectedRequest) return;
    const actionMap = {
      approve: 'Approved',
      'send-back': 'Under Review',
      reject: 'Rejected'
    };
    // Update request status
    const updatedRequests = requestsData.map(req =>
      req.id === selectedRequest.id
        ? { ...req, status: actionMap[actionType] as any }
        : req
    );
    toast({
      title: `Request ${actionType === 'send-back' ? 'Sent Back' : actionType.charAt(0).toUpperCase() + actionType.slice(1)}d`,
      description: `Request #${selectedRequest.id} has been ${actionType === 'send-back' ? 'sent back for revision' : actionType + 'd'}.`,
    });
    setShowActionDialog(false);
    setSelectedRequest(null);
    setActionReason('');
  };

  const handleMasterDataChangeRequest = (entityType: string, operation: 'create' | 'update' | 'deactivate', payload: any, reason: string) => {
    const newRequest: MasterDataChangeRequest = {
      id: masterDataChangeRequests.length + 1,
      entityType: entityType as any,
      operation,
      requestedBy: userRole || 'Junior Manager',
      requestDate: new Date().toISOString().split('T')[0],
      enteredBy: userRole || 'Junior Manager',
      entryDate: new Date().toISOString(),
      status: 'Pending',
      currentApprover: 'Junior Manager',
      approvalLevel: 1,
      reason,
      payload,
      daysPending: 0
    };
    setMasterDataChangeRequests(prev => [...prev, newRequest]);
    toast({
      title: "Master Data Change Request Submitted",
      description: `Your ${operation} request for ${entityType} has been submitted for approval.`,
    });
    setShowMasterDataRequestDialog(false);
    setMasterDataRequestReason('');
  };

  const handleMasterDataActionSelect = (request: MasterDataChangeRequest, type: 'approve' | 'send-back' | 'reject') => {
    setSelectedMasterDataRequest(request);
    setActionType(type);
    setShowActionDialog(true);
  };

  const handleConfirmMasterDataAction = () => {
    if (!selectedMasterDataRequest) return;

    const updatedRequests = masterDataChangeRequests.map((req) => {
      if (req.id === selectedMasterDataRequest.id) {
        let newStatus = req.status;
        let newApprover = req.currentApprover;
        let newApprovalLevel = req.approvalLevel;
        const updatedFields: Partial<MasterDataChangeRequest> = {
          modifiedBy: userRole,
          modifiedDate: new Date().toISOString(),
        };

        if (actionType === 'approve') {
          if (req.approvalLevel === 1 && userRole === 'ROLE_JuniorManager') {
            newApprover = 'Manager';
            newApprovalLevel = 2;
            newStatus = 'Under Review';
          } else if (req.approvalLevel === 2 && userRole === 'ROLE_Manager') {
            newApprover = 'Senior Manager';
            newApprovalLevel = 3;
            newStatus = 'Under Review';
          } else if (req.approvalLevel === 3 && userRole === 'ROLE_SeniorManager') {
            newApprover = 'Role Admin';
            newApprovalLevel = 4;
            newStatus = 'Under Review';
          } else if (req.approvalLevel === 4 && userRole === 'ROLE_ADMIN') {
            newStatus = 'Approved';
            newApprover = 'N/A';
            updatedFields.approvedBy = userRole;
            updatedFields.approvedDate = new Date().toISOString();
          } else {
            // If the current user is not the expected approver for the current level
            toast({
              title: "Action Not Allowed",
              description: "You are not authorized to approve at this stage.",
              variant: "destructive",
            });
            return req; // Return original request if not authorized
          }
          toast({
            title: "Request Approved",
            description: `Request ${req.id} has been approved and moved to the next stage.`,
          });
        } else if (actionType === 'send-back') {
          newStatus = 'Pending';
          newApprover = 'N/A'; // Changed from 'Requestor' to 'N/A' to match type
          newApprovalLevel = 0; // Reset approval level
          toast({
            title: "Request Sent Back",
            description: `Request ${req.id} has been sent back for revisions.`,
          });
        } else if (actionType === 'reject') {
          newStatus = 'Rejected';
          newApprover = 'N/A';
          newApprovalLevel = -1; // Indicate rejection
          toast({
            title: "Request Rejected",
            description: `Request ${req.id} has been rejected.`,
          });
        }

        return { ...req, ...updatedFields, status: newStatus, currentApprover: newApprover, approvalLevel: newApprovalLevel };
      }
      return req;
    });

    setMasterDataChangeRequests(updatedRequests);
    setShowActionDialog(false);
    setActionReason('');
  };

  const handleRefreshData = () => {
    setIsDataLoading(true);
    setTimeout(() => {
      setIsDataLoading(false);
    }, 3000);
  };

  const handleCardClick = (reportType: string) => {
    setSelectedReportType(reportType);
    setShowReportPopup(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return 'bg-green-100 text-green-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      case 'Under Review': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const subModules = [
    { id: 'dashboards', label: 'Dashboards', color: 'bg-teal-500' },
    { id: 'databases', label: 'Databases', color: 'bg-teal-500' }
  ];



  const reportCategories = [
    { id: 'revenue', label: 'Revenue Collection', icon: DollarSign },
    { id: 'documents', label: 'Documents registered', icon: FileText },
    { id: 'category1', label: 'XX', icon: Users },
    { id: 'category2', label: 'XX', icon: TrendingUp },
    { id: 'category3', label: 'XX', icon: Settings },
    { id: 'category4', label: 'XX', icon: Database },
    { id: 'category5', label: 'XX', icon: PieChart },
    { id: 'category6', label: 'XX', icon: MapPin },
    { id: 'category7', label: 'XX', icon: Calendar },
    { id: 'category8', label: 'XX', icon: Building }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Main Module Selection */}
        <MainModuleSelector activeMainTab={activeMainTab} setActiveMainTab={setActiveMainTab} />
      </div>

      {/* Approvals Module */}
      {activeMainTab === 'approvals' && (
        <div className="space-y-6">
          <SubModuleSelector activeSubTab={activeSubTab} onSubTabChange={setActiveSubTab} />
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Requests</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex space-x-2">
                  {activeSubTab === 'requestor' && (
                    <Button
                      variant={selectedFilter === 'all' ? 'default' : 'outline'}
                      size="sm"
                      className={selectedFilter === 'all' ? 'bg-teal-500 text-white' : ''}
                      onClick={() => setSelectedFilter('all')}
                    >
                      View All Requests
                    </Button>
                  )}
                  {activeSubTab === 'approver' && (
                    <>
                      <Button
                        variant={selectedFilter === 'for-action' ? 'default' : 'outline'}
                        size="sm"
                        className={selectedFilter === 'for-action' ? 'bg-teal-500 text-white' : ''}
                        onClick={() => setSelectedFilter('for-action')}
                      >
                        For Your Action
                      </Button>
                      <Button
                        variant={selectedFilter === 'actioned' ? 'default' : 'outline'}
                        size="sm"
                        className={selectedFilter === 'actioned' ? 'bg-teal-500 text-white' : ''}
                        onClick={() => setSelectedFilter('actioned')}
                      >
                        Actioned
                      </Button>
                    </>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleStartNewRequest}
                    className="flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Start New Request
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sl no.</TableHead>
                    <TableHead>Particulars</TableHead>
                    <TableHead>Date of Request</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Request Start date</TableHead>
                    <TableHead>No. of days pending</TableHead>
                    {activeSubTab === 'approver' && <TableHead>Action</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requestsData.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>{request.id}</TableCell>
                      <TableCell>{request.particulars}</TableCell>
                      <TableCell>{request.dateOfRequest}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(request.status)}>
                          {request.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{request.requestStartDate}</TableCell>
                      <TableCell>{request.daysPending}</TableCell>
                      {activeSubTab === 'approver' && (
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="default"
                              className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 text-xs"
                              onClick={() => handleActionSelect(request, 'approve')}
                            >
                              <Check className="w-3 h-3 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-orange-500 text-orange-600 hover:bg-orange-50 px-2 py-1 text-xs"
                              onClick={() => handleActionSelect(request, 'send-back')}
                            >
                              <Send className="w-3 h-3 mr-1" />
                              Send Back
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="px-2 py-1 text-xs"
                              onClick={() => handleActionSelect(request, 'reject')}
                            >
                              <X className="w-3 h-3 mr-1" />
                              Reject
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                  {!requestsData.length && (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        No requests found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Master Data Management Module */}
      {activeMainTab === 'master-data' && (
        <MasterDataManagement
          userRole={userRole}
          toast={toast}
          selectedMasterDataEntity={selectedMasterDataEntity}
          setSelectedMasterDataEntity={setSelectedMasterDataEntity}
          showMasterDataRequestDialog={showMasterDataRequestDialog}
          setShowMasterDataRequestDialog={setShowMasterDataRequestDialog}
          selectedMasterDataRequest={selectedMasterDataRequest}
          setSelectedMasterDataRequest={setSelectedMasterDataRequest}
          masterDataRequestType={masterDataRequestType}
          setMasterDataRequestType={setMasterDataRequestType}
          masterDataRequestReason={masterDataRequestReason}
          setMasterDataRequestReason={setMasterDataRequestReason}
          masterDataChangeRequests={masterDataChangeRequests}
          handleMasterDataChangeRequest={handleMasterDataChangeRequest}
          handleMasterDataActionSelect={handleMasterDataActionSelect}
          handleConfirmMasterDataAction={handleConfirmMasterDataAction}
          handleRefreshData={handleRefreshData}
          getStatusColor={getStatusColor}
          actionType={actionType}
          setShowActionDialog={setShowActionDialog}
          setActionReason={setActionReason}
        />
      )}

      {/* Analytics Module */}
      {activeMainTab === 'analytics' && (
        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="w-64 bg-white rounded-lg shadow-sm p-4">
            <div className="bg-teal-600 text-white p-3 rounded-lg mb-4">
              <h2 className="text-lg font-medium">Analytics</h2>
            </div>
            <div className="space-y-2">
              <Select value={analyticsView} onValueChange={setAnalyticsView}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="reports">Reports</SelectItem>
                  <SelectItem value="dashboards">Dashboards</SelectItem>
                  <SelectItem value="databases">Databases</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 mt-4">
              <div
                className={`p-3 rounded cursor-pointer transition-colors ${analyticsView === 'reports' ? 'bg-teal-100 text-teal-800' : 'hover:bg-gray-100'}`}
                onClick={() => setAnalyticsView('reports')}
              >
                Reports
              </div>
              <div
                className={`p-3 rounded cursor-pointer transition-colors ${analyticsView === 'dashboards' ? 'bg-teal-100 text-teal-800' : 'hover:bg-gray-100'}`}
                onClick={() => setAnalyticsView('dashboards')}
              >
                Dashboards
              </div>
              <div
                className={`p-3 rounded cursor-pointer transition-colors ${analyticsView === 'databases' ? 'bg-teal-100 text-teal-800' : 'hover:bg-gray-100'}`}
                onClick={() => setAnalyticsView('databases')}
              >
                Databases
              </div>
            </div>
            <div className="mt-6 p-3 bg-red-700 text-white rounded-lg">
              <div className="text-sm font-medium">Links to download database</div>
            </div>
          </div>
          {/* Main Content */}
          <div className="flex-1">
            {analyticsView === 'reports' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-4">
                    <h3 className="text-lg font-semibold text-gray-900">Land Records Database</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRefreshData}
                      disabled={isDataLoading}
                      className="flex items-center gap-2"
                    >
                      <RefreshCw className={`w-4 h-4 ${isDataLoading ? 'animate-spin' : ''}`} />
                      {isDataLoading ? 'Loading...' : 'Refresh Data'}
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Languages className="w-5 h-5 text-gray-600" />
                    <Select value={currentLanguage} onValueChange={setCurrentLanguage}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="english">English</SelectItem>
                        <SelectItem value="assamese">সমীয়া</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Card>
                  <CardContent className="p-6">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>{currentLanguage === 'english' ? 'District' : 'জিলা'}</TableHead>
                            <TableHead>{currentLanguage === 'english' ? 'Sub Division' : 'উপ-বিভাগ'}</TableHead>
                            <TableHead>{currentLanguage === 'english' ? 'Circle' : 'চক্ৰ'}</TableHead>
                            <TableHead>{currentLanguage === 'english' ? 'Mouza' : 'মৌজা'}</TableHead>
                            <TableHead>{currentLanguage === 'english' ? 'Lot' : 'লট'}</TableHead>
                            <TableHead>{currentLanguage === 'english' ? 'Village' : 'গাঁও'}</TableHead>
                            <TableHead>{currentLanguage === 'english' ? 'LGD Code' : 'এলজিডি কোড'}</TableHead>
                            <TableHead>{currentLanguage === 'english' ? 'Total Area' : 'মুঠ এলেকা'}</TableHead>
                            <TableHead>{currentLanguage === 'english' ? 'Total Area (sq km)' : 'মুঠ এলেকা (বৰ্গ কি.মি.)'}</TableHead>
                            <TableHead>{currentLanguage === 'english' ? 'Dag Count' : 'দাগ সংখ্যা'}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell>শিৱসাগৰ</TableCell>
                            <TableCell>কলিয়াবৰ</TableCell>
                            <TableCell>কলিয়াবৰ</TableCell>
                            <TableCell>কুলবারাকুল</TableCell>
                            <TableCell>নং-০৭</TableCell>
                            <TableCell>বগবারা</TableCell>
                            <TableCell>2 B - 15 K - 0 C - 0.00 G</TableCell>
                            <TableCell>0.0037</TableCell>
                            <TableCell>1</TableCell>
                          </TableRow>
                          {/* Add more rows as needed */}
                        </TableBody>
                      </Table>
                    </div>
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm">
                        {currentLanguage === 'english'
                          ? 'For each type of analytics, district-wise data would be visible in a table. If you click the district name then SRO wise data should be available'
                          : 'প্রতিটো বিশ্লেষণৰ বাবে, জিলাভিত্তিক তথ্য এখন তালিকাত দৃশ্যমান হ\'ব। যদি আপুনি জিলাৰ নামত ক্লিক কৰে তেন্তে SRO ভিত্তিক তথ্য উপলব্ধ হ\'ব'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {analyticsView === 'dashboards' && (
              <DashboardTypeSelector handleCardClick={handleCardClick} />
            )}

            {analyticsView === 'databases' && (
              <div className="space-y-4">
                {/* Databases content */}
                <div className="space-y-3">
                  {Array.from({ length: 9 }).map((_, index) => (
                    <div key={index} className="flex items-center gap-4 p-3 bg-white rounded-lg shadow-sm">
                      <FileText className="w-6 h-6 text-blue-600" />
                      <div className="flex-1 bg-orange-500 text-white px-4 py-2 rounded text-sm">
                        Transport Vehicle Online Sales Data {index === 0 ? '2014 to 24-10-2018' : '...'}
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="bg-orange-500 text-white hover:bg-orange-600">
                          <Eye className="w-4 h-4 mr-1" />
                          Preview
                        </Button>
                        <Button size="sm" variant="outline" className="bg-green-600 text-white hover:bg-green-700">
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Report Popup Dialog */}
            <Dialog open={showReportPopup} onOpenChange={setShowReportPopup}>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    Detailed Report - {selectedReportType}
                  </DialogTitle>
                </DialogHeader>
                <div className="p-6">
                  {/* Report content */}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      )}

      {/* Property Verification Module */}
      {activeMainTab === 'property' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building className="w-5 h-5 mr-2" />
                Property Verification
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                This module handles property verification requests and processes.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-gray-200 rounded-md p-4">
                  <h3 className="font-medium text-gray-900 mb-2">Verification Queue</h3>
                  <p className="text-sm text-gray-600 mb-3">Review pending property verification requests</p>
                  <Button size="sm">View Queue</Button>
                </div>
                <div className="border border-gray-200 rounded-md p-4">
                  <h3 className="font-medium text-gray-900 mb-2">Verification History</h3>
                  <p className="text-sm text-gray-600 mb-3">View completed verification records</p>
                  <Button size="sm" variant="outline">View History</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* New Request Dialog */}
      <Dialog open={showNewRequestDialog} onOpenChange={setShowNewRequestDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Start New Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Request Type</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select request type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="property-valuation">Property Valuation</SelectItem>
                  <SelectItem value="land-registration">Land Registration</SelectItem>
                  <SelectItem value="building-permit">Building Permit</SelectItem>
                  <SelectItem value="stamp-duty">Stamp Duty Calculation</SelectItem>
                  <SelectItem value="certified-copy">Certified Copy Request</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <Textarea placeholder="Enter request description..." />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowNewRequestDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateNewRequest} className="bg-teal-600 hover:bg-teal-700">
                Create Request
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Action Confirmation Dialog */}
      <Dialog open={showActionDialog} onOpenChange={setShowActionDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' && 'Approve Request'}
              {actionType === 'send-back' && 'Send Back Request'}
              {actionType === 'reject' && 'Reject Request'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedRequest && (
              <div className="p-3 bg-gray-50 rounded">
                <p className="text-sm font-medium">Request #{selectedRequest.id}</p>
                <p className="text-sm text-gray-600">{selectedRequest.particulars}</p>
              </div>
            )}
            {selectedMasterDataRequest && (
              <div className="p-3 bg-gray-50 rounded">
                <p className="text-sm font-medium">Master Data Request #{selectedMasterDataRequest.id}</p>
                <p className="text-sm text-gray-600">
                  {selectedMasterDataRequest.operation.toUpperCase()} - {selectedMasterDataRequest.entityType}
                </p>
                <p className="text-xs text-gray-500">Current Level: {selectedMasterDataRequest.approvalLevel}/4 - {selectedMasterDataRequest.currentApprover}</p>
              </div>
            )}
            {(actionType === 'send-back' || actionType === 'reject') && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  {actionType === 'send-back' ? 'Reason for sending back' : 'Reason for rejection'}
                </label>
                <Textarea
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  placeholder={`Enter reason for ${actionType === 'send-back' ? 'sending back' : 'rejecting'} this request...`}
                  required
                />
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowActionDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleConfirmAction}
                disabled={(actionType === 'send-back' || actionType === 'reject') && !actionReason.trim()}
                className={
                  actionType === 'approve'
                    ? 'bg-green-600 hover:bg-green-700'
                    : actionType === 'send-back'
                      ? 'bg-orange-600 hover:bg-orange-700'
                      : 'bg-red-600 hover:bg-red-700'
                }
              >
                {actionType === 'approve' && 'Approve'}
                {actionType === 'send-back' && 'Send Back'}
                {actionType === 'reject' && 'Reject'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Master Data Change Request Dialog */}
      <Dialog open={showMasterDataRequestDialog} onOpenChange={setShowMasterDataRequestDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Request Master Data Change</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Entity Type</label>
              <Select value={selectedMasterDataEntity} onValueChange={setSelectedMasterDataEntity}>
                <SelectTrigger>
                  <SelectValue placeholder="Select entity type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Districts">Districts</SelectItem>
                  <SelectItem value="Circles">Circles</SelectItem>
                  <SelectItem value="Mouzas">Mouzas</SelectItem>
                  <SelectItem value="Villages">Villages</SelectItem>
                  <SelectItem value="Lots">Lots</SelectItem>
                  <SelectItem value="Land Classes">Land Classes</SelectItem>
                  <SelectItem value="Area Types">Area Types</SelectItem>
                  <SelectItem value="SRO Hierarchy">SRO Hierarchy</SelectItem>
                  <SelectItem value="Parameters">Parameters</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Operation Type</label>
              <Select value={masterDataRequestType} onValueChange={(value: 'create' | 'update' | 'deactivate') => setMasterDataRequestType(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select operation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="create">Create New</SelectItem>
                  <SelectItem value="update">Update Existing</SelectItem>
                  <SelectItem value="delete">Delete</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Reason for Change</label>
              <Textarea
                value={masterDataRequestReason}
                onChange={(e) => setMasterDataRequestReason(e.target.value)}
                placeholder="Enter detailed reason for this master data change request..."
                required
              />
            </div>
            <div className="p-3 bg-blue-50 rounded text-sm">
              <p className="font-medium text-blue-800 mb-1">Approval Workflow:</p>
              <p className="text-blue-600">Junior Manager → Manager → Senior Manager → Role Admin</p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowMasterDataRequestDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => handleMasterDataChangeRequest(selectedMasterDataEntity, masterDataRequestType, {}, masterDataRequestReason)}
                disabled={!masterDataRequestReason.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Submit Request
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};