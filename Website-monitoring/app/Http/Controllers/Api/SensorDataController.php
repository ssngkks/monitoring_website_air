<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSensorDataRequest;
use App\Services\SensorIngestService;

class SensorDataController extends Controller
{
    public function store(StoreSensorDataRequest $request, SensorIngestService $service)
    {
        /** @var array $node */
        $node = $request->attributes->get('node');

        [$sensorData] = $service->ingest($node, $request->validated() + $request->only(['vibration_rms', 'ai_status']));

        return response()->json([
            'message' => 'Data sensor berhasil disimpan.',
            'data' => $sensorData,
        ], 201);
    }
}
