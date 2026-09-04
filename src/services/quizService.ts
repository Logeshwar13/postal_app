import { supabase } from '@/supabase/client';
import type { QuizCategory, QuizQuestion, QuizResult } from '@/types';

export const quizService = {
  async getCategories() {
    const { data, error } = await supabase
      .from('quiz_categories')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return data as QuizCategory[];
  },

  async getCategoriesAdmin() {
    const { data, error } = await supabase
      .from('quiz_categories')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return data as QuizCategory[];
  },

  async togglePublic(id: string, is_public: boolean) {
    const { data, error } = await supabase
      .from('quiz_categories')
      .update({ is_public })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as QuizCategory;
  },

  async getCategoryById(id: string) {
    const { data, error } = await supabase
      .from('quiz_categories')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as QuizCategory;
  },

  async getQuestions(categoryId: string, limit?: number) {
    let query = supabase
      .from('quiz_questions')
      .select('*')
      .eq('category_id', categoryId)
      .order('created_at', { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as QuizQuestion[];
  },

  async getRandomQuestions(categoryId: string, count: number) {
    const { data, error } = await supabase
      .rpc('get_random_quiz_questions', {
        cat_id: categoryId,
        question_count: count,
      });

    if (error) throw error;
    return data as QuizQuestion[];
  },

  async addQuestion(question: Omit<QuizQuestion, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('quiz_questions')
      .insert(question)
      .select()
      .single();

    if (error) throw error;
    return data as QuizQuestion;
  },

  async updateQuestion(id: string, updates: Partial<QuizQuestion>) {
    const { data, error } = await supabase
      .from('quiz_questions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as QuizQuestion;
  },

  async deleteQuestion(id: string) {
    const { error } = await supabase
      .from('quiz_questions')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async submitQuiz(result: Omit<QuizResult, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('quiz_results')
      .insert(result)
      .select()
      .single();

    if (error) throw error;
    return data as QuizResult;
  },

  async getResults(userId: string, categoryId?: string) {
    let query = supabase
      .from('quiz_results')
      .select(`
        *,
        quiz_categories (
          name
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getLeaderboard(categoryId: string, limit: number = 10) {
    const { data, error } = await supabase
      .from('quiz_results')
      .select(`
        *,
        profiles (
          full_name,
          avatar_url
        )
      `)
      .eq('category_id', categoryId)
      .order('score', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  },

  async getUserStats(userId: string) {
    const { data, error } = await supabase
      .from('quiz_results')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;

    const totalAttempts = data.length;
    const totalCorrect = data.reduce((sum, r) => sum + r.correct_answers, 0);
    const totalQuestions = data.reduce((sum, r) => sum + r.total_questions, 0);
    const averageAccuracy = totalQuestions > 0
      ? (totalCorrect / totalQuestions) * 100
      : 0;

    return {
      totalAttempts,
      totalCorrect,
      totalQuestions,
      averageAccuracy,
    };
  },
};
