import { useState, useMemo, useEffect } from "react";
import { Footer } from "./Footer";
import { SearchBar } from "./SearchBar";
import { FilterSidebar } from "./FilterSidebar";
import { EventCard } from "./EventCard";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import { Grid3x3, List, SlidersHorizontal } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from "./ui/sheet";
import type { Event } from "../types/event";

interface DiscoverPageProps {
  onNavigate?: (page: "home" | "discover" | "profile" | "create-event") => void;
  onEventClick?: (eventId: string) => void;
  events?: Event[];
  initialCategory?: string;
  onCategoryClick?: (category: string) => void;
}

export function DiscoverPage({ onNavigate, onEventClick, events, initialCategory, onCategoryClick }: DiscoverPageProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("latest");
  
  // 搜索状态
  const [searchQuery, setSearchQuery] = useState("");
  const [searchCity, setSearchCity] = useState("");
  const [searchDate, setSearchDate] = useState("");
  
  // 筛选状态
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialCategory ? [initialCategory] : []);
  const [selectedDateRange, setSelectedDateRange] = useState<string[]>([]);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<number[]>([0, 2000]);
  const [showFreeOnly, setShowFreeOnly] = useState(false);

  // 监听 initialCategory 变化，更新筛选分类
  useEffect(() => {
    if (initialCategory) {
      setSelectedCategories([initialCategory]);
    }
  }, [initialCategory]);

  // 使用传入的 events 或默认的空数组
  const allEvents = events || [];

  // 筛选和搜索逻辑
  const filteredEvents = useMemo(() => {
    let filtered = [...allEvents];

    // 搜索关键词筛选
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(event => 
        event.title.toLowerCase().includes(query) ||
        event.description?.toLowerCase().includes(query) ||
        event.category.toLowerCase().includes(query)
      );
    }

    // 搜索城市筛选
    if (searchCity.trim()) {
      const city = searchCity.toLowerCase();
      filtered = filtered.filter(event => 
        event.location.toLowerCase().includes(city)
      );
    }

    // 搜索日期筛选
    if (searchDate) {
      filtered = filtered.filter(event => {
        const eventDateStr = event.date.split(' ')[0]; // "2025年7月15日"
        const eventDate = parseDateString(eventDateStr);
        const searchDateObj = new Date(searchDate); // "2025-07-15" 格式
        return isSameDay(eventDate, searchDateObj);
      });
    }

    // 分类筛选
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(event => 
        selectedCategories.includes(event.category)
      );
    }

    // 城市筛选（侧边栏）
    if (selectedCities.length > 0) {
      filtered = filtered.filter(event => 
        selectedCities.some(city => event.location.includes(city))
      );
    }

    // 日期范围筛选
    if (selectedDateRange.length > 0) {
      const now = new Date();
      filtered = filtered.filter(event => {
        const eventDateStr = event.date.split(' ')[0]; // "2025年7月15日"
        const eventDate = parseDateString(eventDateStr);
        
        return selectedDateRange.some(range => {
          if (range === "今天") {
            return isSameDay(eventDate, now);
          } else if (range === "本周") {
            return isThisWeek(eventDate, now);
          } else if (range === "本月") {
            return isThisMonth(eventDate, now);
          } else if (range === "下个月") {
            return isNextMonth(eventDate, now);
          }
          return true;
        });
      });
    }

    // 价格筛选
    if (!showFreeOnly) {
      filtered = filtered.filter(event => {
        if (event.price === "免费") return priceRange[0] === 0;
        const priceMatch = event.price.match(/\d+/);
        if (priceMatch) {
          const price = parseInt(priceMatch[0]);
          return price >= priceRange[0] && price <= priceRange[1];
        }
        return true;
      });
    } else {
      filtered = filtered.filter(event => event.price === "免费");
    }

    return filtered;
  }, [allEvents, searchQuery, searchCity, searchDate, selectedCategories, selectedCities, selectedDateRange, priceRange, showFreeOnly]);

  // 排序逻辑
  const sortedEvents = useMemo(() => {
    const sorted = [...filteredEvents];
    
    switch (sortBy) {
      case "latest":
        // 默认顺序（最新发布）
        break;
      case "popular":
        sorted.sort((a, b) => b.attendees - a.attendees);
        break;
      case "date":
        sorted.sort((a, b) => {
          const dateA = parseDateString(a.date.split(' ')[0]);
          const dateB = parseDateString(b.date.split(' ')[0]);
          const now = new Date();
          
          // 计算距离今天的时间差（绝对值）
          const diffA = Math.abs(dateA.getTime() - now.getTime());
          const diffB = Math.abs(dateB.getTime() - now.getTime());
          
          // 优先显示即将发生的活动（未来的活动）
          const isAfutureEvent = dateA.getTime() >= now.getTime();
          const isBfutureEvent = dateB.getTime() >= now.getTime();
          
          // 如果一个是未来活动，一个是过去活动，未来活动排在前面
          if (isAfutureEvent && !isBfutureEvent) return -1;
          if (!isAfutureEvent && isBfutureEvent) return 1;
          
          // 如果都是未来活动或都是过去活动，按时间差从小到大排序
          return diffA - diffB;
        });
        break;
      case "price-low":
        sorted.sort((a, b) => {
          const priceA = a.price === "免费" ? 0 : parseInt(a.price.match(/\d+/)?.[0] || "0");
          const priceB = b.price === "免费" ? 0 : parseInt(b.price.match(/\d+/)?.[0] || "0");
          return priceA - priceB;
        });
        break;
      case "price-high":
        sorted.sort((a, b) => {
          const priceA = a.price === "免费" ? 0 : parseInt(a.price.match(/\d+/)?.[0] || "0");
          const priceB = b.price === "免费" ? 0 : parseInt(b.price.match(/\d+/)?.[0] || "0");
          return priceB - priceA;
        });
        break;
    }
    
    return sorted;
  }, [filteredEvents, sortBy]);

  const displayEvents = sortedEvents;

  // 计算分类和城市的计数
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    allEvents.forEach(event => {
      counts[event.category] = (counts[event.category] || 0) + 1;
    });
    return counts;
  }, [allEvents]);

  const cityCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    const cities = ["北京", "上海", "广州", "深圳", "杭州", "成都"];
    cities.forEach(city => {
      counts[city] = allEvents.filter(event => event.location.includes(city)).length;
    });
    return counts;
  }, [allEvents]);

  // 处理筛选器变化
  const handleCategoryChange = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleDateRangeChange = (dateRange: string) => {
    setSelectedDateRange(prev => 
      prev.includes(dateRange)
        ? prev.filter(d => d !== dateRange)
        : [...prev, dateRange]
    );
  };

  const handleCityChange = (city: string) => {
    setSelectedCities(prev => 
      prev.includes(city)
        ? prev.filter(c => c !== city)
        : [...prev, city]
    );
  };

  const handleClearFilters = () => {
    setSelectedCategories([]);
    setSelectedDateRange([]);
    setSelectedCities([]);
    setPriceRange([0, 2000]);
    setShowFreeOnly(false);
    setSearchQuery("");
    setSearchCity("");
    setSearchDate("");
  };

  const handleSearch = () => {
    // 搜索按钮点击时，筛选会自动通过 useMemo 触发
    // 这里可以添加额外的逻辑，比如滚动到结果区域
  };

  // 日期辅助函数
  function parseDateString(dateStr: string): Date {
    // 解析 "2025年7月15日" 格式
    const match = dateStr.match(/(\d+)年(\d+)月(\d+)日/);
    if (match) {
      return new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]));
    }
    return new Date();
  }

  function isSameDay(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }

  function isThisWeek(date: Date, now: Date): boolean {
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);
    
    return date >= weekStart && date < weekEnd;
  }

  function isThisMonth(date: Date, now: Date): boolean {
    return date.getFullYear() === now.getFullYear() &&
           date.getMonth() === now.getMonth();
  }

  function isNextMonth(date: Date, now: Date): boolean {
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return date.getFullYear() === nextMonth.getFullYear() &&
           date.getMonth() === nextMonth.getMonth();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-purple-600 to-pink-600 pt-16 pb-24">
        <div className="container mx-auto px-4">
          <div className="text-center text-white mb-8">
            <h1 className="text-4xl md:text-5xl mb-4">发现精彩活动</h1>
            <p className="text-xl opacity-90">探索您感兴趣的活动，开启美好体验</p>
          </div>
          <SearchBar 
            searchQuery={searchQuery}
            searchCity={searchCity}
            searchDate={searchDate}
            onSearchQueryChange={setSearchQuery}
            onSearchCityChange={setSearchCity}
            onSearchDateChange={setSearchDate}
            onSearch={handleSearch}
          />
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-12 gap-8">
            {/* Desktop Filter Sidebar */}
            <aside className="hidden lg:block lg:col-span-3">
              <FilterSidebar 
                selectedCategories={selectedCategories}
                selectedDateRange={selectedDateRange}
                selectedCities={selectedCities}
                priceRange={priceRange}
                showFreeOnly={showFreeOnly}
                onCategoryChange={handleCategoryChange}
                onDateRangeChange={handleDateRangeChange}
                onCityChange={handleCityChange}
                onPriceRangeChange={setPriceRange}
                onFreeOnlyChange={setShowFreeOnly}
                onClearFilters={handleClearFilters}
                categoryCounts={categoryCounts}
                cityCounts={cityCounts}
              />
            </aside>

            {/* Events List */}
            <main className="lg:col-span-9">
              {/* Toolbar */}
              <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex items-center gap-4">
                    <span className="text-gray-600">找到 <span className="text-purple-600">{displayEvents.length}</span> 个活动</span>
                    
                    {/* Mobile Filter Button */}
                    <Sheet>
                      <SheetTrigger asChild>
                        <Button variant="outline" size="sm" className="lg:hidden">
                          <SlidersHorizontal className="h-4 w-4 mr-2" />
                          筛选
                        </Button>
                      </SheetTrigger>
                      <SheetContent side="left" className="w-[300px] overflow-y-auto">
                        <SheetHeader>
                          <SheetTitle>筛选活动</SheetTitle>
                          <SheetDescription>
                            按分类、城市和价格筛选活动
                          </SheetDescription>
                        </SheetHeader>
                        <div className="mt-6">
                          <FilterSidebar 
                            selectedCategories={selectedCategories}
                            selectedDateRange={selectedDateRange}
                            selectedCities={selectedCities}
                            priceRange={priceRange}
                            showFreeOnly={showFreeOnly}
                            onCategoryChange={handleCategoryChange}
                            onDateRangeChange={handleDateRangeChange}
                            onCityChange={handleCityChange}
                            onPriceRangeChange={setPriceRange}
                            onFreeOnlyChange={setShowFreeOnly}
                            onClearFilters={handleClearFilters}
                            categoryCounts={categoryCounts}
                            cityCounts={cityCounts}
                          />
                        </div>
                      </SheetContent>
                    </Sheet>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Sort */}
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="排序" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="latest">最新发布</SelectItem>
                        <SelectItem value="popular">最受欢迎</SelectItem>
                        <SelectItem value="date">日期最近</SelectItem>
                        <SelectItem value="price-low">价格从低到高</SelectItem>
                        <SelectItem value="price-high">价格从高到低</SelectItem>
                      </SelectContent>
                    </Select>

                    {/* View Mode */}
                    <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "grid" | "list")}>
                      <TabsList>
                        <TabsTrigger value="grid" className="px-3">
                          <Grid3x3 className="h-4 w-4" />
                        </TabsTrigger>
                        <TabsTrigger value="list" className="px-3">
                          <List className="h-4 w-4" />
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                </div>
              </div>

              {/* Events Grid/List */}
              <div className={viewMode === "grid" 
                ? "grid md:grid-cols-2 xl:grid-cols-3 gap-6" 
                : "space-y-6"
              }>
                {displayEvents.map((event) => (
                  <EventCard 
                    key={event.id} 
                    {...event} 
                    onClick={() => onEventClick?.(event.id)}
                  />
                ))}
              </div>

              {/* Pagination */}
              <div className="flex justify-center items-center gap-2 mt-12">
                <Button variant="outline" disabled>上一页</Button>
                <Button variant="outline" className="bg-purple-600 text-white hover:bg-purple-700 hover:text-white">1</Button>
                <Button variant="outline">2</Button>
                <Button variant="outline">3</Button>
                <Button variant="outline">4</Button>
                <span className="text-gray-400">...</span>
                <Button variant="outline">10</Button>
                <Button variant="outline">下一页</Button>
              </div>
            </main>
          </div>
        </div>
      </section>

      <Footer onCategoryClick={onCategoryClick} onNavigate={onNavigate} />
    </div>
  );
}
