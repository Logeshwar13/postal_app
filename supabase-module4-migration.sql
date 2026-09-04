-- Module 4: Advanced Features - Database Schema
-- Add achievements, user_achievements, and certificates tables

-- Create achievements table
CREATE TABLE IF NOT EXISTS achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    requirement INTEGER NOT NULL DEFAULT 1,
    points INTEGER NOT NULL DEFAULT 0,
    icon VARCHAR(10) NOT NULL,
    badge_color VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create user_achievements table
CREATE TABLE IF NOT EXISTS user_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
    progress INTEGER NOT NULL DEFAULT 0,
    unlocked BOOLEAN NOT NULL DEFAULT FALSE,
    unlocked_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, achievement_id)
);

-- Create certificates table
CREATE TABLE IF NOT EXISTS certificates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('test_completion', 'course_completion', 'quiz_mastery')),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    score INTEGER,
    issued_date TIMESTAMP WITH TIME ZONE NOT NULL,
    certificate_id VARCHAR(100) NOT NULL UNIQUE,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement_id ON user_achievements(achievement_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_unlocked ON user_achievements(unlocked);
CREATE INDEX IF NOT EXISTS idx_certificates_user_id ON certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_certificates_type ON certificates(type);
CREATE INDEX IF NOT EXISTS idx_certificates_issued_date ON certificates(issued_date);

-- Row Level Security (RLS) Policies

-- Achievements table (public read)
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view achievements"
    ON achievements FOR SELECT
    USING (true);

CREATE POLICY "Only admins can insert achievements"
    ON achievements FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Only admins can update achievements"
    ON achievements FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- User achievements table (users can view their own)
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own achievements"
    ON user_achievements FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own achievements"
    ON user_achievements FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own achievements"
    ON user_achievements FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all user achievements"
    ON user_achievements FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Certificates table (users can view their own)
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own certificates"
    ON certificates FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own certificates"
    ON certificates FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own certificates"
    ON certificates FOR DELETE
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all certificates"
    ON certificates FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admins can insert certificates"
    ON certificates FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_achievements_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_achievements_updated_at
    BEFORE UPDATE ON user_achievements
    FOR EACH ROW
    EXECUTE FUNCTION update_user_achievements_updated_at();

-- Insert default achievements (optional - will be created by app)
-- You can run this or let the app create them
/*
INSERT INTO achievements (name, description, category, requirement, points, icon, badge_color) VALUES
('Welcome Aboard', 'Complete your first login', 'first_steps', 1, 10, '👋', 'from-blue-400 to-blue-600'),
('Knowledge Seeker', 'Download your first study material', 'first_steps', 1, 15, '📚', 'from-purple-400 to-purple-600'),
('Test Taker', 'Complete your first test', 'first_steps', 1, 20, '✍️', 'from-green-400 to-green-600'),
('Video Scholar', 'Watch your first video completely', 'first_steps', 1, 15, '🎬', 'from-orange-400 to-orange-600'),
('Test Novice', 'Complete 5 tests', 'test_master', 5, 50, '🎯', 'from-teal-400 to-teal-600'),
('Test Expert', 'Complete 10 tests', 'test_master', 10, 100, '🎓', 'from-indigo-400 to-indigo-600'),
('Test Champion', 'Complete 25 tests', 'test_master', 25, 250, '👑', 'from-yellow-400 to-yellow-600'),
('Test Legend', 'Complete 50 tests', 'test_master', 50, 500, '🏆', 'from-red-400 to-red-600'),
('Quiz Starter', 'Complete 10 quizzes', 'quiz_champion', 10, 50, '🧠', 'from-pink-400 to-pink-600'),
('Quiz Master', 'Achieve 80% accuracy in 5 quizzes', 'quiz_champion', 5, 100, '🎨', 'from-cyan-400 to-cyan-600'),
('Quiz Genius', 'Achieve 90% accuracy in 10 quizzes', 'quiz_champion', 10, 200, '💡', 'from-amber-400 to-amber-600'),
('Video Enthusiast', 'Watch 5 videos completely', 'video_learner', 5, 50, '📺', 'from-lime-400 to-lime-600'),
('Binge Watcher', 'Watch 20 videos completely', 'video_learner', 20, 150, '🎞️', 'from-emerald-400 to-emerald-600'),
('3-Day Streak', 'Login for 3 consecutive days', 'consistent_learner', 3, 30, '🔥', 'from-rose-400 to-rose-600'),
('Week Warrior', 'Login for 7 consecutive days', 'consistent_learner', 7, 70, '⚡', 'from-violet-400 to-violet-600'),
('Month Master', 'Login for 30 consecutive days', 'consistent_learner', 30, 300, '🌟', 'from-fuchsia-400 to-fuchsia-600'),
('First Perfect', 'Score 100% in a test', 'perfect_score', 1, 100, '💯', 'from-sky-400 to-sky-600'),
('Perfectionist', 'Score 100% in 5 tests', 'perfect_score', 5, 500, '⭐', 'from-gold-400 to-gold-600')
ON CONFLICT DO NOTHING;
*/

-- Grant permissions
GRANT SELECT ON achievements TO authenticated;
GRANT ALL ON user_achievements TO authenticated;
GRANT ALL ON certificates TO authenticated;

-- Comments for documentation
COMMENT ON TABLE achievements IS 'Stores all available achievements in the system';
COMMENT ON TABLE user_achievements IS 'Tracks user progress and unlocked achievements';
COMMENT ON TABLE certificates IS 'Stores earned certificates for users';
COMMENT ON COLUMN certificates.type IS 'Type of certificate: test_completion, course_completion, or quiz_mastery';
COMMENT ON COLUMN certificates.certificate_id IS 'Unique certificate identifier for verification';


-- Recent searches table for Global Search feature
CREATE TABLE IF NOT EXISTS recent_searches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    query VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_recent_searches_user_id ON recent_searches(user_id);
CREATE INDEX IF NOT EXISTS idx_recent_searches_created_at ON recent_searches(created_at DESC);

-- Row Level Security
ALTER TABLE recent_searches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own recent searches"
    ON recent_searches FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own searches"
    ON recent_searches FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own searches"
    ON recent_searches FOR DELETE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own searches"
    ON recent_searches FOR UPDATE
    USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON recent_searches TO authenticated;

-- Comments
COMMENT ON TABLE recent_searches IS 'Stores recent search queries for each user';
