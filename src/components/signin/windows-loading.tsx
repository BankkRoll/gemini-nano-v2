"use client";

import { cn } from "@/lib/utils";

export type WindowsLoadingBarProps = {
  totalBlocks?: number;
  filledBlocks: number;
  className?: string;
  blockClassName?: string;
};

export function WindowsLoadingBar({
  totalBlocks = 50,
  filledBlocks = 0,
  className,
  blockClassName,
}: WindowsLoadingBarProps) {
  const count = Math.max(0, Math.min(totalBlocks, filledBlocks));
  const items = Array.from({ length: totalBlocks });
  return (
    <div className={cn("w-full bg-muted border border-border flex", className)}>
      {items.map((_, i) => (
        <div
          key={i}
          className={cn(
            "h-full border-r border-muted flex-1 transition-all duration-200 ease-out",
            i < count ? "bg-primary opacity-100" : "bg-transparent opacity-30",
            blockClassName,
          )}
        />
      ))}
    </div>
  );
}
