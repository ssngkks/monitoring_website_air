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

    public function getByNodeId(string $nodeId, int $limit = 100, ?string $from = null, ?string $to = null): array
    {
        try {
            $query = $this->where('node_id', '=', (string) $nodeId)->orderBy('received_at', 'DESC')->limit($limit);

            if ($from) {
                $query = $query->where('received_at', '>=', new \DateTime($from));
            }
            if ($to) {
                $query = $query->where('received_at', '<=', new \DateTime($to));
            }

            return $this->get($query);
        } catch (\Throwable $e) {
            $query = $this->where('node_id', '=', (string) $nodeId)->limit($limit);
            $results = $this->get($query);
            usort($results, fn($a, $b) => strcmp((string)($b['received_at'] ?? ''), (string)($a['received_at'] ?? '')));
            return $results;
        }
    }

    public function getLatestByNodeId(string $nodeId): ?array
    {
        try {
            $query = $this->where('node_id', '=', (string) $nodeId)->orderBy('received_at', 'DESC')->limit(1);
            $results = $this->get($query);
            return $results[0] ?? null;
        } catch (\Throwable $e) {
            $query = $this->where('node_id', '=', (string) $nodeId)->limit(10);
            $results = $this->get($query);
            usort($results, fn($a, $b) => strcmp((string)($b['received_at'] ?? ''), (string)($a['received_at'] ?? '')));
            return $results[0] ?? null;
        }
    }

    public function getPaginated(string $nodeId, int $perPage = 25, ?string $cursor = null, ?string $from = null, ?string $to = null): array
    {
        try {
            $query = $this->where('node_id', '=', (string) $nodeId)->orderBy('received_at', 'DESC')->limit($perPage + 1);

            if ($from) {
                $query = $query->where('received_at', '>=', new \DateTime($from));
            }
            if ($to) {
                $query = $query->where('received_at', '<=', new \DateTime($to));
            }
            if ($cursor) {
                $query = $query->startAfter([new \Google\Cloud\Core\Timestamp(new \DateTime($cursor))]);
            }

            $results = $this->get($query);
        } catch (\Throwable $e) {
            $query = $this->where('node_id', '=', (string) $nodeId)->limit($perPage + 1);
            $results = $this->get($query);
            usort($results, fn($a, $b) => strcmp((string)($b['received_at'] ?? ''), (string)($a['received_at'] ?? '')));
        }

        $hasMore = count($results) > $perPage;
        if ($hasMore) {
            array_pop($results);
        }

        return [
            'data' => $results,
            'has_more' => $hasMore,
            'next_cursor' => $hasMore ? (string) (end($results)['received_at'] ?? '') : null,
        ];
    }

    public function getLast24Hours(string $nodeId): array
    {
        $from = (new \DateTime())->modify('-24 hours')->format('Y-m-d H:i:s');

        return $this->getByNodeId($nodeId, 100, $from);
    }
}