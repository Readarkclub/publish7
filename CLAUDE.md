# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个活动发布平台的前端应用,使用 React + TypeScript + Vite 构建。用户可以浏览、创建、报名活动,并管理个人资料和发布的活动。

原始 Figma 设计: https://www.figma.com/design/CSsDUydx3Db96fNwi7Eyww/活动发布平台首页设计

## 开发命令

```bash
# 安装依赖
npm i

# 启动开发服务器 (端口 3000,自动打开浏览器)
npm run dev

# 构建生产版本 (输出到 build/ 目录)
npm run build
```

## 技术栈

- **React 18.3** + **TypeScript**
- **Vite 6.3** (使用 SWC 编译器)
- **Radix UI** - 无障碍 UI 组件库
- **Tailwind CSS** - 样式框架
- **Supabase** - 后端服务 (图片存储)
- **Sonner** - Toast 通知

## 核心架构

### 状态管理架构

应用使用 `App.tsx` 中的 React state 进行全局状态管理,没有使用 Redux/Zustand 等状态库。所有状态通过 props 传递。

**全局共享数据** (所有用户可见):
- `events` - 所有活动列表,存储在 `localStorage['eventApp_events']`

**用户特定数据** (按用户邮箱隔离):
- `registeredEvents` - 用户报名的活动
- `favoriteEvents` - 用户收藏的活动
- `publishedEvents` - 用户发布的活动
- `draftEvents` - 用户的草稿活动
- `followedOrganizers` - 用户关注的主办方
- `profile` - 用户个人资料

数据按 `eventApp_user_{email}_{dataType}` 格式存储在 localStorage,实现多用户数据隔离。

### 路由与页面架构

应用使用状态控制的简单路由 (`currentPage` state),无 React Router:

- `home` - 首页 (Hero + Categories + FeaturedEvents)
- `discover` - 发现页面 (可按分类筛选)
- `profile` - 个人中心 (需登录)
- `event-detail` - 活动详情页
- `create-event` - 创建/编辑活动 (需登录)

页面切换通过 `setCurrentPage()` 函数,组件接收 `onNavigate` prop。

### 认证系统

**无服务器后端**,纯前端实现:
- 用户凭证存储在 `localStorage['eventApp_registeredUsers']`
- 密码明文存储 (仅本地演示用途)
- 邮箱格式验证: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- 密码最小长度: 8 位
- 用户名最小长度: 2 字符

登录流程:
1. 验证邮箱格式
2. 从 `localStorage` 查找用户凭证
3. 验证密码匹配
4. 恢复该用户的所有数据 (从 `eventApp_user_{email}_*` 键)

### 图片处理架构

**本地压缩 + 云端存储** (src/utils/imageUpload.ts):

```
用户上传 → Canvas 压缩 → Base64 → Supabase Storage → URL
```

- 活动封面: 最大 1200x900px, 质量 0.7
- 用户头像: 400x400px 正方形裁剪, 质量 0.8
- 文件大小限制: 5MB
- 压缩后存储为 JPEG

**关键函数**:
- `handleImageUpload(file)` - 活动封面上传
- `handleAvatarUpload(file)` - 头像上传
- `compressImage(file)` - 通用图片压缩
- `compressAvatar(file)` - 头像正方形裁剪压缩

### localStorage 数据持久化

**存储键名规范**:
```typescript
STORAGE_KEYS = {
  USER: "eventApp_user",                      // 当前登录用户
  EVENTS: "eventApp_events",                  // 全局活动数据
  REGISTERED_USERS: "eventApp_registeredUsers" // 所有用户凭证
}

// 用户特定数据
eventApp_user_{email}_profile
eventApp_user_{email}_registeredEvents
eventApp_user_{email}_favoriteEvents
// ...
```

**数据同步机制**:
- 使用 `useEffect` 监听状态变化,自动同步到 localStorage
- 用户登录时从 localStorage 恢复数据
- 用户注销时清空状态但保留 localStorage 数据
- 更换邮箱时自动迁移所有用户数据

**配额管理**:
- 监控 localStorage 使用量
- 捕获 `QuotaExceededError` 并提示用户
- 单次清除旧版硬编码活动数据

## 组件结构

### 核心页面组件

- `App.tsx` - 根组件,包含所有状态管理和路由逻辑
- `Header.tsx` - 顶部导航栏 (登录/注册/用户菜单)
- `Hero.tsx` - 首页 Banner 和搜索
- `Categories.tsx` - 活动分类导航
- `FeaturedEvents.tsx` - 首页精选活动列表
- `DiscoverPage.tsx` - 发现页面 (筛选器 + 活动列表)
- `ProfilePage.tsx` - 个人中心 (报名/收藏/发布/草稿/设置)
- `EventDetailPage.tsx` - 活动详情 (包含主办方信息、议程、评价)
- `CreateEventPage.tsx` - 创建/编辑活动表单

### UI 组件库

位于 `src/components/ui/`,基于 Radix UI + Tailwind:
- 完整的 shadcn/ui 组件集
- 使用 `class-variance-authority` 管理样式变体
- 使用 `@/components/ui/*` 别名导入

## 数据类型

**Event 类型** (src/types/event.ts):
```typescript
interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  category: string;
  attendees: number;
  price: string;
  imageUrl: string;
  description?: string;
  organizer?: {...}; // 主办方信息
  highlights?: string[]; // 活动亮点
  agenda?: {...}[]; // 活动议程
  status?: 'draft' | 'published';
  createdBy?: string; // 创建者邮箱
  reviews?: Review[]; // 用户评价
}
```

## 关键功能实现

### 活动创建流程

1. 用户必须先登录
2. 填写活动表单 (标题、日期、地点、分类、价格、描述等)
3. 上传活动封面 (压缩后存储到 Supabase)
4. 选择发布或保存为草稿
5. 活动 ID 使用 `event-{timestamp}`
6. `createdBy` 字段记录创建者邮箱

### 活动报名机制

- 点击报名按钮 → 将活动 ID 添加到 `registeredEvents` 数组
- 同时更新活动的 `attendees` 数量 (+1)
- 取消报名则移除 ID 并减少 `attendees`
- 未登录用户点击报名会弹出登录对话框

### 评价系统

- 用户可对活动进行评分 (1-5 星) 和评论
- 评价包含: 用户名、头像、评分、日期、评论内容、用户邮箱
- 评价存储在活动对象的 `reviews` 数组中
- 用户注销账户时自动删除其所有评价

### 账户注销流程

1. 从 `REGISTERED_USERS` 删除用户凭证
2. 删除该用户发布的所有活动
3. 删除该用户在其他活动中的所有评价
4. 清除所有用户特定的 localStorage 数据
5. 清空当前会话状态并返回首页

## Supabase 集成

项目使用 Supabase 作为图片存储后端:

- 配置文件: `src/utils/supabase/info.tsx` (包含 projectId 和 publicAnonKey)
- Edge Function 端点: `https://{projectId}.supabase.co/functions/v1/make-server-9b3b112b`
- API 路由:
  - `POST /upload-image` - 上传图片
  - `DELETE /delete-image/{fileName}` - 删除图片

## 重要约定

1. **所有用户操作需登录检查** - 创建活动、报名、收藏、评价等功能必须先验证 `user` 是否存在,否则弹出登录对话框

2. **数据隔离原则** - 用户特定数据必须使用 `getUserStorageKey(email, dataType)` 生成键名,确保多用户数据不会混淆

3. **Toast 通知** - 使用 `toast.success()` / `toast.error()` 提供用户反馈,从 `sonner@2.0.3` 导入

4. **图片上传前压缩** - 始终使用 `handleImageUpload()` 或 `handleAvatarUpload()`,不要直接使用原始文件上传

5. **邮箱作为用户唯一标识** - 用户数据、活动创建者都使用邮箱作为标识符,更换邮箱时需迁移所有相关数据

6. **localStorage 错误处理** - 捕获 `QuotaExceededError` 并提示用户清理数据

## Vite 配置特点

- 使用 path alias `@` 指向 `./src`
- 开发服务器端口: 3000
- 构建目标: `esnext`
- 输出目录: `build/`
- 包含大量版本化的 alias 配置用于依赖解析

## 调试与日志

代码中包含详细的 console.log,用于追踪:
- localStorage 数据读写
- 用户登录/注册流程
- 活动创建/更新
- 图片压缩/上传进度

生产环境应移除这些日志。
