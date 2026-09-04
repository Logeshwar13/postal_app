import { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Camera, Save, Lock, Calendar, Award, FileText, Video, ClipboardCheck, Eye, EyeOff, Locate, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/authService';
import { supabase } from '@/supabase/client';
import toast from 'react-hot-toast';
import { formatDate } from '@/utils/formatters';

const Field = ({ label, value, onChange, disabled, type = 'text', icon, placeholder }: any) => (
  <div>
    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>{label}</label>
    <div style={{ position: 'relative' }}>
      {icon && <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}>{icon}</span>}
      <input type={type} value={value} onChange={onChange} disabled={disabled} placeholder={placeholder}
        style={{ width: '100%', padding: `10px 12px 10px ${icon ? '40px' : '12px'}`, borderRadius: 10, border: `1.5px solid ${disabled ? '#f3f4f6' : '#e5e7eb'}`, background: disabled ? '#fafafa' : 'white', fontSize: 14, color: '#111827', outline: 'none', boxSizing: 'border-box', opacity: disabled ? 0.7 : 1 }}
      />
    </div>
  </div>
);

export const StudentProfile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showPwModal, setShowPwModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [stats, setStats] = useState({ testsCompleted: 0, quizAttempts: 0, materialsDownloaded: 0, videosWatched: 0 });
  const [formData, setFormData] = useState({ full_name: '', phone: '', address: '' });
  const [pw, setPw] = useState({ newPassword: '', confirmPassword: '' });

  useEffect(() => {
    if (user) {
      setFormData({ full_name: user.full_name || '', phone: user.phone || '', address: user.address || '' });
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    if (!user) return;
    try {
      const [tests, quiz, downloads, videos] = await Promise.all([
        supabase.from('test_results').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('quiz_results').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('downloads').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('video_progress').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('completed', true),
      ]);
      setStats({ testsCompleted: tests.count || 0, quizAttempts: quiz.count || 0, materialsDownloaded: downloads.count || 0, videosWatched: videos.count || 0 });
    } catch { /* silent */ }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        phone: user.phone || '',
        address: user.address || '',
      });
    }
    setIsEditing(false);
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setLocating(true);
    toast.loading('Detecting location...', { id: 'geo' });

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
            { headers: { 'Accept-Language': 'en' } }
          );
          const data = await res.json();
          if (data && data.display_name) {
            setFormData((prev) => ({ ...prev, address: data.display_name }));
            toast.success('Address auto-detected!', { id: 'geo' });
          } else {
            toast.error('Could not determine location name', { id: 'geo' });
          }
        } catch (err) {
          console.error('Reverse geocoding error:', err);
          toast.error('Failed to fetch address details', { id: 'geo' });
        } finally {
          setLocating(false);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        toast.error('Location access denied or unavailable', { id: 'geo' });
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      setLoading(true);
      const updated = await authService.updateProfile(user.id, formData);
      if (updated) {
        useAuthStore.getState().setUser({ ...user, ...updated });
      }
      setIsEditing(false);
      toast.success('Profile updated!');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pw.newPassword !== pw.confirmPassword) { toast.error('Passwords do not match'); return; }
    if (pw.newPassword.length < 6) { toast.error('Minimum 6 characters'); return; }
    try { setLoading(true); await authService.updatePassword(pw.newPassword); setShowPwModal(false); setPw({ newPassword: '', confirmPassword: '' }); toast.success('Password changed!'); }
    catch { toast.error('Failed to change password'); }
    finally { setLoading(false); }
  };

  const handleAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 2 * 1024 * 1024) { toast.error('Max 2MB'); return; }
    try {
      setLoading(true);
      const path = `avatars/${user.id}-${Date.now()}.${file.name.split('.').pop()}`;
      const { error } = await supabase.storage.from('avatars').upload(path, file);
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path);
      await authService.updateProfile(user.id, { avatar_url: publicUrl });
      toast.success('Avatar updated!');
    } catch { toast.error('Upload failed'); }
    finally { setLoading(false); }
  };

  if (!user) return null;

  const initials = user.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';
  const statItems = [
    { label: 'Tests', value: stats.testsCompleted, icon: <ClipboardCheck size={18} />, color: '#3b82f6', bg: '#eff6ff' },
    { label: 'Quizzes', value: stats.quizAttempts, icon: <Award size={18} />, color: '#10b981', bg: '#ecfdf5' },
    { label: 'Downloads', value: stats.materialsDownloaded, icon: <FileText size={18} />, color: '#8b5cf6', bg: '#f5f3ff' },
    { label: 'Videos', value: stats.videosWatched, icon: <Video size={18} />, color: '#f59e0b', bg: '#fffbeb' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <style>{`
        .profile-grid { display: grid; grid-template-columns: 280px 1fr; gap: 20px; align-items: start; }
        @media (max-width: 768px) { .profile-grid { grid-template-columns: 1fr !important; } }
      `}</style>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 900, color: '#111827', margin: 0 }}>My Profile</h1>
        <p style={{ color: '#6b7280', fontSize: 13, margin: '4px 0 0' }}>Manage your personal information</p>
      </div>

      <div className="profile-grid">

        {/* Left: Profile Card */}
        <div style={{ background: 'white', borderRadius: 20, border: '1px solid #f0f0f0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
          {/* Red header bar */}
          <div style={{ height: 80, background: 'linear-gradient(135deg, #1a1a2e, #C8102E)' }} />
          <div style={{ padding: '0 24px 24px', marginTop: -40 }}>
            {/* Avatar */}
            <div style={{ position: 'relative', display: 'inline-block', marginBottom: 14 }}>
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, #C8102E, #E6324B)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900, fontSize: 28, border: '4px solid white', overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}>
                {user.avatar_url ? <img src={user.avatar_url} alt={user.full_name || ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials}
              </div>
              <label style={{ position: 'absolute', bottom: 0, right: 0, width: 26, height: 26, borderRadius: '50%', background: '#C8102E', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '2px solid white' }}>
                <Camera size={12} color="white" />
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatar} disabled={loading} />
              </label>
            </div>

            <h2 style={{ fontWeight: 800, fontSize: 17, color: '#111827', margin: '0 0 3px' }}>{user.full_name}</h2>
            <p style={{ fontSize: 12, color: '#6b7280', margin: '0 0 3px' }}>{user.email}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#9ca3af', marginBottom: 20 }}>
              <Calendar size={12} />
              <span>Joined {user.created_at ? formatDate(user.created_at) : '—'}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button onClick={() => isEditing ? handleCancel() : setIsEditing(true)} style={{ width: '100%', padding: '10px 0', borderRadius: 10, border: 'none', background: isEditing ? '#f3f4f6' : '#C8102E', color: isEditing ? '#374151' : 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                {isEditing ? <X size={14} /> : <User size={14} />}{isEditing ? 'Cancel Edit' : 'Edit Profile'}
              </button>
              <button onClick={() => setShowPwModal(true)} style={{ width: '100%', padding: '10px 0', borderRadius: 10, border: '1.5px solid #e5e7eb', background: 'white', color: '#374151', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <Lock size={14} />Change Password
              </button>
            </div>

            {/* Stats mini */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 20 }}>
              {statItems.map(({ label, value, icon, color, bg }) => (
                <div key={label} style={{ background: bg, borderRadius: 10, padding: '10px 8px', textAlign: 'center' }}>
                  <div style={{ color, display: 'flex', justifyContent: 'center', marginBottom: 4 }}>{icon}</div>
                  <p style={{ fontSize: 18, fontWeight: 800, color, margin: 0, lineHeight: 1 }}>{value}</p>
                  <p style={{ fontSize: 10, color: '#9ca3af', margin: '3px 0 0' }}>{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Form */}
        <div style={{ background: 'white', borderRadius: 20, border: '1px solid #f0f0f0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', padding: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <h3 style={{ fontWeight: 800, fontSize: 16, color: '#111827', margin: 0 }}>Personal Information</h3>
            {isEditing && <span style={{ fontSize: 11, background: '#ecfdf5', color: '#16a34a', padding: '3px 10px', borderRadius: 99, fontWeight: 600 }}>Editing</span>}
          </div>
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Field label="Full Name" value={formData.full_name} onChange={(e: any) => setFormData(p => ({ ...p, full_name: e.target.value }))} disabled={!isEditing} icon={<User size={16} />} />
            <Field label="Email" value={user.email} disabled type="email" icon={<Mail size={16} />} />
            <Field label="Phone Number" value={formData.phone} onChange={(e: any) => setFormData(p => ({ ...p, phone: e.target.value }))} disabled={!isEditing} type="tel" icon={<Phone size={16} />} placeholder="Enter your phone" />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', margin: 0 }}>Address</label>
                {isEditing && (
                  <button
                    type="button"
                    onClick={handleDetectLocation}
                    disabled={locating}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#C8102E',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: locating ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      padding: 0,
                    }}
                  >
                    <Locate size={13} style={{ animation: locating ? 'spin 1s linear infinite' : 'none' }} />
                    {locating ? 'Detecting...' : 'Auto-detect location'}
                  </button>
                )}
              </div>
              <div style={{ position: 'relative' }}>
                <MapPin size={16} style={{ position: 'absolute', left: 12, top: 12, color: '#9ca3af' }} />
                <textarea value={formData.address} onChange={e => !isEditing ? null : setFormData(p => ({ ...p, address: e.target.value }))} disabled={!isEditing} rows={3} placeholder="Enter your address"
                  style={{ width: '100%', padding: '10px 12px 10px 40px', borderRadius: 10, border: `1.5px solid ${isEditing ? '#e5e7eb' : '#f3f4f6'}`, background: isEditing ? 'white' : '#fafafa', fontSize: 14, color: '#111827', outline: 'none', boxSizing: 'border-box', resize: 'none', opacity: isEditing ? 1 : 0.7 }}
                />
              </div>
            </div>
            {isEditing && (
              <div style={{ display: 'flex', gap: 12, marginTop: 6 }}>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={loading}
                  style={{
                    flex: 1,
                    padding: '12px 20px',
                    borderRadius: 10,
                    border: '1.5px solid #e5e7eb',
                    background: 'white',
                    color: '#374151',
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                  }}
                >
                  <X size={16} />
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    flex: 2,
                    padding: '12px 24px',
                    borderRadius: 10,
                    border: 'none',
                    background: '#C8102E',
                    color: 'white',
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    justifyContent: 'center',
                    opacity: loading ? 0.7 : 1,
                  }}
                >
                  <Save size={16} />
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Password Modal */}
      {showPwModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: 'white', borderRadius: 20, width: '100%', maxWidth: 420, padding: 28, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: '#fff1f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Lock size={18} color="#C8102E" /></div>
              <h3 style={{ fontWeight: 800, fontSize: 16, color: '#111827', margin: 0 }}>Change Password</h3>
            </div>
            <form onSubmit={handleChangePw} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[{ label: 'New Password', key: 'newPassword', show: showPw, toggle: () => setShowPw(p => !p) }, { label: 'Confirm Password', key: 'confirmPassword', show: showConfirm, toggle: () => setShowConfirm(p => !p) }].map(({ label, key, show, toggle }) => (
                <div key={key}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>{label}</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                    <input type={show ? 'text' : 'password'} value={pw[key as keyof typeof pw]} onChange={e => setPw(p => ({ ...p, [key]: e.target.value }))} required style={{ width: '100%', padding: '10px 40px 10px 40px', borderRadius: 10, border: '1.5px solid #e5e7eb', fontSize: 14, color: '#111827', outline: 'none', boxSizing: 'border-box' }} placeholder="••••••••" />
                    <button type="button" onClick={toggle} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
                      {show ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              ))}
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button type="button" onClick={() => { setShowPwModal(false); setPw({ newPassword: '', confirmPassword: '' }); }} style={{ flex: 1, padding: '11px 0', borderRadius: 10, border: '1.5px solid #e5e7eb', background: 'white', color: '#374151', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={loading} style={{ flex: 1, padding: '11px 0', borderRadius: 10, border: 'none', background: '#C8102E', color: 'white', fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>{loading ? 'Saving...' : 'Change Password'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
