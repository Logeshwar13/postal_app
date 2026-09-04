import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Megaphone, AlertCircle, Info } from 'lucide-react';
import { announcementService } from '@/services/announcementService';
import { supabase } from '@/supabase/client';
import type { Announcement } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { formatDateTime } from '@/utils/formatters';
import toast from 'react-hot-toast';

export const AdminAnnouncements = () => {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [filtered, setFiltered] = useState<Announcement[]>([]);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({ title: '', content: '', type: 'normal' as 'important' | 'normal' | 'info', is_active: true });

  useEffect(() => { fetchAnnouncements(); }, []);
  useEffect(() => {
    let f = announcements;
    if (type !== 'all') f = f.filter(a => a.type === type);
    if (search) f = f.filter(a => a.title.toLowerCase().includes(search.toLowerCase()) || a.content.toLowerCase().includes(search.toLowerCase()));
    setFiltered(f);
  }, [announcements, search, type]);

  const fetchAnnouncements = async () => {
    try {
      const { data, error } = await supabase.from('announcements').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setAnnouncements(data || []);
    } catch { toast.error('Failed to fetch announcements'); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);
    try {
      if (editingId) {
        await announcementService.update(editingId, formData);
        toast.success('Announcement updated!');
      } else {
        await announcementService.create({ ...formData, created_by: user.id });
        toast.success('Announcement created!');
      }
      setShowModal(false);
      resetForm();
      fetchAnnouncements();
    } catch { toast.error('Failed to save announcement'); }
    finally { setIsSaving(false); }
  };

  const handleEdit = (a: Announcement) => {
    setEditingId(a.id);
    setFormData({ title: a.title, content: a.content, type: a.type, is_active: a.is_active });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this announcement?')) return;
    try {
      await announcementService.delete(id);
      toast.success('Announcement deleted');
      fetchAnnouncements();
    } catch { toast.error('Failed to delete announcement'); }
  };

  const handleToggleActive = async (id: string, current: boolean) => {
    try {
      await announcementService.update(id, { is_active: !current });
      toast.success(`Announcement ${!current ? 'activated' : 'deactivated'}`);
      fetchAnnouncements();
    } catch { toast.error('Failed to update status'); }
  };

  const resetForm = () => { setFormData({ title: '', content: '', type: 'normal', is_active: true }); setEditingId(null); };

  const typeConfig = (t: string) => {
    if (t === 'important') return { bg: '#fff1f2', text: '#dc2626', icon: <AlertCircle size={18} color="#dc2626" /> };
    if (t === 'info') return { bg: '#eff6ff', text: '#2563eb', icon: <Info size={18} color="#2563eb" /> };
    return { bg: '#f3f4f6', text: '#374151', icon: <Megaphone size={18} color="#374151" /> };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: '#111827', margin: 0 }}>Announcements</h1>
          <p style={{ color: '#6b7280', fontSize: 13, margin: '4px 0 0' }}>Post official updates and notifications for students</p>
        </div>
        <button onClick={() => { resetForm(); setShowModal(true); }} style={{ padding: '10px 18px', borderRadius: 12, border: 'none', background: '#C8102E', color: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 12px rgba(200,16,46,0.25)' }}>
          <Plus size={18} /> Create Announcement
        </button>
      </div>

      {/* Search + Filter */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search announcements..." style={{ width: '100%', padding: '11px 12px 11px 40px', borderRadius: 12, border: '1.5px solid #e5e7eb', background: '#f9fafb', fontSize: 14, color: '#111827', outline: 'none', boxSizing: 'border-box' }} />
        </div>
        <select value={type} onChange={e => setType(e.target.value)} style={{ padding: '11px 14px', borderRadius: 12, border: '1.5px solid #e5e7eb', background: '#f9fafb', fontSize: 14, color: '#111827', outline: 'none', cursor: 'pointer' }}>
          <option value="all">All Types</option>
          <option value="important">Important</option>
          <option value="normal">Normal</option>
          <option value="info">Info</option>
        </select>
      </div>

      {/* List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {filtered.map(a => {
          const cfg = typeConfig(a.type);
          return (
            <div key={a.id} style={{ background: 'white', borderRadius: 16, border: '1px solid #f0f0f0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', padding: 20, opacity: a.is_active ? 1 : 0.6, display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{cfg.icon}</div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <h3 style={{ fontWeight: 800, fontSize: 16, color: '#111827', margin: 0 }}>{a.title}</h3>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: cfg.bg, color: cfg.text, textTransform: 'capitalize' }}>{a.type}</span>
                    {!a.is_active && <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 99, background: '#f3f4f6', color: '#6b7280' }}>Inactive</span>}
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => handleEdit(a)} style={{ padding: '6px 10px', borderRadius: 8, border: '1.5px solid #e5e7eb', background: 'white', color: '#374151', cursor: 'pointer' }}><Edit size={14} /></button>
                    <button onClick={() => handleDelete(a.id)} style={{ padding: '6px 10px', borderRadius: 8, border: '1.5px solid #fee2e2', background: '#fff5f5', color: '#dc2626', cursor: 'pointer' }}><Trash2 size={14} /></button>
                  </div>
                </div>
                <p style={{ fontSize: 13, color: '#4b5563', margin: 0, lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{a.content}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: '#9ca3af', paddingTop: 8, borderTop: '1px solid #f3f4f6' }}>
                  <span>Posted: {formatDateTime(a.created_at)}</span>
                  <button onClick={() => handleToggleActive(a.id, a.is_active)} style={{ padding: '4px 12px', borderRadius: 8, border: 'none', background: a.is_active ? '#f3f4f6' : '#ecfdf5', color: a.is_active ? '#6b7280' : '#16a34a', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                    {a.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && <div style={{ textAlign: 'center', padding: '48px 0' }}><p style={{ color: '#9ca3af', fontSize: 14 }}>No announcements found</p></div>}
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: 'white', borderRadius: 20, width: '100%', maxWidth: 480, padding: 28, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <h3 style={{ fontWeight: 800, fontSize: 18, color: '#111827', margin: '0 0 16px' }}>{editingId ? 'Edit Announcement' : 'Create Announcement'}</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Title</label>
                <input required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="Announcement title..." style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1.5px solid #e5e7eb', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Type</label>
                <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value as any })} style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1.5px solid #e5e7eb', fontSize: 13 }}>
                  <option value="normal">Normal</option>
                  <option value="important">Important</option>
                  <option value="info">Info</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Content</label>
                <textarea required value={formData.content} onChange={e => setFormData({ ...formData, content: e.target.value })} placeholder="Write announcement details..." rows={4} style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1.5px solid #e5e7eb', fontSize: 13, outline: 'none', resize: 'none', boxSizing: 'border-box' }} />
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                <input type="checkbox" checked={formData.is_active} onChange={e => setFormData({ ...formData, is_active: e.target.checked })} style={{ width: 18, height: 18, accentColor: '#C8102E' }} />
                Active (visible to students)
              </label>
              <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
                <button type="button" onClick={() => { setShowModal(false); resetForm(); }} style={{ flex: 1, padding: '11px 0', borderRadius: 10, border: '1.5px solid #e5e7eb', background: 'white', color: '#374151', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={isSaving} style={{ flex: 1, padding: '11px 0', borderRadius: 10, border: 'none', background: '#C8102E', color: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer', opacity: isSaving ? 0.7 : 1 }}>{isSaving ? 'Saving...' : editingId ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
