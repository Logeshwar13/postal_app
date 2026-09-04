import type { ReactNode } from 'react';
import { useState } from 'react';
import { Sidebar } from '../common/Sidebar';
import { Header } from '../common/Header';
import { useTheme } from '@/hooks/useTheme';

interface DashboardLayoutProps {
  children: ReactNode;
  sidebarItems: Array<{ icon: ReactNode; label: string; path: string }>;
  title: string;
}

export const DashboardLayout = ({ children, sidebarItems, title }: DashboardLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { isDarkMode } = useTheme();

  return (
    <div className="min-h-screen flex transition-colors duration-200" style={{ background: isDarkMode ? '#0f172a' : '#f4f6f9' }}>
      {/* Skip to main content — keyboard accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-lg focus:font-medium focus:shadow-lg"
      >
        Skip to main content
      </a>

      <Sidebar
        items={sidebarItems}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          onMenuClick={() => setIsSidebarOpen(true)}
          title={title}
        />

        <main
          id="main-content"
          aria-label={title}
          className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto"
        >
          {children}
        </main>
      </div>
    </div>
  );
};
