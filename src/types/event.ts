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
  time?: string; // 活动开始时间（用于编辑回填）
  location: string;
  address?: string;
  category: string;
  attendees: number;
  capacity?: number; // 活动人数上限
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
