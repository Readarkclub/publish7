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
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner@2.0.3";
import type { Event } from "./types/event";

// 初始活动数据
const initialEvents: Event[] = [];

/*
// 所有硬编码的活动已被删除
// 之前的活动数据：
/*
  {
    id: "event-1",
    title: "夏日音乐节 2025 - 全明星阵容震撼来袭",
    date: "2025年7月15日 18:00",
    location: "上海世博公园",
    category: "音乐",
    attendees: 2500,
    price: "¥299起",
    imageUrl:
      "https://images.unsplash.com/photo-1672841821756-fc04525771c2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNpYyUyMGZlc3RpdmFsJTIwY29uY2VydHxlbnwxfHx8fDE3NjA1MTE4OTZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    organizer: {
      name: "星空文化传媒",
      avatar: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxldmVudCUyMG9yZ2FuaXplciUyMHRlYW18ZW58MXx8fHwxNzYwNTkxNzkxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      description: "专注于大型音乐节和文化活动策划，已成功举办超过50场大型活动。",
      eventsCount: 52
    },
  },
  {
    id: "event-2",
    title: "全球开发者技术峰会 - AI与未来",
    date: "2025年8月20日 09:00",
    location: "北京国家会议中心",
    category: "科技",
    attendees: 1800,
    price: "¥599",
    imageUrl:
      "https://images.unsplash.com/photo-1760385737059-c65b583ec23e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWNoJTIwY29uZmVyZW5jZSUyMG5ldHdvcmtpbmd8ZW58MXx8fHwxNzYwNTkwMTg3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    organizer: {
      name: "智慧科技会展",
      avatar: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&h=100&fit=crop",
      description: "专业的科技峰会组织者，致力于推动技术创新与交流。",
      eventsCount: 35
    },
  },
  {
    id: "event-3",
    title: "城市马拉松 - 用脚步丈量城市",
    date: "2025年9月10日 06:00",
    location: "深圳湾公园",
    category: "体育",
    attendees: 5000,
    price: "¥150",
    imageUrl:
      "https://images.unsplash.com/photo-1695655300485-d3da8bc72076?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcG9ydHMlMjBtYXJhdGhvbiUyMHJ1bm5pbmd8ZW58MXx8fHwxNzYwNTkwMTg4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    organizer: {
      name: "城市跑者联盟",
      avatar: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=100&h=100&fit=crop",
      description: "推广健康运动文化，组织专业的跑步赛事。",
      eventsCount: 28
    },
  },
  {
    id: "event-4",
    title: "当代艺术展览 - 光影之间",
    date: "2025年6月1日 - 8月31日",
    location: "广州K11艺术中心",
    category: "艺术",
    attendees: 850,
    price: "免费",
    imageUrl:
      "https://images.unsplash.com/photo-1719398026703-0d3f3d162e51?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnQlMjBleGhpYml0aW9uJTIwZ2FsbGVyeXxlbnwxfHx8fDE3NjA1OTAxODh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    organizer: {
      name: "当代艺术空间",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
      description: "专注于当代艺术展览策划，推动艺术创新与文化交流。",
      eventsCount: 42
    },
  },
  {
    id: "event-5",
    title: "产品设计工作坊 - 从0到1打造产品",
    date: "2025年7月5日 14:00",
    location: "杭州梦想小镇",
    category: "教育",
    attendees: 120,
    price: "¥399",
    imageUrl:
      "https://images.unsplash.com/photo-1759456629213-3db5a7bb53ae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b3Jrc2hvcCUyMHNlbWluYXIlMjBsZWFybmluZ3xlbnwxfHx8fDE3NjA1MTE4OTZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    organizer: {
      name: "创新学院",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
      description: "提供专业的产品设计与创新培训课程。",
      eventsCount: 65
    },
  },
  {
    id: "event-6",
    title: "电音派对 - 狂欢之夜",
    date: "2025年10月18日 20:00",
    location: "成都339派对现场",
    category: "娱乐",
    attendees: 3200,
    price: "¥199起",
    imageUrl:
      "https://images.unsplash.com/photo-1644959166965-8606f1ce1f06?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb25jZXJ0JTIwY3Jvd2QlMjBldmVudHxlbnwxfHx8fDE3NjA1NTg2MDl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    organizer: {
      name: "夜猫娱乐",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
      description: "打造最潮流的电音派对，为年轻人提供精彩夜生活。",
      eventsCount: 38
    },
  },
  {
    id: "event-7",
    title: "美食节 - 舌尖上的世界",
    date: "2025年6月20日 - 6月22日",
    location: "上海新天地",
    category: "美食",
    attendees: 4500,
    price: "免费",
    imageUrl:
      "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb29kJTIwZmVzdGl2YWwlMjBjb29raW5nfGVufDF8fHx8MTc2MDU5MDg4NXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    organizer: {
      name: "美食家俱乐部",
      avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop",
      description: "汇聚全球美食，为美食爱好者打造盛宴体验。",
      eventsCount: 45
    },
  },
  {
    id: "event-8",
    title: "瑜伽健康周 - 身心平衡之旅",
    date: "2025年7月1日 07:00",
    location: "杭州西湖公园",
    category: "健康",
    attendees: 280,
    price: "¥88",
    imageUrl:
      "https://images.unsplash.com/photo-1588286840104-8957b019727f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b2dhJTIwbWVkaXRhdGlvbiUyMHdlbGxuZXNzfGVufDF8fHx8MTc2MDU5MDg4NXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    organizer: {
      name: "禅意生活馆",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
      description: "倡导健康生活方式，提供专业的瑜伽与冥想指导。",
      eventsCount: 56
    },
  },
  {
    id: "event-9",
    title: "创业融资路演 - 寻找投资伙伴",
    date: "2025年8月5日 14:00",
    location: "深圳湾创新广场",
    category: "商业",
    attendees: 200,
    price: "¥299",
    imageUrl:
      "https://images.unsplash.com/photo-1731943738058-fcfae47b2367?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMGV2ZW50JTIwbmV0d29ya2luZ3xlbnwxfHx8fDE3NjA1OTA4ODV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    organizer: {
      name: "创投��",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop",
      description: "连接创业者与投资人，助力优秀项目成长。",
      eventsCount: 31
    },
  },
  {
    id: "event-10",
    title: "户外徒步 - 探索自然之美",
    date: "2025年9月28日 06:30",
    location: "����风景区",
    category: "户外",
    attendees: 150,
    price: "¥199",
    imageUrl:
      "https://images.unsplash.com/photo-1551632811-561732d1e306?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaWtpbmclMjBvdXRkb29yJTIwbmF0dXJlfGVufDF8fHx8MTc2MDU5MDg4NXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    organizer: {
      name: "探索者户外",
      avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop",
      description: "专业的户外活动组织者，带你探索大自然的美丽。",
      eventsCount: 47
    },
  },
*/

// 检查 localStorage 使用情况
const getLocalStorageUsage = () => {
  let total = 0;
  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      total += localStorage[key].length + key.length;
    }
  }
  return {
    used: total,
    usedKB: (total / 1024).toFixed(2),
    usedMB: (total / 1024 / 1024).toFixed(2),
  };
};

// localStorage 键名
const STORAGE_KEYS = {
  USER: "eventApp_user",
  EVENTS: "eventApp_events", // 全局活动数据，不随用户登录退出而变化
  CURRENT_USER_EMAIL: "eventApp_currentUserEmail", // 当前登录用户的邮箱
  REGISTERED_USERS: "eventApp_registeredUsers", // 存储所有已注册用户的凭证
};

// 获取用户特定数据的键名
const getUserStorageKey = (email: string, dataType: string) => {
  return `eventApp_user_${email}_${dataType}`;
};

// 从 localStorage 获取数据的辅助函数
const getFromLocalStorage = <T,>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    if (item) {
      const parsed = JSON.parse(item);
      // 对活动数据打印详细日志
      if (key === STORAGE_KEYS.EVENTS) {
        console.log(`📖 从 localStorage 读取 ${key}:`, Array.isArray(parsed) ? `${parsed.length} 个活动` : parsed);
      }
      return parsed;
    }
    return defaultValue;
  } catch (error) {
    console.error(`❌ 读取 ${key} 失败:`, error);
    return defaultValue;
  }
};

// 保存数据到 localStorage 的辅助函数
const saveToLocalStorage = <T,>(key: string, value: T): void => {
  try {
    const jsonString = JSON.stringify(value);
    const sizeInBytes = new Blob([jsonString]).size;
    const sizeInKB = (sizeInBytes / 1024).toFixed(2);
    
    localStorage.setItem(key, jsonString);
    
    // 对活动数据打印详细日志
    if (key === STORAGE_KEYS.EVENTS) {
      console.log(`💾 保存活动数据: ${Array.isArray(value) ? value.length : 0} 个活动 (${sizeInKB} KB)`);
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      const usage = getLocalStorageUsage();
      console.error(`❌ localStorage 配额已满! 当前使用: ${usage.usedMB} MB`);
      
      // 显示错误提示
      toast.error("存储空间已满", {
        description: `已使用 ${usage.usedMB} MB。请删除一些旧活动、图片，或清除浏览器缓存。`,
        duration: 5000,
      });
    } else {
      console.error(`❌ 保存 ${key} 失败:`, error);
      toast.error("保存失败", {
        description: "数据保存时出错，请重试"
      });
    }
  }
};

// 获取用户特定数据
const getUserData = (email: string, dataType: string, defaultValue: any) => {
  return getFromLocalStorage(getUserStorageKey(email, dataType), defaultValue);
};

// 保存用户特定数据
const saveUserData = (email: string, dataType: string, value: any) => {
  saveToLocalStorage(getUserStorageKey(email, dataType), value);
};

// 用户凭证管理
interface UserCredential {
  email: string;
  password: string;
  name: string;
}

// 获取所有已注册用户
const getRegisteredUsers = (): UserCredential[] => {
  return getFromLocalStorage<UserCredential[]>(STORAGE_KEYS.REGISTERED_USERS, []);
};

// 保存已注册用户
const saveRegisteredUser = (credential: UserCredential) => {
  const users = getRegisteredUsers();
  users.push(credential);
  saveToLocalStorage(STORAGE_KEYS.REGISTERED_USERS, users);
};

// 检查用户是否已注册
const isUserRegistered = (email: string): boolean => {
  const users = getRegisteredUsers();
  return users.some(user => user.email.toLowerCase() === email.toLowerCase());
};

// 验证用户凭证
const validateUserCredentials = (email: string, password: string): UserCredential | null => {
  const users = getRegisteredUsers();
  return users.find(
    user => user.email.toLowerCase() === email.toLowerCase() && user.password === password
  ) || null;
};

// 邮箱格式验证
const validateEmailFormat = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export default function App() {
  const [currentPage, setCurrentPage] = useState<
    | "home"
    | "discover"
    | "profile"
    | "event-detail"
    | "create-event"
  >("home");
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  
  // 从 localStorage 初始化用户状态
  const [user, setUser] = useState<{
    name: string;
    email: string;
    avatar?: string;
    phone?: string;
  } | null>(() => {
    const currentUser = getFromLocalStorage(STORAGE_KEYS.USER, null);
    console.log("页面初始化 - 当前用户:", currentUser);
    
    if (!currentUser) return null;
    
    // 尝试从用户特定存储中恢复完整的 profile 信息
    const savedProfile = getUserData(currentUser.email, "profile", null);
    console.log("页面初始化 - 保存的 Profile:", savedProfile);
    
    const finalUser = savedProfile || currentUser;
    console.log("页面初始化 - 最终用户:", finalUser);
    
    return finalUser;
  });
  
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [showRegisterDialog, setShowRegisterDialog] = useState(false);
  
  // 全局活动数据（所有用户共享）
  const [events, setEvents] = useState<Event[]>(() => {
    const loadedEvents = getFromLocalStorage(STORAGE_KEYS.EVENTS, initialEvents);
    console.log("🔄 页面初始化 - 从 localStorage 加载", loadedEvents.length, "个活动");
    return loadedEvents;
  });
  
  // 用户特定数据（根据当前登录用户初始化）
  const [registeredEvents, setRegisteredEvents] = useState<string[]>(() => {
    const currentUser = getFromLocalStorage(STORAGE_KEYS.USER, null);
    return currentUser ? getUserData(currentUser.email, "registeredEvents", []) : [];
  });
  
  const [favoriteEvents, setFavoriteEvents] = useState<string[]>(() => {
    const currentUser = getFromLocalStorage(STORAGE_KEYS.USER, null);
    return currentUser ? getUserData(currentUser.email, "favoriteEvents", []) : [];
  });
  
  const [publishedEvents, setPublishedEvents] = useState<string[]>(() => {
    const currentUser = getFromLocalStorage(STORAGE_KEYS.USER, null);
    return currentUser ? getUserData(currentUser.email, "publishedEvents", []) : [];
  });
  
  const [draftEvents, setDraftEvents] = useState<string[]>(() => {
    const currentUser = getFromLocalStorage(STORAGE_KEYS.USER, null);
    return currentUser ? getUserData(currentUser.email, "draftEvents", []) : [];
  });
  
  const [followedOrganizers, setFollowedOrganizers] = useState<string[]>(() => {
    const currentUser = getFromLocalStorage(STORAGE_KEYS.USER, null);
    return currentUser ? getUserData(currentUser.email, "followedOrganizers", []) : [];
  });
  
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [profileDefaultTab, setProfileDefaultTab] = useState<string>("registered");
  const [discoverCategory, setDiscoverCategory] = useState<string | undefined>(undefined);

  // 智能清空旧的硬编码活动数据（只清空一次，不影响用户创建的活动）
  useEffect(() => {
    const CLEARED_KEY = "eventApp_hardcodedEventsCleared_v4";
    const hasBeenCleared = localStorage.getItem(CLEARED_KEY);
    
    console.log("🔍 检查清空标志:", hasBeenCleared ? "已清空" : "未清空");
    
    if (!hasBeenCleared) {
      // 只在首次访问时检查并清空旧的硬编码活动
      const currentEvents = getFromLocalStorage<Event[]>(STORAGE_KEYS.EVENTS, []);
      console.log("🔍 当前活动数量:", currentEvents.length);
      
      // 检查是否有旧的硬编码活动（通过特定 ID 前缀识别）
      const hardcodedIds = ["event-1", "event-2", "event-3", "event-4", "event-5", "event-6"];
      const hasOldHardcodedEvents = currentEvents.some(event => hardcodedIds.includes(event.id));
      
      if (hasOldHardcodedEvents) {
        console.log("🗑️ 检测到旧的硬编码活动，正在清空...");
        // 只清空旧的硬编码活动，保留用户创建的活动
        const userCreatedEvents = currentEvents.filter(event => !hardcodedIds.includes(event.id));
        console.log("📊 清空后剩余活动数量:", userCreatedEvents.length);
        setEvents(userCreatedEvents);
        saveToLocalStorage(STORAGE_KEYS.EVENTS, userCreatedEvents);
        console.log("✅ 已清空硬编码活动，保留", userCreatedEvents.length, "个用户创建的活动");
      } else {
        console.log("✅ 没有检测到旧的硬编码活动");
      }
      
      // 标记已清空，避免重复执行
      localStorage.setItem(CLEARED_KEY, "true");
      console.log("🏷️ 已设置清空标志");
    }
    
    // 打印 localStorage 使用情况
    const usage = getLocalStorageUsage();
    console.log(`📊 localStorage 使用情况: ${usage.usedKB} KB (${usage.usedMB} MB)`);
  }, []);

  // 处理 URL 参数 - 从分享链接打开活动详情
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const eventId = params.get('event');
      
      if (eventId) {
        // 检查活动是否存在
        const eventExists = events.some((e) => e.id === eventId);
        if (eventExists) {
          setSelectedEventId(eventId);
          setCurrentPage("event-detail");
          // 清除 URL 参数，避免重复触发
          window.history.replaceState({}, '', window.location.pathname);
        }
      }
    }
  }, [events]);

  // 同步用户基本信息到 localStorage
  useEffect(() => {
    saveToLocalStorage(STORAGE_KEYS.USER, user);
    // 同时保存到用户特定的存储中，以便下次登录时恢复完整信息
    if (user?.email) {
      saveUserData(user.email, "profile", user);
    }
  }, [user]);

  // 同步全局活动数据到 localStorage
  useEffect(() => {
    saveToLocalStorage(STORAGE_KEYS.EVENTS, events);
  }, [events]);

  // 同步用户特定数据到 localStorage（只有在用户登录时）
  useEffect(() => {
    if (user?.email) {
      saveUserData(user.email, "registeredEvents", registeredEvents);
    }
  }, [registeredEvents, user?.email]);

  useEffect(() => {
    if (user?.email) {
      saveUserData(user.email, "favoriteEvents", favoriteEvents);
    }
  }, [favoriteEvents, user?.email]);

  useEffect(() => {
    if (user?.email) {
      saveUserData(user.email, "publishedEvents", publishedEvents);
    }
  }, [publishedEvents, user?.email]);

  useEffect(() => {
    if (user?.email) {
      saveUserData(user.email, "draftEvents", draftEvents);
    }
  }, [draftEvents, user?.email]);

  useEffect(() => {
    if (user?.email) {
      saveUserData(user.email, "followedOrganizers", followedOrganizers);
    }
  }, [followedOrganizers, user?.email]);

  const handleLogin = (email: string, password: string) => {
    // 验证邮箱格式
    if (!validateEmailFormat(email)) {
      toast.error("请输入有效的邮箱地址");
      return;
    }

    // 验证用户凭证
    const credential = validateUserCredentials(email, password);
    
    if (!credential) {
      // 检查用户是否存在
      if (isUserRegistered(email)) {
        toast.error("密码错误，请重试");
      } else {
        toast.error("该账号未注册", {
          description: "请先注册账号",
        });
      }
      return;
    }
    
    // 登录成功，恢复用户信息
    const savedUserProfile = getUserData(email, "profile", null);
    
    // 调试信息：检查是否有保存的 profile
    console.log("登录用户:", email);
    console.log("保存的 Profile:", savedUserProfile);
    
    // 如果有保存的 profile，使用它；否则创建新的用户数据
    const userData = savedUserProfile ? {
      ...savedUserProfile,
      // 确保 email 是最新的（以防万一）
      email: credential.email,
    } : {
      name: credential.name,
      email: credential.email,
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop",
    };
    
    console.log("使用的 userData:", userData);
    
    // 如果使用的是默认用户数据（没有保存的 profile），立即保存一份
    if (!savedUserProfile) {
      saveUserData(email, "profile", userData);
    }
    
    setUser(userData);
    
    // 恢复该用户的数据
    setRegisteredEvents(getUserData(email, "registeredEvents", []));
    setFavoriteEvents(getUserData(email, "favoriteEvents", []));
    setPublishedEvents(getUserData(email, "publishedEvents", []));
    setDraftEvents(getUserData(email, "draftEvents", []));
    setFollowedOrganizers(getUserData(email, "followedOrganizers", []));
    
    setShowLoginDialog(false);
    toast.success("登录成功！", {
      description: "欢迎回来，" + userData.name,
    });
  };

  const handleRegister = (
    name: string,
    email: string,
    password: string,
  ) => {
    // 验证用户名
    if (!name.trim()) {
      toast.error("请输入用户名");
      return;
    }

    if (name.trim().length < 2) {
      toast.error("用户名至少需要2个字符");
      return;
    }

    // 验证邮箱格式
    if (!validateEmailFormat(email)) {
      toast.error("请输入有效的邮箱地址");
      return;
    }

    // 检查邮箱是否已注册
    if (isUserRegistered(email)) {
      toast.error("该邮箱已被注册", {
        description: "请直接登录或使用其他邮箱",
      });
      return;
    }

    // 验证密码长度
    if (password.length < 8) {
      toast.error("密码长度至少为8位");
      return;
    }

    // 注册成功，保存用户凭证
    saveRegisteredUser({
      email: email,
      password: password,
      name: name.trim(),
    });

    // 创建用户数据
    const userData = {
      name: name.trim(),
      email: email,
      avatar:
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop",
    };
    
    setUser(userData);
    
    // 立即保存用户 profile 到 localStorage
    saveUserData(email, "profile", userData);
    
    // 新用户，初始化空数据
    setRegisteredEvents([]);
    setFavoriteEvents([]);
    setPublishedEvents([]);
    setDraftEvents([]);
    setFollowedOrganizers([]);
    
    setShowRegisterDialog(false);
    toast.success("注册成功！", {
      description: "欢迎加入活动圈，" + name,
    });
  };

  const handleLogout = () => {
    // 注意：不清除用户数据，���清除登录状态
    // 用户数据已经通过 useEffect 保存到了对应用户的 localStorage 键中
    setUser(null);
    setCurrentPage("home");
    
    // 清空当前会话的用户数据状态（但不删除 localStorage 中的数据）
    setRegisteredEvents([]);
    setFavoriteEvents([]);
    setPublishedEvents([]);
    setDraftEvents([]);
    setFollowedOrganizers([]);
    
    // 只清除当前用户登录状态
    localStorage.removeItem(STORAGE_KEYS.USER);
    
    toast.success("已退出登录");
  };

  const handleDeleteAccount = () => {
    if (!user) return;

    const userEmail = user.email;
    
    // 1. 从用户凭证列表中删除该用户
    const registeredUsers = getRegisteredUsers();
    const updatedUsers = registeredUsers.filter(
      u => u.email.toLowerCase() !== userEmail.toLowerCase()
    );
    saveToLocalStorage(STORAGE_KEYS.REGISTERED_USERS, updatedUsers);
    
    // 2. 删除用户发布的所有活动和评价
    setEvents((prevEvents) => 
      prevEvents.map((event) => {
        // 如果是该用户发布的活动，删除整个活动
        if (event.createdBy === userEmail) {
          return null;
        }
        // 删除该用户在其他活动中的评价
        if (event.reviews && event.reviews.length > 0) {
          return {
            ...event,
            reviews: event.reviews.filter(review => review.userEmail !== userEmail)
          };
        }
        return event;
      }).filter(event => event !== null) as Event[]
    );
    
    // 3. 清除用户的所有个人数据（从 localStorage 中删除）
    localStorage.removeItem(getUserStorageKey(userEmail, "profile"));
    localStorage.removeItem(getUserStorageKey(userEmail, "registeredEvents"));
    localStorage.removeItem(getUserStorageKey(userEmail, "favoriteEvents"));
    localStorage.removeItem(getUserStorageKey(userEmail, "publishedEvents"));
    localStorage.removeItem(getUserStorageKey(userEmail, "draftEvents"));
    localStorage.removeItem(getUserStorageKey(userEmail, "followedOrganizers"));
    
    // 4. 清空当前会话状态
    setUser(null);
    setRegisteredEvents([]);
    setFavoriteEvents([]);
    setPublishedEvents([]);
    setDraftEvents([]);
    setFollowedOrganizers([]);
    
    // 5. 清除当前用户登录状态
    localStorage.removeItem(STORAGE_KEYS.USER);
    
    // 6. 返回首页
    setCurrentPage("home");
    
    toast.success("账户已成功注销", {
      description: "您的所有数据已被永久删除，账户已无法登录"
    });
  };

  const handleRegisterEvent = (eventId: string) => {
    if (!user) {
      toast.error("请先登录");
      setShowLoginDialog(true);
      return false;
    }

    if (registeredEvents.includes(eventId)) {
      setRegisteredEvents((prev) =>
        prev.filter((id) => id !== eventId),
      );
      toast.success("已取消报名");
      return false;
    } else {
      setRegisteredEvents((prev) => [...prev, eventId]);
      // 更新活动参与人数
      setEvents((prev) =>
        prev.map((event) =>
          event.id === eventId
            ? { ...event, attendees: event.attendees + 1 }
            : event,
        ),
      );
      toast.success("报名成功！");
      return true;
    }
  };

  const handleToggleFavorite = (eventId: string) => {
    if (!user) {
      toast.error("请先登录");
      setShowLoginDialog(true);
      return false;
    }

    if (favoriteEvents.includes(eventId)) {
      setFavoriteEvents((prev) =>
        prev.filter((id) => id !== eventId),
      );
      toast.success("已取消收藏");
      return false;
    } else {
      setFavoriteEvents((prev) => [...prev, eventId]);
      toast.success("收藏成功！");
      return true;
    }
  };

  const handleEventClick = (eventId: string) => {
    setSelectedEventId(eventId);
    setCurrentPage("event-detail");
  };

  const handleCreateEvent = (
    newEvent: Event,
    isDraft?: boolean,
  ) => {
    console.log("📝 创建活动:", newEvent.title, "草稿:", isDraft);
    setEvents((prevEvents) => {
      const updatedEvents = [newEvent, ...prevEvents];
      console.log("📝 活动列表更新，当前共", updatedEvents.length, "个活动");
      return updatedEvents;
    });
    if (isDraft) {
      setDraftEvents((prev) => [newEvent.id, ...prev]);
    } else {
      setPublishedEvents((prev) => [newEvent.id, ...prev]);
    }
  };

  const handleUpdateEvent = (updatedEvent: Event) => {
    setEvents((prevEvents) =>
      prevEvents.map((event) =>
        event.id === updatedEvent.id ? updatedEvent : event,
      ),
    );

    // 更新状态
    if (updatedEvent.status === "draft") {
      if (!draftEvents.includes(updatedEvent.id)) {
        setDraftEvents((prev) => [updatedEvent.id, ...prev]);
      }
      setPublishedEvents((prev) =>
        prev.filter((id) => id !== updatedEvent.id),
      );
    } else {
      if (!publishedEvents.includes(updatedEvent.id)) {
        setPublishedEvents((prev) => [
          updatedEvent.id,
          ...prev,
        ]);
      }
      setDraftEvents((prev) =>
        prev.filter((id) => id !== updatedEvent.id),
      );
    }

    toast.success("活动已更新");
  };

  const handleDeleteEvent = (eventId: string) => {
    setEvents((prevEvents) =>
      prevEvents.filter((event) => event.id !== eventId),
    );
    setPublishedEvents((prev) =>
      prev.filter((id) => id !== eventId),
    );
    setDraftEvents((prev) =>
      prev.filter((id) => id !== eventId),
    );
    setRegisteredEvents((prev) =>
      prev.filter((id) => id !== eventId),
    );
    setFavoriteEvents((prev) =>
      prev.filter((id) => id !== eventId),
    );
    toast.success("活动已删除");
  };

  const handleEditEvent = (eventId: string) => {
    setEditingEventId(eventId);
    setCurrentPage("create-event");
  };

  const handlePublishDraft = (eventId: string) => {
    const event = events.find((e) => e.id === eventId);
    if (event) {
      const updatedEvent = {
        ...event,
        status: "published" as const,
      };
      handleUpdateEvent(updatedEvent);
      toast.success("草稿已发布");
    }
  };

  const handleCategoryClick = (category: string) => {
    // 如果已经在发现页面，先清空分类再设置新分类，触发更新
    if (currentPage === "discover") {
      setDiscoverCategory(undefined);
      setTimeout(() => {
        setDiscoverCategory(category);
      }, 0);
    } else {
      setDiscoverCategory(category);
      setCurrentPage("discover");
    }
  };

  const handleUpdateAvatar = (avatarUrl: string) => {
    if (user) {
      const updatedUser = {
        ...user,
        avatar: avatarUrl,
      };
      
      console.log("更新头像:", avatarUrl);
      console.log("用户邮箱:", user.email);
      console.log("更新后的用户数据:", updatedUser);
      
      // 先保存更新后的用户资料到 localStorage
      saveUserData(user.email, "profile", updatedUser);
      
      // 验证保存是否成功
      const savedProfile = getUserData(user.email, "profile", null);
      console.log("保存后验证 - Profile:", savedProfile);
      
      // 然后更新状态（这会触发 useEffect，但由于我们已经保存了，不会有问题）
      setUser(updatedUser);
      
      // 同时更新该用户发布的所有活动中的主办方头像
      setEvents((prevEvents) =>
        prevEvents.map((event) => {
          if (event.createdBy === user.email && event.organizer) {
            return {
              ...event,
              organizer: {
                ...event.organizer,
                avatar: avatarUrl,
              },
            };
          }
          return event;
        })
      );
      
      toast.success("头像更新成功！");
    }
  };

  const handleUpdateProfile = (profile: {
    name?: string;
    email?: string;
    phone?: string;
  }) => {
    if (user) {
      const oldEmail = user.email;
      const newEmail = profile.email || oldEmail;
      
      // 验证新邮箱格式（如果邮箱发生变化）
      if (profile.email && profile.email !== oldEmail) {
        if (!validateEmailFormat(profile.email)) {
          toast.error("请输入有效的邮箱地址");
          return;
        }
        
        // 检查新邮箱是否已被其他用户使用
        if (isUserRegistered(profile.email)) {
          // 需要检查是否是其他用户使用了这个邮箱
          const users = getRegisteredUsers();
          const existingUser = users.find(u => u.email.toLowerCase() === profile.email.toLowerCase());
          // 如果找到的用户不是当前用户（通过旧邮箱判断），则提示邮箱已被使用
          if (existingUser && existingUser.email.toLowerCase() !== oldEmail.toLowerCase()) {
            toast.error("该邮箱已被其他用户使用");
            return;
          }
        }
      }
      
      const newUser = {
        ...user,
        ...profile,
      };
      
      // 如果邮���发生变化，需要迁移数据
      if (profile.email && profile.email !== oldEmail) {
        // 1. 更新用户凭证中的邮箱
        const users = getRegisteredUsers();
        const updatedUsers = users.map(u => {
          if (u.email.toLowerCase() === oldEmail.toLowerCase()) {
            return {
              ...u,
              email: newEmail,
              name: profile.name || u.name,
            };
          }
          return u;
        });
        saveToLocalStorage(STORAGE_KEYS.REGISTERED_USERS, updatedUsers);
        
        // 2. 保存到新邮箱下
        saveUserData(newEmail, "profile", newUser);
        saveUserData(newEmail, "registeredEvents", registeredEvents);
        saveUserData(newEmail, "favoriteEvents", favoriteEvents);
        saveUserData(newEmail, "publishedEvents", publishedEvents);
        saveUserData(newEmail, "draftEvents", draftEvents);
        saveUserData(newEmail, "followedOrganizers", followedOrganizers);
        
        // 3. 删除旧邮箱的数据
        localStorage.removeItem(getUserStorageKey(oldEmail, "profile"));
        localStorage.removeItem(getUserStorageKey(oldEmail, "registeredEvents"));
        localStorage.removeItem(getUserStorageKey(oldEmail, "favoriteEvents"));
        localStorage.removeItem(getUserStorageKey(oldEmail, "publishedEvents"));
        localStorage.removeItem(getUserStorageKey(oldEmail, "draftEvents"));
        localStorage.removeItem(getUserStorageKey(oldEmail, "followedOrganizers"));
        
        // 4. 更新该用户发布的所有活动中的 createdBy 字段和主办方信息
        setEvents((prevEvents) =>
          prevEvents.map((event) => {
            if (event.createdBy === oldEmail) {
              return {
                ...event,
                createdBy: newEmail, // 更新 createdBy 为新邮箱
                organizer: event.organizer ? {
                  ...event.organizer,
                  name: profile.name || event.organizer.name, // 更新主办方名称
                  avatar: newUser.avatar || event.organizer.avatar, // 更新主办方头像
                } : undefined,
              };
            }
            return event;
          })
        );
        
        toast.success("个人信息更新成功！", {
          description: "邮箱已更改，所有活动已同步更新"
        });
      } else {
        // 如果只是更新名称或手机号，也需要更新活动中的主办方信息
        if (profile.name) {
          // 更新用户凭证中的名称
          const users = getRegisteredUsers();
          const updatedUsers = users.map(u => {
            if (u.email.toLowerCase() === oldEmail.toLowerCase()) {
              return {
                ...u,
                name: profile.name || u.name,
              };
            }
            return u;
          });
          saveToLocalStorage(STORAGE_KEYS.REGISTERED_USERS, updatedUsers);
          
          // 更新该用户发布的所有活动中的主办方名称
          setEvents((prevEvents) =>
            prevEvents.map((event) => {
              if (event.createdBy === oldEmail && event.organizer) {
                return {
                  ...event,
                  organizer: {
                    ...event.organizer,
                    name: profile.name || event.organizer.name,
                  },
                };
              }
              return event;
            })
          );
        }
        
        // 保存更新后的用户资料到 localStorage
        saveUserData(oldEmail, "profile", newUser);
        
        toast.success("个人信息更新成功！");
      }
      
      setUser(newUser);
    }
  };

  const handleFollowOrganizer = (organizerName: string) => {
    if (!user) {
      toast.error("请先登录");
      setShowLoginDialog(true);
      return false;
    }

    if (followedOrganizers.includes(organizerName)) {
      setFollowedOrganizers((prev) =>
        prev.filter((name) => name !== organizerName)
      );
      toast.success("已取消关注");
      return false;
    } else {
      setFollowedOrganizers((prev) => [...prev, organizerName]);
      toast.success("已关注主办方");
      return true;
    }
  };

  const handleAddReview = (eventId: string, review: {
    rating: number;
    comment: string;
  }) => {
    if (!user) {
      toast.error("请先登录");
      setShowLoginDialog(true);
      return;
    }

    setEvents((prevEvents) =>
      prevEvents.map((event) => {
        if (event.id === eventId) {
          const newReview = {
            user: user.name,
            avatar: user.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop",
            rating: review.rating,
            date: new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' }),
            comment: review.comment,
            userEmail: user.email,
          };
          
          const existingReviews = event.reviews || [];
          return {
            ...event,
            reviews: [newReview, ...existingReviews],
          };
        }
        return event;
      })
    );

    toast.success("评价提交成功！");
  };

  // 路由切换逻辑
  if (currentPage === "create-event") {
    if (!user) {
      // 如果未登录，显示提示并打开登录对话框
      toast.error("请先登录后再发布活动");
      setShowLoginDialog(true);
      setCurrentPage("home");
      return null;
    }

    const editingEvent = editingEventId
      ? events.find((e) => e.id === editingEventId)
      : null;

    return (
      <>
        <CreateEventPage
          onNavigate={(page) => {
            setCurrentPage(page);
            setEditingEventId(null);
          }}
          user={user}
          onEventCreate={handleCreateEvent}
          onEventUpdate={handleUpdateEvent}
          editingEvent={editingEvent}
          onCategoryClick={handleCategoryClick}
        />
        <Toaster />
      </>
    );
  }

  if (currentPage === "event-detail" && selectedEventId) {
    return (
      <>
        <Header
          onNavigate={(page, tab) => {
            setCurrentPage(page);
            if (tab) {
              setProfileDefaultTab(tab);
            }
          }}
          user={user}
          onLoginClick={() => setShowLoginDialog(true)}
          onRegisterClick={() => setShowRegisterDialog(true)}
          onLogout={handleLogout}
        />
        <EventDetailPage
          onNavigate={setCurrentPage}
          eventId={selectedEventId}
          user={user}
          events={events}
          isRegistered={registeredEvents.includes(
            selectedEventId,
          )}
          isFavorited={favoriteEvents.includes(selectedEventId)}
          onRegister={handleRegisterEvent}
          onToggleFavorite={handleToggleFavorite}
          onCategoryClick={handleCategoryClick}
          isFollowingOrganizer={
            events.find((e) => e.id === selectedEventId)?.organizer?.name
              ? followedOrganizers.includes(
                  events.find((e) => e.id === selectedEventId)!.organizer!.name
                )
              : false
          }
          onFollowOrganizer={handleFollowOrganizer}
          onAddReview={handleAddReview}
        />
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
        <Toaster />
      </>
    );
  }

  if (currentPage === "profile") {
    if (!user) {
      // 如果未登录，显示提示并打开登录对话框
      toast.error("请先登录");
      setShowLoginDialog(true);
      setCurrentPage("home");
      return null;
    }

    return (
      <>
        <Header
          onNavigate={(page, tab) => {
            console.log("Navigating to:", page, "Tab:", tab);
            setCurrentPage(page);
            if (tab) {
              setProfileDefaultTab(tab);
            }
          }}
          user={user}
          onLoginClick={() => setShowLoginDialog(true)}
          onRegisterClick={() => setShowRegisterDialog(true)}
          onLogout={handleLogout}
        />
        <ProfilePage
          onNavigate={setCurrentPage}
          user={user}
          onLogout={handleLogout}
          onDeleteAccount={handleDeleteAccount}
          registeredEvents={events.filter((e) =>
            registeredEvents.includes(e.id),
          )}
          favoriteEvents={events.filter((e) =>
            favoriteEvents.includes(e.id),
          )}
          publishedEvents={events.filter(
            (e) =>
              publishedEvents.includes(e.id) &&
              e.status === "published",
          )}
          draftEvents={events.filter(
            (e) =>
              draftEvents.includes(e.id) &&
              e.status === "draft",
          )}
          allEvents={events}
          onEventClick={(eventId) => {
            setSelectedEventId(eventId);
            setCurrentPage("event-detail");
          }}
          onEditEvent={handleEditEvent}
          onDeleteEvent={handleDeleteEvent}
          onPublishDraft={handlePublishDraft}
          defaultTab={profileDefaultTab}
          onCategoryClick={handleCategoryClick}
          onUpdateAvatar={handleUpdateAvatar}
          onUpdateProfile={handleUpdateProfile}
          followedOrganizers={followedOrganizers}
        />
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
        <Toaster />
      </>
    );
  }

  if (currentPage === "discover") {
    return (
      <>
        <Header
          onNavigate={(page) => {
            if (page !== "discover") {
              setDiscoverCategory(undefined);
            }
            setCurrentPage(page);
          }}
          user={user}
          onLoginClick={() => setShowLoginDialog(true)}
          onRegisterClick={() => setShowRegisterDialog(true)}
          onLogout={handleLogout}
        />
        <DiscoverPage
          onNavigate={(page) => {
            setDiscoverCategory(undefined);
            setCurrentPage(page);
          }}
          onEventClick={handleEventClick}
          events={events}
          initialCategory={discoverCategory}
          onCategoryClick={handleCategoryClick}
        />
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
        <Toaster />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header
        onNavigate={(page, tab) => {
          setCurrentPage(page);
          if (tab) {
            setProfileDefaultTab(tab);
          }
        }}
        user={user}
        onLoginClick={() => setShowLoginDialog(true)}
        onRegisterClick={() => setShowRegisterDialog(true)}
        onLogout={handleLogout}
      />
      <main>
        <Hero 
          onNavigate={setCurrentPage}
          user={user}
          onLoginClick={() => setShowLoginDialog(true)}
        />
        <Categories onCategoryClick={handleCategoryClick} />
        <FeaturedEvents
          onEventClick={handleEventClick}
          events={events.slice(0, 6)}
          onNavigate={setCurrentPage}
        />
      </main>
      <Footer
        onCategoryClick={handleCategoryClick}
        onNavigate={setCurrentPage}
      />

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

      <Toaster />
    </div>
  );
}