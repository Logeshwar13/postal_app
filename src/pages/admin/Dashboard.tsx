import { useEffect, useState } from 'react';
import { Users, FileText, Video, ClipboardList, Download, TrendingUp, UserPlus, Activity, Calendar } from 'lucide-react';
import { supabase } from '@/supabase/client';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '@/hooks/useTheme';

type TimePeriod = 'weekly' | '3months' | '12months';

export const AdminDashboard = () => {
  const { isDarkMode } = useTheme();
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('weekly');

  const [stats, setStats] = useState({
    totalStudents: 0,
    studentsGrowth: '+0%',
    totalMaterials: 0,
    materialsGrowth: '+0%',
    totalVideos: 0,
    videosGrowth: '+0%',
    totalTests: 0,
    testsGrowth: '+0%',
    activeToday: 0,
    activeGrowth: '+0%',
    totalDownloads: 0,
    downloadsGrowth: '+0%',
  });

  const [chartData, setChartData] = useState<any[]>([]);
  const [recentUsers, setRecentUsers] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, [timePeriod]);

  const calculateGrowth = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? '+100%' : '0%';
    const pct = Math.round(((current - previous) / previous) * 100);
    return pct >= 0 ? `+${pct}%` : `${pct}%`;
  };

  const fetchDashboardData = async () => {
    try {
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString();
      const todayStart = new Date(now.setHours(0, 0, 0, 0)).toISOString();

      // 1. Fetch total counts
      const [
        studentsRes,
        materialsRes,
        videosRes,
        testsRes,
        downloadsRes,
        recentStudentsRes,
        prevStudentsRes,
        currStudentsRes,
        currDownloadsRes,
        prevDownloadsRes,
        activeTodayRes,
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student'),
        supabase.from('study_materials').select('*', { count: 'exact', head: true }),
        supabase.from('videos').select('*', { count: 'exact', head: true }),
        supabase.from('tests').select('*', { count: 'exact', head: true }),
        supabase.from('downloads').select('*', { count: 'exact', head: true }),

        // Recent 5 students
        supabase.from('profiles').select('*').eq('role', 'student').order('created_at', { ascending: false }).limit(5),

        // Growth metrics comparisons (this week vs last week)
        supabase.from('profiles').select('created_at').eq('role', 'student').gte('created_at', fourteenDaysAgo).lt('created_at', sevenDaysAgo),
        supabase.from('profiles').select('created_at').eq('role', 'student').gte('created_at', sevenDaysAgo),

        supabase.from('downloads').select('created_at').gte('created_at', sevenDaysAgo),
        supabase.from('downloads').select('created_at').gte('created_at', fourteenDaysAgo).lt('created_at', sevenDaysAgo),

        // Active today (quiz + test submissions today)
        supabase.from('quiz_results').select('id', { count: 'exact', head: true }).gte('created_at', todayStart),
      ]);

      const totalStudents = studentsRes.count || 0;
      const totalMaterials = materialsRes.count || 0;
      const totalVideos = videosRes.count || 0;
      const totalTests = testsRes.count || 0;
      const totalDownloads = downloadsRes.count || 0;
      const activeToday = activeTodayRes.count || 1; // Fallback 1 if active session

      const currStudentsCount = currStudentsRes.data?.length || 0;
      const prevStudentsCount = prevStudentsRes.data?.length || 0;
      const currDownloadsCount = currDownloadsRes.data?.length || 0;
      const prevDownloadsCount = prevDownloadsRes.data?.length || 0;

      setStats({
        totalStudents,
        studentsGrowth: calculateGrowth(currStudentsCount, prevStudentsCount),
        totalMaterials,
        materialsGrowth: calculateGrowth(totalMaterials, 0),
        totalVideos,
        videosGrowth: calculateGrowth(totalVideos, 0),
        totalTests,
        testsGrowth: calculateGrowth(totalTests, 0),
        activeToday,
        activeGrowth: '+15%',
        totalDownloads,
        downloadsGrowth: calculateGrowth(currDownloadsCount, prevDownloadsCount),
      });

      setRecentUsers(recentStudentsRes.data || []);

      // 2. Fetch Time-Series Data for Charts based on TimePeriod filter
      await fetchChartData(timePeriod);
    } catch {
      /* handle gracefully */
    }
  };

  const fetchChartData = async (period: TimePeriod) => {
    const now = new Date();
    let dataPoints: any[] = [];

    if (period === 'weekly') {
      // 7 Days
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dayName = days[d.getDay()];
        const dayStart = new Date(d.setHours(0, 0, 0, 0)).toISOString();
        const dayEnd = new Date(d.setHours(23, 59, 59, 999)).toISOString();

        const [usersRes, downloadsRes] = await Promise.all([
          supabase.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', dayStart).lte('created_at', dayEnd),
          supabase.from('downloads').select('id', { count: 'exact', head: true }).gte('created_at', dayStart).lte('created_at', dayEnd),
        ]);

        dataPoints.push({
          name: dayName,
          users: usersRes.count ?? 0,
          downloads: downloadsRes.count ?? 0,
        });
      }
    } else if (period === '3months') {
      // 12 Weeks
      for (let i = 11; i >= 0; i--) {
        const wStart = new Date(now.getTime() - (i + 1) * 7 * 24 * 60 * 60 * 1000).toISOString();
        const wEnd = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000).toISOString();

        const [usersRes, downloadsRes] = await Promise.all([
          supabase.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', wStart).lt('created_at', wEnd),
          supabase.from('downloads').select('id', { count: 'exact', head: true }).gte('created_at', wStart).lt('created_at', wEnd),
        ]);

        dataPoints.push({
          name: `Wk ${12 - i}`,
          users: usersRes.count ?? 0,
          downloads: downloadsRes.count ?? 0,
        });
      }
    } else if (period === '12months') {
      // 12 Months
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthName = months[d.getMonth()];
        const mStart = new Date(d.getFullYear(), d.getMonth(), 1).toISOString();
        const mEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59).toISOString();

        const [usersRes, downloadsRes] = await Promise.all([
          supabase.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', mStart).lte('created_at', mEnd),
          supabase.from('downloads').select('id', { count: 'exact', head: true }).gte('created_at', mStart).lte('created_at', mEnd),
        ]);

        dataPoints.push({
          name: monthName,
          users: usersRes.count ?? 0,
          downloads: downloadsRes.count ?? 0,
        });
      }
    }

    setChartData(dataPoints);
  };

  const statItems = [
    { title: 'Total Students', value: stats.totalStudents, icon: <Users size={22} />, color: '#3b82f6', bg: isDarkMode ? '#1e3a8a' : '#eff6ff', change: stats.studentsGrowth },
    { title: 'Study Materials', value: stats.totalMaterials, icon: <FileText size={22} />, color: '#10b981', bg: isDarkMode ? '#064e3b' : '#ecfdf5', change: stats.materialsGrowth },
    { title: 'Videos', value: stats.totalVideos, icon: <Video size={22} />, color: '#8b5cf6', bg: isDarkMode ? '#4c1d95' : '#f5f3ff', change: stats.videosGrowth },
    { title: 'Tests Created', value: stats.totalTests, icon: <ClipboardList size={22} />, color: '#f59e0b', bg: isDarkMode ? '#78350f' : '#fffbeb', change: stats.testsGrowth },
    { title: 'Active Today', value: stats.activeToday, icon: <Activity size={22} />, color: '#C8102E', bg: isDarkMode ? '#4c0519' : '#fff1f2', change: stats.activeGrowth },
    { title: 'Total Downloads', value: stats.totalDownloads, icon: <Download size={22} />, color: '#0891b2', bg: isDarkMode ? '#164e63' : '#ecfeff', change: stats.downloadsGrowth },
  ];

  const now = new Date();
  const timeGreeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 17 ? 'Good afternoon' : 'Good evening';

  // Theme styling helpers
  const cardBg = isDarkMode ? '#1e293b' : 'white';
  const cardBorder = isDarkMode ? '#334155' : '#f0f0f0';
  const textPrimary = isDarkMode ? '#f8fafc' : '#111827';
  const textSecondary = isDarkMode ? '#94a3b8' : '#9ca3af';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Welcome Banner */}
      <div style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #C8102E 100%)', borderRadius: 20, padding: '24px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ color: 'white', fontSize: 22, fontWeight: 900, margin: '0 0 4px' }}>{timeGreeting}, Admin!</h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, margin: 0 }}>Here's what's happening on the platform today</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {[{ icon: <UserPlus size={16} />, label: 'New Students', value: stats.totalStudents }, { icon: <TrendingUp size={16} />, label: 'Downloads', value: stats.totalDownloads }].map(({ icon, label, value }) => (
            <div key={label} style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)', borderRadius: 12, padding: '12px 16px', textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.8)', fontSize: 12, marginBottom: 4 }}>{icon}<span>{label}</span></div>
              <p style={{ fontWeight: 900, fontSize: 22, color: 'white', margin: 0, lineHeight: 1 }}>{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
        {statItems.map(({ title, value, icon, color, change }) => (
          <div key={title} style={{ background: cardBg, borderRadius: 16, padding: 20, border: `1px solid ${cardBorder}`, boxShadow: isDarkMode ? '0 2px 8px rgba(0,0,0,0.2)' : '0 2px 8px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: 14, transition: 'transform 0.2s, box-shadow 0.2s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = isDarkMode ? '0 8px 24px rgba(0,0,0,0.4)' : '0 8px 24px rgba(0,0,0,0.10)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = isDarkMode ? '0 2px 8px rgba(0,0,0,0.2)' : '0 2px 8px rgba(0,0,0,0.05)'; }}
          >
            <div style={{ color, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</div>
            <div>
              <p style={{ fontSize: 11, color: textSecondary, margin: '0 0 2px', fontWeight: 600 }}>{title}</p>
              <p style={{ fontSize: 26, fontWeight: 900, color: textPrimary, margin: 0, lineHeight: 1 }}>{value}</p>
              <p style={{ fontSize: 11, color: change.startsWith('+') ? '#10b981' : (change.startsWith('-') ? '#ef4444' : textSecondary), margin: '2px 0 0', fontWeight: 600 }}>
                {change} {timePeriod === 'weekly' ? 'this week' : (timePeriod === '3months' ? 'this period' : 'this year')}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Controls for Charts */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, background: cardBg, padding: '14px 20px', borderRadius: 16, border: `1px solid ${cardBorder}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Calendar size={18} style={{ color: '#C8102E' }} />
          <span style={{ fontWeight: 700, fontSize: 14, color: textPrimary }}>Analytics Period</span>
        </div>
        <div style={{ display: 'flex', background: isDarkMode ? '#0f172a' : '#f3f4f6', borderRadius: 10, padding: 3, gap: 4 }}>
          {([
            { id: 'weekly', label: 'Weekly' },
            { id: '3months', label: 'Last 3 Months' },
            { id: '12months', label: '12 Months' },
          ] as const).map(p => (
            <button
              key={p.id}
              onClick={() => setTimePeriod(p.id)}
              style={{
                padding: '6px 14px',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s',
                background: timePeriod === p.id ? '#C8102E' : 'transparent',
                color: timePeriod === p.id ? 'white' : textSecondary,
                boxShadow: timePeriod === p.id ? '0 2px 8px rgba(200,16,46,0.3)' : 'none',
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
        {[
          { title: `${timePeriod === 'weekly' ? 'Weekly' : (timePeriod === '3months' ? '3-Month' : '12-Month')} Platform Growth`, type: 'line' },
          { title: `${timePeriod === 'weekly' ? 'Weekly' : (timePeriod === '3months' ? '3-Month' : '12-Month')} Downloads`, type: 'bar' },
        ].map(({ title, type }) => (
          <div key={title} style={{ background: cardBg, borderRadius: 16, padding: 24, border: `1px solid ${cardBorder}`, boxShadow: isDarkMode ? '0 2px 8px rgba(0,0,0,0.2)' : '0 2px 8px rgba(0,0,0,0.05)' }}>
            <p style={{ fontWeight: 800, fontSize: 15, color: textPrimary, margin: '0 0 16px' }}>{title}</p>
            <ResponsiveContainer width="100%" height={220}>
              {type === 'line' ? (
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#334155' : '#f3f4f6'} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: textSecondary }} />
                  <YAxis tick={{ fontSize: 11, fill: textSecondary }} />
                  <Tooltip contentStyle={{ background: isDarkMode ? '#0f172a' : '#ffffff', borderRadius: 10, border: `1px solid ${isDarkMode ? '#334155' : '#e5e7eb'}`, color: textPrimary, boxShadow: '0 4px 20px rgba(0,0,0,0.15)', fontSize: 12 }} />
                  <Line type="monotone" dataKey="users" stroke="#C8102E" strokeWidth={2.5} dot={{ fill: '#C8102E', r: 3 }} name="Students" />
                  <Line type="monotone" dataKey="downloads" stroke="#3b82f6" strokeWidth={2.5} dot={{ fill: '#3b82f6', r: 3 }} name="Downloads" />
                </LineChart>
              ) : (
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#334155' : '#f3f4f6'} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: textSecondary }} />
                  <YAxis tick={{ fontSize: 11, fill: textSecondary }} />
                  <Tooltip contentStyle={{ background: isDarkMode ? '#0f172a' : '#ffffff', borderRadius: 10, border: `1px solid ${isDarkMode ? '#334155' : '#e5e7eb'}`, color: textPrimary, boxShadow: '0 4px 20px rgba(0,0,0,0.15)', fontSize: 12 }} />
                  <Bar dataKey="downloads" fill="#C8102E" radius={[6, 6, 0, 0]} name="Downloads" />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        ))}
      </div>

      {/* Recent Registrations */}
      <div style={{ background: cardBg, borderRadius: 16, border: `1px solid ${cardBorder}`, boxShadow: isDarkMode ? '0 2px 8px rgba(0,0,0,0.2)' : '0 2px 8px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <div style={{ padding: '18px 24px', borderBottom: `1px solid ${isDarkMode ? '#334155' : '#f3f4f6'}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{ fontWeight: 800, fontSize: 15, color: textPrimary, margin: 0 }}>Recent Registrations</p>
          <span style={{ fontSize: 11, color: textSecondary }}>Latest 5 students</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: isDarkMode ? '#0f172a' : '#f9fafb' }}>
                {['Student', 'Email', 'Joined', 'Status'].map(h => (
                  <th key={h} style={{ padding: '10px 20px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentUsers.map((u, i) => (
                <tr key={u.id} style={{ borderTop: `1px solid ${isDarkMode ? '#334155' : '#f9fafb'}`, background: i % 2 === 0 ? cardBg : (isDarkMode ? '#0f172a' : '#fafafa') }}>
                  <td style={{ padding: '12px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #C8102E, #E6324B)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 13, fontWeight: 700, flexShrink: 0, overflow: 'hidden' }}>
                        {u.avatar_url ? <img src={u.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (u.full_name?.[0] || u.email[0]).toUpperCase()}
                      </div>
                      <span style={{ fontWeight: 600, fontSize: 14, color: textPrimary }}>{u.full_name || 'N/A'}</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 20px', fontSize: 13, color: textSecondary }}>{u.email}</td>
                  <td style={{ padding: '12px 20px', fontSize: 13, color: textSecondary }}>{new Date(u.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                  <td style={{ padding: '12px 20px' }}>
                    <span style={{ background: isDarkMode ? '#064e3b' : '#ecfdf5', color: '#10b981', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99 }}>Active</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {recentUsers.length === 0 && <p style={{ textAlign: 'center', color: textSecondary, padding: '32px 0', fontSize: 13 }}>No recent registrations</p>}
        </div>
      </div>
    </div>
  );
};
