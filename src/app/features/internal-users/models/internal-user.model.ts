export type InternalUserOwnerType = 'company' | 'provider' | 'client';

export interface InternalUser {
  id?: string | number;
  email?: string;
  first_name?: string;
  last_name?: string;
  user?: InternalUserProfile;
  is_active?: boolean;
  created_at?: string;
}

export interface InternalUserProfile {
  id?: string | number;
  email?: string;
  first_name?: string;
  last_name?: string;
  user_type?: string;
  created_at?: string;
}

export interface InternalUserCreate {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
}

/** Payload para actualizar usuario interno (password opcional). */
export interface InternalUserUpdate {
  email: string;
  first_name?: string;
  last_name?: string;
  password?: string;
}

export interface InternalUserListResponse {
  errors: any[];
  result: InternalUser[];
}

export interface InternalUserResponse {
  errors: any[];
  result: InternalUser;
}
