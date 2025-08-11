"use client";

import { cn } from "@/lib/utils";

export function ThinkingAnimation() {
  return (
    <div className="flex items-center space-x-3">
      <div className="flex space-x-1">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-2.5 w-2.5 rounded-full bg-gradient-to-r from-primary/80 to-primary/40",
              "animate-pulse shadow-sm",
            )}
            style={{
              animationDelay: `${i * 0.15}s`,
              animationDuration: "1.2s",
              animationTimingFunction: "ease-in-out",
            }}
          />
        ))}
      </div>
      <div className="flex items-center space-x-1">
        <span className="text-xs text-muted-foreground font-medium tracking-wide">
          Thinking
        </span>
        <span className="text-xs text-muted-foreground/60 animate-pulse">
          ...
        </span>
      </div>
    </div>
  );
}
