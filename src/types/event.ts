export interface Review {
  user: string;
  avatar: string;
  rating: number;
  date: string;
  comment: string;
  userEmail?: string; // 用于标识评价者
}

export interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  category: string;
  attendees: number;
  price: string;
  imageUrl: string;
  description?: string;
  organizer?: {
    name: string;
    avatar: string;
    description: string;
    eventsCount: number;
  };
  highlights?: string[];
  agenda?: {
    time: string;
    title: string;
    description: string;
  }[];
  status?: 'draft' | 'published';
  createdBy?: string;
  reviews?: Review[]; // 活动评价
}
