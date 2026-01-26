"use client";

import React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, Sparkles } from "lucide-react";
import type { PrayerStyle, PrayerLength } from "@/lib/prompt";

interface ReflectionFormProps {
  onSubmit: (data: {
    reflection: string;
    style: PrayerStyle;
    length: PrayerLength;
  }) => void;
  isLoading: boolean;
}

const styles: { value: PrayerStyle; label: string; description: string }[] = [
  {
    value: "gentle",
    label: "溫柔安慰",
    description: "柔和撫慰的話語",
  },
  {
    value: "victorious",
    label: "得勝宣告",
    description: "充滿力量與信心",
  },
  {
    value: "gratitude",
    label: "感恩讚美",
    description: "專注恩典與祝福",
  },
  {
    value: "morning",
    label: "晨間盼望",
    description: "迎接新的一天",
  },
  {
    value: "night",
    label: "夜間安息",
    description: "釋放重擔、安歇",
  },
];

const lengths: { value: PrayerLength; label: string }[] = [
  { value: "short", label: "簡短" },
  { value: "medium", label: "中等" },
  { value: "long", label: "完整" },
];

export function ReflectionForm({ onSubmit, isLoading }: ReflectionFormProps) {
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
          寫下你的心情
        </Label>
        <p className="text-sm text-muted-foreground">
          分享今天發生的事、你的感受、擔憂或感恩的事。這些文字將被轉化為祝福與禱告。
        </p>
        <Textarea
          id="reflection"
          placeholder="今天我感到... / 我正在經歷... / 我心裡有些..."
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
            {charCount} / 4000 字
            {charCount < 20 && charCount > 0 && (
              <span className="text-muted-foreground ml-2">
                （至少 20 個字）
              </span>
            )}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        <Label className="text-lg font-medium text-foreground">禱告風格</Label>
        <RadioGroup
          value={style}
          onValueChange={(v) => setStyle(v as PrayerStyle)}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3"
          disabled={isLoading}
        >
          {styles.map((s) => (
            <Label
              key={s.value}
              htmlFor={s.value}
              className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 cursor-pointer transition-all hover:border-primary/50 ${
                style === s.value
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card"
              }`}
            >
              <RadioGroupItem
                value={s.value}
                id={s.value}
                className="sr-only"
              />
              <span className="font-medium text-foreground">{s.label}</span>
              <span className="text-xs text-muted-foreground text-center mt-1">
                {s.description}
              </span>
            </Label>
          ))}
        </RadioGroup>
      </div>

      <div className="space-y-4">
        <Label className="text-lg font-medium text-foreground">禱告長度</Label>
        <RadioGroup
          value={length}
          onValueChange={(v) => setLength(v as PrayerLength)}
          className="flex gap-3"
          disabled={isLoading}
        >
          {lengths.map((l) => (
            <Label
              key={l.value}
              htmlFor={`length-${l.value}`}
              className={`flex items-center justify-center px-6 py-3 rounded-lg border-2 cursor-pointer transition-all hover:border-primary/50 ${
                length === l.value
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card"
              }`}
            >
              <RadioGroupItem
                value={l.value}
                id={`length-${l.value}`}
                className="sr-only"
              />
              <span className="font-medium text-foreground">{l.label}</span>
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
            正在生成禱告...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-5 w-5" />
            生成禱告
          </>
        )}
      </Button>
    </form>
  );
}
