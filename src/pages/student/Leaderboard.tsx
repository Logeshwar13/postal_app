import { useState, useEffect } from 'react';
import { Trophy, Target, Clock, TrendingUp, Award } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { leaderboardService, type LeaderboardEntry } from '@/services/leaderboardService';
import toast from 'react-hot-toast';

const podiumColors: Record<number, { bg: string; border: string; medal: string; textColor: string }> = {
  1: { bg: 'linear-gradient(135deg, #FFD700, #FFA500)', border: '#FFD700', medal: '#1', textColor: '#92400e' },
  2: { bg: 'linear-gradient(135deg, #C0C0C0, #9ca3af)', border: '#C0C0C0', medal: '#2', textColor: '#374151' },
  3: { bg: 'linear-gradient(135deg, #CD7F32, #b45309)', border: '#CD7F32', medal: '#3', textColor: '#78350f' },
};

export const StudentLeaderboard = () => {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState<'test' | 'quiz'>('test');
  const [userRank, setUserRank] = useState<number | null>(null);

  useEffect(() => { fetchLeaderboard(); }, [type]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const data = type === 'test'
        ? await leaderboardService.getTestLeaderboard()
        : await leaderboardService.getQuizLeaderboard();
      setLeaderboard(data);
      if (user) {
        const rank = await leaderboardService.getUserRank(user.id, type);
        setUserRank(rank);
      }
    } catch {
      toast.error('Failed to fetch leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const Avatar = ({ name, url, size = 48, fontSize = 18 }: { name: string; url?: string | null; size?: number; fontSize?: number }) => (
    <div style={{ width: size, height: size, borderRadius: '50%', overflow: 'hidden', background: 'linear-gradient(135deg, #C8102E, #E6324B)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize, flexShrink: 0 }}>
      {url ? <img src={url} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : name.charAt(0).toUpperCase()}
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Header Banner */}
      <div style={{ background: 'linear-gradient(135deg, #1a1a2e, #C8102E)', borderRadius: 20, padding: '24px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
            <Trophy size={28} color="#FFD700" />
            <h1 style={{ color: 'white', fontSize: 24, fontWeight: 900, margin: 0 }}>Leaderboard</h1>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, margin: 0 }}>See where you stand among your peers</p>
        </div>
        {userRank && (
          <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 14, padding: '14px 20px', textAlign: 'center' }}>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, margin: '0 0 4px' }}>Your Rank</p>
            <p style={{ color: 'white', fontSize: 32, fontWeight: 900, margin: 0, lineHeight: 1 }}>#{userRank}</p>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, margin: '4px 0 0' }}>of {leaderboard.length} students</p>
          </div>
        )}
      </div>

      {/* Tab Selector */}
      <div style={{ display: 'flex', gap: 10, background: '#f3f4f6', borderRadius: 14, padding: 6 }}>
        {(['test', 'quiz'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            style={{
              flex: 1,
              padding: '10px 20px',
              borderRadius: 10,
              border: 'none',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: 14,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              transition: 'all 0.2s',
              background: type === t ? 'white' : 'transparent',
              color: type === t ? '#C8102E' : '#6b7280',
              boxShadow: type === t ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
            }}
          >
            {t === 'test' ? <Target size={16} /> : <Award size={16} />}
            {t === 'test' ? 'Test Rankings' : 'Quiz Rankings'}
          </button>
        ))}
      </div>

      {/* Top 3 Podium */}
      {!loading && leaderboard.length >= 3 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, alignItems: 'end' }}>
          {[leaderboard[1], leaderboard[0], leaderboard[2]].map((entry, podiumIdx) => {
            const rank = podiumIdx === 1 ? 1 : podiumIdx === 0 ? 2 : 3;
            const pal = podiumColors[rank];
            const isFirst = rank === 1;
            return (
              <div
                key={entry.user_id}
                style={{
                  background: 'white',
                  borderRadius: 16,
                  padding: '24px 16px 16px',
                  border: `2.5px solid ${pal.border}`,
                  textAlign: 'center',
                  boxShadow: isFirst ? `0 8px 32px ${pal.border}50` : '0 2px 8px rgba(0,0,0,0.06)',
                  marginTop: isFirst ? 0 : 24,
                }}
              >
                <div style={{ fontSize: 32, marginBottom: 8 }}>{pal.medal}</div>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
                  <Avatar name={entry.full_name} url={entry.avatar_url} size={isFirst ? 64 : 52} fontSize={isFirst ? 24 : 20} />
                </div>
                <p style={{ fontWeight: 800, fontSize: isFirst ? 15 : 13, color: '#111827', margin: '0 0 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{entry.full_name}</p>
                <p style={{ fontSize: isFirst ? 22 : 18, fontWeight: 900, color: '#C8102E', margin: '0 0 2px' }}>
                  {type === 'test' ? entry.average_score : entry.accuracy}{type === 'quiz' && '%'}
                </p>
                <p style={{ fontSize: 11, color: '#9ca3af', margin: 0 }}>{entry.total_tests} {type === 'test' ? 'tests' : 'quizzes'}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Full Rankings Table */}
      <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f0f0f0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6' }}>
          <p style={{ fontWeight: 700, fontSize: 15, color: '#111827', margin: 0 }}>Complete Rankings</p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <div style={{ width: 40, height: 40, border: '3px solid #f3f4f6', borderTopColor: '#C8102E', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
            <p style={{ color: '#9ca3af', marginTop: 12, fontSize: 13 }}>Loading rankings...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : leaderboard.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <Trophy size={48} color="#e5e7eb" style={{ display: 'block', margin: '0 auto 12px' }} />
            <p style={{ color: '#9ca3af', fontSize: 14, margin: 0 }}>No rankings yet — be the first!</p>
          </div>
        ) : (
          <div>
            {leaderboard.map((entry, idx) => {
              const isMe = user?.id === entry.user_id;
              const pal = podiumColors[entry.rank];
              return (
                <div
                  key={entry.user_id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    padding: '12px 20px',
                    borderBottom: idx < leaderboard.length - 1 ? '1px solid #f9fafb' : 'none',
                    background: isMe ? '#fff1f2' : idx % 2 === 0 ? 'white' : '#fafafa',
                    outline: isMe ? '2px solid #C8102E' : 'none',
                    outlineOffset: -2,
                    transition: 'background 0.15s',
                  }}
                >
                  {/* Rank */}
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: pal ? pal.bg : '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: pal ? 18 : 13, fontWeight: 700, color: pal ? '#fff' : '#6b7280', flexShrink: 0 }}>
                    {pal ? pal.medal : `#${entry.rank}`}
                  </div>

                  {/* Avatar */}
                  <Avatar name={entry.full_name} url={entry.avatar_url} size={40} fontSize={16} />

                  {/* Name */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <p style={{ fontWeight: 600, fontSize: 14, color: '#111827', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{entry.full_name}</p>
                      {isMe && <span style={{ background: '#C8102E', color: 'white', fontSize: 10, fontWeight: 700, padding: '1px 7px', borderRadius: 99 }}>YOU</span>}
                    </div>
                    <p style={{ fontSize: 11, color: '#9ca3af', margin: '2px 0 0' }}>{entry.total_tests} {type === 'test' ? 'tests' : 'quizzes'}</p>
                  </div>

                  {/* Score */}
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end' }}>
                      {type === 'test' ? <Target size={14} color="#C8102E" /> : <TrendingUp size={14} color="#C8102E" />}
                      <p style={{ fontWeight: 800, fontSize: 16, color: '#C8102E', margin: 0 }}>
                        {type === 'test' ? entry.average_score : entry.accuracy}{type === 'quiz' && '%'}
                      </p>
                    </div>
                    {type === 'test' && entry.time_taken && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end', marginTop: 2 }}>
                        <Clock size={11} color="#9ca3af" />
                        <span style={{ fontSize: 11, color: '#9ca3af' }}>{Math.round(entry.time_taken / 60)}m</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
