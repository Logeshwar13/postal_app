import { supabase } from '@/supabase/client';

export interface LeaderboardEntry {
  rank: number;
  user_id: string;
  full_name: string;
  avatar_url: string | null;
  score: number;
  total_tests?: number;
  average_score?: number;
  accuracy?: number;
  time_taken?: number;
}

export const leaderboardService = {
  async getTestLeaderboard(testId?: string, limit: number = 50) {
    let query = supabase
      .from('test_results')
      .select(`
        user_id,
        score,
        time_taken,
        created_at,
        profiles (
          full_name,
          avatar_url
        )
      `)
      .order('score', { ascending: false })
      .order('time_taken', { ascending: true });

    if (testId) {
      query = query.eq('test_id', testId);
    }

    query = query.limit(limit);

    const { data, error } = await query;
    if (error) throw error;

    // Process and rank results
    const leaderboard: LeaderboardEntry[] = [];
    const userScores: Record<string, { totalScore: number; count: number; bestTime: number }> = {};

    data?.forEach((result: any) => {
      const userId = result.user_id;
      if (!userScores[userId]) {
        userScores[userId] = {
          totalScore: 0,
          count: 0,
          bestTime: result.time_taken || 0,
        };
      }
      userScores[userId].totalScore += result.score || 0;
      userScores[userId].count += 1;
      if (result.time_taken && result.time_taken < userScores[userId].bestTime) {
        userScores[userId].bestTime = result.time_taken;
      }
    });

    // Convert to leaderboard entries
    Object.entries(userScores).forEach(([userId, stats]) => {
      const userResult = data?.find((r: any) => r.user_id === userId);
      if (userResult && userResult.profiles) {
        const profile = Array.isArray(userResult.profiles) ? userResult.profiles[0] : userResult.profiles;
        leaderboard.push({
          rank: 0, // Will be assigned after sorting
          user_id: userId,
          full_name: profile?.full_name || 'Unknown',
          avatar_url: profile?.avatar_url,
          score: stats.totalScore,
          total_tests: stats.count,
          average_score: Math.round(stats.totalScore / stats.count),
          time_taken: stats.bestTime,
        });
      }
    });

    // Sort by average score and assign ranks
    leaderboard.sort((a, b) => {
      if ((b.average_score || 0) !== (a.average_score || 0)) {
        return (b.average_score || 0) - (a.average_score || 0);
      }
      return (a.time_taken || 0) - (b.time_taken || 0);
    });

    leaderboard.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    return leaderboard;
  },

  async getQuizLeaderboard(categoryId?: string, limit: number = 50) {
    let query = supabase
      .from('quiz_results')
      .select(`
        user_id,
        score,
        total_questions,
        correct_answers,
        accuracy,
        created_at,
        profiles (
          full_name,
          avatar_url
        )
      `)
      .order('accuracy', { ascending: false })
      .order('score', { ascending: false });

    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    query = query.limit(limit);

    const { data, error } = await query;
    if (error) throw error;

    // Process and rank results
    const leaderboard: LeaderboardEntry[] = [];
    const userStats: Record<string, { totalScore: number; totalAccuracy: number; count: number }> = {};

    data?.forEach((result: any) => {
      const userId = result.user_id;
      if (!userStats[userId]) {
        userStats[userId] = {
          totalScore: 0,
          totalAccuracy: 0,
          count: 0,
        };
      }
      userStats[userId].totalScore += result.score || 0;
      userStats[userId].totalAccuracy += result.accuracy || 0;
      userStats[userId].count += 1;
    });

    // Convert to leaderboard entries
    Object.entries(userStats).forEach(([userId, stats]) => {
      const userResult = data?.find((r: any) => r.user_id === userId);
      if (userResult && userResult.profiles) {
        const profile = Array.isArray(userResult.profiles) ? userResult.profiles[0] : userResult.profiles;
        leaderboard.push({
          rank: 0, // Will be assigned after sorting
          user_id: userId,
          full_name: profile?.full_name || 'Unknown',
          avatar_url: profile?.avatar_url,
          score: stats.totalScore,
          total_tests: stats.count,
          average_score: Math.round(stats.totalScore / stats.count),
          accuracy: Math.round(stats.totalAccuracy / stats.count),
        });
      }
    });

    // Sort by accuracy and score
    leaderboard.sort((a, b) => {
      if ((b.accuracy || 0) !== (a.accuracy || 0)) {
        return (b.accuracy || 0) - (a.accuracy || 0);
      }
      return (b.score || 0) - (a.score || 0);
    });

    leaderboard.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    return leaderboard;
  },

  async getUserRank(userId: string, type: 'test' | 'quiz' = 'test') {
    const leaderboard = type === 'test' 
      ? await this.getTestLeaderboard()
      : await this.getQuizLeaderboard();

    const userEntry = leaderboard.find((entry) => entry.user_id === userId);
    return userEntry ? userEntry.rank : null;
  },
};
