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
 * 获取环境变量，如果不存在则抛出错误
 */
function getEnvVar(key: string): string {
  const value = import.meta.env[key];
  if (!value) {
    throw new Error(`环境变量 ${key} 未定义`);
  }
  return value;
}

/**
 * 应用环境配置
 */
export const env: EnvConfig = {
  supabase: {
    url: getEnvVar('VITE_SUPABASE_URL'),
    anonKey: getEnvVar('VITE_SUPABASE_ANON_KEY'),
    projectId: getEnvVar('VITE_SUPABASE_PROJECT_ID'),
  },
  edgeFunctionUrl: getEnvVar('VITE_EDGE_FUNCTION_URL'),
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
