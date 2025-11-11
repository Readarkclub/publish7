import { Checkbox } from "./ui/checkbox";
import { Slider } from "./ui/slider";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import { Button } from "./ui/button";
import { Music, Code, Trophy, Palette, BookOpen, PartyPopper, Utensils, Heart } from "lucide-react";

interface FilterSidebarProps {
  selectedCategories: string[];
  selectedDateRange: string[];
  selectedCities: string[];
  priceRange: number[];
  showFreeOnly: boolean;
  onCategoryChange: (category: string) => void;
  onDateRangeChange: (dateRange: string) => void;
  onCityChange: (city: string) => void;
  onPriceRangeChange: (range: number[]) => void;
  onFreeOnlyChange: (checked: boolean) => void;
  onClearFilters: () => void;
  categoryCounts?: Record<string, number>;
  cityCounts?: Record<string, number>;
}

export function FilterSidebar({
  selectedCategories,
  selectedDateRange,
  selectedCities,
  priceRange,
  showFreeOnly,
  onCategoryChange,
  onDateRangeChange,
  onCityChange,
  onPriceRangeChange,
  onFreeOnlyChange,
  onClearFilters,
  categoryCounts = {},
  cityCounts = {}
}: FilterSidebarProps) {
  const categories = [
    { name: "音乐", icon: Music },
    { name: "科技", icon: Code },
    { name: "体育", icon: Trophy },
    { name: "艺术", icon: Palette },
    { name: "教育", icon: BookOpen },
    { name: "娱乐", icon: PartyPopper },
    { name: "美食", icon: Utensils },
    { name: "健康", icon: Heart }
  ];

  const dates = [
    { label: "今天" },
    { label: "本周" },
    { label: "本月" },
    { label: "下个月" }
  ];

  const cities = [
    { name: "北京" },
    { name: "上海" },
    { name: "广州" },
    { name: "深圳" },
    { name: "杭州" },
    { name: "成都" }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-gray-900">筛选条件</h3>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-purple-600"
            onClick={onClearFilters}
          >
            清空
          </Button>
        </div>

        <div className="space-y-6">
          {/* 分类 */}
          <div>
            <Label className="text-gray-900 mb-3 block">活动分类</Label>
            <div className="space-y-3">
              {categories.map((category) => {
                const Icon = category.icon;
                const isChecked = selectedCategories.includes(category.name);
                return (
                  <div key={category.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Checkbox 
                        id={category.name}
                        checked={isChecked}
                        onCheckedChange={() => onCategoryChange(category.name)}
                      />
                      <label
                        htmlFor={category.name}
                        className="text-sm text-gray-700 cursor-pointer flex items-center gap-2"
                      >
                        <Icon className="h-4 w-4 text-gray-400" />
                        {category.name}
                      </label>
                    </div>
                    <span className="text-xs text-gray-400">
                      {categoryCounts[category.name] || 0}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <Separator />

          {/* 日期范围 */}
          <div>
            <Label className="text-gray-900 mb-3 block">日期</Label>
            <div className="space-y-2">
              {dates.map((date) => {
                const isChecked = selectedDateRange.includes(date.label);
                return (
                  <div key={date.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Checkbox 
                        id={date.label}
                        checked={isChecked}
                        onCheckedChange={() => onDateRangeChange(date.label)}
                      />
                      <label
                        htmlFor={date.label}
                        className="text-sm text-gray-700 cursor-pointer"
                      >
                        {date.label}
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <Separator />

          {/* 城市 */}
          <div>
            <Label className="text-gray-900 mb-3 block">城市</Label>
            <div className="space-y-2">
              {cities.map((city) => {
                const isChecked = selectedCities.includes(city.name);
                return (
                  <div key={city.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Checkbox 
                        id={city.name}
                        checked={isChecked}
                        onCheckedChange={() => onCityChange(city.name)}
                      />
                      <label
                        htmlFor={city.name}
                        className="text-sm text-gray-700 cursor-pointer"
                      >
                        {city.name}
                      </label>
                    </div>
                    <span className="text-xs text-gray-400">
                      {cityCounts[city.name] || 0}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <Separator />

          {/* 价格范围 */}
          <div>
            <Label className="text-gray-900 mb-3 block">价格范围</Label>
            <div className="space-y-4">
              <Slider 
                value={priceRange}
                onValueChange={onPriceRangeChange}
                max={2000} 
                step={50}
                minStepsBetweenThumbs={1}
              />
              <div className="flex justify-between text-sm text-gray-600">
                <span>¥{priceRange[0]}</span>
                <span>¥{priceRange[1]}+</span>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox 
                  id="free-events"
                  checked={showFreeOnly}
                  onCheckedChange={(checked) => onFreeOnlyChange(checked as boolean)}
                />
                <label htmlFor="free-events" className="text-sm text-gray-700 cursor-pointer">
                  仅显示免费活动
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
