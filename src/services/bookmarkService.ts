import { supabase } from '@/supabase/client';
import type { Bookmark } from '@/types';

export const bookmarkService = {
  async getAll(userId: string) {
    const { data, error } = await supabase
      .from('bookmarks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Bookmark[];
  },

  async add(userId: string, contentType: Bookmark['content_type'], contentId: string) {
    const { data, error } = await supabase
      .from('bookmarks')
      .insert({
        user_id: userId,
        content_type: contentType,
        content_id: contentId,
      })
      .select()
      .single();

    if (error) throw error;
    return data as Bookmark;
  },

  async remove(userId: string, contentId: string) {
    const { error } = await supabase
      .from('bookmarks')
      .delete()
      .eq('user_id', userId)
      .eq('content_id', contentId);

    if (error) throw error;
  },

  async isBookmarked(userId: string, contentId: string) {
    const { data, error } = await supabase
      .from('bookmarks')
      .select('id')
      .eq('user_id', userId)
      .eq('content_id', contentId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return !!data;
  },

  async getByType(userId: string, contentType: Bookmark['content_type']) {
    const { data, error } = await supabase
      .from('bookmarks')
      .select('*')
      .eq('user_id', userId)
      .eq('content_type', contentType)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Bookmark[];
  },
};
