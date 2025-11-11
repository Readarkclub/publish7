import { useState, useRef, useEffect } from "react";
import { Footer } from "./Footer";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Switch } from "./ui/switch";
import { Progress } from "./ui/progress";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Alert, AlertDescription } from "./ui/alert";
import { 
  Calendar as CalendarIcon,
  MapPin, 
  Upload,
  Plus,
  X,
  Check,
  ArrowLeft,
  ArrowRight,
  Save,
  Eye,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner@2.0.3";
import { cn } from "./ui/utils";
import { handleImageUpload } from "../utils/imageUpload";

import type { Event } from "../types/event";

interface CreateEventPageProps {
  onNavigate?: (page: "home" | "discover" | "profile" | "create-event") => void;
  user?: {
    name: string;
    email: string;
    avatar?: string;
  } | null;
  onEventCreate?: (event: Event, isDraft?: boolean) => void;
  onEventUpdate?: (event: Event) => void;
  editingEvent?: Event | null;
  onCategoryClick?: (category: string) => void;
}

interface EventFormData {
  title: string;
  category: string;
  date: Date | undefined;
  time: string;
  location: string;
  address: string;
  description: string;
  highlights: string[];
  isFree: boolean;
  price: string;
  capacity: string;
  imageUrl: string;
  agenda: {
    time: string;
    title: string;
    description: string;
  }[];
  organizerInfo: string;
  contactEmail: string;
  contactPhone: string;
}

export function CreateEventPage({ onNavigate, user, onEventCreate, onEventUpdate, editingEvent, onCategoryClick }: CreateEventPageProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEditMode = !!editingEvent;
  
  const [formData, setFormData] = useState<EventFormData>({
    title: editingEvent?.title || "",
    category: editingEvent?.category || "",
    date: editingEvent?.date ? new Date(editingEvent.date) : undefined,
    time: editingEvent?.date ? new Date(editingEvent.date).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) : "",
    location: editingEvent?.location || "",
    address: "",
    description: editingEvent?.description || "",
    highlights: editingEvent?.highlights || [],
    isFree: editingEvent?.price === "免费",
    price: editingEvent?.price && editingEvent.price !== "免费" ? editingEvent.price.replace("¥", "") : "",
    capacity: "",
    imageUrl: editingEvent?.imageUrl || "",
    agenda: editingEvent?.agenda || [],
    organizerInfo: "",
    contactEmail: user?.email || "",
    contactPhone: ""
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const [newHighlight, setNewHighlight] = useState("");
  const [newAgendaItem, setNewAgendaItem] = useState({
    time: "",
    title: "",
    description: ""
  });

  const categories = [
    "音乐", "科技", "体育", "艺术", "教育", "娱乐", "美食", "健康", "商业", "户外"
  ];

  const totalSteps = 5;
  const progress = (currentStep / totalSteps) * 100;

  // 检查用户是否登录（仅在组件挂载时检查一次）
  useEffect(() => {
    if (!user) {
      toast.error("请先登录后再发布活动");
      onNavigate?.("home");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInputChange = (field: keyof EventFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleBlur = (field: keyof EventFormData) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field, formData[field]);
  };

  const validateField = (field: keyof EventFormData, value: any): string | null => {
    let error: string | null = null;

    switch (field) {
      case 'title':
        if (!value || value.trim() === '') {
          error = '活动标题不能为空';
        } else if (value.length < 5) {
          error = '活动标题至少需要5个字符';
        } else if (value.length > 100) {
          error = '活动标题不能超过100个字符';
        }
        break;

      case 'category':
        if (!value || value === '') {
          error = '请选择活动分类';
        }
        break;

      case 'date':
        if (!value) {
          error = '请选择活动日期';
        } else if (new Date(value) < new Date(new Date().setHours(0, 0, 0, 0))) {
          error = '活动日期不能早于今天';
        }
        break;

      case 'location':
        if (!value || value.trim() === '') {
          error = '请填写活动城市';
        }
        break;

      case 'description':
        if (!value || value.trim() === '') {
          error = '请填写活动描述';
        } else if (value.length < 50) {
          error = '活动描述至少需要50个字符';
        }
        break;

      case 'contactEmail':
        if (!value || value.trim() === '') {
          error = '请填写联系邮箱';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = '请输入有效的邮箱地址';
        }
        break;

      case 'contactPhone':
        if (value && value.trim() !== '' && !/^1[3-9]\d{9}$/.test(value)) {
          error = '请输入有效的手机号码';
        }
        break;

      case 'price':
        if (!formData.isFree && (!value || value.trim() === '')) {
          error = '请填写票价';
        } else if (value && isNaN(Number(value))) {
          error = '票价必须是数字';
        } else if (value && Number(value) < 0) {
          error = '票价不能为负数';
        }
        break;

      case 'capacity':
        if (value && value.trim() !== '') {
          if (isNaN(Number(value))) {
            error = '人数上限必须是数字';
          } else if (Number(value) <= 0) {
            error = '人数上限必须大于0';
          }
        }
        break;
    }

    if (error) {
      setErrors(prev => ({ ...prev, [field]: error }));
    } else {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    return error;
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};
    let fieldsToValidate: (keyof EventFormData)[] = [];

    switch (step) {
      case 1:
        fieldsToValidate = ['title', 'category', 'date', 'location'];
        break;
      case 2:
        fieldsToValidate = ['description'];
        break;
      case 3:
        if (!formData.isFree) {
          fieldsToValidate = ['price'];
        }
        break;
      case 5:
        fieldsToValidate = ['contactEmail', 'contactPhone'];
        break;
    }

    fieldsToValidate.forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
        setTouched(prev => ({ ...prev, [field]: true }));
      }
    });

    if (Object.keys(newErrors).length > 0) {
      toast.error('请填写所有必填字段并修正错误');
      return false;
    }

    return true;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 显示上传中的提示
    const loadingToast = toast.loading("正在上传图片...");

    try {
      // 使用新的上传函数（压缩 + 上传到云端）
      const result = await handleImageUpload(file, (status) => {
        toast.loading(status, { id: loadingToast });
      });

      if (result.success && result.url) {
        handleInputChange("imageUrl", result.url);
        toast.success("图片上传成功！", { 
          id: loadingToast,
          description: "已保存到云端存储"
        });
      } else {
        toast.error(result.error || "上传失败", { id: loadingToast });
      }
    } catch (error) {
      console.error("上传图片错误:", error);
      toast.error("上传失败，请重试", { id: loadingToast });
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    // 显示上传中的提示
    const loadingToast = toast.loading("正在上传图片...");

    try {
      // 使用新的上传函数（压缩 + 上传到云端）
      const result = await handleImageUpload(file, (status) => {
        toast.loading(status, { id: loadingToast });
      });

      if (result.success && result.url) {
        handleInputChange("imageUrl", result.url);
        toast.success("图片上传成功！", { 
          id: loadingToast,
          description: "已保存到云端存储"
        });
      } else {
        toast.error(result.error || "上传失败", { id: loadingToast });
      }
    } catch (error) {
      console.error("上传图片错误:", error);
      toast.error("上传失败，请重试", { id: loadingToast });
    }
  };

  const addHighlight = () => {
    if (newHighlight.trim()) {
      setFormData(prev => ({
        ...prev,
        highlights: [...prev.highlights, newHighlight.trim()]
      }));
      setNewHighlight("");
    }
  };

  const removeHighlight = (index: number) => {
    setFormData(prev => ({
      ...prev,
      highlights: prev.highlights.filter((_, i) => i !== index)
    }));
  };

  const addAgendaItem = () => {
    if (newAgendaItem.time && newAgendaItem.title) {
      setFormData(prev => ({
        ...prev,
        agenda: [...prev.agenda, { ...newAgendaItem }]
      }));
      setNewAgendaItem({ time: "", title: "", description: "" });
    }
  };

  const removeAgendaItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      agenda: prev.agenda.filter((_, i) => i !== index)
    }));
  };

  const handleSaveDraft = () => {
    // 创建草稿活动对象
    const draftEvent: Event = {
      id: editingEvent?.id || `event-${Date.now()}`,
      title: formData.title || "未命名活动",
      date: formData.date 
        ? `${formData.date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}${formData.time ? ` ${formData.time}` : ''}`
        : '',
      location: formData.location || "待定",
      category: formData.category || "其他",
      attendees: editingEvent?.attendees || 0,
      price: formData.isFree ? '免费' : formData.price ? `¥${formData.price}` : '免费',
      imageUrl: formData.imageUrl || '',
      description: formData.description,
      highlights: formData.highlights,
      agenda: formData.agenda,
      status: 'draft',
      createdBy: user?.email,
      reviews: editingEvent?.reviews || [], // 确保草稿也没有默认评价
      organizer: user ? {
        name: user.name,
        avatar: user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
        description: formData.organizerInfo,
        eventsCount: 1
      } : undefined
    };

    if (isEditMode && onEventUpdate) {
      onEventUpdate(draftEvent);
      toast.success("草稿已更新");
    } else {
      onEventCreate?.(draftEvent, true);
      toast.success("草稿已保存", {
        description: "您可以稍后继续编辑"
      });
    }
    
    setTimeout(() => {
      onNavigate?.("profile");
    }, 1000);
  };

  const handlePublish = () => {
    // 验证所有步骤
    const allStepsValid = [1, 2, 3, 4, 5].every(step => validateStep(step));
    
    if (!allStepsValid) {
      toast.error("请填写所有必填信息并修正错误");
      return;
    }

    // 创建新活动对象
    const newEvent: Event = {
      id: editingEvent?.id || `event-${Date.now()}`,
      title: formData.title,
      date: formData.date 
        ? `${formData.date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}${formData.time ? ` ${formData.time}` : ''}`
        : '',
      location: formData.location,
      category: formData.category,
      attendees: editingEvent?.attendees || 0,
      price: formData.isFree ? '免费' : formData.price ? `¥${formData.price}` : '免费',
      imageUrl: formData.imageUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop',
      description: formData.description,
      highlights: formData.highlights,
      agenda: formData.agenda,
      status: 'published',
      createdBy: user?.email,
      reviews: editingEvent?.reviews || [], // 确保新活动没有默认评价
      organizer: user ? {
        name: user.name,
        avatar: user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
        description: formData.organizerInfo,
        eventsCount: 1
      } : undefined
    };

    // 调用创建或更新回调
    if (isEditMode && onEventUpdate) {
      onEventUpdate(newEvent);
      toast.success("活动更新成功！");
    } else {
      onEventCreate?.(newEvent);
      toast.success("活动发布成功！", {
        description: "您的活动已经发布"
      });
    }
    
    // 跳转到个人中心
    setTimeout(() => {
      onNavigate?.("profile");
    }, 1500);
  };

  const nextStep = () => {
    if (!validateStep(currentStep)) {
      return;
    }
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const renderStepContent = () => {
    // 获取当前步骤的字段
    const getCurrentStepFields = (): (keyof EventFormData)[] => {
      switch (currentStep) {
        case 1:
          return ['title', 'category', 'date', 'location'];
        case 2:
          return ['description'];
        case 3:
          return formData.isFree ? [] : ['price'];
        case 5:
          return ['contactEmail', 'contactPhone'];
        default:
          return [];
      }
    };

    const currentStepFields = getCurrentStepFields();
    const currentStepHasErrors = currentStepFields.some(field => errors[field] && touched[field]);

    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl text-gray-900 mb-2">基本信息</h2>
              <p className="text-gray-600">填写活动的基本信息，让参与者快速了解您的活动</p>
            </div>

            {currentStepHasErrors && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  请修正表单中的错误后再继续
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <div>
                <Label htmlFor="title" className="required">活动标题 *</Label>
                <Input
                  id="title"
                  placeholder="输入吸引人的活动标题"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  onBlur={() => handleBlur("title")}
                  className={cn("mt-1", errors.title && touched.title && "border-red-500")}
                />
                {errors.title && touched.title && (
                  <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.title}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="category" className="required">活动分类 *</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => {
                    handleInputChange("category", value);
                    // 清除 category 的错误
                    setErrors(prev => {
                      const newErrors = { ...prev };
                      delete newErrors.category;
                      return newErrors;
                    });
                    setTouched(prev => ({ ...prev, category: true }));
                  }}
                >
                  <SelectTrigger className={cn("mt-1", errors.category && touched.category && "border-red-500")}>
                    <SelectValue placeholder="选择活动分类" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && touched.category && (
                  <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.category}
                  </p>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date" className="required">活动日期 *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date && formData.date instanceof Date && !isNaN(formData.date.getTime()) ? formData.date.toISOString().split('T')[0] : ''}
                    onChange={(e) => {
                      const dateValue = e.target.value ? new Date(e.target.value) : undefined;
                      handleInputChange("date", dateValue);
                    }}
                    onBlur={() => handleBlur("date")}
                    className={cn("mt-1", errors.date && touched.date && "border-red-500")}
                  />
                  {errors.date && touched.date && (
                    <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.date}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="time">开始时间</Label>
                  <Input
                    id="time"
                    type="time"
                    value={formData.time}
                    onChange={(e) => handleInputChange("time", e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="location" className="required">活动城市 *</Label>
                <Input
                  id="location"
                  placeholder="例如：上海"
                  value={formData.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                  onBlur={() => handleBlur("location")}
                  className={cn("mt-1", errors.location && touched.location && "border-red-500")}
                />
                {errors.location && touched.location && (
                  <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.location}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="address">详细地址</Label>
                <Input
                  id="address"
                  placeholder="例如：黄浦区南京东路100号"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="capacity">活动人数上限</Label>
                <Input
                  id="capacity"
                  type="number"
                  placeholder="例如：100"
                  value={formData.capacity}
                  onChange={(e) => handleInputChange("capacity", e.target.value)}
                  onBlur={() => handleBlur("capacity")}
                  className={cn("mt-1", errors.capacity && touched.capacity && "border-red-500")}
                />
                {errors.capacity && touched.capacity && (
                  <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.capacity}
                  </p>
                )}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl text-gray-900 mb-2">活动详情</h2>
              <p className="text-gray-600">详细描述您的活动，吸引更多参与者</p>
            </div>

            {currentStepHasErrors && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  请修正表单中的错误后再继续
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <div>
                <Label htmlFor="description" className="required">活动描述 *</Label>
                <Textarea
                  id="description"
                  placeholder="详细描述活动内容、流程、注意事项等..."
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  onBlur={() => handleBlur("description")}
                  rows={8}
                  className={cn("mt-1", errors.description && touched.description && "border-red-500")}
                />
                {errors.description && touched.description && (
                  <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.description}
                  </p>
                )}
                <p className="text-sm text-gray-500 mt-1">
                  {formData.description.length} 字符
                </p>
              </div>

              <div>
                <Label>活动亮点</Label>
                <p className="text-sm text-gray-600 mb-2">添加活动的亮点和特色</p>
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="例如：专业导师授课"
                    value={newHighlight}
                    onChange={(e) => setNewHighlight(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addHighlight())}
                  />
                  <Button type="button" onClick={addHighlight}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.highlights.map((highlight, index) => (
                    <Badge key={index} variant="outline" className="gap-1 pr-1">
                      {highlight}
                      <button
                        type="button"
                        onClick={() => removeHighlight(index)}
                        className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="imageUrl">活动封面</Label>
                <div className="mt-1">
                  <Input
                    id="imageUrl"
                    placeholder="输入图片URL或点击上传"
                    value={formData.imageUrl}
                    onChange={(e) => handleInputChange("imageUrl", e.target.value)}
                    className="mb-2"
                  />
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div 
                    onClick={handleUploadClick}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-400 transition-colors cursor-pointer"
                  >
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600 mb-1">点击或拖拽上传图片</p>
                    <p className="text-sm text-gray-500">支持 JPG, PNG 格式，建议尺寸 1920x1080</p>
                  </div>
                  {formData.imageUrl && (
                    <div className="mt-4 relative">
                      <ImageWithFallback
                        src={formData.imageUrl}
                        alt="活动封面预览"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => handleInputChange("imageUrl", "")}
                        className="absolute top-2 right-2"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl text-gray-900 mb-2">票价设置</h2>
              <p className="text-gray-600">设置活动的票价信息</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label>免费活动</Label>
                  <p className="text-sm text-gray-600">活动是否免费参加</p>
                </div>
                <Switch
                  checked={formData.isFree}
                  onCheckedChange={(checked) => handleInputChange("isFree", checked)}
                />
              </div>

              {!formData.isFree && (
                <div>
                  <Label htmlFor="price">票价</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-gray-600">¥</span>
                    <Input
                      id="price"
                      type="number"
                      placeholder="0.00"
                      value={formData.price}
                      onChange={(e) => handleInputChange("price", e.target.value)}
                      onBlur={() => handleBlur("price")}
                      className={cn(errors.price && touched.price && "border-red-500")}
                    />
                  </div>
                  {errors.price && touched.price && (
                    <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.price}
                    </p>
                  )}
                  <p className="text-sm text-gray-500 mt-1">
                    设置为0表示免费，可以使用"起"字表示最低价格，如：¥99起
                  </p>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-blue-900 mb-2">票价建议</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• 合理定价可以提高报名率</li>
                  <li>• 考虑活动成本和目标受众</li>
                  <li>• 可以设置早鸟价吸引早期报名</li>
                </ul>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl text-gray-900 mb-2">活动日程</h2>
              <p className="text-gray-600">添加活动的时间安排和流程</p>
            </div>

            <div className="space-y-4">
              <Card className="p-4">
                <Label className="mb-3 block">添加日程项</Label>
                <div className="grid gap-3">
                  <div className="grid md:grid-cols-2 gap-3">
                    <Input
                      placeholder="时间，如：14:00 - 15:00"
                      value={newAgendaItem.time}
                      onChange={(e) => setNewAgendaItem({ ...newAgendaItem, time: e.target.value })}
                    />
                    <Input
                      placeholder="标题"
                      value={newAgendaItem.title}
                      onChange={(e) => setNewAgendaItem({ ...newAgendaItem, title: e.target.value })}
                    />
                  </div>
                  <Input
                    placeholder="描述（可选）"
                    value={newAgendaItem.description}
                    onChange={(e) => setNewAgendaItem({ ...newAgendaItem, description: e.target.value })}
                  />
                  <Button type="button" onClick={addAgendaItem} variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    添加日程
                  </Button>
                </div>
              </Card>

              {formData.agenda.length > 0 && (
                <div className="space-y-3">
                  {formData.agenda.map((item, index) => (
                    <Card key={index} className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 text-purple-600 mb-1">
                            <CalendarIcon className="h-4 w-4" />
                            <span>{item.time}</span>
                          </div>
                          <h4 className="text-gray-900 mb-1">{item.title}</h4>
                          {item.description && (
                            <p className="text-sm text-gray-600">{item.description}</p>
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAgendaItem(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl text-gray-900 mb-2">主办方信息</h2>
              <p className="text-gray-600">填写主办方的相关信息</p>
            </div>

            {currentStepHasErrors && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  请修正表单中的错误后再继续
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <div>
                <Label htmlFor="organizerInfo">主办方介绍</Label>
                <Textarea
                  id="organizerInfo"
                  placeholder="介绍您的团队或组织..."
                  value={formData.organizerInfo}
                  onChange={(e) => handleInputChange("organizerInfo", e.target.value)}
                  rows={4}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="contactEmail" className="required">联系邮箱 *</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.contactEmail}
                  onChange={(e) => handleInputChange("contactEmail", e.target.value)}
                  onBlur={() => handleBlur("contactEmail")}
                  className={cn("mt-1", errors.contactEmail && touched.contactEmail && "border-red-500")}
                />
                {errors.contactEmail && touched.contactEmail && (
                  <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.contactEmail}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="contactPhone">联系电话</Label>
                <Input
                  id="contactPhone"
                  type="tel"
                  placeholder="手机号码"
                  value={formData.contactPhone}
                  onChange={(e) => handleInputChange("contactPhone", e.target.value)}
                  onBlur={() => handleBlur("contactPhone")}
                  className={cn("mt-1", errors.contactPhone && touched.contactPhone && "border-red-500")}
                />
                {errors.contactPhone && touched.contactPhone && (
                  <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.contactPhone}
                  </p>
                )}
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="text-green-900 mb-2 flex items-center gap-2">
                  <Check className="h-5 w-5" />
                  准备发布
                </h4>
                <p className="text-sm text-green-800">
                  您的活动信息已经填写完成！点击"发布活动"按钮即可提交审核。
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // 如果用户未登录，显示空页面（useEffect会处理重定向）
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => onNavigate?.("home")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回
            </Button>
            <h1 className="text-xl">{isEditMode ? '编辑活动' : '发布活动'}</h1>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setShowPreview(!showPreview)}
              >
                <Eye className="h-4 w-4 mr-2" />
                {showPreview ? "隐藏" : "预览"}
              </Button>
              <Button variant="ghost" onClick={handleSaveDraft}>
                <Save className="h-4 w-4 mr-2" />
                保存草稿
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">
              步骤 {currentStep} / {totalSteps}
            </span>
            <span className="text-sm text-gray-600">{Math.round(progress)}% 完成</span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="grid grid-cols-5 gap-2 mt-4">
            {["基本信息", "活动详情", "票价设置", "活动日程", "主办方信息"].map((step, index) => (
              <div
                key={index}
                className={cn(
                  "text-center text-sm py-2 rounded-lg",
                  currentStep === index + 1
                    ? "bg-purple-100 text-purple-700"
                    : currentStep > index + 1
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-600"
                )}
              >
                {step}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <section className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              {renderStepContent()}

              <Separator className="my-6" />

              {/* Navigation Buttons */}
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  上一步
                </Button>

                {currentStep < totalSteps ? (
                  <Button onClick={nextStep} className="bg-purple-600 hover:bg-purple-700">
                    下一步
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button onClick={handlePublish} className="bg-green-600 hover:bg-green-700">
                    <Check className="h-4 w-4 mr-2" />
                    {isEditMode ? '保存并发布' : '发布活动'}
                  </Button>
                )}
              </div>
            </Card>
          </div>

          {/* Preview */}
          {showPreview && (
            <div className="lg:col-span-1">
              <Card className="p-6 sticky top-32">
                <h3 className="text-lg text-gray-900 mb-4">活动预览</h3>
                
                {formData.imageUrl && (
                  <ImageWithFallback
                    src={formData.imageUrl}
                    alt="活动封面"
                    className="w-full h-40 object-cover rounded-lg mb-4"
                  />
                )}

                <div className="space-y-3">
                  {formData.category && (
                    <Badge className="bg-purple-600">{formData.category}</Badge>
                  )}

                  {formData.title && (
                    <h4 className="text-gray-900">{formData.title}</h4>
                  )}

                  {formData.date && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <CalendarIcon className="h-4 w-4" />
                      <span>
                        {formData.date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}
                        {formData.time && ` ${formData.time}`}
                      </span>
                    </div>
                  )}

                  {formData.location && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>{formData.location}</span>
                    </div>
                  )}

                  {formData.description && (
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {formData.description}
                    </p>
                  )}

                  <Separator />

                  <div className="text-center">
                    <div className="text-2xl text-purple-600 mb-1">
                      {formData.isFree ? "免费" : formData.price ? `¥${formData.price}` : "¥--"}
                    </div>
                    <p className="text-sm text-gray-500">活动票价</p>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </section>

      <Footer onCategoryClick={onCategoryClick} onNavigate={onNavigate} />
    </div>
  );
}
