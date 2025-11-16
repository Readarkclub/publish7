import { supabase } from '../lib/supabase'

export interface User {
  id: string
  email: string
  name: string
  avatar?: string | null
  bio?: string | null
}

export interface RegisterData {
  email: string
  password: string
  name: string
}

export interface LoginData {
  email: string
  password: string
}

/**
 * 用户注册（使用 Supabase Auth）
 */
export async function register(data: RegisterData): Promise<{
  success: boolean
  user?: User
  error?: string
  needsEmailConfirmation?: boolean
}> {
  try {
    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(data.email)) {
      return { success: false, error: '邮箱格式不正确' }
    }

    // 验证密码长度
    if (data.password.length < 8) {
      return { success: false, error: '密码长度至少为 8 位' }
    }

    // 验证用户名长度
    if (data.name.length < 2) {
      return { success: false, error: '用户名至少为 2 个字符' }
    }

    // 使用 Supabase Auth 注册
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          name: data.name,
        },
        // 邮箱验证配置（可以在 Supabase Dashboard 设置）
        // emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (signUpError) {
      console.error('注册失败:', signUpError)
      return { success: false, error: signUpError.message }
    }

    if (!authData.user) {
      return { success: false, error: '注册失败，请重试' }
    }

    // 检查是否需要邮箱验证
    const needsEmailConfirmation = authData.user.email_confirmed_at === null

    // 从 public.users 表获取完整用户信息
    const { data: publicUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single()

    if (fetchError || !publicUser) {
      console.warn('获取用户资料失败，但注册成功:', fetchError)
      // 即使获取失败，注册仍然成功
      return {
        success: true,
        needsEmailConfirmation,
        user: {
          id: authData.user.id,
          email: authData.user.email!,
          name: data.name,
          avatar: null,
          bio: null,
        },
      }
    }

    return {
      success: true,
      needsEmailConfirmation,
      user: {
        id: publicUser.id,
        email: publicUser.email,
        name: publicUser.name,
        avatar: publicUser.avatar,
        bio: publicUser.bio,
      },
    }
  } catch (error) {
    console.error('注册异常:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '注册失败',
    }
  }
}

/**
 * 用户登录（使用 Supabase Auth）
 */
export async function login(data: LoginData): Promise<{
  success: boolean
  user?: User
  error?: string
}> {
  try {
    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(data.email)) {
      return { success: false, error: '邮箱格式不正确' }
    }

    // 使用 Supabase Auth 登录
    const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    if (signInError) {
      console.error('登录失败:', signInError)
      // 统一错误消息，防止邮箱枚举攻击
      return { success: false, error: '邮箱或密码错误' }
    }

    if (!authData.user) {
      return { success: false, error: '登录失败，请重试' }
    }

    // 从 public.users 表获取完整用户信息
    const { data: publicUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single()

    if (fetchError || !publicUser) {
      console.warn('获取用户资料失败，使用 Auth 数据:', fetchError)
      // 如果 public.users 表中没有记录，使用 Auth session 中的数据
      // 这可能发生在数据库 trigger 未正确设置时
      return {
        success: true,
        user: {
          id: authData.user.id,
          email: authData.user.email || data.email,
          name: authData.user.user_metadata?.name || data.email.split('@')[0],
          avatar: authData.user.user_metadata?.avatar || null,
          bio: null,
        },
      }
    }

    return {
      success: true,
      user: {
        id: publicUser.id,
        email: publicUser.email,
        name: publicUser.name,
        avatar: publicUser.avatar,
        bio: publicUser.bio,
      },
    }
  } catch (error) {
    console.error('登录异常:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '登录失败',
    }
  }
}

/**
 * 用户登出（使用 Supabase Auth）
 */
export async function logout(): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error('登出失败:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('登出异常:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '登出失败',
    }
  }
}

/**
 * 获取当前登录用户
 */
export async function getCurrentUser(): Promise<{
  success: boolean
  user?: User
  error?: string
}> {
  try {
    // 从 Supabase Auth 获取当前会话
    const { data: { user: authUser }, error: sessionError } = await supabase.auth.getUser()

    if (sessionError || !authUser) {
      return { success: false, error: '未登录' }
    }

    // 从 public.users 表获取完整用户信息
    const { data: publicUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single()

    if (fetchError || !publicUser) {
      console.error('获取用户资料失败:', fetchError)
      return { success: false, error: '获取用户信息失败' }
    }

    return {
      success: true,
      user: {
        id: publicUser.id,
        email: publicUser.email,
        name: publicUser.name,
        avatar: publicUser.avatar,
        bio: publicUser.bio,
      },
    }
  } catch (error) {
    console.error('获取当前用户异常:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '获取用户信息失败',
    }
  }
}

/**
 * 根据用户 ID 获取用户信息
 */
export async function getUserById(userId: string): Promise<{
  success: boolean
  user?: User
  error?: string
}> {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, name, avatar, bio')
      .eq('id', userId)
      .single()

    if (error || !user) {
      return { success: false, error: '用户不存在' }
    }

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        bio: user.bio,
      },
    }
  } catch (error) {
    console.error('获取用户信息异常:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '获取用户信息失败',
    }
  }
}

/**
 * 更新用户资料
 */
export async function updateProfile(
  userId: string,
  updates: {
    name?: string
    email?: string
    avatar?: string | null
    bio?: string | null
    password?: string
  }
): Promise<{
  success: boolean
  user?: User
  error?: string
  needsEmailConfirmation?: boolean
}> {
  try {
    let needsEmailConfirmation = false

    // 如果更新邮箱，使用 Supabase Auth API
    if (updates.email) {
      const { error: emailError } = await supabase.auth.updateUser({
        email: updates.email,
      })

      if (emailError) {
        console.error('更新邮箱失败:', emailError)
        return { success: false, error: emailError.message }
      }

      // 邮箱更新需要验证
      needsEmailConfirmation = true
      console.log('✅ 邮箱更新请求已发送，请检查新邮箱验证链接')
    }

    // 如果更新密码，使用 Supabase Auth API
    if (updates.password) {
      const { error: passwordError } = await supabase.auth.updateUser({
        password: updates.password,
      })

      if (passwordError) {
        console.error('更新密码失败:', passwordError)
        return { success: false, error: passwordError.message }
      }
    }

    // 如果更新 name 或 avatar，同时更新 auth.users 的 metadata
    if (updates.name !== undefined || updates.avatar !== undefined) {
      const metadata: { name?: string; avatar?: string | null } = {}
      if (updates.name !== undefined) metadata.name = updates.name
      if (updates.avatar !== undefined) metadata.avatar = updates.avatar

      const { error: metadataError } = await supabase.auth.updateUser({
        data: metadata,
      })

      if (metadataError) {
        console.warn('更新 Auth metadata 失败:', metadataError)
      }
    }

    // 更新 public.users 表
    const updateData: {
      name?: string;
      email?: string;
      avatar?: string | null;
      bio?: string | null;
    } = {}
    if (updates.name !== undefined) updateData.name = updates.name
    if (updates.email !== undefined) updateData.email = updates.email
    if (updates.avatar !== undefined) updateData.avatar = updates.avatar
    if (updates.bio !== undefined) updateData.bio = updates.bio

    if (Object.keys(updateData).length > 0) {
      const { data: updatedUser, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', userId)
        .select()
        .single()

      if (error) {
        console.error('更新用户资料失败:', error)
        return { success: false, error: error.message }
      }

      return {
        success: true,
        needsEmailConfirmation,
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
          avatar: updatedUser.avatar,
          bio: updatedUser.bio,
        },
      }
    }

    // 如果只更新了密码或邮箱
    const currentUser = await getUserById(userId)
    if (currentUser.success && currentUser.user) {
      return {
        success: true,
        needsEmailConfirmation,
        user: currentUser.user,
      }
    }

    return { success: false, error: '更新失败' }
  } catch (error) {
    console.error('更新用户资料异常:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '更新失败',
    }
  }
}

/**
 * 删除用户账户
 *
 * 注意：此函数会：
 * 1. 删除 auth.users 中的用户记录（释放邮箱）
 * 2. 通过级联删除自动删除 public.users
 * 3. 通过级联删除自动删除所有关联数据（活动、评价、报名等）
 */
export async function deleteAccount(userId: string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    // 调用数据库函数删除用户（包括 auth.users）
    // 此函数会：
    // 1. 删除 auth.users 记录（释放邮箱供重新注册）
    // 2. 级联删除 public.users 和所有关联数据
    const { error: deleteError } = await supabase.rpc('delete_user_account', {
      user_id: userId
    })

    if (deleteError) {
      console.error('删除账户失败:', deleteError)
      return { success: false, error: deleteError.message }
    }

    // 登出用户（清除本地会话）
    await supabase.auth.signOut()

    console.log('✅ 账户已完全删除，邮箱已释放可重新注册')
    return { success: true }
  } catch (error) {
    console.error('删除账户异常:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '删除失败',
    }
  }
}

/**
 * 发送密码重置邮件
 */
export async function resetPassword(email: string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return { success: false, error: '邮箱格式不正确' }
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) {
      console.error('发送重置邮件失败:', error)
      // 不透露用户是否存在，统一返回成功消息
      return { success: true }
    }

    return { success: true }
  } catch (error) {
    console.error('发送重置邮件异常:', error)
    // 统一返回成功消息，防止邮箱枚举攻击
    return { success: true }
  }
}

/**
 * 重新发送验证邮件
 */
export async function resendConfirmationEmail(email: string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
    })

    if (error) {
      console.error('重发验证邮件失败:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('重发验证邮件异常:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '发送失败',
    }
  }
}
