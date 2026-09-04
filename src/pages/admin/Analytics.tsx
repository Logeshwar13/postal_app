import { useState, useEffect } from 'react';
import { TrendingUp, Users, FileText, Video, ClipboardList, Download, Eye, Award, Calendar } from 'lucide-react';
import { supabase } from '@/supabase/client';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '@/hooks/useTheme';

type TimePeriod = 'weekly' | '3months' | '12months';

export const AdminAnalytics = () => {
  const { isDarkMode } = useTheme();
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('weekly');

  const [stats, setStats] = useState({
    totalUsers: 0,
    usersGrowth: '+0%',
    totalMaterials: 0,
    materialsGrowth: '+0%',
    totalVideos: 0,
    videosGrowth: '+0%',
    totalTests: 0,
    testsGrowth: '+0%',
    totalDownloads: 0,
    downloadsGrowth: '+0%',
    totalViews: 0,
    viewsGrowth: '+0%',
    totalTestAttempts: 0,
    testAttemptsGrowth: '+0%',
    totalQuizAttempts: 0,
    quizAttemptsGrowth: '+0%',
  });

  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [testPerformance, setTestPerformance] = useState<any[]>([]);

  useEffect(() => {
    fetchAllAnalytics();
  }, [timePeriod]);

  const calculateGrowth = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? '+100%' : '0%';
    const pct = Math.round(((current - previous) / previous) * 100);
    return pct >= 0 ? `+${pct}%` : `${pct}%`;
  };

  const fetchAllAnalytics = async () => {
    try {
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString();

      // 1. Fetch total counts and growth metrics
      const [
        usersRes,
        materialsRes,
        videosRes,
        testsRes,
        downloadsRes,
        testResultsRes,
        quizResultsRes,
        videoViewsRes,

        // Prior week for growth trends
        prevUsersRes, currUsersRes,
        prevDownloadsRes, currDownloadsRes,
        prevTestResultsRes, currTestResultsRes,
        prevQuizResultsRes, currQuizResultsRes,
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('study_materials').select('*', { count: 'exact', head: true }),
        supabase.from('videos').select('*', { count: 'exact', head: true }),
        supabase.from('tests').select('*', { count: 'exact', head: true }),
        supabase.from('downloads').select('*', { count: 'exact', head: true }),
        supabase.from('test_results').select('*', { count: 'exact', head: true }),
        supabase.from('quiz_results').select('*', { count: 'exact', head: true }),
        supabase.from('videos').select('views_count'),

        // Growth metrics comparisons
        supabase.from('profiles').select('created_at').gte('created_at', fourteenDaysAgo).lt('created_at', sevenDaysAgo),
        supabase.from('profiles').select('created_at').gte('created_at', sevenDaysAgo),

        supabase.from('downloads').select('created_at').gte('created_at', fourteenDaysAgo).lt('created_at', sevenDaysAgo),
        supabase.from('downloads').select('created_at').gte('created_at', sevenDaysAgo),

        supabase.from('test_results').select('created_at').gte('created_at', fourteenDaysAgo).lt('created_at', sevenDaysAgo),
        supabase.from('test_results').select('created_at').gte('created_at', sevenDaysAgo),

        supabase.from('quiz_results').select('created_at').gte('created_at', fourteenDaysAgo).lt('created_at', sevenDaysAgo),
        supabase.from('quiz_results').select('created_at').gte('created_at', sevenDaysAgo),
      ]);

      const totalViews = videoViewsRes.data?.reduce((sum: number, v: any) => sum + (Number(v.views_count) || 0), 0) || 0;

      setStats({
        totalUsers: usersRes.count || 0,
        usersGrowth: calculateGrowth(currUsersRes.data?.length || 0, prevUsersRes.data?.length || 0),
        totalMaterials: materialsRes.count || 0,
        materialsGrowth: calculateGrowth(materialsRes.count || 0, 0),
        totalVideos: videosRes.count || 0,
        videosGrowth: calculateGrowth(videosRes.count || 0, 0),
        totalTests: testsRes.count || 0,
        testsGrowth: calculateGrowth(testsRes.count || 0, 0),
        totalDownloads: downloadsRes.count || 0,
        downloadsGrowth: calculateGrowth(currDownloadsRes.data?.length || 0, prevDownloadsRes.data?.length || 0),
        totalViews,
        viewsGrowth: calculateGrowth(totalViews, 0),
        totalTestAttempts: testResultsRes.count || 0,
        testAttemptsGrowth: calculateGrowth(currTestResultsRes.data?.length || 0, prevTestResultsRes.data?.length || 0),
        totalQuizAttempts: quizResultsRes.count || 0,
        quizAttemptsGrowth: calculateGrowth(currQuizResultsRes.data?.length || 0, prevQuizResultsRes.data?.length || 0),
      });

      // 2. Fetch Time Series Activity Data
      await fetchTimeSeriesData(timePeriod);

      // 3. Fetch Category Content Distribution
      await fetchCategoryDistribution();

      // 4. Fetch Real Test Performance
      await fetchRealTestPerformance();
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const fetchTimeSeriesData = async (period: TimePeriod) => {
    const now = new Date();
    let dataPoints: any[] = [];

    if (period === 'weekly') {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dayName = days[d.getDay()];
        const dayStart = new Date(d.setHours(0, 0, 0, 0)).toISOString();
        const dayEnd = new Date(d.setHours(23, 59, 59, 999)).toISOString();

        const [usersRes, testsRes, downloadsRes] = await Promise.all([
          supabase.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', dayStart).lte('created_at', dayEnd),
          supabase.from('test_results').select('id', { count: 'exact', head: true }).gte('created_at', dayStart).lte('created_at', dayEnd),
          supabase.from('downloads').select('id', { count: 'exact', head: true }).gte('created_at', dayStart).lte('created_at', dayEnd),
        ]);

        dataPoints.push({
          name: dayName,
          users: usersRes.count || 0,
          tests: testsRes.count || 0,
          downloads: downloadsRes.count || 0,
        });
      }
    } else if (period === '3months') {
      for (let i = 11; i >= 0; i--) {
        const wStart = new Date(now.getTime() - (i + 1) * 7 * 24 * 60 * 60 * 1000).toISOString();
        const wEnd = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000).toISOString();

        const [usersRes, testsRes, downloadsRes] = await Promise.all([
          supabase.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', wStart).lt('created_at', wEnd),
          supabase.from('test_results').select('id', { count: 'exact', head: true }).gte('created_at', wStart).lt('created_at', wEnd),
          supabase.from('downloads').select('id', { count: 'exact', head: true }).gte('created_at', wStart).lt('created_at', wEnd),
        ]);

        dataPoints.push({
          name: `Wk ${12 - i}`,
          users: usersRes.count || 0,
          tests: testsRes.count || 0,
          downloads: downloadsRes.count || 0,
        });
      }
    } else if (period === '12months') {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthName = months[d.getMonth()];
        const mStart = new Date(d.getFullYear(), d.getMonth(), 1).toISOString();
        const mEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59).toISOString();

        const [usersRes, testsRes, downloadsRes] = await Promise.all([
          supabase.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', mStart).lte('created_at', mEnd),
          supabase.from('test_results').select('id', { count: 'exact', head: true }).gte('created_at', mStart).lte('created_at', mEnd),
          supabase.from('downloads').select('id', { count: 'exact', head: true }).gte('created_at', mStart).lte('created_at', mEnd),
        ]);

        dataPoints.push({
          name: monthName,
          users: usersRes.count || 0,
          tests: testsRes.count || 0,
          downloads: downloadsRes.count || 0,
        });
      }
    }

    setWeeklyData(dataPoints);
  };

  const fetchCategoryDistribution = async () => {
    try {
      const [materialsRes, videosRes, testsRes] = await Promise.all([
        supabase.from('study_materials').select('category'),
        supabase.from('videos').select('category'),
        supabase.from('tests').select('title'),
      ]);

      const counts: Record<string, number> = {};
      materialsRes.data?.forEach(m => {
        const cat = m.category || 'General';
        counts[cat] = (counts[cat] || 0) + 1;
      });
      videosRes.data?.forEach(v => {
        const cat = v.category || 'General';
        counts[cat] = (counts[cat] || 0) + 1;
      });
      if (testsRes.data && testsRes.data.length > 0) {
        counts['Mock Tests'] = testsRes.data.length;
      }

      const colors = ['#C8102E', '#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899'];
      const formattedData = Object.entries(counts).map(([name, value], i) => ({
        name,
        value,
        color: colors[i % colors.length],
      }));

      if (formattedData.length === 0) {
        setCategoryData([
          { name: 'Postal Rules', value: 1, color: '#C8102E' },
          { name: 'Exam Notes', value: 1, color: '#f59e0b' },
        ]);
      } else {
        setCategoryData(formattedData);
      }
    } catch {
      /* handle gracefully */
    }
  };

  const fetchRealTestPerformance = async () => {
    try {
      const { data: tests } = await supabase.from('tests').select('id, title').limit(5);
      if (!tests || tests.length === 0) {
        setTestPerformance([]);
        return;
      }

      const performanceList = await Promise.all(
        tests.map(async t => {
          const { data: results } = await supabase.from('test_results').select('score').eq('test_id', t.id);
          const attempts = results?.length || 0;
          const avgScore = attempts > 0 && results ? Math.round(results.reduce((s: number, r: any) => s + (Number(r.score) || 0), 0) / attempts) : 0;
          return {
            test: t.title.length > 12 ? `${t.title.slice(0, 12)}...` : t.title,
            avgScore,
            attempts,
          };
        })
      );

      setTestPerformance(performanceList);
    } catch {
      /* handle gracefully */
    }
  };

  const statCards = [
    { title: 'Total Users', value: stats.totalUsers, icon: Users, color: '#3b82f6', bg: isDarkMode ? '#1e3a8a' : '#eff6ff', trend: stats.usersGrowth },
    { title: 'Study Materials', value: stats.totalMaterials, icon: FileText, color: '#10b981', bg: isDarkMode ? '#064e3b' : '#ecfdf5', trend: stats.materialsGrowth },
    { title: 'Videos', value: stats.totalVideos, icon: Video, color: '#8b5cf6', bg: isDarkMode ? '#4c1d95' : '#f5f3ff', trend: stats.videosGrowth },
    { title: 'Tests Created', value: stats.totalTests, icon: ClipboardList, color: '#f59e0b', bg: isDarkMode ? '#78350f' : '#fffbeb', trend: stats.testsGrowth },
    { title: 'Total Downloads', value: stats.totalDownloads, icon: Download, color: '#ec4899', bg: isDarkMode ? '#831843' : '#fdf2f8', trend: stats.downloadsGrowth },
    { title: 'Video Views', value: stats.totalViews, icon: Eye, color: '#6366f1', bg: isDarkMode ? '#312e81' : '#eef2ff', trend: stats.viewsGrowth },
    { title: 'Test Attempts', value: stats.totalTestAttempts, icon: ClipboardList, color: '#C8102E', bg: isDarkMode ? '#4c0519' : '#fff1f2', trend: stats.testAttemptsGrowth },
    { title: 'Quiz Attempts', value: stats.totalQuizAttempts, icon: Award, color: '#eab308', bg: isDarkMode ? '#713f12' : '#fefce8', trend: stats.quizAttemptsGrowth },
  ];

  // Theme styling helpers
  const cardBg = isDarkMode ? '#1e293b' : 'white';
  const cardBorder = isDarkMode ? '#334155' : '#f0f0f0';
  const textPrimary = isDarkMode ? '#f8fafc' : '#111827';
  const textSecondary = isDarkMode ? '#94a3b8' : '#9ca3af';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Header & Filter Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: textPrimary, margin: 0 }}>Analytics Dashboard</h1>
          <p style={{ color: textSecondary, fontSize: 13, margin: '4px 0 0' }}>Comprehensive real-time platform content & student metrics</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: cardBg, padding: '6px 12px', borderRadius: 12, border: `1px solid ${cardBorder}` }}>
          <Calendar size={16} style={{ color: '#C8102E' }} />
          <div style={{ display: 'flex', background: isDarkMode ? '#0f172a' : '#f3f4f6', borderRadius: 8, padding: 3, gap: 4 }}>
            {([
              { id: 'weekly', label: 'Weekly' },
              { id: '3months', label: 'Last 3 Months' },
              { id: '12months', label: '12 Months' },
            ] as const).map(p => (
              <button
                key={p.id}
                onClick={() => setTimePeriod(p.id)}
                style={{
                  padding: '5px 12px',
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  background: timePeriod === p.id ? '#C8102E' : 'transparent',
                  color: timePeriod === p.id ? 'white' : textSecondary,
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
        {statCards.map((s, i) => (
          <div key={i} style={{ background: cardBg, borderRadius: 16, padding: 18, border: `1px solid ${cardBorder}`, boxShadow: isDarkMode ? '0 2px 8px rgba(0,0,0,0.2)' : '0 2px 8px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color, flexShrink: 0 }}>
              <s.icon size={22} />
            </div>
            <div>
              <p style={{ fontSize: 11, color: textSecondary, margin: '0 0 2px', fontWeight: 600 }}>{s.title}</p>
              <p style={{ fontSize: 22, fontWeight: 900, color: textPrimary, margin: 0, lineHeight: 1 }}>{s.value}</p>
              <p style={{ fontSize: 11, color: s.trend.startsWith('+') ? '#10b981' : (s.trend.startsWith('-') ? '#ef4444' : textSecondary), margin: '2px 0 0', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 2 }}>
                <TrendingUp size={11} />{s.trend}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
        {/* Activity Trend */}
        <div style={{ background: cardBg, borderRadius: 16, padding: 24, border: `1px solid ${cardBorder}`, boxShadow: isDarkMode ? '0 2px 8px rgba(0,0,0,0.2)' : '0 2px 8px rgba(0,0,0,0.05)' }}>
          <p style={{ fontWeight: 800, fontSize: 15, color: textPrimary, margin: '0 0 16px' }}>Activity Trend</p>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#334155' : '#f3f4f6'} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: textSecondary }} />
              <YAxis tick={{ fontSize: 11, fill: textSecondary }} />
              <Tooltip contentStyle={{ background: isDarkMode ? '#0f172a' : '#ffffff', borderRadius: 10, border: `1px solid ${isDarkMode ? '#334155' : '#e5e7eb'}`, color: textPrimary, fontSize: 12 }} />
              <Line type="monotone" dataKey="users" stroke="#C8102E" strokeWidth={2.5} dot={{ r: 3 }} name="Active Users" />
              <Line type="monotone" dataKey="tests" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 3 }} name="Tests Taken" />
              <Line type="monotone" dataKey="downloads" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3 }} name="Downloads" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Content Distribution */}
        <div style={{ background: cardBg, borderRadius: 16, padding: 24, border: `1px solid ${cardBorder}`, boxShadow: isDarkMode ? '0 2px 8px rgba(0,0,0,0.2)' : '0 2px 8px rgba(0,0,0,0.05)' }}>
          <p style={{ fontWeight: 800, fontSize: 15, color: textPrimary, margin: '0 0 16px' }}>Content Interest Distribution</p>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={categoryData} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`} outerRadius={90} fill="#8884d8" dataKey="value">
                {categoryData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: isDarkMode ? '#0f172a' : '#ffffff', borderRadius: 10, border: `1px solid ${isDarkMode ? '#334155' : '#e5e7eb'}`, color: textPrimary, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Test Performance */}
        <div style={{ background: cardBg, borderRadius: 16, padding: 24, border: `1px solid ${cardBorder}`, boxShadow: isDarkMode ? '0 2px 8px rgba(0,0,0,0.2)' : '0 2px 8px rgba(0,0,0,0.05)' }}>
          <p style={{ fontWeight: 800, fontSize: 15, color: textPrimary, margin: '0 0 16px' }}>Test Average Scores (%)</p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={testPerformance}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#334155' : '#f3f4f6'} />
              <XAxis dataKey="test" tick={{ fontSize: 11, fill: textSecondary }} />
              <YAxis tick={{ fontSize: 11, fill: textSecondary }} />
              <Tooltip contentStyle={{ background: isDarkMode ? '#0f172a' : '#ffffff', borderRadius: 10, border: `1px solid ${isDarkMode ? '#334155' : '#e5e7eb'}`, color: textPrimary, fontSize: 12 }} />
              <Bar dataKey="avgScore" fill="#C8102E" radius={[6, 6, 0, 0]} name="Average Score %" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* User Engagement */}
        <div style={{ background: cardBg, borderRadius: 16, padding: 24, border: `1px solid ${cardBorder}`, boxShadow: isDarkMode ? '0 2px 8px rgba(0,0,0,0.2)' : '0 2px 8px rgba(0,0,0,0.05)' }}>
          <p style={{ fontWeight: 800, fontSize: 15, color: textPrimary, margin: '0 0 16px' }}>User Engagement</p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#334155' : '#f3f4f6'} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: textSecondary }} />
              <YAxis tick={{ fontSize: 11, fill: textSecondary }} />
              <Tooltip contentStyle={{ background: isDarkMode ? '#0f172a' : '#ffffff', borderRadius: 10, border: `1px solid ${isDarkMode ? '#334155' : '#e5e7eb'}`, color: textPrimary, fontSize: 12 }} />
              <Bar dataKey="users" fill="#3b82f6" radius={[6, 6, 0, 0]} name="Users" />
              <Bar dataKey="tests" fill="#f59e0b" radius={[6, 6, 0, 0]} name="Tests" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        <div style={{ background: isDarkMode ? '#1e3a8a' : '#eff6ff', borderRadius: 16, padding: 20 }}>
          <p style={{ fontWeight: 700, fontSize: 14, color: isDarkMode ? '#93c5fd' : '#1e40af', margin: '0 0 4px' }}>User Growth</p>
          <p style={{ fontSize: 28, fontWeight: 900, color: isDarkMode ? '#bfdbfe' : '#1d4ed8', margin: 0 }}>{stats.totalUsers}</p>
          <p style={{ fontSize: 12, color: isDarkMode ? '#93c5fd' : '#3b82f6', margin: '4px 0 0' }}>Total registered platform students</p>
        </div>
        <div style={{ background: isDarkMode ? '#064e3b' : '#ecfdf5', borderRadius: 16, padding: 20 }}>
          <p style={{ fontWeight: 700, fontSize: 14, color: isDarkMode ? '#6ee7b7' : '#065f46', margin: '0 0 4px' }}>Content Library</p>
          <p style={{ fontSize: 28, fontWeight: 900, color: isDarkMode ? '#a7f3d0' : '#047857', margin: 0 }}>{stats.totalMaterials + stats.totalVideos + stats.totalTests}</p>
          <p style={{ fontSize: 12, color: isDarkMode ? '#6ee7b7' : '#10b981', margin: '4px 0 0' }}>Total notes, videos & tests published</p>
        </div>
        <div style={{ background: isDarkMode ? '#831843' : '#fdf2f8', borderRadius: 16, padding: 20 }}>
          <p style={{ fontWeight: 700, fontSize: 14, color: isDarkMode ? '#f472b6' : '#9d174d', margin: '0 0 4px' }}>Student Engagement</p>
          <p style={{ fontSize: 28, fontWeight: 900, color: isDarkMode ? '#fbcfe8' : '#be185d', margin: 0 }}>{stats.totalTestAttempts + stats.totalQuizAttempts}</p>
          <p style={{ fontSize: 12, color: isDarkMode ? '#f472b6' : '#ec4899', margin: '4px 0 0' }}>Total test & quiz submissions</p>
        </div>
      </div>
    </div>
  );
};
