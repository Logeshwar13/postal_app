import { supabase } from '@/supabase/client';
import type { User } from '@/types';

export const authService = {
  async signUp(email: string, password: string, fullName: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) throw error;

    if (data.user) {
      // Try to insert profile — may fail if email confirmation is required (RLS)
      // The DB trigger in module5 migration handles this as a fallback
      const { error: profileError } = await supabase.from('profiles').insert({
        id: data.user.id,
        email: data.user.email!,
        full_name: fullName,
        role: 'student',
      });
      if (profileError) {
        console.warn('Profile insert pending email confirmation:', profileError.message);
      }
    }

    return data;
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) throw error;
  },

  async updatePassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;
  },

  async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    // Use maybeSingle() instead of single() — returns null (not 406) if no row found
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (error) {
      console.warn('Profile fetch error:', error.message);
      return null;
    }

    // Profile row doesn't exist yet (e.g. email not confirmed) — return minimal user from auth metadata
    if (!profile) {
      return {
        id: user.id,
        email: user.email!,
        full_name: user.user_metadata?.full_name || '',
        role: user.user_metadata?.role || 'student',
        avatar_url: null,
        phone: null,
        address: null,
        created_at: user.created_at,
        updated_at: user.created_at,
      } as User;
    }

    return profile;
  },

  async updateProfile(userId: string, updates: Partial<User>) {
    // 1. Sync Supabase Auth metadata so Display Name in Auth Users tab updates immediately
    if (updates.full_name || updates.phone) {
      await supabase.auth.updateUser({
        data: {
          ...(updates.full_name ? { full_name: updates.full_name } : {}),
          ...(updates.phone ? { phone: updates.phone } : {}),
        },
      }).catch(err => console.warn('Auth metadata update note:', err.message));
    }

    // 2. Try PATCH update on public.profiles table (uses RLS UPDATE policy)
    const { data: updated } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .maybeSingle();

    if (updated) return updated;

    // 3. If profile row doesn't exist in public.profiles yet, try upsert safely
    try {
      const { data: upserted } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .select()
        .maybeSingle();

      if (upserted) return upserted;
    } catch (err: any) {
      console.warn('Profiles table upsert pending RLS policy setup:', err?.message || err);
    }

    return { id: userId, ...updates } as User;
  },

  onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const user = await this.getCurrentUser();
        callback(user);
      } else {
        callback(null);
      }
    });
  },
};
