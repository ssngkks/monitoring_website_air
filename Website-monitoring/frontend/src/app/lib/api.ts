const API_BASE = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = localStorage.getItem('api_token');
  const headers = new Headers(options.headers);
  headers.set('Accept', 'application/json');
  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json')
    ? await response.json()
    : null;

  if (!response.ok) {
    const error = new Error(
      payload?.message || `Request failed (${response.status})`,
    ) as Error & { status?: number; data?: ApiError };
    error.status = response.status;
    error.data = payload;
    throw error;
  }

  return payload as T;
}

export const api = {
  login: (email: string, password: string) =>
    apiFetch<{ message: string; data: { user: User; token: string } }>('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  register: (name: string, email: string, password: string) =>
    apiFetch<{ message: string; data: { user: User; token: string } }>('/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, password_confirmation: password }),
    }),
  me: () => apiFetch<{ data: User }>('/me'),
  logout: () => apiFetch<{ message: string }>('/logout', { method: 'POST' }),
  nodes: () => apiFetch<{ data: Node[] }>('/nodes'),
  sensorData: (nodeId: string | number, params = '') =>
    apiFetch<{ data: SensorData[]; meta: { current_page: number; last_page: number } }>(
      `/nodes/${nodeId}/sensor-data${params ? `?${params}` : ''}`,
    ),
  alerts: (params = '') =>
    apiFetch<{ data: AlertData[]; current_page: number; last_page: number }>(
      `/alerts${params ? `?${params}` : ''}`,
    ),
  markAlertRead: (id: string | number) =>
    apiFetch<{ data: AlertData }>(`/alerts/${id}/read`, { method: 'PATCH' }),
};

export interface User {
  id: string | number;
  name: string;
  email: string;
  role: string;
  email_verified_at?: string | null;
}

export interface Node {
  id: string | number;
  kode_node: string;
  nama_lokasi: string;
  status: string;
  is_online: boolean;
  last_seen_at: string | null;
}

export interface SensorData {
  id: string | number;
  node: string;
  ph: number | string;
  temp: number | string;
  humidity: number | string;
  turbidity: number | string;
  water_level: number | string;
  vibration: boolean | number;
  ai_status?: string | null;
  created_at: string;
}

export interface AlertData {
  id: string | number;
  node_id?: string | number;
  type?: string;
  severity?: string;
  title?: string;
  message?: string;
  description?: string;
  is_read: boolean;
  created_at: string;
  node?: { id: number; kode_node: string; nama_lokasi: string };
}
