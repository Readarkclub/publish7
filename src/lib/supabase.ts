import { createClient } from '@supabase/supabase-js'
import { env } from '../config/env'

// 创建 Supabase 客户端（启用 Auth）
export const supabase = createClient(env.supabase.url, env.supabase.anonKey, {
  auth: {
    persistSession: true, // 启用会话持久化
    autoRefreshToken: true, // 启用 Token 自动刷新
    detectSessionInUrl: true, // 检测 URL 中的会话（用于邮箱验证等）
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  },
  db: {
    schema: 'public',
  },
})

// 导出类型定义
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          password: string
          name: string
          avatar: string | null
          bio: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          password: string
          name: string
          avatar?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          password?: string
          name?: string
          avatar?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      events: {
        Row: {
          id: string
          title: string
          date: string
          location: string
          category: string
          attendees: number
          price: string
          image_url: string | null
          description: string | null
          organizer_name: string | null
          organizer_avatar: string | null
          organizer_description: string | null
          organizer_events_count: number
          highlights: string[] | null
          status: 'draft' | 'published'
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          title: string
          date: string
          location: string
          category: string
          attendees?: number
          price: string
          image_url?: string | null
          description?: string | null
          organizer_name?: string | null
          organizer_avatar?: string | null
          organizer_description?: string | null
          organizer_events_count?: number
          highlights?: string[] | null
          status?: 'draft' | 'published'
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          date?: string
          location?: string
          category?: string
          attendees?: number
          price?: string
          image_url?: string | null
          description?: string | null
          organizer_name?: string | null
          organizer_avatar?: string | null
          organizer_description?: string | null
          organizer_events_count?: number
          highlights?: string[] | null
          status?: 'draft' | 'published'
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      event_agenda: {
        Row: {
          id: string
          event_id: string
          time: string
          title: string
          description: string | null
          order_index: number
          created_at: string
        }
        Insert: {
          id?: string
          event_id: string
          time: string
          title: string
          description?: string | null
          order_index: number
          created_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          time?: string
          title?: string
          description?: string | null
          order_index?: number
          created_at?: string
        }
      }
      event_reviews: {
        Row: {
          id: string
          event_id: string
          user_email: string
          user_name: string
          user_avatar: string | null
          rating: number
          comment: string | null
          created_at: string
        }
        Insert: {
          id?: string
          event_id: string
          user_email: string
          user_name: string
          user_avatar?: string | null
          rating: number
          comment?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          user_email?: string
          user_name?: string
          user_avatar?: string | null
          rating?: number
          comment?: string | null
          created_at?: string
        }
      }
      user_event_registrations: {
        Row: {
          id: string
          user_email: string
          event_id: string
          registered_at: string
        }
        Insert: {
          id?: string
          user_email: string
          event_id: string
          registered_at?: string
        }
        Update: {
          id?: string
          user_email?: string
          event_id?: string
          registered_at?: string
        }
      }
      user_event_favorites: {
        Row: {
          id: string
          user_email: string
          event_id: string
          favorited_at: string
        }
        Insert: {
          id?: string
          user_email: string
          event_id: string
          favorited_at?: string
        }
        Update: {
          id?: string
          user_email?: string
          event_id?: string
          favorited_at?: string
        }
      }
      user_organizer_follows: {
        Row: {
          id: string
          user_email: string
          organizer_name: string
          followed_at: string
        }
        Insert: {
          id?: string
          user_email: string
          organizer_name: string
          followed_at?: string
        }
        Update: {
          id?: string
          user_email?: string
          organizer_name?: string
          followed_at?: string
        }
      }
    }
  }
}
