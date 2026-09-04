import { supabase } from '@/supabase/client';
import type { Achievement, AchievementWithProgress } from '@/types/achievements';
import { ACHIEVEMENTS } from '@/types/achievements';

export const achievementService = {
  // Initialize achievements for a user
  async initializeUserAchievements(userId: string) {
    const { data: existingAchievements } = await supabase
      .from('achievements')
      .select('id');

    if (!existingAchievements || existingAchievements.length === 0) {
      // Create achievements if they don't exist
      const achievementsToCreate = ACHIEVEMENTS.map((a) => ({
        name: a.name,
        description: a.description,
        category: a.category,
        requirement: a.requirement,
        points: a.points,
        icon: a.icon,
        badge_color: a.badge_color,
      }));

      await supabase.from('achievements').insert(achievementsToCreate);
    }

    // Get all achievements
    const { data: allAchievements } = await supabase
      .from('achievements')
      .select('*');

    if (!allAchievements) return;

    // Check if user already has achievements
    const { data: userAchievements } = await supabase
      .from('user_achievements')
      .select('*')
      .eq('user_id', userId);

    if (!userAchievements || userAchievements.length === 0) {
      // Create user achievements
      const userAchievementsToCreate = allAchievements.map((a) => ({
        user_id: userId,
        achievement_id: a.id,
        progress: 0,
        unlocked: false,
      }));

      await supabase.from('user_achievements').insert(userAchievementsToCreate);
    }
  },

  // Get all achievements with user progress
  async getUserAchievements(userId: string): Promise<AchievementWithProgress[]> {
    const { data, error } = await supabase
      .from('user_achievements')
      .select(`
        *,
        achievements (*)
      `)
      .eq('user_id', userId);

    if (error) throw error;

    return (data || []).map((ua: any) => ({
      ...ua.achievements,
      progress: ua.progress,
      unlocked: ua.unlocked,
      unlocked_at: ua.unlocked_at,
      progress_percentage: Math.min(100, (ua.progress / ua.achievements.requirement) * 100),
    }));
  },

  // Update achievement progress
  async updateProgress(
    userId: string,
    category: Achievement['category'],
    progress: number
  ) {
    // Get achievement for this category
    const { data: achievement } = await supabase
      .from('achievements')
      .select('id, requirement')
      .eq('category', category)
      .order('requirement', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (!achievement) return;

    // Update user achievement
    const unlocked = progress >= achievement.requirement;

    const { data, error } = await supabase
      .from('user_achievements')
      .upsert({
        user_id: userId,
        achievement_id: achievement.id,
        progress,
        unlocked,
        unlocked_at: unlocked ? new Date().toISOString() : null,
      }, { onConflict: 'user_id,achievement_id' })
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  // Check and unlock achievements
  async checkAchievements(userId: string) {
    // Get user stats
    const [tests, quizzes, videos, downloads, logins] = await Promise.all([
      supabase.from('test_results').select('score, total_marks', { count: 'exact' }).eq('user_id', userId),
      supabase.from('quiz_results').select('accuracy', { count: 'exact' }).eq('user_id', userId),
      supabase.from('video_progress').select('*', { count: 'exact' }).eq('user_id', userId).eq('completed', true),
      supabase.from('downloads').select('*', { count: 'exact' }).eq('user_id', userId),
      supabase.from('activity_logs').select('*', { count: 'exact' }).eq('user_id', userId).eq('activity_type', 'login'),
    ]);

    // Calculate stats
    const testsCompleted = tests.count || 0;
    const perfectScores = (tests.data || []).filter((t: any) => t.score === t.total_marks).length;
    const quizzesCompleted = quizzes.count || 0;
    const highAccuracyQuizzes = (quizzes.data || []).filter((q: any) => q.accuracy >= 80).length;
    const veryHighAccuracyQuizzes = (quizzes.data || []).filter((q: any) => q.accuracy >= 90).length;
    const videosWatched = videos.count || 0;
    const materialsDownloaded = downloads.count || 0;
    const totalLogins = logins.count || 0;

    // Update achievements
    const updates = [
      // First steps
      { category: 'first_steps', progress: totalLogins > 0 ? 1 : 0 }, // Welcome
      { category: 'first_steps', progress: materialsDownloaded > 0 ? 1 : 0 }, // Knowledge Seeker
      { category: 'first_steps', progress: testsCompleted > 0 ? 1 : 0 }, // Test Taker
      { category: 'first_steps', progress: videosWatched > 0 ? 1 : 0 }, // Video Scholar

      // Test master
      { category: 'test_master', progress: testsCompleted },

      // Quiz champion
      { category: 'quiz_champion', progress: quizzesCompleted },
      { category: 'quiz_champion', progress: highAccuracyQuizzes },
      { category: 'quiz_champion', progress: veryHighAccuracyQuizzes },

      // Video learner
      { category: 'video_learner', progress: videosWatched },

      // Perfect score
      { category: 'perfect_score', progress: perfectScores },
    ];

    // Apply updates
    for (const update of updates) {
      await this.updateProgress(userId, update.category as any, update.progress);
    }

    // Get newly unlocked achievements
    const { data: newlyUnlocked } = await supabase
      .from('user_achievements')
      .select(`
        *,
        achievements (*)
      `)
      .eq('user_id', userId)
      .eq('unlocked', true)
      .gte('unlocked_at', new Date(Date.now() - 5000).toISOString()); // Last 5 seconds

    return newlyUnlocked || [];
  },

  // Get user statistics
  async getUserStats(userId: string) {
    const achievements = await this.getUserAchievements(userId);
    const unlockedCount = achievements.filter((a) => a.unlocked).length;
    const totalPoints = achievements
      .filter((a) => a.unlocked)
      .reduce((sum, a) => sum + a.points, 0);

    return {
      totalAchievements: achievements.length,
      unlockedAchievements: unlockedCount,
      totalPoints,
      progress: Math.round((unlockedCount / achievements.length) * 100),
    };
  },

  // Get achievements by category
  async getAchievementsByCategory(userId: string, category: Achievement['category']) {
    const allAchievements = await this.getUserAchievements(userId);
    return allAchievements.filter((a) => a.category === category);
  },

  // Get recently unlocked achievements
  async getRecentlyUnlocked(userId: string, limit: number = 5) {
    const { data, error } = await supabase
      .from('user_achievements')
      .select(`
        *,
        achievements (*)
      `)
      .eq('user_id', userId)
      .eq('unlocked', true)
      .order('unlocked_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return (data || []).map((ua: any) => ({
      ...ua.achievements,
      unlocked_at: ua.unlocked_at,
    }));
  },
};
