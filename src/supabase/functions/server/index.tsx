import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// 初始化 Supabase 客户端
const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

// 存储桶名称
const IMAGES_BUCKET = "make-9b3b112b-images";

// 初始化存储桶
async function initializeStorage() {
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === IMAGES_BUCKET);
    
    if (!bucketExists) {
      console.log(`创建存储桶: ${IMAGES_BUCKET}`);
      const { error } = await supabase.storage.createBucket(IMAGES_BUCKET, {
        public: true, // 公开访问
        fileSizeLimit: 5242880, // 5MB
      });
      
      if (error) {
        console.error("创建存储桶失败:", error);
      } else {
        console.log(`✅ 存储桶创建成功: ${IMAGES_BUCKET}`);
      }
    } else {
      console.log(`✅ 存储桶已存在: ${IMAGES_BUCKET}`);
    }
  } catch (error) {
    console.error("初始化存储失败:", error);
  }
}

// 启动时初始化存储
initializeStorage();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-9b3b112b/health", (c) => {
  return c.json({ status: "ok" });
});

// 上传图片端点
app.post("/make-server-9b3b112b/upload-image", async (c) => {
  try {
    const body = await c.req.json();
    const { imageData, fileName, fileType } = body;

    if (!imageData || !fileName) {
      return c.json({ error: "缺少必要参数" }, 400);
    }

    // 将 base64 转换为 Blob
    const base64Data = imageData.split(',')[1];
    const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
    
    // 生成唯一文件名
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(7);
    const ext = fileName.split('.').pop() || 'jpg';
    const uniqueFileName = `${timestamp}-${randomStr}.${ext}`;

    // 上传到 Supabase Storage
    const { data, error } = await supabase.storage
      .from(IMAGES_BUCKET)
      .upload(uniqueFileName, binaryData, {
        contentType: fileType || 'image/jpeg',
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error("上传图片失败:", error);
      return c.json({ error: "上传失败: " + error.message }, 500);
    }

    // 获取公开 URL
    const { data: { publicUrl } } = supabase.storage
      .from(IMAGES_BUCKET)
      .getPublicUrl(uniqueFileName);

    console.log(`✅ 图片上传成功: ${uniqueFileName}`);

    return c.json({ 
      success: true,
      url: publicUrl,
      fileName: uniqueFileName
    });

  } catch (error) {
    console.error("上传图片错误:", error);
    return c.json({ error: "服务器错误: " + error.message }, 500);
  }
});

// 删除图片端点
app.delete("/make-server-9b3b112b/delete-image/:fileName", async (c) => {
  try {
    const fileName = c.req.param("fileName");

    if (!fileName) {
      return c.json({ error: "缺少文件名" }, 400);
    }

    const { error } = await supabase.storage
      .from(IMAGES_BUCKET)
      .remove([fileName]);

    if (error) {
      console.error("删除图片失败:", error);
      return c.json({ error: "删除失败: " + error.message }, 500);
    }

    console.log(`✅ 图片删除成功: ${fileName}`);

    return c.json({ success: true });

  } catch (error) {
    console.error("删除图片错误:", error);
    return c.json({ error: "服务器错误: " + error.message }, 500);
  }
});

Deno.serve(app.fetch);