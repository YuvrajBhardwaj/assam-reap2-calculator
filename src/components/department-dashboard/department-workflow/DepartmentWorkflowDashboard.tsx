import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Search,
  Download,
  RefreshCw,
  TrendingUp,
} from "lucide-react";
import ApprovalInbox from "@/components/admin/ApprovalInbox";
import { useAuth } from "@/context/AuthContext";
import { getAuditLogs } from "@/services/masterDataService";
import type { AuditLog } from "@/types/masterData";

// ---------- Types ----------
interface WorkflowItem {
  id: number;
  type: string;
  applicant: string;
  property: string;
  location: string;
  submittedDate: string;
  status:
    | "pending"
    | "in-progress"
    | "approved"
    | "rejected"
    | "on-hold";
  assignedTo: string;
  priority: "low" | "medium" | "high";
  daysElapsed: number;
  enteredBy?: string;
  entryDate?: string;
  modifiedBy?: string;
  modifiedDate?: string;
  approvedBy?: string;
  approvedDate?: string;
}

// ---------- Component ----------
const DepartmentWorkflowDashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [selectedWorkflow, setSelectedWorkflow] =
    useState<WorkflowItem | null>(null);
  const { userRole } = useAuth();

  // Roles
  const isAdmin = userRole === "ROLE_ADMIN";

  // Audit Logs State
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [filters, setFilters] = useState({
    entityType: "",
    fromDate: "",
    toDate: "",
    performedBy: "",
  });

  // Fetch Audit Logs
  const loadLogs = async () => {
    setLogsLoading(true);
    try {
      const data = await getAuditLogs(
        filters.entityType || undefined,
        filters.fromDate || undefined,
        filters.toDate || undefined,
        filters.performedBy || undefined
      );
      setLogs(data);
    } catch (e) {
      console.error("Failed to fetch audit logs", e);
    } finally {
      setLogsLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) loadLogs();
  }, [isAdmin]);

  // ---------- Mock Workflow Data ----------
  const workflowData: WorkflowItem[] = [
    {
      id: 1,
      type: "Property Valuation",
      applicant: "Rajesh Kumar",
      property: "Residential Plot",
      location: "Guwahati, Kamrup Metro",
      submittedDate: "2024-01-15",
      status: "pending",
      assignedTo: "Valuator Team A",
      priority: "high",
      daysElapsed: 5,
    },
    {
      id: 2,
      type: "Land Registration",
      applicant: "Priya Sharma",
      property: "Agricultural Land",
      location: "Jorhat, Jorhat",
      submittedDate: "2024-01-14",
      status: "in-progress",
      assignedTo: "Registration Officer B",
      priority: "medium",
      daysElapsed: 6,
    },
    {
      id: 3,
      type: "Stamp Duty Assessment",
      applicant: "Amit Das",
      property: "Commercial Building",
      location: "Dibrugarh, Dibrugarh",
      submittedDate: "2024-01-13",
      status: "approved",
      assignedTo: "Assessment Team C",
      priority: "low",
      daysElapsed: 7,
    },
    {
      id: 4,
      type: "Title Verification",
      applicant: "Meera Singh",
      property: "Independent House",
      location: "Silchar, Cachar",
      submittedDate: "2024-01-12",
      status: "on-hold",
      assignedTo: "Legal Team D",
      priority: "high",
      daysElapsed: 8,
    },
    {
      id: 5,
      type: "Mutation Request",
      applicant: "Ravi Borah",
      property: "Apartment",
      location: "Tezpur, Sonitpur",
      submittedDate: "2024-01-11",
      status: "rejected",
      assignedTo: "Mutation Officer E",
      priority: "medium",
      daysElapsed: 9,
    },
  ];

  // ---------- Helpers ----------
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case "in-progress":
        return <AlertTriangle className="w-4 h-4 text-blue-600" />;
      case "approved":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "rejected":
        return <XCircle className="w-4 h-4 text-red-600" />;
      case "on-hold":
        return <AlertTriangle className="w-4 h-4 text-orange-600" />;
      default:
        return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "bg-yellow-100 text-yellow-800",
      "in-progress": "bg-blue-100 text-blue-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      "on-hold": "bg-orange-100 text-orange-800",
    };
    return variants[status as keyof typeof variants];
  };

  const getPriorityBadge = (priority: string) => {
    const variants = {
      high: "bg-red-100 text-red-800",
      medium: "bg-yellow-100 text-yellow-800",
      low: "bg-green-100 text-green-800",
    };
    return variants[priority as keyof typeof variants];
  };

  const filteredData = workflowData.filter((item) => {
    const matchSearch =
      item.applicant.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.property.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus =
      statusFilter === "all" || item.status === statusFilter;
    const matchPriority =
      priorityFilter === "all" || item.priority === priorityFilter;
    return matchSearch && matchStatus && matchPriority;
  });

  const statusCounts = {
    total: workflowData.length,
    pending: workflowData.filter((i) => i.status === "pending").length,
    inProgress: workflowData.filter((i) => i.status === "in-progress").length,
    approved: workflowData.filter((i) => i.status === "approved").length,
    rejected: workflowData.filter((i) => i.status === "rejected").length,
    onHold: workflowData.filter((i) => i.status === "on-hold").length,
  };

  // ---------- Render ----------
  return (
    <div className="p-6 space-y-8 max-w-[1600px] mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h1 className="text-2xl font-bold text-gray-900">
          Department Workflow Dashboard
        </h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: "Total", value: statusCounts.total, color: "text-blue-600", icon: FileText },
          { label: "Pending", value: statusCounts.pending, color: "text-yellow-600", icon: Clock },
          { label: "In Progress", value: statusCounts.inProgress, color: "text-blue-600", icon: TrendingUp },
          { label: "Approved", value: statusCounts.approved, color: "text-green-600", icon: CheckCircle },
          { label: "Rejected", value: statusCounts.rejected, color: "text-red-600", icon: XCircle },
          { label: "On Hold", value: statusCounts.onHold, color: "text-orange-600", icon: AlertTriangle },
        ].map((card, i) => (
          <Card key={i}>
            <CardContent className="p-4 flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">{card.label}</p>
                <p className={`text-2xl font-bold ${card.color}`}>
                  {card.value}
                </p>
              </div>
              <card.icon className={`w-8 h-8 ${card.color}`} />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs Section */}
      <Tabs defaultValue="workflows" className="w-full">
        <TabsList className="grid w-full sm:w-[500px] grid-cols-3 mb-4">
          <TabsTrigger value="workflows">Workflow Management</TabsTrigger>
          <TabsTrigger value="approval">Approval Inbox</TabsTrigger>
          <TabsTrigger value="audit-logs">Audit Logs</TabsTrigger>
        </TabsList>

        {/* Workflows Tab */}
        <TabsContent value="workflows">
          <Card>
            <CardHeader>
              <CardTitle>Workflow Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-gray-500" />
                  <Input
                    placeholder="Search by applicant, property, or location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full sm:w-80"
                  />
                </div>

                <Select
                  value={statusFilter}
                  onValueChange={setStatusFilter}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="on-hold">On Hold</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={priorityFilter}
                  onValueChange={setPriorityFilter}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Table */}
              <div className="relative max-h-[65vh] overflow-auto border rounded-lg">
                <Table>
                  <TableHeader className="sticky top-0 bg-gray-50 z-10">
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Applicant</TableHead>
                      <TableHead>Property</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Assigned To</TableHead>
                      <TableHead>Days</TableHead>
                      <TableHead>Entered By</TableHead>
                      <TableHead>Entry Date</TableHead>
                      <TableHead>Modified By</TableHead>
                      <TableHead>Modified Date</TableHead>
                      <TableHead>Approved By</TableHead>
                      <TableHead>Approved Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.id}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(item.status)}
                            {item.type}
                          </div>
                        </TableCell>
                        <TableCell>{item.applicant}</TableCell>
                        <TableCell>{item.property}</TableCell>
                        <TableCell>{item.location}</TableCell>
                        <TableCell>{item.submittedDate}</TableCell>
                        <TableCell>
                          <Badge className={getStatusBadge(item.status)}>
                            {item.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getPriorityBadge(item.priority)}>
                            {item.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>{item.assignedTo}</TableCell>
                        <TableCell
                          className={`${
                            item.daysElapsed > 7
                              ? "text-red-600 font-semibold"
                              : "text-gray-700"
                          }`}
                        >
                          {item.daysElapsed}
                        </TableCell>
                        <TableCell>{item.enteredBy || 'N/A'}</TableCell>
                        <TableCell>{item.entryDate ? new Date(item.entryDate).toLocaleDateString() : 'N/A'}</TableCell>
                        <TableCell>{item.modifiedBy || 'N/A'}</TableCell>
                        <TableCell>{item.modifiedDate ? new Date(item.modifiedDate).toLocaleDateString() : 'N/A'}</TableCell>
                        <TableCell>{item.approvedBy || 'N/A'}</TableCell>
                        <TableCell>{item.approvedDate ? new Date(item.approvedDate).toLocaleDateString() : 'N/A'}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedWorkflow(item)}
                            >
                              View
                            </Button>
                            {item.status === "pending" && (
                              <Button size="sm" className="bg-blue-600">
                                Process
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {!filteredData.length && (
                      <TableRow>
                        <TableCell
                          colSpan={11}
                          className="text-center py-6 text-gray-500"
                        >
                          No matching workflows found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Approval Inbox */}
        <TabsContent value="approval">
          <Card>
            <CardHeader>
              <CardTitle>Approval Inbox</CardTitle>
            </CardHeader>
            <CardContent>
              <ApprovalInbox />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audit Logs */}
        <TabsContent value="audit-logs">
          <Card>
            <CardHeader>
              <CardTitle>Audit Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3 mb-4">
                <Input
                  placeholder="Entity Type"
                  value={filters.entityType}
                  onChange={(e) =>
                    setFilters({ ...filters, entityType: e.target.value })
                  }
                  className="w-48"
                />
                <Input
                  type="date"
                  value={filters.fromDate}
                  onChange={(e) =>
                    setFilters({ ...filters, fromDate: e.target.value })
                  }
                  className="w-40"
                />
                <Input
                  type="date"
                  value={filters.toDate}
                  onChange={(e) =>
                    setFilters({ ...filters, toDate: e.target.value })
                  }
                  className="w-40"
                />
                <Input
                  placeholder="Performed By"
                  value={filters.performedBy}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      performedBy: e.target.value,
                    })
                  }
                  className="w-48"
                />
                <Button onClick={loadLogs} disabled={logsLoading}>
                  {logsLoading ? "Loading..." : "Search"}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setFilters({
                      entityType: "",
                      fromDate: "",
                      toDate: "",
                      performedBy: "",
                    });
                    setLogs([]);
                  }}
                >
                  Reset
                </Button>
              </div>

              <div className="relative max-h-[60vh] overflow-auto border rounded-lg">
                <Table>
                  <TableHeader className="sticky top-0 bg-gray-50 z-10">
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>Entity Type</TableHead>
                      <TableHead>Entity ID</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Performed By</TableHead>
                      <TableHead>Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          {new Date(log.timestamp).toLocaleString()}
                        </TableCell>
                        <TableCell>{log.entityType}</TableCell>
                        <TableCell>{log.entityId}</TableCell>
                        <TableCell>
                          <Badge>{log.action}</Badge>
                        </TableCell>
                        <TableCell>{log.performedBy}</TableCell>
                        <TableCell className="text-xs break-all text-gray-600">
                          {log.details
                            ? JSON.stringify(log.details)
                            : "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                    {!logs.length && (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-center text-gray-500 py-6"
                        >
                          {logsLoading ? "Loading logs..." : "No logs found."}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DepartmentWorkflowDashboard;