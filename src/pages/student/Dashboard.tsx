import { useEffect, useState } from 'react';
import {
  BookOpen,
  Video,
  ClipboardCheck,
  Download,
  Award,
  TrendingUp,
  TrendingDown,
  Target,
  Clock,
  BarChart3,
  Zap
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/supabase/client';
import { analyticsService } from '@/services/analyticsService';
import { ActivityFeed } from '@/components/student/ActivityFeed';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const StatCard = ({ title, value, icon: Icon, gradient }: {
  title: string;
  value: string | number;
  icon: any;
  gradient: string;
}) => (
  <div
    style={{
      background: 'white',
      borderRadius: 16,
      padding: '18px 20px',
      border: '1px solid #f0f0f0',
      boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      transition: 'box-shadow 0.2s, transform 0.2s',
    }}
    onMouseEnter={e => {
      (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)';
      (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
    }}
    onMouseLeave={e => {
      (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
      (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
    }}
  >
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <Icon size={24} style={{ color: gradient }} />
    </div>
    <div style={{ minWidth: 0 }}>
      <p style={{ fontSize: 22, fontWeight: 800, color: '#111827', margin: 0, lineHeight: 1 }}>{value}</p>
      <p style={{ fontSize: 11, color: '#9ca3af', margin: '4px 0 0', fontWeight: 500 }}>{title}</p>
    </div>
  </div>
);

export const StudentDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    completedTests: 0,
    completedQuiz: 0,
    downloadedPdfs: 0,
    watchedVideos: 0,
    bookmarks: 0,
  });
  const [analytics, setAnalytics] = useState<any>(null);
  const [comparison, setComparison] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchAllData();
  }, [user]);

  const fetchAllData = async () => {
    if (!user) return;
    try {
      setLoading(true);
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
      const analyticsData = await analyticsService.getStudentAnalytics(user.id);
      setAnalytics(analyticsData);
      const comparisonData = await analyticsService.getComparisonWithAverage(user.id);
      setComparison(comparisonData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title: 'Tests Completed', value: stats.completedTests, icon: ClipboardCheck, gradient: '#3b82f6', light: '#eff6ff' },
    { title: 'Quiz Attempts', value: stats.completedQuiz, icon: Award, gradient: '#10b981', light: '#ecfdf5' },
    { title: 'Downloaded PDFs', value: stats.downloadedPdfs, icon: Download, gradient: '#8b5cf6', light: '#f5f3ff' },
    { title: 'Videos Watched', value: stats.watchedVideos, icon: Video, gradient: '#f59e0b', light: '#fffbeb' },
    { title: 'Bookmarks', value: stats.bookmarks, icon: BookOpen, gradient: '#ec4899', light: '#fdf2f8' },
    { title: 'Overall Score', value: analytics ? `${analytics.performance.overall}%` : '0%', icon: Target, gradient: '#C8102E', light: '#fff1f2' },
  ];

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400 }}>
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: 48,
              height: 48,
              border: '3px solid #f3f4f6',
              borderTopColor: '#C8102E',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
              margin: '0 auto',
            }}
          />
          <p style={{ marginTop: 16, color: '#9ca3af', fontSize: 14 }}>Loading your dashboard...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* ── Welcome Banner ── */}
      <div
        style={{
          borderRadius: 20,
          padding: '28px 32px',
          background: 'linear-gradient(135deg, #1a1a2e 0%, #C8102E 100%)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* background decoration */}
        <div style={{ position: 'absolute', top: -30, right: -30, width: 180, height: 180, background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: -40, right: 80, width: 120, height: 120, background: 'rgba(255,255,255,0.07)', borderRadius: '50%' }} />

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13, margin: '0 0 4px', fontWeight: 500 }}>
              {getGreeting()}
            </p>
            <h1 style={{ color: 'white', fontSize: 26, fontWeight: 900, margin: '0 0 6px', lineHeight: 1.2 }}>
              {user?.full_name || 'Student'}!
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13, margin: 0 }}>
              Here's your learning progress and insights
            </p>
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 12, padding: '10px 18px', textAlign: 'center' }}>
              <p style={{ color: 'white', fontWeight: 800, fontSize: 20, margin: 0 }}>{stats.completedTests + stats.completedQuiz}</p>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, margin: '2px 0 0' }}>Tests Done</p>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 12, padding: '10px 18px', textAlign: 'center' }}>
              <p style={{ color: 'white', fontWeight: 800, fontSize: 20, margin: 0 }}>
                {analytics ? `${analytics.performance.overall}%` : '0%'}
              </p>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, margin: '2px 0 0' }}>Avg Score</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 14 }}>
        {statCards.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </div>

      {/* ── Analytics section ── */}
      {analytics && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>

            {/* Study Time */}
            <div style={{ background: 'white', borderRadius: 16, padding: 20, border: '1px solid #f0f0f0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <p style={{ fontWeight: 700, fontSize: 14, color: '#111827', margin: 0 }}>Study Time</p>
                <Clock size={18} color="#C8102E" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { label: 'This Week', value: analytics.studyTime.thisWeek, color: '#C8102E', max: 300 },
                  { label: 'This Month', value: analytics.studyTime.thisMonth, color: '#10b981', max: 1200 },
                ].map(({ label, value, color, max }) => (
                  <div key={label}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 5 }}>
                      <span style={{ color: '#6b7280' }}>{label}</span>
                      <span style={{ fontWeight: 700, color: '#111827' }}>{value} min</span>
                    </div>
                    <div style={{ height: 6, background: '#f3f4f6', borderRadius: 99, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${Math.min(100, (value / max) * 100)}%`, background: color, borderRadius: 99, transition: 'width 1s ease' }} />
                    </div>
                  </div>
                ))}
                <div style={{ paddingTop: 12, borderTop: '1px solid #f3f4f6' }}>
                  <p style={{ fontSize: 11, color: '#9ca3af', margin: '0 0 4px' }}>Total Study Time</p>
                  <p style={{ fontSize: 24, fontWeight: 900, color: '#C8102E', margin: 0 }}>
                    {Math.floor(analytics.studyTime.total / 60)}h {analytics.studyTime.total % 60}m
                  </p>
                </div>
              </div>
            </div>

            {/* Performance */}
            {comparison && (
              <div style={{ background: 'white', borderRadius: 16, padding: 20, border: '1px solid #f0f0f0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <p style={{ fontWeight: 700, fontSize: 14, color: '#111827', margin: 0 }}>Your Performance</p>
                  <BarChart3 size={18} color="#C8102E" />
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: 11, color: '#9ca3af', margin: '0 0 4px' }}>Your Average</p>
                  <p style={{ fontSize: 48, fontWeight: 900, color: '#C8102E', lineHeight: 1, margin: '0 0 12px' }}>{comparison.userAverage}%</p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 12 }}>
                    {comparison.difference >= 0
                      ? <TrendingUp size={16} color="#10b981" />
                      : <TrendingDown size={16} color="#ef4444" />}
                    <span style={{ fontWeight: 700, fontSize: 13, color: comparison.difference >= 0 ? '#10b981' : '#ef4444' }}>
                      {Math.abs(comparison.difference)}%
                    </span>
                    <span style={{ fontSize: 11, color: '#9ca3af' }}>vs platform avg</span>
                  </div>
                  <div style={{ paddingTop: 12, borderTop: '1px solid #f3f4f6' }}>
                    <p style={{ fontSize: 11, color: '#9ca3af', margin: '0 0 4px' }}>You're in the</p>
                    <p style={{ fontSize: 20, fontWeight: 800, color: '#111827', margin: 0 }}>{comparison.percentile}th percentile</p>
                  </div>
                </div>
              </div>
            )}

            {/* Progress Trend */}
            <div style={{ background: 'white', borderRadius: 16, padding: 20, border: '1px solid #f0f0f0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <p style={{ fontWeight: 700, fontSize: 14, color: '#111827', margin: 0 }}>Progress Trend</p>
                {analytics.trends.improving ? <TrendingUp size={18} color="#10b981" /> : <TrendingDown size={18} color="#ef4444" />}
              </div>
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: 10,
                  marginBottom: 12,
                  background: analytics.trends.improving ? '#ecfdf5' : '#fff7ed',
                }}
              >
                <p style={{ fontSize: 13, fontWeight: 600, color: analytics.trends.improving ? '#065f46' : '#92400e', margin: '0 0 2px' }}>
                  {analytics.trends.improving ? 'You\'re improving!' : 'Keep practicing!'}
                </p>
                <p style={{ fontSize: 11, color: '#6b7280', margin: 0 }}>
                  {analytics.trends.weeklyProgress >= 0 ? '+' : ''}{analytics.trends.weeklyProgress}% this week
                </p>
              </div>
              {analytics.trends.recentScores.length > 0 && (
                <div style={{ height: 80 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analytics.trends.recentScores.map((score: number, i: number) => ({ name: i + 1, score }))}>
                      <Line type="monotone" dataKey="score" stroke="#C8102E" strokeWidth={2.5} dot={{ fill: '#C8102E', r: 3 }} />
                      <YAxis hide domain={[0, 100]} />
                      <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>

          {/* Weekly Pattern */}
          <div style={{ background: 'white', borderRadius: 16, padding: 20, border: '1px solid #f0f0f0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Zap size={18} color="#C8102E" />
              <p style={{ fontWeight: 700, fontSize: 14, color: '#111827', margin: 0 }}>Weekly Study Pattern</p>
            </div>
            <div style={{ height: 180 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.studyTime.byDay} barSize={28}>
                  <XAxis dataKey="date" tickFormatter={(d) => new Date(d).toLocaleDateString('en', { weekday: 'short' })} style={{ fontSize: 11 }} />
                  <YAxis style={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: any) => [`${v} min`, 'Study Time']} labelFormatter={(l: any) => new Date(String(l)).toLocaleDateString()} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="minutes" fill="#C8102E" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Strengths + Weaknesses */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
            {[
              { label: 'Your Strengths', data: analytics.strengths, color: '#10b981', light: '#ecfdf5', emptyMsg: 'Take more tests to identify your strengths' },
              { label: 'Areas to Improve', data: analytics.weaknesses, color: '#f59e0b', light: '#fffbeb', emptyMsg: 'Great job! No weak areas identified yet' },
            ].map(({ label, data, color, emptyMsg }) => (
              <div key={label} style={{ background: 'white', borderRadius: 16, padding: 20, border: '1px solid #f0f0f0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <p style={{ fontWeight: 700, fontSize: 14, color: '#111827', marginBottom: 14, margin: '0 0 14px' }}>{label}</p>
                {data.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {data.map((item: any, i: number) => (
                      <div key={i}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 12 }}>
                          <span style={{ fontWeight: 600, color: '#374151' }}>{item.category}</span>
                          <span style={{ fontWeight: 700, color }}>{item.score}%</span>
                        </div>
                        <div style={{ height: 6, background: '#f3f4f6', borderRadius: 99, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${item.score}%`, background: color, borderRadius: 99 }} />
                        </div>
                        <p style={{ fontSize: 10, color: '#9ca3af', margin: '3px 0 0' }}>{item.count} attempts</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: 13, color: '#9ca3af', textAlign: 'center', padding: '20px 0' }}>{emptyMsg}</p>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Activity Feed */}
      <ActivityFeed />
    </div>
  );
};
