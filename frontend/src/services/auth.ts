// Auth service — wraps login/logout/session.
// Currently uses localStorage mock. When FastAPI JWT endpoint is ready,
// replace the body of login() to call POST /api/auth/login and store the token.

export interface AuthUser {
  email: string;
  name: string;
}

const AUTH_KEY = 'survey_platform_auth';

function getStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export const authService = {
  /**
   * Login with email + password.
   * MOCK: accepts any credentials with a valid email format and password length >= 6.
   * Replace body with: const res = await apiClient.post('/auth/login', { email, password });
   * then store res.token in localStorage.
   */
  async login(email: string, password: string): Promise<AuthUser> {
    // Simulate network delay
    await new Promise((r) => setTimeout(r, 600));

    // Mock validation — accept any well-formed credentials
    if (!email.includes('@') || password.length < 6) {
      throw new Error('Invalid email or password.');
    }

    const user: AuthUser = {
      email,
      name: email.split('@')[0],
    };
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    return user;
  },

  logout(): void {
    localStorage.removeItem(AUTH_KEY);
  },

  getCurrentUser(): AuthUser | null {
    return getStoredUser();
  },

  isAuthenticated(): boolean {
    return getStoredUser() !== null;
  },
};
