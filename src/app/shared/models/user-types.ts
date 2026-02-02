export class UserTypes {
  static readonly ADMIN = 'admin';
  static readonly COMPANY = 'company';
  static readonly PROVIDER = 'provider';
  static readonly CLIENT = 'client';
  static readonly INTERNAL_COMPANY = 'internal_company';
  static readonly INTERNAL_PROVIDER = 'internal_provider';
  static readonly INTERNAL_CLIENT = 'internal_client';
}

export const normalizeUserType = (role?: string | null): string | null => {
  if (!role) {
    return null;
  }
  const normalized = role.toLowerCase();
  const map: Record<string, string> = {
    platform: UserTypes.ADMIN,
    [UserTypes.INTERNAL_COMPANY]: UserTypes.COMPANY,
    [UserTypes.INTERNAL_PROVIDER]: UserTypes.PROVIDER,
    [UserTypes.INTERNAL_CLIENT]: UserTypes.CLIENT
  };
  return map[normalized] ?? normalized;
};
