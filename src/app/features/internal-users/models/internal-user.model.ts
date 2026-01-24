export type InternalUserOwnerType = 'company' | 'provider' | 'client';

export interface InternalUser {
  id?: string | number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role?: string;
  is_active?: boolean;
  created_at?: string;
}

export interface InternalUserCreate {
  username: string;
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  role?: string;
}

export interface InternalUserUpdate {
  username?: string;
  email?: string;
  password?: string;
  first_name?: string;
  last_name?: string;
  role?: string;
  is_active?: boolean;
}

export interface InternalUserListResponse {
  errors: any[];
  result: InternalUser[];
}

export interface InternalUserResponse {
  errors: any[];
  result: InternalUser;
}
