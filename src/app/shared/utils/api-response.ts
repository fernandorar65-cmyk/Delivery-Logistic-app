export type ApiResponseLike = {
  errors?: unknown[] | null;
};

export const hasApiErrors = (response?: ApiResponseLike | null): boolean => {
  return Array.isArray(response?.errors) && response.errors.length > 0;
};

export const getApiErrors = (response?: ApiResponseLike | null): unknown[] => {
  return Array.isArray(response?.errors) ? response.errors : [];
};

export const formatApiErrors = (errors: unknown): string => {
  if (Array.isArray(errors)) {
    return errors.filter(Boolean).join(' ');
  }
  if (typeof errors === 'string') {
    return errors;
  }
  return 'Ocurrió un error al procesar la solicitud.';
};
