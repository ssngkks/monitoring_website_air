<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreNodeRequest;
use App\Models\Node;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class NodeController extends Controller
{
    public function index(Request $request)
    {
        $nodes = Node::query()
            ->where('user_id', Auth::id())
            ->latest()
            ->get()
            ->map(fn (Node $node) => [
                'id' => $node->id,
                'kode_node' => $node->kode_node,
                'nama_lokasi' => $node->nama_lokasi,
                'status' => $node->status,
                'is_online' => $node->isOnline(config('watermonitoring.online_threshold_minutes', 10)),
                'last_seen_at' => $node->last_seen_at?->toIso8601String(),
            ]);

        return response()->json(['data' => $nodes]);
    }

    public function store(StoreNodeRequest $request)
    {
        $validated = $request->validated();

        $tokenPlaintext = Str::random(40);

        $node = Node::create([
            'user_id' => Auth::id(),
            'kode_node' => $validated['kode_node'],
            'nama_lokasi' => $validated['nama_lokasi'],
            'api_token_hash' => hash('sha256', $tokenPlaintext),
            'status' => 'active',
        ]);

        return response()->json([
            'message' => 'Node berhasil didaftarkan. Simpan token berikut, tidak akan ditampilkan lagi.',
            'data' => [
                'id' => $node->id,
                'kode_node' => $node->kode_node,
                'nama_lokasi' => $node->nama_lokasi,
                'api_token' => $tokenPlaintext,
            ],
        ], 201);
    }

    public function sensorData(Request $request, Node $node)
    {
        abort_unless($node->user_id === Auth::id(), 403);

        $request->validate([
            'from' => ['nullable', 'date'],
            'to' => ['nullable', 'date'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:200'],
        ]);

        $query = $node->sensorData()->orderByDesc('created_at');

        if ($request->filled('from')) {
            $query->where('created_at', '>=', $request->date('from'));
        }

        if ($request->filled('to')) {
            $query->where('created_at', '<=', $request->date('to'));
        }

        $paginated = $query->paginate($request->integer('per_page', 25));

        return response()->json([
            'data' => $paginated->getCollection()->map(fn ($row) => [
                'id' => $row->id,
                'node' => $node->kode_node,
                'ph' => $row->ph,
                'temp' => $row->temp,
                'humidity' => $row->humidity,
                'turbidity' => $row->turbidity,
                'water_level' => $row->water_level,
                'vibration' => $row->vibration,
                'ai_status' => $row->ai_status,
                'created_at' => $row->created_at?->toIso8601String(),
            ]),
            'meta' => [
                'current_page' => $paginated->currentPage(),
                'last_page' => $paginated->lastPage(),
            ],
        ]);
    }
}
