/**
 * Token限流系统
 * 防止API被滥用，通过限制token数量来控制成本
 */

interface TokenLimitEntry {
  inputTokens: number; // 输入token累计
  outputTokens: number; // 输出token累计
  requestCount: number; // 请求次数
  resetTime: number; // 重置时间
}

// 内存存储（生产环境建议使用Redis）
const tokenLimitStore = new Map<string, TokenLimitEntry>();

// 配置参数
const WINDOW_MS = 60 * 60 * 1000; // 1小时窗口
const MAX_INPUT_TOKENS_PER_HOUR = 50000; // 每小时最多50k输入token
const MAX_OUTPUT_TOKENS_PER_HOUR = 20000; // 每小时最多20k输出token
const MAX_REQUESTS_PER_HOUR = 30; // 每小时最多30个请求

// 单次请求限制
const MAX_INPUT_TOKENS_PER_REQUEST = 8000; // 单次请求最多8k输入token
const MAX_OUTPUT_TOKENS_PER_REQUEST = 2000; // 单次请求最多2k输出token

/**
 * 估算文本的token数量
 * 使用简单估算：中文约1.5字符=1token，英文约4字符=1token
 * 更准确的方法可以使用tiktoken库
 */
export function estimateTokens(text: string): number {
  if (!text) return 0;
  
  // 分离中文字符和英文字符
  const chineseChars = text.match(/[\u4e00-\u9fa5]/g) || [];
  const englishChars = text.match(/[a-zA-Z0-9\s\.,!?;:'"()\[\]{}\-_=+*&^%$#@~`]/g) || [];
  
  // 中文：1.5字符 = 1 token
  // 英文：4字符 = 1 token
  const chineseTokens = Math.ceil(chineseChars.length / 1.5);
  const englishTokens = Math.ceil(englishChars.length / 4);
  
  // 其他字符（标点、空格等）按英文计算
  const otherChars = text.length - chineseChars.length - englishChars.length;
  const otherTokens = Math.ceil(otherChars / 4);
  
  return chineseTokens + englishTokens + otherTokens;
}

/**
 * 估算prompt的token数量
 */
export function estimatePromptTokens(prompt: string): number {
  return estimateTokens(prompt);
}

/**
 * 检查token限制
 */
export function checkTokenLimit(
  ip: string,
  inputTokens: number,
  estimatedOutputTokens: number = 1500
): {
  allowed: boolean;
  reason?: string;
  remainingInputTokens: number;
  remainingOutputTokens: number;
  remainingRequests: number;
  resetIn: number;
} {
  const now = Date.now();
  let entry = tokenLimitStore.get(ip);

  // 清理过期条目
  if (Math.random() < 0.01) {
    for (const [key, value] of tokenLimitStore.entries()) {
      if (now > value.resetTime) {
        tokenLimitStore.delete(key);
      }
    }
  }

  // 检查单次请求限制
  if (inputTokens > MAX_INPUT_TOKENS_PER_REQUEST) {
    return {
      allowed: false,
      reason: `输入内容过长。单次请求最多支持约${MAX_INPUT_TOKENS_PER_REQUEST}个token（约${Math.floor(MAX_INPUT_TOKENS_PER_REQUEST * 1.5)}个中文字符）。`,
      remainingInputTokens: 0,
      remainingOutputTokens: 0,
      remainingRequests: 0,
      resetIn: 0,
    };
  }

  if (estimatedOutputTokens > MAX_OUTPUT_TOKENS_PER_REQUEST) {
    return {
      allowed: false,
      reason: `请求的输出内容过长。单次请求最多支持约${MAX_OUTPUT_TOKENS_PER_REQUEST}个输出token。`,
      remainingInputTokens: 0,
      remainingOutputTokens: 0,
      remainingRequests: 0,
      resetIn: 0,
    };
  }

  // 创建或重置条目
  if (!entry || now > entry.resetTime) {
    entry = {
      inputTokens: 0,
      outputTokens: 0,
      requestCount: 0,
      resetTime: now + WINDOW_MS,
    };
  }

  // 检查是否超过限制
  const newInputTokens = entry.inputTokens + inputTokens;
  const newOutputTokens = entry.outputTokens + estimatedOutputTokens;
  const newRequestCount = entry.requestCount + 1;

  if (newInputTokens > MAX_INPUT_TOKENS_PER_HOUR) {
    return {
      allowed: false,
      reason: `输入token使用量已达上限。每小时最多${MAX_INPUT_TOKENS_PER_HOUR}个输入token。`,
      remainingInputTokens: Math.max(0, MAX_INPUT_TOKENS_PER_HOUR - entry.inputTokens),
      remainingOutputTokens: Math.max(0, MAX_OUTPUT_TOKENS_PER_HOUR - entry.outputTokens),
      remainingRequests: Math.max(0, MAX_REQUESTS_PER_HOUR - entry.requestCount),
      resetIn: entry.resetTime - now,
    };
  }

  if (newOutputTokens > MAX_OUTPUT_TOKENS_PER_HOUR) {
    return {
      allowed: false,
      reason: `输出token使用量已达上限。每小时最多${MAX_OUTPUT_TOKENS_PER_HOUR}个输出token。`,
      remainingInputTokens: Math.max(0, MAX_INPUT_TOKENS_PER_HOUR - entry.inputTokens),
      remainingOutputTokens: Math.max(0, MAX_OUTPUT_TOKENS_PER_HOUR - entry.outputTokens),
      remainingRequests: Math.max(0, MAX_REQUESTS_PER_HOUR - entry.requestCount),
      resetIn: entry.resetTime - now,
    };
  }

  if (newRequestCount > MAX_REQUESTS_PER_HOUR) {
    return {
      allowed: false,
      reason: `请求次数已达上限。每小时最多${MAX_REQUESTS_PER_HOUR}个请求。`,
      remainingInputTokens: Math.max(0, MAX_INPUT_TOKENS_PER_HOUR - entry.inputTokens),
      remainingOutputTokens: Math.max(0, MAX_OUTPUT_TOKENS_PER_HOUR - entry.outputTokens),
      remainingRequests: Math.max(0, MAX_REQUESTS_PER_HOUR - entry.requestCount),
      resetIn: entry.resetTime - now,
    };
  }

  // 更新条目（在实际调用API后）
  return {
    allowed: true,
    remainingInputTokens: MAX_INPUT_TOKENS_PER_HOUR - entry.inputTokens,
    remainingOutputTokens: MAX_OUTPUT_TOKENS_PER_HOUR - entry.outputTokens,
    remainingRequests: MAX_REQUESTS_PER_HOUR - entry.requestCount,
    resetIn: entry.resetTime - now,
  };
}

/**
 * 记录实际使用的token数量
 */
export function recordTokenUsage(
  ip: string,
  inputTokens: number,
  outputTokens: number
): void {
  const now = Date.now();
  let entry = tokenLimitStore.get(ip);

  if (!entry || now > entry.resetTime) {
    entry = {
      inputTokens: 0,
      outputTokens: 0,
      requestCount: 0,
      resetTime: now + WINDOW_MS,
    };
  }

  entry.inputTokens += inputTokens;
  entry.outputTokens += outputTokens;
  entry.requestCount += 1;

  tokenLimitStore.set(ip, entry);
}

/**
 * 获取当前使用情况
 */
export function getTokenUsage(ip: string): {
  inputTokens: number;
  outputTokens: number;
  requestCount: number;
  resetIn: number;
} {
  const now = Date.now();
  const entry = tokenLimitStore.get(ip);

  if (!entry || now > entry.resetTime) {
    return {
      inputTokens: 0,
      outputTokens: 0,
      requestCount: 0,
      resetIn: WINDOW_MS,
    };
  }

  return {
    inputTokens: entry.inputTokens,
    outputTokens: entry.outputTokens,
    requestCount: entry.requestCount,
    resetIn: entry.resetTime - now,
  };
}
