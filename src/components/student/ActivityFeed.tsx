import { useState, useEffect } from 'react';
import { 
  FileText, 
  Video, 
  ClipboardCheck, 
  Award, 
  Download, 
  BookmarkPlus,
  TrendingUp,
  Clock
} from 'lucide-react';
import { Card } from '@/components/common/Card';
import { supabase } from '@/supabase/client';
import { formatDate } from '@/utils/formatters';

interface Activity {
  id: string;
  user_id: string;
  user_name: string;
  activity_type: string;
  activity_description: string;
  metadata: any;
  created_at: string;
}

export const ActivityFeed = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchActivities, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchActivities = async () => {
    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .select(`
          *,
          profiles (full_name)
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      const formattedActivities = (data || []).map((item: any) => ({
        id: item.id,
        user_id: item.user_id,
        user_name: item.profiles?.full_name || 'Someone',
        activity_type: item.activity_type,
        activity_description: item.activity_description,
        metadata: item.metadata,
        created_at: item.created_at,
      }));

      setActivities(formattedActivities);
    } catch (error) {
      console.error('Failed to fetch activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'test_completed':
        return { icon: ClipboardCheck, color: 'text-green-500 bg-green-100 dark:bg-green-950' };
      case 'quiz_completed':
        return { icon: Award, color: 'text-purple-500 bg-purple-100 dark:bg-purple-950' };
      case 'video_watched':
        return { icon: Video, color: 'text-orange-500 bg-orange-100 dark:bg-orange-950' };
      case 'material_downloaded':
        return { icon: Download, color: 'text-blue-500 bg-blue-100 dark:bg-blue-950' };
      case 'bookmark_added':
        return { icon: BookmarkPlus, color: 'text-pink-500 bg-pink-100 dark:bg-pink-950' };
      case 'achievement_unlocked':
        return { icon: TrendingUp, color: 'text-yellow-500 bg-yellow-100 dark:bg-yellow-950' };
      default:
        return { icon: FileText, color: 'text-gray-500 bg-gray-100 dark:bg-gray-800' };
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return formatDate(dateString);
  };

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          Recent Activity
        </h3>
        <Clock className="w-4 h-4 text-gray-400" />
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-gray-500 mt-2">Loading activities...</p>
        </div>
      ) : activities.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No recent activity</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {activities.map((activity) => {
            const { icon: Icon, color } = getActivityIcon(activity.activity_type);

            return (
              <div
                key={activity.id}
                className="flex items-start gap-3 p-3 hover:bg-gray-50 dark:hover:bg-dark rounded-lg transition-colors"
              >
                <div className={`p-2 rounded-lg ${color} flex-shrink-0`}>
                  <Icon className="w-4 h-4" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <span className="font-medium">{activity.user_name}</span>
                    {' '}
                    <span className="text-gray-600 dark:text-gray-400">
                      {activity.activity_description}
                    </span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {getTimeAgo(activity.created_at)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};
