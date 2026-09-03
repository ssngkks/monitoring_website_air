<?php

namespace App\Http\Controllers;

use App\Models\Node;
use App\Models\SensorData;
use App\Models\Alert;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class SensorDataController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'api_token' => 'required',
            'kode_node' => 'required',
            'ph' => 'required|numeric|between:0,14',
            'temp' => 'required|numeric',
            'humidity' => 'required|numeric|between:0,100',
            'turbidity' => 'required|numeric',
            'water_level' => 'required|numeric',
            'vibration_rms' => 'required|numeric',
            'ai_status' => 'required|in:Normal,Bahaya,Anomali',
        ]);

        $node = Node::where('kode_node', $request->kode_node)->firstOrFail();

        if (!hash_equals(hash('sha256', $request->api_token), $node->api_token_hash)) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $sensorData = SensorData::create([
            'node_id' => $node->id,
            'ph' => $request->ph,
            'temp' => $request->temp,
            'humidity' => $request->humidity,
            'turbidity' => $request->turbidity,
            'water_level' => $request->water_level,
            'vibration' => $request->vibration_rms,
            'ai_status' => $request->ai_status,
        ]);

        $node->update(['last_seen_at' => now()]);

        if (in_array($request->ai_status, ['Bahaya', 'Anomali'])) {
            $severity = $request->ai_status === 'Bahaya' ? 'critical' : 'warning';
            $alert = Alert::create([
                'node_id' => $node->id,
                'pesan' => "Alert: $ai_status reading from node $node->kode_node",
                'severity' => $severity,
            ]);

            dispatch(new \App\Jobs\KirimNotifikasiAlert($alert));
        }

        return response()->json([
            'data' => $sensorData,
            'node' => $node->kode_node,
            'ai_status' => $sensorData->ai_status,
        ], 201);
    }
}