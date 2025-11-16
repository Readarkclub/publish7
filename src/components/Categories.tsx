import { Music, Code, Trophy, Palette, BookOpen, PartyPopper } from "lucide-react";

interface CategoriesProps {
  onNavigate?: (page: "home" | "discover" | "profile" | "create-event", eventId?: string, category?: string) => void;
}

export function Categories({ onNavigate }: CategoriesProps) {
  const categories = [
    {
      name: "音乐",
      icon: Music,
      count: 156,
      color: "bg-purple-100 text-purple-600 hover:bg-purple-200"
    },
    {
      name: "科技",
      icon: Code,
      count: 89,
      color: "bg-blue-100 text-blue-600 hover:bg-blue-200"
    },
    {
      name: "体育",
      icon: Trophy,
      count: 134,
      color: "bg-green-100 text-green-600 hover:bg-green-200"
    },
    {
      name: "艺术",
      icon: Palette,
      count: 67,
      color: "bg-pink-100 text-pink-600 hover:bg-pink-200"
    },
    {
      name: "教育",
      icon: BookOpen,
      count: 98,
      color: "bg-orange-100 text-orange-600 hover:bg-orange-200"
    },
    {
      name: "娱乐",
      icon: PartyPopper,
      count: 201,
      color: "bg-red-100 text-red-600 hover:bg-red-200"
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl text-gray-900 mb-3">热门分类</h2>
          <p className="text-gray-600">按类别探索你感兴趣的活动</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category, index) => {
            const Icon = category.icon;
            return (
              <button
                key={index}
                onClick={() => onNavigate?.("discover", undefined, category.name)}
                className={`${category.color} rounded-xl p-6 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all hover:scale-105`}
              >
                <Icon className="h-8 w-8" />
                <div className="text-center">
                  <div>{category.name}</div>
                  <div className="text-sm opacity-75">{category.count} 个活动</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
