import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { Dropdown, Avatar, Button, ConfigProvider, theme as antdTheme } from 'antd';
import type { MenuProps } from 'antd';
import {
  Sun,
  Moon,
  User,
  Settings,
  LogOut,
  ChevronDown,
  BookOpen,
  Menu,
  X,
} from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { useStore } from '../../stores';

// ============================================
// Navbar Component
// ============================================

const Navbar = observer(() => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const { authStore } = useStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { user, token } = authStore;
  const isAuthenticated = !!token && !!user;

  // ============================================
  // Logout Handler
  // ============================================

  const handleLogout = () => {
    authStore.logout();
    navigate('/');
  };

  // ============================================
  // User Dropdown Menu Items
  // ============================================

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      label: (
        <Link to="/profile" className="flex items-center gap-2">
          <User className="w-4 h-4" />
          <span>Profile</span>
        </Link>
      ),
    },
    {
      key: 'settings',
      label: (
        <Link to="/settings" className="flex items-center gap-2">
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </Link>
      ),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      danger: true,
      label: (
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      ),
    },
  ];

  // ============================================
  // Render
  // ============================================

  return (
    <ConfigProvider
      theme={{
        algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        token: {
          colorPrimary: '#8b5cf6',
          borderRadius: 8,
        },
        components: {
          Dropdown: {
            controlItemBgHover: isDark
              ? 'rgba(139, 92, 246, 0.15)'
              : 'rgba(139, 92, 246, 0.1)',
            colorBgElevated: isDark ? '#1f1f1f' : '#ffffff',
            boxShadowSecondary: isDark
              ? '0 6px 16px 0 rgba(0, 0, 0, 0.32), 0 3px 6px -4px rgba(0, 0, 0, 0.48)'
              : '0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12)',
          },
        },
      }}
    >
      <header
        className={`sticky top-0 z-50 w-full border-b backdrop-blur-md transition-colors duration-300 ${
          isDark
            ? 'bg-slate-900/80 border-white/[0.08]'
            : 'bg-white/80 border-slate-200/80'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* ============================================ */}
            {/* Left Side - Logo */}
            {/* ============================================ */}

            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br from-purple-500 to-violet-600 shadow-lg shadow-purple-500/25 group-hover:shadow-purple-500/40 transition-shadow">
                <span className="text-white font-bold text-sm">M</span>
              </div>
              <span
                className={`font-bold tracking-tighter text-xl ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}
              >
                MATRIX
              </span>
            </Link>

            {/* ============================================ */}
            {/* Center - Navigation Links (Desktop) */}
            {/* ============================================ */}

            <nav className="hidden md:flex items-center gap-6">
              <Link
                to="/courses"
                className={`text-sm font-medium transition-colors ${
                  isDark
                    ? 'text-slate-300 hover:text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Courses
              </Link>
              {isAuthenticated && (
                <Link
                  to="/dashboard"
                  className={`text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    isDark
                      ? 'text-slate-300 hover:text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  My Learning
                </Link>
              )}
            </nav>

            {/* ============================================ */}
            {/* Right Side - Actions */}
            {/* ============================================ */}

            <div className="flex items-center gap-2 sm:gap-4">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className={`relative p-2 rounded-lg transition-all duration-300 ${
                  isDark
                    ? 'bg-white/[0.08] hover:bg-white/[0.12] text-slate-300 hover:text-white'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900'
                }`}
                aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
              >
                <div className="relative w-5 h-5">
                  <Sun
                    className={`absolute inset-0 w-5 h-5 transition-all duration-300 ${
                      isDark
                        ? 'opacity-0 rotate-90 scale-50'
                        : 'opacity-100 rotate-0 scale-100'
                    }`}
                  />
                  <Moon
                    className={`absolute inset-0 w-5 h-5 transition-all duration-300 ${
                      isDark
                        ? 'opacity-100 rotate-0 scale-100'
                        : 'opacity-0 -rotate-90 scale-50'
                    }`}
                  />
                </div>
              </button>

              {/* ============================================ */}
              {/* Logged Out State */}
              {/* ============================================ */}

              {!isAuthenticated && (
                <div className="hidden sm:flex items-center gap-3">
                  <Link
                    to="/login"
                    className={`text-sm font-medium px-4 py-2 rounded-lg transition-colors ${
                      isDark
                        ? 'text-slate-300 hover:text-white hover:bg-white/[0.08]'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    Log In
                  </Link>
                  <Link to="/register">
                    <Button
                      type="primary"
                      className="!shadow-lg !shadow-purple-500/25 hover:!shadow-purple-500/40"
                    >
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}

              {/* ============================================ */}
              {/* Logged In State */}
              {/* ============================================ */}

              {isAuthenticated && (
                <Dropdown
                  menu={{ items: userMenuItems }}
                  trigger={['click']}
                  placement="bottomRight"
                >
                  <button
                    className={`flex items-center gap-2 py-1.5 pl-1.5 pr-2 rounded-full transition-all duration-200 ${
                      isDark
                        ? 'bg-white/[0.08] hover:bg-white/[0.12]'
                        : 'bg-slate-100 hover:bg-slate-200'
                    }`}
                  >
                    <Avatar
                      size={28}
                      src={user?.avatarUrl}
                      className="bg-gradient-to-br from-purple-500 to-violet-600"
                      icon={<User className="w-4 h-4" />}
                    />
                    <span
                      className={`hidden sm:block text-sm font-medium max-w-[100px] truncate ${
                        isDark ? 'text-slate-200' : 'text-slate-700'
                      }`}
                    >
                      {user?.name?.split(' ')[0]}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 transition-colors ${
                        isDark ? 'text-slate-400' : 'text-slate-500'
                      }`}
                    />
                  </button>
                </Dropdown>
              )}

              {/* ============================================ */}
              {/* Mobile Menu Button */}
              {/* ============================================ */}

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`md:hidden p-2 rounded-lg transition-colors ${
                  isDark
                    ? 'bg-white/[0.08] hover:bg-white/[0.12] text-slate-300'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ============================================ */}
        {/* Mobile Menu */}
        {/* ============================================ */}

        {mobileMenuOpen && (
          <div
            className={`md:hidden border-t ${
              isDark ? 'border-white/[0.08] bg-slate-900' : 'border-slate-200 bg-white'
            }`}
          >
            <div className="px-4 py-4 space-y-3">
              <Link
                to="/courses"
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-lg text-sm font-medium ${
                  isDark
                    ? 'text-slate-300 hover:bg-white/[0.08]'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Courses
              </Link>

              {isAuthenticated ? (
                <>
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-3 py-2 rounded-lg text-sm font-medium ${
                      isDark
                        ? 'text-slate-300 hover:bg-white/[0.08]'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    My Learning
                  </Link>
                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-3 py-2 rounded-lg text-sm font-medium ${
                      isDark
                        ? 'text-slate-300 hover:bg-white/[0.08]'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className={`block w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-red-500 ${
                      isDark ? 'hover:bg-red-500/10' : 'hover:bg-red-50'
                    }`}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-3 py-2 rounded-lg text-sm font-medium ${
                      isDark
                        ? 'text-slate-300 hover:bg-white/[0.08]'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Log In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block"
                  >
                    <Button type="primary" block>
                      Sign Up
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>
    </ConfigProvider>
  );
});

export default Navbar;

