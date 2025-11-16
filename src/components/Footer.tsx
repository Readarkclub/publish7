import { CalendarDays, Mail, MapPin, Phone } from "lucide-react";

interface FooterProps {
  onNavigate?: (page: "home" | "discover" | "profile" | "create-event", eventId?: string, category?: string) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="bg-gray-900 text-gray-300 py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-6 w-6 text-purple-400" />
              <span className="text-xl text-white">活动圈</span>
            </div>
            <p className="text-sm">
              发现和创建精彩活动的最佳平台，连接志同道合的人，创造难忘的回忆。
            </p>
          </div>

          <div>
            <h3 className="text-white mb-4">快速链接</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="https://www.rrzxs.com/" target="_blank" rel="noopener noreferrer" className="hover:text-purple-400 transition-colors">关于我们</a></li>
              <li>
                <button 
                  onClick={() => onNavigate?.("discover")} 
                  className="hover:text-purple-400 transition-colors text-left"
                >
                  发现活动
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate?.("create-event")} 
                  className="hover:text-purple-400 transition-colors text-left"
                >
                  发布活动
                </button>
              </li>
              <li><a href="#" className="hover:text-purple-400 transition-colors">帮助中心</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white mb-4">分类</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  onClick={() => onNavigate?.("discover", undefined, "音乐")}
                  className="hover:text-purple-400 transition-colors text-left"
                >
                  音乐活动
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate?.("discover", undefined, "科技")}
                  className="hover:text-purple-400 transition-colors text-left"
                >
                  科技会议
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate?.("discover", undefined, "体育")}
                  className="hover:text-purple-400 transition-colors text-left"
                >
                  体育赛事
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate?.("discover", undefined, "艺术")}
                  className="hover:text-purple-400 transition-colors text-left"
                >
                  艺术展览
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white mb-4">联系我们</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-purple-400" />
                readarkclub@gmail.com
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-purple-400" />
                中国·苏州
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
          <p>© 2025 活动圈. 保留所有权利.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-purple-400 transition-colors">隐私政策</a>
            <a href="#" className="hover:text-purple-400 transition-colors">服务条款</a>
            <a href="#" className="hover:text-purple-400 transition-colors">Cookie政策</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
