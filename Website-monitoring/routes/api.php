<?php

use App\Http\Controllers\Api\AlertController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\NodeController;
use App\Http\Controllers\Api\SensorDataController;
use Illuminate\Support\Facades\Route;

// Public auth
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Ingest dari node/ESP32/gateway — middleware custom hash + throttle per kode_node
Route::middleware(['verify.node.token', 'throttle:ingest'])
    ->post('/sensor/store', [SensorDataController::class, 'store']);

// Protected dashboard (Sanctum)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'me']);
    Route::get('/me', [AuthController::class, 'me']);

    Route::get('/nodes', [NodeController::class, 'index']);
    Route::post('/nodes', [NodeController::class, 'store']);
    Route::get('/nodes/{node}/sensor-data', [NodeController::class, 'sensorData']);

    Route::get('/alerts', [AlertController::class, 'index']);
    Route::patch('/alerts/{alert}/read', [AlertController::class, 'markRead']);
});
