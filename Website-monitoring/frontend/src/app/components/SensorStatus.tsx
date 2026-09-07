import { MapPin } from 'lucide-react';
import { cn } from '../lib/utils';

export interface Sensor {
  id: string;
  location: string;
  status: 'online' | 'offline' | 'warning';
  lastUpdate: string;
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
  sensors: Sensor[];
}

export function SensorStatus({ sensors }: SensorStatusProps) {
  const statusColors = {
    online: 'bg-green-500',
    offline: 'bg-red-500',
    warning: 'bg-yellow-500',
  };

  const statusText = {
    online: 'Online',
    offline: 'Offline',
    warning: 'Warning',
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <h3 className="mb-4 text-lg font-semibold">Sensor Network</h3>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sensors.map((sensor) => (
          <div
            key={sensor.id}
            className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-2">
                <MapPin className="mt-1 h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium">{sensor.location}</p>
                  <p className="text-sm text-gray-500">{sensor.lastUpdate}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={cn('h-2 w-2 rounded-full', statusColors[sensor.status])} />
                <span className="text-xs text-gray-600 dark:text-gray-400">{statusText[sensor.status]}</span>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
              <div>
                <p className="text-gray-500">pH</p>
                <p className="font-medium">{sensor.metrics.ph.toFixed(1)}</p>
              </div>
              <div>
                <p className="text-gray-500">Temp</p>
                <p className="font-medium">{sensor.metrics.temperature}°C</p>
              </div>
              <div>
                <p className="text-gray-500">Humidity</p>
                <p className="font-medium">{sensor.metrics.humidity}%</p>
              </div>
              <div>
                <p className="text-gray-500">Turbidity</p>
                <p className="font-medium">{sensor.metrics.turbidity.toFixed(2)} NTU</p>
              </div>
              <div>
                <p className="text-gray-500">Water Lvl</p>
                <p className="font-medium">{sensor.metrics.waterLevel} cm</p>
              </div>
              <div>
                <p className="text-gray-500">Vibration</p>
                <p className={cn('font-medium', sensor.metrics.vibration ? 'text-red-500' : 'text-green-600')}>
                  {sensor.metrics.vibration ? 'Detected' : 'Normal'}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
