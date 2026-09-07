import { useState } from 'react';
import { Save, Bell, Shield, Database, Palette, Globe } from 'lucide-react';
import { useLanguage, Language } from '../context/LanguageContext';

const FLAG: Record<Language, string> = { en: '🇬🇧', id: '🇮🇩' };

export function Settings() {
  const { language, setLanguage, t } = useLanguage();
  const s = t.settings;

  const [settings, setSettings] = useState({
    emailNotifications: true,
    criticalAlerts: true,
    warningAlerts: true,
    infoAlerts: false,
    dailyReports: true,
    phMin: 6.5,
    phMax: 8.5,
    temperatureMax: 28,
    turbidityMax: 1.5,
    waterLevelMin: 80,
    waterLevelMax: 130,
    dataRetention: 90,
    autoRefresh: true,
    refreshInterval: 5,
    timezone: 'WIB',
    theme: 'light',
  });

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleChange = (key: string, value: unknown) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const inputClass =
    'w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800';

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{s.title}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{s.subtitle}</p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 font-medium text-white transition-colors hover:bg-blue-700"
        >
          <Save className="h-5 w-5" />
          {s.save}
        </button>
      </div>

      {saved && (
        <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-200">
          {s.saved}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Language Switcher */}
        <div className="rounded-xl border-2 border-blue-200 bg-white p-6 shadow-sm dark:border-blue-900 dark:bg-gray-900 lg:col-span-2">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-950">
              <Globe className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white">{s.language.title}</h2>
              <p className="text-sm text-gray-500">{s.language.subtitle}</p>
            </div>
          </div>
          <div className="flex gap-3">
            {(['en', 'id'] as Language[]).map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`flex items-center gap-3 rounded-xl border-2 px-6 py-4 text-left transition-all ${
                  language === lang
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800'
                }`}
              >
                <span className="text-3xl">{FLAG[lang]}</span>
                <div>
                  <p className={`font-semibold ${language === lang ? 'text-blue-700 dark:text-blue-300' : 'text-gray-800 dark:text-gray-200'}`}>
                    {lang === 'en' ? 'English' : 'Indonesia'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {lang === 'en' ? s.language.en : s.language.id}
                  </p>
                </div>
                {language === lang && (
                  <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-blue-500">
                    <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 12 12">
                      <path d="M10 3L5 8.5 2 5.5 1 6.5 5 10.5 11 4z" />
                    </svg>
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-950">
              <Bell className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white">{s.notifications.title}</h2>
              <p className="text-sm text-gray-500">{s.notifications.subtitle}</p>
            </div>
          </div>

          <div className="space-y-4">
            {(
              [
                ['emailNotifications', s.notifications.email],
                ['criticalAlerts', s.notifications.critical],
                ['warningAlerts', s.notifications.warning],
                ['infoAlerts', s.notifications.info],
                ['dailyReports', s.notifications.daily],
              ] as [keyof typeof settings, string][]
            ).map(([key, label]) => (
              <div key={key} className="flex items-center justify-between">
                <label htmlFor={key} className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {label}
                </label>
                <input
                  id={key}
                  type="checkbox"
                  checked={settings[key] as boolean}
                  onChange={(e) => handleChange(key, e.target.checked)}
                  className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}
          </div>
        </div>

        {/* System Preferences */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-lg bg-purple-100 p-2 dark:bg-purple-950">
              <Palette className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white">{s.preferences.title}</h2>
              <p className="text-sm text-gray-500">{s.preferences.subtitle}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="timezone" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                {s.preferences.timezone}
              </label>
              <select
                id="timezone"
                value={settings.timezone}
                onChange={(e) => handleChange('timezone', e.target.value)}
                className={inputClass}
              >
                <option value="WIB">WIB (UTC+7)</option>
                <option value="WITA">WITA (UTC+8)</option>
                <option value="WIT">WIT (UTC+9)</option>
                <option value="UTC">UTC</option>
              </select>
            </div>

            <div>
              <label htmlFor="theme" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                {s.preferences.theme}
              </label>
              <select
                id="theme"
                value={settings.theme}
                onChange={(e) => handleChange('theme', e.target.value)}
                className={inputClass}
              >
                <option value="light">{s.preferences.themeLight}</option>
                <option value="dark">{s.preferences.themeDark}</option>
                <option value="auto">{s.preferences.themeAuto}</option>
              </select>
            </div>

            <div className="flex items-center justify-between pt-2">
              <label htmlFor="autoRefresh" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {s.preferences.autoRefresh}
              </label>
              <input
                id="autoRefresh"
                type="checkbox"
                checked={settings.autoRefresh}
                onChange={(e) => handleChange('autoRefresh', e.target.checked)}
                className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {settings.autoRefresh && (
              <div>
                <label htmlFor="refreshInterval" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {s.preferences.refreshInterval}
                </label>
                <input
                  id="refreshInterval"
                  type="number"
                  value={settings.refreshInterval}
                  onChange={(e) => handleChange('refreshInterval', parseInt(e.target.value))}
                  min="1"
                  max="60"
                  className={inputClass}
                />
              </div>
            )}
          </div>
        </div>

        {/* Alert Thresholds */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-lg bg-yellow-100 p-2 dark:bg-yellow-950">
              <Shield className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white">{s.thresholds.title}</h2>
              <p className="text-sm text-gray-500">{s.thresholds.subtitle}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="phMin" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {s.thresholds.phMin}
                </label>
                <input
                  id="phMin"
                  type="number"
                  value={settings.phMin}
                  onChange={(e) => handleChange('phMin', parseFloat(e.target.value))}
                  step="0.1"
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="phMax" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {s.thresholds.phMax}
                </label>
                <input
                  id="phMax"
                  type="number"
                  value={settings.phMax}
                  onChange={(e) => handleChange('phMax', parseFloat(e.target.value))}
                  step="0.1"
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label htmlFor="temperatureMax" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                {s.thresholds.temperatureMax}
              </label>
              <input
                id="temperatureMax"
                type="number"
                value={settings.temperatureMax}
                onChange={(e) => handleChange('temperatureMax', parseFloat(e.target.value))}
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="turbidityMax" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                {s.thresholds.turbidityMax}
              </label>
              <input
                id="turbidityMax"
                type="number"
                value={settings.turbidityMax}
                onChange={(e) => handleChange('turbidityMax', parseFloat(e.target.value))}
                step="0.1"
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="waterLevelMin" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {s.thresholds.waterLevelMin}
                </label>
                <input
                  id="waterLevelMin"
                  type="number"
                  value={settings.waterLevelMin}
                  onChange={(e) => handleChange('waterLevelMin', parseFloat(e.target.value))}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="waterLevelMax" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {s.thresholds.waterLevelMax}
                </label>
                <input
                  id="waterLevelMax"
                  type="number"
                  value={settings.waterLevelMax}
                  onChange={(e) => handleChange('waterLevelMax', parseFloat(e.target.value))}
                  className={inputClass}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-lg bg-green-100 p-2 dark:bg-green-950">
              <Database className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white">{s.data.title}</h2>
              <p className="text-sm text-gray-500">{s.data.subtitle}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="dataRetention" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                {s.data.retention}
              </label>
              <input
                id="dataRetention"
                type="number"
                value={settings.dataRetention}
                onChange={(e) => handleChange('dataRetention', parseInt(e.target.value))}
                min="30"
                max="365"
                className={inputClass}
              />
              <p className="mt-1 text-xs text-gray-500">{s.data.retentionHint}</p>
            </div>

            <div className="space-y-2 rounded-lg border border-gray-200 p-4 dark:border-gray-700">
              <h3 className="font-medium text-gray-900 dark:text-white">{s.data.exportTitle}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{s.data.exportDesc}</p>
              <button className="w-full rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700">
                {s.data.exportBtn}
              </button>
            </div>

            <div className="space-y-2 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950">
              <h3 className="font-medium text-red-900 dark:text-red-200">{s.data.dangerTitle}</h3>
              <p className="text-sm text-red-700 dark:text-red-400">{s.data.dangerDesc}</p>
              <button className="w-full rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700">
                {s.data.dangerBtn}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
