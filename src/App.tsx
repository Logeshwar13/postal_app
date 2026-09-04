import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/authService';
import { Loading } from '@/components/common/Loading';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { NotFound } from '@/pages/NotFound';

// Auth Pages (not lazy — small, need fast load)
import { Login } from '@/pages/auth/Login';
import { Register } from '@/pages/auth/Register';
import { ForgotPassword } from '@/pages/auth/ForgotPassword';

// Layouts (lazy-loaded for code splitting)
const AdminLayout = lazy(() => import('@/components/layouts/AdminLayout').then(m => ({ default: m.AdminLayout })));
const StudentLayout = lazy(() => import('@/components/layouts/StudentLayout').then(m => ({ default: m.StudentLayout })));

// ─── Auth Initializer ───────────────────────────────────────────
// Runs ONCE at the app root. All other components that call
// useAuth() just read from the Zustand store — no side effects.
function AuthInitializer() {
  const { setUser, setLoading } = useAuthStore();

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        if (mounted) setUser(currentUser);
      } catch {
        if (mounted) setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    init();

    // Listen for auth state changes (login/logout in another tab, token refresh etc.)
    const { data: { subscription } } = authService.onAuthStateChange((user) => {
      if (mounted) setUser(user);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []); // ← empty deps: runs exactly once

  return null;
}

// ─── App ────────────────────────────────────────────────────────
function App() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <Loading fullScreen />;
  }

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: { background: '#1f2937', color: '#fff', borderRadius: 10, fontSize: 14 },
        }}
      />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to={user?.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'} />} />
        <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to={user?.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'} />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Admin Routes */}
        <Route
          path="/admin/*"
          element={
            isAuthenticated && user?.role === 'admin' ? (
              <ErrorBoundary>
                <Suspense fallback={<Loading fullScreen />}>
                  <AdminLayout />
                </Suspense>
              </ErrorBoundary>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* Student Routes */}
        <Route
          path="/student/*"
          element={
            isAuthenticated && user?.role === 'student' ? (
              <ErrorBoundary>
                <Suspense fallback={<Loading fullScreen />}>
                  <StudentLayout />
                </Suspense>
              </ErrorBoundary>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* Default */}
        <Route
          path="/"
          element={
            isAuthenticated
              ? <Navigate to={user?.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'} />
              : <Navigate to="/login" />
          }
        />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

// ─── Root Export ─────────────────────────────────────────────────
// AuthInitializer sits outside BrowserRouter so it runs immediately
// and independently of routing
export default function Root() {
  return (
    <>
      <AuthInitializer />
      <App />
    </>
  );
}
