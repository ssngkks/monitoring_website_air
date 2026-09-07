import { useState } from 'react';
import { Download, FileText, Calendar, TrendingUp, Filter, Table } from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const weeklyData = [
  { day: 'Sen', ph: 7.1, temperature: 22.3, humidity: 63, turbidity: 0.71, waterLevel: 97.2 },
  { day: 'Sel', ph: 7.3, temperature: 23.1, humidity: 66, turbidity: 0.85, waterLevel: 99.5 },
  { day: 'Rab', ph: 7.0, temperature: 22.8, humidity: 62, turbidity: 0.68, waterLevel: 102.1 },
  { day: 'Kam', ph: 6.8, temperature: 24.2, humidity: 70, turbidity: 1.12, waterLevel: 95.3 },
  { day: 'Jum', ph: 7.2, temperature: 23.5, humidity: 65, turbidity: 0.79, waterLevel: 98.7 },
  { day: 'Sab', ph: 7.4, temperature: 21.9, humidity: 60, turbidity: 0.62, waterLevel: 104.0 },
  { day: 'Min', ph: 7.1, temperature: 22.4, humidity: 64, turbidity: 0.74, waterLevel: 100.2 },
];

const sensorDistribution = [
  { name: 'Sensor pH', value: 1 },
  { name: 'Sensor DHT (Suhu)', value: 1 },
  { name: 'Sensor DHT (Humid)', value: 1 },
  { name: 'Sensor Turbidity', value: 1 },
  { name: 'Sensor Ultrasonik', value: 1 },
  { name: 'Sensor Getar', value: 1 },
];

const COLORS = ['#3b82f6', '#10b981', '#06b6d4', '#f59e0b', '#8b5cf6', '#ef4444'];

const tableData = [
  { date: '2026-09-02', ph: 7.20, temperature: 22.5, humidity: 64, turbidity: 0.72, waterLevel: 98.4, vibration: 0 },
  { date: '2026-09-01', ph: 7.15, temperature: 22.8, humidity: 63, turbidity: 0.68, waterLevel: 97.2, vibration: 0 },
  { date: '2026-08-31', ph: 7.31, temperature: 23.1, humidity: 66, turbidity: 0.85, waterLevel: 99.5, vibration: 1 },
  { date: '2026-08-30', ph: 6.95, temperature: 24.2, humidity: 70, turbidity: 1.12, waterLevel: 95.3, vibration: 0 },
  { date: '2026-08-29', ph: 7.40, temperature: 21.9, humidity: 60, turbidity: 0.62, waterLevel: 104.0, vibration: 0 },
];

export function Reports() {
  const [reportType, setReportType] = useState('overview');
  const [dateRange, setDateRange] = useState('week');
  const [viewMode, setViewMode] = useState('charts');

  const downloadReport = (format: string) => {
    if (format === 'csv') {
      const csvContent = [
        ['Tanggal', 'pH', 'Suhu (°C)', 'Kelembapan (%)', 'Kekeruhan (NTU)', 'Level Air (cm)', 'Getaran'],
        ...tableData.map((row) => [
          row.date,
          row.ph,
          row.temperature,
          row.humidity,
          row.turbidity,
          row.waterLevel,
          row.vibration === 1 ? 'Terdeteksi' : 'Normal',
        ]),
      ]
        .map((row) => row.join(','))
        .join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `water-monitoring-report-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
    } else if (format === 'pdf') {
      alert('Ekspor PDF akan diimplementasikan di sini');
    } else if (format === 'excel') {
      alert('Ekspor Excel akan diimplementasikan di sini');
    }
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Laporan & Data Sensor</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Lihat, analisis, dan unduh laporan komprehensif dari semua sensor
        </p>
      </div>

      {/* Controls */}
      <div className="mb-6 grid gap-4 lg:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Jenis Laporan</label>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800"
          >
            <option value="overview">Ringkasan Sistem</option>
            <option value="ph">Kualitas pH</option>
            <option value="dht">Suhu & Kelembapan (DHT)</option>
            <option value="turbidity">Kekeruhan Air</option>
            <option value="level">Level Air (Ultrasonik)</option>
            <option value="vibration">Riwayat Getaran</option>
          </select>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Rentang Waktu</label>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800"
          >
            <option value="today">Hari Ini</option>
            <option value="week">7 Hari Terakhir</option>
            <option value="month">30 Hari Terakhir</option>
            <option value="quarter">3 Bulan Terakhir</option>
            <option value="year">Setahun Terakhir</option>
            <option value="custom">Kustom</option>
          </select>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Tampilan</label>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('charts')}
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                viewMode === 'charts'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
              }`}
            >
              <TrendingUp className="mx-auto h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                viewMode === 'table'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
              }`}
            >
              <Table className="mx-auto h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Ekspor Data</label>
          <div className="flex gap-2">
            <button
              onClick={() => downloadReport('csv')}
              className="flex-1 rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700"
            >
              CSV
            </button>
            <button
              onClick={() => downloadReport('pdf')}
              className="flex-1 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
            >
              PDF
            </button>
            <button
              onClick={() => downloadReport('excel')}
              className="flex-1 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              Excel
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">pH Rata-rata</p>
              <p className="mt-1 text-2xl font-bold">7.14</p>
              <p className="mt-1 text-xs text-green-600">Normal (6.5–8.5)</p>
            </div>
            
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Suhu Rata-rata</p>
              <p className="mt-1 text-2xl font-bold">22.8°C</p>
              <p className="mt-1 text-xs text-green-600">+0.3°C minggu lalu</p>
            </div>
            
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Kekeruhan Maks.</p>
              <p className="mt-1 text-2xl font-bold">1.12 NTU</p>
              <p className="mt-1 text-xs text-yellow-600">Mendekati batas</p>
            </div>
            
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Getaran Terdeteksi</p>
              <p className="mt-1 text-2xl font-bold">1×</p>
              <p className="mt-1 text-xs text-green-600">Dalam 7 hari</p>
            </div>
            
          </div>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'charts' ? (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* pH Trend */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h3 className="mb-4 text-lg font-semibold">Tren pH Mingguan</h3>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart id="reports-ph-chart" data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="day" stroke="#6b7280" />
                <YAxis stroke="#6b7280" domain={[6.5, 8]} />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(255,255,255,0.98)', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                <Line type="monotone" dataKey="ph" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', r: 4 }} name="pH" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Turbidity & Water Level */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h3 className="mb-4 text-lg font-semibold">Kekeruhan & Level Air</h3>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart id="reports-turbidity-level-chart" data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="day" stroke="#6b7280" />
                <YAxis yAxisId="left" stroke="#f59e0b" />
                <YAxis yAxisId="right" orientation="right" stroke="#06b6d4" />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(255,255,255,0.98)', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="turbidity" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b', r: 4 }} name="Turbidity (NTU)" />
                <Line yAxisId="right" type="monotone" dataKey="waterLevel" stroke="#06b6d4" strokeWidth={2} dot={{ fill: '#06b6d4', r: 4 }} name="Level Air (cm)" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Temperature & Humidity (DHT) */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h3 className="mb-4 text-lg font-semibold">Suhu & Kelembapan (DHT)</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart id="reports-dht-chart" data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="day" stroke="#6b7280" />
                <YAxis yAxisId="left" stroke="#10b981" />
                <YAxis yAxisId="right" orientation="right" stroke="#8b5cf6" />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(255,255,255,0.98)', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                <Legend />
                <Bar yAxisId="left" dataKey="temperature" fill="#10b981" radius={[4, 4, 0, 0]} name="Suhu (°C)" />
                <Bar yAxisId="right" dataKey="humidity" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Kelembapan (%)" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Sensor Distribution */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h3 className="mb-4 text-lg font-semibold">Distribusi Sensor Aktif</h3>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={sensorDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name }) => name}
                  outerRadius={90}
                  dataKey="value"
                >
                  {sensorDistribution.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        /* Table View */
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800">
                <tr>
                  <th className="px-5 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Tanggal</th>
                  <th className="px-5 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">pH</th>
                  <th className="px-5 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Suhu (°C)</th>
                  <th className="px-5 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Kelembapan (%)</th>
                  <th className="px-5 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Turbidity (NTU)</th>
                  <th className="px-5 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Level Air (cm)</th>
                  <th className="px-5 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Getaran</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {tableData.map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-5 py-4 text-sm font-medium text-gray-900 dark:text-white">{row.date}</td>
                    <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400">{row.ph.toFixed(2)}</td>
                    <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400">{row.temperature}</td>
                    <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400">{row.humidity}</td>
                    <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400">{row.turbidity.toFixed(2)}</td>
                    <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400">{row.waterLevel}</td>
                    <td className="px-5 py-4 text-sm">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${row.vibration ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400' : 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400'}`}>
                        {row.vibration ? 'Terdeteksi' : 'Normal'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="border-t border-gray-200 p-6 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Menampilkan {tableData.length} data · Total: 150 data tersedia
              </p>
              <button
                onClick={() => downloadReport('csv')}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
              >
                <Download className="h-4 w-4" />
                Unduh Dataset Lengkap
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
