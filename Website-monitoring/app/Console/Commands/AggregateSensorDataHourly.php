<?php

namespace App\Console\Commands;

use App\Models\Node;
use App\Models\SensorDataHourly;
use Illuminate\Console\Command;

class AggregateSensorDataHourly extends Command
{
    protected $signature = 'sensor-data:aggregate-hourly';

    protected $description = 'Agregasi rata-rata sensor_data per jam ke tabel sensor_data_hourly.';

    public function handle(): int
    {
        $jamMulai = now()->subHour()->startOfHour();
        $jamSelesai = now()->subHour()->endOfHour();

        $nodes = Node::all();
        $jumlahDiagregasi = 0;

        foreach ($nodes as $node) {
            $agregat = $node->sensorData()
                ->whereBetween('created_at', [$jamMulai, $jamSelesai])
                ->selectRaw('AVG(ph) as avg_ph, AVG(temp) as avg_temp, AVG(turbidity) as avg_turbidity')
                ->first();

            if ($agregat === null || $agregat->avg_ph === null) {
                continue;
            }

            SensorDataHourly::updateOrCreate(
                ['node_id' => $node->id, 'hour' => $jamMulai],
                [
                    'avg_ph' => round($agregat->avg_ph, 2),
                    'avg_temp' => round($agregat->avg_temp, 2),
                    'avg_turbidity' => round($agregat->avg_turbidity, 2),
                ]
            );

            $jumlahDiagregasi++;
        }

        $this->info("Agregasi selesai untuk jam {$jamMulai->format('Y-m-d H:00')}. Node terproses: {$jumlahDiagregasi}.");

        return self::SUCCESS;
    }
}
