const API_URL = import.meta.env.VITE_API_URL ?? '/api/v1';

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  orgId: string;
}

class ApiClient {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
    if (token) localStorage.setItem('griddna_token', token);
    else localStorage.removeItem('griddna_token');
  }

  getToken(): string | null {
    if (!this.token) this.token = localStorage.getItem('griddna_token');
    return this.token;
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };
    const token = this.getToken();
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`${API_URL}${path}`, { ...options, headers });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(err.message ?? 'Request failed');
    }
    return res.json();
  }

  login(email: string, password: string) {
    return this.request<{ accessToken: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  me() {
    return this.request<User>('/auth/me');
  }

  getSites() {
    return this.request<Site[]>('/sites');
  }

  getAssets(siteId?: string) {
    const q = siteId ? `?site_id=${siteId}` : '';
    return this.request<Asset[]>(`/assets${q}`);
  }

  getAlerts() {
    return this.request<Alert[]>('/alerts');
  }

  health() {
    return this.request<{ status: string }>('/health');
  }
}

export interface Site {
  id: string;
  name: string;
  type: string;
  address?: string;
  latitude?: number;
  longitude?: number;
}

export interface Asset {
  id: string;
  siteId: string;
  name: string;
  type: string;
  healthScore: number;
  ratedPowerKw?: number;
  devices?: { id: string; serial: string; status: string }[];
}

export interface Alert {
  id: string;
  assetId: string;
  severity: 'info' | 'warning' | 'critical';
  type: string;
  title: string;
  message?: string;
  acknowledged: boolean;
  createdAt: string;
}

export const api = new ApiClient();
