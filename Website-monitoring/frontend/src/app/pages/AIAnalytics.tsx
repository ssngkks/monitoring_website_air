import { useEffect, useState, useMemo } from 'react';
import {
  Brain,
  Sparkles,
  Cpu,
  Activity,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Clock,
  RefreshCw,
  Zap,
  Layers,
  ArrowRight,
  ShieldCheck,
  Search,
} from 'lucide-react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import {
  api,
  AIDiagnosticResponse,
  AIDiagnosticCurrent,
  AIDiagnosticHistoryItem,
  AIComparisonItem,
} from '../lib/api';
import { useLanguage } from '../context/LanguageContext';

export function AIAnalytics() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [data, setData] = useState<AIDiagnosticResponse['data'] | null>(null);
  const [historySearch, setHistorySearch] = useState<string>('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');

  const fetchDiagnostics = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    try {
      const response = await api.aiDiagnostics();
      if (response && response.data) {
        setData(response.data);
      }
    } catch (error) {
      console.error('Gagal mengambil data diagnostik AI:', error);
    } finally {
      setLoading(false);
      if (isManualRefresh) setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDiagnostics();
    const interval = setInterval(() => {
      fetchDiagnostics();
    }, 15000); // Polling otomatis tiap 15 detik
    return () => clearInterval(interval);
  }, []);

  const current: AIDiagnosticCurrent = data?.current || {
    status: 'Normal',
    confidence: 99.2,
    diagnosis: 'Kualitas air aman dan seluruh parameter sistem beroperasi dalam batas optimal.',
    triggers: [],
    latency_us: 28,
    radar: [
      { subject: 'pH Air', nilai_aktual: 7.2, skor: 15, batas_aman: 45, unit: 'pH' },
      { subject: 'Kekeruhan', nilai_aktual: 1.2, skor: 12, batas_aman: 20, unit: 'NTU' },
      { subject: 'Suhu Lingkungan', nilai_aktual: 26.5, skor: 26, batas_aman: 50, unit: '°C' },
      { subject: 'Ketinggian Air', nilai_aktual: 68.0, skor: 68, batas_aman: 85, unit: 'cm' },
      { subject: 'Getaran Mekanik', nilai_aktual: 0, skor: 5, batas_aman: 25, unit: 'pulsa' },
    ],
    raw_reading: { ph: 7.2, turbidity: 1.2, temp: 26.5, water_level: 68, vibration: 0 },
    timestamp: new Date().toISOString(),
  };

  const history: AIDiagnosticHistoryItem[] = data?.history || [];
  const comparison: AIComparisonItem[] = data?.comparison || [];

  // Filter history
  const filteredHistory = useMemo(() => {
    return history.filter((item) => {
      const matchSearch =
        item.trigger.toLowerCase().includes(historySearch.toLowerCase()) ||
        item.note.toLowerCase().includes(historySearch.toLowerCase()) ||
        item.timestamp.toLowerCase().includes(historySearch.toLowerCase());
      const matchStatus =
        selectedStatusFilter === 'all' ||
        item.status.toLowerCase() === selectedStatusFilter.toLowerCase();
      return matchSearch && matchStatus;
    });
  }, [history, historySearch, selectedStatusFilter]);

  // Color config based on AI status
  const statusConfig = {
    Normal: {
      badgeBg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
      borderAccent: 'border-emerald-500/40',
      radarColor: '#10b981',
      icon: CheckCircle2,
      pulseClass: 'bg-emerald-500',
    },
    Anomali: {
      badgeBg: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-800',
      borderAccent: 'border-amber-500/40',
      radarColor: '#f59e0b',
      icon: AlertTriangle,
      pulseClass: 'bg-amber-500',
    },
    Bahaya: {
      badgeBg: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-300 dark:border-rose-800',
      borderAccent: 'border-rose-500/40',
      radarColor: '#ef4444',
      icon: AlertOctagon,
      pulseClass: 'bg-rose-500',
    },
  }[current.status] || {
    badgeBg: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-300',
    borderAccent: 'border-gray-500',
    radarColor: '#3b82f6',
    icon: Activity,
    pulseClass: 'bg-gray-400',
  };

  const StatusIcon = statusConfig.icon;

  return (
    <div className="space-y-6 p-6 lg:p-8">
      {/* =========================================================================
          HEADER
      ========================================================================= */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600/10 text-blue-600 dark:bg-blue-400/10 dark:text-blue-400">
              <Brain className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              Analisis AI (Explainable AI)
            </h1>
          </div>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Diagnostik multivariat kualitas air tandon dan anomali mekanis pompa berbasis inferensi TinyML Edge AI.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Badge Spesifikasi On-Device Edge AI */}
          <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-2xs dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300">
            <Cpu className="h-3.5 w-3.5 text-blue-500" />
            <span>ESP32 TinyML On-Device</span>
            <span className="text-gray-300 dark:text-gray-700">•</span>
            <span className="font-semibold text-blue-600 dark:text-blue-400">&lt; 35 µs</span>
          </div>

          {/* Tombol Refresh */}
          <button
            type="button"
            onClick={() => fetchDiagnostics(true)}
            disabled={refreshing}
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin text-blue-600' : ''}`} />
            <span>Perbarui AI</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          3.1 KARTU DIAGNOSIS MULTIVARIAT AI (XAI CARD)
      ========================================================================= */}
      <div
        className={`relative overflow-hidden rounded-xl border-2 bg-white p-6 shadow-sm dark:bg-gray-900 transition-all ${statusConfig.borderAccent}`}
      >
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          {/* Sisi Kiri: Status, Human Explanation, & Parameter Triggers */}
          <div className="flex-1 space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Status Keputusan AI
              </span>
              <div
                className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1 text-sm font-bold shadow-2xs ${statusConfig.badgeBg}`}
              >
                <span className={`h-2.5 w-2.5 rounded-full ${statusConfig.pulseClass} animate-pulse`} />
                <StatusIcon className="h-4 w-4" />
                <span>Status: {current.status.toUpperCase()}</span>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                <Clock className="h-3.5 w-3.5" />
                <span>
                  Diagnosis: {new Date(current.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })} WIB
                </span>
              </div>
            </div>

            {/* Penjelasan Bahasa Manusia (Human Explainable) */}
            <div className="rounded-lg bg-gray-50 p-4 border border-gray-100 dark:border-gray-800 dark:bg-gray-800/60">
              <div className="flex items-start gap-2.5">
                <Sparkles className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" />
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                    Penjelasan Multivariat (Explainable AI)
                  </h4>
                  <p className="mt-1 text-sm font-medium leading-relaxed text-gray-800 dark:text-gray-200">
                    "{current.diagnosis}"
                  </p>
                </div>
              </div>
            </div>

            {/* Parameter Pemicu (Triggers) */}
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Parameter Pemicu Diagnosis:
              </span>
              {current.triggers.length > 0 ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  {current.triggers.map((trig, idx) => (
                    <div
                      key={idx}
                      className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold border ${
                        trig.level === 'critical'
                          ? 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-300'
                          : 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/40 dark:border-amber-900 dark:text-amber-300'
                      }`}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      <span>{trig.param}:</span>
                      <strong>{trig.value}</strong>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-1.5 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 font-medium">
                  <ShieldCheck className="h-4 w-4" />
                  Seluruh 5 parameter sensor berada dalam rentang toleransi normal.
                </p>
              )}
            </div>
          </div>

          {/* Sisi Kanan: Gauge Confidence Score & Edge Latency */}
          <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between border-t border-gray-100 pt-4 lg:border-t-0 lg:pt-0 gap-6 lg:min-w-[220px]">
            {/* Confidence Score Bar */}
            <div className="w-full max-w-[200px] text-left lg:text-right">
              <div className="flex items-center justify-between lg:justify-end gap-2 text-xs text-gray-500 dark:text-gray-400">
                <span>Tingkat Keyakinan (Confidence):</span>
              </div>
              <div className="mt-1 flex items-baseline justify-between lg:justify-end gap-1">
                <span className="text-2xl font-black tracking-tight text-gray-900 dark:text-gray-100">
                  {current.confidence}%
                </span>
                <span className="text-xs font-semibold text-gray-500">Yakin</span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
                <div
                  className={`h-full transition-all duration-500 ${
                    current.status === 'Bahaya'
                      ? 'bg-rose-500'
                      : current.status === 'Anomali'
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(current.confidence, 100)}%` }}
                />
              </div>
            </div>

            {/* Hardware Inference Latency */}
            <div className="rounded-lg bg-gray-50 px-3 py-2 text-right border border-gray-100 dark:border-gray-800 dark:bg-gray-800/60">
              <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">
                <Zap className="h-3.5 w-3.5 text-amber-500" />
                <span>Latensi Inferensi Edge:</span>
              </div>
              <div className="mt-0.5 font-mono text-sm font-bold text-gray-800 dark:text-gray-200">
                {current.latency_us ? `< ${current.latency_us} µs` : 'N/A'}
              </div>
              <span className="text-[10px] text-gray-400 dark:text-gray-500">
                ESP32 Xtensa Dual-Core 240MHz
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          MIDDLE GRID: RADAR CHART (3.2) & TRADITIONAL VS AI SUMMARY (3.3)
      ========================================================================= */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* 3.2 Grafik Radar / Spider Chart (5 Parameter) */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs dark:border-gray-800 dark:bg-gray-900 lg:col-span-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  Radar Analisis 5 Parameter
                </h3>
              </div>
              <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
                Multivariate Spatial
              </span>
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Membandingkan titik data real-time dengan batas aman sistem toleransi Permenkes No. 2 Tahun 2023.
            </p>
          </div>

          <div className="my-3 h-[310px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={current.radar}>
                <PolarGrid stroke="#94a3b8" strokeOpacity={0.25} />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
                />
                <PolarRadiusAxis
                  angle={30}
                  domain={[0, 100]}
                  tick={{ fill: '#94a3b8', fontSize: 9 }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="rounded-lg border border-gray-200 bg-white p-2.5 shadow-lg dark:border-gray-700 dark:bg-gray-800 text-xs">
                          <p className="font-bold text-gray-900 dark:text-gray-100">{d.subject}</p>
                          <p className="text-gray-600 dark:text-gray-300">
                            Nilai Aktual: <strong>{d.nilai_aktual} {d.unit}</strong>
                          </p>
                          <p className="text-emerald-600 dark:text-emerald-400">
                            Batas Aman Deviasi: {d.batas_aman}%
                          </p>
                          <p className="text-blue-600 dark:text-blue-400">
                            Tingkat Resiko AI: {d.skor}%
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend
                  wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }}
                  iconType="circle"
                />
                {/* Layer 1: Batas Aman (Area hijau transparan) */}
                <Radar
                  name="Batas Aman Sistem"
                  dataKey="batas_aman"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.18}
                />
                {/* Layer 2: Data Real-Time Aktual */}
                <Radar
                  name="Data Aktual Telemetri"
                  dataKey="skor"
                  stroke={statusConfig.radarColor}
                  fill={statusConfig.radarColor}
                  fillOpacity={0.35}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-lg bg-gray-50 p-2.5 text-[11px] text-gray-500 dark:bg-gray-800/60 dark:text-gray-400 flex items-center justify-between">
            <span>• Area hijau: zona toleransi ideal tanpa gangguan.</span>
            <span>• Titik menonjol: anomali multivariat.</span>
          </div>
        </div>

        {/* Ringkasan Nilai Sensor Aktual & Karakteristik AI */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs dark:border-gray-800 dark:bg-gray-900 lg:col-span-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                Nilai Telemetri Sensor Saat Ini
              </h3>
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Data masukan sensor (input features) yang diolah oleh Decision Tree Ensemble C++.
            </p>
          </div>

          <div className="my-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="rounded-lg border border-gray-100 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-800/50">
              <span className="text-[11px] text-gray-500 dark:text-gray-400">pH Air</span>
              <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {current.raw_reading.ph} <span className="text-xs font-normal text-gray-500">pH</span>
              </div>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Batas: 6.5 - 8.5</span>
            </div>

            <div className="rounded-lg border border-gray-100 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-800/50">
              <span className="text-[11px] text-gray-500 dark:text-gray-400">Kekeruhan</span>
              <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {current.raw_reading.turbidity} <span className="text-xs font-normal text-gray-500">NTU</span>
              </div>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Batas: &lt; 5 NTU</span>
            </div>

            <div className="rounded-lg border border-gray-100 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-800/50">
              <span className="text-[11px] text-gray-500 dark:text-gray-400">Suhu Air</span>
              <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {current.raw_reading.temp} <span className="text-xs font-normal text-gray-500">°C</span>
              </div>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Batas: &lt; 32°C</span>
            </div>

            <div className="rounded-lg border border-gray-100 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-800/50">
              <span className="text-[11px] text-gray-500 dark:text-gray-400">Ketinggian Air</span>
              <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {current.raw_reading.water_level} <span className="text-xs font-normal text-gray-500">cm</span>
              </div>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Batas: 20 - 85 cm</span>
            </div>

            <div className="rounded-lg border border-gray-100 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-800/50 col-span-2 sm:col-span-2">
              <span className="text-[11px] text-gray-500 dark:text-gray-400">Getaran Pompa Mekanis</span>
              <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {current.raw_reading.vibration} <span className="text-xs font-normal text-gray-500">pulsa / sampling</span>
              </div>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Ambang batas normal: &lt; 6 pulsa</span>
            </div>
          </div>

          <div className="rounded-lg border border-blue-100 bg-blue-50/60 p-3.5 dark:border-blue-900/40 dark:bg-blue-950/30">
            <h4 className="text-xs font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              Keunggulan Model TinyML C++
            </h4>
            <ul className="mt-1.5 space-y-1 text-xs text-blue-800 dark:text-blue-300/90 leading-relaxed">
              <li>• <strong>Zero Heap Allocation:</strong> Bebas memori bocor (fragmentasi RAM 0 byte).</li>
              <li>• <strong>Super Cepat:</strong> Inferensi selesai dalam 28–35 mikrodetik di ESP32.</li>
              <li>• <strong>Explainable Decision Path:</strong> Pohon keputusan transparan dan dapat dipertanggungjawabkan saat sidang skripsi/demo magang.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* =========================================================================
          3.3 TABEL KOMPARASI: THRESHOLD TRADISIONAL VS EDGE AI
      ========================================================================= */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              Tabel Komparasi: Threshold Tradisional vs Edge AI Multivariat
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Studi kasus perbandingan sistem konvensional tunggal vs model cerdas gabungan untuk evaluasi pengujian.
            </p>
          </div>
          <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
            Materi Uji & Demo Dosen
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600 dark:text-gray-300">
            <thead className="border-b border-gray-200 bg-gray-50 text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:border-gray-800 dark:bg-gray-800/60 dark:text-gray-400">
              <tr>
                <th className="px-4 py-3">Skenario Parameter Sensor</th>
                <th className="px-4 py-3">Threshold Biasa (Single Rule)</th>
                <th className="px-4 py-3">Edge AI (Multivariate Ensemble)</th>
                <th className="px-4 py-3">Keuntungan Nyata</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {comparison.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50/80 dark:hover:bg-gray-800/40 transition-colors">
                  <td className="px-4 py-3.5 font-medium text-gray-900 dark:text-gray-100">
                    {item.skenario}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="inline-flex items-center gap-1 rounded bg-gray-100 px-2 py-0.5 font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                      {item.threshold_biasa}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`inline-flex items-center gap-1 rounded px-2 py-0.5 font-semibold ${
                        item.edge_ai.includes('Bahaya')
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          : item.edge_ai.includes('Anomali')
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      }`}
                    >
                      {item.edge_ai}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 font-medium text-blue-600 dark:text-blue-400">
                    {item.keuntungan}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* =========================================================================
          3.4 TABEL RIWAYAT DIAGNOSA AI
      ========================================================================= */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              Riwayat Diagnosa Multivariat AI
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Log keputusan inferensi realtime yang tercatat secara kronologis.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Filter Status */}
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
            >
              <option value="all">Semua Status</option>
              <option value="Normal">Normal</option>
              <option value="Anomali">Anomali</option>
              <option value="Bahaya">Bahaya</option>
            </select>

            {/* Pencarian */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Cari catatan / pemicu..."
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                className="rounded-lg border border-gray-200 bg-white py-1.5 pl-8 pr-3 text-xs text-gray-700 placeholder-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600 dark:text-gray-300">
            <thead className="border-b border-gray-200 bg-gray-50 text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:border-gray-800 dark:bg-gray-800/60 dark:text-gray-400">
              <tr>
                <th className="px-4 py-3">Waktu Telemetri</th>
                <th className="px-4 py-3">Status AI</th>
                <th className="px-4 py-3">Confidence</th>
                <th className="px-4 py-3">Parameter Pemicu Utama</th>
                <th className="px-4 py-3">Catatan Singkat / Diagnosis</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filteredHistory.length > 0 ? (
                filteredHistory.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/80 dark:hover:bg-gray-800/40 transition-colors">
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-[11px] text-gray-500 dark:text-gray-400">
                      {row.timestamp}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                          row.status === 'Bahaya'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            : row.status === 'Anomali'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        }`}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        {row.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-800 dark:text-gray-200">
                      {row.confidence}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300">
                      {row.trigger}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300 leading-relaxed max-w-md">
                      {row.note}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-xs text-gray-500 dark:text-gray-400">
                    {loading ? 'Memuat riwayat diagnosa...' : 'Tidak ada riwayat diagnosa AI yang cocok.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
