import { useState, useEffect } from 'react';
import { Plus, Search, Download, Trash2, Upload, FileText } from 'lucide-react';
import { studyMaterialService } from '@/services/studyMaterialService';
import type { StudyMaterial } from '@/types';
import { STUDY_MATERIAL_CATEGORIES } from '@/constants';
import { useAuth } from '@/hooks/useAuth';
import { formatFileSize, formatDate } from '@/utils/formatters';
import toast from 'react-hot-toast';

export const AdminStudyMaterials = () => {
  const { user } = useAuth();
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [filtered, setFiltered] = useState<StudyMaterial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: STUDY_MATERIAL_CATEGORIES[0] as any,
    file: null as File | null,
  });

  useEffect(() => { fetchMaterials(); }, []);
  useEffect(() => {
    let f = materials;
    if (category !== 'all') f = f.filter(m => m.category === category);
    if (search) f = f.filter(m => m.title.toLowerCase().includes(search.toLowerCase()) || m.description?.toLowerCase().includes(search.toLowerCase()));
    setFiltered(f);
  }, [materials, search, category]);

  const fetchMaterials = async () => {
    try { const data = await studyMaterialService.getAll(); setMaterials(data); }
    catch { toast.error('Failed to fetch materials'); }
    finally { setIsLoading(false); }
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.file || !user) return;
    setIsUploading(true);
    try {
      const filePath = `${Date.now()}_${formData.file.name}`;
      const fileUrl = await studyMaterialService.uploadFile(formData.file, filePath);
      await studyMaterialService.create({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        file_url: fileUrl,
        file_type: formData.file.type,
        file_size: formData.file.size,
        thumbnail_url: null,
        uploaded_by: user.id,
      });
      toast.success('Material uploaded!');
      setShowModal(false);
      resetForm();
      fetchMaterials();
    } catch { toast.error('Failed to upload material'); }
    finally { setIsUploading(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this material?')) return;
    try {
      await studyMaterialService.delete(id);
      toast.success('Material deleted');
      fetchMaterials();
    } catch { toast.error('Failed to delete material'); }
  };

  const resetForm = () => setFormData({ title: '', description: '', category: STUDY_MATERIAL_CATEGORIES[0], file: null });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: '#111827', margin: 0 }}>Study Materials</h1>
          <p style={{ color: '#6b7280', fontSize: 13, margin: '4px 0 0' }}>Upload and manage PDFs, notes, and circulars</p>
        </div>
        <button onClick={() => setShowModal(true)} style={{ padding: '10px 18px', borderRadius: 12, border: 'none', background: '#C8102E', color: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 12px rgba(200,16,46,0.25)' }}>
          <Plus size={18} /> Upload Material
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search study materials..." style={{ width: '100%', padding: '11px 12px 11px 40px', borderRadius: 12, border: '1.5px solid #e5e7eb', background: '#f9fafb', fontSize: 14, color: '#111827', outline: 'none', boxSizing: 'border-box' }} />
        </div>
        <select value={category} onChange={e => setCategory(e.target.value)} style={{ padding: '11px 14px', borderRadius: 12, border: '1.5px solid #e5e7eb', background: '#f9fafb', fontSize: 14, color: '#111827', outline: 'none', cursor: 'pointer' }}>
          <option value="all">All Categories</option>
          {STUDY_MATERIAL_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <div style={{ width: 36, height: 36, border: '3px solid #f3f4f6', borderTopColor: '#C8102E', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {filtered.map(m => (
            <div key={m.id} style={{ background: 'white', borderRadius: 16, border: '1px solid #f0f0f0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: '#fff1f2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#C8102E', flexShrink: 0 }}><FileText size={22} /></div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ fontWeight: 700, fontSize: 14, color: '#111827', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.title}</h3>
                  <span style={{ fontSize: 11, background: '#f3f4f6', color: '#4b5563', padding: '2px 8px', borderRadius: 99, fontWeight: 600, display: 'inline-block', marginTop: 4 }}>{m.category}</span>
                </div>
              </div>
              {m.description && <p style={{ fontSize: 12, color: '#6b7280', margin: 0, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any, overflow: 'hidden' }}>{m.description}</p>}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#9ca3af', paddingTop: 8, borderTop: '1px solid #f3f4f6' }}>
                <span>{formatFileSize(m.file_size)} • {formatDate(m.created_at)}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Download size={11} />{m.downloads_count}</span>
              </div>
              <button onClick={() => handleDelete(m.id)} style={{ width: '100%', padding: '8px 0', borderRadius: 8, border: '1.5px solid #fee2e2', background: '#fff5f5', color: '#dc2626', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <Trash2 size={13} /> Delete Material
              </button>
            </div>
          ))}
          {filtered.length === 0 && <div style={{ textAlign: 'center', padding: '48px 0', gridColumn: '1 / -1' }}><p style={{ color: '#9ca3af', fontSize: 14 }}>No study materials found</p></div>}
        </div>
      )}

      {/* Upload Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: 'white', borderRadius: 20, width: '100%', maxWidth: 480, padding: 28, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <h3 style={{ fontWeight: 800, fontSize: 18, color: '#111827', margin: '0 0 16px' }}>Upload Study Material</h3>
            <form onSubmit={handleFileUpload} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Material Title</label>
                <input required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="e.g. PO Guide Part 1 Notes" style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1.5px solid #e5e7eb', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Category</label>
                <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1.5px solid #e5e7eb', fontSize: 13 }}>
                  {STUDY_MATERIAL_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Description</label>
                <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Brief summary of document..." rows={2} style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1.5px solid #e5e7eb', fontSize: 13, outline: 'none', resize: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>File (PDF/DOCX/PPTX)</label>
                <div style={{ border: '2px dashed #e5e7eb', borderRadius: 12, padding: 20, textAlign: 'center', background: '#f9fafb' }}>
                  <Upload size={32} color="#9ca3af" style={{ margin: '0 auto 8px' }} />
                  <input type="file" required accept=".pdf,.doc,.docx,.ppt,.pptx" onChange={e => setFormData({ ...formData, file: e.target.files?.[0] || null })} style={{ fontSize: 12 }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
                <button type="button" onClick={() => { setShowModal(false); resetForm(); }} style={{ flex: 1, padding: '11px 0', borderRadius: 10, border: '1.5px solid #e5e7eb', background: 'white', color: '#374151', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={isUploading} style={{ flex: 1, padding: '11px 0', borderRadius: 10, border: 'none', background: '#C8102E', color: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer', opacity: isUploading ? 0.7 : 1 }}>{isUploading ? 'Uploading...' : 'Upload File'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
