import { useState } from "react";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from "./ui/sheet";
import { CalendarDays, User, LogOut, Menu, Home, Search, PlusCircle } from "lucide-react";

interface HeaderProps {
  onNavigate?: (page: "home" | "discover" | "profile" | "create-event", tab?: string) => void;
  user?: {
    name: string;
    email: string;
    avatar?: string;
  } | null;
  onLoginClick?: () => void;
  onRegisterClick?: () => void;
  onLogout?: () => void;
}

export function Header({ onNavigate, user, onLoginClick, onRegisterClick, onLogout }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Mobile Menu Button */}
        <div className="flex items-center gap-3">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">打开菜单</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] p-0">
              <SheetHeader className="border-b p-6">
                <SheetTitle className="flex items-center gap-2 text-purple-600">
                  <CalendarDays className="h-6 w-6" />
                  活动圈
                </SheetTitle>
                <SheetDescription className="sr-only">
                  导航菜单
                </SheetDescription>
              </SheetHeader>
              <nav className="flex flex-col p-4">
                <button
                  onClick={() => {
                    onNavigate?.("home");
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-purple-50 hover:text-purple-600 rounded-lg transition-colors"
                >
                  <Home className="h-5 w-5" />
                  首页
                </button>
                <button
                  onClick={() => {
                    onNavigate?.("discover");
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-purple-50 hover:text-purple-600 rounded-lg transition-colors"
                >
                  <Search className="h-5 w-5" />
                  发现活动
                </button>
                <button
                  onClick={() => {
                    if (!user) {
                      onLoginClick?.();
                      setMobileMenuOpen(false);
                    } else {
                      onNavigate?.("create-event");
                      setMobileMenuOpen(false);
                    }
                  }}
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-purple-50 hover:text-purple-600 rounded-lg transition-colors"
                >
                  <PlusCircle className="h-5 w-5" />
                  发布活动
                </button>
                
                {user && (
                  <>
                    <div className="my-4 border-t" />
                    <button
                      onClick={() => {
                        onNavigate?.("profile", "registered");
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-purple-50 hover:text-purple-600 rounded-lg transition-colors"
                    >
                      <User className="h-5 w-5" />
                      个人中心
                    </button>
                    <button
                      onClick={() => {
                        onLogout?.();
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <LogOut className="h-5 w-5" />
                      退出登录
                    </button>
                  </>
                )}
                
                {!user && (
                  <>
                    <div className="my-4 border-t" />
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-3"
                      onClick={() => {
                        onLoginClick?.();
                        setMobileMenuOpen(false);
                      }}
                    >
                      登录
                    </Button>
                    <Button
                      className="w-full justify-start gap-3 mt-2 bg-purple-600 hover:bg-purple-700"
                      onClick={() => {
                        onRegisterClick?.();
                        setMobileMenuOpen(false);
                      }}
                    >
                      注册
                    </Button>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>

          <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate?.("home")}>
            <CalendarDays className="h-6 w-6 text-purple-600" />
            <span className="text-xl text-purple-600">活动圈</span>
          </div>
        </div>
        
        <nav className="hidden md:flex items-center gap-8">
          <button 
            onClick={() => onNavigate?.("home")}
            className="text-gray-700 hover:text-purple-600 transition-colors"
          >
            首页
          </button>
          <button 
            onClick={() => onNavigate?.("discover")}
            className="text-gray-700 hover:text-purple-600 transition-colors"
          >
            发现活动
          </button>
          <button 
            onClick={() => {
              if (!user) {
                onLoginClick?.();
              } else {
                onNavigate?.("create-event");
              }
            }}
            className="text-gray-700 hover:text-purple-600 transition-colors"
          >
            发布活动
          </button>
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors cursor-pointer outline-none">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="bg-purple-600 text-white">
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden md:inline text-gray-900">{user.name}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 z-[100]">
                <DropdownMenuLabel>我的账户</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onSelect={(e) => {
                    e.preventDefault();
                    onNavigate?.("profile", "registered");
                  }}
                  className="cursor-pointer"
                >
                  <User className="mr-2 h-4 w-4" />
                  个人中心
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onSelect={(e) => {
                    e.preventDefault();
                    onLogout?.();
                  }}
                  className="cursor-pointer text-red-600 focus:text-red-600"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  退出登录
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" className="hidden md:inline-flex" onClick={onLoginClick}>
                登录
              </Button>
              <Button className="bg-purple-600 hover:bg-purple-700" onClick={onRegisterClick}>
                注册
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
