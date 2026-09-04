export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          phone: string | null
          address: string | null
          role: 'admin' | 'student'
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          phone?: string | null
          address?: string | null
          role?: 'admin' | 'student'
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          phone?: string | null
          address?: string | null
          role?: 'admin' | 'student'
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      study_materials: {
        Row: {
          id: string
          title: string
          description: string | null
          category: string
          file_url: string
          file_type: string
          file_size: number
          thumbnail_url: string | null
          downloads_count: number
          uploaded_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          category: string
          file_url: string
          file_type: string
          file_size: number
          thumbnail_url?: string | null
          downloads_count?: number
          uploaded_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          category?: string
          file_url?: string
          file_type?: string
          file_size?: number
          thumbnail_url?: string | null
          downloads_count?: number
          uploaded_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      videos: {
        Row: {
          id: string
          title: string
          description: string | null
          category: string
          video_url: string
          thumbnail_url: string | null
          duration: number | null
          views_count: number
          uploaded_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          category: string
          video_url: string
          thumbnail_url?: string | null
          duration?: number | null
          views_count?: number
          uploaded_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          category?: string
          video_url?: string
          thumbnail_url?: string | null
          duration?: number | null
          views_count?: number
          uploaded_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      tests: {
        Row: {
          id: string
          title: string
          description: string | null
          duration: number
          total_marks: number
          passing_marks: number
          negative_marking: boolean
          negative_marks: number
          created_by: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          duration: number
          total_marks: number
          passing_marks: number
          negative_marking?: boolean
          negative_marks?: number
          created_by: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          duration?: number
          total_marks?: number
          passing_marks?: number
          negative_marking?: boolean
          negative_marks?: number
          created_by?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      questions: {
        Row: {
          id: string
          test_id: string
          question_text: string
          option_a: string
          option_b: string
          option_c: string
          option_d: string
          correct_answer: 'a' | 'b' | 'c' | 'd'
          marks: number
          explanation: string | null
          created_at: string
        }
        Insert: {
          id?: string
          test_id: string
          question_text: string
          option_a: string
          option_b: string
          option_c: string
          option_d: string
          correct_answer: 'a' | 'b' | 'c' | 'd'
          marks: number
          explanation?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          test_id?: string
          question_text?: string
          option_a?: string
          option_b?: string
          option_c?: string
          option_d?: string
          correct_answer?: 'a' | 'b' | 'c' | 'd'
          marks?: number
          explanation?: string | null
          created_at?: string
        }
      }
      quiz_categories: {
        Row: {
          id: string
          name: string
          description: string | null
          icon: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          icon?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          icon?: string | null
          created_at?: string
        }
      }
      quiz_questions: {
        Row: {
          id: string
          category_id: string
          question_text: string
          option_a: string
          option_b: string
          option_c: string
          option_d: string
          correct_answer: 'a' | 'b' | 'c' | 'd'
          explanation: string | null
          difficulty: 'easy' | 'medium' | 'hard'
          created_at: string
        }
        Insert: {
          id?: string
          category_id: string
          question_text: string
          option_a: string
          option_b: string
          option_c: string
          option_d: string
          correct_answer: 'a' | 'b' | 'c' | 'd'
          explanation?: string | null
          difficulty?: 'easy' | 'medium' | 'hard'
          created_at?: string
        }
        Update: {
          id?: string
          category_id?: string
          question_text?: string
          option_a?: string
          option_b?: string
          option_c?: string
          option_d?: string
          correct_answer?: 'a' | 'b' | 'c' | 'd'
          explanation?: string | null
          difficulty?: 'easy' | 'medium' | 'hard'
          created_at?: string
        }
      }
      test_results: {
        Row: {
          id: string
          test_id: string
          user_id: string
          score: number
          total_marks: number
          correct_answers: number
          wrong_answers: number
          unanswered: number
          time_taken: number
          answers: Json
          created_at: string
        }
        Insert: {
          id?: string
          test_id: string
          user_id: string
          score: number
          total_marks: number
          correct_answers: number
          wrong_answers: number
          unanswered: number
          time_taken: number
          answers: Json
          created_at?: string
        }
        Update: {
          id?: string
          test_id?: string
          user_id?: string
          score?: number
          total_marks?: number
          correct_answers?: number
          wrong_answers?: number
          unanswered?: number
          time_taken?: number
          answers?: Json
          created_at?: string
        }
      }
      quiz_results: {
        Row: {
          id: string
          category_id: string
          user_id: string
          score: number
          total_questions: number
          correct_answers: number
          wrong_answers: number
          accuracy: number
          created_at: string
        }
        Insert: {
          id?: string
          category_id: string
          user_id: string
          score: number
          total_questions: number
          correct_answers: number
          wrong_answers: number
          accuracy: number
          created_at?: string
        }
        Update: {
          id?: string
          category_id?: string
          user_id?: string
          score?: number
          total_questions?: number
          correct_answers?: number
          wrong_answers?: number
          accuracy?: number
          created_at?: string
        }
      }
      bookmarks: {
        Row: {
          id: string
          user_id: string
          content_type: 'material' | 'video' | 'test' | 'quiz'
          content_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          content_type: 'material' | 'video' | 'test' | 'quiz'
          content_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          content_type?: 'material' | 'video' | 'test' | 'quiz'
          content_id?: string
          created_at?: string
        }
      }
      downloads: {
        Row: {
          id: string
          user_id: string
          material_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          material_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          material_id?: string
          created_at?: string
        }
      }
      video_progress: {
        Row: {
          id: string
          user_id: string
          video_id: string
          progress: number
          last_position: number
          completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          video_id: string
          progress?: number
          last_position?: number
          completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          video_id?: string
          progress?: number
          last_position?: number
          completed?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          type: 'material' | 'video' | 'test' | 'quiz' | 'announcement' | 'general'
          is_read: boolean
          link: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          type: 'material' | 'video' | 'test' | 'quiz' | 'announcement' | 'general'
          is_read?: boolean
          link?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          message?: string
          type?: 'material' | 'video' | 'test' | 'quiz' | 'announcement' | 'general'
          is_read?: boolean
          link?: string | null
          created_at?: string
        }
      }
      announcements: {
        Row: {
          id: string
          title: string
          content: string
          type: 'important' | 'normal' | 'info'
          is_active: boolean
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          content: string
          type?: 'important' | 'normal' | 'info'
          is_active?: boolean
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          type?: 'important' | 'normal' | 'info'
          is_active?: boolean
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      activity_logs: {
        Row: {
          id: string
          user_id: string
          activity_type: string
          activity_description: string
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          activity_type: string
          activity_description: string
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          activity_type?: string
          activity_description?: string
          metadata?: Json | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
