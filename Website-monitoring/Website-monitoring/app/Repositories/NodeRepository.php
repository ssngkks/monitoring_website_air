<?php

namespace App\Repositories;

use Google\Cloud\Firestore\FieldValue;

class NodeRepository extends FirestoreRepository
{
    public function __construct()
    {
        parent::__construct('nodes');
    }

    public function createNode(array $data): string
    {
        $data['user_id'] = (string) ($data['user_id'] ?? '');
        $data['status'] = $data['status'] ?? 'active';
        $data['last_seen_at'] = null;
        $data['created_at'] = FieldValue::serverTimestamp();

        return $this->create($data);
    }

    public function findByKodeNode(string $kodeNode): ?array
    {
        $query = $this->where('kode_node', '=', (string) $kodeNode)->limit(1);
        $results = $this->get($query);

        return $results[0] ?? null;
    }

    public function getByUserId(string $userId): array
    {
        $query = $this->where('user_id', '=', (string) $userId);
        $results = $this->get($query);

        usort($results, function ($a, $b) {
            $tA = isset($a['created_at']) ? (string) $a['created_at'] : '';
            $tB = isset($b['created_at']) ? (string) $b['created_at'] : '';
            return strcmp($tB, $tA);
        });

        return $results;
    }

    public function updateLastSeen(string $nodeId): void
    {
        $this->update((string) $nodeId, ['last_seen_at' => FieldValue::serverTimestamp()]);
    }

    public function updateStatus(string $nodeId, string $status): void
    {
        $this->update((string) $nodeId, ['status' => $status]);
    }

    public function getAll(): array
    {
        return $this->get();
    }

    public function getActiveNodes(): array
    {
        $query = $this->where('status', '=', 'active');

        return $this->get($query);
    }

    public function getNodeWithLiveData(string $nodeId): ?array
    {
        $node = $this->find((string) $nodeId);
        if (!$node) {
            return null;
        }

        $liveRepo = new NodeLiveRepository();
        $live = $liveRepo->find((string) $nodeId);
        if ($live) {
            $node['last_reading'] = $live['last_reading'] ?? null;
            $node['is_online'] = $live['is_online'] ?? false;
        } else {
            $node['is_online'] = $this->isOnline($node);
        }

        return $node;
    }

    public function isOnline(array $node, int $thresholdMinutes = 10): bool
    {
        if (empty($node['last_seen_at'])) {
            return false;
        }

        $lastSeen = $node['last_seen_at'];
        if ($lastSeen instanceof \Google\Cloud\Core\Timestamp) {
            $lastSeen = $lastSeen->get();
        } elseif (is_string($lastSeen)) {
            $lastSeen = new \DateTime($lastSeen);
        }

        if (! $lastSeen instanceof \DateTimeInterface) {
            return false;
        }

        $diff = (new \DateTime())->diff($lastSeen);

        return ($diff->i + $diff->h * 60 + $diff->d * 1440) <= $thresholdMinutes;
    }
}