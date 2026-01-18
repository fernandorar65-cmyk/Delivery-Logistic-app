export interface UserCheckResult {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  user_type: string;
  created_at: string;
}

export interface UserCheckResponse {
  errors: unknown[];
  result: UserCheckResult | null;
}
