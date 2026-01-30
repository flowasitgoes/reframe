import type { ReligionBranch } from "@/lib/prompt-types";
import type { Locale } from "@/context/locale";
import type { PrayerStyle, PrayerLength } from "@/lib/prompt";
import {
  buildPrompt as buildPromptChristianZh,
  buildSafetyResponse as buildSafetyResponseChristianZh,
} from "@/lib/prompt";
import {
  buildPrompt as buildPromptChristianEn,
  buildSafetyResponse as buildSafetyResponseChristianEn,
} from "@/lib/prompt_en";
import {
  buildPrompt as buildPromptBuddhistZh,
  buildSafetyResponse as buildSafetyResponseBuddhistZh,
} from "@/lib/prompt-buddhist";
import {
  buildPrompt as buildPromptBuddhistEn,
  buildSafetyResponse as buildSafetyResponseBuddhistEn,
} from "@/lib/prompt-buddhist_en";

export type { ReligionBranch } from "@/lib/prompt-types";
export type { PrayerStyle, PrayerLength } from "@/lib/prompt";

export interface PromptBuilder {
  buildPrompt: (options: {
    reflection: string;
    style: PrayerStyle;
    length: PrayerLength;
  }) => string;
  buildSafetyResponse: (style: PrayerStyle) => {
    title: string;
    reframe: string;
    prayer: string;
    tags: string[];
    blessingCard: string;
    isSafetyResponse: true;
  };
}

/**
 * 依宗教分支與語言回傳對應的 buildPrompt 與 buildSafetyResponse。
 */
export function getPromptBuilder(
  branch: ReligionBranch,
  locale: Locale
): PromptBuilder {
  if (branch === "buddhist") {
    return locale === "zh"
      ? {
          buildPrompt: buildPromptBuddhistZh,
          buildSafetyResponse: buildSafetyResponseBuddhistZh,
        }
      : {
          buildPrompt: buildPromptBuddhistEn,
          buildSafetyResponse: buildSafetyResponseBuddhistEn,
        };
  }
  return locale === "en"
    ? {
        buildPrompt: buildPromptChristianEn,
        buildSafetyResponse: buildSafetyResponseChristianEn,
      }
    : {
        buildPrompt: buildPromptChristianZh,
        buildSafetyResponse: buildSafetyResponseChristianZh,
      };
}
