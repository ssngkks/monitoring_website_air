<?php

use App\Http\Controllers\AlertController;
use App\Http\Controllers\NodeController;
use App\Http\Controllers\SensorDataController;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->getUser();

Route::prefix('v1')->group(function () {
    // Node Routes
    Route::get('nodes', [NodeController::class, 'index']);
    Route::get('nodes/{node}/sensor-data', [NodeController::class, 'sensorData']);

    // Sensor Data Ingest Route - dengan middleware verifikasi token
    Route::post('sensor/store', [SensorDataController::class, 'store'])
        ->middleware('verify.node.token');

    // Alert Routes
    Route::get('alerts', [AlertController::class, 'index']);
    Route::patch('alerts/{alert}/read', [AlertController::class, 'read']);
});

// Global middleware registration (ditetapkan di app/Http/Kernel.php)
// 'verify.node.token' => \App\Http\Middleware\VerifyNodeToken::class