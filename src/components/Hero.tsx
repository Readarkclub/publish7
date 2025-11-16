import { Button } from "./ui/button";
import { Search, Calendar, Users, TrendingUp } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface HeroProps {
  onNavigate?: (page: "home" | "discover" | "profile" | "create-event") => void;
  onSearch?: (keyword: string) => void;
  user?: {
    name: string;
    email: string;
    avatar?: string;
  } | null;
  onLogin?: () => void;
}

export function Hero({ onNavigate, onSearch, user, onLogin }: HeroProps) {
  return (
    <section className="relative bg-gradient-to-br from-purple-50 via-white to-pink-50 overflow-hidden">
      <div className="container mx-auto px-4 py-20 md:py-32">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-block px-4 py-2 bg-purple-100 text-purple-700 rounded-full">
              <span className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                发现精彩活动，创造美好回忆
              </span>
            </div>
            
            <h1 className="text-5xl md:text-6xl text-gray-900">
              探索身边的
              <span className="text-purple-600"> 精彩活动</span>
            </h1>
            
            <p className="text-xl text-gray-600">
              从音乐节到技术大会，从艺术展览到运动赛事，发现并参与最适合你的活动
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <Button 
                size="lg" 
                className="bg-purple-600 hover:bg-purple-700"
                onClick={() => onNavigate?.("discover")}
              >
                <Search className="mr-2 h-5 w-5" />
                发现活动
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => {
                  if (!user) {
                    onLogin?.();
                  } else {
                    onNavigate?.("create-event");
                  }
                }}
              >
                <Calendar className="mr-2 h-5 w-5" />
                发布活动
              </Button>
            </div>

            <div className="flex gap-8 pt-6">
              <div>
                <div className="text-3xl text-purple-600">1000+</div>
                <div className="text-gray-600">精彩活动</div>
              </div>
              <div>
                <div className="text-3xl text-purple-600">50K+</div>
                <div className="text-gray-600">活跃用户</div>
              </div>
              <div>
                <div className="text-3xl text-purple-600">100+</div>
                <div className="text-gray-600">城市覆盖</div>
              </div>
            </div>
          </div>

          <div className="relative hidden md:block">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-3xl blur-3xl opacity-20"></div>
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <ImageWithFallback 
                src="https://images.unsplash.com/photo-1644959166965-8606f1ce1f06?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb25jZXJ0JTIwY3Jvd2QlMjBldmVudHxlbnwxfHx8fDE3NjA1NTg2MDl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="活动现场"
                className="w-full h-[500px] object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
