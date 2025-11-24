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

export interface User {
  id: string;
  loginId: string;
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

  static async getUsers(token: string): Promise<User[]> {
    const res = await coreApi.get(`/admin/users`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  }

  static async updateUser(userId: string, userData: AddUserRequest, token: string): Promise<string> {
    const res = await coreApi.put(`/admin/users/${userId}`, userData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  }

  static async deleteUser(userId: string, token: string): Promise<string> {
    const res = await coreApi.delete(`/admin/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  }
}