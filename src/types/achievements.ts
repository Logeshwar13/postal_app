export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  requirement: number;
  points: number;
  icon: string;
  badge_color: string;
  created_at: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  progress: number;
  unlocked: boolean;
  unlocked_at: string | null;
  created_at: string;
  updated_at: string;
}

export type AchievementCategory = 
  | 'first_steps'
  | 'test_master'
  | 'quiz_champion'
  | 'video_learner'
  | 'consistent_learner'
  | 'perfect_score';

export interface AchievementWithProgress extends Achievement {
  progress: number;
  unlocked: boolean;
  unlocked_at: string | null;
  progress_percentage: number;
}

// Predefined achievements
export const ACHIEVEMENTS: Omit<Achievement, 'id' | 'created_at'>[] = [
  // First Steps
  {
    name: 'Welcome Aboard',
    description: 'Complete your first login',
    category: 'first_steps',
    requirement: 1,
    points: 10,
    icon: '👋',
    badge_color: 'from-blue-400 to-blue-600',
  },
  {
    name: 'Knowledge Seeker',
    description: 'Download your first study material',
    category: 'first_steps',
    requirement: 1,
    points: 15,
    icon: '📚',
    badge_color: 'from-purple-400 to-purple-600',
  },
  {
    name: 'Test Taker',
    description: 'Complete your first test',
    category: 'first_steps',
    requirement: 1,
    points: 20,
    icon: '✍️',
    badge_color: 'from-green-400 to-green-600',
  },
  {
    name: 'Video Scholar',
    description: 'Watch your first video completely',
    category: 'first_steps',
    requirement: 1,
    points: 15,
    icon: '🎬',
    badge_color: 'from-orange-400 to-orange-600',
  },

  // Test Master
  {
    name: 'Test Novice',
    description: 'Complete 5 tests',
    category: 'test_master',
    requirement: 5,
    points: 50,
    icon: '🎯',
    badge_color: 'from-teal-400 to-teal-600',
  },
  {
    name: 'Test Expert',
    description: 'Complete 10 tests',
    category: 'test_master',
    requirement: 10,
    points: 100,
    icon: '🎓',
    badge_color: 'from-indigo-400 to-indigo-600',
  },
  {
    name: 'Test Champion',
    description: 'Complete 25 tests',
    category: 'test_master',
    requirement: 25,
    points: 250,
    icon: '👑',
    badge_color: 'from-yellow-400 to-yellow-600',
  },
  {
    name: 'Test Legend',
    description: 'Complete 50 tests',
    category: 'test_master',
    requirement: 50,
    points: 500,
    icon: '🏆',
    badge_color: 'from-red-400 to-red-600',
  },

  // Quiz Champion
  {
    name: 'Quiz Starter',
    description: 'Complete 10 quizzes',
    category: 'quiz_champion',
    requirement: 10,
    points: 50,
    icon: '🧠',
    badge_color: 'from-pink-400 to-pink-600',
  },
  {
    name: 'Quiz Master',
    description: 'Achieve 80% accuracy in 5 quizzes',
    category: 'quiz_champion',
    requirement: 5,
    points: 100,
    icon: '🎨',
    badge_color: 'from-cyan-400 to-cyan-600',
  },
  {
    name: 'Quiz Genius',
    description: 'Achieve 90% accuracy in 10 quizzes',
    category: 'quiz_champion',
    requirement: 10,
    points: 200,
    icon: '💡',
    badge_color: 'from-amber-400 to-amber-600',
  },

  // Video Learner
  {
    name: 'Video Enthusiast',
    description: 'Watch 5 videos completely',
    category: 'video_learner',
    requirement: 5,
    points: 50,
    icon: '📺',
    badge_color: 'from-lime-400 to-lime-600',
  },
  {
    name: 'Binge Watcher',
    description: 'Watch 20 videos completely',
    category: 'video_learner',
    requirement: 20,
    points: 150,
    icon: '🎞️',
    badge_color: 'from-emerald-400 to-emerald-600',
  },

  // Consistent Learner
  {
    name: '3-Day Streak',
    description: 'Login for 3 consecutive days',
    category: 'consistent_learner',
    requirement: 3,
    points: 30,
    icon: '🔥',
    badge_color: 'from-rose-400 to-rose-600',
  },
  {
    name: 'Week Warrior',
    description: 'Login for 7 consecutive days',
    category: 'consistent_learner',
    requirement: 7,
    points: 70,
    icon: '⚡',
    badge_color: 'from-violet-400 to-violet-600',
  },
  {
    name: 'Month Master',
    description: 'Login for 30 consecutive days',
    category: 'consistent_learner',
    requirement: 30,
    points: 300,
    icon: '🌟',
    badge_color: 'from-fuchsia-400 to-fuchsia-600',
  },

  // Perfect Score
  {
    name: 'First Perfect',
    description: 'Score 100% in a test',
    category: 'perfect_score',
    requirement: 1,
    points: 100,
    icon: '💯',
    badge_color: 'from-sky-400 to-sky-600',
  },
  {
    name: 'Perfectionist',
    description: 'Score 100% in 5 tests',
    category: 'perfect_score',
    requirement: 5,
    points: 500,
    icon: '⭐',
    badge_color: 'from-gold-400 to-gold-600',
  },
];
