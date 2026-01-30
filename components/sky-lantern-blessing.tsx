"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

const AUTO_CLOSE_MS = 15000;

const LANTERN_COUNT = 5;
const LANTERN_POSITIONS = [20, 40, 55, 72, 88];
const LANTERN_DELAYS = [0, 2.5, 5, 7.5, 10];
const LANTERN_DURATIONS = [12, 14, 13, 15, 13.5];
const LANTERN_SCALES = [0.96, 1.1, 0.98, 1.06, 0.94];
const LANTERN_DRIFT: ("left" | "right")[] = ["left", "right", "left", "right", "left"];
/* 開場煙火：動畫一開始就放（0s、0.2s、0.5s） */
const OPENING_FIREWORK_POSITIONS = [
  { left: "50%", top: "35%" },
  { left: "28%", top: "40%" },
  { left: "72%", top: "42%" },
];
const OPENING_FIREWORK_DELAYS = [0, 0.2, 0.5];
const OPENING_FIREWORK_SIZES: ("sm" | "default" | "lg")[] = ["lg", "default", "default"];
const OPENING_FIREWORK_COLORS: ("amber" | "purple" | "green")[] = ["amber", "amber", "amber"];

/* 後續煙火：分散在 2s～17s */
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

/* 鞭炮串：底部一排小火花，依序爆開 */
const FIRECRACKER_COUNT = 9;
const FIRECRACKER_BOTTOM_PERCENT = 12;

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
      {/* 開場煙火：動畫一開始就放 */}
      {OPENING_FIREWORK_POSITIONS.map((pos, i) => (
        <div
          key={`opening-${i}`}
          className={`firework-burst absolute z-[1] ${OPENING_FIREWORK_SIZES[i] === "sm" ? "firework-burst--sm" : OPENING_FIREWORK_SIZES[i] === "lg" ? "firework-burst--lg" : ""} ${OPENING_FIREWORK_COLORS[i] === "purple" ? "firework-burst--purple" : OPENING_FIREWORK_COLORS[i] === "green" ? "firework-burst--green" : ""}`}
          style={{
            left: pos.left,
            top: pos.top,
            animationDelay: `${OPENING_FIREWORK_DELAYS[i]}s`,
          }}
          aria-hidden
        />
      ))}
      {/* 鞭炮串：底部依序爆開 */}
      <div
        className="firecracker-string absolute left-0 right-0 z-[1] pointer-events-none"
        style={{ bottom: `${FIRECRACKER_BOTTOM_PERCENT}%` }}
        aria-hidden
      >
        {Array.from({ length: FIRECRACKER_COUNT }).map((_, i) => (
          <div
            key={i}
            className="firecracker-dot absolute"
            style={{
              left: `${(i + 1) * (100 / (FIRECRACKER_COUNT + 1))}%`,
              animationDelay: `${i * 0.06}s`,
            }}
          />
        ))}
      </div>
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
            className={`lantern-rise-item lantern-rise-item--${LANTERN_DRIFT[i]} absolute w-12 bottom-0 pointer-events-none will-change-transform`}
            style={{
              left: `${LANTERN_POSITIONS[i]}%`,
              height: "64px",
              animationDelay: `${LANTERN_DELAYS[i]}s`,
              animationDuration: `${LANTERN_DURATIONS[i]}s`,
            }}
          >
            <div
              className="absolute bottom-0 left-1/2 origin-bottom"
              style={{ transform: `translateX(-50%) scale(${LANTERN_SCALES[i]})` }}
            >
              <div className="sky-lantern-wrap">
                <div className="sky-lantern-inner-sway">
                  <div className="sky-lantern-outer-glow" aria-hidden />
                  <div className="sky-lantern-top" aria-hidden />
                  <div className="sky-lantern-bottom" aria-hidden />
                  <div className="sky-lantern-base" aria-hidden />
                  <div className="sky-lantern-inner-glow" aria-hidden />
                  <div className="sky-lantern-flame-container" aria-hidden>
                    <div className="sky-lantern-flame" />
                    <div className="sky-lantern-flame-glow" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div
        className="relative z-10 mx-4 max-w-md px-8 py-6 rounded-2xl bg-black/60 text-white text-center shadow-xl pointer-events-auto"
        style={{
          animation: "blessing-fade-in 0.6s ease-out 0.9s both",
        }}
      >
        <p className="text-lg md:text-xl leading-relaxed whitespace-pre-wrap font-serif">
          {blessingCard?.replace(/，/g, "，\n") ?? ""}
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
