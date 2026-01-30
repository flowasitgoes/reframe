"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { ReflectionForm } from "@/components/reflection-form";
import { PrayerResult } from "@/components/prayer-result";
import { SkyLanternBlessing, type SkyLanternReplayRef } from "@/components/sky-lantern-blessing";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ReligionSwitcher } from "@/components/religion-switcher";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { AlertCircle, ArrowLeft, BookOpen, Home as HomeIcon } from "lucide-react";
import { useLocale, useTranslations } from "@/context/locale";
import type { PrayerStyle, PrayerLength } from "@/lib/prompt";
import { submitEntry } from "@/lib/entry-api";
import { useToast } from "@/hooks/use-toast";

interface GeneratedResult {
  title?: string | null;
  reframe: string;
  prayer: string;
  tags?: string[];
  blessingCard?: string;
  isSafetyResponse?: boolean;
}

interface FormData {
  reflection: string;
  style: PrayerStyle;
  length: PrayerLength;
}

export default function Home() {
  const { locale, religion } = useLocale();
  const t = useTranslations();
  const { toast } = useToast();
  const [result, setResult] = useState<GeneratedResult | null>(null);
  const [entryId, setEntryId] = useState<string | null>(null);
  const [prayerCount, setPrayerCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastFormData = useRef<FormData | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const bottomSentinelRef = useRef<HTMLDivElement | null>(null);
  const lanternReplayRef = useRef<SkyLanternReplayRef | null>(null);

  const fetchPrayerCount = useCallback(async () => {
    try {
      const res = await fetch("/api/stats");
      const data = await res.json();
      if (typeof data?.count === "number") setPrayerCount(data.count);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetchPrayerCount();
  }, [fetchPrayerCount]);

  const generatePrayer = useCallback(async (data: FormData) => {
    lastFormData.current = data;
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, locale, religion }),
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.error || t("errors.generationFailed"));
      }

      setResult(json);
      setEntryId(null);

      try {
        const { entry_id } = await submitEntry({
          journal: data.reflection,
          reframe: json.reframe,
          prayer: json.prayer,
          blessing: json.blessingCard ?? "",
        });
        setEntryId(entry_id);
        fetchPrayerCount();
      } catch (saveErr) {
        toast({
          title: "Save failed",
          description:
            saveErr instanceof Error ? saveErr.message : "Failed to save entry.",
          variant: "destructive",
        });
      }

      // Scroll to result after a brief delay
      setTimeout(() => {
        resultRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("errors.pleaseRetry")
      );
    } finally {
      setIsLoading(false);
    }
  }, [t, locale, religion, toast, fetchPrayerCount]);

  const handleRegenerate = useCallback(() => {
    if (lastFormData.current) {
      generatePrayer(lastFormData.current);
    }
  }, [generatePrayer]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <Link
              href="https://ifunlove.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors min-w-0 flex-1 justify-start"
              aria-label={t("home.backToHome")}
            >
              <ArrowLeft className="h-4 w-4 shrink-0" />
              <span className="flex sm:hidden">
                <HomeIcon className="h-5 w-5 shrink-0" />
              </span>
              <span className="hidden sm:inline truncate">ifunlove.com</span>
            </Link>
            <div className="flex flex-col items-center gap-2 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-full bg-primary/10 flex items-center justify-center">
                  <Image
                    src="/title-icon.png"
                    alt=""
                    width={40}
                    height={40}
                    className="h-10 w-10 object-contain"
                  />
                </div>
                <h1 className="text-2xl md:text-3xl font-serif font-medium text-foreground">
                  {t("home.siteName")}
                </h1>
              </div>
              <div className="flex sm:hidden" aria-hidden>
                <ReligionSwitcher disabled={!!result} />
              </div>
            </div>
            <div className="flex flex-1 min-w-0 items-center justify-end gap-2" aria-hidden>
              <div className="hidden sm:flex">
                <ReligionSwitcher disabled={!!result} />
              </div>
              <LanguageSwitcher disabled={!!result} />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 md:py-12">
        {/* Hero Section */}
        <section className="max-w-2xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif text-foreground mb-4 text-balance">
            {t("home.heroTitle")}
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            {t("home.heroSubtitle")}
          </p>
        </section>

        {/* Form Section */}
        <section className="max-w-3xl mx-auto mb-16">
          <div className="bg-card rounded-2xl border border-border p-6 md:p-8 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <BookOpen className="h-5 w-5 text-primary" />
              <h3 className="text-xl font-medium text-foreground">
                {t("home.sectionReflection")}
              </h3>
            </div>

            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <ReflectionForm onSubmit={generatePrayer} isLoading={isLoading} />
          </div>
        </section>

        {/* Results Section */}
        {result && (
          <section ref={resultRef} className="max-w-3xl mx-auto scroll-mt-24">
            <div className="bg-card rounded-2xl border border-border p-6 md:p-8 shadow-sm">
              <PrayerResult
                result={result}
                entryId={entryId}
                onRegenerate={handleRegenerate}
                isLoading={isLoading}
              />
            </div>
            <div
              ref={bottomSentinelRef}
              className="h-1 w-full"
              aria-hidden="true"
            />
            <SkyLanternBlessing
              key={entryId ?? result.reframe ?? "result"}
              sentinelRef={bottomSentinelRef}
              blessingCard={result.blessingCard}
              visible={!!result}
              resultKey={entryId ?? result.reframe ?? undefined}
              replayRef={lanternReplayRef}
            />
          </section>
        )}

        {/* Prayer count */}
        {prayerCount !== null && (
          <section
            className="max-w-2xl mx-auto mt-16 text-center"
            style={{ paddingTop: 0, borderTop: 0 }}
          >
            <p className="text-sm text-muted-foreground">
              {t("home.prayerCountBefore")}
              <strong>{prayerCount}</strong>
              {t("home.prayerCountAfter")}
            </p>
          </section>
        )}

        {/* Footer */}
        <footer className="max-w-2xl mx-auto mt-16 pt-8 border-t border-border text-center">
          <p className="text-sm text-muted-foreground">
            {t("home.footer1")}
          </p>
          <p className="text-sm text-muted-foreground mt-4">
            {t("home.footer2")}
          </p>
          <p className="text-sm text-muted-foreground mt-4">
            {t("home.footer3")}
          </p>
          {result?.blessingCard && (
            <p className="mt-6">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-muted-foreground"
                onClick={() => lanternReplayRef.current?.replay()}
              >
                重新播放天燈動畫（開發測試）
              </Button>
            </p>
          )}
          {/* <p className="text-sm text-muted-foreground mt-4">
            如果你正在經歷危機，請撥打{" "}
            <a
              href="tel:1925"
              className="text-primary hover:underline font-medium"
            >
              生命線 1925
            </a>{" "}
            或{" "}
            <a
              href="tel:1980"
              className="text-primary hover:underline font-medium"
            >
              安心專線 1980
            </a>
            。
          </p> */}
        </footer>
      </main>
    </div>
  );
}
