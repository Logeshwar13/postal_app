import type { ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface SidebarItem {
  icon: ReactNode;
  label: string;
  path: string;
  color?: string;
}

interface SidebarProps {
  items: SidebarItem[];
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar = ({ items, isOpen, onClose }: SidebarProps) => {
  const { user } = useAuth();
  const location = useLocation();
  const isAdmin = user?.role === 'admin';

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        aria-label="Sidebar navigation"
        className={`
          fixed lg:sticky top-0 left-0
          h-screen w-64 flex-shrink-0 flex flex-col
          z-50 overflow-hidden
          transition-transform duration-300 ease-in-out
          lg:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        style={{ background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}
      >
        {/* Logo area */}
        <div className="px-5 pt-5 pb-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-sm shadow-lg"
              style={{ background: 'linear-gradient(135deg, #C8102E, #E6324B)' }}
            >
              DS
            </div>
            <div>
              <p className="font-black text-white text-base leading-none">DakShiksha</p>
              <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>GDS Training</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg transition-colors"
            style={{ color: 'rgba(255,255,255,0.5)' }}
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Role badge */}
        <div className="px-5 mb-4 flex-shrink-0 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
          <span className="text-xs font-semibold tracking-wide text-rose-400">
            {isAdmin ? 'Admin Panel' : 'Student Portal'}
          </span>
        </div>

        {/* Nav section label */}
        <p className="px-5 text-[10px] uppercase tracking-widest font-bold mb-2 flex-shrink-0" style={{ color: 'rgba(255,255,255,0.35)' }}>
          Navigation
        </p>

        {/* Scrollable nav */}
        <nav className="flex-1 overflow-y-auto px-3 space-y-0.5 pb-4" aria-label="Main navigation"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <style>{`nav::-webkit-scrollbar { display: none; }`}</style>
          {items.map((item, index) => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={index}
                to={item.path}
                onClick={() => window.innerWidth < 1024 && onClose()}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group"
                style={({ isActive: active }) => ({
                  background: active ? 'rgba(200,16,46,0.85)' : 'transparent',
                  backdropFilter: active ? 'blur(8px)' : 'none',
                  color: active ? 'white' : 'rgba(255,255,255,0.65)',
                })}
                onMouseEnter={e => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)';
                    (e.currentTarget as HTMLElement).style.backdropFilter = 'blur(8px)';
                    (e.currentTarget as HTMLElement).style.color = 'white';
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.background = 'transparent';
                    (e.currentTarget as HTMLElement).style.backdropFilter = 'none';
                    (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.65)';
                  }
                }}
              >
                <span className="flex items-center justify-center flex-shrink-0 text-lg">
                  {item.icon}
                </span>
                <span className="text-sm font-medium truncate">{item.label}</span>
                {isActive && (
                  <span className="ml-auto w-1.5 h-4 rounded-full bg-white opacity-80" />
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User profile area at bottom */}
        {user && (
          <div
            className="px-4 py-3 flex-shrink-0 flex items-center gap-3"
            style={{
              borderTop: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(0,0,0,0.25)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
            }}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #C8102E, #E6324B)' }}
            >
              {user.full_name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user.full_name || 'User'}</p>
              <p className="text-[10px] truncate" style={{ color: 'rgba(255,255,255,0.4)' }}>{user.email}</p>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};
