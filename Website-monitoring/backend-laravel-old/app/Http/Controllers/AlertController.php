<?php

namespace App\Http\Controllers;

use App\Models\Alert;
use Illuminate\Http\Request;

class AlertController extends Controller
{
    public function index(Request $request)
    {
        $query = Alert::query();

        if ($request->has('is_read')) {
            $query->where('is_read', $request->is_read);
        }

        return $query->latest('created_at')->get()->map(function ($alert) {
            return [
                'id' => $alert->id,
                'node_id' => $alert->node_id,
                'kode_node' => $alert->node->kode_node ?? 'Unknown',
                'pesan' => $alert->pesan,
                'severity' => $alert->severity,
                'is_read' => $alert->is_read,
                'created_at' => $alert->created_at,
            ];
        });
    }

    public function read(Alert $alert)
    {
        $alert->update(['is_read' => true]);

        return response()->json(['message' => 'Alert marked as read']);
    }
}