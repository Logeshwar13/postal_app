import { useState, useEffect } from 'react';
import { Search, UserCheck, UserX, Calendar, Award, Users, Shield } from 'lucide-react';
import { supabase } from '@/supabase/client';
import { formatDate } from '@/utils/formatters';
import toast from 'react-hot-toast';

interface UserData {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  address: string | null;
  role: 'admin' | 'student';
  avatar_url: string | null;
  created_at: string;
}

export const AdminUsers = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [filtered, setFiltered] = useState<UserData[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ totalUsers: 0, totalStudents: 0, totalAdmins: 0, newThisMonth: 0 });

  useEffect(() => { fetchUsers(); }, []);
  useEffect(() => {
    let f = users;
    if (roleFilter !== 'all') f = f.filter(u => u.role === roleFilter);
    if (search) f = f.filter(u => u.email.toLowerCase().includes(search.toLowerCase()) || u.full_name?.toLowerCase().includes(search.toLowerCase()));
    setFiltered(f);
    const firstDay = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    setStats({ totalUsers: users.length, totalStudents: users.filter(u => u.role === 'student').length, totalAdmins: users.filter(u => u.role === 'admin').length, newThisMonth: users.filter(u => new Date(u.created_at) >= firstDay).length });
  }, [users, search, roleFilter]);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setUsers(data || []);
    } catch { toast.error('Failed to fetch users'); }
    finally { setIsLoading(false); }
  };

  const handleToggleRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'student' : 'admin';
    if (!confirm(`Change role to ${newRole}?`)) return;
    try {
      const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
      if (error) throw error;
      toast.success(`Role updated to ${newRole}`);
      fetchUsers();
    } catch { toast.error('Failed to update role'); }
  };

  const statItems = [
    { label: 'Total Users', value: stats.totalUsers, icon: <Users size={20} />, color: '#3b82f6', bg: '#eff6ff' },
    { label: 'Students', value: stats.totalStudents, icon: <Award size={20} />, color: '#10b981', bg: '#ecfdf5' },
    { label: 'Admins', value: stats.totalAdmins, icon: <Shield size={20} />, color: '#8b5cf6', bg: '#f5f3ff' },
    { label: 'New This Month', value: stats.newThisMonth, icon: <Calendar size={20} />, color: '#f59e0b', bg: '#fffbeb' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Header */}
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 900, color: '#111827', margin: 0 }}>Users Management</h1>
        <p style={{ color: '#6b7280', fontSize: 13, margin: '4px 0 0' }}>Manage all platform users and roles</p>
      </div>

      {/* Stat Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
        {statItems.map(({ label, value, icon, color, bg }) => (
          <div key={label} style={{ background: bg, borderRadius: 14, padding: '16px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ color, flexShrink: 0 }}>{icon}</div>
            <div>
              <p style={{ fontSize: 22, fontWeight: 900, color, margin: 0, lineHeight: 1 }}>{value}</p>
              <p style={{ fontSize: 11, color: '#9ca3af', margin: '3px 0 0' }}>{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search + Filter */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..." style={{ width: '100%', padding: '11px 12px 11px 40px', borderRadius: 12, border: '1.5px solid #e5e7eb', background: '#f9fafb', fontSize: 14, color: '#111827', outline: 'none', boxSizing: 'border-box' }} />
        </div>
        <div style={{ display: 'flex', background: '#f3f4f6', borderRadius: 10, padding: 4, gap: 2 }}>
          {[{ val: 'all', label: 'All' }, { val: 'student', label: 'Students' }, { val: 'admin', label: 'Admins' }].map(({ val, label }) => (
            <button key={val} onClick={() => setRoleFilter(val)}
              style={{ padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, background: roleFilter === val ? 'white' : 'transparent', color: roleFilter === val ? '#111827' : '#6b7280', boxShadow: roleFilter === val ? '0 1px 4px rgba(0,0,0,0.1)' : 'none', transition: 'all 0.15s' }}
            >{label}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f0f0f0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <div style={{ width: 36, height: 36, border: '3px solid #f3f4f6', borderTopColor: '#C8102E', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f9fafb' }}>
                  {['User', 'Contact', 'Role', 'Joined', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((u, i) => (
                  <tr key={u.id} style={{ borderTop: '1px solid #f9fafb', background: i % 2 === 0 ? 'white' : '#fafafa' }}>
                    {/* User */}
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg, #C8102E, #E6324B)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 14, fontWeight: 700, flexShrink: 0, overflow: 'hidden' }}>
                          {u.avatar_url ? <img src={u.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (u.full_name?.[0] || u.email[0]).toUpperCase()}
                        </div>
                        <div>
                          <p style={{ fontWeight: 700, fontSize: 14, color: '#111827', margin: 0 }}>{u.full_name || 'N/A'}</p>
                          <p style={{ fontSize: 12, color: '#9ca3af', margin: '1px 0 0' }}>{u.email}</p>
                        </div>
                      </div>
                    </td>
                    {/* Contact */}
                    <td style={{ padding: '14px 20px' }}>
                      <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>{u.phone || '—'}</p>
                      {u.address && <p style={{ fontSize: 11, color: '#9ca3af', margin: '2px 0 0', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.address}</p>}
                    </td>
                    {/* Role */}
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{ background: u.role === 'admin' ? '#f5f3ff' : '#ecfdf5', color: u.role === 'admin' ? '#7c3aed' : '#16a34a', fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 99 }}>
                        {u.role === 'admin' ? 'Admin' : 'Student'}
                      </span>
                    </td>
                    {/* Joined */}
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#9ca3af' }}>
                        <Calendar size={13} />{formatDate(u.created_at)}
                      </div>
                    </td>
                    {/* Actions */}
                    <td style={{ padding: '14px 20px' }}>
                      <button onClick={() => handleToggleRole(u.id, u.role)}
                        style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', borderRadius: 8, border: '1.5px solid #e5e7eb', background: 'white', color: '#374151', fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap' }}
                        onMouseEnter={e => { (e.currentTarget.style.borderColor = '#C8102E'); (e.currentTarget.style.color = '#C8102E'); }}
                        onMouseLeave={e => { (e.currentTarget.style.borderColor = '#e5e7eb'); (e.currentTarget.style.color = '#374151'); }}
                      >
                        {u.role === 'admin' ? <><UserX size={13} />Remove Admin</> : <><UserCheck size={13} />Make Admin</>}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <div style={{ textAlign: 'center', padding: '48px 0' }}><p style={{ color: '#9ca3af', fontSize: 14 }}>No users found</p></div>}
          </div>
        )}
        {/* Footer */}
        <div style={{ padding: '12px 20px', borderTop: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>Showing {filtered.length} of {users.length} users</p>
        </div>
      </div>
    </div>
  );
};
