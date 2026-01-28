"use client";

import { useLocale } from "@/context/locale";
import type { Locale } from "@/context/locale";
import { Button } from "@/components/ui/button";

const labels: Record<Locale, string> = {
  zh: "中文",
  en: "EN",
};

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useLocale();
  const next: Locale = locale === "zh" ? "en" : "zh";

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="cursor-pointer text-muted-foreground hover:text-foreground font-medium min-w-[3rem]"
      onClick={() => setLocale(next)}
      aria-label={t(`locale.${next}`)}
    >
      {labels[next]}
    </Button>
  );
}
