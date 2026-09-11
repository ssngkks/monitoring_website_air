<?php

namespace App\Repositories;

use Google\Cloud\Firestore\FieldValue;

class SensorHourlyAggRepository extends FirestoreRepository
{
    public function __construct()
    {
        parent::__construct('sensor_hourly_agg');
    }

    public function upsertHourly(string $nodeId, string $hourIso, array $averages, int $sampleCount, ?string $userId = null): void
    {
        $cleanHour = str_replace([':', ' '], ['-', '_'], $hourIso);
        $docId = "{$nodeId}_{$cleanHour}";
        $data = [
            'node_id' => (string) $nodeId,
            'hour' => $hourIso,
            'avg_ph' => $averages['ph'] ?? null,
            'avg_temp' => $averages['temp'] ?? null,
            'avg_turbidity' => $averages['turbidity'] ?? null,
            'avg_humidity' => $averages['humidity'] ?? null,
            'avg_water_level' => $averages['water_level'] ?? null,
            'sample_count' => $sampleCount,
            'updated_at' => FieldValue::serverTimestamp(),
        ];
        if ($userId) {
            $data['user_id'] = (string) $userId;
        }

        $this->doc($docId)->set($data, ['merge' => true]);
    }

    public function getByNodeId(string $nodeId, int $limit = 168): array
    {
        $query = $this->where('node_id', '=', (string) $nodeId)->orderBy('hour', 'DESC')->limit($limit);

        return $this->get($query);
    }

    public function getRange(string $nodeId, string $fromHour, string $toHour): array
    {
        $query = $this->where('node_id', '=', (string) $nodeId)
            ->where('hour', '>=', $fromHour)
            ->where('hour', '<=', $toHour)
            ->orderBy('hour', 'DESC');

        return $this->get($query);
    }
}