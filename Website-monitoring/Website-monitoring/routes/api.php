<?php

use App\Http\Controllers\Api\AIDiagnosticController;
use App\Http\Controllers\Api\AlertController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\NodeController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\SensorDataController;
use Illuminate\Support\Facades\Route;

// Public auth
Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:register');
Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:auth');

// Ingest dari node/ESP32/gateway — middleware custom hash + throttle per kode_node
Route::middleware(['verify.node.token', 'throttle:ingest'])
    ->post('/sensor/store', [SensorDataController::class, 'store']);

// Protected dashboard (Firebase ID Token verification)
Route::middleware('verify.firebase.token')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'me']);
    Route::get('/me', [AuthController::class, 'me']);

    Route::get('/nodes', [NodeController::class, 'index']);
    Route::post('/nodes', [NodeController::class, 'store']);
    Route::get('/nodes/{nodeId}/sensor-data', [NodeController::class, 'sensorData']);

    Route::get('/alerts', [AlertController::class, 'index']);
    Route::patch('/alerts/{alertId}/read', [AlertController::class, 'markRead']);

    Route::get('/reports/summary', [ReportController::class, 'summary']);
    Route::get('/reports/data', [ReportController::class, 'data']);

    // Explainable Edge AI Diagnostics
    Route::get('/ai/diagnostics', [AIDiagnosticController::class, 'index']);
});

