# Water Monitoring Dashboard (Community)

> Dokumentasi ini dibuat murni berdasarkan isi file yang diunggah (`Water_Monitoring_Dashboard__Community_.rar`), **tanpa menambah, mengurangi, atau mengubah fitur apa pun** yang sudah ada di dalam kode sumber.

Proyek ini adalah *code bundle* hasil ekspor dari **Figma Make**, dengan sumber desain asli di:
`https://www.figma.com/design/7JhLWRpBJ3zI7bb1lr7TBV/Water-Monitoring-Dashboard--Community-`

---

## 1. Ringkasan Proyek

**Nama aplikasi (branding di UI):** AquaMonitor — Water Monitoring System
**Nama paket (package.json):** `@figma/my-make-file`
**Versi:** `0.0.1`
**Tipe:** Frontend Single Page Application (SPA), tanpa backend/API nyata (semua data adalah mock/simulasi di sisi klien).

Aplikasi ini adalah dashboard pemantauan kualitas air berbasis web dengan antarmuka dwibahasa (Inggris & Indonesia), menampilkan data sensor (pH, suhu, kelembapan, kekeruhan, level air, getaran) dalam bentuk kartu metrik, grafik, status jaringan sensor, sistem peringatan, laporan, serta halaman pengaturan dan panduan pengguna.

---

## 2. Tech Stack

### Framework & Build Tool
- **React** `18.3.1` (peer dependency)
- **React DOM** `18.3.1`
- **Vite** `6.3.5` sebagai build tool & dev server
- **TypeScript** (file `.tsx` / `.ts`)
- **@vitejs/plugin-react** `4.7.0`

### Styling
- **Tailwind CSS** `4.1.12` (via `@tailwindcss/vite` `4.1.12`)
- `tw-animate-css` `1.3.8`
- `class-variance-authority` `0.7.1`, `clsx` `2.1.1`, `tailwind-merge` `3.2.0` (utility untuk penggabungan className)
- File tema: `theme.css`, `globals.css`, `tailwind.css`, `fonts.css`, `index.css`, serta `default_shadcn_theme.css` di root

### Routing
- **react-router** `7.13.0` (`createBrowserRouter`, `RouterProvider`)

### UI Component Library
- **shadcn/ui** (komponen di `src/app/components/ui/`, berlisensi MIT — dicatat di `ATTRIBUTIONS.md`)
- Dibangun di atas **Radix UI primitives**, di antaranya:
  `@radix-ui/react-accordion`, `alert-dialog`, `aspect-ratio`, `avatar`, `checkbox`, `collapsible`, `context-menu`, `dialog`, `dropdown-menu`, `hover-card`, `label`, `menubar`, `navigation-menu`, `popover`, `progress`, `radio-group`, `scroll-area`, `select`, `separator`, `slider`, `slot`, `switch`, `tabs`, `toggle`, `toggle-group`, `tooltip`
- **lucide-react** `0.487.0` — ikon
- **@mui/material** `7.3.5` & **@mui/icons-material** `7.3.5` (Material UI, terpasang sebagai dependency)
- **@emotion/react** `11.14.0` & **@emotion/styled** `11.14.1` (dependency MUI)

### Grafik & Visualisasi Data
- **recharts** `2.15.2` — digunakan untuk semua grafik (Line, Area, Bar, Pie Chart) di halaman Dashboard dan Reports

### Form & Interaksi
- **react-hook-form** `7.55.0`
- **input-otp** `1.4.2`
- **cmdk** `1.1.1` (command menu)
- **vaul** `1.1.2` (drawer)
- **embla-carousel-react** `8.6.0`
- **react-slick** `0.31.0`
- **react-responsive-masonry** `2.7.1`
- **react-resizable-panels** `2.1.7`
- **react-dnd** `16.0.1` & **react-dnd-html5-backend** `16.0.1`
- **react-popper** `2.3.0` & **@popperjs/core** `2.11.8`
- **react-day-picker** `8.10.1`
- **date-fns** `3.6.0`
- **sonner** `2.0.3` (toast notification)
- **next-themes** `0.4.6` (dependency untuk dukungan tema, meski implementasi tema aktual di proyek ini masih manual via Tailwind `dark:` class)
- **motion** `12.23.24` (animasi)

### Dev Dependencies
- `tailwindcss` `4.1.12`
- `@tailwindcss/vite` `4.1.12`
- `@vitejs/plugin-react` `4.7.0`
- `vite` `6.3.5`

### Package Manager
- Terdapat `pnpm-workspace.yaml` dan `package-lock.json` (indikasi proyek dapat dijalankan dengan npm atau pnpm; ada `pnpm.overrides` untuk memaksa versi `vite` ke `6.3.5`)

---

## 3. Cara Menjalankan (dari README.md asli)

```bash
npm i           # instal dependencies
npm run dev      # menjalankan development server (Vite)
npm run build    # build produksi
```

Script yang tersedia di `package.json`:
- `"dev": "vite"`
- `"build": "vite build"`

---

## 4. Struktur Direktori

```
Water Monitoring Dashboard (Community)/
├── ATTRIBUTIONS.md
├── README.md
├── default_shadcn_theme.css
├── guidelines/
│   └── Guidelines.md          # template kosong untuk custom AI guidelines (belum diisi)
├── index.html
├── package.json
├── package-lock.json
├── pnpm-workspace.yaml
├── postcss.config.mjs
├── vite.config.ts
└── src/
    ├── main.tsx                # entry point React (createRoot)
    ├── app/
    │   ├── App.tsx              # root component: LanguageProvider > AuthProvider > RouterProvider
    │   ├── routes.tsx           # definisi route (react-router)
    │   ├── context/
    │   │   ├── AuthContext.tsx      # autentikasi mock berbasis localStorage
    │   │   └── LanguageContext.tsx  # terjemahan EN/ID
    │   ├── lib/
    │   │   └── utils.ts
    │   ├── components/
    │   │   ├── AlertPanel.tsx       # komponen daftar alert generik (reusable)
    │   │   ├── Layout.tsx           # shell aplikasi: sidebar, topbar, profil, logout
    │   │   ├── MetricCard.tsx       # kartu metrik dengan gauge lingkaran
    │   │   ├── SensorStatus.tsx     # grid status jaringan sensor
    │   │   ├── figma/
    │   │   │   └── ImageWithFallback.tsx
    │   │   └── ui/                  # ~40 komponen shadcn/ui (button, dialog, table, tabs, dst.)
    │   └── pages/
    │       ├── Login.tsx
    │       ├── Signup.tsx
    │       ├── Dashboard.tsx
    │       ├── Alerts.tsx
    │       ├── Reports.tsx
    │       ├── Settings.tsx
    │       ├── UserGuide.tsx
    │       └── NotFound.tsx
    └── styles/
        ├── fonts.css
        ├── globals.css
        ├── index.css
        ├── tailwind.css
        └── theme.css
```

---

## 5. Routing (`src/app/routes.tsx`)

| Path | Komponen | Keterangan |
|---|---|---|
| `/login` | `Login` | Halaman login (di luar Layout) |
| `/signup` | `Signup` | Halaman registrasi (di luar Layout) |
| `/` | `Layout` → `Dashboard` | Index route, dibungkus Layout |
| `/alerts` | `Layout` → `Alerts` | |
| `/reports` | `Layout` → `Reports` | |
| `/settings` | `Layout` → `Settings` | |
| `/guide` | `Layout` → `UserGuide` | |
| `/*` | `Layout` → `NotFound` | Catch-all route |

Router dibuat dengan `createBrowserRouter` dari `react-router` v7.

---

## 6. Autentikasi (`AuthContext.tsx`)

- Autentikasi bersifat **mock** (simulasi), belum terhubung ke backend/API nyata.
- **Login**: diterima jika `email` diisi dan `password.length >= 6`. User mock dibuat dengan:
  - `id: '1'`
  - `name`: diambil dari bagian sebelum `@` pada email
  - `role: 'Administrator'`
  - `avatar`: URL avatar dari `api.dicebear.com` (seed = email)
- **Signup**: diterima jika `name`, `email` diisi dan `password.length >= 6`. User mock dibuat dengan `role: 'User'` dan `id` dari `Date.now()`.
- Data user disimpan di `localStorage` dengan key `'user'`, dan otomatis dimuat ulang saat aplikasi start (`useEffect`).
- **Logout**: menghapus state user dan key `'user'` dari `localStorage`.
- Route yang dibungkus `Layout` melakukan redirect ke `/login` jika `isAuthenticated` bernilai `false`.
- Route `/login` dan `/signup` melakukan redirect ke `/` jika user sudah `isAuthenticated`.

---

## 7. Dukungan Bahasa (`LanguageContext.tsx`)

- Mendukung 2 bahasa: **English (`en`)** dan **Indonesian (`id`)**.
- Objek `translations` berisi string untuk:
  - Navigasi (`nav`): Dashboard, Alerts & Notifications, Reports & Data, Settings, User Guide
  - Header title: "Water Monitoring System" / "Sistem Pemantauan Air"
  - Logout: "Logout" / "Keluar"
  - Halaman **Settings** secara penuh (judul, subjudul, tombol simpan, label pengaturan bahasa, notifikasi, preferensi sistem, ambang batas alert, manajemen data)
- Catatan: sebagian besar teks statis di halaman **Dashboard**, **Alerts**, dan **Reports** ditulis langsung dalam Bahasa Indonesia di kode (hard-coded), bukan melalui sistem terjemahan `LanguageContext` — hanya `Settings.tsx` dan (berdasarkan struktur data) `UserGuide.tsx` yang secara eksplisit memakai konten dwibahasa terstruktur dari context/objek konten lokal.

---

## 8. Halaman-Halaman Aplikasi

### 8.1 Login (`pages/Login.tsx`)
- Form email + password dengan validasi dasar (password minimal 6 karakter, ditangani oleh `AuthContext.login`).
- Menampilkan pesan error jika login gagal.
- Checkbox "Remember me" dan link "Forgot password?" (belum ada fungsi/handler — murni elemen visual).
- Link ke halaman **Signup**.
- Catatan info demo di bagian bawah form: *"Demo: Use any email and password (min 6 characters)"*.
- Branding: logo tetesan air (`Droplet` icon) + judul **AquaMonitor**.

### 8.2 Signup (`pages/Signup.tsx`)
- Form: Full Name, Email, Password, Confirm Password.
- Validasi: password & confirm password harus sama, dan password minimal 6 karakter.
- Redirect ke `/` setelah signup berhasil (via `AuthContext.signup`).
- Link ke halaman **Login**.

### 8.3 Dashboard (`pages/Dashboard.tsx`)
Halaman utama pemantauan real-time (simulasi), meliputi:

- **Header**: judul "Dashboard Pemantauan Air", jam real-time (`toLocaleTimeString`), dan indikator status sistem (badge hijau "Semua Sistem Normal" / merah berkedip "Getaran Terdeteksi!" tergantung state `metrics.vibration`).
- **4 Metric Cards** (komponen `MetricCard`, gauge lingkaran):
  1. pH Air (icon `Droplet`, range 0–14)
  2. Suhu / DHT (icon `Thermometer`, range 0–50°C)
  3. Kelembapan / DHT (icon `CloudRain`, range 0–100%)
  4. Kekeruhan (icon `Wind`, range 0–5 NTU)
- **Simulasi data real-time**: `setInterval` setiap 3 detik memperbarui nilai `ph`, `temperature`, `humidity`, `turbidity`, `waterLevel` secara acak dalam rentang kecil, serta peluang 5% untuk `vibration` menjadi `true`.
- **Status logic** (normal/warning/critical) dihitung otomatis dari nilai pH, turbidity, dan waterLevel terhadap ambang tertentu yang di-hardcode di dalam komponen.
- **Grafik dengan 3 tab** (menggunakan `recharts`, data 24 jam disimulasikan dengan `generateTimeSeriesData()`):
  1. **pH & Kekeruhan** — Line chart dua sumbu-Y
  2. **Suhu & Kelembapan** — Area chart dua sumbu-Y
  3. **Level Air & Getaran** — Bar chart level air
- **Kondisi Fisik**: dua kartu (Level Air dengan progress bar 0–200cm; Getaran dengan status dari sensor "MPU6050").
- **Sensor Network** (komponen `SensorStatus`): grid 6 titik pantau mock (Titik Pantau A–F) dengan status online/warning per titik dan metrik masing-masing (pH, temp, humidity, turbidity, water level, vibration).

### 8.4 Alerts (`pages/Alerts.tsx`)
- 8 data alert mock (`mockAlerts`) berbahasa Indonesia, dengan tipe: `critical`, `warning`, `info`, `success`.
- **Kartu statistik**: Total Alerts, Critical, Warnings, Info.
- **Filter** berdasarkan tipe (All / Critical / Warning / Info) dan **pencarian** berdasarkan pesan/lokasi.
- **Export ke CSV**: tombol Export men-generate file CSV (`alerts-<tanggal>.csv`) dari daftar alert yang sedang difilter, memakai `Blob` + `URL.createObjectURL`.
- **Dismiss alert**: menghapus alert dari daftar (state lokal, tidak persisten).
- **Modal detail alert**: menampilkan lokasi, severity (High/Medium/Low → ditampilkan sebagai "X Priority"), deskripsi lengkap, tombol Dismiss dan tombol "Take Action" (tombol "Take Action" belum memiliki handler/fungsi).

### 8.5 Reports (`pages/Reports.tsx`)
- **Kontrol laporan**:
  - Dropdown **Jenis Laporan**: Ringkasan Sistem, Kualitas pH, Suhu & Kelembapan (DHT), Kekeruhan Air, Level Air (Ultrasonik), Riwayat Getaran
  - Dropdown **Rentang Waktu**: Hari Ini, 7 Hari Terakhir, 30 Hari Terakhir, 3 Bulan Terakhir, Setahun Terakhir, Kustom
  - Toggle **Tampilan**: Charts / Table
  - **Ekspor Data**: tombol CSV (fungsional, generate & download file), PDF dan Excel (menampilkan `alert()` placeholder — belum diimplementasikan)
- **Quick Stats** (4 kartu, nilai statis): pH Rata-rata (7.14), Suhu Rata-rata (22.8°C), Kekeruhan Maks. (1.12 NTU), Getaran Terdeteksi (1×)
- **Mode Charts** (data mingguan mock `weeklyData`, Senin–Minggu):
  1. Tren pH Mingguan (Line chart)
  2. Kekeruhan & Level Air (Line chart, dua sumbu-Y)
  3. Suhu & Kelembapan / DHT (Bar chart, dua sumbu-Y)
  4. Distribusi Sensor Aktif (Pie chart, 6 kategori sensor: pH, DHT Suhu, DHT Humid, Turbidity, Ultrasonik, Getar)
- **Mode Table**: tabel data historis (`tableData`, 5 baris contoh tanggal 2026-08-29 s.d. 2026-09-02) dengan kolom Tanggal, pH, Suhu, Kelembapan, Turbidity, Level Air, Getaran (badge Terdeteksi/Normal), plus footer info jumlah data & tombol unduh dataset lengkap.

### 8.6 Settings (`pages/Settings.tsx`)
Sepenuhnya menggunakan `LanguageContext` (`t.settings`) untuk teks dwibahasa. Bagian-bagian:

1. **Language Switcher**: pilih English 🇬🇧 / Indonesia 🇮🇩, langsung mengubah context bahasa aplikasi.
2. **Notification Settings** (checkbox): Email Notifications, Critical Alerts, Warning Alerts, Info Alerts, Daily Reports.
3. **System Preferences**: Timezone (WIB/WITA/WIT/UTC), Theme (Light/Dark/Auto — pilihan UI saja, tidak mengubah tema aktual aplikasi), Auto Refresh (toggle) + Refresh Interval (detik, muncul kondisional saat Auto Refresh aktif).
4. **Alert Thresholds**: pH Minimum/Maximum, Temperature Max (°C), Turbidity Max (NTU), Water Level Min/Max (cm).
5. **Data Management**: Data Retention (hari), tombol Export All Data, dan "Danger Zone" — tombol Clear Old Data (belum ada handler/fungsi nyata untuk export & clear).

Semua nilai settings disimpan di **state lokal komponen** (`useState`), belum persisten ke localStorage/backend. Tombol "Save Changes" hanya menampilkan notifikasi sukses sementara (hilang otomatis setelah 3 detik) tanpa penyimpanan aktual.

### 8.7 User Guide (`pages/UserGuide.tsx`)
- Halaman bantuan/dokumentasi dwibahasa (EN/ID) dengan struktur kategori → artikel.
- Kategori (identik strukturnya di kedua bahasa):
  1. **Getting Started / Memulai** — System Overview, Dashboard Navigation, Understanding Metrics
  2. **Alerts & Notifications / Peringatan & Notifikasi** — Alert Types, Managing Alerts
  3. **Reports & Data / Laporan & Data** — Viewing Reports, Exporting Data
  4. **System Settings / Pengaturan Sistem** — Configuring Thresholds, Notification Preferences
  5. **Troubleshooting / Pemecahan Masalah** — Common Issues, Getting Help
- Terdapat fitur **pencarian artikel** (filter berdasarkan judul/isi).
- Layout dua panel: daftar kategori/artikel di satu sisi, konten artikel terpilih di sisi lain.

### 8.8 NotFound (`pages/NotFound.tsx`)
- Halaman fallback untuk route yang tidak dikenal (`path: '*'` di dalam `Layout`).

---

## 9. Komponen Bersama (Shared Components)

| Komponen | File | Fungsi |
|---|---|---|
| `Layout` | `components/Layout.tsx` | Shell utama: sidebar collapsible (desktop) + drawer (mobile), navigasi (Dashboard/Alerts/Reports/Settings/Guide), profil pengguna dengan avatar dari DiceBear, modal **Edit Profil** (ubah nama & foto, foto disimpan sebagai base64 di `localStorage` key `aqua_profile`, validasi tipe file gambar & maksimal 2MB), tombol Logout, top bar dengan lonceng notifikasi (link ke `/alerts`) |
| `MetricCard` | `components/MetricCard.tsx` | Kartu metrik dengan gauge lingkaran berbasis CSS `conic-gradient`, warna dinamis sesuai status (normal/warning/critical) atau `gaugeColor` custom |
| `SensorStatus` | `components/SensorStatus.tsx` | Grid kartu status untuk banyak sensor/titik pantau, menampilkan lokasi, status online/offline/warning, dan ringkasan 6 metrik per sensor |
| `AlertPanel` | `components/AlertPanel.tsx` | Komponen daftar alert generik dengan ikon & styling berbeda per tipe (critical/warning/success/info) — mendefinisikan tipe `Alert` yang dipakai ulang oleh halaman Alerts, namun komponen ini sendiri tidak dirender di halaman manapun dalam routing saat ini (halaman Alerts memiliki implementasi tampilan sendiri) |
| `ImageWithFallback` | `components/figma/ImageWithFallback.tsx` | Utilitas gambar dengan fallback (bawaan template Figma Make) |
| `ui/*` | `components/ui/` | ~40 komponen shadcn/ui siap pakai: accordion, alert, alert-dialog, aspect-ratio, avatar, badge, breadcrumb, button, calendar, card, carousel, chart, checkbox, collapsible, command, context-menu, dialog, drawer, dropdown-menu, form, hover-card, input, input-otp, label, menubar, navigation-menu, pagination, popover, progress, radio-group, resizable, scroll-area, select, separator, sheet, sidebar, skeleton, slider, sonner, switch, table, tabs, textarea, toggle, toggle-group, tooltip, use-mobile (hook), utils |

---

## 10. Data Sensor yang Dipantau

Berdasarkan seluruh kode, sistem ini dirancang untuk menampilkan 6 parameter sensor (nama sensor fisik disebutkan di teks UI):

| Parameter | Satuan | Sensor (disebut di UI) | Range Gauge Dashboard |
|---|---|---|---|
| pH Air | pH | — | 0–14 |
| Suhu | °C | DHT | 0–50 |
| Kelembapan | % | DHT | 0–100 |
| Kekeruhan (Turbidity) | NTU | — | 0–5 |
| Level Air | cm | Ultrasonik | 0–200 (progress bar) |
| Getaran (Vibration) | boolean (terdeteksi/normal) | MPU6050 | — |

Ambang batas alert default (didefinisikan di `Settings.tsx` sebagai nilai awal state, dan disebut ulang secara hard-code di beberapa tempat seperti `Dashboard.tsx`/`Alerts.tsx`):
- pH normal: 6.5 – 8.5 (warning jika < 6.8 atau > 7.8 di Dashboard; critical jika < 6.5 atau > 8.5)
- Turbidity: warning > 1.5 NTU, critical > 4 NTU
- Temperature Max: 28°C
- Water Level: warning jika < 80 atau > 130 cm; critical jika < 60 atau > 150 cm
- Data Retention default: 90 hari
- Refresh Interval default: 5 detik

---

## 11. Karakteristik Umum / Catatan Teknis

- **Tidak ada backend/API nyata** — seluruh data (metrik sensor, alert, laporan, daftar sensor) adalah data mock/simulasi yang di-hardcode atau digenerate secara acak di sisi klien.
- **Dark mode**: kelas Tailwind `dark:` sudah diterapkan secara konsisten di seluruh komponen, namun mekanisme toggle tema aktual (menyimpan preferensi & menerapkan class `dark` ke root) tidak ditemukan diimplementasikan secara fungsional di luar dropdown pilihan tema di halaman Settings.
- **Autentikasi & profil** disimpan di `localStorage` (`user`, `aqua_profile`) — tidak ada validasi keamanan sungguhan (cocok untuk prototipe/demo).
- **Ekspor data**: fitur export ke CSV berfungsi penuh (Alerts & Reports); export ke PDF dan Excel masih berupa placeholder (`alert(...)`).
- **Responsif**: layout menggunakan breakpoint Tailwind (`sm:`, `lg:`, `xl:`) — sidebar desktop collapsible, drawer mobile terpisah.
- **Lisensi pihak ketiga** dicatat di `ATTRIBUTIONS.md`: komponen dari shadcn/ui (MIT) dan foto dari Unsplash.
- File `guidelines/Guidelines.md` adalah template kosong bawaan Figma Make untuk custom AI guidelines — belum diisi konten spesifik proyek.

---

## 12. Ringkasan File Kunci

| File | Jumlah baris (approx.) |
|---|---|
| `src/app/pages/UserGuide.tsx` | 924 |
| `src/app/pages/Dashboard.tsx` | 668 |
| `src/app/components/Layout.tsx` | 611 |
| `src/app/pages/Settings.tsx` | 374 |
| `src/app/pages/Alerts.tsx` | 378 |
| `src/app/pages/Reports.tsx` | 353 |
| `src/app/pages/Signup.tsx` | 167 |
| `src/app/pages/Login.tsx` | 134 |
| `src/app/components/MetricCard.tsx` | 107 |
| `src/app/components/SensorStatus.tsx` | 91 |
| `src/app/components/AlertPanel.tsx` | 79 |
| `src/app/pages/NotFound.tsx` | 32 |

---

*Dokumen ini adalah deskripsi apa adanya (as-is) dari isi file `.rar` yang diunggah. Tidak ada fitur, kode, atau konfigurasi yang ditambahkan maupun dihapus dalam proses pembuatan dokumentasi ini.*
