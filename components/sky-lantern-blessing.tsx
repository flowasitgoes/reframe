"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

const AUTO_CLOSE_MS = 18000;

const LANTERN_COUNT = 5;
const LANTERN_POSITIONS = [20, 40, 55, 72, 88];
const LANTERN_DELAYS = [0, 2.5, 5, 7.5, 10];
const LANTERN_DURATIONS = [12, 14, 13, 15, 13.5];
const LANTERN_SCALES = [0.88, 1.06, 0.92, 1.02, 0.9];
const LANTERN_DRIFT: ("left" | "right")[] = ["left", "right", "left", "right", "left"];
const FIREWORK_POSITIONS = [
  { left: "18%", top: "25%" },
  { left: "72%", top: "30%" },
  { left: "50%", top: "45%" },
  { left: "82%", top: "58%" },
  { left: "28%", top: "62%" },
  { left: "55%", top: "75%" },
];
const FIREWORK_DELAYS = [2, 5.5, 8, 11, 14, 17];
const FIREWORK_SIZES: ("sm" | "default" | "lg")[] = ["default", "sm", "lg", "sm", "default", "sm"];
const FIREWORK_COLORS: ("amber" | "purple" | "green")[] = ["amber", "purple", "green", "amber", "green", "purple"];
const LANTERN_GRADIENTS = [
  "from-amber-400/95 to-amber-600/90",
  "from-orange-400/95 to-orange-600/90",
  "from-red-400/90 to-red-600/85",
  "from-amber-300/95 to-amber-500/90",
  "from-amber-500/95 to-amber-700/90",
];

export interface SkyLanternReplayRef {
  replay: () => void;
}

interface SkyLanternBlessingProps {
  blessingCard: string | undefined;
  sentinelRef: React.RefObject<HTMLElement | null>;
  visible: boolean;
  resultKey?: string | null;
  replayRef?: React.MutableRefObject<SkyLanternReplayRef | null>;
}

export function SkyLanternBlessing({
  blessingCard,
  sentinelRef,
  visible,
  resultKey,
  replayRef,
}: SkyLanternBlessingProps) {
  const [showOverlay, setShowOverlay] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const hasTriggeredRef = useRef(false);
  const lastResultKeyRef = useRef<string | null>(null);
  const autoCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showDelayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const closeOverlay = useCallback(() => {
    setIsExiting(true);
    autoCloseTimerRef.current && clearTimeout(autoCloseTimerRef.current);
    autoCloseTimerRef.current = null;
    setTimeout(() => {
      setShowOverlay(false);
      setIsExiting(false);
    }, 500);
  }, []);

  useEffect(() => {
    if (resultKey !== lastResultKeyRef.current) {
      lastResultKeyRef.current = resultKey ?? null;
      hasTriggeredRef.current = false;
    }
  }, [resultKey]);

  useEffect(() => {
    if (!visible || !blessingCard || !sentinelRef.current) return;

    const sentinel = sentinelRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (hasTriggeredRef.current || !blessingCard) return;

        if (entry.isIntersecting) {
          if (showDelayTimerRef.current) return;
          showDelayTimerRef.current = setTimeout(() => {
            showDelayTimerRef.current = null;
            hasTriggeredRef.current = true;
            setShowOverlay(true);
            autoCloseTimerRef.current = setTimeout(() => {
              closeOverlay();
            }, AUTO_CLOSE_MS);
          }, 2500);
        } else {
          if (showDelayTimerRef.current) {
            clearTimeout(showDelayTimerRef.current);
            showDelayTimerRef.current = null;
          }
        }
      },
      {
        root: null,
        rootMargin: "0px 0px 0px 0px",
        threshold: 1,
      }
    );

    observer.observe(sentinel);
    return () => {
      observer.disconnect();
      showDelayTimerRef.current && clearTimeout(showDelayTimerRef.current);
      autoCloseTimerRef.current && clearTimeout(autoCloseTimerRef.current);
    };
  }, [visible, blessingCard, sentinelRef, closeOverlay]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showOverlay && !isExiting) closeOverlay();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showOverlay, isExiting, closeOverlay]);

  useEffect(() => {
    if (!replayRef) return;
    replayRef.current = {
      replay: () => {
        setShowOverlay(true);
        setIsExiting(false);
        autoCloseTimerRef.current && clearTimeout(autoCloseTimerRef.current);
        autoCloseTimerRef.current = setTimeout(() => closeOverlay(), AUTO_CLOSE_MS);
      },
    };
    return () => {
      replayRef.current = null;
    };
  }, [replayRef, closeOverlay]);

  if (!showOverlay) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="祝福"
      className={`sky-lantern-overlay fixed inset-0 z-50 flex items-center justify-center ${isExiting ? "overlay-exit" : "overlay-enter"}`}
    >
      <button
        type="button"
        className="absolute inset-0 z-0 bg-black/50 backdrop-blur-[2px]"
        aria-hidden
        onClick={closeOverlay}
      />
      <div
        className="sky-lantern-stars absolute inset-0 z-[1] pointer-events-none opacity-60"
        aria-hidden
      />
      {FIREWORK_POSITIONS.map((pos, i) => (
        <div
          key={i}
          className={`firework-burst absolute z-[1] ${FIREWORK_SIZES[i] === "sm" ? "firework-burst--sm" : FIREWORK_SIZES[i] === "lg" ? "firework-burst--lg" : ""} ${FIREWORK_COLORS[i] === "purple" ? "firework-burst--purple" : FIREWORK_COLORS[i] === "green" ? "firework-burst--green" : ""}`}
          style={{
            left: pos.left,
            top: pos.top,
            animationDelay: `${FIREWORK_DELAYS[i]}s`,
          }}
          aria-hidden
        />
      ))}
      <div className="absolute inset-0 z-[2] pointer-events-none overflow-visible">
        {Array.from({ length: LANTERN_COUNT }).map((_, i) => (
          <div
            key={i}
            className={`lantern-rise-item lantern-rise-item--${LANTERN_DRIFT[i]} absolute w-10 h-12 bottom-0 pointer-events-none will-change-transform`}
            style={{
              left: `${LANTERN_POSITIONS[i]}%`,
              animationDelay: `${LANTERN_DELAYS[i]}s`,
              animationDuration: `${LANTERN_DURATIONS[i]}s`,
            }}
          >
            <div
              className="absolute inset-0 origin-center"
              style={{ transform: `scale(${LANTERN_SCALES[i]})` }}
            >
              <div
                className={`absolute inset-0 rounded-t-[1.2rem] rounded-b-lg bg-gradient-to-b ${LANTERN_GRADIENTS[i]} shadow-[0_0_20px_8px_rgba(251,191,36,0.35)]`}
                style={{
                  boxShadow: "0 0 24px 10px rgba(251,191,36,0.35), inset 0 0 14px rgba(255,255,255,0.25)",
                }}
              />
              <div
                className="lantern-glow-pulse absolute left-1/2 top-1/2 w-6 h-8 rounded-full bg-amber-200/40 blur-md"
                aria-hidden
              />
              <div
                className="lantern-flame absolute -bottom-1 left-1/2 w-2 h-3 rounded-b-full bg-amber-600/90 origin-bottom"
                aria-hidden
              />
              <div
                className="absolute -top-1 left-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-b-[8px] border-l-transparent border-r-transparent border-b-amber-800/70"
                aria-hidden
              />
            </div>
          </div>
        ))}
      </div>
      <div
        className="relative z-10 mx-4 max-w-md px-6 py-6 rounded-2xl bg-black/60 text-white text-center shadow-xl pointer-events-auto"
        style={{
          animation: "blessing-fade-in 0.6s ease-out 0.9s both",
        }}
      >
        <p className="text-lg md:text-xl leading-relaxed whitespace-pre-wrap font-serif">
          {blessingCard}
        </p>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 z-20 text-white hover:bg-white/20 rounded-full"
        onClick={closeOverlay}
        aria-label="關閉"
      >
        <X className="h-5 w-5" />
      </Button>
    </div>
  );
}
