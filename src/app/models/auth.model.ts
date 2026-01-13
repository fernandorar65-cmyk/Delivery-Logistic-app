export interface TokenRequest {
  email: string;
  password: string;
}

export interface TokenResponse {
  refresh: string;
  access: string;
  user_type: string;
}

export interface RefreshTokenRequest {
  refresh: string;
}

export interface RefreshTokenResponse {
  access: string;
}
