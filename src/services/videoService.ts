import { supabase } from '@/supabase/client';
import type { Video, VideoProgress } from '@/types';
import { STORAGE_BUCKETS } from '@/constants';

export const videoService = {
  async getAll(category?: string) {
    let query = supabase
      .from('videos')
      .select('*')
      .order('created_at', { ascending: false });

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as Video[];
  },

  async getAllAdmin() {
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Video[];
  },

  async togglePublic(id: string, is_public: boolean) {
    const { data, error } = await supabase
      .from('videos')
      .update({ is_public })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Video;
  },

  async uploadLocalVideo(file: File) {
    const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const { error } = await supabase.storage
      .from(STORAGE_BUCKETS.VIDEOS)
      .upload(fileName, file);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from(STORAGE_BUCKETS.VIDEOS)
      .getPublicUrl(fileName);

    return publicUrl;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Video;
  },

  async create(video: Omit<Video, 'id' | 'created_at' | 'updated_at' | 'views_count'>) {
    const { data, error } = await supabase
      .from('videos')
      .insert(video)
      .select()
      .single();

    if (error) throw error;
    return data as Video;
  },

  async update(id: string, updates: Partial<Video>) {
    const { data, error } = await supabase
      .from('videos')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Video;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('videos')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async uploadVideo(file: File, path: string) {
    const { error } = await supabase.storage
      .from(STORAGE_BUCKETS.VIDEOS)
      .upload(path, file);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from(STORAGE_BUCKETS.VIDEOS)
      .getPublicUrl(path);

    return publicUrl;
  },

  async uploadThumbnail(file: File, path: string) {
    const { error } = await supabase.storage
      .from(STORAGE_BUCKETS.THUMBNAILS)
      .upload(path, file);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from(STORAGE_BUCKETS.THUMBNAILS)
      .getPublicUrl(path);

    return publicUrl;
  },

  async incrementViews(id: string) {
    const { error } = await supabase.rpc('increment_views', {
      video_id: id,
    });

    if (error) throw error;
  },

  async getProgress(userId: string, videoId: string) {
    const { data, error } = await supabase
      .from('video_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('video_id', videoId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data as VideoProgress | null;
  },

  async updateProgress(userId: string, videoId: string, progress: number, lastPosition: number) {
    const { data, error } = await supabase
      .from('video_progress')
      .upsert({
        user_id: userId,
        video_id: videoId,
        progress,
        last_position: lastPosition,
        completed: progress >= 90,
      })
      .select()
      .single();

    if (error) throw error;
    return data as VideoProgress;
  },

  async search(searchTerm: string) {
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Video[];
  },
};
