import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import {
  Droplet,
  Thermometer,
  Wind,
  Activity,
  CloudRain,
  AlertCircle,
  Clock,
  Cpu,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { MetricCard } from '../components/MetricCard';
import { api, SensorData } from '../lib/api';
import { SensorStatus, DeviceData } from '../components/SensorStatus';
import { useLanguage } from '../context/LanguageContext';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export function Dashboard() {
  const { t } = useLanguage();
  const [hasLoaded, setHasLoaded] = useState<boolean>(false);
  const [lastSensorTime, setLastSensorTime] = useState<string>('');
  const [dataRangeText, setDataRangeText] = useState<string>('Menunggu data...');
  const [chartData, setChartData] = useState<any[]>([]);
  const [aiStatus, setAiStatus] = useState<string>('Normal');

  const [activeChart, setActiveChart] = useState<
    'water' | 'environment' | 'physical'
  >('water');

  const [metrics, setMetrics] = useState({
    ph: 7.0,
    temperature: 25.0,
    humidity: 50.0,
    turbidity: 0.5,
    waterLevel: 0,
    vibration: false,
  });

  const [device, setDevice] = useState<DeviceData | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadLatestSensor = async () => {
      try {
        const { data: nodes } = await api.nodes();
        if (!nodes.length) {
          if (!cancelled) setHasLoaded(true);
          return;
        }

        const primaryNode = nodes[0];
        const lr = (primaryNode as any).last_reading || {};

        // 1. Update informasi perangkat tunggal ESP32
        const mappedDevice: DeviceData = {
          id: String(primaryNode.id),
          kode_node: primaryNode.kode_node || 'ESP32-WATER-01',
          name: 'Unit Sensor ESP32 Utama',
          location: primaryNode.nama_lokasi || 'Titik Pantau Sensor Utama',
          status: primaryNode.is_online ? 'online' : 'offline',
          lastUpdate: primaryNode.last_seen_at
            ? new Date(primaryNode.last_seen_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB'
            : t.common.notConnected,
          rssi: (primaryNode as any).rssi ?? null,
          snr: (primaryNode as any).snr ?? null,
          metrics: {
            ph: lr.ph !== undefined && lr.ph !== null ? Number(lr.ph) : null,
            temperature: lr.temp !== undefined && lr.temp !== null ? Number(lr.temp) : null,
            humidity: lr.humidity !== undefined && lr.humidity !== null ? Number(lr.humidity) : null,
            turbidity: lr.turbidity !== undefined && lr.turbidity !== null ? Number(lr.turbidity) : null,
            waterLevel: lr.water_level !== undefined && lr.water_level !== null ? Number(lr.water_level) : null,
            vibration: lr.vibration !== undefined && lr.vibration !== null ? Boolean(lr.vibration) : null,
          },
        };

        if (!cancelled) {
          setDevice(mappedDevice);
        }

        // 2. Ambil data time-series aktual (tanpa menunggu 1 jam atau membuat data palsu)
        const response = await api.sensorData(primaryNode.id, 'per_page=30');
        const readings = response.data || [];

        if (!cancelled && readings.length > 0) {
          const latest = readings[0];
          setMetrics({
            ph: Number(latest.ph ?? 7.0),
            temperature: Number(latest.temp ?? 25.0),
            humidity: Number(latest.humidity ?? 50.0),
            turbidity: Number(latest.turbidity ?? 0.5),
            waterLevel: Number(latest.water_level ?? 0),
            vibration: Boolean(latest.vibration ?? false),
          });

          setAiStatus(latest.ai_status || (primaryNode as any).last_reading?.ai_status || 'Normal');

          const latestDate = latest.created_at ? new Date(latest.created_at) : new Date();
          setLastSensorTime(latestDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB');

          const earliest = readings[readings.length - 1];
          const earliestDate = earliest.created_at ? new Date(earliest.created_at) : latestDate;
          setDataRangeText(
            `${readings.length} data aktual • Periode: ${earliestDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} s/d ${latestDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`
          );

          // Urutkan data kronologis lama ke baru
          const formattedChart = readings
            .slice()
            .reverse()
            .map((r) => {
              const dt = r.created_at ? new Date(r.created_at) : new Date();
              return {
                time: dt.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                ph: Number(r.ph ?? 0),
                turbidity: Number(r.turbidity ?? 0),
                temperature: Number(r.temp ?? 0),
                humidity: Number(r.humidity ?? 0),
                waterLevel: Number(r.water_level ?? 0),
              };
            });

          setChartData(formattedChart);
        } else if (!cancelled && (primaryNode as any).last_reading) {
          const fallbackLr = (primaryNode as any).last_reading;
          setMetrics({
            ph: Number(fallbackLr.ph ?? 7.0),
            temperature: Number(fallbackLr.temp ?? 25.0),
            humidity: Number(fallbackLr.humidity ?? 50.0),
            turbidity: Number(fallbackLr.turbidity ?? 0.5),
            waterLevel: Number(fallbackLr.water_level ?? 0),
            vibration: Boolean(fallbackLr.vibration ?? false),
          });
          setAiStatus(fallbackLr.ai_status || 'Normal');
          if (primaryNode.last_seen_at) {
            setLastSensorTime(new Date(primaryNode.last_seen_at).toLocaleTimeString('id-ID') + ' WIB');
          }
        }
      } catch (error) {
        console.error('Gagal mengambil data sensor:', error);
      } finally {
        if (!cancelled) {
          setHasLoaded(true);
        }
      }
    };

    loadLatestSensor();
    const timer = setInterval(loadLatestSensor, 10000); // Polling tiap 10 detik

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, []);

  const phStatus =
    metrics.ph < 6.5 || metrics.ph > 8.5
      ? 'critical'
      : metrics.ph < 6.8 || metrics.ph > 7.8
        ? 'warning'
        : 'normal';

  const turbidityStatus =
    metrics.turbidity > 5.0
      ? 'critical'
      : metrics.turbidity > 1.5
        ? 'warning'
        : 'normal';

  const waterLevelStatus =
    metrics.waterLevel > 130
      ? 'critical'
      : metrics.waterLevel < 80 && metrics.waterLevel > 0
        ? 'warning'
        : 'normal';

  return (
    <div className="p-6 lg:p-8">
      {/* Header Halaman */}
      <div className="mb-8">
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Dasbor Pemantauan Kualitas Air
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-500" />
              <span>Pemantauan Real-time • Data Sensor Terakhir:</span>
              <strong className="text-gray-700 dark:text-gray-300">
                {lastSensorTime || 'Menunggu data sensor...'}
              </strong>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Badge Edge AI On-Device (Clickable -> /ai-analytics) */}
            <Link
              to="/ai-analytics"
              title="Buka Analisis AI Mendalam"
              className={`rounded-lg px-3.5 py-2 text-xs font-semibold flex items-center gap-2 border shadow-xs transition-all duration-150 hover:shadow-md hover:scale-[1.02] cursor-pointer group ${
                !hasLoaded
                  ? 'bg-gray-50 border-gray-200 text-gray-500 dark:bg-gray-800/80 dark:border-gray-700 dark:text-gray-400'
                  : aiStatus === 'Bahaya'
                    ? 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100 dark:bg-red-950/40 dark:border-red-900 dark:text-red-400'
                    : aiStatus === 'Anomali'
                      ? 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100 dark:bg-amber-950/40 dark:border-amber-900 dark:text-amber-400'
                      : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:border-emerald-900 dark:text-emerald-400'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5 text-blue-500 animate-pulse" />
              <span>
                AI Status: {!hasLoaded ? t.common.loading : aiStatus}
              </span>
              <ChevronRight className="h-3 w-3 opacity-60 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <div
              className={`rounded-lg px-4 py-2 ${
                !hasLoaded
                  ? 'bg-gray-100 dark:bg-gray-800'
                  : metrics.vibration || phStatus === 'critical' || turbidityStatus === 'critical'
                    ? 'bg-red-100 dark:bg-red-950'
                    : 'bg-green-100 dark:bg-green-950'
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    !hasLoaded
                      ? 'bg-gray-400'
                      : metrics.vibration || phStatus === 'critical' || turbidityStatus === 'critical'
                        ? 'bg-red-500 animate-pulse'
                        : 'bg-green-500'
                  }`}
                />
                <span
                  className={`text-sm font-semibold ${
                    !hasLoaded
                      ? 'text-gray-700 dark:text-gray-300'
                      : metrics.vibration || phStatus === 'critical' || turbidityStatus === 'critical'
                        ? 'text-red-700 dark:text-red-400'
                        : 'text-green-700 dark:text-green-400'
                  }`}
                >
                  {!hasLoaded
                    ? t.common.waitingData
                    : metrics.vibration
                      ? t.dashboard.vibrationWarning
                      : phStatus === 'critical' || turbidityStatus === 'critical'
                        ? 'Kondisi Kritis Terdeteksi'
                        : 'Semua Parameter Normal'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Metrik Utama */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {/* pH Air */}
          <MetricCard
            title="pH Air"
            value={hasLoaded ? metrics.ph : '-'}
            unit={hasLoaded ? "pH" : ""}
            icon={Droplet}
            trend={metrics.ph > 7.0 ? 'up' : 'down'}
            trendValue={metrics.ph > 7.0 ? '+0.02' : '-0.02'}
            status={!hasLoaded ? 'normal' : phStatus}
            min={0}
            max={14}
            gaugeColor="#10b981"
          />

          {/* Suhu */}
          <MetricCard
            title="Suhu (DHT)"
            value={hasLoaded ? metrics.temperature : '-'}
            unit={hasLoaded ? "°C" : ""}
            icon={Thermometer}
            trend="stable"
            trendValue="±0.2"
            status={!hasLoaded ? 'normal' : (metrics.temperature > 28 ? 'warning' : 'normal')}
            min={0}
            max={50}
            gaugeColor="#3b82f6"
          />

          {/* Kelembapan */}
          <MetricCard
            title="Kelembapan (DHT)"
            value={hasLoaded ? metrics.humidity : '-'}
            unit={hasLoaded ? "%" : ""}
            icon={CloudRain}
            trend="stable"
            trendValue="±1%"
            status="normal"
            min={0}
            max={100}
            gaugeColor="#eab308"
          />

          {/* Kekeruhan */}
          <MetricCard
            title="Kekeruhan"
            value={hasLoaded ? metrics.turbidity : '-'}
            unit={hasLoaded ? "NTU" : ""}
            icon={Wind}
            trend="stable"
            trendValue="±0.05"
            status={!hasLoaded ? 'normal' : turbidityStatus}
            min={0}
            max={5}
            gaugeColor="#f97316"
          />
        </div>
      </div>

      {/* Bagian Grafik + Kondisi Fisik */}
      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Grafik Utama */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900 lg:col-span-2">
          {/* Navigasi Tab Grafik */}
          <div className="flex flex-wrap border-b border-gray-200 p-2 dark:border-gray-800">
            <button
              onClick={() => setActiveChart('water')}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                activeChart === 'water'
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400'
                  : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              Kualitas Air (pH & Kekeruhan)
            </button>

            <button
              onClick={() => setActiveChart('environment')}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                activeChart === 'environment'
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400'
                  : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              Lingkungan (Suhu & Kelembapan)
            </button>

            <button
              onClick={() => setActiveChart('physical')}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                activeChart === 'physical'
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400'
                  : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              Fisik (Level Air & Getaran)
            </button>
          </div>

          {/* Konten Grafik */}
          <div className="p-5">
            {/* Water Chart */}
            {activeChart === 'water' && (
              <>
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      pH & Kekeruhan Air
                    </h3>
                    <p className="text-xs text-gray-500">
                      {dataRangeText}
                    </p>
                  </div>
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                    Data Aktual ESP32
                  </span>
                </div>

                {chartData.length === 0 ? (
                  <div className="flex h-[300px] flex-col items-center justify-center text-center">
                    <Activity className="h-10 w-10 text-gray-300 dark:text-gray-600 mb-2 animate-pulse" />
                    <p className="text-sm font-medium text-gray-500">Belum ada data sensor pada sesi ini</p>
                    <p className="text-xs text-gray-400 mt-1">Grafik akan langsung terbentuk saat ESP32 mengirim data.</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="time" stroke="#6b7280" style={{ fontSize: '11px' }} />
                      <YAxis yAxisId="left" domain={['auto', 'auto']} stroke="#3b82f6" style={{ fontSize: '11px' }} />
                      <YAxis yAxisId="right" orientation="right" domain={['auto', 'auto']} stroke="#f59e0b" style={{ fontSize: '11px' }} />
                      <Tooltip />
                      <Legend />
                      <Line yAxisId="left" type="monotone" dataKey="ph" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} name="pH Air" />
                      <Line yAxisId="right" type="monotone" dataKey="turbidity" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} name="Kekeruhan (NTU)" />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </>
            )}

            {/* Environment Chart */}
            {activeChart === 'environment' && (
              <>
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Suhu & Kelembapan
                    </h3>
                    <p className="text-xs text-gray-500">
                      {dataRangeText}
                    </p>
                  </div>
                  <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-600 dark:bg-green-950/50 dark:text-green-400">
                    Sensor DHT Terintegrasi
                  </span>
                </div>

                {chartData.length === 0 ? (
                  <div className="flex h-[300px] flex-col items-center justify-center text-center">
                    <Activity className="h-10 w-10 text-gray-300 dark:text-gray-600 mb-2 animate-pulse" />
                    <p className="text-sm font-medium text-gray-500">Belum ada data suhu & kelembapan</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="time" stroke="#6b7280" style={{ fontSize: '11px' }} />
                      <YAxis yAxisId="left" stroke="#10b981" style={{ fontSize: '11px' }} />
                      <YAxis yAxisId="right" orientation="right" stroke="#8b5cf6" style={{ fontSize: '11px' }} />
                      <Tooltip />
                      <Legend />
                      <Area yAxisId="left" type="monotone" dataKey="temperature" stroke="#10b981" fill="#10b981" fillOpacity={0.15} strokeWidth={2} name="Suhu (°C)" />
                      <Area yAxisId="right" type="monotone" dataKey="humidity" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.15} strokeWidth={2} name="Kelembapan (%)" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </>
            )}

            {/* Physical Chart */}
            {activeChart === 'physical' && (
              <>
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Level Air & Getaran
                    </h3>
                    <p className="text-xs text-gray-500">
                      {dataRangeText}
                    </p>
                  </div>
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                    Ultrasonik + MPU6050
                  </span>
                </div>

                {chartData.length === 0 ? (
                  <div className="flex h-[300px] flex-col items-center justify-center text-center">
                    <Activity className="h-10 w-10 text-gray-300 dark:text-gray-600 mb-2 animate-pulse" />
                    <p className="text-sm font-medium text-gray-500">Belum ada data fisik level air & getaran</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="time" stroke="#6b7280" style={{ fontSize: '11px' }} />
                      <YAxis stroke="#6b7280" style={{ fontSize: '11px' }} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="waterLevel" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Ketinggian Air (cm)" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </>
            )}
          </div>
        </div>

        {/* Panel Kondisi Fisik Perangkat */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h3 className="mb-5 text-lg font-bold text-gray-900 dark:text-white">
            Kondisi Fisik Sistem Air
          </h3>

          <div className="space-y-6">
            {/* Level Air */}
            <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-800/50">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Tinggi Permukaan Air
                </span>
                <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                  Sensor Ultrasonik
                </span>
              </div>

              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-extrabold text-gray-900 dark:text-white">
                  {hasLoaded ? metrics.waterLevel : '-'}
                </span>
                <span className="text-sm text-gray-500">cm</span>
              </div>

              <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                <div
                  className="h-full rounded-full bg-blue-500 transition-all duration-500"
                  style={{
                    width: `${hasLoaded ? Math.min(
                      Math.max((metrics.waterLevel / 200) * 100, 0),
                      100
                    ) : 0}%`,
                  }}
                />
              </div>

              <div className="mt-2 flex justify-between text-[11px] text-gray-400">
                <span>0 cm (Kosong)</span>
                <span>200 cm (Maksimal)</span>
              </div>
            </div>

            {/* Getaran */}
            <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-800/50">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Status Getaran Mekanik
                </span>
                <span className="text-xs font-semibold text-gray-500">
                  Sensor MPU6050
                </span>
              </div>

              <div
                className={`text-3xl font-extrabold ${
                  !hasLoaded
                    ? 'text-gray-900 dark:text-white'
                    : metrics.vibration
                    ? 'text-red-600'
                    : 'text-green-600'
                }`}
              >
                {!hasLoaded
                  ? t.common.noData
                  : metrics.vibration
                  ? t.dashboard.vibrationActive
                  : t.dashboard.vibrationNormal}
              </div>

              <div className="mt-4 flex items-center gap-2">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    !hasLoaded
                      ? 'bg-gray-400'
                      : metrics.vibration
                      ? 'animate-pulse bg-red-500'
                      : 'bg-green-500'
                  }`}
                />
                <span className="text-xs text-gray-500">
                  {!hasLoaded
                    ? t.common.waitingData
                    : metrics.vibration
                    ? t.dashboard.vibrationWarning
                    : t.dashboard.vibrationSafe}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bagian Status Perangkat & Jaringan ESP32 (Representasi 1 Unit Fisik) */}
      <SensorStatus device={device} hasLoaded={hasLoaded} />
    </div>
  );
}