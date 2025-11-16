/**
 * 密码验证工具
 * 提供增强的密码强度验证
 */

// 常见弱密码黑名单
const WEAK_PASSWORDS = [
  'password', 'password123', '12345678', '123456789', '1234567890',
  'qwerty', 'qwertyuiop', 'abc123', 'abcd1234', 'admin', 'admin123',
  '00000000', '11111111', 'welcome', 'welcome123', 'letmein',
  'monkey', 'dragon', 'master', 'superman', 'batman', 'football',
  'iloveyou', 'trustno1', 'princess', 'sunshine', 'starwars',
];

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong';
  score: number; // 0-100
}

/**
 * 验证密码强度
 *
 * 要求:
 * - 最小长度 10 位
 * - 至少包含一个大写字母
 * - 至少包含一个小写字母
 * - 至少包含一个数字
 * - 至少包含一个特殊字符 (@$!%*?&)
 * - 不在弱密码黑名单中
 */
export function validatePasswordStrength(password: string): PasswordValidationResult {
  const errors: string[] = [];
  let score = 0;

  // 检查长度
  if (password.length < 10) {
    errors.push('密码长度至少为 10 位');
  } else {
    score += 20;
    // 额外长度加分
    score += Math.min(password.length - 10, 10) * 2;
  }

  // 检查大写字母
  if (!/[A-Z]/.test(password)) {
    errors.push('密码必须包含至少一个大写字母');
  } else {
    score += 15;
  }

  // 检查小写字母
  if (!/[a-z]/.test(password)) {
    errors.push('密码必须包含至少一个小写字母');
  } else {
    score += 15;
  }

  // 检查数字
  if (!/\d/.test(password)) {
    errors.push('密码必须包含至少一个数字');
  } else {
    score += 15;
  }

  // 检查特殊字符
  if (!/[@$!%*?&]/.test(password)) {
    errors.push('密码必须包含至少一个特殊字符 (@$!%*?&)');
  } else {
    score += 15;
  }

  // 检查是否在弱密码黑名单中
  if (WEAK_PASSWORDS.includes(password.toLowerCase())) {
    errors.push('该密码过于常见，请使用更安全的密码');
    score = Math.min(score, 30); // 黑名单密码最高30分
  }

  // 奖励：包含多种字符类型
  const uniqueChars = new Set(password).size;
  score += Math.min(uniqueChars, 20);

  // 确保分数在 0-100 范围内
  score = Math.max(0, Math.min(score, 100));

  // 确定强度等级
  let strength: 'weak' | 'medium' | 'strong';
  if (score < 40) {
    strength = 'weak';
  } else if (score < 70) {
    strength = 'medium';
  } else {
    strength = 'strong';
  }

  return {
    isValid: errors.length === 0,
    errors,
    strength,
    score,
  };
}

/**
 * 获取密码强度的友好描述
 */
export function getPasswordStrengthText(strength: 'weak' | 'medium' | 'strong'): string {
  switch (strength) {
    case 'weak':
      return '弱';
    case 'medium':
      return '中等';
    case 'strong':
      return '强';
  }
}

/**
 * 获取密码强度的颜色
 */
export function getPasswordStrengthColor(strength: 'weak' | 'medium' | 'strong'): string {
  switch (strength) {
    case 'weak':
      return 'text-red-600';
    case 'medium':
      return 'text-yellow-600';
    case 'strong':
      return 'text-green-600';
  }
}
