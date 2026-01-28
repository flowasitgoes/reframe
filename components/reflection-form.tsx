"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, Sparkles } from "lucide-react";
import { useTranslations } from "@/context/locale";
import type { PrayerStyle, PrayerLength } from "@/lib/prompt";

interface ReflectionFormProps {
  onSubmit: (data: {
    reflection: string;
    style: PrayerStyle;
    length: PrayerLength;
  }) => void;
  isLoading: boolean;
}

const styleKeys: PrayerStyle[] = ["gentle", "victorious", "gratitude", "morning", "night"];
const lengthKeys: PrayerLength[] = ["short", "medium", "long"];

export function ReflectionForm({ onSubmit, isLoading }: ReflectionFormProps) {
  const t = useTranslations();
  const [reflection, setReflection] = useState("");
  const [style, setStyle] = useState<PrayerStyle>("gentle");
  const [length, setLength] = useState<PrayerLength>("medium");

  const charCount = reflection.length;
  const isValid = charCount >= 20 && charCount <= 4000;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid && !isLoading) {
      onSubmit({ reflection, style, length });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-3">
        <Label
          htmlFor="reflection"
          className="text-lg font-medium text-foreground"
        >
          {t("form.reflectionLabel")}
        </Label>
        <p className="text-sm text-muted-foreground">
          {t("form.reflectionHint")}
        </p>
        <Textarea
          id="reflection"
          placeholder={t("form.reflectionPlaceholder")}
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
          className="min-h-[180px] resize-none bg-card border-border focus:border-primary transition-colors text-base leading-relaxed"
          disabled={isLoading}
        />
        <div className="flex justify-between items-center text-sm">
          <span
            className={
              charCount < 20
                ? "text-muted-foreground"
                : charCount > 4000
                  ? "text-destructive"
                  : "text-primary"
            }
          >
            {t("form.charCount", { count: String(charCount) })}
            {charCount < 20 && charCount > 0 && (
              <span className="text-muted-foreground ml-2">
                {t("form.charMinHint")}
              </span>
            )}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        <Label className="text-lg font-medium text-foreground">{t("form.styleLabel")}</Label>
        <RadioGroup
          value={style}
          onValueChange={(v) => setStyle(v as PrayerStyle)}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3"
          disabled={isLoading}
        >
          {styleKeys.map((key) => (
            <Label
              key={key}
              htmlFor={key}
              className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 cursor-pointer transition-all hover:border-primary/50 ${
                style === key
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card"
              }`}
            >
              <RadioGroupItem
                value={key}
                id={key}
                className="sr-only"
              />
              <span className="font-medium text-foreground">{t(`form.styles.${key}.label`)}</span>
              <span className="text-xs text-muted-foreground text-center mt-1">
                {t(`form.styles.${key}.description`)}
              </span>
            </Label>
          ))}
        </RadioGroup>
      </div>

      <div className="space-y-4">
        <Label className="text-lg font-medium text-foreground">{t("form.lengthLabel")}</Label>
        <RadioGroup
          value={length}
          onValueChange={(v) => setLength(v as PrayerLength)}
          className="flex gap-3"
          disabled={isLoading}
        >
          {lengthKeys.map((key) => (
            <Label
              key={key}
              htmlFor={`length-${key}`}
              className={`flex items-center justify-center px-6 py-3 rounded-lg border-2 cursor-pointer transition-all hover:border-primary/50 ${
                length === key
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card"
              }`}
            >
              <RadioGroupItem
                value={key}
                id={`length-${key}`}
                className="sr-only"
              />
              <span className="font-medium text-foreground">{t(`form.lengths.${key}`)}</span>
            </Label>
          ))}
        </RadioGroup>
      </div>

      <Button
        type="submit"
        size="lg"
        disabled={!isValid || isLoading}
        className="w-full sm:w-auto min-w-[200px] text-base"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            {t("form.submitLoading")}
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-5 w-5" />
            {t("form.submitDefault")}
          </>
        )}
      </Button>
    </form>
  );
}
