import { generateText, Output } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { z } from "zod";
import { headers } from "next/headers";
import {
  buildPrompt,
  buildSafetyResponse,
  checkForSafetyKeywords,
  type PrayerStyle,
  type PrayerLength,
} from "@/lib/prompt";
import {
  buildPrompt as buildPromptEn,
  buildSafetyResponse as buildSafetyResponseEn,
} from "@/lib/prompt_en";
import { rateLimit } from "@/lib/rate-limit";
import {
  checkTokenLimit,
  estimatePromptTokens,
  recordTokenUsage,
} from "@/lib/token-limiter";

const requestSchema = z.object({
  reflection: z
    .string()
    .min(20, "Please share at least 20 characters about your day")
    .max(4000, "Please keep your reflection under 4000 characters"),
  style: z.enum(["gentle", "victorious", "gratitude", "night", "morning"]),
  length: z.enum(["short", "medium", "long"]),
  locale: z.enum(["zh", "en"]).optional().default("zh"),
});

const outputSchema = z.object({
  title: z.string().nullable(),
  reframe: z.string(),
  prayer: z.string(),
  tags: z.array(z.string()),
  blessingCard: z.string().max(80),
});

export async function POST(req: Request) {
  try {
    // Get client IP for rate limiting
    const headersList = await headers();
    const forwardedFor = headersList.get("x-forwarded-for");
    const ip = forwardedFor?.split(",")[0]?.trim() || "unknown";

    // 優先使用伺服器環境變數（Vercel 上設定 OPENROUTER_API_KEY），沒有時才用前端傳的 key
    const openRouterKey =
      process.env.OPENROUTER_API_KEY ||
      headersList.get("x-openrouter-key") ||
      "";
    if (!openRouterKey) {
      return Response.json(
        {
          error:
            "服務尚未設定 API Key。若為本機開發，請在 .env.local 設定 OPENROUTER_API_KEY。",
        },
        { status: 401 }
      );
    }

    // 快速限流检查（防止短时间大量请求）
    const rateLimitResult = rateLimit(ip);
    if (!rateLimitResult.success) {
      return Response.json(
        {
          error: "请求过于频繁，请稍后再试。",
          resetIn: Math.ceil(rateLimitResult.resetIn / 1000),
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil(rateLimitResult.resetIn / 1000)),
            "X-RateLimit-Remaining": String(rateLimitResult.remaining),
          },
        }
      );
    }

    const body = await req.json();

    // Validate input
    const parseResult = requestSchema.safeParse(body);
    if (!parseResult.success) {
      const errors = parseResult.error.flatten().fieldErrors;
      const errorMessage =
        Object.values(errors).flat()[0] || "Invalid request";
      return Response.json({ error: errorMessage }, { status: 400 });
    }

    const { reflection, style, length, locale } = parseResult.data;
    const isEn = locale === "en";

    // Check for safety keywords
    if (checkForSafetyKeywords(reflection)) {
      const safetyResponse = isEn
        ? buildSafetyResponseEn(style as PrayerStyle)
        : buildSafetyResponse(style as PrayerStyle);
      return Response.json(safetyResponse, {
        headers: {
          "X-RateLimit-Remaining": String(rateLimitResult.remaining),
        },
      });
    }

    // Build prompt and call LLM (use English prompt when locale is en)
    const prompt = isEn
      ? buildPromptEn({
          reflection,
          style: style as PrayerStyle,
          length: length as PrayerLength,
        })
      : buildPrompt({
          reflection,
          style: style as PrayerStyle,
          length: length as PrayerLength,
        });

    // 估算token数量并检查限制
    const inputTokens = estimatePromptTokens(prompt);
    const estimatedOutputTokens = 1500; // 根据maxOutputTokens设置估算

    const tokenLimitCheck = checkTokenLimit(ip, inputTokens, estimatedOutputTokens);
    if (!tokenLimitCheck.allowed) {
      return Response.json(
        {
          error: tokenLimitCheck.reason || "Token使用量已达上限，请稍后再试。",
          resetIn: Math.ceil(tokenLimitCheck.resetIn / 1000),
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil(tokenLimitCheck.resetIn / 1000)),
            "X-TokenLimit-Input-Remaining": String(tokenLimitCheck.remainingInputTokens),
            "X-TokenLimit-Output-Remaining": String(tokenLimitCheck.remainingOutputTokens),
            "X-TokenLimit-Requests-Remaining": String(tokenLimitCheck.remainingRequests),
          },
        }
      );
    }

    const openrouter = createOpenRouter({
      apiKey: openRouterKey,
    });

    const { output, usage } = await generateText({
      model: openrouter("openai/gpt-4o-mini"),
      output: Output.object({
        schema: outputSchema,
      }),
      prompt,
      temperature: 0.8,
      maxOutputTokens: 1500,
    });

    if (!output) {
      throw new Error("No output generated");
    }

    // 记录实际使用的token数量
    const actualInputTokens = usage?.promptTokens || inputTokens;
    const actualOutputTokens = usage?.completionTokens || estimatedOutputTokens;
    recordTokenUsage(ip, actualInputTokens, actualOutputTokens);

    // 获取更新后的使用情况
    const currentUsage = checkTokenLimit(ip, 0, 0);

    return Response.json(output, {
      headers: {
        "X-RateLimit-Remaining": String(rateLimitResult.remaining),
        "X-TokenLimit-Input-Remaining": String(currentUsage.remainingInputTokens),
        "X-TokenLimit-Output-Remaining": String(currentUsage.remainingOutputTokens),
        "X-TokenLimit-Requests-Remaining": String(currentUsage.remainingRequests),
        "X-TokenUsage-Input": String(actualInputTokens),
        "X-TokenUsage-Output": String(actualOutputTokens),
      },
    });
  } catch (error) {
    console.error("Error generating prayer:", error);

    // Check if it's an API error
    if (error instanceof Error) {
      if (
        error.message.includes("401") ||
        error.message.includes("Unauthorized")
      ) {
        return Response.json(
          {
            error: "API Key 無效或已過期，請聯絡管理員。",
          },
          { status: 401 }
        );
      }
      if (error.message.includes("API") || error.message.includes("fetch")) {
        return Response.json(
          {
            error:
              "Unable to connect to the prayer generation service. Please try again.",
          },
          { status: 503 }
        );
      }
    }

    return Response.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
