export type ApiResponseLike = {
  errors?: unknown[] | null;
};

export const hasApiErrors = (response?: ApiResponseLike | null): boolean => {
  return Array.isArray(response?.errors) && response.errors.length > 0;
};

export const getApiErrors = (response?: ApiResponseLike | null): unknown[] => {
  return Array.isArray(response?.errors) ? response.errors : [];
};
