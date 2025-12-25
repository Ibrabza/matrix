import { Dropdown, Avatar, ConfigProvider, theme as antdTheme } from 'antd';
import type { MenuProps } from 'antd';
import { Sun, Moon, User, Settings, LogOut, ChevronDown } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme.tsx';
import { Link } from 'react-router-dom';

const Header = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  const dropdownItems: MenuProps['items'] = [
    {
      key: 'account',
      label: (
        <Link to="/account" className="flex items-center gap-2">
          <User className="w-4 h-4" />
          <span>Account</span>
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
        <button className="flex items-center gap-2 w-full">
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      ),
      onClick: () => {
        console.log('Logout clicked');
        // Handle logout logic here
      },
    },
  ];

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
            controlItemBgHover: isDark ? 'rgba(139, 92, 246, 0.15)' : 'rgba(139, 92, 246, 0.1)',
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
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br from-purple-500 to-violet-600 shadow-lg shadow-purple-500/25 group-hover:shadow-purple-500/40 transition-shadow`}
              >
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

            {/* Actions */}
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
                      isDark ? 'opacity-0 rotate-90 scale-50' : 'opacity-100 rotate-0 scale-100'
                    }`}
                  />
                  <Moon
                    className={`absolute inset-0 w-5 h-5 transition-all duration-300 ${
                      isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-50'
                    }`}
                  />
                </div>
              </button>

              {/* User Dropdown */}
              <Dropdown
                menu={{ items: dropdownItems }}
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
                    className="bg-gradient-to-br from-purple-500 to-violet-600"
                    icon={<User className="w-4 h-4" />}
                  />
                  <ChevronDown
                    className={`w-4 h-4 transition-colors ${
                      isDark ? 'text-slate-400' : 'text-slate-500'
                    }`}
                  />
                </button>
              </Dropdown>
            </div>
          </div>
        </div>
      </header>
    </ConfigProvider>
  );
};

export default Header;

