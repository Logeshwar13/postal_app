import { useEffect, useState } from 'react';
import { BookOpen, Video, ClipboardCheck, Download, Award, TrendingUp } from 'lucide-react';
import { Card } from '@/components/common/Card';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/supabase/client';

export const StudentDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    completedTests: 0,
    completedQuiz: 0,
    downloadedPdfs: 0,
    watchedVideos: 0,
    bookmarks: 0,
  });

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    if (!user) return;

    try {
      const [tests, quiz, downloads, videos, bookmarks] = await Promise.all([
        supabase.from('test_results').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('quiz_results').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('downloads').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('video_progress').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('completed', true),
        supabase.from('bookmarks').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
      ]);

      setStats({
        completedTests: tests.count || 0,
        completedQuiz: quiz.count || 0,
        downloadedPdfs: downloads.count || 0,
        watchedVideos: videos.count || 0,
        bookmarks: bookmarks.count || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const statCards = [
    { title: 'Tests Completed', value: stats.completedTests, icon: ClipboardCheck, color: 'bg-blue-500' },
    { title: 'Quiz Attempts', value: stats.completedQuiz, icon: Award, color: 'bg-green-500' },
    { title: 'Downloaded PDFs', value: stats.downloadedPdfs, icon: Download, color: 'bg-purple-500' },
    { title: 'Videos Watched', value: stats.watchedVideos, icon: Video, color: 'bg-orange-500' },
    { title: 'Bookmarks', value: stats.bookmarks, icon: BookOpen, color: 'bg-pink-500' },
    { title: 'Progress', value: '75%', icon: TrendingUp, color: 'bg-primary' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Welcome back, {user?.full_name || 'Student'}!</h1>
        <p className="text-gray-600 dark:text-gray-400">Continue your learning journey</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => (
          <Card key={index} hoverable>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{stat.title}</p>
                <p className="text-3xl font-bold mt-2">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-4 rounded-lg`}>
                <stat.icon className="w-8 h-8 text-white" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-dark rounded-lg">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Completed Quiz on Mathematics</p>
                  <p className="text-sm text-gray-500">2 hours ago</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold mb-4">Your Progress</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm">Mathematics</span>
                <span className="text-sm font-medium">80%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-dark-lighter rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: '80%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm">Reasoning</span>
                <span className="text-sm font-medium">65%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-dark-lighter rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '65%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm">General Knowledge</span>
                <span className="text-sm font-medium">90%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-dark-lighter rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '90%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm">Current Affairs</span>
                <span className="text-sm font-medium">55%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-dark-lighter rounded-full h-2">
                <div className="bg-orange-500 h-2 rounded-full" style={{ width: '55%' }}></div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="text-lg font-semibold mb-4">Continue Watching</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((item) => (
            <div key={item} className="bg-gray-50 dark:bg-dark rounded-lg p-4">
              <div className="aspect-video bg-gray-300 dark:bg-dark-lighter rounded-lg mb-3"></div>
              <h4 className="font-medium mb-1">Postal Rules & Regulations</h4>
              <p className="text-sm text-gray-500 mb-2">45 min • 60% complete</p>
              <div className="w-full bg-gray-200 dark:bg-dark-lighter rounded-full h-1">
                <div className="bg-primary h-1 rounded-full" style={{ width: '60%' }}></div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
