-- ============================================================
-- DAKSHIKSHA SUPABASE ADMIN STUDENT DELETION SQL SCRIPT
-- Run this script in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)
-- ============================================================

-- 1. Create SECURITY DEFINER RPC function to delete student user & all related data
CREATE OR REPLACE FUNCTION public.delete_student_user(target_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verify the target user exists and has role 'student'
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = target_user_id AND role = 'student') THEN
    
    -- Delete all dependent student records across platform tables
    DELETE FROM public.test_results WHERE user_id = target_user_id;
    DELETE FROM public.quiz_results WHERE user_id = target_user_id;
    DELETE FROM public.downloads WHERE user_id = target_user_id;
    DELETE FROM public.video_progress WHERE user_id = target_user_id;
    DELETE FROM public.bookmarks WHERE user_id = target_user_id;
    DELETE FROM public.notifications WHERE user_id = target_user_id;
    
    -- Delete user profile record
    DELETE FROM public.profiles WHERE id = target_user_id;

    -- Delete user from auth.users if available
    BEGIN
      DELETE FROM auth.users WHERE id = target_user_id;
    EXCEPTION WHEN OTHERS THEN
      -- Log or ignore if direct delete on auth.users is restricted by schema permissions
      RAISE NOTICE 'auth.users delete skipped: %', SQLERRM;
    END;

  END IF;
END;
$$;

-- Grant execution permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.delete_student_user(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_student_user(UUID) TO anon;

-- 2. Ensure RLS Policy on public.profiles allows Admins to delete student profiles directly
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Admins can delete student profiles'
  ) THEN
    CREATE POLICY "Admins can delete student profiles"
    ON public.profiles
    FOR DELETE
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
      )
    );
  END IF;
END $$;
