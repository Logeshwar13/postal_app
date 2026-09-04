import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { AuthLayout } from '@/components/layouts/AuthLayout';
import { useAuth } from '@/hooks/useAuth';
import { authService } from '@/services/authService';

interface LoginForm {
  email: string;
  password: string;
  remember: boolean;
}

const inputBase: React.CSSProperties = {
  width: '100%',
  padding: '12px 12px 12px 42px',
  borderRadius: 12,
  border: '1.5px solid #e5e7eb',
  background: '#f9fafb',
  fontSize: 14,
  color: '#111827',
  outline: 'none',
  transition: 'border-color 0.2s, box-shadow 0.2s',
  boxSizing: 'border-box',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 13,
  fontWeight: 600,
  color: '#374151',
  marginBottom: 6,
};

export const Login = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    const cleanEmail = data.email.trim().toLowerCase();
    try {
      // Authenticate directly with Supabase Auth
      const result = await signIn(cleanEmail, data.password);
      const currentUser = await authService.getCurrentUser();
      const userRole = currentUser?.role || result.user?.user_metadata?.role || 'student';
      toast.success('Welcome back!');
      navigate(userRole === 'admin' ? '/admin/dashboard' : '/student/dashboard');
    } catch (error: any) {
      console.error('Login error details:', error);
      const errMsg = error?.message || '';
      if (errMsg.includes('Invalid login credentials')) {
        toast.error('Invalid email or password. Please check your credentials or create an account.');
      } else if (errMsg.includes('Email not confirmed')) {
        toast.error('Please confirm your email address before signing in.');
      } else {
        toast.error(errMsg || 'Login failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      {/* Heading */}
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 28, fontWeight: 900, color: '#111827', margin: 0 }}>Welcome back</h2>
        <p style={{ color: '#6b7280', fontSize: 14, marginTop: 6, margin: '6px 0 0' }}>Sign in to continue your GDS preparation</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {/* Email */}
        <div>
          <label style={labelStyle}>Email Address</label>
          <div style={{ position: 'relative' }}>
            <Mail size={17} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input
              type="email"
              placeholder="your.email@example.com"
              style={{ ...inputBase, borderColor: errors.email ? '#f87171' : '#e5e7eb' }}
              {...register('email', {
                required: 'Email is required',
                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' },
              })}
            />
          </div>
          {errors.email && <p style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{errors.email.message}</p>}
        </div>

        {/* Password */}
        <div>
          <label style={labelStyle}>Password</label>
          <div style={{ position: 'relative' }}>
            <Lock size={17} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              style={{ ...inputBase, paddingRight: 44, borderColor: errors.password ? '#f87171' : '#e5e7eb' }}
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 6, message: 'Min 6 characters' },
              })}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}
            >
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
          {errors.password && <p style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{errors.password.message}</p>}
        </div>

        {/* Remember + Forgot */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: '#6b7280' }}>
            <input type="checkbox" {...register('remember')} style={{ accentColor: '#C8102E' }} />
            Remember me
          </label>
          <Link to="/forgot-password" style={{ fontSize: 13, color: '#C8102E', fontWeight: 600, textDecoration: 'none' }}>
            Forgot password?
          </Link>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          style={{
            width: '100%',
            padding: '14px',
            background: isLoading ? '#e5a0ab' : '#C8102E',
            color: 'white',
            fontWeight: 700,
            fontSize: 15,
            border: 'none',
            borderRadius: 12,
            cursor: isLoading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            boxShadow: '0 4px 14px rgba(200,16,46,0.35)',
            transition: 'background 0.2s',
          }}
        >
          {isLoading ? (
            <div style={{ width: 20, height: 20, border: '2.5px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          ) : 'Sign In →'}
        </button>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '4px 0' }}>
          <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
          <span style={{ fontSize: 12, color: '#9ca3af', fontWeight: 500 }}>New to DakShiksha?</span>
          <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
        </div>

        <Link
          to="/register"
          style={{
            display: 'block',
            width: '100%',
            padding: '13px',
            border: '2px solid #C8102E',
            color: '#C8102E',
            fontWeight: 700,
            fontSize: 14,
            borderRadius: 12,
            textAlign: 'center',
            textDecoration: 'none',
            transition: 'background 0.2s, color 0.2s',
            boxSizing: 'border-box',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#C8102E'; (e.currentTarget as HTMLAnchorElement).style.color = 'white'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'; (e.currentTarget as HTMLAnchorElement).style.color = '#C8102E'; }}
        >
          Create Free Account
        </Link>
      </form>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </AuthLayout>
  );
};
