"use client";

import { useCallback, useEffect, useRef } from "react";

export function useAutoScroll<T extends HTMLElement>(
  deps: any[] = [],
  options?: { behavior?: ScrollBehavior; bottomThresholdPx?: number },
) {
  const containerRef = useRef<T | null>(null);
  const shouldStickToBottomRef = useRef(true);

  const scrollToBottom = useCallback(
    (smooth = false) => {
      const root = containerRef.current;
      if (!root) return;
      const viewport = root.querySelector(
        "[data-radix-scroll-area-viewport]",
      ) as HTMLElement | null;
      if (!viewport) return;

      const behavior: ScrollBehavior = smooth
        ? "smooth"
        : options?.behavior ?? "auto";
      requestAnimationFrame(() => {
        viewport.scrollTo({ top: viewport.scrollHeight, behavior });
      });
    },
    [options?.behavior],
  );

  useEffect(() => {
    if (shouldStickToBottomRef.current) {
      scrollToBottom();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;
    const viewport = root.querySelector(
      "[data-radix-scroll-area-viewport]",
    ) as HTMLElement | null;
    if (!viewport) return;

    const threshold = options?.bottomThresholdPx ?? 64;

    const updateStickiness = () => {
      const distanceFromBottom =
        viewport.scrollHeight - (viewport.scrollTop + viewport.clientHeight);
      shouldStickToBottomRef.current = distanceFromBottom <= threshold;
    };

    updateStickiness();

    viewport.addEventListener("scroll", updateStickiness, { passive: true });
    return () => viewport.removeEventListener("scroll", updateStickiness);
  }, [options?.bottomThresholdPx]);

  return { containerRef, scrollToBottom };
}
