/**
 * 环境变量访问层
 * 封装所有环境变量的访问，提供类型安全和默认值
 */

interface EnvConfig {
  supabase: {
    url: string;
    anonKey: string;
    projectId: string;
  };
  edgeFunctionUrl: string;
}

/**
 * 获取环境变量，如果不存在则使用默认值
 */
function getEnvVar(key: string, defaultValue?: string): string {
  const value = import.meta.env[key];
  if (!value) {
    if (defaultValue) {
      console.warn(`环境变量 ${key} 未定义，使用默认值`);
      return defaultValue;
    }
    throw new Error(`环境变量 ${key} 未定义且无默认值`);
  }
  return value;
}

/**
 * 应用环境配置
 */
export const env: EnvConfig = {
  supabase: {
    url: getEnvVar('VITE_SUPABASE_URL', 'https://jdpyrlrcjaovbryqlcbs.supabase.co'),
    anonKey: getEnvVar('VITE_SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkcHlybHJjamFvdmJyeXFsY2JzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5NjUyMDYsImV4cCI6MjA2OTU0MTIwNn0.ikz2S2fdB_WBftcQZvN1MifVnDMqDNd1D_HhXHMOogM'),
    projectId: getEnvVar('VITE_SUPABASE_PROJECT_ID', 'jdpyrlrcjaovbryqlcbs'),
  },
  edgeFunctionUrl: getEnvVar('VITE_EDGE_FUNCTION_URL', 'https://jdpyrlrcjaovbryqlcbs.supabase.co/functions/v1/make-server-9b3b112b'),
};

/**
 * 验证所有必需的环境变量是否已设置
 */
export function validateEnv(): void {
  try {
    env.supabase.url;
    env.supabase.anonKey;
    env.supabase.projectId;
    env.edgeFunctionUrl;
  } catch (error) {
    console.error('环境变量验证失败:', error);
    throw error;
  }
}
