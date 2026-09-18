<?php

namespace App\Repositories;

use Google\Cloud\Firestore\FieldValue;

class NodeThresholdRepository extends FirestoreRepository
{
    public function __construct()
    {
        parent::__construct('node_thresholds');
    }

    public function getByNodeId(string $nodeId): array
    {
        $threshold = $this->find($nodeId);
        if ($threshold) {
            return $threshold;
        }

        return $this->getDefaults();
    }

    public function getDefaults(): array
    {
        return [
            'id' => null,
            'node_id' => null,
            'ph_min' => 6.5,
            'ph_max' => 8.5,
            'temperature_max' => 28.0,
            'turbidity_max' => 1.5,
            'water_level_min' => 80.0,
            'water_level_max' => 130.0,
        ];
    }

    public function upsert(string $nodeId, array $data): void
    {
        $data['node_id'] = (string) $nodeId;
        $data['updated_at'] = FieldValue::serverTimestamp();
        $this->doc($nodeId)->set($data, ['merge' => true]);
    }

    public function getAllForUser(string $userId): array
    {
        $nodeRepo = new NodeRepository();
        $nodes = $nodeRepo->getByUserId($userId);
        $thresholds = [];
        foreach ($nodes as $node) {
            $thresholds[$node['id']] = $this->getByNodeId($node['id']);
        }

        return $thresholds;
    }
}