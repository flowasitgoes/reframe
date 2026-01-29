"use client";

import type { Locale } from "@/context/locale";
import { useLocale } from "@/context/locale";
import { Button } from "@/components/ui/button";

const labels: Record<Locale, string> = {
  zh: "中文",
  en: "EN",
};

type Props = { disabled?: boolean };

export function LanguageSwitcher(props: Props) {
  const { disabled = false } = props;
  const { locale, setLocale, t } = useLocale();
  const next: Locale = locale === "zh" ? "en" : "zh";

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      disabled={disabled}
      className="min-w-[3rem] font-medium text-muted-foreground transition-opacity disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none cursor-pointer hover:text-foreground"
      onClick={() => setLocale(next)}
      aria-label={t(`locale.${next}`)}
    >
      {labels[next]}
    </Button>
  );
}
