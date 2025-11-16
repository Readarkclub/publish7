import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Mail, Lock, Check } from "lucide-react";
import { toast } from "sonner";
import * as authService from "../services/authService";

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLogin: (email: string, password: string) => void;
  onSwitchToRegister: () => void;
}

export function LoginDialog({ open, onOpenChange, onLogin, onSwitchToRegister }: LoginDialogProps) {
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [emailError, setEmailError] = useState("");

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError("");
      return true;
    }
    if (!emailRegex.test(email)) {
      setEmailError("请输入有效的邮箱地址");
      return false;
    }
    setEmailError("");
    return true;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    
    // 验证邮箱格式
    if (validateEmail(email)) {
      onLogin(email, password);
    }
  };

  const handleForgotPasswordClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setShowForgotPassword(true);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">欢迎回来</DialogTitle>
          <DialogDescription className="text-center text-gray-600 text-sm">
            登录您的账户以继续
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="email">邮箱地址</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="your@email.com"
                className={`pl-10 ${emailError ? 'border-red-500' : ''}`}
                required
                onBlur={(e) => validateEmail(e.target.value)}
                onChange={(e) => validateEmail(e.target.value)}
              />
            </div>
            {emailError && (
              <p className="text-sm text-red-600">{emailError}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="password">密码</Label>
              <a 
                href="#" 
                className="text-sm text-purple-600 hover:underline"
                onClick={handleForgotPasswordClick}
              >
                忘记密码？
              </a>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                className="pl-10"
                required
              />
            </div>
          </div>

          <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700">
            登录
          </Button>

          <div className="text-center text-sm">
            <span className="text-gray-600">还没有账户？</span>{" "}
            <button
              type="button"
              onClick={() => {
                onOpenChange(false);
                onSwitchToRegister();
              }}
              className="text-purple-600 hover:underline"
            >
              立即注册
            </button>
          </div>
        </form>
      </DialogContent>

      {/* Forgot Password Dialog */}
      <ForgotPasswordDialog 
        open={showForgotPassword}
        onOpenChange={setShowForgotPassword}
      />
    </Dialog>
  );
}

// 忘记密码对话框组件
function ForgotPasswordDialog({
  open,
  onOpenChange
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("请输入邮箱地址");
      return;
    }

    if (!validateEmail(email)) {
      toast.error("请输入有效的邮箱地址");
      return;
    }

    setIsSubmitting(true);

    // 调用真实的密码重置 API
    const result = await authService.resetPassword(email);

    setIsSubmitting(false);

    if (result.success) {
      setIsSuccess(true);
      toast.success("密码重置链接已发送到您的邮箱");
    } else {
      // 即使失败也显示成功消息（安全考虑）
      setIsSuccess(true);
      toast.success("如果该邮箱已注册，您将收到密码重置链接");
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    // 延迟重置状态，等待对话框关闭动画完成
    setTimeout(() => {
      setEmail("");
      setIsSuccess(false);
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">
            {isSuccess ? "邮件已发送" : "忘记密码"}
          </DialogTitle>
          <DialogDescription className="text-center text-gray-600 text-sm">
            {isSuccess 
              ? "我们已向您的邮箱发送了密码重置链接" 
              : "输入您的注册邮箱，我们将发送密码重置链接"}
          </DialogDescription>
        </DialogHeader>

        {isSuccess ? (
          <div className="py-6 space-y-4">
            <div className="flex justify-center">
              <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                <Check className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <div className="text-center space-y-2">
              <p className="text-gray-700">
                密码重置链接已发送到：
              </p>
              <p className="text-purple-600">
                {email}
              </p>
              <p className="text-sm text-gray-500">
                请检查您的邮箱（包括垃圾邮件文件夹）并点击链接重置密码
              </p>
            </div>
            <Button
              onClick={handleClose}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              知道了
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="reset-email">邮箱地址</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="your@email.com"
                  className="pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <p className="text-xs text-gray-500">
                我们将向此邮箱发送密码重置链接
              </p>
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="w-full sm:w-auto"
              >
                取消
              </Button>
              <Button
                type="submit"
                className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? "发送中..." : "发送重置链接"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
