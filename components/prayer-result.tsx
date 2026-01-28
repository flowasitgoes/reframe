"use client";

import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Copy,
  Check,
  Download,
  RefreshCw,
  // Volume2,
  // VolumeX,
  AlertTriangle,
  Heart,
} from "lucide-react";

interface PrayerResultProps {
  result: {
    title?: string | null;
    reframe: string;
    prayer: string;
    tags?: string[];
    isSafetyResponse?: boolean;
  };
  onRegenerate: () => void;
  isLoading: boolean;
}

export function PrayerResult({
  result,
  onRegenerate,
  isLoading,
}: PrayerResultProps) {
  const [copiedReframe, setCopiedReframe] = useState(false);
  const [copiedPrayer, setCopiedPrayer] = useState(false);
  // 朗讀功能暫時停用（聲音品質不佳）
  // const [isSpeaking, setIsSpeaking] = useState(false);
  // const [currentSpeaking, setCurrentSpeaking] = useState<
  //   "reframe" | "prayer" | null
  // >(null);
  // const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

  const copyToClipboard = useCallback(
    async (text: string, type: "reframe" | "prayer") => {
      try {
        await navigator.clipboard.writeText(text);
        if (type === "reframe") {
          setCopiedReframe(true);
          setTimeout(() => setCopiedReframe(false), 2000);
        } else {
          setCopiedPrayer(true);
          setTimeout(() => setCopiedPrayer(false), 2000);
        }
      } catch (err) {
        console.error("Failed to copy:", err);
      }
    },
    []
  );

  const downloadAs = useCallback(
    (format: "txt" | "md") => {
      const title = result.title || "我的禱告";
      const content =
        format === "md"
          ? `# ${title}\n\n## 選擇讓你感覺好的思維\n\n${result.reframe}\n\n## 禱告\n\n${result.prayer}\n\n---\n\n*由 為你禱告 製作*`
          : `${title}\n${"=".repeat(title.length * 2)}\n\n【選擇讓你感覺好的思維】\n${result.reframe}\n\n【禱告】\n${result.prayer}\n\n---\n由「為你禱告」製作`;

      const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `禱告-${Date.now()}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },
    [result]
  );

  // 朗讀功能暫時停用（聲音品質不佳）
  // const speak = useCallback(
  //   (text: string, type: "reframe" | "prayer") => {
  //     if (typeof window === "undefined" || !("speechSynthesis" in window)) {
  //       return;
  //     }
  //     window.speechSynthesis.cancel();
  //     if (isSpeaking && currentSpeaking === type) {
  //       setIsSpeaking(false);
  //       setCurrentSpeaking(null);
  //       return;
  //     }
  //     const utterance = new SpeechSynthesisUtterance(text);
  //     utterance.rate = 0.85;
  //     utterance.pitch = 1;
  //     utterance.lang = "zh-TW";
  //     const voices = window.speechSynthesis.getVoices();
  //     const chineseVoice = voices.find(
  //       (v) =>
  //         v.lang.includes("zh-TW") ||
  //         v.lang.includes("zh-Hant") ||
  //         v.lang.includes("zh-CN") ||
  //         v.name.includes("Chinese")
  //     );
  //     if (chineseVoice) utterance.voice = chineseVoice;
  //     utterance.onend = () => {
  //       setIsSpeaking(false);
  //       setCurrentSpeaking(null);
  //     };
  //     utterance.onerror = () => {
  //       setIsSpeaking(false);
  //       setCurrentSpeaking(null);
  //     };
  //     speechRef.current = utterance;
  //     setIsSpeaking(true);
  //     setCurrentSpeaking(type);
  //     window.speechSynthesis.speak(utterance);
  //   },
  //   [isSpeaking, currentSpeaking]
  // );
  // useEffect(() => {
  //   return () => {
  //     if (typeof window !== "undefined" && "speechSynthesis" in window) {
  //       window.speechSynthesis.cancel();
  //     }
  //   };
  // }, []);

  return (
    <div className="space-y-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
      {result.isSafetyResponse && (
        <Card className="border-amber-300 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
              <div className="space-y-2">
                <p className="font-medium text-amber-800 dark:text-amber-200">
                  我們在乎你
                </p>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  如果你正在經歷困難的時刻，請知道有人願意傾聽。你值得被支持與幫助。
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {result.title && (
        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-serif text-foreground flex items-center justify-center gap-2">
            <Heart className="h-6 w-6 text-primary" />
            <span className="text-balance">{result.title}</span>
          </h2>
          {result.tags && result.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-center mt-4">
              {result.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-sm">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      )}

      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-medium text-foreground">
              選擇讓你感覺好的思維
            </CardTitle>
            <div className="flex gap-2">
              {/* 朗讀功能暫時停用
              <Button
                variant="ghost"
                size="sm"
                onClick={() => speak(result.reframe, "reframe")}
                className="text-muted-foreground hover:text-foreground"
                title={isSpeaking && currentSpeaking === "reframe" ? "停止" : "朗讀"}
              >
                {isSpeaking && currentSpeaking === "reframe" ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </Button>
              */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(result.reframe, "reframe")}
                className="text-muted-foreground hover:text-foreground"
                title="複製"
              >
                {copiedReframe ? (
                  <Check className="h-4 w-4 text-primary" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-foreground leading-relaxed whitespace-pre-wrap">
            {result.reframe}
          </p>
        </CardContent>
      </Card>

      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-medium text-foreground">
              垂聽我禱告的神
            </CardTitle>
            <div className="flex gap-2">
              {/* 朗讀功能暫時停用
              <Button
                variant="ghost"
                size="sm"
                onClick={() => speak(result.prayer, "prayer")}
                className="text-muted-foreground hover:text-foreground"
                title={isSpeaking && currentSpeaking === "prayer" ? "停止" : "朗讀"}
              >
                {isSpeaking && currentSpeaking === "prayer" ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </Button>
              */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(result.prayer, "prayer")}
                className="text-muted-foreground hover:text-foreground"
                title="複製"
              >
                {copiedPrayer ? (
                  <Check className="h-4 w-4 text-primary" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-foreground leading-relaxed whitespace-pre-wrap font-serif">
            {result.prayer}
          </p>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3 justify-center pt-4">
        <Button
          variant="outline"
          onClick={onRegenerate}
          disabled={isLoading}
          className="min-w-[140px] bg-transparent"
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
          />
          重新生成
        </Button>
        <Button
          variant="outline"
          onClick={() => downloadAs("txt")}
          className="min-w-[140px]"
        >
          <Download className="mr-2 h-4 w-4" />
          下載 TXT
        </Button>
        <Button
          variant="outline"
          onClick={() => downloadAs("md")}
          className="min-w-[140px]"
        >
          <Download className="mr-2 h-4 w-4" />
          下載 MD
        </Button>
      </div>
    </div>
  );
}
