import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { AuthLayout } from '@/components/layouts/AuthLayout';
import { useAuth } from '@/hooks/useAuth';

interface ForgotPasswordForm {
  email: string;
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

export const ForgotPassword = () => {
  const { resetPassword } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { register, handleSubmit, getValues, formState: { errors } } = useForm<ForgotPasswordForm>();

  const onSubmit = async (data: ForgotPasswordForm) => {
    setIsLoading(true);
    try {
      await resetPassword(data.email);
      setEmailSent(true);
      toast.success('Reset link sent! Check your inbox.');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send reset email.');
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <AuthLayout>
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
          <div style={{ width: 72, height: 72, background: '#dcfce7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle size={36} color="#22c55e" />
          </div>
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 900, color: '#111827', margin: '0 0 8px' }}>Check your inbox!</h2>
            <p style={{ color: '#6b7280', fontSize: 14, margin: 0 }}>
              We sent a reset link to<br />
              <strong style={{ color: '#374151' }}>{getValues('email')}</strong>
            </p>
          </div>

          <div style={{ background: '#eff6ff', borderRadius: 12, padding: '14px 16px', textAlign: 'left', width: '100%', boxSizing: 'border-box' }}>
            <p style={{ color: '#1d4ed8', fontSize: 13, fontWeight: 600, margin: '0 0 6px' }}>Didn't receive it?</p>
            <ul style={{ color: '#3b82f6', fontSize: 12, margin: 0, paddingLeft: 16 }}>
              <li>Check your spam / junk folder</li>
              <li>Wait up to 2 minutes</li>
              <li>Make sure the email is correct</li>
            </ul>
          </div>

          <Link
            to="/login"
            style={{
              display: 'block',
              width: '100%',
              padding: '13px',
              background: '#C8102E',
              color: 'white',
              fontWeight: 700,
              fontSize: 14,
              borderRadius: 12,
              textAlign: 'center',
              textDecoration: 'none',
              boxSizing: 'border-box',
              boxShadow: '0 4px 14px rgba(200,16,46,0.3)',
            }}
          >
            Back to Sign In
          </Link>

          <button
            onClick={() => setEmailSent(false)}
            style={{ background: 'none', border: 'none', color: '#9ca3af', fontSize: 13, cursor: 'pointer' }}
          >
            Try a different email
          </button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 28, fontWeight: 900, color: '#111827', margin: 0 }}>Forgot password?</h2>
        <p style={{ color: '#6b7280', fontSize: 14, margin: '6px 0 0' }}>Enter your email and we'll send you a reset link</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Email Address</label>
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
          }}
        >
          {isLoading ? (
            <div style={{ width: 20, height: 20, border: '2.5px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          ) : 'Send Reset Link →'}
        </button>

        <Link
          to="/login"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 13, color: '#6b7280', textDecoration: 'none', fontWeight: 500 }}
        >
          <ArrowLeft size={14} /> Back to Sign In
        </Link>
      </form>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </AuthLayout>
  );
};
