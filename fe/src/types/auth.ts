import type { Role } from './common';

export interface AuthUser {
  employeeId: string | null;
  fullName: string | null;
  role: Role | string;
  branchId: string | null;
  branchName: string | null;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}
