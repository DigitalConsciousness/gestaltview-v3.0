/**
 * Legacy compatibility shim for trainer code that used to wait on Supabase auth.
 * The single-password cookie flow no longer needs a token hydration gate, but the
 * module stays in place so existing imports continue to compile.
 */

class AuthManager {
  async waitForReady(): Promise<string | null> {
    return null;
  }

  async refresh(): Promise<string | null> {
    return null;
  }

  getToken(): string | null {
    return null;
  }
}

export const authManager = new AuthManager();
