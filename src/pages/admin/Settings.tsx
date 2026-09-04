import { useState, useEffect } from 'react';
import { Moon, Sun, Bell, Shield, LogOut, Download, Sliders } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { authService } from '@/services/authService';
import { supabase } from '@/supabase/client';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export const AdminSettings = () => {
    const { user } = useAuth();
    const { isDarkMode, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const [notifications, setNotifications] = useState({
        systemAlerts: true,
        userRegistrationAlerts: true,
        weeklyReportEmail: true,
    });

    const [platformSettings, setPlatformSettings] = useState({
        allowStudentRegistration: true,
        maintenanceMode: false,
        defaultLanguage: 'en',
    });

    useEffect(() => {
        const savedNotifications = localStorage.getItem('admin_notifications');
        const savedPlatform = localStorage.getItem('admin_platform_settings');

        if (savedNotifications) {
            try { setNotifications(JSON.parse(savedNotifications)); } catch { }
        }
        if (savedPlatform) {
            try { setPlatformSettings(JSON.parse(savedPlatform)); } catch { }
        }
    }, []);

    const handleNotificationToggle = (key: string) => {
        const updated = { ...notifications, [key as keyof typeof notifications]: !notifications[key as keyof typeof notifications] };
        setNotifications(updated);
        localStorage.setItem('admin_notifications', JSON.stringify(updated));
        toast.success('Notification settings updated');
    };

    const handlePlatformToggle = (key: string) => {
        const updated = { ...platformSettings, [key as keyof typeof platformSettings]: !platformSettings[key as keyof typeof platformSettings] };
        setPlatformSettings(updated);
        localStorage.setItem('admin_platform_settings', JSON.stringify(updated));
        toast.success('Platform configuration updated');
    };

    const handleExportSystemLogs = async () => {
        try {
            setLoading(true);
            const { data: logs, error } = await supabase
                .from('activity_logs')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(1000);

            if (error) throw error;

            const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `dakshiksha-admin-audit-logs-${Date.now()}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            toast.success('System audit logs exported successfully');
        } catch {
            toast.error('Failed to export audit logs');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            setLoading(true);
            await authService.signOut();
            toast.success('Logged out successfully');
            navigate('/login');
        } catch {
            toast.error('Failed to logout');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 800 }}>
            {/* Header */}
            <div>
                <h1 style={{ fontSize: 22, fontWeight: 900, color: isDarkMode ? '#f9fafb' : '#111827', margin: 0 }}>Admin Settings</h1>
                <p style={{ color: isDarkMode ? '#9ca3af' : '#6b7280', fontSize: 13, margin: '4px 0 0' }}>Configure platform preferences, theme, security, and administrative notifications</p>
            </div>

            {/* Theme & Appearance */}
            <div style={{ background: isDarkMode ? '#1f2937' : 'white', borderRadius: 16, border: isDarkMode ? '1px solid #374151' : '1px solid #f0f0f0', padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: 16 }}>
                <h3 style={{ fontWeight: 800, fontSize: 16, color: isDarkMode ? '#f9fafb' : '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                    {isDarkMode ? <Moon size={18} color="#93c5fd" /> : <Sun size={18} color="#f59e0b" />}
                    Appearance & Theme
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8, borderTop: isDarkMode ? '1px solid #374151' : '1px solid #f3f4f6' }}>
                    <div>
                        <p style={{ fontWeight: 600, fontSize: 14, color: isDarkMode ? '#f3f4f6' : '#111827', margin: 0 }}>Dark Mode</p>
                        <p style={{ fontSize: 12, color: isDarkMode ? '#9ca3af' : '#6b7280', margin: '2px 0 0' }}>Toggle dark theme interface for the Admin panel</p>
                    </div>
                    <button
                        onClick={toggleTheme}
                        style={{
                            width: 48,
                            height: 26,
                            borderRadius: 99,
                            background: isDarkMode ? '#C8102E' : '#d1d5db',
                            border: 'none',
                            cursor: 'pointer',
                            position: 'relative',
                            transition: 'background 0.2s',
                        }}
                    >
                        <div style={{
                            width: 20,
                            height: 20,
                            borderRadius: '50%',
                            background: 'white',
                            position: 'absolute',
                            top: 3,
                            left: isDarkMode ? 25 : 3,
                            transition: 'left 0.2s',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                        }} />
                    </button>
                </div>
            </div>

            {/* Platform Controls */}
            <div style={{ background: isDarkMode ? '#1f2937' : 'white', borderRadius: 16, border: isDarkMode ? '1px solid #374151' : '1px solid #f0f0f0', padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: 16 }}>
                <h3 style={{ fontWeight: 800, fontSize: 16, color: isDarkMode ? '#f9fafb' : '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Sliders size={18} color="#C8102E" />
                    Platform Controls
                </h3>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10, borderTop: isDarkMode ? '1px solid #374151' : '1px solid #f3f4f6' }}>
                    <div>
                        <p style={{ fontWeight: 600, fontSize: 14, color: isDarkMode ? '#f3f4f6' : '#111827', margin: 0 }}>Allow Student Registration</p>
                        <p style={{ fontSize: 12, color: isDarkMode ? '#9ca3af' : '#6b7280', margin: '2px 0 0' }}>Permit new GDS candidates to register self-service accounts</p>
                    </div>
                    <button
                        onClick={() => handlePlatformToggle('allowStudentRegistration')}
                        style={{
                            width: 48,
                            height: 26,
                            borderRadius: 99,
                            background: platformSettings.allowStudentRegistration ? '#16a34a' : '#d1d5db',
                            border: 'none',
                            cursor: 'pointer',
                            position: 'relative',
                            transition: 'background 0.2s',
                        }}
                    >
                        <div style={{
                            width: 20,
                            height: 20,
                            borderRadius: '50%',
                            background: 'white',
                            position: 'absolute',
                            top: 3,
                            left: platformSettings.allowStudentRegistration ? 25 : 3,
                            transition: 'left 0.2s',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                        }} />
                    </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10, borderTop: isDarkMode ? '1px solid #374151' : '1px solid #f3f4f6' }}>
                    <div>
                        <p style={{ fontWeight: 600, fontSize: 14, color: isDarkMode ? '#f3f4f6' : '#111827', margin: 0 }}>Maintenance Mode</p>
                        <p style={{ fontSize: 12, color: isDarkMode ? '#9ca3af' : '#6b7280', margin: '2px 0 0' }}>Temporarily pause student portal access for system upgrades</p>
                    </div>
                    <button
                        onClick={() => handlePlatformToggle('maintenanceMode')}
                        style={{
                            width: 48,
                            height: 26,
                            borderRadius: 99,
                            background: platformSettings.maintenanceMode ? '#dc2626' : '#d1d5db',
                            border: 'none',
                            cursor: 'pointer',
                            position: 'relative',
                            transition: 'background 0.2s',
                        }}
                    >
                        <div style={{
                            width: 20,
                            height: 20,
                            borderRadius: '50%',
                            background: 'white',
                            position: 'absolute',
                            top: 3,
                            left: platformSettings.maintenanceMode ? 25 : 3,
                            transition: 'left 0.2s',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                        }} />
                    </button>
                </div>
            </div>

            {/* Admin Alerts */}
            <div style={{ background: isDarkMode ? '#1f2937' : 'white', borderRadius: 16, border: isDarkMode ? '1px solid #374151' : '1px solid #f0f0f0', padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: 16 }}>
                <h3 style={{ fontWeight: 800, fontSize: 16, color: isDarkMode ? '#f9fafb' : '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Bell size={18} color="#2563eb" />
                    Admin Alerts & Notifications
                </h3>

                {Object.entries({
                    systemAlerts: 'System Error Alerts',
                    userRegistrationAlerts: 'New User Registration Alerts',
                    weeklyReportEmail: 'Weekly Performance Report Digest',
                }).map(([key, label], idx) => (
                    <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: idx === 0 ? 8 : 10, borderTop: isDarkMode ? '1px solid #374151' : '1px solid #f3f4f6' }}>
                        <p style={{ fontWeight: 600, fontSize: 14, color: isDarkMode ? '#f3f4f6' : '#111827', margin: 0 }}>{label}</p>
                        <button
                            onClick={() => handleNotificationToggle(key)}
                            style={{
                                width: 48,
                                height: 26,
                                borderRadius: 99,
                                background: (notifications as any)[key] ? '#2563eb' : '#d1d5db',
                                border: 'none',
                                cursor: 'pointer',
                                position: 'relative',
                                transition: 'background 0.2s',
                            }}
                        >
                            <div style={{
                                width: 20,
                                height: 20,
                                borderRadius: '50%',
                                background: 'white',
                                position: 'absolute',
                                top: 3,
                                left: (notifications as any)[key] ? 25 : 3,
                                transition: 'left 0.2s',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                            }} />
                        </button>
                    </div>
                ))}
            </div>

            {/* Security & Audit */}
            <div style={{ background: isDarkMode ? '#1f2937' : 'white', borderRadius: 16, border: isDarkMode ? '1px solid #374151' : '1px solid #f0f0f0', padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: 14 }}>
                <h3 style={{ fontWeight: 800, fontSize: 16, color: isDarkMode ? '#f9fafb' : '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Shield size={18} color="#16a34a" />
                    Security & Admin Actions
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 6 }}>
                    <button
                        onClick={handleExportSystemLogs}
                        disabled={loading}
                        style={{
                            padding: '12px 16px',
                            borderRadius: 10,
                            border: isDarkMode ? '1px solid #374151' : '1.5px solid #e5e7eb',
                            background: isDarkMode ? '#374151' : '#f9fafb',
                            color: isDarkMode ? '#f9fafb' : '#374151',
                            fontSize: 13,
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            transition: 'all 0.2s',
                        }}
                    >
                        <Download size={16} /> Export System Audit Logs (.json)
                    </button>

                    <button
                        onClick={handleLogout}
                        disabled={loading}
                        style={{
                            padding: '12px 16px',
                            borderRadius: 10,
                            border: '1.5px solid #fee2e2',
                            background: '#fff5f5',
                            color: '#dc2626',
                            fontSize: 13,
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            transition: 'all 0.2s',
                        }}
                    >
                        <LogOut size={16} /> Sign Out of Admin Account ({user?.email})
                    </button>
                </div>
            </div>
        </div>
    );
};
