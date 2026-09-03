<?php

namespace App\Console\Commands;

use App\Models\SensorData;
use Illuminate\Console\Command;

class PruneOldSensorData extends Command
{
    protected $signature = 'sensor-data:prune {--force : lewati konfirmasi dan jalankan non-interaktif}';

    protected $description = 'Hapus data mentah sensor_data yang lebih tua dari periode retensi (data sudah diagregasi ke sensor_data_hourly).';

    public function handle(): int
    {
        $bulanRetensi = (int) config('watermonitoring.raw_retention_months', 3);
        $batasWaktu = now()->subMonths($bulanRetensi);

        $jumlah = SensorData::where('created_at', '<', $batasWaktu)->count();

        if ($jumlah === 0) {
            $this->info('Tidak ada data mentah yang perlu dihapus.');

            return self::SUCCESS;
        }

        if (! $this->option('force') && ! $this->confirm("Akan menghapus {$jumlah} baris data mentah sebelum {$batasWaktu->toDateString()}. Lanjutkan?", true)) {
            $this->warn('Dibatalkan.');

            return self::SUCCESS;
        }

        $deleted = SensorData::where('created_at', '<', $batasWaktu)->delete();

        $this->info("Berhasil menghapus {$deleted} baris data mentah lama.");

        return self::SUCCESS;
    }
}
