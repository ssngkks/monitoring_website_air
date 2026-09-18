<?php

namespace App\Repositories;

use Google\Cloud\Firestore\FieldValue;

class NodeLiveRepository extends FirestoreRepository
{
    public function __construct()
    {
        parent::__construct('nodes_live');
    }

    public function updateLiveData(string $nodeId, array $reading, ?string $userId = null): void
    {
        $data = [
            'kode_node' => $reading['kode_node'] ?? '',
            'nama_lokasi' => $reading['nama_lokasi'] ?? '',
            'last_reading' => $reading,
            'last_seen_at' => FieldValue::serverTimestamp(),
            'is_online' => true,
            'updated_at' => FieldValue::serverTimestamp(),
        ];

        if ($userId) {
            $data['user_id'] = (string) $userId;
        } elseif (!empty($reading['user_id'])) {
            $data['user_id'] = (string) $reading['user_id'];
        }

        $this->doc($nodeId)->set($data, ['merge' => true]);
    }

    public function markOffline(string $nodeId): void
    {
        $this->update($nodeId, [
            'is_online' => false,
            'updated_at' => FieldValue::serverTimestamp(),
        ]);
    }
}