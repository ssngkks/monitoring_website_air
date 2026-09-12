import { useEffect, useState } from 'react';
import { Outlet, useNavigate, NavLink } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  LayoutDashboard,
  Bell,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Camera,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from './ui/dropdown-menu';
import { Tooltip, TooltipTrigger, TooltipContent } from './ui/tooltip';
import { DefaultAvatarIcon } from './DefaultAvatarIcon';

interface ProfileData {
  name: string;
  avatar: string;
}

export function Layout() {
  const { user, logout, isAuthenticated, isLoading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  /* =========================
     PROFILE STATE (UNCHANGED)
  ========================= */
  const [profile, setProfile] = useState<ProfileData>({
    name: user?.name || 'Administrator',
    avatar: user?.avatar || '',
  });

  const [editProfileOpen, setEditProfileOpen] = useState(false);

  const [editName, setEditName] = useState(
    user?.name || 'Administrator'
  );

  const [editAvatar, setEditAvatar] = useState(user?.avatar || '');

  /* =========================
     AUTH CHECK
  ========================= */
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isLoading, isAuthenticated, navigate]);

  /* =========================
     LOAD PROFILE (UNCHANGED)
  ========================= */
  useEffect(() => {
    const savedProfile = localStorage.getItem('aqua_profile');

    if (savedProfile) {
      try {
        const parsedProfile: ProfileData = JSON.parse(savedProfile);

        setProfile(parsedProfile);
        setEditName(parsedProfile.name);
        setEditAvatar(parsedProfile.avatar);
      } catch (error) {
        console.error('Gagal membaca data profil:', error);
      }
    }
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <span className="text-xs font-medium text-gray-500">{t.common.loading}</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  /* =========================
     LOGOUT (UNCHANGED)
  ========================= */
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  /* =========================
     OPEN EDIT PROFILE (UNCHANGED)
  ========================= */
  const handleOpenEditProfile = () => {
    setEditName(profile.name);
    setEditAvatar(profile.avatar);
    setEditProfileOpen(true);
  };

  /* =========================
     IMAGE UPLOAD (UNCHANGED)
  ========================= */
  const handleAvatarChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('Silakan pilih file gambar.');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('Ukuran foto maksimal 2 MB.');
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setEditAvatar(reader.result);
      }
    };

    reader.readAsDataURL(file);
  };

  /* =========================
     SAVE PROFILE (UNCHANGED)
  ========================= */
  const handleSaveProfile = () => {
    const trimmedName = editName.trim();

    if (!trimmedName) {
      alert('Nama tidak boleh kosong.');
      return;
    }

    const newProfile: ProfileData = {
      name: trimmedName,
      avatar: editAvatar,
    };

    setProfile(newProfile);

    localStorage.setItem(
      'aqua_profile',
      JSON.stringify(newProfile)
    );

    setEditProfileOpen(false);
  };

  /* =========================
     MENU (UNCHANGED)
  ========================= */
  const menuItems = [
    { path: '/', icon: LayoutDashboard, label: t.nav.dashboard },
    { path: '/alerts', icon: Bell, label: t.nav.alerts },
    { path: '/reports', icon: FileText, label: t.nav.reports },
    { path: '/settings', icon: Settings, label: t.nav.settings },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">

      {/* =========================================
          SIDEBAR (DESKTOP)
      ========================================= */}
      <aside
        id="app-sidebar"
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } hidden transition-all duration-300 lg:flex lg:flex-col border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900`}
      >

        {/* Logo + Toggle Button */}
        <div className="flex h-16 items-center justify-between border-b border-gray-200 px-4 dark:border-gray-800">

          <div className="flex items-center">
            {sidebarOpen && (
              <span className="text-lg font-bold select-none cursor-default">AquaMonitor</span>
            )}
          </div>

          {/* Redesigned toggle button — Part 5 spec */}
          <button
            type="button"
            onClick={() => setSidebarOpen((prev) => !prev)}
            aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            aria-expanded={sidebarOpen}
            aria-controls="app-sidebar"
            className="flex h-8 w-9 items-center justify-center gap-1 rounded-lg border border-gray-200 bg-white text-gray-500 transition-colors duration-200 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 active:bg-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200 dark:active:bg-gray-700"
          >
            <span aria-hidden="true" className="h-4 w-px shrink-0 bg-current opacity-30" />
            {sidebarOpen ? (
              <ChevronLeft className="h-4 w-4 shrink-0" strokeWidth={2.5} />
            ) : (
              <ChevronRight className="h-4 w-4 shrink-0" strokeWidth={2.5} />
            )}
          </button>

        </div>

        {/* Navigation (UNCHANGED) */}
        <nav className="flex-1 space-y-1 p-4">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    className={`h-5 w-5 flex-shrink-0 ${
                      isActive ? 'text-blue-600 dark:text-blue-400' : ''
                    }`}
                  />
                  {sidebarOpen && (
                    <span className="font-medium">{item.label}</span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* =========================================
            SIDEBAR BOTTOM — LOGOUT ONLY
            (Avatar/nama/role dan Edit Profil DIHAPUS dari sini — Part 6 & 8)
        ========================================= */}
        <div className="border-t border-gray-200 p-4 dark:border-gray-800">
          {sidebarOpen ? (
            <button
              type="button"
              onClick={handleLogout}
              aria-label="Logout"
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-red-600 transition-colors hover:bg-red-100 dark:bg-red-950 dark:text-red-400 dark:hover:bg-red-900"
            >
              <LogOut className="h-4 w-4" />
              <span className="font-medium">{t.logout}</span>
            </button>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={handleLogout}
                  aria-label="Logout"
                  className="flex w-full items-center justify-center rounded-lg bg-red-50 p-2 text-red-600 transition-colors hover:bg-red-100 dark:bg-red-950 dark:text-red-400 dark:hover:bg-red-900"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">Logout</TooltipContent>
            </Tooltip>
          )}
        </div>

      </aside>

      {/* =========================================
          MOBILE MENU
      ========================================= */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">

          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setMobileMenuOpen(false)}
          />

          <aside className="fixed left-0 top-0 h-full w-64 bg-white shadow-xl dark:bg-gray-900">

            <div className="flex h-16 items-center justify-between border-b border-gray-200 px-4 dark:border-gray-800">
              <div className="flex items-center">
                <span className="text-lg font-bold select-none cursor-default">AquaMonitor</span>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
                className="rounded-lg p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="space-y-1 p-4">
              {menuItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all ${
                      isActive
                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400'
                        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                    }`
                  }
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </NavLink>
              ))}
            </nav>

            {/* Mobile bottom — LOGOUT ONLY (avatar/nama-role + Edit Profil dihapus) */}
            <div className="absolute bottom-0 w-full border-t border-gray-200 p-4 dark:border-gray-800">
              <button
                type="button"
                onClick={handleLogout}
                aria-label="Logout"
                className="flex w-full items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-red-600 transition-colors hover:bg-red-100 dark:bg-red-950 dark:text-red-400 dark:hover:bg-red-900"
              >
                <LogOut className="h-4 w-4" />
                <span className="font-medium">{t.logout}</span>
              </button>
            </div>

          </aside>

        </div>
      )}

      {/* =========================================
          MAIN CONTENT
      ========================================= */}
      <div className="flex flex-1 flex-col overflow-hidden">

        <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6 dark:border-gray-800 dark:bg-gray-900 lg:px-8">

          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open menu"
            className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800 lg:hidden"
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="hidden lg:block">
            <h2 className="text-xl font-semibold">{t.header.title}</h2>
          </div>

          {/* Header Right: Notification + Profile (Part 6 & 7) */}
          <div className="flex items-center gap-4">

            <NavLink
              to="/alerts"
              aria-label="Notifications"
              className="relative rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
            </NavLink>

            {/* Profile Icon + Dropdown — tampil di SEMUA breakpoint */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label={`Buka menu profil untuk ${profile.name}`}
                  className="flex items-center justify-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 select-none"
                >
                  {profile.avatar ? (
                    <img
                      src={profile.avatar}
                      alt={profile.name}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500">
                      <DefaultAvatarIcon className="h-5 w-5" />
                    </span>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                sideOffset={8}
                className="w-56 rounded-lg border border-gray-200 bg-white p-1 text-sm shadow-lg dark:border-gray-800 dark:bg-gray-900"
              >
                <DropdownMenuLabel className="px-2 py-1.5">
                  <span className="block truncate font-medium text-gray-900 dark:text-gray-100">
                    {profile.name}
                  </span>
                  <span className="block truncate text-xs font-normal text-gray-500 dark:text-gray-400">
                    {user?.email}
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="my-1 h-px bg-gray-200 dark:bg-gray-800" />
                <DropdownMenuItem
                  onSelect={handleOpenEditProfile}
                  className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-gray-700 outline-none hover:bg-gray-100 focus:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800 dark:focus:bg-gray-800"
                >
                  <Pencil className="h-4 w-4" />
                  Edit Profil
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

          </div>

        </header>

        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-950">
          <Outlet />
        </main>

      </div>

      {/* =========================================
          EDIT PROFILE MODAL (UNCHANGED)
      ========================================= */}
      {editProfileOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900">

            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Edit Profil
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Ubah nama dan foto profil kamu
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditProfileOpen(false)}
                aria-label="Tutup"
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-6 flex flex-col items-center">
              <div className="relative">
                {editAvatar ? (
                  <img
                    src={editAvatar}
                    alt="Preview profil"
                    className="h-28 w-28 rounded-full border-4 border-gray-100 object-cover shadow-sm dark:border-gray-800"
                  />
                ) : (
                  <span className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-gray-100 bg-gray-100 text-gray-400 dark:border-gray-800 dark:bg-gray-800 dark:text-gray-500">
                    <DefaultAvatarIcon className="h-16 w-16" />
                  </span>
                )}
                <label
                  htmlFor="profile-photo"
                  className="absolute bottom-0 right-0 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-blue-600 text-white shadow-md transition-colors hover:bg-blue-700"
                >
                  <Camera className="h-4 w-4" />
                  <input
                    id="profile-photo"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="mt-3 text-xs text-gray-500">
                Klik ikon kamera untuk mengganti foto
              </p>
              <p className="text-xs text-gray-400">
                Maksimal ukuran foto 2 MB
              </p>
            </div>

            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
                Nama
              </label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Masukkan nama"
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-blue-500 dark:focus:ring-blue-900"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setEditProfileOpen(false)}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveProfile}
                className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
              >
                Simpan Perubahan
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}