"use client";

import type React from "react";

import { useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

export function AutoScrollArea({
  children,
  dependencyKey,
}: {
  children: React.ReactNode;
  dependencyKey: string | number;
}) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const viewport = root.querySelector(
      "[data-radix-scroll-area-viewport]",
    ) as HTMLElement | null;
    if (viewport) {
      viewport.scrollTop = viewport.scrollHeight;
    }
  }, [dependencyKey]);

  return (
    <div ref={rootRef} className="h-full">
      <ScrollArea className="h-full">{children}</ScrollArea>
    </div>
  );
}
