import type { Role } from './common';

export interface AuthUser {
  employeeId: string;
  fullName: string;
  role: Role;
  branchId: string;
  branchName: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}
