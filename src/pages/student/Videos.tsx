import { useState, useEffect } from 'react';
import { Search, Play, Clock, Eye, Bookmark, BookmarkCheck, Filter, Video, X } from 'lucide-react';
import { videoService } from '@/services/videoService';
import { bookmarkService } from '@/services/bookmarkService';
import { supabase } from '@/supabase/client';
import type { Video as VideoType } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { formatDate } from '@/utils/formatters';
import toast from 'react-hot-toast';

const categories = ['Postal Rules', 'Department Circulars', 'Exam Preparation', 'Mock Tests', 'Current Affairs', 'General Knowledge'];

const catColors: Record<string, { bg: string; text: string }> = {
  'Postal Rules': { bg: '#eff6ff', text: '#2563eb' },
  'Department Circulars': { bg: '#f0fdf4', text: '#16a34a' },
  'Exam Preparation': { bg: '#fff7ed', text: '#ea580c' },
  'Mock Tests': { bg: '#fdf4ff', text: '#9333ea' },
  'Current Affairs': { bg: '#fefce8', text: '#ca8a04' },
  'General Knowledge': { bg: '#f0fdfa', text: '#0d9488' },
  'default': { bg: '#f3f4f6', text: '#6b7280' },
};

const fmt = (s: number) => {
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  return h > 0 ? `${h}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}` : `${m}:${sec.toString().padStart(2, '0')}`;
};

export const StudentVideos = () => {
  const { user } = useAuth();
  const [videos, setVideos] = useState<VideoType[]>([]);
  const [filtered, setFiltered] = useState<VideoType[]>([]);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [selectedVideo, setSelectedVideo] = useState<VideoType | null>(null);
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAll(); }, []);
  useEffect(() => {
    let f = videos;
    if (category !== 'all') f = f.filter(v => v.category === category);
    if (search) f = f.filter(v => v.title.toLowerCase().includes(search.toLowerCase()) || v.description?.toLowerCase().includes(search.toLowerCase()));
    setFiltered(f);
  }, [videos, search, category]);

  const fetchAll = async () => {
    try {
      const [data] = await Promise.all([videoService.getAll()]);
      setVideos(data);
      if (user) {
        const bm = await bookmarkService.getByType(user.id, 'video');
        setBookmarkedIds(new Set(bm.map(b => b.content_id)));
        const { data: prog } = await supabase.from('video_progress').select('video_id, progress').eq('user_id', user.id);
        if (prog) { const m: Record<string, number> = {}; prog.forEach((p: any) => m[p.video_id] = p.progress); setProgress(m); }
      }
    } catch { toast.error('Failed to load videos'); }
    finally { setLoading(false); }
  };

  const handlePlay = async (video: VideoType) => {
    if (!user) return;
    try { await videoService.incrementViews(video.id); setSelectedVideo(video); fetchAll(); }
    catch { toast.error('Failed to load video'); }
  };

  const toggleBookmark = async (id: string) => {
    if (!user) return;
    try {
      if (bookmarkedIds.has(id)) { await bookmarkService.remove(user.id, id); setBookmarkedIds(p => { const s = new Set(p); s.delete(id); return s; }); toast.success('Removed'); }
      else { await bookmarkService.add(user.id, 'video', id); setBookmarkedIds(p => new Set(p).add(id)); toast.success('Bookmarked!'); }
    } catch { toast.error('Failed'); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Header */}
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 900, color: '#111827', margin: 0 }}>Video Lectures</h1>
        <p style={{ color: '#6b7280', fontSize: 13, margin: '4px 0 0' }}>{videos.length} videos available</p>
      </div>

      {/* Search + Filter */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search videos..." style={{ width: '100%', padding: '11px 12px 11px 40px', borderRadius: 12, border: '1.5px solid #e5e7eb', background: '#f9fafb', fontSize: 14, color: '#111827', outline: 'none', boxSizing: 'border-box' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Filter size={16} color="#6b7280" />
          <select value={category} onChange={e => setCategory(e.target.value)} style={{ padding: '11px 14px', borderRadius: 12, border: '1.5px solid #e5e7eb', background: '#f9fafb', fontSize: 14, color: '#111827', outline: 'none', cursor: 'pointer' }}>
            <option value="all">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <div style={{ width: 40, height: 40, border: '3px solid #f3f4f6', borderTopColor: '#C8102E', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      )}

      {/* Grid */}
      {!loading && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {filtered.map(video => {
              const pct = progress[video.id] || 0;
              const cat = catColors[video.category] || catColors['default'];
              const isBookmarked = bookmarkedIds.has(video.id);
              return (
                <div key={video.id}
                  style={{ background: 'white', borderRadius: 16, border: '1px solid #f0f0f0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'box-shadow 0.2s, transform 0.2s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.10)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
                >
                  {/* Thumbnail */}
                  <div style={{ position: 'relative', paddingTop: '56.25%', background: '#1f2937', cursor: 'pointer' }} onClick={() => handlePlay(video)}>
                    {video.thumbnail_url
                      ? <img src={video.thumbnail_url} alt={video.title} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Video size={40} color="rgba(255,255,255,0.3)" /></div>
                    }
                    {/* Play overlay */}
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s' }}
                      onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                      onMouseLeave={e => (e.currentTarget.style.opacity = '0')}
                    >
                      <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#C8102E', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(0,0,0,0.4)' }}>
                        <Play size={22} color="white" style={{ marginLeft: 2 }} />
                      </div>
                    </div>
                    {/* Duration badge */}
                    {video.duration && <span style={{ position: 'absolute', bottom: 8, right: 8, background: 'rgba(0,0,0,0.75)', color: 'white', borderRadius: 6, padding: '2px 7px', fontSize: 11, fontWeight: 700 }}>{fmt(video.duration)}</span>}
                    {/* Progress bar */}
                    {pct > 0 && <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: 'rgba(255,255,255,0.3)' }}><div style={{ height: '100%', width: `${pct}%`, background: '#C8102E' }} /></div>}
                  </div>

                  {/* Info */}
                  <div style={{ padding: '14px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                      <h3 style={{ fontWeight: 700, fontSize: 14, color: '#111827', margin: 0, lineHeight: 1.4, flex: 1 }}>{video.title}</h3>
                      <button onClick={() => toggleBookmark(video.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: isBookmarked ? '#C8102E' : '#9ca3af', flexShrink: 0 }}>
                        {isBookmarked ? <BookmarkCheck size={17} /> : <Bookmark size={17} />}
                      </button>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 99, background: cat.bg, color: cat.text, display: 'inline-block', alignSelf: 'flex-start' }}>{video.category}</span>
                    {video.description && <p style={{ fontSize: 12, color: '#6b7280', margin: 0, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any, overflow: 'hidden' }}>{video.description}</p>}
                    <div style={{ display: 'flex', gap: 12, fontSize: 11, color: '#9ca3af', marginTop: 'auto' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Eye size={12} />{video.views_count} views</span>
                      {pct > 0 && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={12} />{pct}% watched</span>}
                    </div>
                  </div>

                  {/* CTA */}
                  <div style={{ padding: '0 16px 16px' }}>
                    <button onClick={() => handlePlay(video)} style={{ width: '100%', padding: '10px 0', borderRadius: 10, border: 'none', background: '#C8102E', color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'background 0.15s' }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#a00d25')}
                      onMouseLeave={e => (e.currentTarget.style.background = '#C8102E')}
                    >
                      <Play size={14} />{pct > 0 ? 'Continue Watching' : 'Watch Now'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          {filtered.length === 0 && <div style={{ textAlign: 'center', padding: '60px 0' }}><Video size={48} color="#e5e7eb" style={{ display: 'block', margin: '0 auto 12px' }} /><p style={{ color: '#9ca3af', fontSize: 14 }}>No videos found</p></div>}
        </>
      )}

      {/* Video Player Modal */}
      {selectedVideo && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: '#111827', borderRadius: 20, width: '100%', maxWidth: 900, overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px' }}>
              <p style={{ fontWeight: 700, fontSize: 15, color: 'white', margin: 0, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selectedVideo.title}</p>
              <button onClick={() => setSelectedVideo(null)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', borderRadius: 8, padding: '6px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                <X size={18} />
              </button>
            </div>
            <div style={{ paddingBottom: '56.25%', position: 'relative', background: 'black' }}>
              {selectedVideo.video_url.includes('youtube.com') || selectedVideo.video_url.includes('youtu.be')
                ? <iframe src={selectedVideo.video_url.replace('watch?v=', 'embed/').replace('youtu.be/', 'www.youtube.com/embed/')} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }} allowFullScreen title={selectedVideo.title} />
                : <video src={selectedVideo.video_url} controls autoPlay style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
              }
            </div>
            {selectedVideo.description && (
              <div style={{ padding: '16px 20px' }}>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', margin: 0, lineHeight: 1.6 }}>{selectedVideo.description}</p>
                <div style={{ display: 'flex', gap: 16, marginTop: 10, fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
                  <span>{selectedVideo.views_count} views</span>
                  <span>•</span>
                  <span>{formatDate(selectedVideo.created_at)}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
