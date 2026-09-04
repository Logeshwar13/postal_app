import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, LogOut, Moon, Sun, Settings, User, ChevronDown } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { NotificationBell } from './NotificationBell';
import { GlobalSearch } from './GlobalSearch';

interface HeaderProps {
  onMenuClick: () => void;
  title: string;
}

export const Header = ({ onMenuClick, title }: HeaderProps) => {
  const { user, signOut } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const initials = user?.full_name
    ? user.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  return (
    <header
      className="sticky top-0 z-30 flex-shrink-0 transition-colors duration-200"
      style={{
        background: isDarkMode ? 'rgba(15,23,42,0.95)' : 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${isDarkMode ? '#334155' : '#e5e7eb'}`,
        boxShadow: isDarkMode ? '0 1px 4px rgba(0,0,0,0.3)' : '0 1px 4px rgba(0,0,0,0.06)',
      }}
      role="banner"
    >
      <div className="flex items-center justify-between px-4 lg:px-6 h-16">

        {/* Left: hamburger + title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="lg:hidden w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
            style={{ color: isDarkMode ? '#94a3b8' : '#374151' }}
            onMouseEnter={e => (e.currentTarget.style.background = isDarkMode ? '#1e293b' : '#f3f4f6')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            aria-label="Open navigation"
          >
            <Menu size={20} />
          </button>

          <div>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: isDarkMode ? '#f8fafc' : '#111827', margin: 0, lineHeight: 1.2 }}>
              {title}
            </h2>
            <p style={{ fontSize: 11, color: isDarkMode ? '#64748b' : '#9ca3af', margin: 0 }}>
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
        </div>

        {/* Center: Search */}
        <div className="flex flex-1 max-w-xs sm:max-w-sm mx-2 sm:mx-6">
          <GlobalSearch />
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-1">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
            style={{ color: isDarkMode ? '#fbbf24' : '#6b7280' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = isDarkMode ? '#1e293b' : '#f3f4f6'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
            aria-label={isDarkMode ? 'Light mode' : 'Dark mode'}
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Notifications */}
          <NotificationBell />

          {/* Profile dropdown */}
          <div className="relative ml-1" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 px-2 py-1.5 rounded-xl transition-all"
              style={{ border: `1.5px solid ${isDarkMode ? '#334155' : '#e5e7eb'}` }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = '#C8102E')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = showDropdown ? '#C8102E' : (isDarkMode ? '#334155' : '#e5e7eb'))}
              aria-label="User menu"
              aria-haspopup="true"
              aria-expanded={showDropdown}
            >
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt={user.full_name || 'User'} className="w-7 h-7 rounded-full object-cover" />
              ) : (
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-xs"
                  style={{ background: 'linear-gradient(135deg, #C8102E, #E6324B)' }}
                >
                  {initials}
                </div>
              )}
              <div className="hidden sm:block text-left">
                <p style={{ fontSize: 12, fontWeight: 600, color: isDarkMode ? '#f8fafc' : '#111827', lineHeight: 1.2 }}>
                  {user?.full_name?.split(' ')[0] || 'User'}
                </p>
                <p style={{ fontSize: 10, color: isDarkMode ? '#94a3b8' : '#9ca3af', lineHeight: 1.2 }}>
                  {user?.role === 'admin' ? 'Administrator' : 'Student'}
                </p>
              </div>
              <ChevronDown
                size={14}
                style={{ color: '#9ca3af', transition: 'transform 0.2s', transform: showDropdown ? 'rotate(180deg)' : 'rotate(0deg)' }}
              />
            </button>

            {showDropdown && (
              <div
                className="absolute right-0 mt-2 w-52 rounded-2xl overflow-hidden"
                style={{
                  background: isDarkMode ? '#1e293b' : 'white',
                  border: `1px solid ${isDarkMode ? '#334155' : '#e5e7eb'}`,
                  boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                  zIndex: 100,
                }}
                role="menu"
              >
                {/* User info */}
                <div style={{ padding: '12px 16px', borderBottom: `1px solid ${isDarkMode ? '#334155' : '#f3f4f6'}` }}>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                      style={{ background: 'linear-gradient(135deg, #C8102E, #E6324B)', fontSize: 14 }}
                    >
                      {initials}
                    </div>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: 13, color: isDarkMode ? '#f8fafc' : '#111827', margin: 0 }}>{user?.full_name}</p>
                      <p style={{ fontSize: 11, color: isDarkMode ? '#94a3b8' : '#6b7280', margin: 0 }}>{user?.email}</p>
                    </div>
                  </div>
                </div>

                {/* Menu items */}
                <div style={{ padding: '6px' }}>
                  <button
                    onClick={() => { navigate(user?.role === 'admin' ? '/admin/settings' : '/student/profile'); setShowDropdown(false); }}
                    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl transition-colors text-left"
                    style={{ fontSize: 13, color: isDarkMode ? '#cbd5e1' : '#374151' }}
                    onMouseEnter={e => (e.currentTarget.style.background = isDarkMode ? '#334155' : '#f9fafb')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    role="menuitem"
                  >
                    <User size={15} style={{ color: isDarkMode ? '#94a3b8' : '#6b7280' }} />
                    Profile
                  </button>
                  <button
                    onClick={() => { navigate(user?.role === 'admin' ? '/admin/settings' : '/student/settings'); setShowDropdown(false); }}
                    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl transition-colors text-left"
                    style={{ fontSize: 13, color: isDarkMode ? '#cbd5e1' : '#374151' }}
                    onMouseEnter={e => (e.currentTarget.style.background = isDarkMode ? '#334155' : '#f9fafb')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    role="menuitem"
                  >
                    <Settings size={15} style={{ color: isDarkMode ? '#94a3b8' : '#6b7280' }} />
                    Settings
                  </button>
                </div>

                <div style={{ padding: '6px', borderTop: `1px solid ${isDarkMode ? '#334155' : '#f3f4f6'}` }}>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl transition-colors text-left"
                    style={{ fontSize: 13, color: '#ef4444' }}
                    onMouseEnter={e => (e.currentTarget.style.background = isDarkMode ? '#450a0a' : '#fef2f2')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    role="menuitem"
                  >
                    <LogOut size={15} />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
