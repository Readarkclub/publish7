import { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { FeaturedEvents } from "./components/FeaturedEvents";
import { Categories } from "./components/Categories";
import { Footer } from "./components/Footer";
import { DiscoverPage } from "./components/DiscoverPage";
import { ProfilePage } from "./components/ProfilePage";
import { EventDetailPage } from "./components/EventDetailPage";
import { CreateEventPage } from "./components/CreateEventPage";
import { LoginDialog } from "./components/LoginDialog";
import { RegisterDialog } from "./components/RegisterDialog";
import { MigrationTool } from "./components/MigrationTool";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner";
import type { Event } from "./types/event";

// 导入服务层
import * as authService from "./services/authService";
import type { User } from "./services/authService";
import * as eventService from "./services/eventService";
import * as reviewService from "./services/reviewService";
import * as userEventService from "./services/userEventService";
import { supabase } from "./lib/supabase";

export default function App() {
  // 页面路由状态
  const [currentPage, setCurrentPage] = useState<
    | "home"
    | "discover"
    | "profile"
    | "event-detail"
    | "create-event"
    | "migration"
  >("home");
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  // 用户状态
  const [user, setUser] = useState<User | null>(null);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [showRegisterDialog, setShowRegisterDialog] = useState(false);

  // 全局活动数据
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  // 用户特定数据
  const [registeredEvents, setRegisteredEvents] = useState<string[]>([]);
  const [favoriteEvents, setFavoriteEvents] = useState<string[]>([]);
  const [publishedEvents, setPublishedEvents] = useState<string[]>([]);
  const [draftEvents, setDraftEvents] = useState<string[]>([]);
  const [followedOrganizers, setFollowedOrganizers] = useState<string[]>([]);

  // 其他状态
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [editingEventData, setEditingEventData] = useState<Event | null>(null);
  const [profileDefaultTab, setProfileDefaultTab] = useState<string>("registered");
  const [discoverCategory, setDiscoverCategory] = useState<string | undefined>(undefined);

  // 监听 Supabase Auth 状态变化
  useEffect(() => {
    // 获取当前会话
    authService.getCurrentUser().then((result) => {
      if (result.success && result.user) {
        setUser(result.user);
        console.log('✅ 恢复用户会话:', result.user.email);
      }
    });

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔐 Auth 状态变化:', event, session?.user?.email);

      if (event === 'SIGNED_IN' && session?.user) {
        // 用户登录 - 添加超时保护
        const timeoutPromise = new Promise<{ success: false; error: string }>((resolve) => {
          setTimeout(() => resolve({ success: false, error: '获取用户信息超时' }), 5000);
        });

        const result = await Promise.race([
          authService.getUserById(session.user.id),
          timeoutPromise
        ]);

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
      } else if (event === 'SIGNED_OUT') {
        // 用户登出
        setUser(null);
      } else if (event === 'USER_UPDATED' && session?.user) {
        // 用户信息更新
        const result = await authService.getUserById(session.user.id);
        if (result.success && result.user) {
          setUser(result.user);
        } else {
          // Fallback to session info
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || '用户',
            avatar: session.user.user_metadata?.avatar || null,
            bio: null,
          });
        }
      } else if (event === 'TOKEN_REFRESHED') {
        console.log('✅ Token 已刷新');
      }
    });

    // 清理监听器
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // 加载所有活动数据
  useEffect(() => {
    loadEvents();
  }, []);

  // 当用户登录时，加载用户特定数据
  useEffect(() => {
    if (user?.email) {
      loadUserData(user.email);
    } else {
      // 用户未登录，清空用户特定数据
      setRegisteredEvents([]);
      setFavoriteEvents([]);
      setPublishedEvents([]);
      setDraftEvents([]);
      setFollowedOrganizers([]);
    }
  }, [user?.email]);

  // 处理 URL 参数 - 从分享链接打开活动详情或迁移工具
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const eventId = params.get('event');
      const showMigration = params.get('migration');

      if (showMigration === 'true') {
        setCurrentPage("migration");
        window.history.replaceState({}, '', window.location.pathname);
      } else if (eventId) {
        setSelectedEventId(eventId);
        setCurrentPage("event-detail");
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
  }, []);

  // 当选中的活动ID变化时，加载活动详情
  useEffect(() => {
    if (selectedEventId && currentPage === 'event-detail') {
      loadEventDetail(selectedEventId);
    }
  }, [selectedEventId, currentPage]);

  // 加载所有活动
  const loadEvents = async () => {
    setLoading(true);
    try {
      // 添加超时保护，防止 Supabase 连接问题导致页面永久卡住
      const timeoutPromise = new Promise<{ success: false; error: string }>((resolve) => {
        setTimeout(() => resolve({ success: false, error: '加载超时' }), 10000);
      });

      const result = await Promise.race([
        eventService.getAllEvents(),
        timeoutPromise
      ]);

      if (result.success && result.events) {
        console.log('✅ 加载活动列表:', result.events.length, '个活动');
        setEvents(result.events);
      } else {
        console.error('❌ 加载活动失败:', result.error);
        // 静默失败，不显示错误提示
      }
    } catch (error) {
      console.error('❌ 加载活动异常:', error);
    } finally {
      setLoading(false);
    }
  };

  // 加载活动详情（包括议程和评价）
  const loadEventDetail = async (eventId: string) => {
    console.log('📥 加载活动详情:', eventId);

    // 始终从 Supabase 获取完整的活动详情（包括 agenda 和 reviews）
    // 因为列表接口不包含这些关联数据
    const result = await eventService.getEventById(eventId);
    if (result.success && result.event) {
      console.log('✅ 从 Supabase 加载活动详情成功（包含 agenda 和 reviews）');
      setSelectedEvent(result.event);
    } else {
      console.error('❌ 加载活动详情失败:', result.error);
      toast.error('活动不存在');
      setCurrentPage('home');
    }
  };

  // 加载用户特定数据
  const loadUserData = async (email: string) => {
    console.log('📥 加载用户数据:', email);

    // 加载报名活动
    const registered = await userEventService.getRegisteredEvents(email);
    if (registered.success && registered.eventIds) {
      setRegisteredEvents(registered.eventIds);
      console.log('  ✅ 报名活动:', registered.eventIds.length);
    }

    // 加载收藏活动
    const favorite = await userEventService.getFavoriteEvents(email);
    if (favorite.success && favorite.eventIds) {
      setFavoriteEvents(favorite.eventIds);
      console.log('  ✅ 收藏活动:', favorite.eventIds.length);
    }

    // 加载发布的活动
    const published = await eventService.getUserPublishedEvents(email);
    if (published.success && published.events) {
      setPublishedEvents(published.events.map(e => e.id));
      console.log('  ✅ 发布活动:', published.events.length);
    }

    // 加载草稿活动
    const drafts = await eventService.getUserDraftEvents(email);
    if (drafts.success && drafts.events) {
      setDraftEvents(drafts.events.map(e => e.id));
      console.log('  ✅ 草稿活动:', drafts.events.length);
    }

    // 加载关注的主办方
    const followed = await userEventService.getFollowedOrganizers(email);
    if (followed.success && followed.organizers) {
      setFollowedOrganizers(followed.organizers);
      console.log('  ✅ 关注主办方:', followed.organizers.length);
    }
  };

  // 用户登录
  const handleLogin = async (email: string, password: string) => {
    const result = await authService.login({ email, password });

    if (result.success && result.user) {
      // Supabase Auth 自动管理会话，不需要手动保存到 localStorage
      // onAuthStateChange 监听器会自动更新 user 状态
      setShowLoginDialog(false);
      toast.success("登录成功！", {
        description: "欢迎回来，" + result.user.name,
      });
      console.log('✅ 登录成功:', result.user.email);
    } else {
      toast.error(result.error || "登录失败");
    }
  };

  // 用户注册
  const handleRegister = async (
    name: string,
    email: string,
    password: string
  ) => {
    const result = await authService.register({ name, email, password });

    if (result.success && result.user) {
      // Supabase Auth 自动管理会话
      setShowRegisterDialog(false);

      // 检查是否需要邮箱验证
      if (result.needsEmailConfirmation) {
        toast.success("注册成功！", {
          description: "请检查您的邮箱并点击验证链接",
          duration: 5000,
        });
      } else {
        toast.success("注册成功！", {
          description: "欢迎加入，" + result.user.name,
        });
      }
      console.log('✅ 注册成功:', result.user.email);
    } else {
      toast.error(result.error || "注册失败");
    }
  };

  // 用户登出
  const handleLogout = async () => {
    console.log('🔄 开始登出流程...');
    try {
      const result = await authService.logout();
      console.log('📤 登出结果:', result);

      if (result.success) {
        // onAuthStateChange 监听器会自动清空 user 状态
        setCurrentPage("home");
        toast.success("已退出登录");
        console.log('✅ 用户已登出');
      } else {
        console.error('❌ 登出失败:', result.error);
        toast.error(result.error || "登出失败");
      }
    } catch (error) {
      console.error('💥 登出异常:', error);
      toast.error("登出过程中发生错误");
    }
  };

  // 更新用户资料
  const handleUpdateProfile = async (updates: {
    name?: string;
    email?: string;
    phone?: string;
    avatar?: string | null;
    bio?: string | null;
    password?: string;
  }) => {
    if (!user) return;

    // 如果更新phone，显示警告（数据库暂无此字段）
    if (updates.phone !== undefined) {
      toast.error("暂不支持绑定手机号");
      return;
    }

    const result = await authService.updateProfile(user.id, updates);

    if (result.success && result.user) {
      // 检查是否需要邮箱验证
      if (result.needsEmailConfirmation) {
        toast.success("邮箱更新成功！", {
          description: "请检查新邮箱并点击验证链接以完成更改",
          duration: 6000,
        });
      } else {
        toast.success("资料更新成功");
      }
      console.log('✅ 资料更新成功');
    } else {
      toast.error(result.error || "更新失败");
    }
  };

  // 更新用户头像
  const handleUpdateAvatar = async (avatarUrl: string) => {
    await handleUpdateProfile({ avatar: avatarUrl });
  };

  // 删除用户账户
  const handleDeleteAccount = async () => {
    if (!user) return;

    const result = await authService.deleteAccount(user.id);

    if (result.success) {
      handleLogout();
      toast.success("账户已删除");
      console.log('✅ 账户已删除');
    } else {
      toast.error(result.error || "删除失败");
    }
  };

  // 报名活动
  const handleRegisterEvent = async (eventId: string) => {
    if (!user) {
      setShowLoginDialog(true);
      return;
    }

    // 检查是否已报名
    if (registeredEvents.includes(eventId)) {
      toast.error("您已经报名过此活动");
      return;
    }

    const result = await userEventService.registerForEvent(user.email, eventId);

    if (result.success) {
      setRegisteredEvents([...registeredEvents, eventId]);
      // 增加活动参与人数
      await eventService.incrementAttendees(eventId);
      // 重新加载活动列表以更新 attendees
      await loadEvents();
      toast.success("报名成功");
      console.log('✅ 报名成功:', eventId);
    } else {
      toast.error(result.error || "报名失败");
    }
  };

  // 取消报名
  const handleUnregisterEvent = async (eventId: string) => {
    if (!user) return;

    const result = await userEventService.unregisterFromEvent(user.email, eventId);

    if (result.success) {
      setRegisteredEvents(registeredEvents.filter(id => id !== eventId));
      // 减少活动参与人数
      await eventService.decrementAttendees(eventId);
      // 重新加载活动列表以更新 attendees
      await loadEvents();
      toast.success("已取消报名");
      console.log('✅ 取消报名:', eventId);
    } else {
      toast.error(result.error || "取消失败");
    }
  };

  // 收藏活动
  const handleToggleFavorite = async (eventId: string) => {
    if (!user) {
      setShowLoginDialog(true);
      return;
    }

    const isFavorited = favoriteEvents.includes(eventId);

    if (isFavorited) {
      // 取消收藏
      const result = await userEventService.unfavoriteEvent(user.email, eventId);
      if (result.success) {
        setFavoriteEvents(favoriteEvents.filter(id => id !== eventId));
        toast.success("已取消收藏");
        console.log('✅ 取消收藏:', eventId);
      } else {
        toast.error(result.error || "操作失败");
      }
    } else {
      // 添加收藏
      const result = await userEventService.favoriteEvent(user.email, eventId);
      if (result.success) {
        setFavoriteEvents([...favoriteEvents, eventId]);
        toast.success("已添加到收藏");
        console.log('✅ 添加收藏:', eventId);
      } else {
        toast.error(result.error || "操作失败");
      }
    }
  };

  // 关注主办方
  const handleToggleFollowOrganizer = async (organizerName: string) => {
    if (!user) {
      setShowLoginDialog(true);
      return;
    }

    const isFollowed = followedOrganizers.includes(organizerName);

    if (isFollowed) {
      // 取消关注
      const result = await userEventService.unfollowOrganizer(user.email, organizerName);
      if (result.success) {
        setFollowedOrganizers(followedOrganizers.filter(name => name !== organizerName));
        toast.success("已取消关注");
        console.log('✅ 取消关注:', organizerName);
      } else {
        toast.error(result.error || "操作失败");
      }
    } else {
      // 关注
      const result = await userEventService.followOrganizer(user.email, organizerName);
      if (result.success) {
        setFollowedOrganizers([...followedOrganizers, organizerName]);
        toast.success("已关注主办方");
        console.log('✅ 关注主办方:', organizerName);
      } else {
        toast.error(result.error || "操作失败");
      }
    }
  };

  // 添加活动评价
  const handleAddReview = async (
    eventId: string,
    rating: number,
    comment: string
  ) => {
    if (!user) {
      setShowLoginDialog(true);
      return;
    }

    const result = await reviewService.addReview(
      eventId,
      user.email,
      user.name,
      user.avatar || null,
      rating,
      comment
    );

    if (result.success) {
      // 重新加载活动详情以刷新评价列表
      await loadEventDetail(eventId);
      toast.success("评价已发布");
      console.log('✅ 评价已发布');
    } else {
      toast.error(result.error || "评价失败");
    }
  };

  // 创建或更新活动
  const handleSaveEvent = async (event: Event, isDraft: boolean) => {
    if (!user) {
      setShowLoginDialog(true);
      return;
    }

    const eventData = {
      ...event,
      status: isDraft ? 'draft' as const : 'published' as const,
    };

    if (editingEventId) {
      // 更新现有活动
      const result = await eventService.updateEvent(editingEventId, eventData);
      if (result.success) {
        await loadEvents();
        setEditingEventId(null);
        setEditingEventData(null); // 清除编辑数据
        setCurrentPage("profile");
        setProfileDefaultTab(isDraft ? "drafts" : "published");
        toast.success(isDraft ? "草稿已保存" : "活动已更新");
        console.log('✅ 活动已更新:', editingEventId);
      } else {
        toast.error(result.error || "更新失败");
      }
    } else {
      // 创建新活动
      const result = await eventService.createEvent(eventData, user.email);
      if (result.success) {
        await loadEvents();
        if (isDraft) {
          setDraftEvents([...draftEvents, event.id]);
        } else {
          setPublishedEvents([...publishedEvents, event.id]);
        }
        setEditingEventData(null); // 清除编辑数据（以防万一）
        setCurrentPage("profile");
        setProfileDefaultTab(isDraft ? "drafts" : "published");
        toast.success(isDraft ? "草稿已保存" : "活动已发布");
        console.log('✅ 活动已创建:', event.id);
      } else {
        toast.error(result.error || "保存失败");
      }
    }
  };

  // 删除活动
  const handleDeleteEvent = async (eventId: string) => {
    const result = await eventService.deleteEvent(eventId);

    if (result.success) {
      await loadEvents();
      setPublishedEvents(publishedEvents.filter(id => id !== eventId));
      setDraftEvents(draftEvents.filter(id => id !== eventId));
      toast.success("活动已删除");
      console.log('✅ 活动已删除:', eventId);
    } else {
      toast.error(result.error || "删除失败");
    }
  };

  // 发布草稿
  const handlePublishDraft = async (eventId: string) => {
    const result = await eventService.updateEvent(eventId, { status: 'published' });

    if (result.success) {
      await loadEvents();
      setDraftEvents(draftEvents.filter(id => id !== eventId));
      setPublishedEvents([...publishedEvents, eventId]);
      toast.success("活动已发布");
      console.log('✅ 草稿已发布:', eventId);
    } else {
      toast.error(result.error || "发布失败");
    }
  };

  // 页面导航
  const handleNavigate = (
    page: "home" | "discover" | "profile" | "event-detail" | "create-event" | "migration",
    eventId?: string,
    category?: string
  ) => {
    setCurrentPage(page);
    if (eventId) {
      setSelectedEventId(eventId);
    } else if (page !== 'event-detail') {
      // 离开详情页时清空选中的活动
      setSelectedEventId(null);
      setSelectedEvent(null);
    }
    // 离开创建/编辑页面时清空编辑状态
    if (page !== 'create-event') {
      setEditingEventId(null);
      setEditingEventData(null);
    }
    // 处理发现页的分类筛选
    if (page === 'discover') {
      setDiscoverCategory(category); // 设置为 category 或 undefined（清空）
    }
    window.scrollTo(0, 0);
  };

  // 编辑活动
  const handleEditEvent = async (eventId: string) => {
    setEditingEventId(eventId);
    // 使用 getEventById 加载完整的活动数据（包括议程）
    const result = await eventService.getEventById(eventId);
    if (result.success && result.event) {
      setEditingEventData(result.event);
      console.log('✅ 加载完整活动数据（含议程）:', result.event);
    } else {
      console.error('❌ 加载活动详情失败:', result.error);
      toast.error('加载活动详情失败');
      // 回退到列表数据
      const fallbackEvent = events.find(e => e.id === eventId);
      setEditingEventData(fallbackEvent || null);
    }
    setCurrentPage("create-event");
  };

  // 搜索活动
  const handleSearch = async (keyword: string) => {
    if (!keyword.trim()) {
      await loadEvents();
      return;
    }

    const result = await eventService.searchEvents(keyword);
    if (result.success && result.events) {
      setEvents(result.events);
      console.log('✅ 搜索结果:', result.events.length, '个活动');
    } else {
      toast.error(result.error || "搜索失败");
    }
  };

  // 渲染当前页面
  const renderCurrentPage = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">加载中...</p>
          </div>
        </div>
      );
    }

    switch (currentPage) {
      case "home":
        return (
          <>
            <Hero
              onSearch={handleSearch}
              onNavigate={handleNavigate}
              user={user}
              onLogin={() => setShowLoginDialog(true)}
            />
            <Categories onNavigate={handleNavigate} />
            <FeaturedEvents
              events={events}
              onNavigate={handleNavigate}
              user={user}
              onToggleFavorite={handleToggleFavorite}
              favoriteEvents={favoriteEvents}
            />
          </>
        );

      case "discover":
        return (
          <DiscoverPage
            events={events}
            category={discoverCategory}
            onNavigate={handleNavigate}
            onClearCategory={() => setDiscoverCategory(undefined)}
            user={user}
            onToggleFavorite={handleToggleFavorite}
            favoriteEvents={favoriteEvents}
          />
        );

      case "profile":
        if (!user) {
          setShowLoginDialog(true);
          setCurrentPage("home");
          return null;
        }
        // 将 ID 数组转换为 Event 对象数组
        const registeredEventsList = events.filter(e => registeredEvents.includes(e.id));
        const favoriteEventsList = events.filter(e => favoriteEvents.includes(e.id));
        const publishedEventsList = events.filter(e => publishedEvents.includes(e.id));
        const draftEventsList = events.filter(e => draftEvents.includes(e.id));

        return (
          <ProfilePage
            user={user}
            allEvents={events}
            registeredEvents={registeredEventsList}
            favoriteEvents={favoriteEventsList}
            publishedEvents={publishedEventsList}
            draftEvents={draftEventsList}
            followedOrganizers={followedOrganizers}
            onNavigate={handleNavigate}
            onEventClick={(eventId) => handleNavigate("event-detail", eventId)}
            onEditEvent={handleEditEvent}
            onDeleteEvent={handleDeleteEvent}
            onPublishDraft={handlePublishDraft}
            onUpdateProfile={handleUpdateProfile}
            onUpdateAvatar={handleUpdateAvatar}
            onDeleteAccount={handleDeleteAccount}
            onUnregisterEvent={handleUnregisterEvent}
            onToggleFavorite={handleToggleFavorite}
            onToggleFollowOrganizer={handleToggleFollowOrganizer}
            defaultTab={profileDefaultTab}
          />
        );

      case "event-detail":
        if (!selectedEventId || !selectedEvent) {
          // 显示加载状态
          return (
            <div className="flex items-center justify-center min-h-screen">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">加载活动详情...</p>
              </div>
            </div>
          );
        }
        return (
          <EventDetailPage
            event={selectedEvent}
            onNavigate={handleNavigate}
            onRegister={handleRegisterEvent}
            onToggleFavorite={handleToggleFavorite}
            onToggleFollowOrganizer={handleToggleFollowOrganizer}
            onAddReview={(eventId, review) => handleAddReview(eventId, review.rating, review.comment)}
            user={user}
            isRegistered={registeredEvents.includes(selectedEventId)}
            isFavorited={favoriteEvents.includes(selectedEventId)}
            isFollowingOrganizer={
              selectedEvent.organizer
                ? followedOrganizers.includes(selectedEvent.organizer.name)
                : false
            }
          />
        );

      case "create-event":
        if (!user) {
          setShowLoginDialog(true);
          setCurrentPage("home");
          return null;
        }
        // 使用 editingEventData（包含完整的议程数据）而不是从列表中查找
        return (
          <CreateEventPage
            onEventCreate={(event, isDraft) => handleSaveEvent(event, isDraft || false)}
            onEventUpdate={(event) => handleSaveEvent(event, false)}
            onNavigate={handleNavigate}
            editingEvent={editingEventData}
            user={user}
          />
        );

      case "migration":
        return (
          <div className="container mx-auto px-4 py-8">
            <MigrationTool />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header
        user={user}
        onLogin={() => setShowLoginDialog(true)}
        onRegister={() => setShowRegisterDialog(true)}
        onLogout={handleLogout}
        onNavigate={handleNavigate}
      />

      {renderCurrentPage()}

      <Footer onNavigate={handleNavigate} />

      <LoginDialog
        open={showLoginDialog}
        onOpenChange={setShowLoginDialog}
        onLogin={handleLogin}
        onSwitchToRegister={() => {
          setShowLoginDialog(false);
          setShowRegisterDialog(true);
        }}
      />

      <RegisterDialog
        open={showRegisterDialog}
        onOpenChange={setShowRegisterDialog}
        onRegister={handleRegister}
        onSwitchToLogin={() => {
          setShowRegisterDialog(false);
          setShowLoginDialog(true);
        }}
      />

      <Toaster position="top-center" richColors />
    </div>
  );
}
