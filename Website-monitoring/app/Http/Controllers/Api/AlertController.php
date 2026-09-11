<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Repositories\AlertRepository;
use App\Repositories\NodeRepository;
use Google\Cloud\Core\Timestamp;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AlertController extends Controller
{
    public function __construct(
        protected AlertRepository $alertRepo,
        protected NodeRepository $nodeRepo,
    ) {
    }

    public function index(Request $request)
    {
        $userId = (string) (Auth::id() ?? $request->attributes->get('firebase_uid'));

        $request->validate([
            'per_page' => ['nullable', 'integer', 'min:1', 'max:200'],
            'is_read' => ['nullable', 'boolean'],
        ]);

        $isRead = $request->has('is_read') ? $request->boolean('is_read') : null;
        $perPage = $request->integer('per_page', 25);

        $alerts = $this->alertRepo->getByUserId($userId, $isRead, $perPage);

        // Preload nodes milik user untuk menyematkan data node pada alert
        $userNodes = $this->nodeRepo->getByUserId($userId);
        $nodeMap = [];
        foreach ($userNodes as $n) {
            $nodeMap[$n['id']] = $n;
        }

        $data = array_map(function (array $alert) use ($nodeMap) {
            $nodeId = $alert['node_id'] ?? null;
            $nodeInfo = $nodeMap[$nodeId] ?? null;

            return [
                'id' => $alert['id'],
                'node_id' => $nodeId,
                'pesan' => $alert['pesan'] ?? '',
                'severity' => $alert['severity'] ?? 'warning',
                'status' => $alert['status'] ?? 'active',
                'is_read' => (bool) ($alert['is_read'] ?? false),
                'created_at' => $this->formatTimestamp($alert['created_at'] ?? null),
                'node' => $nodeInfo ? [
                    'id' => $nodeInfo['id'],
                    'kode_node' => $nodeInfo['kode_node'] ?? '',
                    'nama_lokasi' => $nodeInfo['nama_lokasi'] ?? '',
                ] : null,
            ];
        }, $alerts);

        return response()->json([
            'data' => $data,
            'meta' => [
                'per_page' => $perPage,
                'total' => count($data),
            ],
        ]);
    }

    public function markRead(Request $request, string $alertId)
    {
        $userId = (string) (Auth::id() ?? $request->attributes->get('firebase_uid'));

        $alert = $this->alertRepo->find($alertId);
        if (! $alert) {
            return response()->json(['message' => 'Alert tidak ditemukan.'], 404);
        }

        // Verifikasi kepemilikan alert
        abort_unless(($alert['user_id'] ?? '') === $userId, 403);

        $this->alertRepo->markAsRead($alertId);
        $alert['is_read'] = true;

        return response()->json(['data' => $alert]);
    }

    private function formatTimestamp($timestamp): ?string
    {
        if (! $timestamp) {
            return null;
        }

        if ($timestamp instanceof Timestamp) {
            return $timestamp->toDateTime()->format(\DateTime::ATOM);
        }

        if ($timestamp instanceof \DateTimeInterface) {
            return $timestamp->format(\DateTime::ATOM);
        }

        if (is_string($timestamp)) {
            return (new \DateTime($timestamp))->format(\DateTime::ATOM);
        }

        return null;
    }
}
