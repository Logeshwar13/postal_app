import { useState, useEffect } from 'react';
import { Search, Download, Bookmark, BookmarkCheck, Eye, Filter, FileText, File } from 'lucide-react';
import { studyMaterialService } from '@/services/studyMaterialService';
import { bookmarkService } from '@/services/bookmarkService';
import { supabase } from '@/supabase/client';
import type { StudyMaterial } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { formatFileSize, formatDate } from '@/utils/formatters';
import { STUDY_MATERIAL_CATEGORIES } from '@/constants';
import toast from 'react-hot-toast';

const categoryColors: Record<string, { bg: string; text: string }> = {
  'Mathematics': { bg: '#eff6ff', text: '#2563eb' },
  'English': { bg: '#f0fdf4', text: '#16a34a' },
  'General Knowledge': { bg: '#fefce8', text: '#ca8a04' },
  'Reasoning': { bg: '#fdf4ff', text: '#9333ea' },
  'Current Affairs': { bg: '#fff7ed', text: '#ea580c' },
  'default': { bg: '#f3f4f6', text: '#6b7280' },
};

export const StudentStudyMaterials = () => {
  const { user } = useAuth();
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [filteredMaterials, setFilteredMaterials] = useState<StudyMaterial[]>([]);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { fetchMaterials(); fetchBookmarks(); }, []);
  useEffect(() => { filterMaterials(); }, [materials, searchTerm, selectedCategory]);

  const fetchMaterials = async () => {
    try {
      const data = await studyMaterialService.getAll();
      setMaterials(data);
    } catch { toast.error('Failed to fetch materials'); }
    finally { setIsLoading(false); }
  };

  const fetchBookmarks = async () => {
    if (!user) return;
    try {
      const bookmarks = await bookmarkService.getByType(user.id, 'material');
      setBookmarkedIds(new Set(bookmarks.map(b => b.content_id)));
    } catch { /* silently fail */ }
  };

  const filterMaterials = () => {
    let filtered = materials;
    if (selectedCategory !== 'all') filtered = filtered.filter(m => m.category === selectedCategory);
    if (searchTerm) filtered = filtered.filter(m =>
      m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredMaterials(filtered);
  };

  const handleDownload = async (material: StudyMaterial) => {
    if (!user) return;
    try {
      await supabase.from('downloads').insert({ user_id: user.id, material_id: material.id });
      await studyMaterialService.incrementDownloads(material.id);
      window.open(material.file_url, '_blank');
      toast.success('Download started!');
      fetchMaterials();
    } catch { toast.error('Failed to download'); }
  };

  const handleToggleBookmark = async (materialId: string) => {
    if (!user) return;
    try {
      if (bookmarkedIds.has(materialId)) {
        await bookmarkService.remove(user.id, materialId);
        setBookmarkedIds(prev => { const s = new Set(prev); s.delete(materialId); return s; });
        toast.success('Bookmark removed');
      } else {
        await bookmarkService.add(user.id, 'material', materialId);
        setBookmarkedIds(prev => new Set(prev).add(materialId));
        toast.success('Bookmarked!');
      }
    } catch { toast.error('Failed to update bookmark'); }
  };

  const getCategoryStyle = (cat: string) => categoryColors[cat] || categoryColors['default'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Header */}
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 900, color: '#111827', margin: 0 }}>Study Materials</h1>
        <p style={{ color: '#6b7280', fontSize: 13, margin: '4px 0 0' }}>
          {materials.length} materials available — browse and download
        </p>
      </div>

      {/* Search + Filter Bar */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input
            type="text"
            placeholder="Search materials..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '11px 12px 11px 40px', borderRadius: 12, border: '1.5px solid #e5e7eb', background: '#f9fafb', fontSize: 14, color: '#111827', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Filter size={16} color="#6b7280" />
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            style={{ padding: '11px 36px 11px 14px', borderRadius: 12, border: '1.5px solid #e5e7eb', background: '#f9fafb', fontSize: 14, color: '#111827', outline: 'none', appearance: 'none', cursor: 'pointer', minWidth: 180 }}
          >
            <option value="all">All Categories</option>
            {STUDY_MATERIAL_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div style={{ width: 40, height: 40, border: '3px solid #f3f4f6', borderTopColor: '#C8102E', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* Materials Grid */}
      {!isLoading && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {filteredMaterials.map(material => {
              const catStyle = getCategoryStyle(material.category);
              const isBookmarked = bookmarkedIds.has(material.id);
              return (
                <div
                  key={material.id}
                  style={{
                    background: 'white',
                    borderRadius: 16,
                    border: '1px solid #f0f0f0',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    transition: 'box-shadow 0.2s, transform 0.2s',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.10)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
                >
                  {/* Card Top */}
                  <div style={{ padding: '18px 18px 14px', flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                        <div style={{ width: 42, height: 42, borderRadius: 10, background: catStyle.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <FileText size={20} color={catStyle.text} />
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <h3 style={{ fontWeight: 700, fontSize: 14, color: '#111827', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{material.title}</h3>
                          <span style={{ display: 'inline-block', marginTop: 4, background: catStyle.bg, color: catStyle.text, fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 99 }}>{material.category}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleToggleBookmark(material.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, borderRadius: 8, color: isBookmarked ? '#C8102E' : '#9ca3af', flexShrink: 0 }}
                        onMouseEnter={e => (e.currentTarget.style.background = '#f3f4f6')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                      >
                        {isBookmarked ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
                      </button>
                    </div>

                    {material.description && (
                      <p style={{ fontSize: 12, color: '#6b7280', margin: '0 0 10px', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any, overflow: 'hidden' }}>
                        {material.description}
                      </p>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#9ca3af', marginBottom: 6 }}>
                      <span>{formatFileSize(material.file_size)}</span>
                      <span>{material.file_type.split('/')[1]?.toUpperCase()}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#9ca3af' }}>
                      <Download size={12} />
                      <span>{material.downloads_count} downloads • {formatDate(material.created_at)}</span>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div style={{ display: 'flex', gap: 8, padding: '0 18px 18px' }}>
                    <button
                      onClick={() => window.open(material.file_url, '_blank')}
                      style={{ flex: 1, padding: '9px 0', borderRadius: 10, border: '1.5px solid #e5e7eb', background: 'white', color: '#374151', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'all 0.15s' }}
                      onMouseEnter={e => { (e.currentTarget.style.borderColor = '#C8102E'); (e.currentTarget.style.color = '#C8102E'); }}
                      onMouseLeave={e => { (e.currentTarget.style.borderColor = '#e5e7eb'); (e.currentTarget.style.color = '#374151'); }}
                    >
                      <Eye size={14} /> Preview
                    </button>
                    <button
                      onClick={() => handleDownload(material)}
                      style={{ flex: 1, padding: '9px 0', borderRadius: 10, border: 'none', background: '#C8102E', color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'background 0.15s', boxShadow: '0 2px 8px rgba(200,16,46,0.25)' }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#a00d25')}
                      onMouseLeave={e => (e.currentTarget.style.background = '#C8102E')}
                    >
                      <Download size={14} /> Download
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredMaterials.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <File size={48} color="#e5e7eb" style={{ display: 'block', margin: '0 auto 12px' }} />
              <p style={{ color: '#9ca3af', fontSize: 14, margin: 0 }}>No materials found</p>
              {searchTerm && <p style={{ color: '#9ca3af', fontSize: 12, margin: '4px 0 0' }}>Try a different search term</p>}
            </div>
          )}
        </>
      )}
    </div>
  );
};
