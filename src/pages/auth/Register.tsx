import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { AuthLayout } from '@/components/layouts/AuthLayout';
import { useAuth } from '@/hooks/useAuth';

interface RegisterForm {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
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
  transition: 'border-color 0.2s',
  boxSizing: 'border-box',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 13,
  fontWeight: 600,
  color: '#374151',
  marginBottom: 6,
};

export const Register = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterForm>();
  const password = watch('password');

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    try {
      await signUp(data.email, data.password, data.fullName);
      toast.success('Account created! Check your email to verify.');
      navigate('/login');
    } catch (error: any) {
      toast.error(error.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      {/* Heading */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 28, fontWeight: 900, color: '#111827', margin: 0 }}>Create account</h2>
        <p style={{ color: '#6b7280', fontSize: 14, margin: '6px 0 0' }}>Start your GDS exam prep today — it's free</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Full Name */}
        <div>
          <label style={labelStyle}>Full Name</label>
          <div style={{ position: 'relative' }}>
            <User size={17} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input
              type="text"
              placeholder="Enter your full name"
              style={{ ...inputBase, borderColor: errors.fullName ? '#f87171' : '#e5e7eb' }}
              {...register('fullName', { required: 'Full name is required', minLength: { value: 3, message: 'Min 3 characters' } })}
            />
          </div>
          {errors.fullName && <p style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{errors.fullName.message}</p>}
        </div>

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
              placeholder="Min 8 characters"
              style={{ ...inputBase, paddingRight: 44, borderColor: errors.password ? '#f87171' : '#e5e7eb' }}
              {...register('password', { required: 'Password is required', minLength: { value: 8, message: 'Min 8 characters' } })}
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)}
              style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
          {errors.password && <p style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{errors.password.message}</p>}
        </div>

        {/* Confirm Password */}
        <div>
          <label style={labelStyle}>Confirm Password</label>
          <div style={{ position: 'relative' }}>
            <Lock size={17} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input
              type={showConfirm ? 'text' : 'password'}
              placeholder="Re-enter your password"
              style={{ ...inputBase, paddingRight: 44, borderColor: errors.confirmPassword ? '#f87171' : '#e5e7eb' }}
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (value) => value === password || 'Passwords do not match',
              })}
            />
            <button type="button" onClick={() => setShowConfirm(!showConfirm)}
              style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
              {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
          {errors.confirmPassword && <p style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{errors.confirmPassword.message}</p>}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          style={{
            marginTop: 4,
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
          ) : 'Create Free Account →'}
        </button>

        <p style={{ textAlign: 'center', fontSize: 13, color: '#6b7280', margin: '4px 0 0' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#C8102E', fontWeight: 700, textDecoration: 'none' }}>Sign In</Link>
        </p>
      </form>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </AuthLayout>
  );
};
