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
  Check
} from 'lucide-react';

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

const DepartmentDashboard = () => {
  const { userRole } = useAuth();
  const { toast } = useToast();
  const [activeMainTab, setActiveMainTab] = useState('approvals');
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

  const handleRefreshData = () => {
    setIsDataLoading(true);
    setTimeout(() => {
      setIsDataLoading(false);
      // Refresh data from API in real implementation
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

  const mainModules = [
    { id: 'approvals', label: 'Approvals', icon: CheckCircle, color: 'bg-teal-500' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, color: 'bg-gray-500' },
    { id: 'property', label: 'Property Verification', icon: Building, color: 'bg-gray-500' }
  ];

  const subModules = [
    { id: 'requestor', label: 'Requestor View', color: 'bg-teal-500' },
    { id: 'dashboard', label: 'Dashboard View', color: 'bg-gray-400' },
    { id: 'approver', label: 'Approver View', color: 'bg-gray-400' }
  ];

  const analyticsOptions = [
    { id: 'reports', label: 'Reports', color: 'bg-teal-500' },
    { id: 'dashboards', label: 'Dashboards', color: 'bg-teal-500' },
    { id: 'databases', label: 'Databases', color: 'bg-teal-500' }
  ];

  const dashboardTypes = [
    { id: 'service', label: 'SERVICE DASHBOARD', color: 'bg-purple-600' },
    { id: 'grievance', label: 'GRIEVANCE DASHBOARD', color: 'bg-green-600' },
    { id: 'appeal', label: 'APPEAL DASHBOARD', color: 'bg-purple-600' }
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
        <div className="mb-6">
          
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {mainModules.map((module) => (
              <Card 
                key={module.id}
                className={`cursor-pointer transition-all duration-200 ${
                  activeMainTab === module.id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => setActiveMainTab(module.id)}
              >
                <CardContent className="p-6">
                  <div className={`w-16 h-16 ${module.color} rounded-full flex items-center justify-center mb-4 mx-auto`}>
                    <module.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-center font-medium text-gray-900">{module.label}</h3>
                </CardContent>
              </Card>
            ))}
          </div>

         
        </div>

        {/* Sub Modules */}
        {activeMainTab === 'approvals' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {subModules.slice(0, 3).map((module) => (
                <Card 
                  key={module.id}
                  className={`cursor-pointer transition-all duration-200 ${
                    activeSubTab === module.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => setActiveSubTab(module.id)}
                >
                  <CardContent className="p-4">
                    <div className={`${module.color} text-white text-center py-3 rounded`}>
                      {module.label}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* No additional submodules row needed now */}
            {/* Requests Table */}
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
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
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
                  className={`p-3 rounded cursor-pointer transition-colors ${
                    analyticsView === 'reports' ? 'bg-teal-100 text-teal-800' : 'hover:bg-gray-100'
                  }`}
                  onClick={() => setAnalyticsView('reports')}
                >
                  Reports
                </div>
                <div 
                  className={`p-3 rounded cursor-pointer transition-colors ${
                    analyticsView === 'dashboards' ? 'bg-teal-100 text-teal-800' : 'hover:bg-gray-100'
                  }`}
                  onClick={() => setAnalyticsView('dashboards')}
                >
                  Dashboards
                </div>
                <div 
                  className={`p-3 rounded cursor-pointer transition-colors ${
                    analyticsView === 'databases' ? 'bg-teal-100 text-teal-800' : 'hover:bg-gray-100'
                  }`}
                  onClick={() => setAnalyticsView('databases')}
                >
                  Databases
                </div>
              </div>

              {/* Links to download database */}
              <div className="mt-6 p-3 bg-red-700 text-white rounded-lg">
                <div className="text-sm font-medium">Links to download database</div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              {/* Reports View - Now showing Databases content */}
              {analyticsView === 'reports' && (
                <div className="space-y-6">
                  {/* Language Toggle and Refresh Controls */}
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
                          <SelectItem value="assamese">অসমীয়া</SelectItem>
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
                              <TableCell>শিবসাগর</TableCell>
                              <TableCell>কলিয়াবর</TableCell>
                              <TableCell>কলিয়াবর</TableCell>
                              <TableCell>কুলবাৰাকুল</TableCell>
                              <TableCell>নং-০৭</TableCell>
                              <TableCell>বগবাৰা</TableCell>
                              <TableCell>2 B - 15 K - 0 C - 0.00 G</TableCell>
                              <TableCell>0.0037</TableCell>
                              <TableCell>1</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>শিবসাগর</TableCell>
                              <TableCell>কলিয়াবর</TableCell>
                              <TableCell>শিবসাগর</TableCell>
                              <TableCell>শকদমেট</TableCell>
                              <TableCell>নং-২২</TableCell>
                              <TableCell>বূৰ নেওপাই</TableCell>
                              <TableCell>2387 B - 15 K - 12 C - 0.00 G</TableCell>
                              <TableCell>3.1946</TableCell>
                              <TableCell>304</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>শিবসাগর</TableCell>
                              <TableCell>কলিয়াবর</TableCell>
                              <TableCell>কলিয়াবর</TableCell>
                              <TableCell>কিকিৰামুন্ডা</TableCell>
                              <TableCell>নং-০৩</TableCell>
                              <TableCell>মাইদাম গাত - ৩</TableCell>
                              <TableCell>1 B - 16 K - 5 C - 0.00 G</TableCell>
                              <TableCell>0.0024</TableCell>
                              <TableCell>3</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>শিবসাগর</TableCell>
                              <TableCell>কলিয়াবর</TableCell>
                              <TableCell>শিবসাগর</TableCell>
                              <TableCell>শকদমেট</TableCell>
                              <TableCell>নং-০৫</TableCell>
                              <TableCell>কমাইৰবন</TableCell>
                              <TableCell>7 B - 3 K - 13 C - 0.00 G</TableCell>
                              <TableCell>0.0096</TableCell>
                              <TableCell>9</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>শিবসাগর</TableCell>
                              <TableCell>কলিয়াবর</TableCell>
                              <TableCell>শিবসাগর</TableCell>
                              <TableCell>শকদমেট</TableCell>
                              <TableCell>নং-১৯</TableCell>
                              <TableCell>সিদিংজুৰী</TableCell>
                              <TableCell>3108 B - 0 K - 3 C - 0.00 G</TableCell>
                              <TableCell>4.1581</TableCell>
                              <TableCell>272</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>শিবসাগর</TableCell>
                              <TableCell>কলিয়াবর</TableCell>
                              <TableCell>কলিয়াবর</TableCell>
                              <TableCell>তোলাগাত</TableCell>
                              <TableCell>নং-১১</TableCell>
                              <TableCell>আবাসূত্র খেঁৰাত জুৰৰিণা তোলাগাত</TableCell>
                              <TableCell>18 B - 13 K - 14 C - 0.00 G</TableCell>
                              <TableCell>0.0250</TableCell>
                              <TableCell>24</TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm">
                          {currentLanguage === 'english' 
                            ? 'For each type of analytics, district-wise data would be visible in a table. If you click the district name then SRO wise data should be available'
                            : 'প্ৰতিটো বিশ্লেষণৰ বাবে, জিলাভিত্তিক তথ্য এখন তালিকাত দৃশ্যমান হ\'ব। যদি আপুনি জিলাৰ নামত ক্লিক কৰে তেন্তে SRO ভিত্তিক তথ্য উপলব্ধ হ\'ব'}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Dashboards View */}
              {analyticsView === 'dashboards' && (
                <div className="space-y-6">
                  {/* Dashboard Header */}
                  <div className="flex gap-4 mb-6">
                    <div className="bg-orange-500 text-white px-4 py-2 rounded text-sm">
                      {currentLanguage === 'english' ? 'NON-AGRICULTURE PROPERTIES' : 'অ-কৃষি সম্পত্তি'}
                    </div>
                    <div className="bg-orange-500 text-white px-4 py-2 rounded text-sm">
                      {currentLanguage === 'english' ? 'STATISTICS FOR FINANCIAL YEAR 2025-2026' : '২০২৫-২০২৬ বিত্তীয় বৰ্ষৰ পৰিসংখ্যা'}
                    </div>
                  </div>

                  {/* Statistics Cards */}
                  <div className="mb-6">
                    <div className="text-center text-blue-600 font-bold text-xl mb-4">
                      {currentLanguage === 'english' ? 'DASHBOARD STATISTICS FOR THE FINANCIAL YEAR 2025-2026' : '২০২৫-২০২৬ বিত্তীয় বৰ্ষৰ বাবে ডেশ্ববৰ্ড পৰিসংখ্যা'}
                    </div>
                    <div className="text-center text-gray-600 mb-6">
                      {currentLanguage === 'english' ? '(Non-Agriculture Properties)' : '(অ-কৃষি সম্পত্তি)'}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                      <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleCardClick('documents-registered')}>
                        <CardContent className="p-4 text-center">
                          <div className="w-full h-32 bg-green-500 rounded mb-2 flex items-center justify-center">
                            <BarChart3 className="w-16 h-16 text-white" />
                          </div>
                          <div className="text-sm text-gray-600 mb-2">{currentLanguage === 'english' ? 'Documents Registered' : 'পঞ্জীয়নভুক্ত নথি'}
</div>
                          <div className="text-2xl font-bold">182166</div>
                        </CardContent>
                      </Card>
                      
                      <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleCardClick('revenue-documents')}>
                        <CardContent className="p-4 text-center">
                          <div className="w-full h-32 bg-gray-400 rounded mb-2 flex items-center justify-center">
                            <PieChart className="w-16 h-16 text-white" />
                          </div>
                          <div className="text-sm text-gray-600 mb-2">{currentLanguage === 'english' ? 'Revenue On Registered Documents' : 'পঞ্জীয়নভুক্ত নথিপত্ৰৰ ৰাজহ'}
</div>
                          <div className="text-2xl font-bold">1909.111 (in crores)</div>
                        </CardContent>
                      </Card>
                      
                      <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleCardClick('estamps-revenue')}>
                        <CardContent className="p-4 text-center">
                          <div className="w-full h-32 bg-blue-500 rounded mb-2 flex items-center justify-center">
                            <BarChart3 className="w-16 h-16 text-white" />
                          </div>
                          <div className="text-sm text-gray-600 mb-2">{currentLanguage === 'english' ? 'eStamps Revenue' : 'ই-ষ্টাম্প ৰাজহ'}
</div>
                          <div className="text-2xl font-bold">2000.124 (in crores)</div>
                        </CardContent>
                      </Card>
                      
                      <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleCardClick('encumbrances')}>
                        <CardContent className="p-4 text-center">
                          <div className="w-full h-32 bg-green-500 rounded mb-2 flex items-center justify-center">
                            <BarChart3 className="w-16 h-16 text-white" />
                          </div>
                          <div className="text-sm text-gray-600 mb-2">{currentLanguage === 'english' ? 'Statement Of Encumbrances' : 'দায়বদ্ধতাৰ বিৱৰণ'}
</div>
                          <div className="text-2xl font-bold">12964</div>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleCardClick('public-data-entry')}>
                        <CardContent className="p-4 text-center">
                          <div className="w-full h-32 bg-gray-400 rounded mb-2 flex items-center justify-center">
                            <PieChart className="w-16 h-16 text-white" />
                          </div>
                          <div className="text-sm text-gray-600 mb-2">{currentLanguage === 'english' ? 'Public Data Entry' : 'ৰাজহুৱা তথ্য প্ৰৱশ'}
</div>
                          <div className="text-2xl font-bold">168023</div>
                        </CardContent>
                      </Card>
                      
                      <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleCardClick('slot-booking')}>
                        <CardContent className="p-4 text-center">
                          <div className="w-full h-32 bg-blue-500 rounded mb-2 flex items-center justify-center">
                            <BarChart3 className="w-16 h-16 text-white" />
                          </div>
                          <div className="text-sm text-gray-600 mb-2">{currentLanguage === 'english' ? 'Slot Booking' : 'শ্লট বুকিং'}
</div>
                          <div className="text-2xl font-bold">47504</div>
                        </CardContent>
                      </Card>
                      
                      <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleCardClick('hindu-marriage')}>
                        <CardContent className="p-4 text-center">
                          <div className="w-full h-32 bg-gray-400 rounded mb-2 flex items-center justify-center">
                            <PieChart className="w-16 h-16 text-white" />
                          </div>
                          <div className="text-sm text-gray-600 mb-2">{currentLanguage === 'english' ? 'Hindu Marriage' : 'হিন্দু বিবাহ'}
</div>
                          <div className="text-2xl font-bold">19390</div>
                        </CardContent>
                      </Card>
                      
                      <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleCardClick('t-app-folio')}>
                        <CardContent className="p-4 text-center">
                          <div className="w-full h-32 bg-green-600 rounded mb-2 flex items-center justify-center">
                            <BarChart3 className="w-16 h-16 text-white" />
                          </div>
                          <div className="text-sm text-gray-600 mb-2">{currentLanguage === 'english' ? 'T App Folio' : 'টি এপ ফলিঅ'}
</div>
                          <div className="text-2xl font-bold">4568</div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  {/* Documents Registered Table */}
                  <Card>
                    <CardContent className="p-6">
                      <div className="mb-4">
                        <div className="text-center text-gray-600 mb-2">{currentLanguage === 'english' ? 'Documents Registered & Revenue 2025-2026' : 'পঞ্জীয়নভুক্ত নথি আৰু ৰাজহ ২০২৫-২০২৬'}
</div>
                        <div className="text-xs text-gray-500 text-center mb-4">{currentLanguage === 'english' ? 'Revenue Through Registered Documents (in Crores)' : 'পঞ্জীয়নভুক্ত নথিপত্ৰৰ জৰিয়তে ৰাজহ (কোটি টকাত)'}
</div>
                      </div>
                      
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-blue-500 text-white">
                              <TableHead className="text-white">{currentLanguage === 'english' ? 'No.of Documents Registered' : 'পঞ্জীয়নভুক্ত নথিৰ সংখ্যা'}
</TableHead>
                              <TableHead className="text-white">{currentLanguage === 'english' ? 'Book I' : 'বহী ১'}
</TableHead>
                              <TableHead className="text-white">{currentLanguage === 'english' ? 'Book III' : 'বহী ৩'}
</TableHead>
                              <TableHead className="text-white">{currentLanguage === 'english' ? 'Book IV' : 'বহী ৪'}
</TableHead>
                              <TableHead className="text-white">{currentLanguage === 'english' ? 'Total' : 'মুঠ'}
</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow>
                              <TableCell className="font-medium">{currentLanguage === 'english' ? 'Today' : 'আজি'}
</TableCell>
                              <TableCell>482</TableCell>
                              <TableCell>5</TableCell>
                              <TableCell>1</TableCell>
                              <TableCell>488</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">{currentLanguage === 'english' ? 'During The Month' : 'এই মাহত'}
</TableCell>
                              <TableCell>80202</TableCell>
                              <TableCell>803</TableCell>
                              <TableCell>791</TableCell>
                              <TableCell>81796</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">{currentLanguage === 'english' ? 'During The Year' : 'এই বছৰত'}
</TableCell>
                              <TableCell>178840</TableCell>
                              <TableCell>1628</TableCell>
                              <TableCell>1698</TableCell>
                              <TableCell>182166</TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                      
                      <div className="mt-6">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-blue-500 text-white">
                              <TableHead className="text-white">{currentLanguage === 'english' ? 'Revenue Through Registered Documents (in Crores)' : 'পঞ্জীয়নভুক্ত নথিপত্ৰৰ জৰিয়তে ৰাজহ (কোটি টকাত)'}
</TableHead>
                              <TableHead className="text-white">{currentLanguage === 'english' ? 'Book I' : 'বহী ১'}
</TableHead>
                              <TableHead className="text-white">{currentLanguage === 'english' ? 'Book III' : 'বহী ৩'}
</TableHead>
                              <TableHead className="text-white">{currentLanguage === 'english' ? 'Book IV' : 'বহী ৪'}
</TableHead>
                              <TableHead className="text-white">{currentLanguage === 'english' ? 'Total' : 'মুঠ'}
</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow>
                              <TableCell className="font-medium">{currentLanguage === 'english' ? 'Today' : 'আজি'}
</TableCell>
                              <TableCell>1.826</TableCell>
                              <TableCell>0.002</TableCell>
                              <TableCell>0.001</TableCell>
                              <TableCell>1.829</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">{currentLanguage === 'english' ? 'During The Month' : 'এই মাহত'}
</TableCell>
                              <TableCell>889.104</TableCell>
                              <TableCell>0.304</TableCell>
                              <TableCell>0.603</TableCell>
                              <TableCell>890.012</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">{currentLanguage === 'english' ? 'During The Year' : 'এই বছৰত'}
</TableCell>
                              <TableCell>1907.258</TableCell>
                              <TableCell>0.614</TableCell>
                              <TableCell>1.238</TableCell>
                              <TableCell>1909.111</TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Note */}
                  <div className="text-center text-gray-600 text-sm">
                    <p>
                      {currentLanguage === 'english' 
                        ? 'Under the list it will be the categories of reports and the statistics will be deep dive on whatever is clicked in the previous page'
                        : 'তালিকাৰ তলত প্ৰতিবেদনৰ শ্ৰেণীসমূহ থাকিব আৰু পৰিসংখ্যা পূৰৱবৰ পৃষ্ঠাত ক্লিক কৰে তেন্তে SRO ভিত্তিক তথ্য উপলব্ধ হ\'ব'}
                    </p>
                  </div>
                </div>
              )}

              {/* Databases View - Now showing Reports content */}
              {analyticsView === 'databases' && (
                <div className="space-y-4">
                  <div className="space-y-3">
                    {Array.from({ length: 9 }).map((_, index) => (
                      <div key={index} className="flex items-center gap-4 p-3 bg-white rounded-lg shadow-sm">
                        <FileText className="w-6 h-6 text-blue-600" />
                        <div className="flex-1 bg-orange-500 text-white px-4 py-2 rounded text-sm">
                          {currentLanguage === 'english' ? `Transport Vehicle Online Sales Data ${index === 0 ? '2014 to 24-10-2018' : 
                            index === 1 ? '25-10-2018 to 31-12-2018' : 
                            index === 2 ? '01-01-2019 to 31-01-2019' : 
                            index === 3 ? '01-02-2019 to 28-02-2019' : 
                            index === 4 ? '01-03-2019 to 31-03-2019' : 
                            index === 5 ? '01-04-2019 to 30-04-2019' : 
                            index === 6 ? '01-05-2019 to 31-05-2019' : 
                            index === 7 ? '01-06-2019 to 30-06-2019' : 
                            '01-07-2019 to 31-07-2019'}` : `পৰিবহন বাহন অনলাইন বিক্ৰী তথ্য ${index === 0 ? '২০১৪ ৰ পৰা ২৪-১০-২০১৮' : 
                            index === 1 ? '২৫-১০-২০১৮ ৰ পৰা ৩ৃ-২-২০১৮' : 
                            index === 2 ? '০১-০১-২০১৯ ৰ পৰা ৩ৃ-০১-২০১৯' : 
                            index === 3 ? '০১-০২-২০১৯ ৰ পৰা ২৮-০২-২০১৯' : 
                            index === 4 ? '০১-০৩-২০১৯ ৰ পৰা ৩ৃ-৩-২০১৯' : 
                            index === 5 ? '০১-০৪-২০১৯ ৰ পৰা ৩০-০৪-২০১৯' : 
                            index === 6 ? '০১-০৫-২০১৯ ৰ পৰা ৩ৃ-০৫-২০১৯' : 
                            index === 7 ? '০১-০৬-২০১৯ ৰ পৰা ৩০-০৬-২০১৯' : 
                            '০১-০৭-২০১৯ ৰ পৰা ৩ৃ-৭-২০১৯'}`}
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="bg-orange-500 text-white hover:bg-orange-600">
                            <Eye className="w-4 h-4 mr-1" />
                            {currentLanguage === 'english' ? 'Preview' : 'পূৰ্বদৰ্শন'}
                          </Button>
                          <Button size="sm" variant="outline" className="bg-green-600 text-white hover:bg-green-700">
                            <Download className="w-4 h-4 mr-1" />
                            {currentLanguage === 'english' ? 'Download' : 'ডাউনলোড'}
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
                {currentLanguage === 'english' ? 'Detailed Report' : 'বিস্তৃত প্ৰতিবেদন'} - {selectedReportType}
              </DialogTitle>
            </DialogHeader>
            <div className="p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-800 mb-2">
                      {currentLanguage === 'english' ? 'Summary Statistics' : 'সাৰাংশ পৰিসংখ্যা'}
                    </h3>
                    <p className="text-sm text-blue-600">
                      {currentLanguage === 'english' 
                        ? 'Detailed breakdown and analysis for the selected category.'
                        : 'নিৰ্বাচিত শ্ৰেণীৰ বাবে বিস্তৃত বিভাজন আৰু বিশ্লেষণ।'}
                    </p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-green-800 mb-2">
                      {currentLanguage === 'english' ? 'Time Period' : 'সময়কাল'}
                    </h3>
                    <p className="text-sm text-green-600">
                      {currentLanguage === 'english' 
                        ? 'Financial Year 2025-2026'
                        : '২০২৫-২০২৬ বিত্তীয় বৰ্ষ'}
                    </p>
                  </div>
                </div>
                
                <div className="mt-6">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{currentLanguage === 'english' ? 'District' : 'জিলা'}</TableHead>
                        <TableHead>{currentLanguage === 'english' ? 'Count' : 'সংখ্যা'}</TableHead>
                        <TableHead>{currentLanguage === 'english' ? 'Revenue (₹)' : 'ৰাজহ (₹)'}</TableHead>
                        <TableHead>{currentLanguage === 'english' ? 'Percentage' : 'শতাংশ'}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {['Kamrup', 'Guwahati', 'Jorhat', 'Dibrugarh', 'Silchar'].map((district, index) => (
                        <TableRow key={district}>
                          <TableCell className="font-medium">{district}</TableCell>
                          <TableCell>{(Math.random() * 10000 + 1000).toFixed(0)}</TableCell>
                          <TableCell>₹{(Math.random() * 1000000 + 100000).toFixed(2)}</TableCell>
                          <TableCell>{(Math.random() * 20 + 5).toFixed(1)}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                <div className="mt-6 flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowReportPopup(false)}>
                    {currentLanguage === 'english' ? 'Close' : 'বন্ধ'}
                  </Button>
                  <Button className="bg-green-600 hover:bg-green-700">
                    <Download className="w-4 h-4 mr-2" />
                    {currentLanguage === 'english' ? 'Export PDF' : 'PDF ৰপ্তানি'}
                  </Button>
                </div>
              </div>
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
      </div>

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
    </div>
  );
};

export default DepartmentDashboard;