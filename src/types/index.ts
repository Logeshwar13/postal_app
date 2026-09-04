export interface User {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  address: string | null;
  role: 'admin' | 'student';
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface StudyMaterial {
  id: string;
  title: string;
  description: string | null;
  category: string;
  file_url: string;
  file_type: string;
  file_size: number;
  thumbnail_url: string | null;
  downloads_count: number;
  uploaded_by: string;
  created_at: string;
  updated_at: string;
}

export interface Video {
  id: string;
  title: string;
  description: string | null;
  category: string;
  video_url: string;
  thumbnail_url: string | null;
  duration: number | null;
  views_count: number;
  uploaded_by: string;
  is_public?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Test {
  id: string;
  title: string;
  description: string | null;
  duration: number;
  total_marks: number;
  passing_marks: number;
  negative_marking: boolean;
  negative_marks: number;
  created_by: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Question {
  id: string;
  test_id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: 'a' | 'b' | 'c' | 'd';
  marks: number;
  explanation: string | null;
  created_at: string;
}

export interface QuizCategory {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  is_public?: boolean;
  created_at: string;
}

export interface QuizQuestion {
  id: string;
  category_id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: 'a' | 'b' | 'c' | 'd';
  explanation: string | null;
  difficulty: 'easy' | 'medium' | 'hard';
  created_at: string;
}

export interface TestResult {
  id: string;
  test_id: string;
  user_id: string;
  score: number;
  total_marks: number;
  correct_answers: number;
  wrong_answers: number;
  unanswered: number;
  time_taken: number;
  answers: Record<string, string>;
  created_at: string;
}

export interface QuizResult {
  id: string;
  category_id: string;
  user_id: string;
  score: number;
  total_questions: number;
  correct_answers: number;
  wrong_answers: number;
  accuracy: number;
  created_at: string;
}

export interface Bookmark {
  id: string;
  user_id: string;
  content_type: 'material' | 'video' | 'test' | 'quiz';
  content_id: string;
  created_at: string;
}

export interface Download {
  id: string;
  user_id: string;
  material_id: string;
  created_at: string;
}

export interface VideoProgress {
  id: string;
  user_id: string;
  video_id: string;
  progress: number;
  last_position: number;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'material' | 'video' | 'test' | 'quiz' | 'announcement' | 'general';
  is_read: boolean;
  link: string | null;
  created_at: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'important' | 'normal' | 'info';
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  activity_type: string;
  activity_description: string;
  metadata: Record<string, any> | null;
  created_at: string;
}

export interface DashboardStats {
  totalStudents: number;
  activeToday: number;
  totalMaterials: number;
  totalVideos: number;
  totalTests: number;
  quizAttempts: number;
  downloads: number;
}

export interface StudentDashboardStats {
  completedTests: number;
  completedQuiz: number;
  downloadedPdfs: number;
  watchProgress: number;
  achievements: number;
}

export interface LeaderboardEntry {
  rank: number;
  user_id: string;
  full_name: string;
  avatar_url: string | null;
  score: number;
}

export type StudyMaterialCategory =
  | 'Postal Rules'
  | 'Department Circulars'
  | 'Exam Notes'
  | 'Mock Papers'
  | 'Previous Year Papers'
  | 'Daily Notes';

export type QuizCategoryName =
  | 'Mathematics'
  | 'Reasoning'
  | 'General Knowledge'
  | 'Current Affairs';
