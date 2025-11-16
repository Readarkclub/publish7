import { supabase } from '../lib/supabase'
import type { Review } from '../types/event'

/**
 * 获取活动的所有评价
 */
export async function getEventReviews(eventId: string): Promise<{
  success: boolean
  reviews?: Review[]
  error?: string
}> {
  try {
    const { data, error } = await supabase
      .from('event_reviews')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('获取评价失败:', error)
      return { success: false, error: error.message }
    }

    const reviews: Review[] = data.map(r => ({
      user: r.user_name,
      avatar: r.user_avatar || '',
      rating: r.rating,
      date: new Date(r.created_at).toLocaleDateString('zh-CN'),
      comment: r.comment || '',
      userEmail: r.user_email,
    }))

    return { success: true, reviews }
  } catch (error) {
    console.error('获取评价异常:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '获取失败',
    }
  }
}

/**
 * 添加活动评价
 */
export async function addReview(
  eventId: string,
  userEmail: string,
  userName: string,
  userAvatar: string | null,
  rating: number,
  comment: string
): Promise<{
  success: boolean
  review?: Review
  error?: string
}> {
  try {
    // 验证评分范围
    if (rating < 1 || rating > 5) {
      return { success: false, error: '评分必须在 1-5 之间' }
    }

    // 插入评价
    const { data, error } = await supabase
      .from('event_reviews')
      .insert([{
        event_id: eventId,
        user_email: userEmail,
        user_name: userName,
        user_avatar: userAvatar,
        rating,
        comment,
      }])
      .select()
      .single()

    if (error) {
      // 检查是否是唯一性约束错误（用户已评价过）
      if (error.code === '23505') {
        return { success: false, error: '您已经评价过此活动' }
      }
      console.error('添加评价失败:', error)
      return { success: false, error: error.message }
    }

    const review: Review = {
      user: data.user_name,
      avatar: data.user_avatar || '',
      rating: data.rating,
      date: new Date(data.created_at).toLocaleDateString('zh-CN'),
      comment: data.comment || '',
      userEmail: data.user_email,
    }

    return { success: true, review }
  } catch (error) {
    console.error('添加评价异常:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '添加失败',
    }
  }
}

/**
 * 更新评价
 */
export async function updateReview(
  eventId: string,
  userEmail: string,
  rating: number,
  comment: string
): Promise<{
  success: boolean
  review?: Review
  error?: string
}> {
  try {
    // 验证评分范围
    if (rating < 1 || rating > 5) {
      return { success: false, error: '评分必须在 1-5 之间' }
    }

    const { data, error } = await supabase
      .from('event_reviews')
      .update({ rating, comment })
      .eq('event_id', eventId)
      .eq('user_email', userEmail)
      .select()
      .single()

    if (error) {
      console.error('更新评价失败:', error)
      return { success: false, error: error.message }
    }

    const review: Review = {
      user: data.user_name,
      avatar: data.user_avatar || '',
      rating: data.rating,
      date: new Date(data.created_at).toLocaleDateString('zh-CN'),
      comment: data.comment || '',
      userEmail: data.user_email,
    }

    return { success: true, review }
  } catch (error) {
    console.error('更新评价异常:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '更新失败',
    }
  }
}

/**
 * 删除评价
 */
export async function deleteReview(
  eventId: string,
  userEmail: string
): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const { error } = await supabase
      .from('event_reviews')
      .delete()
      .eq('event_id', eventId)
      .eq('user_email', userEmail)

    if (error) {
      console.error('删除评价失败:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('删除评价异常:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '删除失败',
    }
  }
}

/**
 * 检查用户是否已评价过某个活动
 */
export async function hasUserReviewed(
  eventId: string,
  userEmail: string
): Promise<{
  success: boolean
  hasReviewed?: boolean
  error?: string
}> {
  try {
    const { data, error } = await supabase
      .from('event_reviews')
      .select('id')
      .eq('event_id', eventId)
      .eq('user_email', userEmail)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = 未找到记录
      console.error('检查评价状态失败:', error)
      return { success: false, error: error.message }
    }

    return { success: true, hasReviewed: !!data }
  } catch (error) {
    console.error('检查评价状态异常:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '检查失败',
    }
  }
}

/**
 * 获取活动的平均评分
 */
export async function getEventAverageRating(eventId: string): Promise<{
  success: boolean
  average?: number
  count?: number
  error?: string
}> {
  try {
    const { data, error } = await supabase
      .from('event_reviews')
      .select('rating')
      .eq('event_id', eventId)

    if (error) {
      console.error('获取平均评分失败:', error)
      return { success: false, error: error.message }
    }

    if (!data || data.length === 0) {
      return { success: true, average: 0, count: 0 }
    }

    const sum = data.reduce((acc, r) => acc + r.rating, 0)
    const average = sum / data.length

    return {
      success: true,
      average: Math.round(average * 10) / 10, // 保留 1 位小数
      count: data.length,
    }
  } catch (error) {
    console.error('获取平均评分异常:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '获取失败',
    }
  }
}
