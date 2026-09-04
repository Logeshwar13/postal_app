import { supabase } from '@/supabase/client';

export interface AnalyticsData {
  studyTime: {
    total: number;
    thisWeek: number;
    thisMonth: number;
    byDay: Array<{ date: string; minutes: number }>;
  };
  performance: {
    overall: number;
    tests: { average: number; total: number; passed: number; failed: number };
    quizzes: { average: number; total: number; accuracy: number };
  };
  strengths: Array<{ category: string; score: number; count: number }>;
  weaknesses: Array<{ category: string; score: number; count: number }>;
  trends: {
    improving: boolean;
    recentScores: number[];
    weeklyProgress: number;
  };
  recommendations: string[];
}

export const analyticsService = {
  async getStudentAnalytics(userId: string): Promise<AnalyticsData> {
    // Fetch all user data in parallel
    const [testResults, quizResults, videoProgress] = await Promise.all([
      supabase
        .from('test_results')
        .select(`
          *,
          tests (title, total_marks, passing_marks)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false }),

      supabase
        .from('quiz_results')
        .select(`
          *,
          quiz_categories (name)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false }),

      supabase
        .from('activity_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(100),

      supabase
        .from('video_progress')
        .select('*')
        .eq('user_id', userId)
    ]);

    // Calculate study time
    const studyTime = this.calculateStudyTime(
      testResults.data || [],
      quizResults.data || [],
      videoProgress.data || []
    );

    // Calculate performance metrics
    const performance = this.calculatePerformance(
      testResults.data || [],
      quizResults.data || []
    );

    // Identify strengths and weaknesses
    const { strengths, weaknesses } = this.analyzeStrengthsAndWeaknesses(
      testResults.data || [],
      quizResults.data || []
    );

    // Calculate trends
    const trends = this.calculateTrends(testResults.data || []);

    // Generate recommendations
    const recommendations = this.generateRecommendations(
      performance,
      strengths,
      weaknesses,
      trends
    );

    return {
      studyTime,
      performance,
      strengths,
      weaknesses,
      trends,
      recommendations,
    };
  },

  calculateStudyTime(testResults: any[], quizResults: any[], videoProgress: any[]) {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Estimate time: tests + quizzes + videos
    let totalMinutes = 0;
    let weekMinutes = 0;
    let monthMinutes = 0;

    // Tests (assume 1 minute per minute spent)
    testResults.forEach((result: any) => {
      const minutes = Math.round(result.time_taken / 60) || 0;
      totalMinutes += minutes;

      const resultDate = new Date(result.created_at);
      if (resultDate >= oneWeekAgo) weekMinutes += minutes;
      if (resultDate >= oneMonthAgo) monthMinutes += minutes;
    });

    // Quizzes (assume 10 minutes per quiz)
    quizResults.forEach((result: any) => {
      const minutes = 10;
      totalMinutes += minutes;

      const resultDate = new Date(result.created_at);
      if (resultDate >= oneWeekAgo) weekMinutes += minutes;
      if (resultDate >= oneMonthAgo) monthMinutes += minutes;
    });

    // Videos (use progress data)
    videoProgress.forEach((progress: any) => {
      const minutes = Math.round(progress.last_position / 60) || 0;
      totalMinutes += minutes;

      const progressDate = new Date(progress.updated_at);
      if (progressDate >= oneWeekAgo) weekMinutes += minutes;
      if (progressDate >= oneMonthAgo) monthMinutes += minutes;
    });

    // Calculate by day for last 7 days
    const byDay = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];

      let dayMinutes = 0;

      // Count test time for this day
      testResults.forEach((result: any) => {
        if (result.created_at.startsWith(dateStr)) {
          dayMinutes += Math.round(result.time_taken / 60) || 0;
        }
      });

      // Count quiz time for this day
      quizResults.forEach((result: any) => {
        if (result.created_at.startsWith(dateStr)) {
          dayMinutes += 10;
        }
      });

      byDay.push({ date: dateStr, minutes: dayMinutes });
    }

    return {
      total: totalMinutes,
      thisWeek: weekMinutes,
      thisMonth: monthMinutes,
      byDay,
    };
  },

  calculatePerformance(testResults: any[], quizResults: any[]) {
    // Test performance
    const testScores = testResults.map((r: any) =>
      (r.score / r.tests.total_marks) * 100
    );
    const testAverage = testScores.length > 0
      ? testScores.reduce((a, b) => a + b, 0) / testScores.length
      : 0;
    const passed = testResults.filter((r: any) =>
      (r.score / r.tests.total_marks) * 100 >= 60
    ).length;

    // Quiz performance
    const quizAccuracies = quizResults.map((r: any) => r.accuracy);
    const quizAverage = quizAccuracies.length > 0
      ? quizAccuracies.reduce((a, b) => a + b, 0) / quizAccuracies.length
      : 0;

    // Overall performance (weighted average)
    const overall = testResults.length > 0 || quizResults.length > 0
      ? (testAverage * testResults.length + quizAverage * quizResults.length) /
      (testResults.length + quizResults.length)
      : 0;

    return {
      overall: Math.round(overall),
      tests: {
        average: Math.round(testAverage),
        total: testResults.length,
        passed,
        failed: testResults.length - passed,
      },
      quizzes: {
        average: Math.round(quizAverage),
        total: quizResults.length,
        accuracy: Math.round(quizAverage),
      },
    };
  },

  analyzeStrengthsAndWeaknesses(testResults: any[], quizResults: any[]) {
    const categoryScores: Record<string, { total: number; count: number }> = {};

    // Analyze test results by category
    testResults.forEach((result: any) => {
      const category = result.tests.category || 'General';
      const score = (result.score / result.tests.total_marks) * 100;

      if (!categoryScores[category]) {
        categoryScores[category] = { total: 0, count: 0 };
      }
      categoryScores[category].total += score;
      categoryScores[category].count += 1;
    });

    // Analyze quiz results by category
    quizResults.forEach((result: any) => {
      const category = result.quiz_categories?.name || 'General';
      const score = result.accuracy;

      if (!categoryScores[category]) {
        categoryScores[category] = { total: 0, count: 0 };
      }
      categoryScores[category].total += score;
      categoryScores[category].count += 1;
    });

    // Calculate averages
    const categories = Object.entries(categoryScores)
      .map(([category, data]) => ({
        category,
        score: Math.round(data.total / data.count),
        count: data.count,
      }))
      .sort((a, b) => b.score - a.score);

    // Top 3 strengths and bottom 3 weaknesses
    const strengths = categories.slice(0, 3);
    const weaknesses = categories.slice(-3).reverse();

    return { strengths, weaknesses };
  },

  calculateTrends(testResults: any[]) {
    if (testResults.length < 2) {
      return {
        improving: true,
        recentScores: [],
        weeklyProgress: 0,
      };
    }

    // Get last 5 test scores
    const recentScores = testResults
      .slice(0, 5)
      .map((r: any) => Math.round((r.score / r.tests.total_marks) * 100))
      .reverse();

    // Check if improving (compare first half vs second half)
    const midPoint = Math.floor(recentScores.length / 2);
    const firstHalf = recentScores.slice(0, midPoint);
    const secondHalf = recentScores.slice(midPoint);

    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    const improving = secondAvg > firstAvg;

    // Calculate weekly progress (difference between this week and last week)
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const thisWeek = testResults.filter((r: any) => {
      const date = new Date(r.created_at);
      return date >= oneWeekAgo;
    });

    const lastWeek = testResults.filter((r: any) => {
      const date = new Date(r.created_at);
      return date >= twoWeeksAgo && date < oneWeekAgo;
    });

    const thisWeekAvg = thisWeek.length > 0
      ? thisWeek.reduce((sum: number, r: any) =>
        sum + (r.score / r.tests.total_marks) * 100, 0) / thisWeek.length
      : 0;

    const lastWeekAvg = lastWeek.length > 0
      ? lastWeek.reduce((sum: number, r: any) =>
        sum + (r.score / r.tests.total_marks) * 100, 0) / lastWeek.length
      : 0;

    const weeklyProgress = Math.round(thisWeekAvg - lastWeekAvg);

    return {
      improving,
      recentScores,
      weeklyProgress,
    };
  },

  generateRecommendations(
    performance: any,
    _strengths: any[],
    weaknesses: any[],
    trends: any
  ): string[] {
    const recommendations: string[] = [];

    // Performance-based recommendations
    if (performance.overall < 50) {
      recommendations.push(
        'Focus on understanding core concepts. Review study materials and watch videos.'
      );
    } else if (performance.overall < 70) {
      recommendations.push(
        'Good progress! Practice more tests to improve your scores.'
      );
    } else if (performance.overall >= 85) {
      recommendations.push(
        'Excellent performance! Keep up the great work and help others.'
      );
    }

    // Weakness-based recommendations
    if (weaknesses.length > 0 && weaknesses[0].score < 60) {
      recommendations.push(
        `Improve ${weaknesses[0].category} - your weakest area. Watch related videos and practice quizzes.`
      );
    }

    // Trend-based recommendations
    if (!trends.improving && trends.recentScores.length > 2) {
      recommendations.push(
        'Your scores are declining. Take a break and review your study strategy.'
      );
    } else if (trends.improving) {
      recommendations.push(
        `Great momentum! You've improved by ${Math.abs(trends.weeklyProgress)}% this week.`
      );
    }

    // Activity-based recommendations
    if (performance.tests.total < 5) {
      recommendations.push(
        'Take more tests to better assess your knowledge and track progress.'
      );
    }

    if (performance.quizzes.total < 10) {
      recommendations.push(
        'Practice more quizzes to reinforce your learning and identify weak areas.'
      );
    }

    return recommendations.slice(0, 5); // Max 5 recommendations
  },

  async getComparisonWithAverage(userId: string) {
    // Get user's average score
    const { data: userResults } = await supabase
      .from('test_results')
      .select('score, tests(total_marks)')
      .eq('user_id', userId);

    const userAvg = userResults && userResults.length > 0
      ? userResults.reduce((sum, r: any) =>
        sum + (r.score / r.tests.total_marks) * 100, 0) / userResults.length
      : 0;

    // Get platform average
    const { data: allResults } = await supabase
      .from('test_results')
      .select('score, tests(total_marks)');

    const platformAvg = allResults && allResults.length > 0
      ? allResults.reduce((sum, r: any) =>
        sum + (r.score / r.tests.total_marks) * 100, 0) / allResults.length
      : 0;

    return {
      userAverage: Math.round(userAvg),
      platformAverage: Math.round(platformAvg),
      difference: Math.round(userAvg - platformAvg),
      percentile: userAvg > platformAvg ?
        Math.min(95, 50 + Math.round((userAvg - platformAvg) / 2)) :
        Math.max(5, 50 - Math.round((platformAvg - userAvg) / 2)),
    };
  },
};
