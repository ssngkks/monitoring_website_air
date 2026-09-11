<?php

namespace App\Repositories;

use Google\Cloud\Firestore\FieldValue;

class UserRepository extends FirestoreRepository
{
    public function __construct()
    {
        parent::__construct('users');
    }

    public function createUser(array $data, ?string $uid = null): string
    {
        $data['role'] = $data['role'] ?? 'user';
        $data['email_verified_at'] = $data['email_verified_at'] ?? null;
        $data['created_at'] = FieldValue::serverTimestamp();

        if ($uid) {
            $this->doc($uid)->set($data, ['merge' => true]);
            return $uid;
        }

        return $this->create($data);
    }

    public function upsertUser(string $uid, array $data): void
    {
        $data['role'] = $data['role'] ?? 'user';
        $data['updated_at'] = FieldValue::serverTimestamp();
        $this->doc($uid)->set($data, ['merge' => true]);
    }

    public function findByEmail(string $email): ?array
    {
        $query = $this->where('email', '=', $email)->limit(1);
        $results = $this->get($query);

        return $results[0] ?? null;
    }

    public function findById(string $id): ?array
    {
        return $this->find((string) $id);
    }

    public function getUserNodes(string $userId): array
    {
        $nodeRepo = new NodeRepository();

        return $nodeRepo->getByUserId((string) $userId);
    }

    public function updateLastLogin(string $userId): void
    {
        $this->update((string) $userId, ['last_login_at' => FieldValue::serverTimestamp()]);
    }
}