import { supabase } from '../lib/supabase'
import type { Event } from '../types/event'

/**
 * 将数据库行转换为 Event 类型
 */
function dbRowToEvent(row: any, agenda?: any[], reviews?: any[]): Event {
  return {
    id: row.id,
    title: row.title,
    date: row.date,
    time: row.time,
    location: row.location,
    address: row.address,
    category: row.category,
    attendees: row.attendees,
    capacity: row.capacity,
    price: row.price,
    imageUrl: row.image_url || '',
    description: row.description,
    organizer: row.organizer_name ? {
      name: row.organizer_name,
      avatar: row.organizer_avatar || '',
      description: row.organizer_description || '',
      eventsCount: row.organizer_events_count || 0,
    } : undefined,
    highlights: row.highlights || [],
    agenda: agenda?.map(a => ({
      time: a.time,
      title: a.title,
      description: a.description || '',
    })) || [],
    status: row.status,
    createdBy: row.created_by,
    reviews: reviews || [],
  }
}

/**
 * 获取所有已发布的活动 (支持分页)
 */
export async function getAllEvents(page: number = 1, limit: number = 50): Promise<{
  success: boolean
  events?: Event[]
  total?: number
  error?: string
}> {
  try {
    const from = (page - 1) * limit
    const to = from + limit - 1

    // 获取总数和数据
    const { data, count, error } = await supabase
      .from('events')
      .select('*', { count: 'exact' })
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) {
      console.error('获取活动列表失败:', error)
      return { success: false, error: error.message }
    }

    const events = data.map(row => dbRowToEvent(row))
    return { success: true, events, total: count || 0 }
  } catch (error) {
    console.error('获取活动列表异常:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '获取失败',
    }
  }
}

/**
 * 按分类筛选活动
 */
export async function getEventsByCategory(category: string): Promise<{
  success: boolean
  events?: Event[]
  error?: string
}> {
  try {
    const query = supabase
      .from('events')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })

    if (category !== '全部') {
      query.eq('category', category)
    }

    const { data, error } = await query

    if (error) {
      console.error('按分类获取活动失败:', error)
      return { success: false, error: error.message }
    }

    const events = data.map(row => dbRowToEvent(row))
    return { success: true, events }
  } catch (error) {
    console.error('按分类获取活动异常:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '获取失败',
    }
  }
}

/**
 * 搜索活动
 */
export async function searchEvents(keyword: string): Promise<{
  success: boolean
  events?: Event[]
  error?: string
}> {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('status', 'published')
      .or(`title.ilike.%${keyword}%,location.ilike.%${keyword}%,description.ilike.%${keyword}%`)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('搜索活动失败:', error)
      return { success: false, error: error.message }
    }

    const events = data.map(row => dbRowToEvent(row))
    return { success: true, events }
  } catch (error) {
    console.error('搜索活动异常:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '搜索失败',
    }
  }
}

/**
 * 获取活动详情（包括议程和评价）- 并行请求优化
 */
export async function getEventById(eventId: string): Promise<{
  success: boolean
  event?: Event
  error?: string
}> {
  try {
    // 并行发送三个请求，避免瀑布流延迟
    const [eventResult, agendaResult, reviewsResult] = await Promise.all([
      // 1. 获取活动基本信息
      supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single(),
      
      // 2. 获取议程
      supabase
        .from('event_agenda')
        .select('*')
        .eq('event_id', eventId)
        .order('order_index', { ascending: true }),
      
      // 3. 获取评价
      supabase
        .from('event_reviews')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false })
    ]);

    const { data: eventData, error: eventError } = eventResult;
    const { data: agendaData } = agendaResult;
    const { data: reviewsData } = reviewsResult;

    if (eventError || !eventData) {
      return { success: false, error: '活动不存在' }
    }

    const reviews = reviewsData?.map(r => ({
      user: r.user_name,
      avatar: r.user_avatar || '',
      rating: r.rating,
      date: new Date(r.created_at).toLocaleDateString('zh-CN'),
      comment: r.comment || '',
      userEmail: r.user_email,
    })) || []

    const event = dbRowToEvent(eventData, agendaData || [], reviews)
    return { success: true, event }
  } catch (error) {
    console.error('获取活动详情异常:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '获取失败',
    }
  }
}

/**
 * 创建活动
 */
export async function createEvent(
  event: Omit<Event, 'reviews'>,
  userEmail: string
): Promise<{
  success: boolean
  event?: Event
  error?: string
}> {
  try {
    // 插入活动基本信息
    const { data: eventData, error: eventError } = await supabase
      .from('events')
      .insert([{
        id: event.id,
        title: event.title,
        date: event.date,
        time: event.time,
        location: event.location,
        address: event.address,
        category: event.category,
        attendees: event.attendees || 0,
        capacity: event.capacity,
        price: event.price,
        image_url: event.imageUrl,
        description: event.description,
        organizer_name: event.organizer?.name,
        organizer_avatar: event.organizer?.avatar,
        organizer_description: event.organizer?.description,
        organizer_events_count: event.organizer?.eventsCount || 0,
        highlights: event.highlights,
        status: event.status || 'published',
        created_by: userEmail,
      }])
      .select()
      .single()

    if (eventError) {
      console.error('创建活动失败:', eventError)
      return { success: false, error: eventError.message }
    }

    // 插入议程（如果有）
    if (event.agenda && event.agenda.length > 0) {
      const agendaItems = event.agenda.map((item, index) => ({
        event_id: event.id,
        time: item.time,
        title: item.title,
        description: item.description,
        order_index: index,
      }))

      const { error: agendaError } = await supabase
        .from('event_agenda')
        .insert(agendaItems)

      if (agendaError) {
        console.error('创建议程失败:', agendaError)
        // 议程创建失败不影响活动创建，只记录错误
      }
    }

    return {
      success: true,
      event: dbRowToEvent(eventData, event.agenda),
    }
  } catch (error) {
    console.error('创建活动异常:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '创建失败',
    }
  }
}

/**
 * 更新活动
 */
export async function updateEvent(
  eventId: string,
  updates: Partial<Omit<Event, 'id' | 'reviews'>>
): Promise<{
  success: boolean
  event?: Event
  error?: string
}> {
  try {
    // 构建更新数据
    const updateData: any = {}
    if (updates.title !== undefined) updateData.title = updates.title
    if (updates.date !== undefined) updateData.date = updates.date
    if (updates.time !== undefined) updateData.time = updates.time
    if (updates.location !== undefined) updateData.location = updates.location
    if (updates.address !== undefined) updateData.address = updates.address
    if (updates.category !== undefined) updateData.category = updates.category
    if (updates.attendees !== undefined) updateData.attendees = updates.attendees
    if (updates.capacity !== undefined) updateData.capacity = updates.capacity
    if (updates.price !== undefined) updateData.price = updates.price
    if (updates.imageUrl !== undefined) updateData.image_url = updates.imageUrl
    if (updates.description !== undefined) updateData.description = updates.description
    if (updates.organizer !== undefined) {
      updateData.organizer_name = updates.organizer.name
      updateData.organizer_avatar = updates.organizer.avatar
      updateData.organizer_description = updates.organizer.description
      updateData.organizer_events_count = updates.organizer.eventsCount
    }
    if (updates.highlights !== undefined) updateData.highlights = updates.highlights
    if (updates.status !== undefined) updateData.status = updates.status

    // 更新活动基本信息
    const { data: eventData, error: eventError } = await supabase
      .from('events')
      .update(updateData)
      .eq('id', eventId)
      .select()
      .single()

    if (eventError) {
      console.error('更新活动失败:', eventError)
      return { success: false, error: eventError.message }
    }

    // 如果更新了议程，先删除旧议程再插入新议程
    if (updates.agenda !== undefined) {
      // 删除旧议程
      await supabase
        .from('event_agenda')
        .delete()
        .eq('event_id', eventId)

      // 插入新议程
      if (updates.agenda.length > 0) {
        const agendaItems = updates.agenda.map((item, index) => ({
          event_id: eventId,
          time: item.time,
          title: item.title,
          description: item.description,
          order_index: index,
        }))

        await supabase
          .from('event_agenda')
          .insert(agendaItems)
      }
    }

    return {
      success: true,
      event: dbRowToEvent(eventData, updates.agenda),
    }
  } catch (error) {
    console.error('更新活动异常:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '更新失败',
    }
  }
}

/**
 * 删除活动
 */
export async function deleteEvent(eventId: string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId)

    if (error) {
      console.error('删除活动失败:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('删除活动异常:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '删除失败',
    }
  }
}

/**
 * 获取用户发布的活动
 */
export async function getUserPublishedEvents(userEmail: string): Promise<{
  success: boolean
  events?: Event[]
  error?: string
}> {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('created_by', userEmail)
      .eq('status', 'published')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('获取用户发布活动失败:', error)
      return { success: false, error: error.message }
    }

    const events = data.map(row => dbRowToEvent(row))
    return { success: true, events }
  } catch (error) {
    console.error('获取用户发布活动异常:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '获取失败',
    }
  }
}

/**
 * 获取用户的草稿活动
 */
export async function getUserDraftEvents(userEmail: string): Promise<{
  success: boolean
  events?: Event[]
  error?: string
}> {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('created_by', userEmail)
      .eq('status', 'draft')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('获取用户草稿活动失败:', error)
      return { success: false, error: error.message }
    }

    const events = data.map(row => dbRowToEvent(row))
    return { success: true, events }
  } catch (error) {
    console.error('获取用户草稿活动异常:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '获取失败',
    }
  }
}

/**
 * 增加活动参与人数
 */
export async function incrementAttendees(eventId: string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    // 获取当前人数
    const { data: event } = await supabase
      .from('events')
      .select('attendees')
      .eq('id', eventId)
      .single()

    if (!event) {
      return { success: false, error: '活动不存在' }
    }

    // 增加人数
    const { error } = await supabase
      .from('events')
      .update({ attendees: (event.attendees || 0) + 1 })
      .eq('id', eventId)

    if (error) {
      console.error('增加参与人数失败:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('增加参与人数异常:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '操作失败',
    }
  }
}

/**
 * 减少活动参与人数
 */
export async function decrementAttendees(eventId: string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    // 获取当前人数
    const { data: event } = await supabase
      .from('events')
      .select('attendees')
      .eq('id', eventId)
      .single()

    if (!event) {
      return { success: false, error: '活动不存在' }
    }

    // 减少人数（最小为 0）
    const newAttendees = Math.max(0, (event.attendees || 0) - 1)
    const { error } = await supabase
      .from('events')
      .update({ attendees: newAttendees })
      .eq('id', eventId)

    if (error) {
      console.error('减少参与人数失败:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('减少参与人数异常:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '操作失败',
    }
  }
}
