<?php

namespace App\Http\Controllers;

use App\Models\Node;
use Illuminate\Http\Request;

class NodeController extends Controller
{
    public function index()
    {
        return Node::with('user')->get()->map(function ($node) {
            return [
                'id' => $node->id,
                'kode_node' => $node->kode_node,
                'nama_lokasi' => $node->nama_lokasi,
                'status' => $node->status,
                'is_online' => $node->isOnline(),
                'last_seen_at' => $node->last_seen_at,
            ];
        });
    }

    public function sensorData(Node $node, Request $request)
    {
        $from = $request->query('from');
        $to = $request->query('to');
        $perPage = $request->query('per_page', 50);

        $query = $node->sensorData();

        if ($from) {
            $query->where('created_at', '>=', $from);
        }
        if ($to) {
            $query->where('created_at', '<=', $to);
        }

        return $query->latest('created_at')->paginate($perPage);
    }
}