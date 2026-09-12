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
  reportsSummary: () =>
    apiFetch<{
      data: {
        total_records: number;
        earliest_record: string | null;
        latest_record: string | null;
        sampling_interval_seconds: number;
        parameters: string[];
        averages: {
          ph: number;
          temp: number;
          humidity: number;
          turbidity: number;
          water_level: number;
        } | null;
      };
    }>('/reports/summary'),
  reportsData: (params = '') =>
    apiFetch<{
      data: {
        id: string;
        date: string;
        time: string;
        timestamp: string;
        ph: number;
        temperature: number;
        humidity: number;
        turbidity: number;
        water_level: number;
        vibration: boolean;
        ai_status: string;
      }[];
      meta: { total: number; has_more: boolean };
    }>(`/reports/data${params ? `?${params}` : ''}`),
  aiDiagnostics: (nodeId?: string | number) =>
    apiFetch<AIDiagnosticResponse>(`/ai/diagnostics${nodeId ? `?node_id=${nodeId}` : ''}`),
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

export interface AIDiagnosticTrigger {
  param: string;
  value: string;
  level: 'normal' | 'warning' | 'critical';
}

export interface AIRadarItem {
  subject: string;
  nilai_aktual: number;
  skor: number;
  batas_aman: number;
  unit: string;
}

export interface AIDiagnosticCurrent {
  status: 'Normal' | 'Anomali' | 'Bahaya';
  confidence: number;
  diagnosis: string;
  triggers: AIDiagnosticTrigger[];
  latency_us: number;
  radar: AIRadarItem[];
  raw_reading: {
    ph: number;
    turbidity: number;
    temp: number;
    water_level: number;
    vibration: number;
  };
  timestamp: string;
}

export interface AIDiagnosticHistoryItem {
  timestamp: string;
  status: string;
  confidence: string;
  trigger: string;
  note: string;
}

export interface AIComparisonItem {
  skenario: string;
  threshold_biasa: string;
  edge_ai: string;
  keuntungan: string;
}

export interface AIDiagnosticResponse {
  data: {
    current: AIDiagnosticCurrent;
    history: AIDiagnosticHistoryItem[];
    comparison: AIComparisonItem[];
  };
}

