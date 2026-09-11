import { Cpu, Wifi, Activity, CheckCircle2, AlertTriangle, XCircle, Clock } from 'lucide-react';
import { cn } from '../lib/utils';

export interface DeviceData {
  id: string;
  name?: string;
  kode_node?: string;
  location: string;
  status: 'online' | 'offline' | 'warning';
  lastUpdate: string;
  rssi?: number;
  snr?: number;
  metrics: {
    ph: number;
    temperature: number;
    humidity: number;
    turbidity: number;
    waterLevel: number;
    vibration: boolean;
  };
}

interface SensorStatusProps {
  device?: DeviceData | null;
}

export function SensorStatus({ device }: SensorStatusProps) {
  const isOnline = device?.status === 'online';

  const getRssiQuality = (rssi?: number) => {
    if (rssi === undefined || rssi === null) return 'Tidak Diketahui';
    if (rssi >= -50) return 'Sangat Bagus';
    if (rssi >= -70) return 'Bagus';
    if (rssi >= -85) return 'Cukup';
    return 'Lemah';
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      {/* Header Info Perangkat */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 pb-5 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
            <Cpu className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Unit Sensor ESP32 Utama
              </h3>
              <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-mono font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                {device?.kode_node || 'ESP32-WATER-01'}
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              1 Perangkat Keras Multi-Sensor Terintegrasi • Lokasi: {device?.location || 'Titik Pantau Sensor Utama'}
            </p>
          </div>
        </div>

        {/* Status Koneksi */}
        <div className="flex items-center gap-2">
          <div
            className={cn(
              'flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold',
              isOnline
                ? 'bg-green-50 text-green-700 dark:bg-green-950/50 dark:text-green-400'
                : 'bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400'
            )}
          >
            <span
              className={cn(
                'h-2 w-2 rounded-full',
                isOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'
              )}
            />
            <span>{isOnline ? 'Terhubung (Online)' : 'Terputus (Offline)'}</span>
          </div>
        </div>
      </div>

      {/* Status Jaringan & Waktu */}
      <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4 rounded-lg bg-gray-50 p-4 dark:bg-gray-800/40 text-xs">
        <div className="space-y-1">
          <span className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
            <Clock className="h-3.5 w-3.5" />
            Terakhir Terlihat
          </span>
          <p className="font-semibold text-gray-800 dark:text-gray-200">
            {device?.lastUpdate || 'Belum ada data'}
          </p>
        </div>

        <div className="space-y-1">
          <span className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
            <Wifi className="h-3.5 w-3.5" />
            Kekuatan Sinyal (RSSI)
          </span>
          <p className="font-semibold text-gray-800 dark:text-gray-200">
            {device?.rssi !== undefined ? `${device.rssi} dBm (${getRssiQuality(device.rssi)})` : '-43 dBm (Sangat Bagus)'}
          </p>
        </div>

        <div className="space-y-1">
          <span className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
            <Activity className="h-3.5 w-3.5" />
            Rasio Sinyal/Noise (SNR)
          </span>
          <p className="font-semibold text-gray-800 dark:text-gray-200">
            {device?.snr !== undefined ? `${device.snr} dB` : '10 dB (Stabil)'}
          </p>
        </div>

        <div className="space-y-1">
          <span className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
            <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
            Kesehatan Perangkat
          </span>
          <p className="font-semibold text-green-700 dark:text-green-400">
            {isOnline ? 'Normal & Siap Operasi' : 'Periksa Daya / Koneksi'}
          </p>
        </div>
      </div>

      {/* Parameter Sensor yang Terbaca dari 1 ESP32 ini */}
      <div className="mt-5">
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          Parameter Sensor Terbaca dari Unit ESP32 Ini
        </h4>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 text-sm">
          {/* pH */}
          <div className="rounded-lg border border-gray-200/80 bg-white p-3 dark:border-gray-700 dark:bg-gray-800">
            <p className="text-xs text-gray-500">Sensor pH Air</p>
            <p className="mt-1 text-base font-bold text-gray-900 dark:text-white">
              {device?.metrics.ph !== undefined ? device.metrics.ph.toFixed(2) : '-'}
            </p>
            <span className="text-[10px] text-gray-400">Rentang 0 - 14</span>
          </div>

          {/* Suhu */}
          <div className="rounded-lg border border-gray-200/80 bg-white p-3 dark:border-gray-700 dark:bg-gray-800">
            <p className="text-xs text-gray-500">Sensor Suhu (DHT)</p>
            <p className="mt-1 text-base font-bold text-gray-900 dark:text-white">
              {device?.metrics.temperature !== undefined ? `${device.metrics.temperature.toFixed(1)}°C` : '-'}
            </p>
            <span className="text-[10px] text-gray-400">Suhu Lingkungan</span>
          </div>

          {/* Kelembapan */}
          <div className="rounded-lg border border-gray-200/80 bg-white p-3 dark:border-gray-700 dark:bg-gray-800">
            <p className="text-xs text-gray-500">Kelembapan (DHT)</p>
            <p className="mt-1 text-base font-bold text-gray-900 dark:text-white">
              {device?.metrics.humidity !== undefined ? `${device.metrics.humidity.toFixed(1)}%` : '-'}
            </p>
            <span className="text-[10px] text-gray-400">Udara Sekitar</span>
          </div>

          {/* Kekeruhan */}
          <div className="rounded-lg border border-gray-200/80 bg-white p-3 dark:border-gray-700 dark:bg-gray-800">
            <p className="text-xs text-gray-500">Sensor Kekeruhan</p>
            <p className="mt-1 text-base font-bold text-gray-900 dark:text-white">
              {device?.metrics.turbidity !== undefined ? `${device.metrics.turbidity.toFixed(1)} NTU` : '-'}
            </p>
            <span className="text-[10px] text-gray-400">Kekeruhan Air</span>
          </div>

          {/* Level Air */}
          <div className="rounded-lg border border-gray-200/80 bg-white p-3 dark:border-gray-700 dark:bg-gray-800">
            <p className="text-xs text-gray-500">Ketinggian Air</p>
            <p className="mt-1 text-base font-bold text-gray-900 dark:text-white">
              {device?.metrics.waterLevel !== undefined ? `${device.metrics.waterLevel} cm` : '-'}
            </p>
            <span className="text-[10px] text-gray-400">Sensor Ultrasonik</span>
          </div>

          {/* Getaran */}
          <div className="rounded-lg border border-gray-200/80 bg-white p-3 dark:border-gray-700 dark:bg-gray-800">
            <p className="text-xs text-gray-500">Sensor Getaran</p>
            <p
              className={cn(
                'mt-1 text-base font-bold',
                device?.metrics.vibration ? 'text-red-600' : 'text-green-600'
              )}
            >
              {device?.metrics.vibration ? 'Terdeteksi' : 'Normal'}
            </p>
            <span className="text-[10px] text-gray-400">Sensor MPU6050</span>
          </div>
        </div>
      </div>
    </div>
  );
}
