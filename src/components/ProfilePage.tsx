import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { Calendar, MapPin, Settings, LogOut, Heart, Ticket, Edit, Mail, User as UserIcon, Camera, Trash2, FileEdit, Users, Lock, Eye, EyeOff, Check, X } from "lucide-react";
import { EventCard } from "./EventCard";
import type { Event } from "../types/event";
import { toast } from "sonner";
import { handleAvatarUpload } from "../utils/imageUpload";

interface ProfilePageProps {
  onNavigate?: (page: "home" | "discover" | "profile" | "create-event") => void;
  user?: {
    name: string;
    email: string;
    avatar?: string;
    phone?: string;
    isAdmin?: boolean;
  } | null;
  onLogout?: () => void;
  onDeleteAccount?: () => void;
  registeredEvents?: Event[];
  favoriteEvents?: Event[];
  publishedEvents?: Event[];
  draftEvents?: Event[];
  allEvents?: Event[];
  allPublishedEvents?: Event[];
  onEventClick?: (eventId: string) => void;
  onEditEvent?: (eventId: string) => void;
  onDeleteEvent?: (eventId: string) => void;
  onPublishDraft?: (eventId: string) => void;
  defaultTab?: string;
  onCategoryClick?: (category: string) => void;
  onUpdateAvatar?: (avatarUrl: string) => void;
  onUpdateProfile?: (profile: { name?: string; email?: string; phone?: string }) => void;
  followedOrganizers?: string[];
}

export function ProfilePage({
  onNavigate,
  user,
  onLogout,
  onDeleteAccount,
  registeredEvents = [],
  favoriteEvents = [],
  publishedEvents = [],
  draftEvents = [],
  allEvents = [],
  allPublishedEvents,
  onEventClick,
  onEditEvent,
  onDeleteEvent,
  onPublishDraft,
  defaultTab = "registered",
  onCategoryClick,
  onUpdateAvatar,
  onUpdateProfile,
  followedOrganizers = []
}: ProfilePageProps) {
  const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false);
  const [newAvatarUrl, setNewAvatarUrl] = useState("");
  const [uploadMethod, setUploadMethod] = useState<"url" | "file">("url");
  const [previewImage, setPreviewImage] = useState<string>("");
  
  // 编辑状态
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  
  // 表单值
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [emailError, setEmailError] = useState("");
  
  // 同步 user prop 变化到表单状态
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setPhone(user.phone || "");
    }
  }, [user]);
  
  // 偏好设置
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [eventReminders, setEventReminders] = useState(true);
  
  // 对话框
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isDeleteAccountDialogOpen, setIsDeleteAccountDialogOpen] = useState(false);
  const [deleteEventId, setDeleteEventId] = useState<string | null>(null);
  
  // 密码修改相关状态
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  // 注销账户确认
  const [deleteAccountConfirmText, setDeleteAccountConfirmText] = useState("");

  if (!user) {
    return null;
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 显示上传中的提示
    const loadingToast = toast.loading("正在上传头像...");

    try {
      // 使用新的上传函数（压缩 + 上传到云端）
      const result = await handleAvatarUpload(file, (status) => {
        toast.loading(status, { id: loadingToast });
      });

      if (result.success && result.url) {
        setPreviewImage(result.url);
        setNewAvatarUrl(result.url);
        toast.success("头像上传成功！", { 
          id: loadingToast,
          description: "已保存到云端存储"
        });
      } else {
        toast.error(result.error || "上传失败", { id: loadingToast });
      }
    } catch (error) {
      console.error("上传头像错误:", error);
      toast.error("上传失败，请重试", { id: loadingToast });
    }
  };

  const handleSaveAvatar = () => {
    if (newAvatarUrl.trim()) {
      onUpdateAvatar?.(newAvatarUrl.trim());
      setIsAvatarDialogOpen(false);
      setNewAvatarUrl("");
      setPreviewImage("");
      setUploadMethod("url");
    }
  };

  const handleDialogClose = () => {
    setIsAvatarDialogOpen(false);
    setNewAvatarUrl("");
    setPreviewImage("");
    setUploadMethod("url");
  };

  // 处理编辑保存
  const handleSaveName = () => {
    if (name.trim()) {
      onUpdateProfile?.({ name: name.trim() });
      setIsEditingName(false);
    }
  };

  const validateEmail = (emailValue: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailValue) {
      setEmailError("邮箱不能为空");
      return false;
    }
    if (!emailRegex.test(emailValue)) {
      setEmailError("请输入有效的邮箱地址");
      return false;
    }
    setEmailError("");
    return true;
  };

  const handleSaveEmail = () => {
    const trimmedEmail = email.trim();
    if (!validateEmail(trimmedEmail)) {
      return;
    }
    
    onUpdateProfile?.({ email: trimmedEmail });
    setIsEditingEmail(false);
    setEmailError("");
  };

  const handleSavePhone = () => {
    if (phone.trim()) {
      onUpdateProfile?.({ phone: phone.trim() });
      setIsEditingPhone(false);
    }
  };

  // 处理取消编辑
  const handleCancelName = () => {
    setName(user?.name || "");
    setIsEditingName(false);
  };

  const handleCancelEmail = () => {
    setEmail(user?.email || "");
    setIsEditingEmail(false);
    setEmailError("");
  };

  const handleCancelPhone = () => {
    setPhone(user?.phone || "");
    setIsEditingPhone(false);
  };

  // 密码强度检测
  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return { strength: 0, label: "", color: "" };
    if (password.length < 6) return { strength: 1, label: "弱", color: "text-red-600" };
    
    let strength = 1;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    
    if (strength <= 2) return { strength: 1, label: "弱", color: "text-red-600" };
    if (strength === 3) return { strength: 2, label: "中", color: "text-yellow-600" };
    return { strength: 3, label: "强", color: "text-green-600" };
  };

  // 密码验证
  const validatePassword = () => {
    if (!currentPassword.trim()) {
      toast.error("请输入当前密码");
      return false;
    }
    if (!newPassword.trim()) {
      toast.error("请输入新密码");
      return false;
    }
    if (newPassword.length < 6) {
      toast.error("新密码长度至少为6位");
      return false;
    }
    if (newPassword === currentPassword) {
      toast.error("新密码不能与当前密码相同");
      return false;
    }
    if (newPassword !== confirmPassword) {
      toast.error("两次输入的新密码不一致");
      return false;
    }
    return true;
  };

  // 处理密码修改
  const handleChangePassword = async () => {
    if (!validatePassword()) return;

    setIsChangingPassword(true);

    // 模拟API请求
    setTimeout(() => {
      setIsChangingPassword(false);
      toast.success("密码修改成功");
      setIsPasswordDialogOpen(false);
      // 重置表单
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    }, 1500);
  };

  // 关闭密码对话框时重置表单
  const handleClosePasswordDialog = () => {
    setIsPasswordDialogOpen(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-purple-600 to-pink-600 pt-16 pb-32">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-6">
            <div className="relative group">
              <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                <AvatarImage src={user.avatar} alt={user.name} className="object-cover" />
                <AvatarFallback className="bg-purple-700 text-white text-2xl">
                  {user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <button
                onClick={() => setIsAvatarDialogOpen(true)}
                className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Camera className="h-8 w-8 text-white" />
              </button>
            </div>
            <div className="text-white flex-1">
              <h1 className="text-3xl mb-2">{user.name}</h1>
              <p className="opacity-90 flex items-center gap-2">
                <Mail className="h-4 w-4" />
                {user.email}
              </p>
            </div>
            <Button
              variant="outline"
              className="bg-white/10 text-white border-white/20 hover:bg-white/20"
              onClick={onLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              退出登录
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Cards */}
      <section className="container mx-auto px-4 -mt-16 mb-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-6 bg-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-gray-600 text-sm mb-1">已报名</div>
                <div className="text-3xl text-purple-600">{registeredEvents.length}</div>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Ticket className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-gray-600 text-sm mb-1">已收藏</div>
                <div className="text-3xl text-pink-600">{favoriteEvents.length}</div>
              </div>
              <div className="h-12 w-12 bg-pink-100 rounded-full flex items-center justify-center">
                <Heart className="h-6 w-6 text-pink-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-gray-600 text-sm mb-1">已关注</div>
                <div className="text-3xl text-blue-600">{followedOrganizers.length}</div>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-gray-600 text-sm mb-1">
                  {user?.isAdmin ? "全部已发布" : "已发布"}
                </div>
                <div className="text-3xl text-green-600">
                  {user?.isAdmin && allPublishedEvents ? allPublishedEvents.length : publishedEvents.length}
                </div>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <Edit className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 pb-12">
        <Tabs defaultValue={defaultTab} className="space-y-6">
          <TabsList className="bg-white p-1 shadow-sm">
            <TabsTrigger value="registered" className="gap-2">
              <Ticket className="h-4 w-4" />
              我的活动
            </TabsTrigger>
            <TabsTrigger value="favorites" className="gap-2">
              <Heart className="h-4 w-4" />
              我的收藏
            </TabsTrigger>
            <TabsTrigger value="following" className="gap-2">
              <Users className="h-4 w-4" />
              我的关注
            </TabsTrigger>
            <TabsTrigger value="published" className="gap-2">
              <Edit className="h-4 w-4" />
              {user?.isAdmin ? "活动管理" : "我发布的"}
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="h-4 w-4" />
              设置
            </TabsTrigger>
          </TabsList>

          {/* Registered Events Tab */}
          <TabsContent value="registered" className="space-y-4">
            {registeredEvents.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {registeredEvents.map((event) => (
                  <EventCard 
                    key={event.id}
                    {...event}
                    onClick={() => onEventClick?.(event.id)}
                  />
                ))}
              </div>
            ) : (
              <Card className="p-12">
                <div className="text-center text-gray-500">
                  <Ticket className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="mb-4">您还没有报名任何活动</p>
                  <Button 
                    className="bg-purple-600 hover:bg-purple-700"
                    onClick={() => onNavigate?.("discover")}
                  >
                    去发现活动
                  </Button>
                </div>
              </Card>
            )}
          </TabsContent>

          {/* Favorite Events Tab */}
          <TabsContent value="favorites" className="space-y-4">
            {favoriteEvents.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favoriteEvents.map((event) => (
                  <EventCard 
                    key={event.id}
                    {...event}
                    onClick={() => onEventClick?.(event.id)}
                  />
                ))}
              </div>
            ) : (
              <Card className="p-12">
                <div className="text-center text-gray-500">
                  <Heart className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="mb-4">您还没有收藏任何活动</p>
                  <Button 
                    className="bg-purple-600 hover:bg-purple-700"
                    onClick={() => onNavigate?.("discover")}
                  >
                    去发现活动
                  </Button>
                </div>
              </Card>
            )}
          </TabsContent>

          {/* Following Tab */}
          <TabsContent value="following" className="space-y-4">
            {followedOrganizers.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {followedOrganizers.map((organizerName) => {
                  // 从所有活动中找到该主办方的任一活动以获取信息
                  const organizerEvent = allEvents.find(
                    (event) => event.organizer?.name === organizerName
                  );
                  
                  if (!organizerEvent?.organizer) return null;
                  
                  const organizer = organizerEvent.organizer;
                  
                  return (
                    <Card key={organizerName} className="p-6 hover:shadow-lg transition-shadow">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-16 w-16">
                          <AvatarImage src={organizer.avatar} alt={organizer.name} />
                          <AvatarFallback className="bg-purple-100 text-purple-600">
                            {organizer.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h3 className="text-gray-900 mb-1">{organizer.name}</h3>
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                            {organizer.description}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Edit className="h-3 w-3" />
                              {organizer.eventsCount} 个活动
                            </span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card className="p-12">
                <div className="text-center text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="mb-4">您还没有关注任何主办方</p>
                  <Button 
                    className="bg-purple-600 hover:bg-purple-700"
                    onClick={() => onNavigate?.("discover")}
                  >
                    去发现活动
                  </Button>
                </div>
              </Card>
            )}
          </TabsContent>

          {/* Published Events Tab */}
          <TabsContent value="published" className="space-y-6">
            {/* 已发布的活动 */}
            <div>
              {(() => {
                // 管理员显示所有已发布活动，普通用户显示自己的
                const displayEvents = user?.isAdmin && allPublishedEvents
                  ? allPublishedEvents
                  : publishedEvents;
                const isAdmin = user?.isAdmin;

                return (
                  <>
                    <h3 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
                      <Edit className="h-5 w-5 text-green-600" />
                      {isAdmin ? "全部已发布活动" : "已发布"} ({displayEvents.length})
                      {isAdmin && (
                        <Badge variant="outline" className="ml-2 text-purple-600 border-purple-300">
                          管理员
                        </Badge>
                      )}
                    </h3>
                    {displayEvents.length > 0 ? (
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {displayEvents.map((event) => (
                          <div key={event.id} className="relative group">
                            <EventCard
                              {...event}
                              onClick={() => onEventClick?.(event.id)}
                            />
                            {/* 管理员视角显示发布者信息 */}
                            {isAdmin && event.createdBy && (
                              <div className="absolute bottom-16 left-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                发布者: {event.createdBy}
                              </div>
                            )}
                            <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              {/* 只有自己的活动或管理员才显示编辑按钮 */}
                              {(event.createdBy === user?.email || !isAdmin) && (
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  className="bg-white hover:bg-gray-100 shadow-md"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onEditEvent?.(event.id);
                                  }}
                                >
                                  <FileEdit className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="secondary"
                                className="bg-white hover:bg-red-50 text-red-600 hover:text-red-700 shadow-md"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteEventId(event.id);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <Card className="p-8">
                        <div className="text-center text-gray-500">
                          <p>{isAdmin ? "暂无已发布的活动" : "暂无已发布的活动"}</p>
                        </div>
                      </Card>
                    )}
                  </>
                );
              })()}
            </div>

            <Separator />

            {/* 草稿 */}
            <div>
              <h3 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
                <FileEdit className="h-5 w-5 text-gray-600" />
                草稿 ({draftEvents.length})
              </h3>
              {draftEvents.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {draftEvents.map((event) => (
                    <div key={event.id} className="relative group">
                      <Card className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow">
                        <div className="relative h-48 bg-gray-200">
                          {event.imageUrl ? (
                            <img 
                              src={event.imageUrl} 
                              alt={event.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <Calendar className="h-12 w-12" />
                            </div>
                          )}
                          <Badge className="absolute top-2 left-2 bg-yellow-500 hover:bg-yellow-600">
                            草稿
                          </Badge>
                        </div>
                        <div className="p-4">
                          <h3 className="text-gray-900 mb-2 line-clamp-2">
                            {event.title || "未命名活动"}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                            <Calendar className="h-4 w-4" />
                            <span>{event.date || "待定"}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="h-4 w-4" />
                            <span>{event.location || "待定"}</span>
                          </div>
                        </div>
                      </Card>
                      <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="sm"
                          variant="secondary"
                          className="bg-white hover:bg-gray-100 shadow-md"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditEvent?.(event.id);
                          }}
                        >
                          <FileEdit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 shadow-md"
                          onClick={(e) => {
                            e.stopPropagation();
                            onPublishDraft?.(event.id);
                          }}
                        >
                          发布
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          className="bg-white hover:bg-red-50 text-red-600 hover:text-red-700 shadow-md"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteEventId(event.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <Card className="p-8">
                  <div className="text-center text-gray-500">
                    <p className="mb-4">暂无草稿</p>
                    <Button 
                      className="bg-purple-600 hover:bg-purple-700"
                      onClick={() => onNavigate?.("create-event")}
                    >
                      创建活动
                    </Button>
                  </div>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card className="p-6">
              <h3 className="text-xl text-gray-900 mb-6">个人信息</h3>
              <div className="space-y-6 max-w-2xl">
                <div className="grid gap-4">
                  {/* 用户名编辑 */}
                  <div className="grid gap-2">
                    <label className="text-sm text-gray-600">用户名</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        readOnly={!isEditingName}
                        className={`flex-1 px-3 py-2 border border-gray-300 rounded-lg ${
                          isEditingName ? "bg-white" : "bg-gray-50"
                        }`}
                      />
                      {isEditingName ? (
                        <>
                          <Button 
                            variant="outline" 
                            onClick={handleCancelName}
                          >
                            取消
                          </Button>
                          <Button 
                            className="bg-purple-600 hover:bg-purple-700"
                            onClick={handleSaveName}
                          >
                            保存
                          </Button>
                        </>
                      ) : (
                        <Button 
                          variant="outline"
                          onClick={() => setIsEditingName(true)}
                        >
                          编辑
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* 邮箱显示（只读） */}
                  <div className="grid gap-2">
                    <label className="text-sm text-gray-600">邮箱</label>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <input
                          type="email"
                          value={email}
                          readOnly
                          className="w-full px-3 py-2 border rounded-lg bg-gray-50 border-gray-300 text-gray-600"
                        />
                      </div>
                    </div>
                    {false && (
                      <p className="text-sm text-amber-600">
                        ⚠️ 更改邮箱后，您将使用新邮箱登录
                      </p>
                    )}
                  </div>

                  {/* 手机号编辑 */}
                  <div className="grid gap-2">
                    <label className="text-sm text-gray-600">手机号</label>
                    <div className="flex gap-2">
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="未设置"
                        readOnly={!isEditingPhone}
                        className={`flex-1 px-3 py-2 border border-gray-300 rounded-lg ${
                          isEditingPhone ? "bg-white" : "bg-gray-50"
                        }`}
                      />
                      {isEditingPhone ? (
                        <>
                          <Button 
                            variant="outline" 
                            onClick={handleCancelPhone}
                          >
                            取消
                          </Button>
                          <Button 
                            className="bg-purple-600 hover:bg-purple-700"
                            onClick={handleSavePhone}
                          >
                            保存
                          </Button>
                        </>
                      ) : (
                        <Button 
                          variant="outline"
                          onClick={() => setIsEditingPhone(true)}
                        >
                          {phone ? "编辑" : "绑定"}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* 偏好设置 */}
                <div>
                  <h4 className="text-gray-900 mb-4">偏好设置</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="text-gray-900">接收活动推荐邮件</span>
                        <p className="text-sm text-gray-500">每周为您推荐感兴趣的活动</p>
                      </div>
                      <Switch
                        checked={emailNotifications}
                        onCheckedChange={setEmailNotifications}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="text-gray-900">接收活动提醒</span>
                        <p className="text-sm text-gray-500">活动开始前24小时提醒</p>
                      </div>
                      <Switch
                        checked={eventReminders}
                        onCheckedChange={setEventReminders}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* 账户安全 */}
                <div>
                  <h4 className="text-gray-900 mb-4">账户安全</h4>
                  <div className="space-y-3">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => setIsPasswordDialogOpen(true)}
                    >
                      修改密码
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => setIsDeleteAccountDialogOpen(true)}
                    >
                      注销账户
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </section>

      {/* Avatar Edit Dialog */}
      <Dialog open={isAvatarDialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑头像</DialogTitle>
            <DialogDescription>
              选择上传方式来更新您的头像
            </DialogDescription>
          </DialogHeader>
          
          <Tabs value={uploadMethod} onValueChange={(v) => setUploadMethod(v as "url" | "file")} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="url">图片链接</TabsTrigger>
              <TabsTrigger value="file">本地上传</TabsTrigger>
            </TabsList>
            
            <TabsContent value="url" className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="avatar-url">头像图片链接</Label>
                <Input
                  id="avatar-url"
                  placeholder="https://example.com/avatar.jpg"
                  value={uploadMethod === "url" ? newAvatarUrl : ""}
                  onChange={(e) => {
                    setNewAvatarUrl(e.target.value);
                    setPreviewImage(e.target.value);
                  }}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="file" className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="avatar-file">选择图片文件</Label>
                <Input
                  id="avatar-file"
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="cursor-pointer"
                />
                <p className="text-xs text-gray-500">支持 JPG、PNG、GIF 格式，最大 5MB</p>
              </div>
            </TabsContent>
          </Tabs>

          {(previewImage || newAvatarUrl) && (
            <div className="flex justify-center pt-4">
              <div className="text-center space-y-2">
                <Avatar className="h-24 w-24 mx-auto">
                  <AvatarImage src={previewImage || newAvatarUrl} alt="预览" className="object-cover" />
                  <AvatarFallback className="bg-purple-700 text-white text-2xl">
                    {user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <p className="text-sm text-gray-500">预览效果</p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleDialogClose}
            >
              取消
            </Button>
            <Button
              className="bg-purple-600 hover:bg-purple-700"
              onClick={handleSaveAvatar}
              disabled={!newAvatarUrl.trim()}
            >
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 修改密码对话框 */}
      <Dialog open={isPasswordDialogOpen} onOpenChange={handleClosePasswordDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>修改密码</DialogTitle>
            <DialogDescription>
              请输入您的当前密码和新密码
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* 当前密码 */}
            <div className="space-y-2">
              <Label htmlFor="current-password">当前密码</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="current-password"
                  type={showCurrentPassword ? "text" : "password"}
                  placeholder="请输入当前密码"
                  className="pl-10 pr-10"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showCurrentPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* 新密码 */}
            <div className="space-y-2">
              <Label htmlFor="new-password">新密码</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="new-password"
                  type={showNewPassword ? "text" : "password"}
                  placeholder="请输入新密码（至少6位）"
                  className="pl-10 pr-10"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {newPassword && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all ${
                          getPasswordStrength(newPassword).strength === 1 
                            ? "w-1/3 bg-red-500" 
                            : getPasswordStrength(newPassword).strength === 2 
                            ? "w-2/3 bg-yellow-500" 
                            : "w-full bg-green-500"
                        }`}
                      />
                    </div>
                    <span className={`text-sm ${getPasswordStrength(newPassword).color}`}>
                      {getPasswordStrength(newPassword).label}
                    </span>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className={`flex items-center gap-1 ${newPassword.length >= 8 ? "text-green-600" : "text-gray-500"}`}>
                      {newPassword.length >= 8 ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                      <span>至少8个字符</span>
                    </div>
                    <div className={`flex items-center gap-1 ${/[A-Z]/.test(newPassword) ? "text-green-600" : "text-gray-500"}`}>
                      {/[A-Z]/.test(newPassword) ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                      <span>包含大写字母</span>
                    </div>
                    <div className={`flex items-center gap-1 ${/[0-9]/.test(newPassword) ? "text-green-600" : "text-gray-500"}`}>
                      {/[0-9]/.test(newPassword) ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                      <span>包含数字</span>
                    </div>
                    <div className={`flex items-center gap-1 ${/[^A-Za-z0-9]/.test(newPassword) ? "text-green-600" : "text-gray-500"}`}>
                      {/[^A-Za-z0-9]/.test(newPassword) ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                      <span>包含特殊字符</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 确认新密码 */}
            <div className="space-y-2">
              <Label htmlFor="confirm-password">确认新密码</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="请再次输入新密码"
                  className="pl-10 pr-10"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {confirmPassword && (
                <div className="flex items-center gap-1 text-xs">
                  {newPassword === confirmPassword ? (
                    <>
                      <Check className="h-3 w-3 text-green-600" />
                      <span className="text-green-600">密码匹配</span>
                    </>
                  ) : (
                    <>
                      <X className="h-3 w-3 text-red-600" />
                      <span className="text-red-600">密码不匹配</span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleClosePasswordDialog}
              disabled={isChangingPassword}
            >
              取消
            </Button>
            <Button
              className="bg-purple-600 hover:bg-purple-700"
              onClick={handleChangePassword}
              disabled={isChangingPassword}
            >
              {isChangingPassword ? "修改中..." : "确认修改"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 注销账户确认对话框 */}
      <AlertDialog open={isDeleteAccountDialogOpen} onOpenChange={(open) => {
        setIsDeleteAccountDialogOpen(open);
        if (!open) {
          setDeleteAccountConfirmText("");
        }
      }}>
        <AlertDialogContent className="max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <span className="text-2xl">⚠️</span>
              确认注销账户？
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p className="text-red-600">
                此操作将永久删除您的账户及所有相关数据，且<strong>无法恢复</strong>。
              </p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm">
                <p className="mb-2">以下数据将被永久删除：</p>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>个人信息（用户名、邮箱、头像等）</li>
                  <li>您发布的所有活动（{publishedEvents.length + draftEvents.length} 个）</li>
                  <li>您的所有评价</li>
                  <li>已报名的活动记录（{registeredEvents.length} 个）</li>
                  <li>收藏的活动（{favoriteEvents.length} 个）</li>
                  <li>关注的主办方（{followedOrganizers.length} 个）</li>
                </ul>
              </div>
              <div className="space-y-2 pt-2">
                <Label htmlFor="delete-confirm" className="text-gray-700">
                  请输入 <span className="px-2 py-0.5 bg-gray-100 rounded text-red-600 font-mono">删除我的账户</span> 以确认
                </Label>
                <Input
                  id="delete-confirm"
                  type="text"
                  placeholder="删除我的账户"
                  value={deleteAccountConfirmText}
                  onChange={(e) => setDeleteAccountConfirmText(e.target.value)}
                  className="border-red-300 focus:border-red-500 focus:ring-red-500"
                />
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteAccountConfirmText("")}>
              取消
            </AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={deleteAccountConfirmText !== "删除我的账户"}
              onClick={() => {
                if (deleteAccountConfirmText === "删除我的账户") {
                  onDeleteAccount?.();
                  setIsDeleteAccountDialogOpen(false);
                  setDeleteAccountConfirmText("");
                }
              }}
            >
              确认注销
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 删除活动确认对话框 */}
      <AlertDialog open={deleteEventId !== null} onOpenChange={() => setDeleteEventId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除活动？</AlertDialogTitle>
            <AlertDialogDescription>
              此操作将永久删除该活动，且无法恢复。您确定要继续吗？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-600 hover:bg-red-700"
              onClick={() => {
                if (deleteEventId) {
                  onDeleteEvent?.(deleteEventId);
                  setDeleteEventId(null);
                }
              }}
            >
              确认删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
