import { env } from '../config/env';

/**
 * 压缩图片
 */
export async function compressImage(
  file: File,
  maxWidth: number = 1200,
  maxHeight: number = 900,
  quality: number = 0.7
): Promise<{ dataUrl: string; size: number; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // 创建 canvas 来压缩图片
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('无法创建 canvas context'));
          return;
        }

        // 计算缩放比例
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // 绘制并压缩图片
        ctx.drawImage(img, 0, 0, width, height);

        // 转换为 base64
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        const size = compressedDataUrl.length * 0.75; // 估算字节数

        resolve({
          dataUrl: compressedDataUrl,
          size,
          width,
          height
        });
      };
      img.onerror = () => reject(new Error('图片加载失败'));
      img.src = event.target?.result as string;
    };
    reader.onerror = () => reject(new Error('文件读取失败'));
    reader.readAsDataURL(file);
  });
}

/**
 * 压缩头像图片（正方形）
 */
export async function compressAvatar(
  file: File,
  size: number = 400,
  quality: number = 0.8
): Promise<{ dataUrl: string; size: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('无法创建 canvas context'));
          return;
        }

        canvas.width = size;
        canvas.height = size;

        // 计算裁剪区域（居中裁剪）
        const minDim = Math.min(img.width, img.height);
        const sourceX = (img.width - minDim) / 2;
        const sourceY = (img.height - minDim) / 2;

        // 绘制并压缩图片
        ctx.drawImage(img, sourceX, sourceY, minDim, minDim, 0, 0, size, size);

        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        const fileSize = compressedDataUrl.length * 0.75;

        resolve({
          dataUrl: compressedDataUrl,
          size: fileSize
        });
      };
      img.onerror = () => reject(new Error('图片加载失败'));
      img.src = event.target?.result as string;
    };
    reader.onerror = () => reject(new Error('文件读取失败'));
    reader.readAsDataURL(file);
  });
}

/**
 * 上传图片到 Supabase Storage
 */
export async function uploadImageToStorage(
  imageData: string,
  fileName: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const response = await fetch(`${env.edgeFunctionUrl}/upload-image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.supabase.anonKey}`
      },
      body: JSON.stringify({
        imageData,
        fileName,
        fileType: 'image/jpeg'
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || '上传失败'
      };
    }

    return {
      success: true,
      url: data.url
    };
  } catch (error) {
    console.error('上传图片错误:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '上传失败'
    };
  }
}

/**
 * 删除图片
 */
export async function deleteImageFromStorage(
  imageUrl: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // 从 URL 中提取文件名
    const fileName = imageUrl.split('/').pop();
    if (!fileName) {
      return { success: false, error: '无效的图片 URL' };
    }

    const response = await fetch(`${env.edgeFunctionUrl}/delete-image/${fileName}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${env.supabase.anonKey}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || '删除失败'
      };
    }

    return { success: true };
  } catch (error) {
    console.error('删除图片错误:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '删除失败'
    };
  }
}

/**
 * 处理图片上传（压缩 + 上传到云端）
 */
export async function handleImageUpload(
  file: File,
  onProgress?: (status: string) => void
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      return { success: false, error: '请上传图片文件' };
    }

    // 验证文件大小（限制为5MB）
    if (file.size > 5 * 1024 * 1024) {
      return { success: false, error: '图片大小不能超过5MB' };
    }

    // 压缩图片
    onProgress?.('正在压缩图片...');
    const compressed = await compressImage(file);

    const originalSize = (file.size / 1024).toFixed(2);
    const compressedSize = (compressed.size / 1024).toFixed(2);
    console.log(`图片压缩: ${originalSize}KB -> ${compressedSize}KB`);

    // 上传到云端
    onProgress?.('正在上传到云端...');
    const result = await uploadImageToStorage(compressed.dataUrl, file.name);

    if (!result.success) {
      return result;
    }

    console.log(`✅ 图片上传成功: ${result.url}`);
    return result;

  } catch (error) {
    console.error('处理图片上传错误:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '上传失败'
    };
  }
}

/**
 * 处理头像上传（压缩 + 上传到云端）
 */
export async function handleAvatarUpload(
  file: File,
  onProgress?: (status: string) => void
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      return { success: false, error: '请上传图片文件' };
    }

    // 验证文件大小（限制为5MB）
    if (file.size > 5 * 1024 * 1024) {
      return { success: false, error: '图片大小不能超过5MB' };
    }

    // 压缩头像
    onProgress?.('正在压缩图片...');
    const compressed = await compressAvatar(file);

    const originalSize = (file.size / 1024).toFixed(2);
    const compressedSize = (compressed.size / 1024).toFixed(2);
    console.log(`头像压缩: ${originalSize}KB -> ${compressedSize}KB`);

    // 上传到云端
    onProgress?.('正在上传到云端...');
    const result = await uploadImageToStorage(compressed.dataUrl, file.name);

    if (!result.success) {
      return result;
    }

    console.log(`✅ 头像上传成功: ${result.url}`);
    return result;

  } catch (error) {
    console.error('处理头像上传错误:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '上传失败'
    };
  }
}
