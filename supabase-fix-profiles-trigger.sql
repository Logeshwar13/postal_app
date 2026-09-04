-- ============================================================
-- DakShiksha — Fix: Auto-create profiles on Supabase signup
-- Run this in Supabase SQL Editor
-- This runs as SECURITY DEFINER so RLS does NOT block it
-- ============================================================

-- Function: called by trigger after new user in auth.users
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER   -- bypasses RLS, runs as postgres superuser
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student')
  )
  ON CONFLICT (id) DO UPDATE SET
    email      = EXCLUDED.email,
    full_name  = COALESCE(EXCLUDED.full_name, profiles.full_name),
    updated_at = NOW();

  RETURN NEW;
END;
$$;

-- Drop if already exists, then recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_auth_user();


-- ────────────────────────────────────────────────────────────
-- Also add admin can VIEW all profiles policy
-- (needed for admin dashboard user management)
-- ────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Admin can view all profiles" ON profiles;

CREATE POLICY "Admin can view all profiles" ON profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );


-- ────────────────────────────────────────────────────────────
-- Also add INSERT policy for profiles
-- (allows the app-level insert as a backup if trigger hasn't run)
-- ────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);


-- ────────────────────────────────────────────────────────────
-- Backfill: create profiles for any existing auth users
-- that don't yet have a profile row
-- ────────────────────────────────────────────────────────────

INSERT INTO public.profiles (id, email, full_name, role)
SELECT
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1)),
  COALESCE(u.raw_user_meta_data->>'role', 'student')
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id = u.id
)
ON CONFLICT (id) DO NOTHING;
