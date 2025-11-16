import { supabase } from '../lib/supabase'
import type { Event } from '../types/event'

/**
 * 报名活动
 */
export async function registerForEvent(
  userEmail: string,
  eventId: string
): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const { error } = await supabase
      .from('user_event_registrations')
      .insert([{
        user_email: userEmail,
        event_id: eventId,
      }])

    if (error) {
      // 检查是否已经报名过
      if (error.code === '23505') {
        return { success: false, error: '您已经报名过此活动' }
      }
      console.error('报名活动失败:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('报名活动异常:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '报名失败',
    }
  }
}

/**
 * 取消报名
 */
export async function unregisterFromEvent(
  userEmail: string,
  eventId: string
): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const { error } = await supabase
      .from('user_event_registrations')
      .delete()
      .eq('user_email', userEmail)
      .eq('event_id', eventId)

    if (error) {
      console.error('取消报名失败:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('取消报名异常:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '取消失败',
    }
  }
}

/**
 * 获取用户报名的活动列表
 */
export async function getRegisteredEvents(userEmail: string): Promise<{
  success: boolean
  eventIds?: string[]
  error?: string
}> {
  try {
    const { data, error } = await supabase
      .from('user_event_registrations')
      .select('event_id')
      .eq('user_email', userEmail)

    if (error) {
      console.error('获取报名活动失败:', error)
      return { success: false, error: error.message }
    }

    const eventIds = data.map(r => r.event_id)
    return { success: true, eventIds }
  } catch (error) {
    console.error('获取报名活动异常:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '获取失败',
    }
  }
}

/**
 * 检查用户是否已报名某个活动
 */
export async function isEventRegistered(
  userEmail: string,
  eventId: string
): Promise<{
  success: boolean
  isRegistered?: boolean
  error?: string
}> {
  try {
    const { data, error } = await supabase
      .from('user_event_registrations')
      .select('id')
      .eq('user_email', userEmail)
      .eq('event_id', eventId)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = 未找到记录
      console.error('检查报名状态失败:', error)
      return { success: false, error: error.message }
    }

    return { success: true, isRegistered: !!data }
  } catch (error) {
    console.error('检查报名状态异常:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '检查失败',
    }
  }
}

/**
 * 收藏活动
 */
export async function favoriteEvent(
  userEmail: string,
  eventId: string
): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const { error } = await supabase
      .from('user_event_favorites')
      .insert([{
        user_email: userEmail,
        event_id: eventId,
      }])

    if (error) {
      // 检查是否已经收藏过
      if (error.code === '23505') {
        return { success: false, error: '您已经收藏过此活动' }
      }
      console.error('收藏活动失败:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('收藏活动异常:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '收藏失败',
    }
  }
}

/**
 * 取消收藏
 */
export async function unfavoriteEvent(
  userEmail: string,
  eventId: string
): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const { error } = await supabase
      .from('user_event_favorites')
      .delete()
      .eq('user_email', userEmail)
      .eq('event_id', eventId)

    if (error) {
      console.error('取消收藏失败:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('取消收藏异常:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '取消失败',
    }
  }
}

/**
 * 获取用户收藏的活动列表
 */
export async function getFavoriteEvents(userEmail: string): Promise<{
  success: boolean
  eventIds?: string[]
  error?: string
}> {
  try {
    const { data, error } = await supabase
      .from('user_event_favorites')
      .select('event_id')
      .eq('user_email', userEmail)

    if (error) {
      console.error('获取收藏活动失败:', error)
      return { success: false, error: error.message }
    }

    const eventIds = data.map(r => r.event_id)
    return { success: true, eventIds }
  } catch (error) {
    console.error('获取收藏活动异常:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '获取失败',
    }
  }
}

/**
 * 检查用户是否已收藏某个活动
 */
export async function isEventFavorited(
  userEmail: string,
  eventId: string
): Promise<{
  success: boolean
  isFavorited?: boolean
  error?: string
}> {
  try {
    const { data, error } = await supabase
      .from('user_event_favorites')
      .select('id')
      .eq('user_email', userEmail)
      .eq('event_id', eventId)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = 未找到记录
      console.error('检查收藏状态失败:', error)
      return { success: false, error: error.message }
    }

    return { success: true, isFavorited: !!data }
  } catch (error) {
    console.error('检查收藏状态异常:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '检查失败',
    }
  }
}

/**
 * 关注主办方
 */
export async function followOrganizer(
  userEmail: string,
  organizerName: string
): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const { error } = await supabase
      .from('user_organizer_follows')
      .insert([{
        user_email: userEmail,
        organizer_name: organizerName,
      }])

    if (error) {
      // 检查是否已经关注过
      if (error.code === '23505') {
        return { success: false, error: '您已经关注过此主办方' }
      }
      console.error('关注主办方失败:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('关注主办方异常:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '关注失败',
    }
  }
}

/**
 * 取消关注主办方
 */
export async function unfollowOrganizer(
  userEmail: string,
  organizerName: string
): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const { error } = await supabase
      .from('user_organizer_follows')
      .delete()
      .eq('user_email', userEmail)
      .eq('organizer_name', organizerName)

    if (error) {
      console.error('取消关注失败:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('取消关注异常:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '取消失败',
    }
  }
}

/**
 * 获取用户关注的主办方列表
 */
export async function getFollowedOrganizers(userEmail: string): Promise<{
  success: boolean
  organizers?: string[]
  error?: string
}> {
  try {
    const { data, error } = await supabase
      .from('user_organizer_follows')
      .select('organizer_name')
      .eq('user_email', userEmail)

    if (error) {
      console.error('获取关注列表失败:', error)
      return { success: false, error: error.message }
    }

    const organizers = data.map(r => r.organizer_name)
    return { success: true, organizers }
  } catch (error) {
    console.error('获取关注列表异常:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '获取失败',
    }
  }
}

/**
 * 检查用户是否已关注某个主办方
 */
export async function isOrganizerFollowed(
  userEmail: string,
  organizerName: string
): Promise<{
  success: boolean
  isFollowed?: boolean
  error?: string
}> {
  try {
    const { data, error } = await supabase
      .from('user_organizer_follows')
      .select('id')
      .eq('user_email', userEmail)
      .eq('organizer_name', organizerName)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = 未找到记录
      console.error('检查关注状态失败:', error)
      return { success: false, error: error.message }
    }

    return { success: true, isFollowed: !!data }
  } catch (error) {
    console.error('检查关注状态异常:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '检查失败',
    }
  }
}
