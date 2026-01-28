"use client";

import { useState, useCallback, useRef } from "react";
import { ReflectionForm } from "@/components/reflection-form";
import { PrayerResult } from "@/components/prayer-result";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";
import Image from "next/image";
import { AlertCircle, ArrowLeft, BookOpen, Home as HomeIcon } from "lucide-react";
import type { PrayerStyle, PrayerLength } from "@/lib/prompt";

interface GeneratedResult {
  title?: string | null;
  reframe: string;
  prayer: string;
  tags?: string[];
  isSafetyResponse?: boolean;
}

interface FormData {
  reflection: string;
  style: PrayerStyle;
  length: PrayerLength;
}

export default function Home() {
  const [result, setResult] = useState<GeneratedResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastFormData = useRef<FormData | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const generatePrayer = useCallback(async (data: FormData) => {
    lastFormData.current = data;
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.error || "生成禱告時發生錯誤");
      }

      setResult(json);

      // Scroll to result after a brief delay
      setTimeout(() => {
        resultRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "發生錯誤，請稍後再試。"
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

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
              aria-label="回到 ifunlove.com 主頁"
            >
              <ArrowLeft className="h-4 w-4 shrink-0" />
              <span className="flex sm:hidden">
                <HomeIcon className="h-5 w-5 shrink-0" />
              </span>
              <span className="hidden sm:inline truncate">ifunlove.com</span>
            </Link>
            <div className="flex items-center gap-3 shrink-0">
              <div className="p-1.5 rounded-full bg-primary/10 flex items-center justify-center">
                <Image
                  src="/title-icon.png"
                  alt=""
                  width={40}
                  height={40}
                  className="h-8 w-8 md:h-9 md:w-9 object-contain"
                />
              </div>
              <h1 className="text-2xl md:text-3xl font-serif font-medium text-foreground">
                為你禱告
              </h1>
            </div>
            <div className="flex-1 min-w-0" aria-hidden />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 md:py-12">
        {/* Hero Section */}
        <section className="max-w-2xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif text-foreground mb-4 text-balance">
            將你的心情化為祝福
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            寫下今天的心情與想法，讓我們為你重新框架觀點，並創作一篇專屬於你的禱告。
          </p>
        </section>

        {/* Form Section */}
        <section className="max-w-3xl mx-auto mb-16">
          <div className="bg-card rounded-2xl border border-border p-6 md:p-8 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <BookOpen className="h-5 w-5 text-primary" />
              <h3 className="text-xl font-medium text-foreground">
                今日心情記錄
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
                onRegenerate={handleRegenerate}
                isLoading={isLoading}
              />
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="max-w-2xl mx-auto mt-16 pt-8 border-t border-border text-center">
          <p className="text-sm text-muted-foreground">
            「為你禱告」傾聽您的心情記錄並以正向的心態轉換為禱告，
          </p>
          <p className="text-sm text-muted-foreground mt-4">
            每天都可以享受生活呦。
          </p>
          <p className="text-sm text-muted-foreground mt-4">
            多多和朋友家人相聚，談心，到戶外走走，
          </p>
          <p className="text-sm text-muted-foreground mt-4">
            做一些讓自己開心的事。
          </p>
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
