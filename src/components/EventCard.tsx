import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Calendar, MapPin, Users, Heart } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import type { User } from "../services/authService";

interface EventCardProps {
  id?: string;
  title: string;
  date: string;
  location: string;
  category: string;
  attendees: number;
  price: string;
  imageUrl: string;
  onClick?: () => void;
  onToggleFavorite?: (eventId: string) => void;
  isFavorited?: boolean;
  user?: User | null;
}

export function EventCard({ id, title, date, location, category, attendees, price, imageUrl, onClick, onToggleFavorite, isFavorited, user }: EventCardProps) {
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleFavorite && id) {
      onToggleFavorite(id);
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group" onClick={onClick}>
      <div className="relative overflow-hidden">
        <ImageWithFallback
          src={imageUrl}
          alt={title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <Badge className="absolute top-3 left-3 bg-white/90 text-gray-900 hover:bg-white">
          {category}
        </Badge>

        <div className="absolute top-3 right-3 flex gap-2">
          {price === "免费" && (
            <Badge className="bg-green-500 hover:bg-green-600">
              免费
            </Badge>
          )}

          {/* Favorite button */}
          <button
            className="p-2 rounded-full bg-white/90 hover:bg-white shadow-md transition-all"
            onClick={handleFavoriteClick}
            title={isFavorited ? "取消收藏" : "收藏"}
          >
            <Heart
              className={`h-5 w-5 transition-colors duration-300 ${isFavorited ? "text-red-500 fill-red-500" : "text-gray-400 hover:text-red-500"}`}
            />
          </button>
        </div>
      </div>

      <div className="p-5 space-y-3">
        <h3 className="text-gray-900 line-clamp-2 group-hover:text-purple-600 transition-colors">
          {title}
        </h3>

        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-purple-500" />
            <span>{date}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-purple-500" />
            <span>{location}</span>
          </div>
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-1 text-gray-500">
              <Users className="h-4 w-4" />
              <span>{attendees} 人参加</span>
            </div>
            <span className="text-purple-600">{price}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
