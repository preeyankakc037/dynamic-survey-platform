const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const TOKEN_KEY = 'survey_platform_token';

// ── Token helpers ──────────────────────────────────────────────────────────
export const tokenStore = {
  get: (): string | null => localStorage.getItem(TOKEN_KEY),
  set: (token: string): void => localStorage.setItem(TOKEN_KEY, token),
  clear: (): void => localStorage.removeItem(TOKEN_KEY),
};

// ── Build default headers, injecting Bearer token when present ────────────
function buildHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...extra,
  };
  const token = tokenStore.get();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// ── Centralised response handler ──────────────────────────────────────────
async function handleResponse(res: Response) {
  if (res.status === 204) return; // No Content — e.g. DELETE
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    const message =
      body?.detail || body?.message || `API error: ${res.status}`;
    throw new Error(message);
  }
  return body;
}

// ── API client ────────────────────────────────────────────────────────────
export const apiClient = {
  async get(endpoint: string) {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: buildHeaders(),
    });
    return handleResponse(res);
  },

  async post(endpoint: string, data?: unknown) {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: buildHeaders(),
      body: data !== undefined ? JSON.stringify(data) : undefined,
    });
    return handleResponse(res);
  },

  async put(endpoint: string, data?: unknown) {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: buildHeaders(),
      body: data !== undefined ? JSON.stringify(data) : undefined,
    });
    return handleResponse(res);
  },

  async delete(endpoint: string) {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: buildHeaders(),
    });
    return handleResponse(res);
  },
};
