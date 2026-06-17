import { normalizeEmail } from "./accounts";

export const PRIMARY_ADMIN_EMAIL = "jiankn@gmail.com";

export function isPrimaryAdminEmail(email: string | undefined): boolean {
  return Boolean(email && normalizeEmail(email) === PRIMARY_ADMIN_EMAIL);
}

export function isPasswordAuthDisabledEmail(
  email: string | undefined,
): boolean {
  return isPrimaryAdminEmail(email);
}
