<?php

namespace App\Console\Commands;

use App\Models\Node;
use App\Models\SensorData;
use Illuminate\Console\Command;
use Illuminate\Support\Str;
use Carbon\Carbon;

class NodeSimulate extends Command
{
    protected $signature = 'node:simulate';
    protected $description = 'Simulasi pengiriman data sensor dari node ke endpoint ingest';

    public function handle(): int
    {
        $this->info('Menjalankan simulasi node...');

        // Cari node aktif
        $node = Node::where('status', 'active')
            ->whereNotNull('last_seen_at')
            ->inRandomOrder()
            ->first();

        if (!$node) {
            $this->error('Tidak ada node aktif yang ditemukan.');
            return Command::FAILURE;
        }

        // Buat payload data dummy
        $payload = [
            'api_token' => Str::random(30), // token acak untuk simulasi
            'kode_node' => $node->kode_node,
            'ph' => number_format(6.5 + random_int(0, 30) / 100, 2, '.', ''),
            'temp' => number_format(25 + random_int(0, 100) / 100, 2, '.', ''),
            'humidity' => number_format(60 + random_int(0, 40), 2, '.', ''),
            'turbidity' => number_format(30 + random_int(0, 100), 2, '.', ''),
            'water_level' => number_format(100 + random_int(0, 500), 1, '.', ''),
            'vibration_rms' => number_format(random_int(0, 10) / 100, 2, '.', ''),
            'ai_status' => random_int(0, 1) ? 'Normal' : 'Bahaya',
        ];

        // Kirim ke endpoint (via HTTP client)
        $this->info("Mengirim data dari node {$node->kode_node}");
        $this->info('Payload: ' . json_encode($payload));

        // Logika untuk request nyata bisa ditambahkan di sini
        // Contoh: Http::post('http://localhost:8000/api/sensor/store', $payload);

        $this->info('Simulasi selesai.');

        return Command::SUCCESS;
    }
}