import { coreApi } from './http';

export interface LoginRequest {
  loginId: string;
  password: string;
}

export interface LoginResponse {
  jwt: string;
  loginId: string;
  roles: string[];
}

export interface AddUserRequest {
  loginId: string;
  loginPwd: string;
  salutation: string;
  firstName: string;
  lastName: string;
  departmentCode: string;
  zoneCode: string;
  designation: string;
  roleCodes: string[];
}

export class ApiService {
  static async login(credentials: LoginRequest): Promise<LoginResponse> {
    const res = await coreApi.post(`/auth/login`, credentials);
    return res.data;
  }

  static async addUser(userData: AddUserRequest, token: string): Promise<string> {
    const res = await coreApi.post(`/admin/addUser`, userData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  }
}