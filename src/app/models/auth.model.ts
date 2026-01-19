export interface TokenRequest {
  email: string;
  password: string;
}

export interface TokenResponse {
  refresh: string;
  access: string;
  user_type: string;
}

export interface TokenResponseWrapper {
  errors: unknown[];
  result: TokenResponse | null;
}

export interface RefreshTokenRequest {
  refresh: string;
}

export interface RefreshTokenResponse {
  access: string;
}

export interface RefreshTokenResponseWrapper {
  errors: unknown[];
  result: RefreshTokenResponse | null;
}
