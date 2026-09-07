import { useState, useEffect } from 'react';
import {
  Droplet,
  Thermometer,
  Wind,
  Waves,
  Activity,
  CloudRain,
  TrendingUp,
  TrendingDown,
  AlertCircle,
} from 'lucide-react';
import { MetricCard } from '../components/MetricCard';
import { api, SensorData } from '../lib/api';
import { SensorStatus, Sensor } from '../components/SensorStatus';
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

const generateTimeSeriesData = () => {
  const data = [];
  const now = new Date();

  for (let i = 23; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60 * 60 * 1000);

    data.push({
      time: time.getHours() + ':00',
      ph: +(Math.random() * 0.8 + 6.8).toFixed(2),
      turbidity: +(Math.random() * 0.8 + 0.3).toFixed(2),
      temperature: +(Math.random() * 4 + 20).toFixed(1),
      humidity: +(Math.random() * 15 + 55).toFixed(1),
      waterLevel: +(Math.random() * 20 + 90).toFixed(1),
    });
  }

  return data;
};

export function Dashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [chartData] = useState(generateTimeSeriesData());

  const [activeChart, setActiveChart] = useState<
    'water' | 'environment' | 'physical'
  >('water');

  const [metrics, setMetrics] = useState({
    ph: 7.2,
    temperature: 22.5,
    humidity: 64,
    turbidity: 0.72,
    waterLevel: 98.4,
    vibration: false,
  });

  const [sensors] = useState<Sensor[]>([
    {
      id: '1',
      location: 'Titik Pantau A',
      status: 'online',
      lastUpdate: '30s ago',
      metrics: {
        ph: 7.2,
        temperature: 22.5,
        humidity: 64,
        turbidity: 0.72,
        waterLevel: 98.4,
        vibration: false,
      },
    },
    {
      id: '2',
      location: 'Titik Pantau B',
      status: 'online',
      lastUpdate: '45s ago',
      metrics: {
        ph: 7.0,
        temperature: 23.1,
        humidity: 61,
        turbidity: 0.65,
        waterLevel: 103.2,
        vibration: false,
      },
    },
    {
      id: '3',
      location: 'Titik Pantau C',
      status: 'warning',
      lastUpdate: '1m ago',
      metrics: {
        ph: 6.3,
        temperature: 24.8,
        humidity: 70,
        turbidity: 1.85,
        waterLevel: 87.6,
        vibration: true,
      },
    },
    {
      id: '4',
      location: 'Titik Pantau D',
      status: 'online',
      lastUpdate: '20s ago',
      metrics: {
        ph: 7.4,
        temperature: 21.9,
        humidity: 58,
        turbidity: 0.51,
        waterLevel: 112.0,
        vibration: false,
      },
    },
    {
      id: '5',
      location: 'Titik Pantau E',
      status: 'online',
      lastUpdate: '35s ago',
      metrics: {
        ph: 7.1,
        temperature: 22.8,
        humidity: 66,
        turbidity: 0.8,
        waterLevel: 95.5,
        vibration: false,
      },
    },
    {
      id: '6',
      location: 'Titik Pantau F',
      status: 'online',
      lastUpdate: '50s ago',
      metrics: {
        ph: 7.3,
        temperature: 22.2,
        humidity: 63,
        turbidity: 0.6,
        waterLevel: 101.8,
        vibration: false,
      },
    },
  ]);

  useEffect(() => {
    let cancelled = false;

    const loadLatestSensor = async () => {
      try {
        const { data: nodes } = await api.nodes();
        if (!nodes.length) return;

        const responses = await Promise.all(
          nodes.map((node) => api.sensorData(node.id, 'per_page=1')),
        );
        const latest = responses
          .flatMap((response) => response.data)
          .sort(
            (a, b) =>
              new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
          )[0] as SensorData | undefined;

        if (!cancelled && latest) {
          setMetrics({
            ph: Number(latest.ph),
            temperature: Number(latest.temp),
            humidity: Number(latest.humidity),
            turbidity: Number(latest.turbidity),
            waterLevel: Number(latest.water_level),
            vibration: Boolean(latest.vibration),
          });
        }
      } catch (error) {
        console.error('Gagal mengambil data sensor:', error);
      }
    };

    loadLatestSensor();
    const timer = setInterval(loadLatestSensor, 30000);

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
    metrics.turbidity > 4
      ? 'critical'
      : metrics.turbidity > 1.5
        ? 'warning'
        : 'normal';

  const waterLevelStatus =
    metrics.waterLevel < 60 || metrics.waterLevel > 150
      ? 'critical'
      : metrics.waterLevel < 80 || metrics.waterLevel > 130
        ? 'warning'
        : 'normal';

  return (
    <div className="p-6 lg:p-8">

      {/* Header */}
      <div className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Dashboard Pemantauan Air
            </h1>

            <p className="text-sm text-gray-500 dark:text-gray-400">
              Monitoring real-time • Diperbarui:{' '}
              {currentTime.toLocaleTimeString()}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div
              className={`rounded-lg px-4 py-2 ${
                metrics.vibration
                  ? 'bg-red-100 dark:bg-red-950'
                  : 'bg-green-100 dark:bg-green-950'
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`h-2 w-2 rounded-full ${
                    metrics.vibration
                      ? 'bg-red-500 animate-pulse'
                      : 'bg-green-500'
                  }`}
                />

                <span
                  className={`text-sm font-medium ${
                    metrics.vibration
                      ? 'text-red-700 dark:text-red-400'
                      : 'text-green-700 dark:text-green-400'
                  }`}
                >
                  {metrics.vibration
                    ? 'Getaran Terdeteksi!'
                    : 'Semua Sistem Normal'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Metrics */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">

          {/* pH Air */}
          <MetricCard
            title="pH Air"
            value={metrics.ph}
            unit="pH"
            icon={Droplet}
            trend={metrics.ph > 7.0 ? 'up' : 'down'}
            trendValue={metrics.ph > 7.0 ? '+0.02' : '-0.02'}
            status={phStatus}
            min={0}
            max={14}
            gaugeColor="#10b981"
          />

          {/* Suhu */}
          <MetricCard
            title="Suhu (DHT)"
            value={metrics.temperature}
            unit="°C"
            icon={Thermometer}
            trend="stable"
            trendValue="±0.2"
            status="normal"
            min={0}
            max={50}
            gaugeColor="#3b82f6"
          />

          {/* Kelembapan */}
          <MetricCard
            title="Kelembapan (DHT)"
            value={metrics.humidity}
            unit="%"
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
            value={metrics.turbidity}
            unit="NTU"
            icon={Wind}
            trend="stable"
            trendValue="±0.05"
            status={turbidityStatus}
            min={0}
            max={5}
            gaugeColor="#f97316"
          />

        </div>
      </div>

      {/* Charts + Physical Condition */}
      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-3">

        {/* Monitoring Chart */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm lg:col-span-2 dark:border-gray-800 dark:bg-gray-900">

          {/* Chart Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-800">

            <button
              onClick={() => setActiveChart('water')}
              className={`px-5 py-3 text-sm font-medium transition ${
                activeChart === 'water'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              pH & Kekeruhan
            </button>

            <button
              onClick={() => setActiveChart('environment')}
              className={`px-5 py-3 text-sm font-medium transition ${
                activeChart === 'environment'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              Suhu & Kelembapan
            </button>

            <button
              onClick={() => setActiveChart('physical')}
              className={`px-5 py-3 text-sm font-medium transition ${
                activeChart === 'physical'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              Level Air & Getaran
            </button>

          </div>

          {/* Chart Content */}
          <div className="p-5">

            {/* Water Chart */}
            {activeChart === 'water' && (
              <>
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      pH & Kekeruhan
                    </h3>

                    <p className="text-xs text-gray-500">
                      Monitoring 24 jam terakhir
                    </p>
                  </div>

                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600">
                    pH + Turbidity
                  </span>
                </div>

                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>

                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#e5e7eb"
                    />

                    <XAxis
                      dataKey="time"
                      stroke="#6b7280"
                      style={{ fontSize: '11px' }}
                    />

                    <YAxis
                      yAxisId="left"
                      domain={[6, 9]}
                      stroke="#3b82f6"
                      style={{ fontSize: '11px' }}
                    />

                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      stroke="#f59e0b"
                      style={{ fontSize: '11px' }}
                    />

                    <Tooltip />

                    <Legend />

                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="ph"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={false}
                      name="pH"
                    />

                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="turbidity"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      dot={false}
                      name="Kekeruhan (NTU)"
                    />

                  </LineChart>
                </ResponsiveContainer>
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
                      Monitoring sensor DHT selama 24 jam
                    </p>
                  </div>

                  <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-600">
                    DHT Sensor
                  </span>
                </div>

                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={chartData}>

                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#e5e7eb"
                    />

                    <XAxis
                      dataKey="time"
                      stroke="#6b7280"
                      style={{ fontSize: '11px' }}
                    />

                    <YAxis
                      yAxisId="left"
                      stroke="#10b981"
                      style={{ fontSize: '11px' }}
                    />

                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      stroke="#8b5cf6"
                      style={{ fontSize: '11px' }}
                    />

                    <Tooltip />

                    <Legend />

                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="temperature"
                      stroke="#10b981"
                      fill="#10b981"
                      fillOpacity={0.15}
                      strokeWidth={2}
                      name="Suhu (°C)"
                    />

                    <Area
                      yAxisId="right"
                      type="monotone"
                      dataKey="humidity"
                      stroke="#8b5cf6"
                      fill="#8b5cf6"
                      fillOpacity={0.15}
                      strokeWidth={2}
                      name="Kelembapan (%)"
                    />

                  </AreaChart>
                </ResponsiveContainer>
              </>
            )}

            {/* Physical Chart */}
            {activeChart === 'physical' && (
              <>
                <div className="mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Level Air & Getaran
                  </h3>

                  <p className="text-xs text-gray-500">
                    Kondisi fisik sistem selama 24 jam
                  </p>
                </div>

                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>

                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#e5e7eb"
                    />

                    <XAxis
                      dataKey="time"
                      stroke="#6b7280"
                      style={{ fontSize: '11px' }}
                    />

                    <YAxis
                      domain={[60, 140]}
                      stroke="#6b7280"
                      style={{ fontSize: '11px' }}
                    />

                    <Tooltip />

                    <Legend />

                    <Bar
                      dataKey="waterLevel"
                      fill="#06b6d4"
                      radius={[4, 4, 0, 0]}
                      name="Level Air (cm)"
                    />

                  </BarChart>
                </ResponsiveContainer>
              </>
            )}

          </div>
        </div>

        {/* Physical Condition */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">

          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Kondisi Fisik
            </h3>

            <p className="text-xs text-gray-500">
              Kondisi level air dan getaran
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">

            {/* Water Level */}
            <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-800/50">

              <div className="mb-3">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Level Air
              </span>
              </div>

              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {metrics.waterLevel}
              </div>

              <div className="mt-1 text-sm text-gray-500">
                cm
              </div>

              <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                <div
                  className="h-full rounded-full bg-blue-500 transition-all duration-500"
                  style={{
                    width: `${Math.min(
                      Math.max((metrics.waterLevel / 200) * 100, 0),
                      100
                    )}%`,
                  }}
                />
              </div>

              <div className="mt-2 flex justify-between text-[11px] text-gray-400">
                <span>0 cm</span>
                <span>200 cm</span>
              </div>

            </div>

            {/* Vibration */}
            <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-800/50">

              <div className="mb-3">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Getaran
              </span>
              </div>

              <div
                className={`text-3xl font-bold ${
                  metrics.vibration
                    ? 'text-red-600'
                    : 'text-green-600'
                }`}
              >
                {metrics.vibration ? 'Aktif' : 'Normal'}
              </div>

              <div className="mt-1 text-sm text-gray-500">
                Sensor MPU6050
              </div>

              <div className="mt-4 flex items-center gap-2">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    metrics.vibration
                      ? 'animate-pulse bg-red-500'
                      : 'bg-green-500'
                  }`}
                />

                <span className="text-xs text-gray-500">
                  {metrics.vibration
                    ? 'Getaran terdeteksi'
                    : 'Tidak ada getaran'}
                </span>
              </div>

            </div>

          </div>
        </div>

      </div>

      {/* Sensor Network */}
      <SensorStatus sensors={sensors} />

    </div>
  );
}