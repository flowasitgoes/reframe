"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  useEffect,
} from "react";
import zh from "@/messages/zh.json";
import en from "@/messages/en.json";

export type Locale = "zh" | "en";

const STORAGE_KEY = "prayforyou_locale";
const FADE_DURATION_MS = 220;

const messages: Record<Locale, Record<string, unknown>> = {
  zh: zh as Record<string, unknown>,
  en: en as Record<string, unknown>,
};

function getByPath(obj: Record<string, unknown>, path: string): string | undefined {
  const parts = path.split(".");
  let cur: unknown = obj;
  for (const p of parts) {
    if (cur == null || typeof cur !== "object") return undefined;
    cur = (cur as Record<string, unknown>)[p];
  }
  return typeof cur === "string" ? cur : undefined;
}

function interpolate(str: string, params: Record<string, string | number>): string {
  return str.replace(/\{(\w+)\}/g, (_, key) => String(params[key] ?? `{${key}}`));
}

interface LocaleContextValue {
  locale: Locale;
  setLocale: (next: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("zh");
  const [mounted, setMounted] = useState(false);
  const [contentOpacity, setContentOpacity] = useState(1);
  const transitionRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Locale | null;
      if (stored === "zh" || stored === "en") setLocaleState(stored);
    } catch {
      // ignore
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    return () => {
      if (transitionRef.current) clearTimeout(transitionRef.current);
    };
  }, []);

  useEffect(() => {
    if (!mounted) return;
    try {
      document.documentElement.lang = locale === "zh" ? "zh-TW" : "en";
    } catch {
      // ignore
    }
  }, [mounted, locale]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState((prev) => {
      if (prev === next) return prev;
      if (transitionRef.current) clearTimeout(transitionRef.current);
      setContentOpacity(0);
      transitionRef.current = setTimeout(() => {
        transitionRef.current = null;
        setLocaleState(next);
        try {
          localStorage.setItem(STORAGE_KEY, next);
        } catch {
          // ignore
        }
        requestAnimationFrame(() => {
          requestAnimationFrame(() => setContentOpacity(1));
        });
      }, FADE_DURATION_MS);
      return prev;
    });
  }, []);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>) => {
      const str = getByPath(messages[locale], key) ?? getByPath(messages.zh, key) ?? key;
      return params ? interpolate(str, params) : str;
    },
    [locale]
  );

  const value = useMemo(
    () => ({ locale, setLocale, t }),
    [locale, setLocale, t]
  );

  return (
    <LocaleContext.Provider value={value}>
      <div
        className="min-h-full"
        style={{
          opacity: contentOpacity,
          transition: `opacity ${FADE_DURATION_MS}ms ease-in-out`,
        }}
      >
        {children}
      </div>
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
}

export function useTranslations() {
  return useLocale().t;
}
