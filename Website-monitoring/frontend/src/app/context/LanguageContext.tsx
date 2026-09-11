import { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'en' | 'id';

const translations = {
  en: {
    nav: {
      dashboard: 'Dashboard',
      alerts: 'Alerts & Notifications',
      reports: 'Reports & Data',
      settings: 'Settings',
    },
    header: { title: 'Water Monitoring System' },
    logout: 'Logout',
    settings: {
      title: 'Settings',
      subtitle: 'Configure system preferences and parameters',
      save: 'Save Changes',
      saved: 'Settings saved successfully!',
      language: {
        title: 'Language',
        subtitle: 'Choose your preferred interface language',
        en: 'English',
        id: 'Indonesian',
      },
      notifications: {
        title: 'Notification Settings',
        subtitle: 'Configure alert preferences',
        email: 'Email Notifications',
        critical: 'Critical Alerts',
        warning: 'Warning Alerts',
        info: 'Info Alerts',
        daily: 'Daily Reports',
      },
      preferences: {
        title: 'System Preferences',
        subtitle: 'General system settings',
        timezone: 'Timezone',
        theme: 'Theme',
        themeLight: 'Light',
        themeDark: 'Dark',
        themeAuto: 'Auto',
        autoRefresh: 'Auto Refresh',
        refreshInterval: 'Refresh Interval (seconds)',
      },
      thresholds: {
        title: 'Alert Thresholds',
        subtitle: 'Configure sensor alert limits',
        phMin: 'pH Minimum',
        phMax: 'pH Maximum',
        temperatureMax: 'Temperature Max (°C)',
        turbidityMax: 'Turbidity Max (NTU)',
        waterLevelMin: 'Water Level Min (cm)',
        waterLevelMax: 'Water Level Max (cm)',
      },
      data: {
        title: 'Data Management',
        subtitle: 'Configure data storage settings',
        retention: 'Data Retention (days)',
        retentionHint: 'How long to keep historical sensor data',
        exportTitle: 'Data Export',
        exportDesc: 'Export all historical data for backup purposes',
        exportBtn: 'Export All Data',
        dangerTitle: 'Danger Zone',
        dangerDesc: 'Permanently delete old data to free up storage',
        dangerBtn: 'Clear Old Data',
      },
    },
  },
  id: {
    nav: {
      dashboard: 'Dasbor',
      alerts: 'Peringatan & Notifikasi',
      reports: 'Laporan & Data Sensor',
      settings: 'Pengaturan',
    },
    header: { title: 'Sistem Pemantauan Air' },
    logout: 'Keluar',
    settings: {
      title: 'Pengaturan',
      subtitle: 'Konfigurasi preferensi dan parameter sistem',
      save: 'Simpan Perubahan',
      saved: 'Pengaturan berhasil disimpan!',
      language: {
        title: 'Bahasa',
        subtitle: 'Pilih bahasa antarmuka yang Anda inginkan',
        en: 'Inggris',
        id: 'Indonesia',
      },
      notifications: {
        title: 'Pengaturan Notifikasi',
        subtitle: 'Konfigurasi preferensi peringatan',
        email: 'Notifikasi Email',
        critical: 'Peringatan Kritis',
        warning: 'Peringatan Sedang',
        info: 'Peringatan Informasi',
        daily: 'Laporan Harian',
      },
      preferences: {
        title: 'Preferensi Sistem',
        subtitle: 'Pengaturan sistem umum',
        timezone: 'Zona Waktu',
        theme: 'Tema',
        themeLight: 'Terang',
        themeDark: 'Gelap',
        themeAuto: 'Otomatis',
        autoRefresh: 'Perbarui Otomatis',
        refreshInterval: 'Interval Pembaruan (detik)',
      },
      thresholds: {
        title: 'Batas Ambang Peringatan',
        subtitle: 'Konfigurasi batas peringatan sensor',
        phMin: 'pH Minimum',
        phMax: 'pH Maksimum',
        temperatureMax: 'Suhu Maksimum (°C)',
        turbidityMax: 'Kekeruhan Maks. (NTU)',
        waterLevelMin: 'Level Air Minimum (cm)',
        waterLevelMax: 'Level Air Maksimum (cm)',
      },
      data: {
        title: 'Manajemen Data',
        subtitle: 'Konfigurasi pengaturan penyimpanan data',
        retention: 'Retensi Data (hari)',
        retentionHint: 'Berapa lama menyimpan data historis sensor',
        exportTitle: 'Ekspor Data',
        exportDesc: 'Ekspor semua data historis untuk keperluan cadangan',
        exportBtn: 'Ekspor Semua Data',
        dangerTitle: 'Zona Berbahaya',
        dangerDesc: 'Hapus permanen data lama untuk mengosongkan penyimpanan',
        dangerBtn: 'Hapus Data Lama',
      },
    },
  },
} as const;

type Translations = typeof translations['en'];

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const stored = (localStorage.getItem('language') as Language) || 'id';
  const [language, setLanguageState] = useState<Language>(stored);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: translations[language] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used inside LanguageProvider');
  return ctx;
}
