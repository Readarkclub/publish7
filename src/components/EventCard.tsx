import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Calendar, MapPin, Users } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

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
}

export function EventCard({ id, title, date, location, category, attendees, price, imageUrl, onClick }: EventCardProps) {
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
        {price === "免费" && (
          <Badge className="absolute top-3 right-3 bg-green-500 hover:bg-green-600">
            免费
          </Badge>
        )}
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
