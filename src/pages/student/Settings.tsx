import { useState, useEffect } from 'react';
import { Bell, Moon, Sun, Globe, Trash2, Download, Shield, LogOut } from 'lucide-react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { authService } from '@/services/authService';
import { supabase } from '@/supabase/client';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export const StudentSettings = () => {
  const { user } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    testReminders: true,
    newMaterialAlerts: true,
    quizUpdates: true,
    announcements: true,
  });

  const [preferences, setPreferences] = useState({
    language: 'en',
    autoPlayVideos: true,
    downloadQuality: 'high',
  });

  useEffect(() => {
    loadSettings();
  }, [user]);

  const loadSettings = async () => {
    // Load user settings from localStorage or database
    const savedNotifications = localStorage.getItem('notifications');
    const savedPreferences = localStorage.getItem('preferences');

    if (savedNotifications) {
      setNotifications(JSON.parse(savedNotifications));
    }

    if (savedPreferences) {
      setPreferences(JSON.parse(savedPreferences));
    }
  };

  const handleNotificationChange = (key: string, value: boolean) => {
    const updated = { ...notifications, [key]: value };
    setNotifications(updated);
    localStorage.setItem('notifications', JSON.stringify(updated));
    toast.success('Notification settings updated');
  };

  const handlePreferenceChange = (key: string, value: any) => {
    const updated = { ...preferences, [key]: value };
    setPreferences(updated);
    localStorage.setItem('preferences', JSON.stringify(updated));
    toast.success('Preferences updated');
  };

  const handleDownloadData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Fetch all user data
      const [profile, testResults, quizResults, downloads, bookmarks] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('test_results').select('*').eq('user_id', user.id),
        supabase.from('quiz_results').select('*').eq('user_id', user.id),
        supabase.from('downloads').select('*').eq('user_id', user.id),
        supabase.from('bookmarks').select('*').eq('user_id', user.id),
      ]);

      const userData = {
        profile: profile.data,
        testResults: testResults.data,
        quizResults: quizResults.data,
        downloads: downloads.data,
        bookmarks: bookmarks.data,
        exportDate: new Date().toISOString(),
      };

      // Create and download JSON file
      const blob = new Blob([JSON.stringify(userData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dakshiksha-data-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Data downloaded successfully');
    } catch (error) {
      toast.error('Failed to download data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Delete user data from database
      await Promise.all([
        supabase.from('test_results').delete().eq('user_id', user.id),
        supabase.from('quiz_results').delete().eq('user_id', user.id),
        supabase.from('downloads').delete().eq('user_id', user.id),
        supabase.from('bookmarks').delete().eq('user_id', user.id),
        supabase.from('video_progress').delete().eq('user_id', user.id),
        supabase.from('notifications').delete().eq('user_id', user.id),
        supabase.from('activity_logs').delete().eq('user_id', user.id),
        supabase.from('profiles').delete().eq('id', user.id),
      ]);

      await authService.signOut();
      toast.success('Account deleted successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Failed to delete account');
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
    }
  };

  const handleLogout = async () => {
    try {
      setLoading(true);
      await authService.signOut();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Failed to logout');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage your account settings and preferences</p>
      </div>

      {/* Appearance */}
      <Card>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          {isDarkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          Appearance
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Dark Mode</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Toggle between light and dark theme
              </p>
            </div>
            <button
              onClick={toggleTheme}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                isDarkMode ? 'bg-primary' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                  isDarkMode ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </Card>

      {/* Notifications */}
      <Card>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Notifications
        </h3>
        <div className="space-y-4">
          {Object.entries({
            emailNotifications: 'Email Notifications',
            testReminders: 'Test Reminders',
            newMaterialAlerts: 'New Material Alerts',
            quizUpdates: 'Quiz Updates',
            announcements: 'Announcements',
          }).map(([key, label]) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <p className="font-medium">{label}</p>
              </div>
              <button
                onClick={() =>
                  handleNotificationChange(key, !(notifications as any)[key])
                }
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                  (notifications as any)[key] ? 'bg-primary' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                    (notifications as any)[key] ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </Card>

      {/* Preferences */}
      <Card>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Globe className="w-5 h-5" />
          Preferences
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block font-medium mb-2">Language</label>
            <select
              value={preferences.language}
              onChange={(e) => handlePreferenceChange('language', e.target.value)}
              className="input-field w-full md:w-64"
            >
              <option value="en">English</option>
              <option value="hi">हिन्दी (Hindi)</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Auto-play Videos</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Automatically play next video
              </p>
            </div>
            <button
              onClick={() =>
                handlePreferenceChange('autoPlayVideos', !preferences.autoPlayVideos)
              }
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                preferences.autoPlayVideos ? 'bg-primary' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                  preferences.autoPlayVideos ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div>
            <label className="block font-medium mb-2">Download Quality</label>
            <select
              value={preferences.downloadQuality}
              onChange={(e) => handlePreferenceChange('downloadQuality', e.target.value)}
              className="input-field w-full md:w-64"
            >
              <option value="low">Low (Faster)</option>
              <option value="medium">Medium</option>
              <option value="high">High (Best Quality)</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Privacy & Security */}
      <Card>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Privacy & Security
        </h3>
        <div className="space-y-3">
          <Button
            variant="outline"
            icon={<Download className="w-4 h-4" />}
            onClick={handleDownloadData}
            isLoading={loading}
            className="w-full justify-start"
          >
            Download Your Data
          </Button>

          <Button
            variant="outline"
            icon={<LogOut className="w-4 h-4" />}
            onClick={() => setShowLogoutModal(true)}
            className="w-full justify-start"
          >
            Logout
          </Button>

          <Button
            variant="outline"
            icon={<Trash2 className="w-4 h-4" />}
            onClick={() => setShowDeleteModal(true)}
            className="w-full justify-start text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
          >
            Delete Account
          </Button>
        </div>
      </Card>

      {/* Delete Account Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Account"
      >
        <div className="space-y-4">
          <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-800 dark:text-red-200 font-medium">Warning!</p>
            <p className="text-red-600 dark:text-red-300 text-sm mt-1">
              This action cannot be undone. All your data including test results, bookmarks,
              and progress will be permanently deleted.
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleDeleteAccount}
              isLoading={loading}
              className="flex-1 bg-red-500 hover:bg-red-600"
            >
              Delete Account
            </Button>
          </div>
        </div>
      </Modal>

      {/* Logout Modal */}
      <Modal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        title="Logout"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Are you sure you want to logout?
          </p>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowLogoutModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleLogout}
              isLoading={loading}
              className="flex-1"
            >
              Logout
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
