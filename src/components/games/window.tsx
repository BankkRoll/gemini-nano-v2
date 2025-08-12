"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Maximize2, Minus, Square, X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

type Vec2 = { x: number; y: number };
type Size = { width: number; height: number };

export function Win98Window({
  title,
  initialPosition = { x: 40, y: 40 },
  initialSize = { width: 480, height: 360 },
  resizable = true,
  movable = true,
  minSize = { width: 320, height: 220 },
  maxSize,
  onClose,
  onMinimize,
  onMaximizeChange,
  className,
  children,
}: {
  title: string;
  initialPosition?: Vec2;
  initialSize?: Size;
  resizable?: boolean;
  movable?: boolean;
  minSize?: Size;
  maxSize?: Size;
  onClose?: () => void;
  onMinimize?: () => void;
  onMaximizeChange?: (isMaximized: boolean) => void;
  className?: string;
  children?: React.ReactNode;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef<{ start: Vec2; origin: Vec2 } | null>(null);
  const resizingRef = useRef<null | {
    start: Vec2;
    originSize: Size;
    originPos: Vec2;
    edge: "right" | "bottom" | "corner";
  }>(null);
  const [pos, setPos] = useState<Vec2>(initialPosition);
  const [size, setSize] = useState<Size>(initialSize);
  const [isMaximized, setIsMaximized] = useState<boolean>(false);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const d = draggingRef.current;
      const r = resizingRef.current;
      if (d && movable && !isMaximized) {
        const dx = e.clientX - d.start.x;
        const dy = e.clientY - d.start.y;
        const next = { x: d.origin.x + dx, y: d.origin.y + dy };
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const clamped = {
          x: Math.min(Math.max(0, next.x), Math.max(0, vw - size.width)),
          y: Math.min(Math.max(0, next.y), Math.max(0, vh - size.height)),
        };
        setPos(clamped);
        return;
      }
      if (r && resizable && !isMaximized) {
        const dx = e.clientX - r.start.x;
        const dy = e.clientY - r.start.y;
        let nextWidth = r.originSize.width;
        let nextHeight = r.originSize.height;
        if (r.edge === "right" || r.edge === "corner")
          nextWidth = r.originSize.width + dx;
        if (r.edge === "bottom" || r.edge === "corner")
          nextHeight = r.originSize.height + dy;
        const maxW = maxSize?.width ?? window.innerWidth;
        const maxH = maxSize?.height ?? window.innerHeight;
        nextWidth = Math.min(Math.max(minSize.width, nextWidth), maxW);
        nextHeight = Math.min(Math.max(minSize.height, nextHeight), maxH);
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const clampedPos = {
          x: Math.min(Math.max(0, r.originPos.x), Math.max(0, vw - nextWidth)),
          y: Math.min(Math.max(0, r.originPos.y), Math.max(0, vh - nextHeight)),
        };
        setPos(clampedPos);
        setSize({ width: nextWidth, height: nextHeight });
        return;
      }
    };
    const onUp = () => {
      draggingRef.current = null;
      resizingRef.current = null;
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [
    movable,
    resizable,
    isMaximized,
    size.width,
    size.height,
    minSize.width,
    minSize.height,
    maxSize?.width,
    maxSize?.height,
  ]);

  const onDragStart = (e: React.MouseEvent) => {
    if (!movable || isMaximized) return;
    draggingRef.current = {
      start: { x: e.clientX, y: e.clientY },
      origin: pos,
    };
  };

  const toggleMaximize = () => {
    setIsMaximized((prev) => {
      const next = !prev;
      onMaximizeChange?.(next);
      return next;
    });
  };

  const startResize =
    (edge: "right" | "bottom" | "corner") => (e: React.MouseEvent) => {
      if (!resizable || isMaximized) return;
      e.preventDefault();
      e.stopPropagation();
      resizingRef.current = {
        start: { x: e.clientX, y: e.clientY },
        originSize: size,
        originPos: pos,
        edge,
      };
    };

  return (
    <div
      ref={containerRef}
      className={cn(
        "fixed z-50 border-2 border-foreground bg-card shadow-2xl flex flex-col overflow-hidden select-none",
        className,
      )}
      style={
        isMaximized
          ? {
              left: 0,
              top: 0,
              width: window.innerWidth,
              height: window.innerHeight,
            }
          : { left: pos.x, top: pos.y, width: size.width, height: size.height }
      }
    >
      <div
        className={cn(
          "flex items-center justify-between gap-2 px-2 py-1 bg-primary text-primary-foreground border-b-2 border-foreground",
          movable && !isMaximized ? "cursor-move" : "cursor-default",
        )}
        onMouseDown={onDragStart}
        onDoubleClick={toggleMaximize}
      >
        <div className="text-xs font-semibold truncate">{title}</div>
        <div className="flex items-center gap-1">
          {resizable && (
            <Button
              size="icon"
              variant="secondary"
              className="h-6 w-6 border-2 border-foreground shadow-sm"
              onClick={toggleMaximize}
              title={isMaximized ? "Restore" : "Maximize"}
            >
              {isMaximized ? (
                <Square className="h-3.5 w-3.5" />
              ) : (
                <Maximize2 className="h-3.5 w-3.5" />
              )}
            </Button>
          )}
          <Button
            size="icon"
            variant="secondary"
            className="h-6 w-6 border-2 border-foreground shadow-sm"
            onClick={() => onMinimize?.()}
            title="Minimize"
          >
            <Minus className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="h-6 w-6 border-2 border-foreground shadow-sm"
            onClick={() => onClose?.()}
            title="Close"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-2">{children}</div>

      {resizable && !isMaximized && (
        <>
          <div
            className="absolute right-0 bottom-0 w-3 h-3 cursor-nwse-resize"
            onMouseDown={startResize("corner")}
          />
          <div
            className="absolute right-0 top-0 bottom-3 w-2 cursor-ew-resize"
            onMouseDown={startResize("right")}
          />
          <div
            className="absolute bottom-0 left-0 right-3 h-2 cursor-ns-resize"
            onMouseDown={startResize("bottom")}
          />
        </>
      )}
    </div>
  );
}

export default Win98Window;
