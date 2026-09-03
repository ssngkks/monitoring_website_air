<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSensorDataRequest;
use App\Models\Node;
use App\Services\SensorIngestService;

class SensorDataController extends Controller
{
    public function store(StoreSensorDataRequest $request, SensorIngestService $service)
    {
        /** @var Node $node */
        $node = $request->attributes->get('node');

        [$sensorData] = $service->ingest($node, $request->validated() + $request->only(['vibration_rms', 'ai_status']));

        // Service already handles vibration threshold, alert, queue, broadcast
        // Keep API contract identical to Phase 4
        return response()->json([
            'message' => 'Data sensor berhasil disimpan.',
            'data' => $sensorData,
        ], 201);
    }
}
