export const STUDY_MATERIAL_CATEGORIES = [
  'Postal Rules',
  'Department Circulars',
  'Exam Notes',
  'Mock Papers',
  'Previous Year Papers',
  'Daily Notes',
] as const;

export const QUIZ_CATEGORIES = {
  MATHEMATICS: 'Mathematics',
  REASONING: 'Reasoning',
  GENERAL_KNOWLEDGE: 'General Knowledge',
  CURRENT_AFFAIRS: 'Current Affairs',
} as const;

export const MATH_TOPICS = [
  'Arithmetic',
  'Percentage',
  'Ratio and Proportion',
  'Profit and Loss',
  'Average',
  'Time and Work',
  'Time, Speed and Distance',
  'Simple Interest',
  'Compound Interest',
] as const;

export const ROLES = {
  ADMIN: 'admin',
  STUDENT: 'student',
} as const;

export const FILE_TYPES = {
  PDF: 'application/pdf',
  DOCX: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  PPTX: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  IMAGE: 'image/*',
  VIDEO: 'video/*',
} as const;

export const NOTIFICATION_TYPES = {
  MATERIAL: 'material',
  VIDEO: 'video',
  TEST: 'test',
  QUIZ: 'quiz',
  ANNOUNCEMENT: 'announcement',
  GENERAL: 'general',
} as const;

export const ANNOUNCEMENT_TYPES = {
  IMPORTANT: 'important',
  NORMAL: 'normal',
  INFO: 'info',
} as const;

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  
  // Admin Routes
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_MATERIALS: '/admin/materials',
  ADMIN_TESTS: '/admin/tests',
  ADMIN_QUIZ: '/admin/quiz',
  ADMIN_VIDEOS: '/admin/videos',
  ADMIN_USERS: '/admin/users',
  ADMIN_ANNOUNCEMENTS: '/admin/announcements',
  ADMIN_ANALYTICS: '/admin/analytics',
  ADMIN_SETTINGS: '/admin/settings',
  
  // Student Routes
  STUDENT_DASHBOARD: '/student/dashboard',
  STUDENT_MATERIALS: '/student/materials',
  STUDENT_TESTS: '/student/tests',
  STUDENT_QUIZ: '/student/quiz',
  STUDENT_VIDEOS: '/student/videos',
  STUDENT_BOOKMARKS: '/student/bookmarks',
  STUDENT_PROFILE: '/student/profile',
  STUDENT_SETTINGS: '/student/settings',
} as const;

export const STORAGE_BUCKETS = {
  STUDY_MATERIALS: 'study-materials',
  VIDEOS: 'videos',
  THUMBNAILS: 'thumbnails',
  AVATARS: 'avatars',
} as const;

export const MAX_FILE_SIZE = {
  MATERIAL: 50 * 1024 * 1024, // 50MB
  VIDEO: 500 * 1024 * 1024, // 500MB
  IMAGE: 5 * 1024 * 1024, // 5MB
  AVATAR: 2 * 1024 * 1024, // 2MB
} as const;

export const ITEMS_PER_PAGE = 10;

export const COLORS = {
  PRIMARY: '#C8102E',
  PRIMARY_DARK: '#A00D25',
  PRIMARY_LIGHT: '#E6324B',
  SECONDARY: '#FFD700',
  SECONDARY_DARK: '#FFC700',
  SECONDARY_LIGHT: '#FFED4E',
} as const;
