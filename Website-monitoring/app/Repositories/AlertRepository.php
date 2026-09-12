<?php

namespace App\Repositories;

use Google\Cloud\Firestore\FieldValue;

class AlertRepository extends FirestoreRepository
{
    public function __construct()
    {
        parent::__construct('alerts');
    }

    public function createAlert(array $data): string
    {
        $data['node_id'] = (string) ($data['node_id'] ?? '');
        $data['user_id'] = (string) ($data['user_id'] ?? '');
        $data['is_read'] = (bool) ($data['is_read'] ?? false);
        $data['status'] = $data['status'] ?? 'active';
        $data['created_at'] = $data['created_at'] ?? FieldValue::serverTimestamp();

        return $this->create($data);
    }

    public function getByNodeId(string $nodeId, ?bool $isRead = null, int $limit = 50): array
    {
        $query = $this->where('node_id', '=', (string) $nodeId)->limit($limit);
        if ($isRead !== null) {
            $query = $query->where('is_read', '=', $isRead);
        }
        $results = $this->get($query);
        usort($results, fn($a, $b) => strcmp((string)($b['created_at'] ?? ''), (string)($a['created_at'] ?? '')));
        return array_slice($results, 0, $limit);
    }

    public function getByUserId(string $userId, ?bool $isRead = null, int $perPage = 25): array
    {
        $query = $this->where('user_id', '=', (string) $userId)->limit($perPage * 2);
        if ($isRead !== null) {
            $query = $query->where('is_read', '=', $isRead);
        }
        $results = $this->get($query);
        usort($results, fn($a, $b) => strcmp((string)($b['created_at'] ?? ''), (string)($a['created_at'] ?? '')));
        return array_slice($results, 0, $perPage);
    }

    public function markAsRead(string $alertId): void
    {
        $this->update($alertId, ['is_read' => true]);
    }

    public function markActioned(string $alertId, string $userId): void
    {
        $this->update($alertId, [
            'status' => 'recovered',
            'actioned_at' => FieldValue::serverTimestamp(),
            'actioned_by' => (string) $userId,
            'recovered_at' => FieldValue::serverTimestamp(),
        ]);
    }

    public function getActiveByNodeId(string $nodeId): ?array
    {
        $query = $this->where('node_id', '=', (string) $nodeId)->limit(10);
        $results = array_values(array_filter($this->get($query), fn($a) => ($a['status'] ?? 'active') === 'active'));
        usort($results, fn($a, $b) => strcmp((string)($b['created_at'] ?? ''), (string)($a['created_at'] ?? '')));

        return $results[0] ?? null;
    }

    public function getUnreadCountByUserId(string $userId): int
    {
        $query = $this->where('user_id', '=', (string) $userId)->limit(50);
        $results = array_filter($this->get($query), fn($a) => empty($a['is_read']) && ($a['status'] ?? 'active') === 'active');

        return count($results);
    }
}