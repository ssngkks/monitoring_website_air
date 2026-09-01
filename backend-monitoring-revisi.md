# Backend Laravel — Sistem Monitoring (Revisi)

> Versi revisi dari rancangan awal. Perubahan utama: keamanan token, pemisahan job antrian untuk notifikasi, endpoint dashboard, alur registrasi node, dan strategi data jangka panjang.

---

## 1. ERD (Revisi)

| Tabel | Kolom Utama | Catatan Revisi |
|---|---|---|
| **users** | `id`, `name`, `email`, `password`, `role` (enum: admin, user) | Tetap. Bisa pakai Laravel Sanctum untuk login web. |
| **nodes** | `id`, `user_id` (FK), `kode_node` (unik), `nama_lokasi`, `api_token_hash`, `status` (enum: active, inactive), `last_seen_at` | ⚠️ **Diubah**: simpan `api_token_hash` (SHA-256), bukan token plaintext. Tambah `last_seen_at` untuk deteksi node yang "mati"/offline. |
| **sensor_data** | `id`, `node_id` (FK), `ph`, `temp`, `humidity`, `turbidity`, `water_level`, `vibration`, `ai_status`, `created_at` | Tetap, dengan index di `node_id` + `created_at` (composite index). |
| **alerts** | `id`, `node_id` (FK), `pesan`, `severity` (enum: warning, critical), `is_read` (boolean) | ⚠️ **Ditambah** kolom `severity` supaya notifikasi bisa dibedakan prioritasnya. |
| **sensor_data_hourly** *(baru, opsional)* | `id`, `node_id`, `avg_ph`, `avg_temp`, `avg_turbidity`, `hour` | Tabel agregasi untuk grafik histori panjang (lihat bagian 5). |

---

## 2. Flowchart Alur Backend (Revisi)

```
START (Gateway LoRa kirim POST /api/sensor/store)
   │
   ▼
[1] Middleware Auth
   Cocokkan hash(api_token dari request) dengan api_token_hash di DB
   ├─ TIDAK COCOK → 401 Unauthorized
   └─ COCOK → lanjut
   │
   ▼
[2] Validasi Data (Laravel Form Request)
   Cek tipe data & range nilai (misal ph antara 0–14)
   ├─ GAGAL → 422 Unprocessable Entity
   └─ LOLOS → lanjut
   │
   ▼
[3] Simpan ke sensor_data
   Update juga nodes.last_seen_at = now()
   │
   ▼
[4] Cek ai_status
   ├─ "Bahaya"/"Anomali" → Insert ke alerts (+ severity)
   │        → Dispatch Job (queue) untuk kirim notifikasi Telegram/Email
   │          (JANGAN kirim notifikasi secara sinkron di sini!)
   └─ "Normal" → skip
   │
   ▼
[5] Broadcast event (Laravel Reverb/Pusher) ke dashboard yang terbuka
   │
   ▼
END → response 201 Created
```

**Kenapa notifikasi harus lewat Job/Queue?**
Kalau kirim Telegram/Email langsung di dalam controller, request dari ESP32/Gateway harus menunggu proses itu selesai (bisa 1–3 detik). Kalau API Telegram lambat/down, endpoint ingest ikut lambat/gagal. Dengan `dispatch(new KirimNotifikasiAlert($alert))`, response ke alat tetap cepat, notifikasi diproses di background oleh queue worker.

---

## 3. SOP Pembuatan Backend (Revisi)

1. **Setup Environment**
   - Install Laravel 11, konfigurasi `.env` (DB + queue driver, misal `database` atau `redis`).
2. **Database**
   - Migration sesuai ERD di atas.
   - Seeder/Factory untuk data dummy (penting karena alat fisik belum ada).
   - Tambahkan **Node Registration flow**: admin generate `kode_node` + token asli (ditampilkan sekali saja), simpan hash-nya di DB.
3. **REST API — Ingest (dari alat)**
   - `POST /api/sensor/store` — terima data dari Gateway.
   - Middleware custom `VerifyNodeToken` (bandingkan hash).
4. **REST API — Dashboard (untuk Frontend)**
   - `GET /api/nodes` — daftar node milik user.
   - `GET /api/nodes/{id}/sensor-data?from=&to=&per_page=` — data historis (dengan pagination).
   - `GET /api/alerts?is_read=false` — daftar alert belum dibaca.
   - `PATCH /api/alerts/{id}/read` — tandai sudah dibaca.
5. **Queue & Notifikasi**
   - Buat `Job` untuk kirim notifikasi, jalankan `php artisan queue:work`.
6. **Pengujian**
   - Postman/Insomnia untuk simulasi kiriman data dari alat (karena alat asli belum ada, ini jadi cara utama testing).
7. **UI/Dashboard**
   - Blade/Livewire/Vue + Chart.js/ApexCharts.
   - Tampilkan status koneksi node (online/offline) berdasarkan `last_seen_at`.

---

## 4. Contoh Payload API

**Dari alat (ingest):**
```json
{
  "api_token": "rahasia123",
  "kode_node": "LORA-NODE-01",
  "ph": 6.8,
  "turbidity": 40.5,
  "water_level": 150.2,
  "vibration_rms": 0.05,
  "ai_status": "Normal"
}
```

**Ke dashboard (contoh response GET sensor-data):**
```json
{
  "data": [
    {
      "id": 101,
      "node": "LORA-NODE-01",
      "ph": 6.8,
      "turbidity": 40.5,
      "ai_status": "Normal",
      "created_at": "2026-09-01T08:15:00Z"
    }
  ],
  "meta": { "current_page": 1, "last_page": 12 }
}
```

---

## 5. Keamanan & Performa (Tambahan)

- **Token**: simpan hash (`hash('sha256', $token)`), bandingkan dengan `hash_equals()` supaya aman dari timing attack.
- **Rate limiting**: pasang `throttle` middleware di route ingest supaya tidak bisa di-spam.
- **Index**: composite index `(node_id, created_at)` di `sensor_data`.
- **Retensi data**: jika data mentah sudah > 3–6 bulan, agregasi per jam ke `sensor_data_hourly`, lalu arsipkan/hapus data mentah lama — supaya query grafik tetap cepat walau tabel utama sudah jutaan baris.
- **Simulasi tanpa alat fisik**: karena ESP32 belum siap, buat 1 Artisan Command (`php artisan node:simulate`) yang mengirim data dummy secara berkala ke endpoint ingest sendiri — ini bisa dipakai untuk demo dashboard tanpa hardware.
