<?php

namespace App\Repositories;

use Google\Cloud\Firestore\FieldValue;
use Google\Cloud\Firestore\Query;

class SensorDataRepository extends FirestoreRepository
{
    public function __construct()
    {
        parent::__construct('sensor_readings');
    }

    public function createReading(array $data): string
    {
        $data['node_id'] = (string) ($data['node_id'] ?? '');
        $data['user_id'] = (string) ($data['user_id'] ?? '');
        $data['received_at'] = $data['received_at'] ?? FieldValue::serverTimestamp();
        $data['created_at'] = $data['created_at'] ?? FieldValue::serverTimestamp();

        return $this->create($data);
    }

    protected static ?\Kreait\Firebase\Contract\Database $rtdbInstance = null;

    protected function getRtdb(): ?\Kreait\Firebase\Contract\Database
    {
        if (self::$rtdbInstance !== null) {
            return self::$rtdbInstance;
        }

        $dbUrl = config('firebase.database_url');
        $cred = config('firebase.credentials');
        if (! $dbUrl || ! $cred) {
            return null;
        }

        $resolvedCred = file_exists($cred) ? $cred : base_path($cred);
        if (! file_exists($resolvedCred)) {
            return null;
        }

        try {
            $factory = (new \Kreait\Firebase\Factory())
                ->withServiceAccount($resolvedCred)
                ->withDatabaseUri($dbUrl);
            self::$rtdbInstance = $factory->createDatabase();

            return self::$rtdbInstance;
        } catch (\Throwable $e) {
            return null;
        }
    }

    public function fetchFromRealtimeDatabase(int $limit = 1000): ?array
    {
        $cacheKey = "rtdb_history_{$limit}";

        return \Illuminate\Support\Facades\Cache::remember($cacheKey, 3, function () use ($limit) {
            $rtdb = $this->getRtdb();
            if (! $rtdb) {
                return null;
            }

            try {
                $history = $rtdb->getReference('/sensor/history')->orderByKey()->limitToLast($limit)->getValue();
                if (! is_array($history) || empty($history)) {
                    $history = $rtdb->getReference('/history')->orderByKey()->limitToLast($limit)->getValue();
                }

                if (! is_array($history) || empty($history)) {
                    return null;
                }

                $rows = [];
                foreach (array_reverse($history, true) as $key => $item) {
                    if (! is_array($item)) {
                        continue;
                    }
                    $dt = \App\Services\FirebaseSyncService::decodePushIdTime($key) ?? new \DateTime();
                    $vibrationRms = (float) ($item['getaran'] ?? $item['vibration_rms'] ?? 0);
                    $vibration = $vibrationRms >= 0.3 || ((int) ($item['getaran'] ?? 0)) > 0;

                    $rows[] = [
                        'id' => $key,
                        'node_id' => 'fb224789f1354218ae00',
                        'ph' => isset($item['ph']) ? (float) $item['ph'] : null,
                        'temp' => isset($item['suhu']) ? (float) $item['suhu'] : (isset($item['temp']) ? (float) $item['temp'] : null),
                        'humidity' => isset($item['kelembapan']) ? (float) $item['kelembapan'] : (isset($item['humidity']) ? (float) $item['humidity'] : null),
                        'turbidity' => isset($item['turbidity']) ? (float) $item['turbidity'] : null,
                        'water_level' => isset($item['ketinggian_air']) ? (float) $item['ketinggian_air'] : (isset($item['water_level']) ? (float) $item['water_level'] : null),
                        'vibration' => $vibration,
                        'vibration_rms' => $vibrationRms,
                        'ai_status' => $item['ai_status'] ?? 'Normal',
                        'rssi' => $item['rssi'] ?? -43,
                        'snr' => $item['snr'] ?? 10.0,
                        'created_at' => $dt->format(\DateTime::ATOM),
                        'received_at' => $dt->format(\DateTime::ATOM),
                    ];
                }

                return $rows;
            } catch (\Throwable $e) {
                return null;
            }
        });
    }

    public function getByNodeId(string $nodeId, int $limit = 1000, ?string $from = null, ?string $to = null): array
    {
        $rtdbRows = $this->fetchFromRealtimeDatabase(max($limit, 1000));
        if ($rtdbRows !== null && ! empty($rtdbRows)) {
            if ($from || $to) {
                $fromTs = $from ? strtotime($from) : 0;
                $toTs = $to ? strtotime($to) : PHP_INT_MAX;
                $rtdbRows = array_values(array_filter($rtdbRows, function ($r) use ($fromTs, $toTs) {
                    $ts = strtotime($r['created_at']);
                    return $ts >= $fromTs && $ts <= $toTs;
                }));
            }

            return array_slice($rtdbRows, 0, $limit);
        }

        try {
            $query = $this->orderBy('received_at', 'DESC')->limit($limit);
            $all = $this->get($query);
            $results = array_values(array_filter($all, fn ($r) => ($r['node_id'] ?? '') === (string) $nodeId));

            return array_slice($results, 0, $limit);
        } catch (\Throwable $e) {
            return [];
        }
    }

    public function getLatestByNodeId(string $nodeId): ?array
    {
        $rtdbRows = $this->fetchFromRealtimeDatabase(1);
        if ($rtdbRows !== null && ! empty($rtdbRows)) {
            return $rtdbRows[0];
        }

        try {
            $query = $this->orderBy('received_at', 'DESC')->limit(1);
            $results = $this->get($query);

            return $results[0] ?? null;
        } catch (\Throwable $e) {
            return null;
        }
    }

    public function getPaginated(string $nodeId, int $perPage = 25, ?string $cursor = null, ?string $from = null, ?string $to = null): array
    {
        $rtdbRows = $this->fetchFromRealtimeDatabase(1000);
        if ($rtdbRows !== null && ! empty($rtdbRows)) {
            if ($from || $to) {
                $fromTs = $from ? strtotime($from) : 0;
                $toTs = $to ? strtotime($to) : PHP_INT_MAX;
                $rtdbRows = array_values(array_filter($rtdbRows, function ($r) use ($fromTs, $toTs) {
                    $ts = strtotime($r['created_at']);
                    return $ts >= $fromTs && $ts <= $toTs;
                }));
            }

            $startIndex = 0;
            if ($cursor) {
                foreach ($rtdbRows as $idx => $r) {
                    if (($r['id'] ?? '') === $cursor || ($r['received_at'] ?? '') === $cursor) {
                        $startIndex = $idx + 1;
                        break;
                    }
                }
            }

            $total = count($rtdbRows);
            $results = array_slice($rtdbRows, $startIndex, $perPage);
            $hasMore = ($startIndex + count($results)) < $total;

            return [
                'data' => $results,
                'has_more' => $hasMore,
                'total' => $total,
                'next_cursor' => $hasMore ? (string) (end($results)['id'] ?? '') : null,
            ];
        }

        try {
            $query = $this->orderBy('received_at', 'DESC')->limit($perPage + 1);
            $results = $this->get($query);

            $hasMore = count($results) > $perPage;
            if ($hasMore) {
                array_pop($results);
            }

            return [
                'data' => $results,
                'has_more' => $hasMore,
                'total' => count($results),
                'next_cursor' => $hasMore ? (string) (end($results)['received_at'] ?? '') : null,
            ];
        } catch (\Throwable $e) {
            return [
                'data' => [],
                'has_more' => false,
                'total' => 0,
                'next_cursor' => null,
            ];
        }
    }

    public function getLast24Hours(string $nodeId): array
    {
        $from = (new \DateTime())->modify('-24 hours')->format('Y-m-d H:i:s');

        return $this->getByNodeId($nodeId, 1000, $from);
    }
}