<?php

namespace App\Jobs;

use App\Models\Alert;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class KirimNotifikasiAlert implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $backoff = 10;

    public function __construct(public Alert $alert)
    {
    }

    public function handle(): void
    {
        $this->alert->loadMissing('node');

        $teks = sprintf(
            "\xE2\x9A\xA0\xEF\xB8\x8F *%s* - %s\nLokasi: %s (%s)\nPesan: %s",
            strtoupper($this->alert->severity),
            now()->format('d M Y H:i'),
            $this->alert->node->nama_lokasi,
            $this->alert->node->kode_node,
            $this->alert->pesan,
        );

        $this->kirimTelegram($teks);
    }

    private function kirimTelegram(string $teks): void
    {
        $botToken = config('services.telegram.bot_token');
        $chatId = config('services.telegram.chat_id');

        if (! $botToken || ! $chatId) {
            Log::info('Telegram belum dikonfigurasi, notifikasi dilewati.', [
                'alert_id' => $this->alert->id,
            ]);

            return;
        }

        $response = Http::timeout(5)->asForm()->post("https://api.telegram.org/bot{$botToken}/sendMessage", [
            'chat_id' => $chatId,
            'text' => $teks,
            'parse_mode' => 'Markdown',
        ]);

        if ($response->failed()) {
            Log::error('Telegram notification gagal', [
                'alert_id' => $this->alert->id,
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            $response->throw();
        }
    }
}
