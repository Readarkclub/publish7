import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import { Mail, Lock, User } from "lucide-react";

interface RegisterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRegister: (name: string, email: string, password: string) => void;
  onSwitchToLogin: () => void;
}

export function RegisterDialog({ open, onOpenChange, onRegister, onSwitchToLogin }: RegisterDialogProps) {
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

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

  const validatePassword = (password: string) => {
    if (!password) {
      setPasswordError("");
      return true;
    }
    if (password.length < 8) {
      setPasswordError("密码至少需要8个字符");
      return false;
    }
    setPasswordError("");
    return true;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    
    // 最终验证
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    
    if (isEmailValid && isPasswordValid) {
      onRegister(name, email, password);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">创建账户</DialogTitle>
          <DialogDescription className="text-center text-gray-600 text-sm">
            开始您的活动之旅
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">用户名</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="您的用户名"
                className="pl-10"
                required
              />
            </div>
          </div>

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
            <Label htmlFor="password">密码</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="至少8个字符"
                className={`pl-10 ${passwordError ? 'border-red-500' : ''}`}
                required
                minLength={8}
                onBlur={(e) => validatePassword(e.target.value)}
                onChange={(e) => validatePassword(e.target.value)}
              />
            </div>
            {passwordError && (
              <p className="text-sm text-red-600">{passwordError}</p>
            )}
          </div>

          <div className="flex items-start gap-2">
            <Checkbox id="terms" required />
            <label htmlFor="terms" className="text-sm text-gray-600 leading-relaxed cursor-pointer">
              我同意{" "}
              <a href="#" className="text-purple-600 hover:underline">
                服务条款
              </a>{" "}
              和{" "}
              <a href="#" className="text-purple-600 hover:underline">
                隐私政策
              </a>
            </label>
          </div>

          <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700">
            注册
          </Button>

          <div className="text-center text-sm">
            <span className="text-gray-600">已有账户？</span>{" "}
            <button
              type="button"
              onClick={() => {
                onOpenChange(false);
                onSwitchToLogin();
              }}
              className="text-purple-600 hover:underline"
            >
              立即登录
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
