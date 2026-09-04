import { supabase } from '@/supabase/client';
import type { Announcement } from '@/types';

export const announcementService = {
  async getAll() {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Announcement[];
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Announcement;
  },

  async create(announcement: Omit<Announcement, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('announcements')
      .insert(announcement)
      .select()
      .single();

    if (error) throw error;
    return data as Announcement;
  },

  async update(id: string, updates: Partial<Announcement>) {
    const { data, error } = await supabase
      .from('announcements')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Announcement;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('announcements')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getLatest(limit: number = 5) {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data as Announcement[];
  },
};
