import { useState, useEffect } from 'react';
import * as authService from '../services/authService';
import type { User } from '../services/authService';
import { supabase } from '../lib/supabase';

interface UseAuthResult {
  user: User | null;
  loading: boolean;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

export function useAuth(): UseAuthResult {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // 初始化：获取当前会话
    const initAuth = async () => {
      try {
        const result = await authService.getCurrentUser();
        if (mounted && result.success && result.user) {
          setUser(result.user);
          console.log('✅ 恢复用户会话:', result.user.email);
        }
      } catch (error) {
        console.error('Auth 初始化失败:', error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initAuth();

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      
      console.log('🔐 Auth 状态变化:', event, session?.user?.email);

      if (event === 'SIGNED_IN' && session?.user) {
        // 用户登录 - 添加超时保护
        const timeoutPromise = new Promise<{ success: false; error: string }>((resolve) => {
          setTimeout(() => resolve({ success: false, error: '获取用户信息超时' }), 5000);
        });

        try {
          const result = await Promise.race([
            authService.getUserById(session.user.id),
            timeoutPromise
          ]);

          if (mounted) {
            if (result.success && result.user) {
              setUser(result.user);
            } else {
              // 如果数据库查询失败，使用 session 中的基本信息
              console.warn('⚠️ 从数据库获取用户信息失败，使用 session 信息:', result.error);
              setUser({
                id: session.user.id,
                email: session.user.email || '',
                name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || '用户',
                avatar: session.user.user_metadata?.avatar || null,
                bio: null,
              });
            }
          }
        } catch (error) {
          console.error('Auth 状态变化处理失败:', error);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      } else if (event === 'USER_UPDATED' && session?.user) {
        const result = await authService.getUserById(session.user.id);
        if (mounted && result.success && result.user) {
          setUser(result.user);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return { user, setUser, loading };
}