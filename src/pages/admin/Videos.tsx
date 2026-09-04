import { useState, useEffect } from 'react';
import { Plus, Search, Eye, Trash2, Video as VideoIcon, Upload, Link, Play } from 'lucide-react';
import { videoService } from '@/services/videoService';
import type { Video as VideoType } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { formatDate } from '@/utils/formatters';
import toast from 'react-hot-toast';

const categories = ['Postal Rules', 'Department Circulars', 'Exam Preparation', 'Mock Tests', 'Current Affairs', 'General Knowledge'];

export const AdminVideos = () => {
  const { user } = useAuth();
  const [videos, setVideos] = useState<VideoType[]>([]);
  const [filtered, setFiltered] = useState<VideoType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSource, setUploadSource] = useState<'youtube' | 'local' | 'gdrive'>('youtube');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Postal Rules',
    video_url: '',
    thumbnail_url: '',
    duration: 0,
    is_public: true,
  });

  useEffect(() => { fetchVideos(); }, []);
  useEffect(() => {
    let f = videos;
    if (category !== 'all') f = f.filter(v => v.category === category);
    if (search) f = f.filter(v => v.title.toLowerCase().includes(search.toLowerCase()) || v.description?.toLowerCase().includes(search.toLowerCase()));
    setFiltered(f);
  }, [videos, search, category]);

  const fetchVideos = async () => {
    try {
      const data = await videoService.getAllAdmin();
      setVideos(data);
    } catch { toast.error('Failed to fetch videos'); }
    finally { setIsLoading(false); }
  };

  const handleTogglePublic = async (video: VideoType) => {
    const nextStatus = video.is_public === false ? true : false;
    try {
      await videoService.togglePublic(video.id, nextStatus);
      toast.success(`Video is now ${nextStatus ? 'Public' : 'Private'}`);
      fetchVideos();
    } catch { toast.error('Failed to update video visibility'); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    let finalVideoUrl = formData.video_url;

    setIsUploading(true);
    try {
      // Handle Local File Upload to Supabase Storage
      if (uploadSource === 'local' && selectedFile) {
        toast.loading('Uploading video file to storage...', { id: 'upload' });
        finalVideoUrl = await videoService.uploadLocalVideo(selectedFile);
        toast.dismiss('upload');
      }

      if (!finalVideoUrl) {
        toast.error('Please provide a video URL or select a video file.');
        setIsUploading(false);
        return;
      }

      await videoService.create({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        video_url: finalVideoUrl,
        thumbnail_url: formData.thumbnail_url || null,
        duration: formData.duration || 0,
        uploaded_by: user.id,
        is_public: formData.is_public,
      });

      toast.success('Video published successfully!');
      setShowModal(false);
      resetForm();
      fetchVideos();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to add video');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this video?')) return;
    try {
      await videoService.delete(id);
      toast.success('Video deleted');
      fetchVideos();
    } catch { toast.error('Failed to delete video'); }
  };

  const resetForm = () => {
    setFormData({ title: '', description: '', category: 'Postal Rules', video_url: '', thumbnail_url: '', duration: 0, is_public: true });
    setSelectedFile(null);
    setUploadSource('youtube');
  };

  const fmt = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: '#111827', margin: 0 }}>Videos Management</h1>
          <p style={{ color: '#6b7280', fontSize: 13, margin: '4px 0 0' }}>Upload local video files or embed YouTube / Drive links</p>
        </div>
        <button onClick={() => setShowModal(true)} style={{ padding: '10px 18px', borderRadius: 12, border: 'none', background: '#C8102E', color: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 12px rgba(200,16,46,0.25)' }}>
          <Plus size={18} /> Add Video
        </button>
      </div>

      {/* Search + Filter */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search videos..." style={{ width: '100%', padding: '11px 12px 11px 40px', borderRadius: 12, border: '1.5px solid #e5e7eb', background: '#f9fafb', fontSize: 14, color: '#111827', outline: 'none', boxSizing: 'border-box' }} />
        </div>
        <select value={category} onChange={e => setCategory(e.target.value)} style={{ padding: '11px 14px', borderRadius: 12, border: '1.5px solid #e5e7eb', background: '#f9fafb', fontSize: 14, color: '#111827', outline: 'none', cursor: 'pointer' }}>
          <option value="all">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <div style={{ width: 36, height: 36, border: '3px solid #f3f4f6', borderTopColor: '#C8102E', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {filtered.map(v => {
            const isPublic = v.is_public !== false;
            return (
              <div key={v.id} style={{ background: 'white', borderRadius: 16, border: '1px solid #f0f0f0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div style={{ position: 'relative', paddingTop: '56.25%', background: '#111827' }}>
                  {v.thumbnail_url
                    ? <img src={v.thumbnail_url} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><VideoIcon size={40} color="rgba(255,255,255,0.3)" /></div>
                  }
                  {/* Public/Private Badge */}
                  <button
                    onClick={() => handleTogglePublic(v)}
                    title="Click to toggle Public / Private visibility"
                    style={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      fontSize: 10,
                      fontWeight: 800,
                      padding: '3px 8px',
                      borderRadius: 99,
                      border: 'none',
                      cursor: 'pointer',
                      background: isPublic ? 'rgba(22, 163, 74, 0.9)' : 'rgba(107, 114, 128, 0.9)',
                      color: 'white',
                      backdropFilter: 'blur(4px)',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                    }}
                  >
                    {isPublic ? '🟢 Public' : '🔒 Private'}
                  </button>

                  {!!v.duration && v.duration > 0 && <span style={{ position: 'absolute', bottom: 8, right: 8, background: 'rgba(0,0,0,0.75)', color: 'white', padding: '2px 6px', borderRadius: 4, fontSize: 11, fontWeight: 700 }}>{fmt(v.duration)}</span>}
                </div>
                <div style={{ padding: '14px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <h3 style={{ fontWeight: 700, fontSize: 14, color: '#111827', margin: 0, lineHeight: 1.4 }}>{v.title}</h3>
                  <span style={{ fontSize: 11, background: '#eff6ff', color: '#2563eb', padding: '2px 8px', borderRadius: 99, fontWeight: 600, alignSelf: 'flex-start' }}>{v.category}</span>
                  {v.description && <p style={{ fontSize: 12, color: '#6b7280', margin: 0, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any, overflow: 'hidden' }}>{v.description}</p>}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#9ca3af', marginTop: 'auto', paddingTop: 8, borderTop: '1px solid #f3f4f6' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Eye size={12} />{v.views_count} views</span>
                    <span>{formatDate(v.created_at)}</span>
                  </div>
                </div>
                <div style={{ padding: '0 16px 14px' }}>
                  <button onClick={() => handleDelete(v.id)} style={{ width: '100%', padding: '8px 0', borderRadius: 8, border: '1.5px solid #fee2e2', background: '#fff5f5', color: '#dc2626', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    <Trash2 size={13} /> Delete Video
                  </button>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && <div style={{ textAlign: 'center', padding: '48px 0', gridColumn: '1 / -1' }}><p style={{ color: '#9ca3af', fontSize: 14 }}>No videos found</p></div>}
        </div>
      )}

      {/* Add Video Modal with 3 Source Options */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: 'white', borderRadius: 20, width: '100%', maxWidth: 520, padding: 28, boxShadow: '0 20px 60px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ fontWeight: 800, fontSize: 18, color: '#111827', margin: '0 0 16px' }}>Add New Video</h3>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Video Title</label>
                <input required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="e.g. Postal Manual Volume V Rules Explained" style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1.5px solid #e5e7eb', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Category</label>
                <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1.5px solid #e5e7eb', fontSize: 13 }}>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Description</label>
                <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Brief summary of video lecture..." rows={2} style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1.5px solid #e5e7eb', fontSize: 13, outline: 'none', resize: 'none', boxSizing: 'border-box' }} />
              </div>

              {/* 3 Upload Source Selector Buttons */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#111827', marginBottom: 6 }}>Select Video Source</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => setUploadSource('youtube')}
                    style={{
                      padding: '8px 4px',
                      borderRadius: 10,
                      border: uploadSource === 'youtube' ? '2px solid #C8102E' : '1px solid #e5e7eb',
                      background: uploadSource === 'youtube' ? '#fff1f2' : '#f9fafb',
                      color: uploadSource === 'youtube' ? '#C8102E' : '#4b5563',
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 4,
                    }}
                  >
                    <Play size={14} /> YouTube
                  </button>
                  <button
                    type="button"
                    onClick={() => setUploadSource('local')}
                    style={{
                      padding: '8px 4px',
                      borderRadius: 10,
                      border: uploadSource === 'local' ? '2px solid #C8102E' : '1px solid #e5e7eb',
                      background: uploadSource === 'local' ? '#fff1f2' : '#f9fafb',
                      color: uploadSource === 'local' ? '#C8102E' : '#4b5563',
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 4,
                    }}
                  >
                    <Upload size={14} /> Local File
                  </button>
                  <button
                    type="button"
                    onClick={() => setUploadSource('gdrive')}
                    style={{
                      padding: '8px 4px',
                      borderRadius: 10,
                      border: uploadSource === 'gdrive' ? '2px solid #C8102E' : '1px solid #e5e7eb',
                      background: uploadSource === 'gdrive' ? '#fff1f2' : '#f9fafb',
                      color: uploadSource === 'gdrive' ? '#C8102E' : '#4b5563',
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 4,
                    }}
                  >
                    <Link size={14} /> Drive / Direct
                  </button>
                </div>
              </div>

              {/* Dynamic Input based on selected source */}
              {uploadSource === 'youtube' && (
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#374151', marginBottom: 4 }}>YouTube URL</label>
                  <input
                    type="url"
                    value={formData.video_url}
                    onChange={e => setFormData({ ...formData, video_url: e.target.value })}
                    placeholder="https://www.youtube.com/watch?v=..."
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1.5px solid #e5e7eb', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              )}

              {uploadSource === 'local' && (
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Upload MP4 Video File</label>
                  <input
                    type="file"
                    accept="video/mp4,video/webm,video/ogg"
                    onChange={e => {
                      if (e.target.files && e.target.files[0]) {
                        setSelectedFile(e.target.files[0]);
                      }
                    }}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 10, border: '1.5px solid #e5e7eb', fontSize: 12, background: '#f9fafb', boxSizing: 'border-box' }}
                  />
                  {selectedFile && <p style={{ fontSize: 11, color: '#16a34a', margin: '4px 0 0', fontWeight: 600 }}>Selected: {selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(1)} MB)</p>}
                </div>
              )}

              {uploadSource === 'gdrive' && (
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Google Drive or Direct Video Link</label>
                  <input
                    type="url"
                    value={formData.video_url}
                    onChange={e => setFormData({ ...formData, video_url: e.target.value })}
                    placeholder="https://drive.google.com/file/d/... or direct .mp4 link"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1.5px solid #e5e7eb', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Thumbnail Image URL</label>
                  <input type="url" value={formData.thumbnail_url} onChange={e => setFormData({ ...formData, thumbnail_url: e.target.value })} placeholder="Optional image link..." style={{ width: '100%', padding: '9px 10px', borderRadius: 8, border: '1.5px solid #e5e7eb', fontSize: 12, outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Duration (seconds)</label>
                  <input type="number" value={formData.duration} onChange={e => setFormData({ ...formData, duration: Number(e.target.value) })} placeholder="e.g. 1800" style={{ width: '100%', padding: '9px 10px', borderRadius: 8, border: '1.5px solid #e5e7eb', fontSize: 12, outline: 'none', boxSizing: 'border-box' }} />
                </div>
              </div>

              {/* Visibility Switch */}
              <div style={{ background: '#f9fafb', borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#111827' }}>Public Visibility</span>
                  <p style={{ fontSize: 11, color: '#6b7280', margin: '2px 0 0' }}>Allow all students to watch this video</p>
                </div>
                <label style={{ position: 'relative', display: 'inline-block', width: 44, height: 24, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.is_public}
                    onChange={e => setFormData({ ...formData, is_public: e.target.checked })}
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <span style={{
                    position: 'absolute', inset: 0, borderRadius: 99, transition: '0.2s',
                    background: formData.is_public ? '#16a34a' : '#d1d5db',
                  }}>
                    <span style={{
                      position: 'absolute', top: 3, left: formData.is_public ? 23 : 3, width: 18, height: 18, borderRadius: '50%', background: 'white', transition: '0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                    }} />
                  </span>
                </label>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
                <button type="button" onClick={() => { setShowModal(false); resetForm(); }} style={{ flex: 1, padding: '11px 0', borderRadius: 10, border: '1.5px solid #e5e7eb', background: 'white', color: '#374151', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={isUploading} style={{ flex: 1, padding: '11px 0', borderRadius: 10, border: 'none', background: '#C8102E', color: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer', opacity: isUploading ? 0.7 : 1 }}>{isUploading ? 'Publishing...' : 'Add Video'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
