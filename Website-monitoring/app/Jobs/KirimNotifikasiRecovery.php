<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class KirimNotifikasiRecovery implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $backoff = 10;

    public function __construct(public array $node, public string $previousStatus)
    {
    }

    public function handle(): void
    {
        $namaLokasi = $this->node['nama_lokasi'] ?? '-';
        $kodeNode = $this->node['kode_node'] ?? '-';

        $teks = sprintf(
            "✅ *RECOVERY* - %s\nLokasi: %s (%s)\nStatus kembali Normal setelah sebelumnya %s.",
            now()->format('d M Y H:i'),
            $namaLokasi,
            $kodeNode,
            $this->previousStatus,
        );

        $this->kirimTelegram($teks);
    }

    private function kirimTelegram(string $teks): void
    {
        $botToken = config('services.telegram.bot_token');
        $chatId = config('services.telegram.chat_id');

        if (! $botToken || ! $chatId) {
            Log::info('Telegram belum dikonfigurasi, notifikasi recovery dilewati.', [
                'node_id' => $this->node['id'] ?? null,
            ]);

            return;
        }

        $response = Http::timeout(5)->asForm()->post("https://api.telegram.org/bot{$botToken}/sendMessage", [
            'chat_id' => $chatId,
            'text' => $teks,
            'parse_mode' => 'Markdown',
        ]);

        if ($response->failed()) {
            Log::error('Telegram recovery notification gagal', [
                'node_id' => $this->node['id'] ?? null,
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            $response->throw();
        }
    }

    public function failed(\Throwable $exception): void
    {
        Log::critical('KirimNotifikasiRecovery gagal setelah semua retry', [
            'node_id' => $this->node['id'] ?? null,
            'previous_status' => $this->previousStatus,
            'error' => $exception->getMessage(),
        ]);
    }
}