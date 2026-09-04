import { useState, useEffect } from 'react';
import { Bell, CheckCheck, Trash2, Filter, FileText, Video, ClipboardCheck, MessageSquare, Award } from 'lucide-react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { useAuth } from '@/hooks/useAuth';
import { notificationService } from '@/services/notificationService';
import type { Notification } from '@/types';
import { formatDate } from '@/utils/formatters';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export const StudentNotifications = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | Notification['type']>('all');

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  useEffect(() => {
    filterNotifications();
  }, [notifications, filter]);

  const fetchNotifications = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const data = await notificationService.getAll(user.id);
      setNotifications(data);
    } catch (error) {
      toast.error('Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  const filterNotifications = () => {
    let filtered = notifications;

    if (filter === 'unread') {
      filtered = notifications.filter((n) => !n.is_read);
    } else if (filter !== 'all') {
      filtered = notifications.filter((n) => n.type === filter);
    }

    setFilteredNotifications(filtered);
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (error) {
      toast.error('Failed to mark as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user) return;

    try {
      await notificationService.markAllAsRead(user.id);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all as read');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await notificationService.delete(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      toast.success('Notification deleted');
    } catch (error) {
      toast.error('Failed to delete notification');
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    handleMarkAsRead(notification.id);
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'material':
        return { icon: FileText, color: 'text-blue-500 bg-blue-100 dark:bg-blue-950' };
      case 'video':
        return { icon: Video, color: 'text-orange-500 bg-orange-100 dark:bg-orange-950' };
      case 'test':
        return { icon: ClipboardCheck, color: 'text-green-500 bg-green-100 dark:bg-green-950' };
      case 'quiz':
        return { icon: Award, color: 'text-purple-500 bg-purple-100 dark:bg-purple-950' };
      case 'announcement':
        return { icon: MessageSquare, color: 'text-red-500 bg-red-100 dark:bg-red-950' };
      default:
        return { icon: Bell, color: 'text-gray-500 bg-gray-100 dark:bg-gray-800' };
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-gray-600 dark:text-gray-400">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="primary"
            size="sm"
            icon={<CheckCheck className="w-4 h-4" />}
            onClick={handleMarkAllAsRead}
          >
            Mark All as Read
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <div className="flex items-center gap-2 overflow-x-auto">
          <Filter className="w-5 h-5 text-gray-500 flex-shrink-0" />
          <div className="flex gap-2">
            {[
              { value: 'all', label: 'All' },
              { value: 'unread', label: 'Unread' },
              { value: 'material', label: 'Materials' },
              { value: 'video', label: 'Videos' },
              { value: 'test', label: 'Tests' },
              { value: 'quiz', label: 'Quiz' },
              { value: 'announcement', label: 'Announcements' },
            ].map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  filter === f.value
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 dark:bg-dark text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-lighter'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Notifications List */}
      {loading ? (
        <Card>
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-gray-500 mt-4">Loading notifications...</p>
          </div>
        </Card>
      ) : filteredNotifications.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No notifications found</p>
            <p className="text-sm text-gray-400 mt-2">
              {filter === 'unread' 
                ? 'All notifications have been read'
                : filter !== 'all'
                ? `No ${filter} notifications`
                : 'You don\'t have any notifications yet'}
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notification) => {
            const { icon: Icon, color } = getNotificationIcon(notification.type);
            
            return (
              <Card
                key={notification.id}
                hoverable
                className={!notification.is_read ? 'ring-2 ring-blue-500' : ''}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${color}`}>
                    <Icon className="w-6 h-6" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div
                        className="flex-1 cursor-pointer"
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className={`font-semibold ${!notification.is_read ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                            {notification.title}
                          </h3>
                          {!notification.is_read && (
                            <span className="w-2 h-2 bg-primary rounded-full"></span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 capitalize">
                            {notification.type}
                          </span>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-500">
                            {formatDate(notification.created_at)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {!notification.is_read && (
                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-dark rounded-lg transition-colors"
                            title="Mark as read"
                          >
                            <CheckCheck className="w-4 h-4 text-green-500" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(notification.id)}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-dark rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
