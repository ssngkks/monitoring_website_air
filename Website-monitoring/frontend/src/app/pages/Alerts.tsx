import { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle, Info, XCircle, X, Filter, Search, Download } from 'lucide-react';
import { Alert } from '../components/AlertPanel';
import { api, AlertData } from '../lib/api';

const mockAlerts: (Alert & { description: string; severity: string })[] = [
  {
    id: '1',
    type: 'critical',
    message: 'Getaran terdeteksi di Titik Pantau C',
    location: 'Sensor Getar – Titik Pantau C',
    timestamp: '2 menit lalu',
    description: 'Sensor getar mendeteksi aktivitas getaran yang tidak normal. Nilai melebihi ambang batas aman. Periksa kondisi fisik pipa dan struktur sekitar lokasi segera.',
    severity: 'High',
  },
  {
    id: '2',
    type: 'warning',
    message: 'Kekeruhan air melebihi batas normal',
    location: 'Sensor Turbidity – Titik Pantau C',
    timestamp: '5 menit lalu',
    description: 'Nilai turbidity terbaca 1.85 NTU, melebihi batas normal 1.5 NTU. Kemungkinan terjadi sedimentasi atau kontaminasi. Lakukan pemeriksaan sumber air.',
    severity: 'Medium',
  },
  {
    id: '3',
    type: 'warning',
    message: 'pH air di bawah normal',
    location: 'Sensor pH – Titik Pantau C',
    timestamp: '8 menit lalu',
    description: 'Nilai pH terbaca 6.3, berada di bawah rentang normal (6.5–8.5). Air bersifat terlalu asam. Segera lakukan pengecekan sumber pencemaran.',
    severity: 'Medium',
  },
  {
    id: '4',
    type: 'warning',
    message: 'Level air mendekati batas bawah',
    location: 'Sensor Ultrasonik – Titik Pantau C',
    timestamp: '12 menit lalu',
    description: 'Level air terukur 87.6 cm, mendekati batas minimum 80 cm. Pantau terus penurunan level agar tidak menyebabkan kekeringan pada sistem.',
    severity: 'Medium',
  },
  {
    id: '5',
    type: 'warning',
    message: 'Suhu air meningkat di atas normal',
    location: 'Sensor DHT – Titik Pantau C',
    timestamp: '20 menit lalu',
    description: 'Suhu air terbaca 24.8°C dari sensor DHT, mendekati batas atas 28°C. Pantau tren suhu untuk mencegah pertumbuhan bakteri berbahaya.',
    severity: 'Medium',
  },
  {
    id: '6',
    type: 'info',
    message: 'Kelembapan ambient tinggi',
    location: 'Sensor DHT – Titik Pantau C',
    timestamp: '25 menit lalu',
    description: 'Kelembapan ambient mencapai 70%, lebih tinggi dari biasanya. Kondisi ini dapat mempengaruhi akurasi pembacaan sensor. Pastikan sensor terlindung dari kelembapan berlebih.',
    severity: 'Low',
  },
  {
    id: '7',
    type: 'success',
    message: 'Nilai pH kembali normal di Titik B',
    location: 'Sensor pH – Titik Pantau B',
    timestamp: '1 jam lalu',
    description: 'Nilai pH telah kembali ke rentang normal (7.0) setelah sebelumnya menunjukkan penyimpangan kecil. Sistem berjalan stabil.',
    severity: 'Low',
  },
  {
    id: '8',
    type: 'info',
    message: 'Kalibrasi sensor terjadwal',
    location: 'Semua Sensor – Titik Pantau A–F',
    timestamp: '3 jam lalu',
    description: 'Kalibrasi rutin triwulanan untuk sensor pH, turbidity, DHT, ultrasonik, dan getar dijadwalkan besok pukul 09.00 WIB. Pastikan data dibackup sebelum kalibrasi.',
    severity: 'Low',
  },
];

export function Alerts() {
  const [alerts, setAlerts] = useState<(Alert & { description: string; severity: string; backendId?: string | number; isRead?: boolean })[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<(Alert & { description: string; severity: string }) | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadAlerts = async () => {
      try {
        const response = await api.alerts('per_page=200');
        const mapped = response.data.map((item: AlertData) => ({
          id: String(item.id),
          backendId: item.id,
          type: (item.severity === 'critical' ? 'critical' : 'warning') as Alert['type'],
          message: item.pesan || item.message || item.title || 'Peringatan sensor',
          location: item.node?.nama_lokasi
            ? `Node ${item.node.kode_node} – ${item.node.nama_lokasi}`
            : item.node?.kode_node || 'Node sensor',
          timestamp: new Date(item.created_at).toLocaleString('id-ID'),
          description: item.pesan || item.message || 'Peringatan dari sistem monitoring.',
          severity: item.severity === 'critical' ? 'High' : 'Medium',
          isRead: item.is_read,
        }));

        if (!cancelled) setAlerts(mapped);
      } catch (error) {
        console.error('Gagal mengambil alerts:', error);
        if (!cancelled) setAlerts([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadAlerts();
    return () => {
      cancelled = true;
    };
  }, []);

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'critical':
        return XCircle;
      case 'warning':
        return AlertTriangle;
      case 'success':
        return CheckCircle;
      default:
        return Info;
    }
  };

  const getAlertStyles = (type: Alert['type']) => {
    switch (type) {
      case 'critical':
        return 'bg-red-50 border-red-200 hover:border-red-300 dark:bg-red-950 dark:border-red-900';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 hover:border-yellow-300 dark:bg-yellow-950 dark:border-yellow-900';
      case 'success':
        return 'bg-green-50 border-green-200 hover:border-green-300 dark:bg-green-950 dark:border-green-900';
      default:
        return 'bg-blue-50 border-blue-200 hover:border-blue-300 dark:bg-blue-950 dark:border-blue-900';
    }
  };

  const getAlertIconColor = (type: Alert['type']) => {
    switch (type) {
      case 'critical':
        return 'text-red-600 dark:text-red-400';
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'success':
        return 'text-green-600 dark:text-green-400';
      default:
        return 'text-blue-600 dark:text-blue-400';
    }
  };

  const filteredAlerts = alerts.filter((alert) => {
    const matchesType = filterType === 'all' || alert.type === filterType;
    const matchesSearch =
      alert.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const handleDismiss = (id: string) => {
    const alert = alerts.find((item) => item.id === id);
    if (alert?.backendId) {
      api.markAlertRead(alert.backendId).catch((error) =>
        console.error('Gagal menandai alert sebagai dibaca:', error),
      );
    }
    setAlerts((current) => current.filter((item) => item.id !== id));
    if (selectedAlert?.id === id) setSelectedAlert(null);
  };

  const exportAlerts = () => {
    const csvContent = [
      ['Type', 'Message', 'Location', 'Timestamp', 'Severity', 'Description'],
      ...filteredAlerts.map((alert) => [
        alert.type,
        alert.message,
        alert.location,
        alert.timestamp,
        alert.severity,
        alert.description,
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `alerts-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const stats = {
    total: alerts.length,
    critical: alerts.filter((a) => a.type === 'critical').length,
    warning: alerts.filter((a) => a.type === 'warning').length,
    info: alerts.filter((a) => a.type === 'info' || a.type === 'success').length,
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Alerts & Notifications</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Monitor and manage system alerts in real-time</p>
      </div>

      {/* Stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <p className="text-sm text-gray-500">Total Alerts</p>
          <p className="mt-1 text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950">
          <p className="text-sm text-red-700 dark:text-red-400">Critical</p>
          <p className="mt-1 text-2xl font-bold text-red-600 dark:text-red-400">{stats.critical}</p>
        </div>
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900 dark:bg-yellow-950">
          <p className="text-sm text-yellow-700 dark:text-yellow-400">Warnings</p>
          <p className="mt-1 text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.warning}</p>
        </div>
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950">
          <p className="text-sm text-blue-700 dark:text-blue-400">Info</p>
          <p className="mt-1 text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.info}</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterType('all')}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              filterType === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
            }`}
          >
            <Filter className="mr-2 inline-block h-4 w-4" />
            All
          </button>
          <button
            onClick={() => setFilterType('critical')}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              filterType === 'critical'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
            }`}
          >
            Critical
          </button>
          <button
            onClick={() => setFilterType('warning')}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              filterType === 'warning'
                ? 'bg-yellow-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
            }`}
          >
            Warning
          </button>
          <button
            onClick={() => setFilterType('info')}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              filterType === 'info'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
            }`}
          >
            Info
          </button>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search alerts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800"
            />
          </div>
          <button
            onClick={exportAlerts}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {loading ? (
          <div className="rounded-lg border border-gray-200 bg-white p-12 text-center dark:border-gray-800 dark:bg-gray-900">
            <p className="font-medium text-gray-600 dark:text-gray-400">Memuat alerts...</p>
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white p-12 text-center dark:border-gray-800 dark:bg-gray-900">
            <CheckCircle className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-4 font-medium text-gray-600 dark:text-gray-400">No alerts found</p>
            <p className="text-sm text-gray-500">Try adjusting your filters</p>
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const Icon = getAlertIcon(alert.type);
            return (
              <div
                key={alert.id}
                onClick={() => setSelectedAlert(alert)}
                className={`cursor-pointer rounded-lg border p-4 transition-all ${getAlertStyles(alert.type)}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <Icon className={`mt-0.5 h-5 w-5 flex-shrink-0 ${getAlertIconColor(alert.type)}`} />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{alert.message}</h3>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-medium">{alert.location}</span>
                        <span>•</span>
                        <span>{alert.timestamp}</span>
                        <span>•</span>
                        <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium dark:bg-gray-700">
                          {alert.severity} Priority
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDismiss(alert.id);
                    }}
                    className="rounded-lg p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Alert Detail Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setSelectedAlert(null)}>
          <div className="fixed inset-0 bg-black/50" />
          <div
            className="relative z-10 w-full max-w-2xl rounded-xl bg-white p-6 shadow-2xl dark:bg-gray-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between">
              <div className="flex items-start gap-3">
                {(() => {
                  const Icon = getAlertIcon(selectedAlert.type);
                  return <Icon className={`mt-1 h-6 w-6 ${getAlertIconColor(selectedAlert.type)}`} />;
                })()}
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">{selectedAlert.message}</h2>
                  <p className="mt-1 text-sm text-gray-500">{selectedAlert.timestamp}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedAlert(null)}
                className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Location</p>
                <p className="mt-1 text-gray-900 dark:text-white">{selectedAlert.location}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">Severity</p>
                <p className="mt-1">
                  <span className="rounded-full bg-gray-200 px-3 py-1 text-sm font-medium dark:bg-gray-700">
                    {selectedAlert.severity} Priority
                  </span>
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">Description</p>
                <p className="mt-1 text-gray-900 dark:text-white">{selectedAlert.description}</p>
              </div>

              <div className="flex gap-3 border-t border-gray-200 pt-4 dark:border-gray-700">
                <button
                  onClick={() => handleDismiss(selectedAlert.id)}
                  className="flex-1 rounded-lg bg-gray-100 px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
                >
                  Dismiss
                </button>
                <button className="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700">
                  Take Action
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
