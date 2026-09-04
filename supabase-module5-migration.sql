-- ============================================================
-- DakShiksha — Module 5: Polish & Optimization
-- SQL Migration Script
-- Run AFTER: supabase-schema.sql + supabase-module4-migration.sql
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- 1. USER SETTINGS TABLE
--    Stores per-user preferences (theme, notifications, etc.)
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS user_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
    -- Appearance
    theme TEXT NOT NULL DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
    -- Notification preferences
    email_notifications BOOLEAN NOT NULL DEFAULT TRUE,
    push_notifications BOOLEAN NOT NULL DEFAULT TRUE,
    test_reminders BOOLEAN NOT NULL DEFAULT TRUE,
    achievement_alerts BOOLEAN NOT NULL DEFAULT TRUE,
    -- Study preferences
    daily_goal_minutes INTEGER NOT NULL DEFAULT 60,
    preferred_language TEXT NOT NULL DEFAULT 'en' CHECK (preferred_language IN ('en', 'hi')),
    -- Privacy
    show_on_leaderboard BOOLEAN NOT NULL DEFAULT TRUE,
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);

-- Updated_at trigger
CREATE TRIGGER update_user_settings_updated_at
    BEFORE UPDATE ON user_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own settings"
    ON user_settings FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings"
    ON user_settings FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
    ON user_settings FOR UPDATE
    USING (auth.uid() = user_id);

-- Grant
GRANT ALL ON user_settings TO authenticated;

COMMENT ON TABLE user_settings IS 'Per-user application preferences (theme, notifications, study goals)';


-- ─────────────────────────────────────────────────────────────
-- 2. ERROR LOGS TABLE
--    Client-side error tracking (feeds ErrorBoundary reports)
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS error_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    error_message TEXT NOT NULL,
    error_stack TEXT,
    component_stack TEXT,
    page_url TEXT,
    user_agent TEXT,
    app_version TEXT DEFAULT '1.0.0',
    severity TEXT NOT NULL DEFAULT 'error' CHECK (severity IN ('warning', 'error', 'critical')),
    is_resolved BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_error_logs_user_id ON error_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_error_logs_severity ON error_logs(severity);
CREATE INDEX IF NOT EXISTS idx_error_logs_created_at ON error_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_error_logs_is_resolved ON error_logs(is_resolved);

-- RLS
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert error logs"
    ON error_logs FOR INSERT
    WITH CHECK (TRUE); -- allow anonymous too for pre-auth errors

CREATE POLICY "Admins can view all error logs"
    ON error_logs FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admins can update error logs"
    ON error_logs FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Grant
GRANT INSERT ON error_logs TO anon;
GRANT INSERT ON error_logs TO authenticated;
GRANT SELECT, UPDATE ON error_logs TO authenticated;

COMMENT ON TABLE error_logs IS 'Client-side error logs captured by ErrorBoundary and other error handlers';


-- ─────────────────────────────────────────────────────────────
-- 3. PAGE ANALYTICS TABLE
--    SEO-friendly page view tracking
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS page_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    page_path TEXT NOT NULL,
    page_title TEXT,
    referrer TEXT,
    session_id TEXT,
    time_on_page INTEGER, -- seconds
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_page_analytics_user_id ON page_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_page_analytics_page_path ON page_analytics(page_path);
CREATE INDEX IF NOT EXISTS idx_page_analytics_created_at ON page_analytics(created_at DESC);

-- RLS
ALTER TABLE page_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can insert page analytics"
    ON page_analytics FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins can view all page analytics"
    ON page_analytics FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Grant
GRANT INSERT ON page_analytics TO authenticated;
GRANT SELECT ON page_analytics TO authenticated;

COMMENT ON TABLE page_analytics IS 'Page view tracking for SEO and admin analytics dashboard';


-- ─────────────────────────────────────────────────────────────
-- 4. PERFORMANCE INDEXES (supplement Module 1-4 indexes)
--    Added for queries used by Module 5 analytics views
-- ─────────────────────────────────────────────────────────────

-- Speed up leaderboard queries (score desc)
CREATE INDEX IF NOT EXISTS idx_test_results_score_desc ON test_results(score DESC);
CREATE INDEX IF NOT EXISTS idx_quiz_results_accuracy_desc ON quiz_results(accuracy DESC);

-- Speed up recent-activity queries (created_at)
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_announcements_created_at ON announcements(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);

-- Speed up unread notification count
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(user_id, is_read);


-- ─────────────────────────────────────────────────────────────
-- 5. LEADERBOARD VIEW
--    Pre-aggregated view for fast leaderboard rendering
-- ─────────────────────────────────────────────────────────────

CREATE OR REPLACE VIEW leaderboard AS
SELECT
    p.id AS user_id,
    p.full_name,
    p.avatar_url,
    COUNT(DISTINCT tr.id)::INTEGER AS tests_completed,
    COUNT(DISTINCT qr.id)::INTEGER AS quizzes_completed,
    COALESCE(AVG(tr.score / NULLIF(tr.total_marks, 0) * 100), 0)::NUMERIC(5,2) AS avg_test_score,
    COALESCE(AVG(qr.accuracy), 0)::NUMERIC(5,2) AS avg_quiz_accuracy,
    (
        COALESCE(SUM(tr.score), 0) +
        COALESCE(SUM(qr.correct_answers), 0) * 2
    )::INTEGER AS total_points
FROM profiles p
LEFT JOIN test_results tr ON tr.user_id = p.id
LEFT JOIN quiz_results qr ON qr.user_id = p.id
WHERE p.role = 'student'
GROUP BY p.id, p.full_name, p.avatar_url
ORDER BY total_points DESC;

COMMENT ON VIEW leaderboard IS 'Pre-aggregated leaderboard scores for all students';

-- RLS on view (handled via underlying table RLS + security_invoker)
-- Students see all entries (public leaderboard), respecting user_settings.show_on_leaderboard
CREATE OR REPLACE VIEW leaderboard_public AS
SELECT l.*
FROM leaderboard l
JOIN user_settings us ON us.user_id = l.user_id
WHERE us.show_on_leaderboard = TRUE
OR NOT EXISTS (SELECT 1 FROM user_settings WHERE user_id = l.user_id); -- include users without settings row


-- ─────────────────────────────────────────────────────────────
-- 6. HELPER FUNCTION: auto-create user_settings on signup
-- ─────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION handle_new_user_settings()
RETURNS TRIGGER AS $$
BEGIN
    -- Create default settings whenever a new profile is created
    INSERT INTO user_settings (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if any
DROP TRIGGER IF EXISTS on_profile_created_create_settings ON profiles;

-- Attach trigger
CREATE TRIGGER on_profile_created_create_settings
    AFTER INSERT ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user_settings();

COMMENT ON FUNCTION handle_new_user_settings IS 'Auto-creates default user_settings row when a new student/admin profile is created';


-- ─────────────────────────────────────────────────────────────
-- 7. SEED: default settings for existing users
--    (Run once to backfill settings for pre-existing profiles)
-- ─────────────────────────────────────────────────────────────

INSERT INTO user_settings (user_id)
SELECT id FROM profiles
ON CONFLICT (user_id) DO NOTHING;


-- ─────────────────────────────────────────────────────────────
-- END OF MODULE 5 MIGRATION
-- ─────────────────────────────────────────────────────────────
