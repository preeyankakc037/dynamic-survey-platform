import { apiClient, tokenStore } from './api/client';

export interface AuthUser {
  username: string;
}

const USER_KEY = 'survey_platform_user';

function getStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export const authService = {
  /**
   * Login with username + password.
   * Calls POST /api/auth/login, stores the JWT token in localStorage.
   */
  async login(username: string, password: string): Promise<AuthUser> {
    const res = await apiClient.post('/auth/login', { username, password });
    // Store the JWT token so apiClient can inject it automatically
    tokenStore.set(res.access_token);
    const user: AuthUser = { username };
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    return user;
  },

  logout(): void {
    tokenStore.clear();
    localStorage.removeItem(USER_KEY);
  },

  getCurrentUser(): AuthUser | null {
    // Only return user if a token exists (session still valid)
    if (!tokenStore.get()) return null;
    return getStoredUser();
  },

  isAuthenticated(): boolean {
    return !!tokenStore.get() && getStoredUser() !== null;
  },
};
