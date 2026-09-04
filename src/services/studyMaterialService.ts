import { supabase } from '@/supabase/client';
import type { StudyMaterial } from '@/types';
import { STORAGE_BUCKETS } from '@/constants';

export const studyMaterialService = {
  async getAll(category?: string) {
    let query = supabase
      .from('study_materials')
      .select('*')
      .order('created_at', { ascending: false });

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as StudyMaterial[];
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('study_materials')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as StudyMaterial;
  },

  async create(material: Omit<StudyMaterial, 'id' | 'created_at' | 'updated_at' | 'downloads_count'>) {
    const { data, error } = await supabase
      .from('study_materials')
      .insert(material)
      .select()
      .single();

    if (error) throw error;
    return data as StudyMaterial;
  },

  async update(id: string, updates: Partial<StudyMaterial>) {
    const { data, error } = await supabase
      .from('study_materials')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as StudyMaterial;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('study_materials')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async uploadFile(file: File, path: string) {
    const { error } = await supabase.storage
      .from(STORAGE_BUCKETS.STUDY_MATERIALS)
      .upload(path, file);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from(STORAGE_BUCKETS.STUDY_MATERIALS)
      .getPublicUrl(path);

    return publicUrl;
  },

  async deleteFile(path: string) {
    const { error } = await supabase.storage
      .from(STORAGE_BUCKETS.STUDY_MATERIALS)
      .remove([path]);

    if (error) throw error;
  },

  async incrementDownloads(id: string) {
    const { error } = await supabase.rpc('increment_downloads', {
      material_id: id,
    });

    if (error) throw error;
  },

  async search(searchTerm: string) {
    const { data, error } = await supabase
      .from('study_materials')
      .select('*')
      .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as StudyMaterial[];
  },
};
