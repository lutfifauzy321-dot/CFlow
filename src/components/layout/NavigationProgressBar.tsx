"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function NavigationProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startProgress = useCallback(() => {
    setVisible(true);
    setProgress(25);

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 85) {
          if (timerRef.current) clearInterval(timerRef.current);
          return prev;
        }
        return prev + Math.floor(Math.random() * 12) + 5;
      });
    }, 120);
  }, []);

  // Complete and hide progress when route or searchParams change
  useEffect(() => {
    if (!visible) return;

    setProgress(100);
    const fadeTimer = setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 200);

    return () => clearTimeout(fadeTimer);
  }, [pathname, searchParams, visible]);

  // Listen to custom navigation events (like MonthPicker changes)
  useEffect(() => {
    window.addEventListener("app:navigation-start", startProgress);
    return () => {
      window.removeEventListener("app:navigation-start", startProgress);
    };
  }, [startProgress]);

  // Intercept internal navigation clicks to start progress bar instantly (0ms feedback)
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const anchor = (e.target as HTMLElement).closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href) return;

      // Skip external links, anchors, new tabs, modifier clicks
      if (
        href.startsWith("http") ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        anchor.target === "_blank" ||
        e.ctrlKey ||
        e.metaKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return;
      }

      const currentPath = window.location.pathname + window.location.search;
      if (href === currentPath) return;

      startProgress();
    }

    document.addEventListener("click", handleClick, { capture: true });
    return () => {
      document.removeEventListener("click", handleClick, { capture: true });
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startProgress]);

  if (!visible && progress === 0) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-50 h-[2.5px] bg-transparent"
    >
      <div
        className="h-full bg-primary shadow-[0_0_10px_var(--color-primary)] transition-all duration-200 ease-out"
        style={{
          width: `${progress}%`,
          opacity: visible ? 1 : 0,
        }}
      />
    </div>
  );
}
