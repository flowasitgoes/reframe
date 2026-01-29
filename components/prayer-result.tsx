"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Copy,
  Check,
  Download,
  RefreshCw,
  AlertTriangle,
  Heart,
} from "lucide-react";
import { useTranslations } from "@/context/locale";
import { trackEvent } from "@/lib/entry-api";

interface PrayerResultProps {
  result: {
    title?: string | null;
    reframe: string;
    prayer: string;
    tags?: string[];
    blessingCard?: string;
    isSafetyResponse?: boolean;
  };
  entryId?: string | null;
  onRegenerate: () => void;
  isLoading: boolean;
}

export function PrayerResult({
  result,
  entryId,
  onRegenerate,
  isLoading,
}: PrayerResultProps) {
  const t = useTranslations();
  const [copiedReframe, setCopiedReframe] = useState(false);
  const [copiedPrayer, setCopiedPrayer] = useState(false);
  const [copiedBlessingCard, setCopiedBlessingCard] = useState(false);
  const [downloadingJpg, setDownloadingJpg] = useState(false);
  const [downloadingWhiteJpg, setDownloadingWhiteJpg] = useState(false);
  // 朗讀功能暫時停用（聲音品質不佳）
  // const [isSpeaking, setIsSpeaking] = useState(false);
  // const [currentSpeaking, setCurrentSpeaking] = useState<
  //   "reframe" | "prayer" | null
  // >(null);
  // const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

  const copyToClipboard = useCallback(
    async (text: string, type: "reframe" | "prayer" | "blessingCard") => {
      try {
        await navigator.clipboard.writeText(text);
        if (type === "reframe") {
          setCopiedReframe(true);
          setTimeout(() => setCopiedReframe(false), 2000);
        } else if (type === "prayer") {
          setCopiedPrayer(true);
          setTimeout(() => setCopiedPrayer(false), 2000);
        } else {
          setCopiedBlessingCard(true);
          setTimeout(() => setCopiedBlessingCard(false), 2000);
        }
      } catch (err) {
        console.error("Failed to copy:", err);
      }
    },
    []
  );

  const downloadAs = useCallback(
    (format: "txt" | "md") => {
      const title = result.title || t("result.myPrayer");
      const reframeHeading = t("result.reframeHeading");
      const prayerHeading = t("result.prayerHeading");
      const blessingHeading = t("result.blessingHeading");
      const madeByMd = t("result.madeBy");
      const madeByTxt = t("result.madeByShort");
      const blessing = result.blessingCard
        ? (format === "md"
            ? `## ${blessingHeading}\n\n${result.blessingCard}\n\n`
            : `【${blessingHeading}】\n${result.blessingCard}\n\n`)
        : "";
      const content =
        format === "md"
          ? `# ${title}\n\n${blessing}## ${reframeHeading}\n\n${result.reframe}\n\n## ${prayerHeading}\n\n${result.prayer}\n\n---\n\n*${madeByMd}*`
          : `${title}\n${"=".repeat(Math.min(title.length * 2, 40))}\n\n${blessing}【${reframeHeading}】\n${result.reframe}\n\n【${prayerHeading}】\n${result.prayer}\n\n---\n${madeByTxt}`;

      const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${t("result.downloadFilenamePrayer")}-${Date.now()}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },
    [result, t]
  );

  const downloadBlessingCardJpg = useCallback(async () => {
    const text = result.blessingCard;
    if (!text || typeof window === "undefined") return;
    setDownloadingJpg(true);
    try {
      const img = new Image();
      const imgLoad = new Promise<HTMLImageElement>((resolve, reject) => {
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error("無法載入背景圖"));
        img.crossOrigin = "anonymous";
        img.src = "/prayers-card.jpg";
      });
      const loadedImg = await imgLoad;
      const canvas = document.createElement("canvas");
      canvas.width = loadedImg.naturalWidth;
      canvas.height = loadedImg.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("無法建立畫布");
      ctx.drawImage(loadedImg, 0, 0);
      const fontSize = 20;
      const lineHeight = Math.round(fontSize * 1.4);
      ctx.font = `${fontSize}px "PingFang TC", "Microsoft JhengHei", "Noto Sans TC", sans-serif`;
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const lines = text.split(/\r?\n/).filter(Boolean);
      // 文字區塊底邊距離畫布底部 90px，由下往上排
      const startY = canvas.height - 90 - lineHeight / 2 - (lines.length - 1) * lineHeight;
      const totalHeight = lines.length * lineHeight;
      const padV = 20;
      const boxTop = startY - lineHeight / 2 - padV;
      const boxHeight = totalHeight + padV * 2;
      // 先畫 overlay（在下層），再畫文字（在最上層）；overlay 寬度全滿
      ctx.fillStyle = "rgba(56, 56, 56, 0.5)";
      ctx.fillRect(0, boxTop, canvas.width, boxHeight);
      ctx.fillStyle = "#ffffff";
      lines.forEach((line, i) => {
        ctx.fillText(line.trim(), canvas.width / 2, startY + i * lineHeight);
      });
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            setDownloadingJpg(false);
            return;
          }
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `${t("result.downloadFilenameBlessing")}-${Date.now()}.jpg`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          setDownloadingJpg(false);
        },
        "image/jpeg",
        0.92
      );
    } catch (err) {
      console.error("下載祝福卡片失敗:", err);
      setDownloadingJpg(false);
    }
  }, [result.blessingCard, t]);

  const downloadBlessingCardWhiteJpg = useCallback(async () => {
    const text = result.blessingCard;
    if (!text || typeof window === "undefined") return;
    setDownloadingWhiteJpg(true);
    try {
      const img = new Image();
      const imgLoad = new Promise<HTMLImageElement>((resolve, reject) => {
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error("無法載入背景圖"));
        img.crossOrigin = "anonymous";
        img.src = "/prayer-card-white-bg.jpg";
      });
      const loadedImg = await imgLoad;
      const canvas = document.createElement("canvas");
      canvas.width = loadedImg.naturalWidth;
      canvas.height = loadedImg.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("無法建立畫布");
      ctx.drawImage(loadedImg, 0, 0);
      const fontSize = 28;
      const lineHeight = Math.round(fontSize * 1.4);
      ctx.font = `${fontSize}px "PingFang TC", "Microsoft JhengHei", "Noto Sans TC", sans-serif`;
      ctx.fillStyle = "#555";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const lines = text.split(/\r?\n/).filter(Boolean);
      // 圖片中央為淺色卡片區（約 15%～85% 寬、25%～75% 高），文字置中寫在該區
      const boxLeft = canvas.width * 0.15;
      const boxWidth = canvas.width * 0.7;
      const boxTop = canvas.height * 0.25;
      const boxHeight = canvas.height * 0.5;
      const totalHeight = lines.length * lineHeight;
      const startY = boxTop + boxHeight / 2 - totalHeight / 2 + lineHeight / 2;
      lines.forEach((line, i) => {
        ctx.fillText(line.trim(), boxLeft + boxWidth / 2, startY + i * lineHeight);
      });
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            setDownloadingWhiteJpg(false);
            return;
          }
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `${t("result.downloadFilenameBlessingWhite")}-${Date.now()}.jpg`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          setDownloadingWhiteJpg(false);
        },
        "image/jpeg",
        0.92
      );
    } catch (err) {
      console.error("下載祈願卡片(白)失敗:", err);
      setDownloadingWhiteJpg(false);
    }
  }, [result.blessingCard, t]);

  const handleDownloadBlessingJpg = useCallback(() => {
    trackEvent({
      event_name: "click_download_blessing",
      entry_id: entryId ?? undefined,
      meta: { format: "jpg" },
    });
    downloadBlessingCardJpg();
  }, [entryId, downloadBlessingCardJpg]);

  const handleDownloadBlessingWhiteJpg = useCallback(() => {
    trackEvent({
      event_name: "click_download_blessing",
      entry_id: entryId ?? undefined,
      meta: { format: "jpg_white" },
    });
    downloadBlessingCardWhiteJpg();
  }, [entryId, downloadBlessingCardWhiteJpg]);

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
                  {t("result.safetyTitle")}
                </p>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  {t("result.safetyMessage")}
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
              {t("result.reframeTitle")}
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
                title={t("result.copyTitle")}
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
              {t("result.prayerTitle")}
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
                title={t("result.copyTitle")}
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

      {result.blessingCard && (
        <Card className="border-[#999] bg-[#cccccc9e] text-center">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-center relative">
              <CardTitle className="text-base font-medium text-foreground">
                {t("result.blessingTitle")}
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  copyToClipboard(result.blessingCard!, "blessingCard")
                }
                className="absolute right-0 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                title={t("result.copyTitle")}
              >
                {copiedBlessingCard ? (
                  <Check className="h-4 w-4 text-primary" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-foreground text-sm leading-relaxed whitespace-pre-wrap">
              {result.blessingCard}
            </p>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-wrap gap-3 justify-center pt-4">
        <Button
          variant="outline"
          onClick={onRegenerate}
          disabled={isLoading}
          className="min-w-[140px] bg-transparent cursor-pointer"
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
          />
          {t("result.regenerate")}
        </Button>
        <Button
          variant="outline"
          onClick={() => downloadAs("txt")}
          className="min-w-[140px] cursor-pointer"
        >
          <Download className="mr-2 h-4 w-4" />
          {t("result.downloadTxt")}
        </Button>
        {result.blessingCard && (
          <>
            <Button
              variant="outline"
              onClick={handleDownloadBlessingJpg}
              disabled={downloadingJpg}
              className="min-w-[140px] cursor-pointer"
            >
              <Download
                className={`mr-2 h-4 w-4 ${downloadingJpg ? "animate-pulse" : ""}`}
              />
              {downloadingJpg ? t("result.downloadingJpg") : t("result.downloadBlessingJpg")}
            </Button>
            <Button
              variant="outline"
              onClick={handleDownloadBlessingWhiteJpg}
              disabled={downloadingWhiteJpg}
              className="min-w-[140px] cursor-pointer"
            >
              <Download
                className={`mr-2 h-4 w-4 ${downloadingWhiteJpg ? "animate-pulse" : ""}`}
              />
              {downloadingWhiteJpg ? t("result.downloadingWhiteJpg") : t("result.downloadBlessingWhiteJpg")}
            </Button>
          </>
        )}
        {/* 下載 MD 暫時停用
        <Button
          variant="outline"
          onClick={() => downloadAs("md")}
          className="min-w-[140px]"
        >
          <Download className="mr-2 h-4 w-4" />
          下載 MD
        </Button>
        */}
      </div>
    </div>
  );
}
