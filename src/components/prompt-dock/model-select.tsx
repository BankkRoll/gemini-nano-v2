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
import { useAppStore } from "@/store/app-store";
import type { ModelId, Tool } from "@/types";
import { Sparkles } from "lucide-react";
import { memo, useMemo } from "react";

export type ModelOption = { id: ModelId; label: string; capabilities: Tool[] };

const OPTIONS: ModelOption[] = [
  {
    id: "auto",
    label: "Gemini Nano · Auto",
    capabilities: [
      "prompt",
      "summarize",
      "translate",
      "detect",
      "write",
      "rewrite",
      "proofread",
    ],
  },
  {
    id: "text",
    label: "Gemini Nano · text",
    capabilities: [
      "prompt",
      "summarize",
      "translate",
      "detect",
      "write",
      "rewrite",
      "proofread",
    ],
  },
  { id: "generic", label: "Gemini Nano · generic", capabilities: ["prompt"] },
];

function ModelSelectBase() {
  const conversations = useAppStore((s) => s.conversations);
  const activeId = useAppStore((s) => s.activeId);
  const pendingModel = useAppStore((s: any) => (s as any).pendingModel);
  const setActiveModel = useAppStore((s) => s.setActiveModel);
  const currentModelId = useMemo(
    () =>
      conversations.find((c) => c.id === activeId)?.model ??
      pendingModel ??
      "auto",
    [conversations, activeId, pendingModel],
  );
  const current = useMemo(
    () => OPTIONS.find((o) => o.id === currentModelId) ?? OPTIONS[0],
    [currentModelId],
  );
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="sm"
          variant="secondary"
          className="h-7 gap-2 px-2 border shadow-sm"
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span className="max-sm:hidden">{current.label}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel>Model</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {OPTIONS.map((opt) => (
          <DropdownMenuItem
            key={opt.id}
            onClick={() => setActiveModel(opt.id as ModelId)}
          >
            {opt.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export const ModelSelect = memo(ModelSelectBase);
