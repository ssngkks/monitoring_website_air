<?php

namespace App\Repositories;

use Google\Cloud\Firestore\FieldValue;

class NodeAlertStateRepository extends FirestoreRepository
{
    public function __construct()
    {
        parent::__construct('node_alert_state');
    }

    public function getState(string $nodeId): array
    {
        $state = $this->find($nodeId);
        if ($state) {
            return $state;
        }

        return [
            'id' => $nodeId,
            'node_id' => (string) $nodeId,
            'current_severity' => 'normal',
            'last_transition_at' => null,
            'last_notified_at' => null,
        ];
    }

    public function updateState(string $nodeId, string $severity, ?string $parameter = null): void
    {
        $data = [
            'node_id' => (string) $nodeId,
            'current_severity' => $severity,
            'last_transition_at' => FieldValue::serverTimestamp(),
            'updated_at' => FieldValue::serverTimestamp(),
        ];
        if ($parameter) {
            $data['last_parameter'] = $parameter;
        }
        $this->doc($nodeId)->set($data, ['merge' => true]);
    }

    public function updateLastNotified(string $nodeId): void
    {
        $this->update($nodeId, ['last_notified_at' => FieldValue::serverTimestamp()]);
    }

    public function isInCooldown(string $nodeId, int $cooldownMinutes): bool
    {
        $state = $this->getState($nodeId);
        if (empty($state['last_notified_at'])) {
            return false;
        }
        $lastNotified = $state['last_notified_at'];
        if ($lastNotified instanceof \Google\Cloud\Core\Timestamp) {
            $lastNotified = $lastNotified->get();
        } elseif (is_string($lastNotified)) {
            $lastNotified = new \DateTime($lastNotified);
        }

        if (! $lastNotified instanceof \DateTimeInterface) {
            return false;
        }

        $diff = (new \DateTime())->diff($lastNotified);

        return ($diff->i + $diff->h * 60 + $diff->d * 1440) < $cooldownMinutes;
    }
}