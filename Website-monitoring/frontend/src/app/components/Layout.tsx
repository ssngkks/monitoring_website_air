import { useEffect, useState } from 'react';
import { Outlet, useNavigate, NavLink } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  LayoutDashboard,
  Bell,
  FileText,
  Settings,
  BookOpen,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Pencil,
  Camera,
} from 'lucide-react';

interface ProfileData {
  name: string;
  avatar: string;
}

export function Layout() {
  const { user, logout, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  /* =========================
     PROFILE STATE
  ========================= */
  const [profile, setProfile] = useState<ProfileData>({
    name: user?.name || 'Administrator',
    avatar:
      user?.avatar ||
      'https://api.dicebear.com/7.x/avataaars/svg?seed=default',
  });

  const [editProfileOpen, setEditProfileOpen] = useState(false);

  const [editName, setEditName] = useState(
    user?.name || 'Administrator'
  );

  const [editAvatar, setEditAvatar] = useState(
    user?.avatar ||
      'https://api.dicebear.com/7.x/avataaars/svg?seed=default'
  );

  /* =========================
     AUTH CHECK
  ========================= */
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  /* =========================
     LOAD PROFILE
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

  if (!isAuthenticated) {
    return null;
  }

  /* =========================
     LOGOUT
  ========================= */
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  /* =========================
     OPEN EDIT PROFILE
  ========================= */
  const handleOpenEditProfile = () => {
    setEditName(profile.name);
    setEditAvatar(profile.avatar);
    setEditProfileOpen(true);
  };

  /* =========================
     IMAGE UPLOAD
  ========================= */
  const handleAvatarChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    // Batasi file hanya gambar
    if (!file.type.startsWith('image/')) {
      alert('Silakan pilih file gambar.');
      return;
    }

    // Batasi ukuran maksimal 2 MB
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
     SAVE PROFILE
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
     MENU
  ========================= */
  const menuItems = [
    {
      path: '/',
      icon: LayoutDashboard,
      label: t.nav.dashboard,
    },
    {
      path: '/alerts',
      icon: Bell,
      label: t.nav.alerts,
    },
    {
      path: '/reports',
      icon: FileText,
      label: t.nav.reports,
    },
    {
      path: '/settings',
      icon: Settings,
      label: t.nav.settings,
    },
    {
      path: '/guide',
      icon: BookOpen,
      label: t.nav.guide,
    },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">

      {/* =========================================
          SIDEBAR
      ========================================= */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } hidden transition-all duration-300 lg:flex lg:flex-col border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900`}
      >

        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-gray-200 px-4 dark:border-gray-800">

          <div className="flex items-center">
            {sidebarOpen && (
              <span className="text-lg font-bold">
                AquaMonitor
              </span>
            )}
          </div>

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="rounded-lg p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ChevronRight
              className={`h-5 w-5 transition-transform ${
                sidebarOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

        </div>

        {/* Navigation */}
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
                      isActive
                        ? 'text-blue-600 dark:text-blue-400'
                        : ''
                    }`}
                  />

                  {sidebarOpen && (
                    <span className="font-medium">
                      {item.label}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}

        </nav>

        {/* =========================================
            USER PROFILE
        ========================================= */}
        <div className="border-t border-gray-200 p-4 dark:border-gray-800">

          <div
            className={`flex items-center gap-3 ${
              !sidebarOpen ? 'justify-center' : ''
            }`}
          >

            <img
              src={profile.avatar}
              alt={profile.name}
              className="h-10 w-10 rounded-full object-cover"
            />

            {sidebarOpen && (
              <div className="min-w-0 flex-1">

                <p className="truncate font-medium">
                  {profile.name}
                </p>

                <p className="truncate text-sm text-gray-500">
                  {user?.role || 'Administrator'}
                </p>

              </div>
            )}

          </div>

          {/* Edit Profile Button */}
          {sidebarOpen && (
            <button
              onClick={handleOpenEditProfile}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              <Pencil className="h-4 w-4" />
              <span>Edit Profil</span>
            </button>
          )}

          {/* Logout */}
          {sidebarOpen && (
            <button
              onClick={handleLogout}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-red-600 transition-colors hover:bg-red-100 dark:bg-red-950 dark:text-red-400 dark:hover:bg-red-900"
            >

              <LogOut className="h-4 w-4" />

              <span className="font-medium">
                {t.logout}
              </span>

            </button>
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

            {/* Mobile Header */}
            <div className="flex h-16 items-center justify-between border-b border-gray-200 px-4 dark:border-gray-800">

              <div className="flex items-center">
                <span className="text-lg font-bold">
                  AquaMonitor
                </span>
              </div>

              <button
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="h-5 w-5" />
              </button>

            </div>

            {/* Mobile Navigation */}
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

                  <span className="font-medium">
                    {item.label}
                  </span>
                </NavLink>
              ))}

            </nav>

            {/* Mobile Profile */}
            <div className="absolute bottom-0 w-full border-t border-gray-200 p-4 dark:border-gray-800">

              <div className="mb-3 flex items-center gap-3">

                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className="h-10 w-10 rounded-full object-cover"
                />

                <div className="min-w-0 flex-1">

                  <p className="truncate font-medium">
                    {profile.name}
                  </p>

                  <p className="truncate text-sm text-gray-500">
                    {user?.role || 'Administrator'}
                  </p>

                </div>

              </div>

              <button
                onClick={handleOpenEditProfile}
                className="mb-2 flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                <Pencil className="h-4 w-4" />
                Edit Profil
              </button>

              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-red-600 transition-colors hover:bg-red-100 dark:bg-red-950 dark:text-red-400"
              >

                <LogOut className="h-4 w-4" />

                <span className="font-medium">
                  {t.logout}
                </span>

              </button>

            </div>

          </aside>

        </div>
      )}

      {/* =========================================
          MAIN CONTENT
      ========================================= */}
      <div className="flex flex-1 flex-col overflow-hidden">

        {/* Top Bar */}
        <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6 dark:border-gray-800 dark:bg-gray-900 lg:px-8">

          {/* Mobile Menu */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800 lg:hidden"
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Header Title */}
          <div className="hidden lg:block">
            <h2 className="text-xl font-semibold">
              {t.header.title}
            </h2>
          </div>

          {/* Header Right */}
          <div className="flex items-center gap-4">

            {/* Notification */}
            <NavLink
              to="/alerts"
              className="relative rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <Bell className="h-5 w-5" />

              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
            </NavLink>

            {/* Mobile Avatar */}
            <div className="flex items-center gap-3 lg:hidden">

              <img
                src={profile.avatar}
                alt={profile.name}
                className="h-8 w-8 rounded-full object-cover"
              />

            </div>

          </div>

        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-950">
          <Outlet />
        </main>

      </div>

      {/* =========================================
          EDIT PROFILE MODAL
      ========================================= */}
      {editProfileOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">

          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900">

            {/* Modal Header */}
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
                onClick={() => setEditProfileOpen(false)}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="h-5 w-5" />
              </button>

            </div>

            {/* Profile Photo */}
            <div className="mb-6 flex flex-col items-center">

              <div className="relative">

                <img
                  src={editAvatar}
                  alt="Preview profil"
                  className="h-28 w-28 rounded-full border-4 border-gray-100 object-cover shadow-sm dark:border-gray-800"
                />

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

            {/* Name */}
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

            {/* Buttons */}
            <div className="flex gap-3">

              <button
                onClick={() => setEditProfileOpen(false)}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                Batal
              </button>

              <button
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