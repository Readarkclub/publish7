import { EventCard } from "./EventCard";
import { Button } from "./ui/button";
import { ArrowRight } from "lucide-react";
import type { Event } from "../types/event";

interface FeaturedEventsProps {
  onEventClick?: (eventId: string) => void;
  events?: Event[];
  onNavigate?: (page: "home" | "discover" | "profile" | "create-event") => void;
}

export function FeaturedEvents({ onEventClick, events, onNavigate }: FeaturedEventsProps) {
  // 使用传入的 events 或默认的空数组
  const displayEvents = events || [];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-4xl text-gray-900 mb-3">精选活动</h2>
            <p className="text-gray-600">发现最热门、最精彩的活动</p>
          </div>
          <Button 
            variant="outline" 
            className="hidden md:flex items-center gap-2"
            onClick={() => onNavigate?.("discover")}
          >
            查看全部
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayEvents.map((event) => (
            <EventCard 
              key={event.id} 
              {...event} 
              onClick={() => onEventClick?.(event.id)}
            />
          ))}
        </div>

        <div className="flex justify-center mt-12 md:hidden">
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={() => onNavigate?.("discover")}
          >
            查看全部活动
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
