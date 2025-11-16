import { supabase } from '../lib/supabase'
import type { Event } from '../types/event'

/**
 * localStorage 数据迁移工具
 * 将现有的 localStorage 数据导入到 Supabase 数据库
 */

// 存储键名常量
const STORAGE_KEYS = {
  USER: "eventApp_user",
  EVENTS: "eventApp_events",
  REGISTERED_USERS: "eventApp_registeredUsers"
}

// 辅助函数：从 localStorage 获取用户特定数据
function getUserStorageKey(email: string, dataType: string): string {
  return `eventApp_user_${email}_${dataType}`
}

/**
 * 迁移进度回调
 */
export interface MigrationProgress {
  stage: string
  current: number
  total: number
  message: string
}

export type ProgressCallback = (progress: MigrationProgress) => void

/**
 * 获取 localStorage 中的所有用户凭证
 */
function getAllRegisteredUsers(): Array<{
  email: string
  password: string
  name: string
}> {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.REGISTERED_USERS)
    if (!data) return []

    const users = JSON.parse(data)
    return Array.isArray(users) ? users : []
  } catch (error) {
    console.error('❌ 读取用户凭证失败:', error)
    return []
  }
}

/**
 * 获取 localStorage 中的所有活动
 */
function getAllEvents(): Event[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.EVENTS)
    if (!data) return []

    const events = JSON.parse(data)
    return Array.isArray(events) ? events : []
  } catch (error) {
    console.error('❌ 读取活动数据失败:', error)
    return []
  }
}

/**
 * 获取用户的个人资料
 */
function getUserProfile(email: string): any {
  try {
    const key = getUserStorageKey(email, 'profile')
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : null
  } catch (error) {
    console.error(`❌ 读取用户资料失败 (${email}):`, error)
    return null
  }
}

/**
 * 获取用户的报名活动
 */
function getUserRegistrations(email: string): string[] {
  try {
    const key = getUserStorageKey(email, 'registeredEvents')
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error(`❌ 读取报名记录失败 (${email}):`, error)
    return []
  }
}

/**
 * 获取用户的收藏活动
 */
function getUserFavorites(email: string): string[] {
  try {
    const key = getUserStorageKey(email, 'favoriteEvents')
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error(`❌ 读取收藏记录失败 (${email}):`, error)
    return []
  }
}

/**
 * 获取用户的关注主办方
 */
function getUserFollows(email: string): string[] {
  try {
    const key = getUserStorageKey(email, 'followedOrganizers')
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error(`❌ 读取关注记录失败 (${email}):`, error)
    return []
  }
}

/**
 * 检查数据库是否已有数据（避免重复迁移）
 */
export async function checkIfMigrated(): Promise<{
  success: boolean
  hasMigrated: boolean
  error?: string
}> {
  try {
    // 检查是否有用户数据
    const { data: users, error } = await supabase
      .from('users')
      .select('id')
      .limit(1)

    if (error) {
      console.error('检查迁移状态失败:', error)
      return { success: false, hasMigrated: false, error: error.message }
    }

    const hasMigrated = users && users.length > 0
    return { success: true, hasMigrated }
  } catch (error) {
    console.error('检查迁移状态异常:', error)
    return {
      success: false,
      hasMigrated: false,
      error: error instanceof Error ? error.message : '检查失败'
    }
  }
}

/**
 * 迁移所有用户凭证到 users 表
 */
async function migrateUsers(
  onProgress?: ProgressCallback
): Promise<{
  success: boolean
  count: number
  errors: string[]
}> {
  const users = getAllRegisteredUsers()
  const errors: string[] = []
  let successCount = 0

  console.log(`📦 开始迁移用户凭证: ${users.length} 个用户`)

  for (let i = 0; i < users.length; i++) {
    const user = users[i]

    if (onProgress) {
      onProgress({
        stage: '迁移用户',
        current: i + 1,
        total: users.length,
        message: `正在迁移用户: ${user.email}`
      })
    }

    try {
      // 获取用户个人资料（如果有）
      const profile = getUserProfile(user.email)

      // 插入用户数据
      const { error } = await supabase
        .from('users')
        .insert([{
          email: user.email,
          password: user.password,
          name: user.name,
          avatar: profile?.avatar || null,
          bio: profile?.bio || null,
        }])

      if (error) {
        // 如果是唯一性约束错误（用户已存在），跳过
        if (error.code !== '23505') {
          errors.push(`${user.email}: ${error.message}`)
        }
      } else {
        successCount++
      }
    } catch (error) {
      errors.push(`${user.email}: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  console.log(`✅ 用户迁移完成: ${successCount}/${users.length}`)
  return { success: true, count: successCount, errors }
}

/**
 * 迁移所有活动数据到 events 和 event_agenda 表
 */
async function migrateEvents(
  onProgress?: ProgressCallback
): Promise<{
  success: boolean
  count: number
  errors: string[]
}> {
  const events = getAllEvents()
  const errors: string[] = []
  let successCount = 0

  console.log(`📦 开始迁移活动数据: ${events.length} 个活动`)

  for (let i = 0; i < events.length; i++) {
    const event = events[i]

    if (onProgress) {
      onProgress({
        stage: '迁移活动',
        current: i + 1,
        total: events.length,
        message: `正在迁移活动: ${event.title}`
      })
    }

    try {
      // 插入活动基本信息
      const { error: eventError } = await supabase
        .from('events')
        .insert([{
          id: event.id,
          title: event.title,
          date: event.date,
          location: event.location,
          category: event.category,
          attendees: event.attendees || 0,
          price: event.price,
          image_url: event.imageUrl,
          description: event.description,
          organizer_name: event.organizer?.name,
          organizer_avatar: event.organizer?.avatar,
          organizer_description: event.organizer?.description,
          organizer_events_count: event.organizer?.eventsCount || 0,
          highlights: event.highlights || [],
          status: event.status || 'published',
          created_by: event.createdBy,
        }])

      if (eventError) {
        if (eventError.code !== '23505') {
          errors.push(`${event.title}: ${eventError.message}`)
        }
        continue
      }

      // 插入活动议程
      if (event.agenda && event.agenda.length > 0) {
        const agendaItems = event.agenda.map((item, index) => ({
          event_id: event.id,
          time: item.time,
          title: item.title,
          description: item.description || '',
          order_index: index,
        }))

        const { error: agendaError } = await supabase
          .from('event_agenda')
          .insert(agendaItems)

        if (agendaError && agendaError.code !== '23505') {
          console.warn(`议程迁移警告 (${event.title}):`, agendaError.message)
        }
      }

      // 插入活动评价
      if (event.reviews && event.reviews.length > 0) {
        const reviewItems = event.reviews.map(review => ({
          event_id: event.id,
          user_email: review.userEmail || '',
          user_name: review.user,
          user_avatar: review.avatar,
          rating: review.rating,
          comment: review.comment,
        }))

        const { error: reviewError } = await supabase
          .from('event_reviews')
          .insert(reviewItems)

        if (reviewError && reviewError.code !== '23505') {
          console.warn(`评价迁移警告 (${event.title}):`, reviewError.message)
        }
      }

      successCount++
    } catch (error) {
      errors.push(`${event.title}: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  console.log(`✅ 活动迁移完成: ${successCount}/${events.length}`)
  return { success: true, count: successCount, errors }
}

/**
 * 迁移用户的报名记录
 */
async function migrateRegistrations(
  onProgress?: ProgressCallback
): Promise<{
  success: boolean
  count: number
  errors: string[]
}> {
  const users = getAllRegisteredUsers()
  const errors: string[] = []
  let totalCount = 0

  console.log(`📦 开始迁移报名记录`)

  for (let i = 0; i < users.length; i++) {
    const user = users[i]
    const registrations = getUserRegistrations(user.email)

    if (onProgress) {
      onProgress({
        stage: '迁移报名记录',
        current: i + 1,
        total: users.length,
        message: `正在迁移 ${user.email} 的报名记录`
      })
    }

    if (registrations.length === 0) continue

    try {
      const records = registrations.map(eventId => ({
        user_email: user.email,
        event_id: eventId,
      }))

      const { error } = await supabase
        .from('user_event_registrations')
        .insert(records)

      if (error && error.code !== '23505') {
        errors.push(`${user.email}: ${error.message}`)
      } else {
        totalCount += registrations.length
      }
    } catch (error) {
      errors.push(`${user.email}: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  console.log(`✅ 报名记录迁移完成: ${totalCount} 条记录`)
  return { success: true, count: totalCount, errors }
}

/**
 * 迁移用户的收藏记录
 */
async function migrateFavorites(
  onProgress?: ProgressCallback
): Promise<{
  success: boolean
  count: number
  errors: string[]
}> {
  const users = getAllRegisteredUsers()
  const errors: string[] = []
  let totalCount = 0

  console.log(`📦 开始迁移收藏记录`)

  for (let i = 0; i < users.length; i++) {
    const user = users[i]
    const favorites = getUserFavorites(user.email)

    if (onProgress) {
      onProgress({
        stage: '迁移收藏记录',
        current: i + 1,
        total: users.length,
        message: `正在迁移 ${user.email} 的收藏记录`
      })
    }

    if (favorites.length === 0) continue

    try {
      const records = favorites.map(eventId => ({
        user_email: user.email,
        event_id: eventId,
      }))

      const { error } = await supabase
        .from('user_event_favorites')
        .insert(records)

      if (error && error.code !== '23505') {
        errors.push(`${user.email}: ${error.message}`)
      } else {
        totalCount += favorites.length
      }
    } catch (error) {
      errors.push(`${user.email}: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  console.log(`✅ 收藏记录迁移完成: ${totalCount} 条记录`)
  return { success: true, count: totalCount, errors }
}

/**
 * 迁移用户的关注记录
 */
async function migrateFollows(
  onProgress?: ProgressCallback
): Promise<{
  success: boolean
  count: number
  errors: string[]
}> {
  const users = getAllRegisteredUsers()
  const errors: string[] = []
  let totalCount = 0

  console.log(`📦 开始迁移关注记录`)

  for (let i = 0; i < users.length; i++) {
    const user = users[i]
    const follows = getUserFollows(user.email)

    if (onProgress) {
      onProgress({
        stage: '迁移关注记录',
        current: i + 1,
        total: users.length,
        message: `正在迁移 ${user.email} 的关注记录`
      })
    }

    if (follows.length === 0) continue

    try {
      const records = follows.map(organizerName => ({
        user_email: user.email,
        organizer_name: organizerName,
      }))

      const { error } = await supabase
        .from('user_organizer_follows')
        .insert(records)

      if (error && error.code !== '23505') {
        errors.push(`${user.email}: ${error.message}`)
      } else {
        totalCount += follows.length
      }
    } catch (error) {
      errors.push(`${user.email}: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  console.log(`✅ 关注记录迁移完成: ${totalCount} 条记录`)
  return { success: true, count: totalCount, errors }
}

/**
 * 执行完整的数据迁移
 */
export async function runFullMigration(
  onProgress?: ProgressCallback
): Promise<{
  success: boolean
  summary: {
    users: number
    events: number
    registrations: number
    favorites: number
    follows: number
  }
  errors: string[]
}> {
  console.log('🚀 开始数据迁移...')

  const allErrors: string[] = []

  // 1. 迁移用户
  const usersResult = await migrateUsers(onProgress)
  allErrors.push(...usersResult.errors)

  // 2. 迁移活动
  const eventsResult = await migrateEvents(onProgress)
  allErrors.push(...eventsResult.errors)

  // 3. 迁移报名记录
  const registrationsResult = await migrateRegistrations(onProgress)
  allErrors.push(...registrationsResult.errors)

  // 4. 迁移收藏记录
  const favoritesResult = await migrateFavorites(onProgress)
  allErrors.push(...favoritesResult.errors)

  // 5. 迁移关注记录
  const followsResult = await migrateFollows(onProgress)
  allErrors.push(...followsResult.errors)

  const summary = {
    users: usersResult.count,
    events: eventsResult.count,
    registrations: registrationsResult.count,
    favorites: favoritesResult.count,
    follows: followsResult.count,
  }

  console.log('✅ 迁移完成！')
  console.log('📊 迁移统计:', summary)

  if (allErrors.length > 0) {
    console.warn('⚠️  迁移警告:', allErrors)
  }

  // 标记已迁移（可选）
  localStorage.setItem('eventApp_migrated_to_supabase', 'true')

  return {
    success: true,
    summary,
    errors: allErrors,
  }
}

/**
 * 清除 localStorage 数据（迁移成功后可选）
 */
export function clearLocalStorageData(): void {
  const keysToRemove: string[] = []

  // 收集所有相关的键
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && key.startsWith('eventApp_')) {
      keysToRemove.push(key)
    }
  }

  // 删除
  keysToRemove.forEach(key => {
    localStorage.removeItem(key)
  })

  console.log(`🗑️  已清除 ${keysToRemove.length} 个 localStorage 项`)
}
