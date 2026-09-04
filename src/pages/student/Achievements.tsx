import { useState, useEffect } from 'react';
import { Award, Lock, Trophy, Target, Star, TrendingUp } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { achievementService } from '@/services/achievementService';
import type { AchievementWithProgress, AchievementCategory } from '@/types/achievements';
import toast from 'react-hot-toast';

const categories: { value: AchievementCategory | 'all'; label: string; icon: any }[] = [
  { value: 'all', label: 'All', icon: Trophy },
  { value: 'first_steps', label: 'First Steps', icon: Star },
  { value: 'test_master', label: 'Test Master', icon: Target },
  { value: 'quiz_champion', label: 'Quiz Champion', icon: Award },
  { value: 'video_learner', label: 'Video Learner', icon: TrendingUp },
  { value: 'consistent_learner', label: 'Consistent', icon: TrendingUp },
  { value: 'perfect_score', label: 'Perfect Score', icon: Star },
];

export const StudentAchievements = () => {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<AchievementWithProgress[]>([]);
  const [stats, setStats] = useState({ totalAchievements: 0, unlockedAchievements: 0, totalPoints: 0, progress: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedCat, setSelectedCat] = useState<AchievementCategory | 'all'>('all');

  useEffect(() => { if (user) fetchAchievements(); }, [user]);

  const fetchAchievements = async () => {
    if (!user) return;
    try {
      setLoading(true);
      await achievementService.initializeUserAchievements(user.id);
      await achievementService.checkAchievements(user.id);
      const [data, statsData] = await Promise.all([
        achievementService.getUserAchievements(user.id),
        achievementService.getUserStats(user.id),
      ]);
      setAchievements(data);
      setStats(statsData);
    } catch { toast.error('Failed to load achievements'); }
    finally { setLoading(false); }
  };

  const filtered = selectedCat === 'all' ? achievements : achievements.filter(a => a.category === selectedCat);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Header Banner */}
      <div style={{ background: 'linear-gradient(135deg, #1a1a2e, #C8102E)', borderRadius: 20, padding: '24px 28px', display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFD700' }}><Trophy size={28} /></div>
        <div style={{ flex: 1 }}>
          <h1 style={{ color: 'white', fontSize: 22, fontWeight: 900, margin: 0 }}>Achievements</h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, margin: '4px 0 0' }}>Track your progress and unlock badges</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          {[
            { label: 'Unlocked', value: stats.unlockedAchievements, bg: 'rgba(255,215,0,0.15)', color: '#FFD700' },
            { label: 'Points', value: stats.totalPoints, bg: 'rgba(255,255,255,0.1)', color: 'white' },
            { label: 'Complete', value: `${stats.progress}%`, bg: 'rgba(16,185,129,0.2)', color: '#34d399' },
          ].map(({ label, value, bg, color }) => (
            <div key={label} style={{ background: bg, borderRadius: 12, padding: '10px 16px', textAlign: 'center', minWidth: 70 }}>
              <p style={{ fontSize: 20, fontWeight: 900, color, margin: 0, lineHeight: 1 }}>{value}</p>
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', margin: '3px 0 0' }}>{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Overall Progress */}
      <div style={{ background: 'white', borderRadius: 16, padding: 20, border: '1px solid #f0f0f0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 14 }}>
          <span style={{ fontWeight: 700, color: '#111827' }}>Overall Progress</span>
          <span style={{ color: '#6b7280' }}>{stats.unlockedAchievements} / {stats.totalAchievements} badges</span>
        </div>
        <div style={{ height: 10, background: '#f3f4f6', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${stats.progress}%`, background: 'linear-gradient(90deg, #C8102E, #FFD700)', borderRadius: 99, transition: 'width 0.8s ease' }} />
        </div>
      </div>

      {/* Category Filter */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
        {categories.map(cat => {
          const count = cat.value === 'all' ? achievements.length : achievements.filter(a => a.category === cat.value).length;
          const isActive = selectedCat === cat.value;
          return (
            <button key={cat.value} onClick={() => setSelectedCat(cat.value)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 99, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', fontWeight: 600, fontSize: 13, transition: 'all 0.15s', background: isActive ? '#C8102E' : '#f3f4f6', color: isActive ? 'white' : '#6b7280', boxShadow: isActive ? '0 2px 8px rgba(200,16,46,0.3)' : 'none' }}
            >
              <cat.icon size={15} />
              {cat.label}
              <span style={{ fontSize: 11, opacity: 0.75 }}>({count})</span>
            </button>
          );
        })}
      </div>

      {/* Achievements Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <div style={{ width: 40, height: 40, border: '3px solid #f3f4f6', borderTopColor: '#C8102E', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
          <p style={{ color: '#9ca3af', fontSize: 13, marginTop: 12 }}>Loading achievements...</p>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <p style={{ color: '#9ca3af', fontSize: 14 }}>No achievements in this category</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
          {filtered.map(a => (
            <div key={a.id}
              style={{
                background: 'white',
                borderRadius: 16,
                border: a.unlocked ? '2px solid #FFD700' : '1px solid #f0f0f0',
                boxShadow: a.unlocked ? '0 4px 20px rgba(255,215,0,0.2)' : '0 2px 8px rgba(0,0,0,0.05)',
                padding: 20,
                textAlign: 'center',
                opacity: a.unlocked ? 1 : 0.75,
                position: 'relative',
                overflow: 'hidden',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
            >
              {/* Gold glow for unlocked */}
              {a.unlocked && <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at top right, rgba(255,215,0,0.08), transparent)', pointerEvents: 'none' }} />}

              {/* Badge */}
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: a.unlocked ? 'linear-gradient(135deg, #FFD700, #FFA500)' : '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', fontSize: 36, boxShadow: a.unlocked ? '0 4px 16px rgba(255,165,0,0.4)' : 'none' }}>
                {a.unlocked ? a.icon : <Lock size={28} color="#9ca3af" />}
              </div>

              <h3 style={{ fontWeight: 800, fontSize: 14, color: '#111827', margin: '0 0 6px' }}>{a.name}</h3>
              <p style={{ fontSize: 12, color: '#6b7280', margin: '0 0 12px', lineHeight: 1.5 }}>{a.description}</p>

              {/* Progress bar for locked */}
              {!a.unlocked && (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#9ca3af', marginBottom: 5 }}>
                    <span>Progress</span>
                    <span style={{ fontWeight: 700, color: '#6b7280' }}>{a.progress}/{a.requirement}</span>
                  </div>
                  <div style={{ height: 6, background: '#f3f4f6', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${a.progress_percentage}%`, background: 'linear-gradient(90deg, #C8102E, #E6324B)', borderRadius: 99 }} />
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid #f3f4f6' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 700, color: '#f59e0b' }}>
                  <Star size={14} fill="#f59e0b" />{a.points} pts
                </span>
                <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 99, fontWeight: 600, background: a.unlocked ? '#ecfdf5' : '#f3f4f6', color: a.unlocked ? '#16a34a' : '#6b7280' }}>
                  {a.unlocked ? 'Unlocked' : 'Locked'}
                </span>
              </div>

              {a.unlocked && a.unlocked_at && (
                <p style={{ fontSize: 10, color: '#9ca3af', margin: '8px 0 0' }}>{new Date(a.unlocked_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
