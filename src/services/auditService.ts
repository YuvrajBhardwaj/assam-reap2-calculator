import { coreApi } from './http';

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
  loginId: string;
  id: string;
  masterType: string;
  action: 'approve' | 'reject';
  statusCode: string;
}

export type ApprovalRole = 'jm' | 'man' | 'sman' | 'admin';

export class AuditService {
  static async getPendingAuditManagement(masterType: string, statusCode: string): Promise<AuditItem[]> {
    const res = await coreApi.get(`/audit/get/pending/management`, {
      params: { masterType, statusCode },
    });
    return res.data;
  }

  static async updateAuditAction(request: UpdateAuditActionRequest): Promise<string> {
    const res = await coreApi.post(`/audit/update/action`, null, {
      params: request,
    });
    return res.data;
  }

  // New workflow-specific methods for the 4-level approval system
  static async updateWorkflowAction(
    role: ApprovalRole,
    request: WorkflowActionRequest
  ): Promise<string> {
    const res = await coreApi.post(`/audit/update/action/${role}`, null, {
      params: request,
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
    
    const res = await coreApi.get(`/audit/get/pending/management`, {
      params,
    });
    return res.data;
  }
}