export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
}

import type { RoleName } from './user.model';

export interface SignupRequest {
  name: string;
  lastName: string;
  email: string;
  password: string;
  role?: RoleName;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}
