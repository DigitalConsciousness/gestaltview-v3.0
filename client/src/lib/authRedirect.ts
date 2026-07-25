export const DEFAULT_AUTH_REDIRECT = "/";

export function isSafeInternalRedirect(value: string | null | undefined): value is string {
  return Boolean(value && value.startsWith("/") && !value.startsWith("//"));
}

export function readStoredAuthRedirect(
  storage: Pick<Storage, "getItem"> | null | undefined,
  fallback = DEFAULT_AUTH_REDIRECT
): string {
  try {
    const storedRedirect = storage?.getItem("auth_redirect");
    return isSafeInternalRedirect(storedRedirect) ? storedRedirect : fallback;
  } catch {
    return fallback;
  }
}

export function persistAuthRedirect(
  storage: Pick<Storage, "setItem"> | null | undefined,
  redirectTo: string
): void {
  if (!isSafeInternalRedirect(redirectTo)) {
    return;
  }

  try {
    storage?.setItem("auth_redirect", redirectTo);
  } catch {
    // Session storage may be unavailable; auth callback falls back safely.
  }
}

export function consumeStoredAuthRedirect(
  storage: Pick<Storage, "getItem" | "removeItem"> | null | undefined,
  fallback = DEFAULT_AUTH_REDIRECT
): string {
  const redirectTo = readStoredAuthRedirect(storage, fallback);

  try {
    storage?.removeItem("auth_redirect");
  } catch {
    // Ignore storage cleanup failures.
  }

  return redirectTo;
}
