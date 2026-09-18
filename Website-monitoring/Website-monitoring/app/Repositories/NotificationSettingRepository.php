<?php

namespace App\Repositories;

use Google\Cloud\Firestore\FieldValue;

class NotificationSettingRepository extends FirestoreRepository
{
    public function __construct()
    {
        parent::__construct('notification_settings');
    }

    public function getByUserId(string $userId): ?array
    {
        return $this->find($userId);
    }

    public function upsert(string $userId, array $data): void
    {
        $data['user_id'] = (string) $userId;
        $data['notify_critical'] = $data['notify_critical'] ?? true;
        $data['notify_warning'] = $data['notify_warning'] ?? true;
        $data['notify_recovery'] = $data['notify_recovery'] ?? true;
        $data['updated_at'] = FieldValue::serverTimestamp();
        $this->doc($userId)->set($data, ['merge' => true]);
    }

    public function getChatId(string $userId): ?string
    {
        $setting = $this->find($userId);

        return $setting['telegram_chat_id'] ?? null;
    }

    public function shouldNotify(string $userId, string $type): bool
    {
        $setting = $this->find($userId);
        if (!$setting) {
            return true;
        }

        return (bool) ($setting["notify_{$type}"] ?? true);
    }
}