import { supabase } from '@/supabase/client';

export interface SearchResult {
  id: string;
  type: 'material' | 'video' | 'test' | 'quiz' | 'announcement';
  title: string;
  description: string;
  url: string;
  relevance: number;
  metadata?: any;
}

export const searchService = {
  async globalSearch(query: string, role: string = 'student', filters?: string[]): Promise<SearchResult[]> {
    if (!query || query.trim().length < 2) {
      return [];
    }

    const searchTerm = query.trim().toLowerCase();
    const results: SearchResult[] = [];

    // 1. Page/Feature Quick Navigation matching
    const pages = role === 'admin' ? [
      { keywords: ['dashboard', 'home', 'main', 'overview'], title: 'Admin Dashboard', description: 'Overview of platform statistics & management', url: '/admin/dashboard', type: 'page' },
      { keywords: ['material', 'study', 'pdf', 'notes', 'book'], title: 'Study Materials Management', description: 'Upload and manage study resources & PDFs', url: '/admin/materials', type: 'material' },
      { keywords: ['test', 'exam', 'mock', 'assessment'], title: 'Tests Management', description: 'Create and configure mock tests & question papers', url: '/admin/tests', type: 'test' },
      { keywords: ['quiz', 'practice', 'mcq', 'questions'], title: 'Quiz Management', description: 'Manage practice quizzes and daily questions', url: '/admin/quiz', type: 'quiz' },
      { keywords: ['video', 'lecture', 'class', 'stream'], title: 'Videos Management', description: 'Upload and organize video lectures', url: '/admin/videos', type: 'video' },
      { keywords: ['user', 'student', 'candidate', 'profile', 'account'], title: 'Users Management', description: 'View and manage student accounts and access', url: '/admin/users', type: 'page' },
      { keywords: ['announcement', 'notice', 'news', 'update'], title: 'Announcements', description: 'Publish announcements to GDS candidates', url: '/admin/announcements', type: 'announcement' },
      { keywords: ['analytics', 'report', 'chart', 'stats', 'performance'], title: 'Platform Analytics', description: 'View system usage, performance, and trends', url: '/admin/analytics', type: 'page' },
      { keywords: ['setting', 'preference', 'theme', 'config'], title: 'Admin Settings', description: 'Configure platform preferences & security', url: '/admin/settings', type: 'page' },
    ] : [
      { keywords: ['dashboard', 'home', 'main'], title: 'Student Dashboard', description: 'Your personal learning hub & quick links', url: '/student/dashboard', type: 'page' },
      { keywords: ['material', 'study', 'pdf', 'notes', 'book', 'paper'], title: 'Study Materials', description: 'Access GDS exam study guides, syllabus & notes', url: '/student/materials', type: 'material' },
      { keywords: ['test', 'exam', 'mock', 'series'], title: 'Mock Tests', description: 'Take timed mock exams with detailed analysis', url: '/student/tests', type: 'test' },
      { keywords: ['quiz', 'practice', 'daily', 'mcq'], title: 'Daily Quizzes', description: 'Practice subject-wise quizzes and track score', url: '/student/quiz', type: 'quiz' },
      { keywords: ['video', 'lecture', 'class'], title: 'Video Lectures', description: 'Watch video tutorials and recorded sessions', url: '/student/videos', type: 'video' },
      { keywords: ['leaderboard', 'rank', 'top', 'score'], title: 'Leaderboard', description: 'See top scoring candidates across GDS exams', url: '/student/leaderboard', type: 'page' },
      { keywords: ['achievement', 'badge', 'reward', 'progress'], title: 'My Achievements', description: 'View your earned badges and streak statistics', url: '/student/achievements', type: 'page' },
      { keywords: ['announcement', 'notice', 'news'], title: 'Announcements', description: 'Read latest updates and notifications', url: '/student/announcements', type: 'announcement' },
      { keywords: ['profile', 'setting', 'account'], title: 'My Profile & Settings', description: 'Manage personal details and account settings', url: '/student/profile', type: 'page' },
    ];

    pages.forEach((p) => {
      const match = p.keywords.some((kw) => kw.includes(searchTerm) || searchTerm.includes(kw));
      if (match) {
        results.push({
          id: `page-${p.url}`,
          type: p.type as any,
          title: p.title,
          description: p.description,
          url: p.url,
          relevance: this.calculateRelevance(searchTerm, p.title, p.description) + 40,
          metadata: { category: 'Page Navigation' },
        });
      }
    });

    // 2. Query Database Tables with isolated try-catch blocks
    try {
      const searches = [];

      // Study Materials
      if (!filters || filters.includes('material')) {
        searches.push(
          (async () => {
            try {
              const { data } = await supabase
                .from('study_materials')
                .select('*')
                .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
                .limit(10);
              if (data) {
                const targetUrl = role === 'admin' ? '/admin/materials' : '/student/materials';
                data.forEach((item: any) => {
                  results.push({
                    id: `mat-${item.id}`,
                    type: 'material',
                    title: item.title,
                    description: item.description || 'No description provided',
                    url: targetUrl,
                    relevance: this.calculateRelevance(searchTerm, item.title, item.description),
                    metadata: { category: item.category, fileType: item.file_type },
                  });
                });
              }
            } catch (e) {
              console.warn('Study materials search error:', e);
            }
          })()
        );
      }

      // Videos
      if (!filters || filters.includes('video')) {
        searches.push(
          (async () => {
            try {
              const { data } = await supabase
                .from('videos')
                .select('*')
                .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
                .limit(10);
              if (data) {
                const targetUrl = role === 'admin' ? '/admin/videos' : '/student/videos';
                data.forEach((item: any) => {
                  results.push({
                    id: `vid-${item.id}`,
                    type: 'video',
                    title: item.title,
                    description: item.description || 'No description provided',
                    url: targetUrl,
                    relevance: this.calculateRelevance(searchTerm, item.title, item.description),
                    metadata: { category: item.category, duration: item.duration },
                  });
                });
              }
            } catch (e) {
              console.warn('Videos search error:', e);
            }
          })()
        );
      }

      // Tests
      if (!filters || filters.includes('test')) {
        searches.push(
          (async () => {
            try {
              const { data } = await supabase
                .from('tests')
                .select('*')
                .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
                .limit(10);
              if (data) {
                const targetUrl = role === 'admin' ? '/admin/tests' : '/student/tests';
                data.forEach((item: any) => {
                  results.push({
                    id: `test-${item.id}`,
                    type: 'test',
                    title: item.title,
                    description: item.description || 'No description provided',
                    url: targetUrl,
                    relevance: this.calculateRelevance(searchTerm, item.title, item.description),
                    metadata: { totalMarks: item.total_marks },
                  });
                });
              }
            } catch (e) {
              console.warn('Tests search error:', e);
            }
          })()
        );
      }

      // Announcements
      if (!filters || filters.includes('announcement')) {
        searches.push(
          (async () => {
            try {
              const { data } = await supabase
                .from('announcements')
                .select('*')
                .or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`)
                .limit(10);
              if (data) {
                const targetUrl = role === 'admin' ? '/admin/announcements' : '/student/announcements';
                data.forEach((item: any) => {
                  results.push({
                    id: `anc-${item.id}`,
                    type: 'announcement',
                    title: item.title,
                    description: item.content || 'No content',
                    url: targetUrl,
                    relevance: this.calculateRelevance(searchTerm, item.title, item.content),
                    metadata: { type: item.type },
                  });
                });
              }
            } catch (e) {
              console.warn('Announcements search error:', e);
            }
          })()
        );
      }

      await Promise.all(searches);

      // Sort by relevance
      results.sort((a, b) => b.relevance - a.relevance);

      return results.slice(0, 15);
    } catch (error) {
      console.error('Search error:', error);
      return results;
    }
  },

  calculateRelevance(searchTerm: string, title: string, description: string): number {
    const search = searchTerm.toLowerCase();
    const titleLower = (title || '').toLowerCase();
    const descLower = (description || '').toLowerCase();

    let score = 0;

    // Exact match in title (highest score)
    if (titleLower === search) score += 100;

    // Title starts with search term
    if (titleLower.startsWith(search)) score += 50;

    // Title contains search term
    if (titleLower.includes(search)) score += 30;

    // Description contains search term
    if (descLower.includes(search)) score += 10;

    // Word boundary match bonus
    const words = search.split(' ');
    words.forEach(word => {
      if (word.length > 2) {
        const wordRegex = new RegExp(`\\b${word}\\b`, 'i');
        if (wordRegex.test(titleLower)) score += 20;
        if (wordRegex.test(descLower)) score += 5;
      }
    });

    return score;
  },

  // Save recent search
  async saveRecentSearch(userId: string, query: string) {
    try {
      // Check if already exists
      const { data: existing } = await supabase
        .from('recent_searches')
        .select('id')
        .eq('user_id', userId)
        .eq('query', query)
        .single();

      if (existing) {
        // Update timestamp
        await supabase
          .from('recent_searches')
          .update({ created_at: new Date().toISOString() })
          .eq('id', existing.id);
      } else {
        // Insert new
        await supabase
          .from('recent_searches')
          .insert({
            user_id: userId,
            query,
          });
      }

      // Keep only last 10 searches per user
      const { data: allSearches } = await supabase
        .from('recent_searches')
        .select('id')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(10, 100);

      if (allSearches && allSearches.length > 0) {
        await supabase
          .from('recent_searches')
          .delete()
          .in('id', allSearches.map(s => s.id));
      }
    } catch (error) {
      console.error('Failed to save recent search:', error);
    }
  },

  // Get recent searches
  async getRecentSearches(userId: string, limit: number = 5): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('recent_searches')
        .select('query')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return (data || []).map(item => item.query);
    } catch (error) {
      console.error('Failed to fetch recent searches:', error);
      return [];
    }
  },

  // Clear recent searches
  async clearRecentSearches(userId: string) {
    try {
      await supabase
        .from('recent_searches')
        .delete()
        .eq('user_id', userId);
    } catch (error) {
      console.error('Failed to clear recent searches:', error);
    }
  },
};
