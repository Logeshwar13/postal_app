import { supabase } from '@/supabase/client';
import type { Test, Question, TestResult } from '@/types';

export const testService = {
  async getAll() {
    const { data, error } = await supabase
      .from('tests')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Test[];
  },

  async getAllAdmin() {
    const { data, error } = await supabase
      .from('tests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Test[];
  },

  async toggleActive(id: string, is_active: boolean) {
    const { data, error } = await supabase
      .from('tests')
      .update({ is_active })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Test;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('tests')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Test;
  },

  async create(test: Omit<Test, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('tests')
      .insert(test)
      .select()
      .single();

    if (error) throw error;
    return data as Test;
  },

  async update(id: string, updates: Partial<Test>) {
    const { data, error } = await supabase
      .from('tests')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Test;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('tests')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getQuestions(testId: string) {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('test_id', testId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data as Question[];
  },

  async addQuestion(question: Omit<Question, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('questions')
      .insert(question)
      .select()
      .single();

    if (error) throw error;
    return data as Question;
  },

  async updateQuestion(id: string, updates: Partial<Question>) {
    const { data, error } = await supabase
      .from('questions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Question;
  },

  async deleteQuestion(id: string) {
    const { error } = await supabase
      .from('questions')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async submitTest(result: Omit<TestResult, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('test_results')
      .insert(result)
      .select()
      .single();

    if (error) throw error;
    return data as TestResult;
  },

  async getResults(userId: string) {
    const { data, error } = await supabase
      .from('test_results')
      .select(`
        *,
        tests (
          title,
          total_marks
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getResultById(id: string) {
    const { data, error } = await supabase
      .from('test_results')
      .select(`
        *,
        tests (
          title,
          total_marks,
          duration
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async getLeaderboard(testId: string, limit: number = 10) {
    const { data, error } = await supabase
      .from('test_results')
      .select(`
        *,
        profiles (
          full_name,
          avatar_url
        )
      `)
      .eq('test_id', testId)
      .order('score', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  },
};
