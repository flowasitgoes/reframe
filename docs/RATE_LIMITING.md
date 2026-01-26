# API限流与Token防护机制

本文档说明项目中实施的API限流和Token防护机制，用于防止API被滥用并控制成本。

## 防护机制概览

项目实施了**多层防护机制**，从不同维度保护API：

### 1. 快速限流（Rate Limiting）
- **位置**: `lib/rate-limit.ts`
- **机制**: 基于IP的请求频率限制
- **限制**: 
  - 每分钟最多 10 个请求
  - 时间窗口: 1 分钟
- **用途**: 防止短时间内大量请求（DDoS防护）

### 2. Token数量限制（Token Limiting）
- **位置**: `lib/token-limiter.ts`
- **机制**: 基于Token数量的成本控制
- **限制**:
  - **单次请求限制**:
    - 输入Token: 最多 8,000 tokens/请求
    - 输出Token: 最多 2,000 tokens/请求
  - **每小时限制**:
    - 输入Token: 最多 50,000 tokens/小时/IP
    - 输出Token: 最多 20,000 tokens/小时/IP
    - 请求次数: 最多 30 次/小时/IP
- **用途**: 控制API调用成本，防止恶意用户消耗过多资源

### 3. 输入验证（Input Validation）
- **位置**: `app/api/generate/route.ts`
- **机制**: 使用Zod进行输入验证
- **限制**:
  - 最小长度: 20 字符
  - 最大长度: 4,000 字符
- **用途**: 防止异常大小的输入

## Token估算方法

系统使用简化的Token估算算法：

```typescript
// 中文: 1.5字符 = 1 token
// 英文: 4字符 = 1 token
```

**注意**: 这是估算值，实际Token数量可能因模型而异。更准确的估算可以使用 `tiktoken` 库。

## 配置参数

所有限制参数都在 `lib/token-limiter.ts` 中定义，可以根据需要调整：

```typescript
const WINDOW_MS = 60 * 60 * 1000; // 1小时窗口
const MAX_INPUT_TOKENS_PER_HOUR = 50000; // 每小时最多50k输入token
const MAX_OUTPUT_TOKENS_PER_HOUR = 20000; // 每小时最多20k输出token
const MAX_REQUESTS_PER_HOUR = 30; // 每小时最多30个请求
const MAX_INPUT_TOKENS_PER_REQUEST = 8000; // 单次请求最多8k输入token
const MAX_OUTPUT_TOKENS_PER_REQUEST = 2000; // 单次请求最多2k输出token
```

## 响应头信息

API响应包含以下限流相关的HTTP头：

- `X-RateLimit-Remaining`: 快速限流剩余请求数
- `X-TokenLimit-Input-Remaining`: 剩余输入Token数量
- `X-TokenLimit-Output-Remaining`: 剩余输出Token数量
- `X-TokenLimit-Requests-Remaining`: 剩余请求次数
- `X-TokenUsage-Input`: 本次请求使用的输入Token
- `X-TokenUsage-Output`: 本次请求使用的输出Token
- `Retry-After`: 限流重置时间（秒）

## 错误响应

当触发限流时，API返回 `429 Too Many Requests` 状态码：

```json
{
  "error": "Token使用量已达上限。每小时最多50000个输入token。",
  "resetIn": 3600
}
```

## 生产环境建议

### 1. 使用Redis进行分布式限流

当前实现使用内存存储（Map），在单服务器环境下工作良好。但在多服务器或服务器重启的情况下，限流状态会丢失。

**建议**: 使用Redis实现分布式限流：

```typescript
// 示例：使用 @upstash/ratelimit
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "1 m"),
});
```

### 2. 更准确的Token计数

使用 `tiktoken` 库进行更准确的Token计数：

```bash
npm install tiktoken
```

```typescript
import { encoding_for_model } from "tiktoken";

const encoding = encoding_for_model("gpt-4");
const tokens = encoding.encode(text);
const tokenCount = tokens.length;
```

### 3. 监控和告警

建议添加：
- Token使用量监控
- 异常请求检测
- 成本告警（当Token使用量超过阈值时）

### 4. 用户认证和授权

对于需要更精细控制的场景，可以考虑：
- 用户登录系统
- 基于用户的限流（而非仅基于IP）
- 不同用户等级的不同限流策略

## 绕过防护的方法

当前防护机制基于IP地址，可能被绕过的方式：

1. **更换IP地址**: 使用VPN或代理
2. **分布式请求**: 从多个IP同时发起请求

**缓解措施**:
- 实施用户认证系统
- 使用更复杂的指纹识别（User-Agent, 浏览器指纹等）
- 实施CAPTCHA验证
- 监控异常模式并自动封禁

## 测试限流

可以使用以下方法测试限流是否正常工作：

```bash
# 快速发送多个请求
for i in {1..15}; do
  curl -X POST http://localhost:3000/api/generate \
    -H "Content-Type: application/json" \
    -H "X-OpenRouter-Key: your-key" \
    -d '{"reflection":"测试内容","style":"gentle","length":"short"}' &
done
wait
```

## 总结

当前实施的防护机制包括：
1. ✅ 快速限流（防止短时间大量请求）
2. ✅ Token数量限制（控制成本）
3. ✅ 输入验证（防止异常输入）
4. ✅ 单次请求限制（防止单个请求消耗过多资源）

这些机制可以有效防止API被滥用，保护您的LLM API成本。
