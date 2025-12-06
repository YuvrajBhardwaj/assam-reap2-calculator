import { jurisdictionApi } from './http';
import type { AuditLog } from "@/types/masterData";

export interface AuditItem {
  id: string;
  masterType: string;
  action: string;
  statusCode: string;
  requestorName?: string;
  currentApprover?: string;
  approvalLevel?: string;
  daysPending?: number;
  reason?: string;
  payload?: any;
  // Add other properties as per your audit item structure
}

export interface UpdateAuditActionRequest {
  id: string;
  masterType: string;
  action: 'approve' | 'reject';
  statusCode: string;
}

export interface WorkflowActionRequest {
  id: string;
  masterType: string;
  masterCode: string;
  action: 'approve' | 'reject';
  currentStatusCode: string;
  requestType?: 'update' | 'delete';
}

export type ApprovalRole = 'jm' | 'man' | 'sman' | 'admin';

export class AuditService {
  static async getPendingAuditManagement(masterType: string, statusCode: string): Promise<AuditItem[]> {
    const res = await jurisdictionApi.get(`/audit/get/pending/management`, {
      params: { masterType, statusCode },
    });
    return res.data;
  }

  static async updateAuditAction(request: UpdateAuditActionRequest): Promise<string> {
    const res = await jurisdictionApi.post(`/audit/update/action`, null, {
      params: request,
    });
    return res.data;
  }

  // New workflow-specific methods for the 4-level approval system
  static async updateWorkflowAction(
    role: ApprovalRole,
    request: WorkflowActionRequest
  ): Promise<string> {
    const res = await jurisdictionApi.get(`/audit/update/action/${role}`, {
      params: {
        id: request.id,
        masterType: request.masterType,
        masterCode: request.masterCode,
        action: request.action,
        currentStatusCode: request.currentStatusCode,
        ...(request.requestType && { requestType: request.requestType }),
      },
    });
    return res.data;
  }

  // Junior Manager approval/rejection
  static async juniorManagerAction(request: WorkflowActionRequest): Promise<string> {
    return this.updateWorkflowAction('jm', request);
  }

  // Manager approval/rejection
  static async managerAction(request: WorkflowActionRequest): Promise<string> {
    return this.updateWorkflowAction('man', request);
  }

  // Senior Manager approval/rejection
  static async seniorManagerAction(request: WorkflowActionRequest): Promise<string> {
    return this.updateWorkflowAction('sman', request);
  }

  // Admin approval/rejection
  static async adminAction(request: WorkflowActionRequest): Promise<string> {
    return this.updateWorkflowAction('admin', request);
  }

  // Get pending requests for management with enhanced filtering
  static async getPendingRequestsByRole(
    masterType: string,
    statusCode: string,
    role?: ApprovalRole
  ): Promise<AuditItem[]> {
    const params: any = { masterType, statusCode };
    if (role) {
      params.role = role;
    }
    
    const res = await jurisdictionApi.get(`/audit/get/pending/management`, {
      params,
    });
    return res.data;
  }

  // Controller-based endpoint for pending by role (e.g., jm/man/sman/admin)
  static async getControllerPending(
    role: ApprovalRole,
    masterType: string,
    statusCode: string
  ): Promise<AuditItem[]> {
    const res = await jurisdictionApi.get(`/auditController/${role}/pending`, {
      params: { masterType, statusCode },
    });
    return res.data;
  }

  static async getAuditLogs(
    entityType?: string,
    fromDate?: string,
    toDate?: string,
    performedBy?: string
  ): Promise<AuditLog[]> {
    const params: any = {};
    if (entityType) params.entityType = entityType;
    if (fromDate) params.fromDate = fromDate;
    if (toDate) params.toDate = toDate;
    if (performedBy) params.performedBy = performedBy;

    const res = await jurisdictionApi.get(`/audit/logs`, { params });
    return res.data;
  }
}