import { useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { Textarea } from "./ui/textarea";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import {
  Calendar,
  MapPin,
  Users,
  Share2,
  Heart,
  Clock,
  Ticket,
  Star,
  CheckCircle,
  MessageCircle,
  Link as LinkIcon,
  Check,
  ArrowLeft,
  Trash2
} from "lucide-react";
import { toast } from "sonner";
import type { Event, Review } from "../types/event";

interface EventDetailPageProps {
  onNavigate?: (page: "home" | "discover" | "profile" | "create-event") => void;
  eventId?: string;
  user?: {
    name: string;
    email: string;
    avatar?: string;
    isAdmin?: boolean;
  } | null;
  events?: Event[];
  event?: Event; // 新添加：直接传入整个活动对象
  isRegistered?: boolean;
  isFavorited?: boolean;
  onRegister?: (eventId: string) => boolean;
  onToggleFavorite?: (eventId: string) => boolean;
  onCategoryClick?: (category: string) => void;
  isFollowingOrganizer?: boolean;
  onFollowOrganizer?: (organizerName: string) => boolean;
  onAddReview?: (eventId: string, review: { rating: number; comment: string }) => void;
  onDeleteReview?: (eventId: string, reviewUserEmail: string) => void;
}

export function EventDetailPage({
  onNavigate,
  eventId,
  user,
  events,
  event: propEvent, // 重命名：直接传入的 event 对象
  isRegistered: externalIsRegistered,
  isFavorited: externalIsFavorited,
  onRegister,
  onToggleFavorite,
  onCategoryClick,
  isFollowingOrganizer,
  onFollowOrganizer,
  onAddReview,
  onDeleteReview
}: EventDetailPageProps) {
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [hoverRating, setHoverRating] = useState(0);
  const [showDeleteReviewDialog, setShowDeleteReviewDialog] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<Review | null>(null);

  // 使用外部传入的状态
  const isRegistered = externalIsRegistered || false;
  const isFavorited = externalIsFavorited || false;
  const isFollowing = isFollowingOrganizer || false;

  // 优先使用直接传入的 event 对象，如果没有则尝试从 events 中查找
  const event: Event = propEvent || events?.find(e => e.id === eventId) || {
    id: eventId || "default-event",
    title: "夏日音乐节 2025 - 全明星阵容震撼来袭",
    date: "2025年7月15日 18:00",
    location: "上海世博公园",
    category: "音乐",
    attendees: 2500,
    price: "¥299起",
    imageUrl: "https://images.unsplash.com/photo-1672841821756-fc04525771c2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNpYyUyMGZlc3RpdmFsJTIwY29uY2VydHxlbnwxfHx8fDE3NjA1MTE4OTZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    description: `
      这个夏天，让我们相聚在音乐的海洋！2025夏日音乐节将汇聚国内外顶尖音乐人，为您带来一场视听盛宴。从流行到摇滚，从电子到民谣，多元化的音乐风格将满足不同乐迷的需求。

      活动将在美丽的上海世博公园举办，占地面积超过10000平方米，配备国际一流的音响设备和舞台灯光系统。除了精彩的音乐表演，现场还设有美食区、艺术装置区和互动体验区，让您度过一个难忘的音乐之夜。

      我们承诺为所有参与者提供安全、舒适的活动体验。现场配备专业的安保团队和医疗团队，确保每位观众都能安心享受音乐。
    `,
    organizer: {
      name: "星空文化传媒",
      avatar: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxldmVudCUyMG9yZ2FuaXplciUyMHRlYW18ZW58MXx8fHwxNzYwNTkxNzkxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      description: "专注于大型音乐节和文化活动策划，已成功举办超过50场大型活动，累计服务观众超过100万人次。",
      eventsCount: 52
    },
    highlights: [
      "国内外顶尖音乐人阵容",
      "国际一流音响设备",
      "10000㎡超大场地",
      "多元化音乐风格",
      "美食市集和艺术展区",
      "专业安保和医疗保障"
    ],
    agenda: [
      {
        time: "18:00 - 18:30",
        title: "开场表演",
        description: "新生代乐队热场演出"
      },
      {
        time: "18:30 - 19:30",
        title: "电音专场",
        description: "知名DJ带来震撼电音体验"
      },
      {
        time: "19:30 - 20:30",
        title: "摇滚之夜",
        description: "摇滚乐队燃爆全场"
      },
      {
        time: "20:30 - 21:30",
        title: "流行歌手专场",
        description: "顶流歌手压轴演出"
      },
      {
        time: "21:30 - 22:00",
        title: "大合唱",
        description: "全体艺人与观众互动"
      }
    ]
  };

  const relatedEvents = [
    {
      title: "电音派对 - 狂欢之夜",
      date: "2025年10月18日 20:00",
      location: "成都339派对现场",
      category: "娱乐",
      attendees: 3200,
      price: "¥199起",
      imageUrl: "https://images.unsplash.com/photo-1644959166965-8606f1ce1f06?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb25jZXJ0JTIwY3Jvd2QlMjBldmVudHxlbnwxfHx8fDE3NjA1NTg2MDl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
    },
    {
      title: "爵士音乐之夜",
      date: "2025年8月25日 19:00",
      location: "北京蓝色港湾",
      category: "音乐",
      attendees: 800,
      price: "¥180",
      imageUrl: "https://images.unsplash.com/photo-1672841821756-fc04525771c2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNpYyUyMGZlc3RpdmFsJTIwY29uY2VydHxlbnwxfHx8fDE3NjA1MTE4OTZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
    },
    {
      title: "民谣音乐节",
      date: "2025年9月5日 15:00",
      location: "杭州西湖文化广场",
      category: "音乐",
      attendees: 1500,
      price: "¥150",
      imageUrl: "https://images.unsplash.com/photo-1672841821756-fc04525771c2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNpYyUyMGZlc3RpdmFsJTIwY29uY2VydHxlbnwxfHx8fDE3NjA1MTE4OTZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
    }
  ];

  // 使用 event.reviews 作为评价数据源，如果没有则为空数组
  const reviews = event.reviews || [];

  const handleRegister = () => {
    if (onRegister) {
      onRegister(event.id);
    }
  };

  const handleFavorite = () => {
    if (onToggleFavorite) {
      onToggleFavorite(event.id);
    }
  };

  const handleShare = () => {
    setShowShareDialog(true);
  };

  const handleFollow = () => {
    if (!event?.organizer?.name) {
      return;
    }
    onFollowOrganizer?.(event.organizer.name);
  };

  const handleOpenReviewDialog = () => {
    if (!user) {
      toast.error("请先登录后再评价");
      return;
    }
    setShowReviewDialog(true);
  };

  const handleSubmitReview = () => {
    if (!reviewComment.trim()) {
      toast.error("请输入评价内容");
      return;
    }

    if (onAddReview) {
      onAddReview(event.id, {
        rating: reviewRating,
        comment: reviewComment
      });
    }

    setShowReviewDialog(false);
    setReviewComment("");
    setReviewRating(5);
  };

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : "0.0";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Image */}
      <div className="relative h-[400px] md:h-[500px] bg-gray-900">
        <ImageWithFallback 
          src={event.imageUrl}
          alt={event.title}
          className="w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        
        <div className="absolute top-4 left-4">
          <Button
            variant="ghost"
            className="text-white hover:bg-white/20"
            onClick={() => onNavigate?.("discover")}
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            返回
          </Button>
        </div>

        <div className="absolute bottom-0 left-0 right-0 container mx-auto px-4 pb-8">
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge className="bg-purple-600 hover:bg-purple-700">{event.category}</Badge>
            <Badge variant="outline" className="bg-white/10 text-white border-white/20">
              {event.attendees}+ 人参加
            </Badge>
          </div>
          <h1 className="text-3xl md:text-5xl text-white mb-4">{event.title}</h1>
          <div className="flex flex-wrap gap-6 text-white/90">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              <span>{event.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              <span>{event.location}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Event Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Info */}
            <Card className="p-6">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">活动时间</div>
                    <div className="text-gray-900">{event.date}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 bg-pink-100 rounded-full flex items-center justify-center">
                    <MapPin className="h-6 w-6 text-pink-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">活动地点</div>
                    <div className="text-gray-900">{event.location}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">参与人数</div>
                    <div className="text-gray-900">{event.attendees}+ 人</div>
                  </div>
                </div>

                {event.address && (
                  <div className="md:col-span-3 pt-4 border-t">
                    <div className="flex items-start gap-3">
                      <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center shrink-0">
                        <MapPin className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">详细地址</div>
                        <div className="text-gray-900">{event.address}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Tabs Content */}
            <Card className="p-6">
              <Tabs defaultValue="details">
                <TabsList className="mb-6">
                  <TabsTrigger value="details">活动详情</TabsTrigger>
                  <TabsTrigger value="agenda">活动日程</TabsTrigger>
                  <TabsTrigger value="reviews">评价 ({reviews.length})</TabsTrigger>
                </TabsList>

                {/* Details Tab */}
                <TabsContent value="details" className="space-y-6">
                  <div>
                    <h2 className="text-2xl text-gray-900 mb-4">关于活动</h2>
                    <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                      {event.description}
                    </div>
                  </div>

                  {event.highlights && event.highlights.length > 0 && (
                    <>
                      <Separator />

                      <div>
                        <h3 className="text-xl text-gray-900 mb-4">活动亮点</h3>
                        <div className="grid md:grid-cols-2 gap-3">
                          {event.highlights.map((highlight, index) => (
                            <div key={index} className="flex items-start gap-2">
                              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                              <span className="text-gray-700">{highlight}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <Separator />
                    </>
                  )}

                  {/* Organizer Info */}
                  <div>
                    <h3 className="text-xl text-gray-900 mb-4">主办方信息</h3>
                    <div className="flex items-start gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={event.organizer?.avatar} alt={event.organizer?.name} />
                        <AvatarFallback>{event.organizer?.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h4 className="text-gray-900 mb-1">{event.organizer?.name}</h4>
                        <p className="text-gray-600 text-sm mb-2">{event.organizer?.description}</p>
                        <div className="text-sm text-gray-500">
                          已举办 {event.organizer?.eventsCount} 场活动
                        </div>
                      </div>
                      <Button 
                        variant="outline"
                        className={isFollowing ? "bg-purple-50 text-purple-600 border-purple-600" : ""}
                        onClick={handleFollow}
                      >
                        {isFollowing ? "已关注" : "关注"}
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                {/* Agenda Tab */}
                <TabsContent value="agenda" className="space-y-4">
                  <h2 className="text-2xl text-gray-900 mb-4">活动日程</h2>
                  {(!event.agenda || event.agenda.length === 0) ? (
                    <div className="text-center py-12">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                        <Clock className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-gray-900 mb-2">暂无日程安排</h3>
                      <p className="text-gray-500 text-sm">
                        主办方暂未公布活动日程
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {event.agenda.map((item, index) => (
                        <div key={index} className="flex gap-4 pb-4 border-b last:border-0">
                          <div className="flex items-center gap-2 text-purple-600 min-w-[140px]">
                            <Clock className="h-4 w-4" />
                            <span>{item.time}</span>
                          </div>
                          <div className="flex-1">
                            <h4 className="text-gray-900 mb-1">{item.title}</h4>
                            <p className="text-gray-600 text-sm">{item.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                {/* Reviews Tab */}
                <TabsContent value="reviews" className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl text-gray-900">用户评价</h2>
                    {reviews.length > 0 && (
                      <div className="flex items-center gap-2">
                        <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                        <span className="text-gray-900">{averageRating}</span>
                        <span className="text-gray-500 text-sm">({reviews.length} 条评价)</span>
                      </div>
                    )}
                  </div>

                  {reviews.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                        <MessageCircle className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-gray-900 mb-2">暂无评价</h3>
                      <p className="text-gray-500 text-sm mb-6">
                        成为第一个评价这个活动的用户吧！
                      </p>
                      <Button 
                        variant="outline" 
                        onClick={handleOpenReviewDialog}
                      >
                        <MessageCircle className="mr-2 h-4 w-4" />
                        写第一条评价
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-4">
                        {reviews.map((review, index) => {
                          const isOwnReview = user?.email === review.userEmail;
                          const isEventCreator = user?.email === event.createdBy;
                          const canDelete = user && (
                            isOwnReview || user.isAdmin === true || isEventCreator
                          );

                          return (
                            <div key={index} className="border-b pb-4 last:border-0">
                              <div className="flex items-start gap-3 mb-2">
                                <Avatar>
                                  <AvatarImage src={review.avatar} alt={review.user} />
                                  <AvatarFallback>{review.user.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-gray-900">{review.user}</span>
                                    <div className="flex items-center gap-2">
                                      <div className="flex">
                                        {[...Array(5)].map((_, i) => (
                                          <Star
                                            key={i}
                                            className={`h-4 w-4 ${
                                              i < review.rating
                                                ? 'text-yellow-500 fill-yellow-500'
                                                : 'text-gray-300'
                                            }`}
                                          />
                                        ))}
                                      </div>
                                      {canDelete && (
                                        <button
                                          onClick={() => {
                                            setReviewToDelete(review);
                                            setShowDeleteReviewDialog(true);
                                          }}
                                          className="p-2 -m-2 text-gray-400 hover:text-red-500 transition-colors touch-manipulation"
                                          title={isOwnReview ? "删除我的评价" : isEventCreator ? "删除此评价（活动发布者）" : "删除此评价（管理员）"}
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                  <p className="text-sm text-gray-500 mb-2">{review.date}</p>
                                  <p className="text-gray-700">{review.comment}</p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="pt-4">
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={handleOpenReviewDialog}
                        >
                          <MessageCircle className="mr-2 h-4 w-4" />
                          写评价
                        </Button>
                      </div>
                    </>
                  )}
                </TabsContent>
              </Tabs>
            </Card>
          </div>

          {/* Right Column - Booking Card */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-20">
              <div className="space-y-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl text-purple-600">{event.price}</span>
                  <span className="text-gray-500">/人</span>
                </div>

                <Separator />

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">活动类型</span>
                    <span className="text-gray-900">{event.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">报名人数</span>
                    <span className="text-gray-900">{event.attendees}+ 人</span>
                  </div>
                  {event.capacity && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">活动人数上限</span>
                      <span className="text-gray-900">{event.capacity} 人</span>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="space-y-2">
                  <Button 
                    className={`w-full ${isRegistered ? 'bg-gray-600 hover:bg-gray-700' : 'bg-purple-600 hover:bg-purple-700'}`}
                    onClick={handleRegister}
                  >
                    <Ticket className="mr-2 h-4 w-4" />
                    {isRegistered ? '取消报名' : '立即报名'}
                  </Button>

                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      className={isFavorited ? 'text-pink-600 border-pink-600' : ''}
                      onClick={handleFavorite}
                    >
                      <Heart className={`mr-2 h-4 w-4 ${isFavorited ? 'fill-pink-600' : ''}`} />
                      {isFavorited ? '已收藏' : '收藏'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleShare}
                    >
                      <Share2 className="mr-2 h-4 w-4" />
                      分享
                    </Button>
                  </div>
                </div>

                {isRegistered && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-800">
                    <CheckCircle className="h-4 w-4 inline mr-2" />
                    您已成功报名此活动
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Share Dialog */}
      <ShareDialog 
        open={showShareDialog}
        onOpenChange={setShowShareDialog}
        event={event}
      />

      {/* Review Dialog */}
      <ReviewDialog
        open={showReviewDialog}
        onOpenChange={setShowReviewDialog}
        rating={reviewRating}
        onRatingChange={setReviewRating}
        comment={reviewComment}
        onCommentChange={setReviewComment}
        onSubmit={handleSubmitReview}
        hoverRating={hoverRating}
        onHoverRatingChange={setHoverRating}
      />

      {/* Delete Review Confirmation Dialog */}
      <Dialog open={showDeleteReviewDialog} onOpenChange={setShowDeleteReviewDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>删除评价</DialogTitle>
            <DialogDescription>
              {reviewToDelete && (
                user?.email === reviewToDelete.userEmail
                  ? "确定要删除这条评价吗？此操作无法撤销。"
                  : `确定要删除 ${reviewToDelete.user} 的评价吗？此操作无法撤销。`
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteReviewDialog(false);
                setReviewToDelete(null);
              }}
            >
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (reviewToDelete?.userEmail && onDeleteReview) {
                  onDeleteReview(event.id, reviewToDelete.userEmail);
                }
                setShowDeleteReviewDialog(false);
                setReviewToDelete(null);
              }}
            >
              删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// 分享对话框组件
function ShareDialog({ 
  open, 
  onOpenChange, 
  event 
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
  event: Event;
}) {
  const [copied, setCopied] = useState(false);
  
  const shareUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}?event=${event.id}` 
    : '';
  
  const handleCopyLink = async () => {
    try {
      // 尝试使用现代 Clipboard API
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        toast.success("链接已复制到剪贴板");
        setTimeout(() => setCopied(false), 2000);
      } else {
        // 降级到传统方法
        fallbackCopyTextToClipboard(shareUrl);
      }
    } catch (err) {
      // 如果 Clipboard API 失败，使用备用方法
      fallbackCopyTextToClipboard(shareUrl);
    }
  };

  const fallbackCopyTextToClipboard = (text: string) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.width = "2em";
    textArea.style.height = "2em";
    textArea.style.padding = "0";
    textArea.style.border = "none";
    textArea.style.outline = "none";
    textArea.style.boxShadow = "none";
    textArea.style.background = "transparent";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      const successful = document.execCommand('copy');
      if (successful) {
        setCopied(true);
        toast.success("链接已复制到剪贴板");
        setTimeout(() => setCopied(false), 2000);
      } else {
        toast.error("复制失败，请手动复制链接");
      }
    } catch (err) {
      toast.error("复制失败，请手动复制链接");
    }

    document.body.removeChild(textArea);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>分享活动</DialogTitle>
          <DialogDescription>
            将这个精彩活动分享给您的朋友
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* 分享链接 */}
          <div>
            <label className="text-sm text-gray-600 mb-2 block">活动链接</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={shareUrl}
                readOnly
                onClick={(e) => e.currentTarget.select()}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 cursor-pointer"
              />
              <Button
                onClick={handleCopyLink}
                variant="outline"
                className="shrink-0"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-1" />
                    已复制
                  </>
                ) : (
                  <>
                    <LinkIcon className="h-4 w-4 mr-1" />
                    复制
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// 评价对话框组件
function ReviewDialog({
  open,
  onOpenChange,
  rating,
  onRatingChange,
  comment,
  onCommentChange,
  onSubmit,
  hoverRating,
  onHoverRatingChange
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rating: number;
  onRatingChange: (rating: number) => void;
  comment: string;
  onCommentChange: (comment: string) => void;
  onSubmit: () => void;
  hoverRating: number;
  onHoverRatingChange: (rating: number) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>写评价</DialogTitle>
          <DialogDescription>
            分享您对这次活动的体验和感受
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* 星级评分 */}
          <div className="space-y-2">
            <label className="text-sm text-gray-700">评分</label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => onRatingChange(star)}
                  onMouseEnter={() => onHoverRatingChange(star)}
                  onMouseLeave={() => onHoverRatingChange(0)}
                  className="transition-transform hover:scale-110 focus:outline-none"
                >
                  <Star
                    className={`h-8 w-8 transition-colors ${
                      star <= (hoverRating || rating)
                        ? 'text-yellow-500 fill-yellow-500'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 text-sm text-gray-600">
                {rating === 5 ? '非常满意' : 
                 rating === 4 ? '满意' : 
                 rating === 3 ? '一般' : 
                 rating === 2 ? '不满意' : '非常不满意'}
              </span>
            </div>
          </div>

          {/* 评价内容 */}
          <div className="space-y-2">
            <label className="text-sm text-gray-700">评价内容</label>
            <Textarea
              placeholder="请分享您的活动体验，如活动组织、现场氛围、内容质量等..."
              value={comment}
              onChange={(e) => onCommentChange(e.target.value)}
              className="min-h-[120px] resize-none"
              maxLength={500}
            />
            <div className="text-xs text-gray-500 text-right">
              {comment.length}/500
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            取消
          </Button>
          <Button
            onClick={onSubmit}
            className="bg-purple-600 hover:bg-purple-700"
          >
            提交评价
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
