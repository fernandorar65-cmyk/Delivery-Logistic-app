export interface TokenRequest {
  email: string;
  password: string;
}

export interface TokenResponse {
  refresh: string;
  access: string;
}

export interface RefreshTokenRequest {
  refresh: string;
}

