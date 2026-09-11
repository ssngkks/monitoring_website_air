<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Repositories\NodeRepository;
use App\Repositories\SensorDataRepository;
use Google\Cloud\Core\Timestamp;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ReportController extends Controller
{
    public function __construct(
        protected SensorDataRepository $sensorRepo,
        protected NodeRepository $nodeRepo,
    ) {
    }

    public function summary(Request $request)
    {
        $userId = (string) (Auth::id() ?? $request->attributes->get('firebase_uid'));
        $nodes = $this->nodeRepo->getByUserId($userId);

        if (empty($nodes)) {
            return response()->json([
                'data' => [
                    'total_records' => 0,
                    'earliest_record' => null,
                    'latest_record' => null,
                    'sampling_interval_seconds' => 0,
                    'parameters' => ['ph', 'temp', 'humidity', 'turbidity', 'water_level', 'vibration'],
                    'averages' => null,
                ],
            ]);
        }

        $nodeId = $nodes[0]['id'];
        $readings = $this->sensorRepo->getByNodeId($nodeId, 200);

        if (empty($readings)) {
            return response()->json([
                'data' => [
                    'total_records' => 0,
                    'earliest_record' => null,
                    'latest_record' => null,
                    'sampling_interval_seconds' => 0,
                    'parameters' => ['ph', 'temp', 'humidity', 'turbidity', 'water_level', 'vibration'],
                    'averages' => null,
                ],
            ]);
        }

        $count = count($readings);
        $latest = $readings[0];
        $earliest = end($readings);

        $latestTime = $this->formatTimestamp($latest['created_at'] ?? $latest['received_at'] ?? null);
        $earliestTime = $this->formatTimestamp($earliest['created_at'] ?? $earliest['received_at'] ?? null);

        // Hitung rata-rata interval antar data jika lebih dari 1 data
        $intervalSeconds = 0;
        if ($count > 1 && $latestTime && $earliestTime) {
            $diff = abs(strtotime($latestTime) - strtotime($earliestTime));
            $intervalSeconds = round($diff / ($count - 1));
        }

        $sumPh = 0;
        $sumTemp = 0;
        $sumHumidity = 0;
        $sumTurbidity = 0;
        $sumWaterLevel = 0;

        foreach ($readings as $r) {
            $sumPh += (float) ($r['ph'] ?? 0);
            $sumTemp += (float) ($r['temp'] ?? 0);
            $sumHumidity += (float) ($r['humidity'] ?? 0);
            $sumTurbidity += (float) ($r['turbidity'] ?? 0);
            $sumWaterLevel += (float) ($r['water_level'] ?? 0);
        }

        return response()->json([
            'data' => [
                'total_records' => $count,
                'earliest_record' => $earliestTime,
                'latest_record' => $latestTime,
                'sampling_interval_seconds' => $intervalSeconds,
                'parameters' => ['ph', 'temp', 'humidity', 'turbidity', 'water_level', 'vibration'],
                'averages' => [
                    'ph' => round($sumPh / $count, 2),
                    'temp' => round($sumTemp / $count, 2),
                    'humidity' => round($sumHumidity / $count, 2),
                    'turbidity' => round($sumTurbidity / $count, 2),
                    'water_level' => round($sumWaterLevel / $count, 2),
                ],
            ],
        ]);
    }

    public function data(Request $request)
    {
        $userId = (string) (Auth::id() ?? $request->attributes->get('firebase_uid'));
        $nodes = $this->nodeRepo->getByUserId($userId);

        if (empty($nodes)) {
            return response()->json(['data' => [], 'meta' => ['total' => 0]]);
        }

        $nodeId = $nodes[0]['id'];
        $perPage = $request->integer('per_page', 50);
        $from = $request->input('from');
        $to = $request->input('to');

        $paginated = $this->sensorRepo->getPaginated($nodeId, $perPage, null, $from, $to);

        $rows = array_map(function (array $r) {
            $ts = $this->formatTimestamp($r['created_at'] ?? $r['received_at'] ?? null);
            $dt = $ts ? new \DateTime($ts) : new \DateTime();

            return [
                'id' => $r['id'] ?? null,
                'date' => $dt->format('Y-m-d'),
                'time' => $dt->format('H:i:s'),
                'timestamp' => $dt->format(\DateTime::ATOM),
                'ph' => (float) ($r['ph'] ?? 0),
                'temperature' => (float) ($r['temp'] ?? 0),
                'humidity' => (float) ($r['humidity'] ?? 0),
                'turbidity' => (float) ($r['turbidity'] ?? 0),
                'water_level' => (float) ($r['water_level'] ?? 0),
                'vibration' => (bool) ($r['vibration'] ?? false),
                'ai_status' => $r['ai_status'] ?? 'Normal',
            ];
        }, $paginated['data']);

        return response()->json([
            'data' => $rows,
            'meta' => [
                'total' => count($rows),
                'has_more' => $paginated['has_more'],
            ],
        ]);
    }

    private function formatTimestamp($timestamp): ?string
    {
        if (! $timestamp) {
            return null;
        }

        if ($timestamp instanceof Timestamp) {
            return $timestamp->toDateTime()->format(\DateTime::ATOM);
        }

        if ($timestamp instanceof \DateTimeInterface) {
            return $timestamp->format(\DateTime::ATOM);
        }

        if (is_string($timestamp)) {
            return (new \DateTime($timestamp))->format(\DateTime::ATOM);
        }

        return null;
    }
}
