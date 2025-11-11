import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { User, Mail, Lock, Bell, Shield, Camera, Upload } from "lucide-react";
import { Switch } from "./ui/switch";
import { Separator } from "./ui/separator";
import { toast } from "sonner";

interface SettingsPageProps {
  onNavigate?: (page: "home" | "discover" | "profile" | "create-event") => void;
  user?: {
    name: string;
    email: string;
    avatar?: string;
  } | null;
  onUpdateUser?: (user: { name: string; email: string; avatar?: string }) => void;
}

export function SettingsPage({ onNavigate, user, onUpdateUser }: SettingsPageProps) {
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar || "");
  const [isUploading, setIsUploading] = useState(false);

  // 通知设置
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [eventReminders, setEventReminders] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);

  const handleSaveProfile = () => {
    if (!name.trim()) {
      toast.error("请输入用户名");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      toast.error("请输入有效的邮箱地址");
      return;
    }

    onUpdateUser?.({ name, email, avatar: avatarUrl });
    toast.success("个人信息已更新");
  };

  const handleChangePassword = () => {
    if (!currentPassword) {
      toast.error("请输入当前密码");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("新密码至少需要6个字符");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("两次输入的密码不一致");
      return;
    }

    toast.success("密码已修改");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 检查文件类型
    if (!file.type.startsWith("image/")) {
      toast.error("请上传图片文件");
      return;
    }

    // 检查文件大小（限制5MB）
    if (file.size > 5 * 1024 * 1024) {
      toast.error("图片大小不能超过5MB");
      return;
    }

    setIsUploading(true);

    // 模拟上传过程
    const reader = new FileReader();
    reader.onloadend = () => {
      setTimeout(() => {
        setAvatarUrl(reader.result as string);
        setIsUploading(false);
        toast.success("头像已更新");
      }, 1000);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setAvatarUrl("");
    toast.success("头像已移除");
  };

  const handleSaveNotifications = () => {
    toast.success("通知设置已保存");
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              className="text-white hover:bg-white/20"
              onClick={() => onNavigate?.("profile")}
            >
              ← 返回个人中心
            </Button>
          </div>
          <h1 className="text-3xl mt-4">账户设置</h1>
          <p className="text-purple-100 mt-2">管理您的账户信息和偏好设置</p>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 py-8">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="bg-white p-1 shadow-sm">
            <TabsTrigger value="profile" className="gap-2">
              <User className="h-4 w-4" />
              个人信息
            </TabsTrigger>
            <TabsTrigger value="avatar" className="gap-2">
              <Camera className="h-4 w-4" />
              头像设置
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Lock className="h-4 w-4" />
              安全设置
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="h-4 w-4" />
              通知设置
            </TabsTrigger>
            <TabsTrigger value="privacy" className="gap-2">
              <Shield className="h-4 w-4" />
              隐私设置
            </TabsTrigger>
          </TabsList>

          {/* 个人信息 */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>个人信息</CardTitle>
                <CardDescription>更新您的个人资料信息</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">用户名</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="请输入用户名"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">邮箱地址</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="请输入邮箱地址"
                  />
                </div>
                <Separator />
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => onNavigate?.("profile")}>
                    取消
                  </Button>
                  <Button onClick={handleSaveProfile} className="bg-purple-600 hover:bg-purple-700">
                    保存更改
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 头像设置 */}
          <TabsContent value="avatar">
            <Card>
              <CardHeader>
                <CardTitle>头像设置</CardTitle>
                <CardDescription>上传或更换您的头像</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col items-center gap-6">
                  <div className="relative">
                    <Avatar className="h-32 w-32">
                      <AvatarImage src={avatarUrl} alt={user.name} />
                      <AvatarFallback className="bg-purple-600 text-white text-4xl">
                        {user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {isUploading && (
                      <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
                    <Button
                      className="flex-1 bg-purple-600 hover:bg-purple-700"
                      onClick={() => document.getElementById("avatar-upload")?.click()}
                      disabled={isUploading}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      上传新头像
                    </Button>
                    {avatarUrl && (
                      <Button
                        variant="outline"
                        onClick={handleRemoveAvatar}
                        disabled={isUploading}
                      >
                        移除头像
                      </Button>
                    )}
                  </div>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                  />

                  <div className="text-sm text-gray-500 text-center max-w-md">
                    <p>支持 JPG、PNG、GIF 格式</p>
                    <p>文件大小不超过 5MB</p>
                    <p>建议使用 400x400 像素的正方形图片</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 安全设置 */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>修改密码</CardTitle>
                <CardDescription>定期更换密码以保护账户安全</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">当前密码</Label>
                  <Input
                    id="current-password"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="请输入当前密码"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">新密码</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="请输入新密码（至少6个字符）"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">确认新密码</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="请再次输入新密码"
                  />
                </div>
                <Separator />
                <div className="flex justify-end">
                  <Button onClick={handleChangePassword} className="bg-purple-600 hover:bg-purple-700">
                    更新密码
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>两步验证</CardTitle>
                <CardDescription>为您的账户添加额外的安全保护</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">启用两步验证</p>
                    <p className="text-sm text-gray-500">登录时需要额外的验证码</p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 通知设置 */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>通知偏好</CardTitle>
                <CardDescription>选择您希望接收的通知类型</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium">邮件通知</p>
                    <p className="text-sm text-gray-500">接收活动相关的邮件通知</p>
                  </div>
                  <Switch
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium">推送通知</p>
                    <p className="text-sm text-gray-500">接收浏览器推送通知</p>
                  </div>
                  <Switch
                    checked={pushNotifications}
                    onCheckedChange={setPushNotifications}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium">活动提醒</p>
                    <p className="text-sm text-gray-500">在活动开始前收到提醒</p>
                  </div>
                  <Switch
                    checked={eventReminders}
                    onCheckedChange={setEventReminders}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium">营销邮件</p>
                    <p className="text-sm text-gray-500">接收推荐活动和优惠信息</p>
                  </div>
                  <Switch
                    checked={marketingEmails}
                    onCheckedChange={setMarketingEmails}
                  />
                </div>
                <Separator />
                <div className="flex justify-end">
                  <Button onClick={handleSaveNotifications} className="bg-purple-600 hover:bg-purple-700">
                    保存设置
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 隐私设置 */}
          <TabsContent value="privacy">
            <Card>
              <CardHeader>
                <CardTitle>隐私设置</CardTitle>
                <CardDescription>管理您的隐私和数据</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium">公开个人资料</p>
                    <p className="text-sm text-gray-500">允许其他用户查看您的个人资料</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium">显示参加的活动</p>
                    <p className="text-sm text-gray-500">在个人资料中显示您参加的活动</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium">允许搜索</p>
                    <p className="text-sm text-gray-500">允许其他用户通过邮箱搜索到您</p>
                  </div>
                  <Switch />
                </div>
                <Separator />
                <div className="pt-4">
                  <h3 className="font-medium text-red-600 mb-2">危险操作</h3>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full border-red-200 text-red-600 hover:bg-red-50">
                      导出我的数据
                    </Button>
                    <Button variant="outline" className="w-full border-red-200 text-red-600 hover:bg-red-50">
                      删除我的账户
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}
