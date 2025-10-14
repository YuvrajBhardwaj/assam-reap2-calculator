import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  Search,
  Download,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  History
} from 'lucide-react';
import { BaseEntity, AuditLog } from '@/types/masterData';

// Generic interfaces for CRUD operations
export interface TableColumn<T> {
  key: keyof T | string;
  label: string;
  render?: (value: any, item: T) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  searchable?: boolean;
}

export interface CRUDService<T extends BaseEntity> {
  // Core CRUD operations
  fetchAll: () => Promise<T[]>;
  create: (item: Omit<T, 'id'>) => Promise<T>;
  update: (id: string, item: Partial<T>) => Promise<T>;
  deactivate: (id: string, reason: string) => Promise<void>;
  reactivate?: (id: string, reason: string) => Promise<void>;

  // Change request workflow
  requestChange?: (operation: 'CREATE' | 'UPDATE' | 'DEACTIVATE', payload: any, reason: string) => Promise<{ requestId: string }>;

  // History and audit
  getHistory?: (id: string) => Promise<AuditLog[]>;

  // Search and validation
  search?: (query: string, filters?: Record<string, any>) => Promise<T[]>;
  validate?: (item: Partial<T>) => Promise<string[]>;

  // Bulk operations
  bulkDeactivate?: (ids: string[], reason: string) => Promise<void>;
  bulkReactivate?: (ids: string[], reason: string) => Promise<void>;
}

export interface GenericDataTableProps<T extends BaseEntity> {
  title: string;
  data: T[];
  columns: TableColumn<T>[];
  service: CRUDService<T>;
  getItemName?: (item: T) => string;

  // Form configuration
  formFields: FormField<T>[];

  // Permissions
  canCreate?: boolean;
  canEdit?: boolean;
  canDeactivate?: boolean;
  canViewHistory?: boolean;
  requiresApproval?: boolean;

  // Customization
  pageSize?: number;
  enableSearch?: boolean;
  enableFilters?: boolean;
  enableExport?: boolean;

  // Event handlers
  onItemSelect?: (item: T) => void;
  onBulkAction?: (action: string, items: T[]) => void;

  // Additional actions
  customActions?: {
    label: string;
    icon?: React.ReactNode;
    onClick: (item: T) => void;
    variant?: 'default' | 'secondary' | 'destructive';
  }[];
  loading?: boolean;
}

export interface FormField<T> {
  key: keyof T;
  label: string;
  type: 'text' | 'number' | 'select' | 'textarea' | 'checkbox' | 'date';
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  validation?: (value: any) => string | null;
  dependsOn?: keyof T;
  disabled?: boolean;
  editOnly?: boolean;
  onChange?: (value: any, formData?: any) => void;
}

// Main Generic Data Table Component
export default function GenericDataTable<T extends BaseEntity>({
  title,
  data: initialData,
  columns,
  service,
  formFields,
  getItemName,
  canCreate = true,
  canEdit = true,
  canDeactivate = true,
  canViewHistory = true,
  requiresApproval = false,
  pageSize = 10,
  enableSearch = true,
  enableFilters = true,
  enableExport = true,
  onItemSelect,
  onBulkAction,
  customActions = [],
  loading = false // Default to false if not provided
}: GenericDataTableProps<T>) {

  // State management
  const [data, setData] = useState<T[]>(initialData);
  const [filteredData, setFilteredData] = useState<T[]>(Array.isArray(initialData) ? initialData : []);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  // Form and action states
  const [editingItem, setEditingItem] = useState<T | null>(null);
  const [formData, setFormData] = useState<Partial<T>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [historyData, setHistoryData] = useState<AuditLog[]>([]);
  const [actionReason, setActionReason] = useState('');
  const [pendingAction, setPendingAction] = useState<{ type: string; item?: T; items?: T[] } | null>(null);
  const [deactivatingItemName, setDeactivatingItemName] = useState<string>('');

  const { toast } = useToast();

  // Effects
  useEffect(() => {
    setData(initialData);
    setFilteredData(Array.isArray(initialData) ? initialData : []);
  }, [initialData]);

  useEffect(() => {
    applyFilters();
  }, [data, searchQuery, statusFilter]);

  useEffect(() => {
    if (isCreateDialogOpen) {
      setFormData({});
      setFormErrors({});
    }
  }, [isCreateDialogOpen]);

  // Filtering and search
  const applyFilters = () => {
    let filtered = Array.isArray(data) ? [...data] : [];

    // Search filter
    if (searchQuery.trim()) {
      const searchableColumns = columns.filter(col => col.searchable !== false);
      filtered = filtered.filter(item =>
        searchableColumns.some(col => {
          const value = item[col.key as keyof T];
          return value?.toString().toLowerCase().includes(searchQuery.toLowerCase());
        })
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = Array.isArray(filtered) ? filtered.filter(item => {
        if (statusFilter === 'active') return item.isActive;
        if (statusFilter === 'inactive') return !item.isActive;
        return true;
      }) : [];
    }

    setFilteredData(filtered);
    setCurrentPage(1);
  };

  // Pagination
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  console.log("GenericDataTable received data:", data);
  console.log("Filtered Data:", filteredData);

  // CRUD operations
  const handleRefresh = async () => {
    try {
      const refreshedData = await service.fetchAll();
      setData(refreshedData);
      toast({
        title: "Data refreshed",
        description: "Successfully refreshed the data."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh data.",
        variant: "destructive"
      });
    }
  };

  const handleCreate = async () => {
    try {
      setFormErrors({});

      // Validate form
      if (service.validate) {
        const errors = await service.validate(formData);
        if (errors.length > 0) {
          const errorMap: Record<string, string> = {};
          errors.forEach(error => {
            // Parse error format "field: message"
            const [field, message] = error.split(': ');
            errorMap[field] = message;
          });
          setFormErrors(errorMap);
          return;
        }
      }

      let result;
      if (requiresApproval && service.requestChange) {
        result = await service.requestChange('CREATE', formData, actionReason);
        toast({
          title: "Request submitted",
          description: `Create request submitted for approval. Request ID: ${result.requestId}`
        });
      } else {
        result = await service.create(formData as Omit<T, 'id'>);
        setData(prev => [...prev, result]);
        toast({
          title: "Created successfully",
          description: `${title} has been created successfully.`
        });
      }

      setIsCreateDialogOpen(false);
      setFormData({});
      setActionReason('');
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to create ${title.toLowerCase()}.`,
        variant: "destructive"
      });
    }
  };

  const handleEdit = async () => {
    if (!editingItem) return;

    try {
      setFormErrors({});

      if (service.validate) {
        const errors = await service.validate(formData);
        if (errors.length > 0) {
          const errorMap: Record<string, string> = {};
          errors.forEach(error => {
            const [field, message] = error.split(': ');
            errorMap[field] = message;
          });
          setFormErrors(errorMap);
          return;
        }
      }

      if (requiresApproval && service.requestChange) {
        const result = await service.requestChange('UPDATE', { id: editingItem.id, ...formData }, actionReason);
        toast({
          title: "Request submitted",
          description: `Update request submitted for approval. Request ID: ${result.requestId}`
        });
      } else {
        const result = await service.update(editingItem.id, formData);
        setData(prev => prev.map(item => item.id === editingItem.id ? result : item));
        toast({
          title: "Updated successfully",
          description: `${title} has been updated successfully.`
        });
      }

      setIsEditDialogOpen(false);
      setEditingItem(null);
      setFormData({});
      setActionReason('');
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to update ${title.toLowerCase()}.`,
        variant: "destructive"
      });
    }
  };

  const handleDeactivate = async (item: T) => {
    try {
      if (requiresApproval && service.requestChange) {
        const result = await service.requestChange('DEACTIVATE', { id: item.id }, actionReason);
        toast({
          title: "Request submitted",
          description: `Deactivation request submitted for approval. Request ID: ${result.requestId}`
        });
      } else {
        await service.deactivate(item.id, actionReason);
        setData(prev => prev.map(i => i.id === item.id ? { ...i, isActive: false } : i));
        toast({
          title: "Deactivated successfully",
          description: `${title} has been deactivated.`
        });
      }

      setIsConfirmDialogOpen(false);
      setPendingAction(null);
      setActionReason('');
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to deactivate ${title.toLowerCase()}.`,
        variant: "destructive"
      });
    }
  };

  const handleViewHistory = async (item: T) => {
    if (!service.getHistory) return;

    try {
      const history = await service.getHistory(item.id);
      setHistoryData(history);
      setIsHistoryDialogOpen(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load history.",
        variant: "destructive"
      });
    }
  };

  // Form rendering
  const renderFormField = (field: FormField<T>) => {
    const value = formData[field.key] || '';
    const error = formErrors[field.key as string];

    switch (field.type) {
      case 'select':
        return (
          <div key={field.key as string} className="space-y-2">
            <Label htmlFor={field.key as string}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Select
              key={`${field.key as string}-${field.options?.length || 0}`}
              onValueChange={(value) => {
                setFormData(prev => ({ ...prev, [field.key]: value }));
                if (field.onChange) {
                  field.onChange(value, formData);
                }
              }}
              value={formData[field.key] as string}
            >
              <SelectTrigger className={error ? "border-red-500" : ""}>
                <SelectValue placeholder={field.placeholder} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>
        );

      case 'textarea':
        return (
          <div key={field.key as string} className="space-y-2">
            <Label htmlFor={field.key as string}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Textarea
              id={field.key as string}
              value={value as string}
              onChange={(e) => setFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
              placeholder={field.placeholder}
              disabled={field.disabled}
              className={error ? "border-red-500" : ""}
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>
        );

      case 'checkbox': {
    return (
      <div key={field.key as string} className="flex items-center space-x-2">
        <input
          type="checkbox"
          id={field.key as string}
          checked={!!value}
          onChange={(e) => setFormData(prev => ({ ...prev, [field.key]: e.target.checked }))}
          disabled={field.disabled}
          className="rounded"
        />
        <Label htmlFor={field.key as string}>{field.label}</Label>
        {error && <p className="text-red-500 text-sm ml-2">{error}</p>}
      </div>
    );
  }
      default:
        return (
          <div key={field.key as string} className="space-y-2">
            <Label htmlFor={field.key as string}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={field.key as string}
              type={field.type}
              value={value as string}
              onChange={(e) => setFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
              placeholder={field.placeholder}
              disabled={field.disabled}
              className={error ? "border-red-500" : ""}
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>
        );
    }
  };

// Action buttons
const renderActionButtons = (item: T) => (
  <div className="flex items-center gap-2">
    {canEdit && (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          setEditingItem(item);
          setFormData({ ...item });
          setIsEditDialogOpen(true);
        }}
      >
        Update
      </Button>
    )}

    {canViewHistory && service.getHistory && (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleViewHistory(item)}
      >
        View History
      </Button>
    )}

    {canDeactivate && item.isActive && (
      <Button
        variant="ghost"
        size="sm"
        className="text-red-600"
        onClick={() => {
          setPendingAction({ type: 'deactivate', item });
          setDeactivatingItemName(getItemName ? getItemName(item) : (item.name || item.id));
          setIsConfirmDialogOpen(true);
        }}
      >
        Deactivate
      </Button>
    )}

    {customActions.map((action, index) => (
      <Button
        key={index}
        variant={action.variant || "ghost"}
        size="sm"
        onClick={() => action.onClick(item)}
      >
        {action.icon}
        {action.label}
      </Button>
    ))}
  </div>
);



  return (
    <Card>
    <CardHeader>
      <div className="flex items-center justify-between">
        <CardTitle>{title}</CardTitle>
        <div className="flex items-center gap-2">
          {enableSearch && (
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          )}

          {enableFilters && (
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          )}

          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>

          {enableExport && (
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4" />
            </Button>
          )}

          {canCreate && (
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add {title}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add New {title}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  {formFields.filter(f => !f.editOnly).map(field => renderFormField(field))}

                  {requiresApproval && (
                    <div className="space-y-2">
                      <Label htmlFor="reason">
                        Reason for Request <span className="text-red-500">*</span>
                      </Label>
                      <Textarea
                        id="reason"
                        value={actionReason}
                        onChange={(e) => setActionReason(e.target.value)}
                        placeholder="Please provide a reason for this request..."
                        required
                      />
                    </div>
                  )}
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreate}>
                    {requiresApproval ? 'Submit Request' : 'Create'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    </CardHeader>

    <CardContent>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <input
                  type="checkbox"
                  checked={selectedItems.size === paginatedData.length && paginatedData.length > 0}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedItems(new Set(paginatedData.map(item => item.id)));
                    } else {
                      setSelectedItems(new Set());
                    }
                  }}
                />
              </TableHead>
              {columns.map(column => (
                <TableHead key={column.key as string}>{column.label}</TableHead>
              ))}
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map(item => (
              <TableRow key={item.id}>
                <TableCell>
                  <input
                    type="checkbox"
                    checked={selectedItems.has(item.id)}
                    onChange={(e) => {
                      const newSelected = new Set(selectedItems);
                      if (e.target.checked) {
                        newSelected.add(item.id);
                      } else {
                        newSelected.delete(item.id);
                      }
                      setSelectedItems(newSelected);
                    }}
                  />
                </TableCell>
                {columns.map(column => (
                  <TableCell key={column.key as string}>
                    {column.render ?
                      column.render(item[column.key as keyof T], item) :
                      String(item[column.key as keyof T] || '')
                    }
                  </TableCell>
                ))}
                <TableCell>
                  <Badge variant={item.isActive ? "default" : "secondary"}>
                    {item.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell>{renderActionButtons(item)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between space-x-2 py-4">
          <div className="text-sm text-gray-500">
            Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredData.length)} of {filteredData.length} entries
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage <= 1}
            >
              Previous
            </Button>
            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage >= totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </CardContent>

    {/* Edit Dialog */}
    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit {title}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {formFields.map(field => renderFormField(field))}

          {requiresApproval && (
            <div className="space-y-2">
              <Label htmlFor="edit-reason">
                Reason for Change <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="edit-reason"
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                placeholder="Please provide a reason for this change..."
                required
              />
            </div>
          )}
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleEdit}>
            {requiresApproval ? 'Submit Request' : 'Update'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>

    {/* History Dialog */}
    <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Change History</DialogTitle>
        </DialogHeader>
        <div className="max-h-96 overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {historyData.map(entry => (
                <TableRow key={entry.id}>
                  <TableCell>{new Date(entry.timestamp).toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant={
                      entry.action === 'CREATE' ? 'default' :
                        entry.action === 'UPDATE' ? 'secondary' :
                          entry.action === 'DEACTIVATE' ? 'destructive' :
                            'outline'
                    }>
                      {entry.action}
                    </Badge>
                  </TableCell>
                  <TableCell>{entry.performedBy}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {entry.details ? JSON.stringify(entry.details) : '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>

    {/* Confirmation Dialog */}
    <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Action</DialogTitle>
        </DialogHeader>
        <div className="space-y-4"><p>
            Are you sure you want to
            {pendingAction?.type === 'deactivate'
              ? ` deactivate ${deactivatingItemName} ${title.toLowerCase()}`
              : ` perform this action on this ${title.toLowerCase()}`}?
          </p><div className="space-y-2">
            <Label htmlFor="confirm-reason">
              Reason <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="confirm-reason"
              value={actionReason}
              onChange={(e) => setActionReason(e.target.value)}
              placeholder="Please provide a reason..."
              required
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setIsConfirmDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              if (pendingAction?.type === 'deactivate' && pendingAction.item) {
                handleDeactivate(pendingAction.item);
              }
            }}
          >
            Confirm
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  </Card>
);}
