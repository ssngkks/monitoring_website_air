<?php

namespace App\Services;

use App\Events\AlertCreated;
use App\Events\SensorDataReceived;
use App\Jobs\KirimNotifikasiAlert;
use App\Models\Alert;
use App\Models\Node;
use App\Models\SensorData;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class SensorIngestService
{
    /**
     * Ingest sensor data: save, update last_seen, create alert, dispatch job, broadcast.
     * Returns [SensorData $sensorData, ?Alert $alert]
     */
    public function ingest(Node $node, array $data): array
    {
        $vibrationRms = (float) ($data['vibration_rms'] ?? 0);
        $threshold = (float) config('watermonitoring.vibration_rms_threshold', 0.30);
        $vibration = $vibrationRms >= $threshold;

        $aiStatus = $data['ai_status'] ?? 'Normal';

        $sensorData = DB::transaction(function () use ($node, $data, $vibration, $aiStatus) {
            $sensor = SensorData::create([
                'node_id' => $node->id,
                'ph' => $data['ph'] ?? null,
                'temp' => $data['temp'] ?? null,
                'humidity' => $data['humidity'] ?? null,
                'turbidity' => $data['turbidity'] ?? null,
                'water_level' => $data['water_level'] ?? null,
                'vibration' => $vibration,
                'ai_status' => $aiStatus,
            ]);

            $node->update(['last_seen_at' => now()]);

            return $sensor;
        });

        $alert = null;

        if (in_array($aiStatus, ['Bahaya', 'Anomali'], true)) {
            $alert = $this->createAlert($node, $aiStatus);
            try {
                KirimNotifikasiAlert::dispatch($alert);
            } catch (\Throwable $e) {
                Log::error('Gagal dispatch KirimNotifikasiAlert', ['alert_id' => $alert->id, 'error' => $e->getMessage()]);
            }
            try {
                broadcast(new AlertCreated($alert));
            } catch (\Throwable $e) {
                Log::warning('Broadcast AlertCreated gagal', ['alert_id' => $alert->id, 'error' => $e->getMessage()]);
            }
        }

        try {
            broadcast(new SensorDataReceived($sensorData));
        } catch (\Throwable $e) {
            Log::warning('Broadcast SensorDataReceived gagal', ['sensor_id' => $sensorData->id, 'error' => $e->getMessage()]);
        }

        return [$sensorData, $alert];
    }

    private function createAlert(Node $node, string $aiStatus): Alert
    {
        $severity = $aiStatus === 'Bahaya' ? 'critical' : 'warning';

        return Alert::create([
            'node_id' => $node->id,
            'pesan' => "Status AI: {$aiStatus} terdeteksi pada node {$node->kode_node} ({$node->nama_lokasi}).",
            'severity' => $severity,
            'is_read' => false,
        ]);
    }
}
