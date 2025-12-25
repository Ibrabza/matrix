import type { ReactNode } from 'react';
import { observer } from 'mobx-react-lite';
import Navbar from '../components/layout/Navbar';
import { useTheme } from '../hooks/useTheme';

interface MainLayoutProps {
  children: ReactNode;
  /** Hide the navbar (useful for special pages) */
  hideNavbar?: boolean;
}

/**
 * MainLayout - Global layout wrapper with Navbar
 * 
 * @example
 * ```tsx
 * // With navbar (default)
 * <MainLayout>
 *   <PageContent />
 * </MainLayout>
 * 
 * // Without navbar
 * <MainLayout hideNavbar>
 *   <FullScreenPage />
 * </MainLayout>
 * ```
 */
const MainLayout = observer(({ children, hideNavbar = false }: MainLayoutProps) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDark ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* Navbar */}
      {!hideNavbar && <Navbar />}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer (optional - can add later) */}
    </div>
  );
});

export default MainLayout;
