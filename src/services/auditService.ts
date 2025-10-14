import { coreApi } from './http';

export interface AuditItem {
  id: string;
  masterType: string;
  action: string;
  statusCode: string;
  // Add other properties as per your audit item structure
}

export interface UpdateAuditActionRequest {
  id: string;
  masterType: string;
  action: 'approve' | 'reject';
  statusCode: string;
}

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
}