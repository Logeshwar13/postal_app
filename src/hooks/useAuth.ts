import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/authService';

// useAuth is a PURE accessor hook — NO side effects, NO useEffect
// Auth is initialized ONCE in App.tsx via initializeAuth()
export const useAuth = () => {
  const { user, isLoading, isAuthenticated, setUser, logout } = useAuthStore();

  const signIn = async (email: string, password: string) => {
    const data = await authService.signIn(email, password);
    const currentUser = await authService.getCurrentUser();
    setUser(currentUser);
    return data;
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    return await authService.signUp(email, password, fullName);
  };

  const signOut = async () => {
    await authService.signOut();
    logout();
  };

  const resetPassword = async (email: string) => {
    return await authService.resetPassword(email);
  };

  return {
    user,
    isLoading,
    isAuthenticated,
    signIn,
    signUp,
    signOut,
    resetPassword,
  };
};
