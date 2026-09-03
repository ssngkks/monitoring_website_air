<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Alert;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AlertController extends Controller
{
    public function index(Request $request)
    {
        $request->validate([
            'per_page' => ['nullable', 'integer', 'min:1', 'max:200'],
            'is_read' => ['nullable', 'boolean'],
        ]);

        $query = Alert::query()
            ->whereHas('node', fn ($q) => $q->where('user_id', Auth::id()))
            ->with('node:id,kode_node,nama_lokasi')
            ->latest();

        if ($request->has('is_read')) {
            $query->where('is_read', $request->boolean('is_read'));
        }

        $alerts = $query->paginate($request->integer('per_page', 25));

        return response()->json($alerts);
    }

    public function markRead(Alert $alert)
    {
        abort_unless($alert->node->user_id === Auth::id(), 403);

        $alert->update(['is_read' => true]);

        return response()->json(['data' => $alert]);
    }
}
