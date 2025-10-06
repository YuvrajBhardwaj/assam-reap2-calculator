import { coreApi } from './http';

export interface WorkflowTask {
  id: string;
  type: 'PARAMETER_CHANGE' | 'GEO_FACTOR_CHANGE' | 'FORMULA_APPROVAL' | 'USER_RIGHTS' | 'OTHER';
  entityKey: string;
  submittedBy: string;
  submittedAt: string;
  status: 'PENDING' | 'WIP' | 'APPROVED' | 'REJECTED';
  payloadSummary?: string;
}

export async function fetchMyTasks(status?: 'PENDING' | 'WIP'): Promise<WorkflowTask[]> {
  const res = await coreApi.get('/workflow/tasks', { params: { status } });
  return res.data;
}

export async function approveTask(taskId: string, comment?: string): Promise<void> {
  await coreApi.post(`/workflow/tasks/${encodeURIComponent(taskId)}/approve`, { comment });
}

export async function rejectTask(taskId: string, reason: string): Promise<void> {
  await coreApi.post(`/workflow/tasks/${encodeURIComponent(taskId)}/reject`, { reason });
}

export async function fetchDepartmentTasks(): Promise<WorkflowTask[]> {
  const res = await coreApi.get('/workflow/department-tasks'); // Assuming a new endpoint for department tasks
  return res.data;
}