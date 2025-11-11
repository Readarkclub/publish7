import { Search, MapPin, Calendar } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

interface SearchBarProps {
  searchQuery: string;
  searchCity: string;
  searchDate: string;
  onSearchQueryChange: (value: string) => void;
  onSearchCityChange: (value: string) => void;
  onSearchDateChange: (value: string) => void;
  onSearch: () => void;
}

export function SearchBar({
  searchQuery,
  searchCity,
  searchDate,
  onSearchQueryChange,
  onSearchCityChange,
  onSearchDateChange,
  onSearch
}: SearchBarProps) {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 -mt-8 relative z-10">
      <div className="grid md:grid-cols-12 gap-4">
        <div className="md:col-span-5">
          <label className="block text-sm text-gray-600 mb-2">搜索活动</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input 
              placeholder="搜索活动名称、关键词..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              onKeyPress={handleKeyPress}
            />
          </div>
        </div>

        <div className="md:col-span-3">
          <label className="block text-sm text-gray-600 mb-2">城市</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input 
              placeholder="选择城市"
              className="pl-10"
              value={searchCity}
              onChange={(e) => onSearchCityChange(e.target.value)}
              onKeyPress={handleKeyPress}
            />
          </div>
        </div>

        <div className="md:col-span-3">
          <label className="block text-sm text-gray-600 mb-2">日期</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input 
              type="date"
              placeholder="选择日期"
              className="pl-10"
              value={searchDate}
              onChange={(e) => onSearchDateChange(e.target.value)}
            />
          </div>
        </div>

        <div className="md:col-span-1 flex items-end">
          <Button 
            className="w-full bg-purple-600 hover:bg-purple-700"
            onClick={onSearch}
          >
            搜索
          </Button>
        </div>
      </div>
    </div>
  );
}
