"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslations } from "@/context/locale";
import { cn } from "@/lib/utils";

interface SkyLanternAnimationProps {
  blessing: string;
  onClose: () => void;
  isVisible: boolean;
}

const BACKGROUND_LANTERNS = [
  { size: "sm" as const, delay: 0.8, duration: 14, startX: 18 },
  { size: "sm" as const, delay: 1.5, duration: 16, startX: 78 },
  { size: "sm" as const, delay: 2.2, duration: 13, startX: 35 },
  { size: "sm" as const, delay: 2.8, duration: 15, startX: 88 },
  { size: "sm" as const, delay: 3.5, duration: 14, startX: 8 },
  { size: "sm" as const, delay: 4.2, duration: 17, startX: 62 },
];

function SingleLantern({
  size,
  delay,
  duration,
  startX,
  blessingSnippet,
}: {
  size: "sm" | "md" | "lg";
  delay: number;
  duration: number;
  startX: number;
  blessingSnippet?: string;
}) {
  const sizeClass =
    size === "sm"
      ? "sky-lantern-item--sm"
      : size === "md"
        ? "sky-lantern-item--md"
        : "sky-lantern-item--lg";
  const isCenter = startX === 50;

  const item = (
    <div
      className={cn("sky-lantern-item", sizeClass)}
      style={{
        left: isCenter ? 0 : undefined,
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
      }}
    >
      <div
        className="sky-lantern-sway"
        style={{ animationDelay: `${delay * 0.5}s` }}
      >
        <div className="sky-lantern-body">
          <div className="sky-lantern-outer-glow" />
          <div className="sky-lantern-top" />
          <div className="sky-lantern-bottom" />
          <div className="sky-lantern-base" />
          <div className="sky-lantern-inner-glow" />
          <div className="sky-lantern-flame-container">
            <div className="sky-lantern-flame" />
            <div className="sky-lantern-flame-glow" />
          </div>
          {blessingSnippet && (
            <div className="sky-lantern-item-blessing">
              {blessingSnippet.slice(0, 4)}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (isCenter) {
    const wrapperWidth = size === "lg" ? 112 : size === "md" ? 80 : 48;
    return (
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2"
        style={{ width: wrapperWidth, animation: "none" }}
      >
        {item}
      </div>
    );
  }
  return (
    <div
      className="absolute bottom-0"
      style={{ left: `${startX}%` }}
    >
      {item}
    </div>
  );
}

export function SkyLanternAnimation({
  blessing,
  onClose,
  isVisible,
}: SkyLanternAnimationProps) {
  const t = useTranslations();
  const [showContent, setShowContent] = useState(false);
  const [exiting, setExiting] = useState(false);
  const visible = isVisible && !exiting;

  useEffect(() => {
    if (isVisible) {
      setExiting(false);
      const id = setTimeout(() => setShowContent(true), 500);
      return () => clearTimeout(id);
    }
    setShowContent(false);
  }, [isVisible]);

  const handleClose = useCallback(() => {
    setExiting(true);
  }, []);

  useEffect(() => {
    if (!exiting) return;
    const id = setTimeout(() => onClose(), 700);
    return () => clearTimeout(id);
  }, [exiting, onClose]);

  return (
    <div
      className={cn(
        "sky-lantern-container",
        visible && "sky-lantern-visible"
      )}
      aria-hidden={!visible}
    >
      <div className="sky-lantern-night-sky">
        <div className="sky-lantern-stars" />
      </div>

      <div
        className={cn(
          "sky-lantern-blessing-text",
          showContent && "sky-lantern-blessing-show"
        )}
      >
        <p className="sky-lantern-blessing-subtitle">{t("lantern.subtitle")}</p>
        <p className="sky-lantern-blessing-main">{blessing}</p>
      </div>

      <div className="sky-lanterns-wrapper">
        <SingleLantern
          size="lg"
          delay={0}
          duration={12}
          startX={50}
          blessingSnippet={blessing}
        />
        {BACKGROUND_LANTERNS.map((config, i) => (
          <SingleLantern
            key={i}
            size={config.size}
            delay={config.delay}
            duration={config.duration}
            startX={config.startX}
          />
        ))}
      </div>

      <button
        type="button"
        className="sky-lantern-close-btn"
        onClick={handleClose}
        aria-label={t("lantern.close")}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}
