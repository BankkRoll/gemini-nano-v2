"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import type { Tool } from "@/types";
import { PenTool } from "lucide-react";
import { memo, useMemo } from "react";

type ToolOption = { id: Tool; label: string };

const OPTIONS: ToolOption[] = [
  { id: "chat", label: "Chat" },
  { id: "summarize", label: "Summarizer" },
  { id: "translate", label: "Translator" },
  { id: "detect", label: "Language Detector" },
  { id: "write", label: "Writer" },
  { id: "rewrite", label: "Rewriter" },
  { id: "proofread", label: "Proofreader" },
];

function ToolSelectBase() {
  const conversations = useAppStore((s) => s.conversations);
  const activeId = useAppStore((s) => s.activeId);
  const pendingTool = useAppStore((s: any) => (s as any).pendingTool);
  const setActiveTool = useAppStore((s) => s.setActiveTool);
  const promptStatus = useAppStore((s) => s.promptStatus);
  const summarizerStatus = useAppStore((s) => s.summarizerStatus);
  const translatorStatus = useAppStore((s) => s.translatorStatus);
  const detectorStatus = useAppStore((s) => s.detectorStatus);
  const writerStatus = useAppStore((s) => s.writerStatus);
  const rewriterStatus = useAppStore((s) => s.rewriterStatus);
  const proofreaderStatus = useAppStore((s) => s.proofreaderStatus);
  const currentTool = useMemo(() => {
    const active = conversations.find((c) => c.id === activeId)?.tool;
    return active ?? pendingTool ?? "chat";
  }, [conversations, activeId, pendingTool]);
  const disabledByModel = (t: Tool) => {
    switch (t) {
      case "chat":
        return promptStatus !== "available";
      case "summarize":
        return summarizerStatus !== "available";
      case "translate":
        return translatorStatus !== "available";
      case "detect":
        return detectorStatus !== "available";
      case "write":
        return writerStatus !== "available";
      case "rewrite":
        return rewriterStatus !== "available";
      case "proofread":
        return proofreaderStatus !== "available";
      default:
        return true;
    }
  };
  const currentLabel =
    OPTIONS.find((x) => x.id === currentTool)?.label ?? currentTool;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="sm"
          variant="secondary"
          className="h-7 gap-2 px-2  border shadow-sm"
        >
          <PenTool className="h-3.5 w-3.5" />
          <span className="max-sm:hidden">{currentLabel}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel>Tool</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {OPTIONS.map((opt) => {
          const disabled = disabledByModel(opt.id);
          return (
            <DropdownMenuItem
              key={opt.id}
              onClick={() => !disabled && setActiveTool(opt.id)}
              className={cn(disabled && "pointer-events-none opacity-40")}
            >
              {opt.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export const ToolSelect = memo(ToolSelectBase);
