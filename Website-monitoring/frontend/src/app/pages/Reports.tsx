import { useState, useEffect } from 'react';
import { Download, FileText, Calendar, TrendingUp, Filter, Table, Clock, Activity, CheckCircle, Database } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { api } from '../lib/api';

interface ReportSummary {
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
}

interface SensorRecord {
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
}

export function Reports() {
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [records, setRecords] = useState<SensorRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedParam, setSelectedParam] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'charts'>('charts');

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      try {
        const [sumRes, dataRes] = await Promise.all([
          api.reportsSummary(),
          api.reportsData('per_page=100'),
        ]);

        if (!cancelled) {
          setSummary(sumRes.data);
          setRecords(dataRes.data || []);
        }
      } catch (err) {
        console.error('Gagal memuat laporan data sensor:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadData();
    return () => {
      cancelled = true;
    };
  }, []);

  const downloadReport = (format: string) => {
    if (records.length === 0) {
      alert('Tidak ada data sensor aktual untuk diekspor.');
      return;
    }

    if (format === 'csv') {
      const csvContent = [
        ['Tanggal', 'Waktu', 'pH Air', 'Suhu (°C)', 'Kelembapan (%)', 'Kekeruhan (NTU)', 'Level Air (cm)', 'Getaran', 'Status AI'],
        ...records.map((row) => [
          row.date,
          row.time,
          row.ph,
          row.temperature,
          row.humidity,
          row.turbidity,
          row.water_level,
          row.vibration ? 'Terdeteksi' : 'Normal',
          row.ai_status,
        ]),
      ]
        .map((row) => row.join(','))
        .join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `laporan-sensor-air-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
    }
  };

  const formatDateTime = (isoString: string | null) => {
    if (!isoString) return '-';
    const d = new Date(isoString);
    return (
      d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) +
      ' ' +
      d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) +
      ' WIB'
    );
  };

  // Format data untuk grafik kronologis (lama ke baru)
  const chartData = records.slice().reverse().map((r) => ({
    time: r.time,
    ph: r.ph,
    turbidity: r.turbidity,
    temperature: r.temperature,
    humidity: r.humidity,
    waterLevel: r.water_level,
  }));

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Laporan & Data Riwayat Sensor</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Analisis data aktual dari perangkat sensor ESP32 yang tersimpan di database
          </p>
        </div>

        <button
          onClick={() => downloadReport('csv')}
          disabled={records.length === 0}
          className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
        >
          <Download className="h-4 w-4" />
          Ekspor Data CSV
        </button>
      </div>

      {/* Info Integritas Data Aktual Database */}
      <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50/70 p-5 dark:border-blue-900/60 dark:bg-blue-950/30">
        <div className="flex items-center gap-2 mb-3">
          <Database className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h3 className="text-sm font-bold text-blue-900 dark:text-blue-200">
            Ringkasan Ketersediaan Data Riil Database
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 text-xs">
          <div>
            <span className="text-gray-500 dark:text-gray-400">Total Rekaman Data:</span>
            <p className="mt-1 text-base font-bold text-gray-900 dark:text-white">
              {summary?.total_records ?? 0} data
            </p>
          </div>

          <div>
            <span className="text-gray-500 dark:text-gray-400">Periode Data Awal:</span>
            <p className="mt-1 font-semibold text-gray-800 dark:text-gray-200">
              {formatDateTime(summary?.earliest_record || null)}
            </p>
          </div>

          <div>
            <span className="text-gray-500 dark:text-gray-400">Periode Data Terakhir:</span>
            <p className="mt-1 font-semibold text-gray-800 dark:text-gray-200">
              {formatDateTime(summary?.latest_record || null)}
            </p>
          </div>

          <div>
            <span className="text-gray-500 dark:text-gray-400">Rata-rata Interval Pengiriman:</span>
            <p className="mt-1 font-semibold text-gray-800 dark:text-gray-200">
              {summary?.sampling_interval_seconds ? `~${summary.sampling_interval_seconds} detik` : 'Periodik'}
            </p>
          </div>
        </div>
      </div>

      {/* Rata-rata Parameter Aktual */}
      {summary?.averages && (
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-5 text-xs">
          <div className="rounded-xl border border-gray-200 bg-white p-3.5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <span className="text-gray-500">Rata-rata pH</span>
            <p className="mt-1 text-lg font-bold text-blue-600">{summary.averages.ph} pH</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-3.5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <span className="text-gray-500">Rata-rata Suhu</span>
            <p className="mt-1 text-lg font-bold text-emerald-600">{summary.averages.temp} °C</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-3.5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <span className="text-gray-500">Rata-rata Kelembapan</span>
            <p className="mt-1 text-lg font-bold text-amber-600">{summary.averages.humidity} %</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-3.5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <span className="text-gray-500">Rata-rata Kekeruhan</span>
            <p className="mt-1 text-lg font-bold text-orange-600">{summary.averages.turbidity} NTU</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-3.5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <span className="text-gray-500">Rata-rata Ketinggian Air</span>
            <p className="mt-1 text-lg font-bold text-indigo-600">{summary.averages.water_level} cm</p>
          </div>
        </div>
      )}

      {/* Toggle Tampilan & Filter */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex rounded-lg border border-gray-200 bg-white p-1 dark:border-gray-800 dark:bg-gray-900">
          <button
            onClick={() => setViewMode('charts')}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
              viewMode === 'charts'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:text-gray-900 dark:text-gray-400'
            }`}
          >
            <TrendingUp className="h-3.5 w-3.5" />
            Grafik Tren
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
              viewMode === 'table'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:text-gray-900 dark:text-gray-400'
            }`}
          >
            <Table className="h-3.5 w-3.5" />
            Tabel Data ({records.length})
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Parameter:</span>
          <select
            value={selectedParam}
            onChange={(e) => setSelectedParam(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          >
            <option value="all">Semua Parameter</option>
            <option value="ph">pH Air</option>
            <option value="turbidity">Kekeruhan</option>
            <option value="temperature">Suhu</option>
            <option value="humidity">Kelembapan</option>
            <option value="waterLevel">Ketinggian Air</option>
          </select>
        </div>
      </div>

      {/* Konten Utama: Grafik atau Tabel */}
      {loading ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center dark:border-gray-800 dark:bg-gray-900">
          <Activity className="mx-auto h-8 w-8 text-blue-500 animate-spin" />
          <p className="mt-3 text-sm font-medium text-gray-500">Memuat rekaman database...</p>
        </div>
      ) : records.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center dark:border-gray-800 dark:bg-gray-900">
          <FileText className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600" />
          <p className="mt-4 text-base font-bold text-gray-700 dark:text-gray-300">
            Tidak Ada Data Sensor Tercatat
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Database belum memiliki rekaman data sensor pada rentang waktu ini.
          </p>
        </div>
      ) : viewMode === 'charts' ? (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h3 className="mb-4 text-base font-bold text-gray-900 dark:text-white">
            Grafik Kronologis Data Aktual Sensor
          </h3>

          <ResponsiveContainer width="100%" height={380}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="time" stroke="#6b7280" style={{ fontSize: '11px' }} />
              <YAxis stroke="#6b7280" style={{ fontSize: '11px' }} />
              <Tooltip />
              <Legend />
              {(selectedParam === 'all' || selectedParam === 'ph') && (
                <Line type="monotone" dataKey="ph" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} name="pH Air" />
              )}
              {(selectedParam === 'all' || selectedParam === 'turbidity') && (
                <Line type="monotone" dataKey="turbidity" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} name="Kekeruhan (NTU)" />
              )}
              {(selectedParam === 'all' || selectedParam === 'temperature') && (
                <Line type="monotone" dataKey="temperature" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} name="Suhu (°C)" />
              )}
              {(selectedParam === 'all' || selectedParam === 'humidity') && (
                <Line type="monotone" dataKey="humidity" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3 }} name="Kelembapan (%)" />
              )}
              {(selectedParam === 'all' || selectedParam === 'waterLevel') && (
                <Line type="monotone" dataKey="waterLevel" stroke="#06b6d4" strokeWidth={2} dot={{ r: 3 }} name="Level Air (cm)" />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600 dark:text-gray-300">
              <thead className="bg-gray-50 text-[11px] uppercase tracking-wider text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                <tr>
                  <th className="px-4 py-3">Tanggal</th>
                  <th className="px-4 py-3">Waktu</th>
                  <th className="px-4 py-3">pH Air</th>
                  <th className="px-4 py-3">Suhu</th>
                  <th className="px-4 py-3">Kelembapan</th>
                  <th className="px-4 py-3">Kekeruhan</th>
                  <th className="px-4 py-3">Level Air</th>
                  <th className="px-4 py-3">Getaran</th>
                  <th className="px-4 py-3">Status AI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {records.map((r, idx) => (
                  <tr key={r.id || idx} className="hover:bg-gray-50/80 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{r.date}</td>
                    <td className="px-4 py-3 font-mono">{r.time}</td>
                    <td className="px-4 py-3">{r.ph.toFixed(2)}</td>
                    <td className="px-4 py-3">{r.temperature.toFixed(1)} °C</td>
                    <td className="px-4 py-3">{r.humidity.toFixed(1)} %</td>
                    <td className="px-4 py-3">{r.turbidity.toFixed(2)} NTU</td>
                    <td className="px-4 py-3">{r.water_level} cm</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          r.vibration
                            ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400'
                            : 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400'
                        }`}
                      >
                        {r.vibration ? 'Terdeteksi' : 'Normal'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                        {r.ai_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
