"use client";

import { StatusDot } from "@/components/chat/status-badge";
import {
  ModelSelect,
  type ModelOption as ModelSelectOption,
} from "@/components/prompt-dock/model-select";
import { SendControls } from "@/components/prompt-dock/send-controls";
import { ToolSelect } from "@/components/prompt-dock/tool-select";
import { TranslateSelect } from "@/components/prompt-dock/translate-select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { Availability, ModelId, Tool } from "@/types";
import { ArrowUp, GripVertical, Pencil, Settings, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import React, { useEffect, useMemo, useRef, useState } from "react";

type ModelOption = { id: ModelId; label: string; capabilities: Tool[] };

const MODEL_OPTIONS: ModelOption[] = [
  {
    id: "auto",
    label: "Gemini Nano · Auto",
    capabilities: [
      "chat",
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
      "chat",
      "summarize",
      "translate",
      "detect",
      "write",
      "rewrite",
      "proofread",
    ],
  },
  { id: "generic", label: "Gemini Nano · generic", capabilities: ["chat"] },
];

const TOOL_OPTIONS: { id: Tool; label: string }[] = [
  { id: "chat", label: "Chat" },
  { id: "summarize", label: "Summarizer" },
  { id: "translate", label: "Translator" },
  { id: "detect", label: "Language Detector" },
  { id: "write", label: "Writer" },
  { id: "rewrite", label: "Rewriter" },
  { id: "proofread", label: "Proofreader" },
];

type Props = {
  value?: string;
  setValue?: (v: string) => void;
  tool: Tool;
  setTool: (t: Tool) => void;
  model: ModelId;
  setModel: (m: ModelId) => void;
  targetLang: string;
  setTargetLang: (v: string) => void;
  onSend: (text: string) => void;
  onStop: () => void;
  busy?: boolean;
  thinking?: boolean;
  onOpenSettings: () => void;
  promptStatus: Availability;
  summarizerStatus?: Availability;
  translatorStatus?: Availability;
  detectorStatus?: Availability;
  writerStatus?: Availability;
  rewriterStatus?: Availability;
  proofreaderStatus?: Availability;
  mode: "center" | "bottom";
};

export const PromptDock = React.memo(function PromptDock({
  value,
  setValue,
  tool = "chat",
  setTool = () => {},
  model = "auto",
  setModel = () => {},
  targetLang = "en",
  setTargetLang = () => {},
  onSend,
  onStop = () => {},
  busy = false,
  thinking = false,
  onOpenSettings = () => {},
  promptStatus = "unavailable",
  summarizerStatus = "unavailable",
  translatorStatus = "unavailable",
  detectorStatus = "unavailable",
  writerStatus = "unavailable",
  rewriterStatus = "unavailable",
  proofreaderStatus = "unavailable",
  mode = "bottom",
}: Props) {
  const [internalValue, setInternalValue] = useState<string>(value ?? "");
  const isControlled =
    typeof value === "string" && typeof setValue === "function";
  const inputValue = isControlled ? (value as string) : internalValue;
  const updateValue = isControlled
    ? (setValue as (v: string) => void)
    : setInternalValue;
  type QueuedItem = { id: string; text: string };
  const [queuedItems, setQueuedItems] = useState<QueuedItem[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const prevBusyRef = useRef<boolean>(busy);
  const dragIdRef = useRef<string | null>(null);
  const forceSendTargetRef = useRef<string | null>(null);

  const handleSend = () => {
    const text = (inputValue ?? "").trim();
    if (!text) return;
    if (busy) {
      setQueuedItems((prev) => [...prev, { id: crypto.randomUUID(), text }]);
      updateValue("");
      return;
    }
    onSend(text);
    if (!isControlled) setInternalValue("");
  };
  const currentModel = useMemo(
    () => MODEL_OPTIONS.find((m) => m.id === model) ?? MODEL_OPTIONS[0],
    [model],
  ) as ModelSelectOption;
  const allowedTools = currentModel.capabilities;
  const statusForTool = (t: Tool): Availability => {
    switch (t) {
      case "chat":
        return promptStatus;
      case "summarize":
        return summarizerStatus;
      case "translate":
        return translatorStatus;
      case "detect":
        return detectorStatus;
      case "write":
        return writerStatus;
      case "rewrite":
        return rewriterStatus;
      case "proofread":
        return proofreaderStatus;
      default:
        return "unavailable";
    }
  };
  const disabledByModel = (t: Tool) =>
    !allowedTools.includes(t) || statusForTool(t) !== "available";

  useEffect(() => {
    const wasBusy = prevBusyRef.current;
    if (wasBusy && !busy) {
      const forcedId = forceSendTargetRef.current;
      if (forcedId) {
        const idx = queuedItems.findIndex((q) => q.id === forcedId);
        if (idx !== -1) {
          const item = queuedItems[idx];
          setQueuedItems((prev) => prev.filter((q) => q.id !== forcedId));
          onSend(item.text);
          forceSendTargetRef.current = null;
          prevBusyRef.current = busy;
          return;
        }
        forceSendTargetRef.current = null;
      }
      if (queuedItems.length > 0) {
        const next = queuedItems[0];
        setQueuedItems((prev) => prev.slice(1));
        onSend(next.text);
      }
    }
    prevBusyRef.current = busy;
  }, [busy, queuedItems, onSend]);

  const handleEditQueued = (id: string) => {
    const item = queuedItems.find((q) => q.id === id);
    if (!item) return;
    updateValue(item.text);
    setQueuedItems((prev) => prev.filter((q) => q.id !== id));
    requestAnimationFrame(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
      } else {
        const el = document.querySelector<HTMLTextAreaElement>(
          'textarea[data-slot="textarea"]',
        );
        el?.focus();
      }
    });
  };

  const handleDeleteQueued = (id: string) => {
    setQueuedItems((prev) => prev.filter((q) => q.id !== id));
  };

  const handleForceSendQueued = (id: string) => {
    if (thinking) return;
    const index = queuedItems.findIndex((q) => q.id === id);
    if (index === -1) return;
    if (!busy) {
      const toSend = queuedItems[index];
      setQueuedItems((prev) => prev.filter((q) => q.id !== id));
      onSend(toSend.text);
      return;
    }
    forceSendTargetRef.current = id;
    try {
      onStop();
    } catch {
      // Ignore AbortError or any sync errors from stop
    }
  };

  function moveItem<T>(arr: T[], from: number, to: number): T[] {
    const copy = [...arr];
    const [item] = copy.splice(from, 1);
    copy.splice(to, 0, item);
    return copy;
  }
  const handleDragStart =
    (id: string) => (e: React.DragEvent<HTMLDivElement>) => {
      dragIdRef.current = id;
      e.dataTransfer.effectAllowed = "move";
      try {
        e.dataTransfer.setData("text/plain", id);
      } catch {}
    };
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };
  const handleDropAtIndex =
    (targetIndex: number) => (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const draggedId =
        dragIdRef.current || e.dataTransfer.getData("text/plain");
      if (!draggedId) return;
      const fromIndex = queuedItems.findIndex((q) => q.id === draggedId);
      if (fromIndex === -1 || fromIndex === targetIndex) return;
      setQueuedItems((prev) => moveItem(prev, fromIndex, targetIndex));
      dragIdRef.current = null;
    };

  const handleQueueNext = () => {
    const text = (inputValue ?? "").trim();
    if (!text) return;
    setQueuedItems((prev) => [...prev, { id: crypto.randomUUID(), text }]);
    updateValue("");
  };

  const Panel = (
    <div className="dock-measure relative pointer-events-auto border-2 border-black bg-card shadow-lg">
      <div className="flex items-center justify-between gap-2 px-4 pt-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <StatusDot status={promptStatus} />
          <span className="hidden sm:inline">Built‑in AI</span>
          <span className="uppercase">{tool}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onOpenSettings}>
            <Settings className="mr-2 h-3.5 w-3.5" /> Settings
          </Button>
        </div>
      </div>

      <div className="relative px-4 pb-4 pt-2">
        <div className="pointer-events-none absolute bottom-6 left-6 flex flex-wrap items-center gap-2">
          <div className="pointer-events-auto">
            <ModelSelect
              current={currentModel}
              options={MODEL_OPTIONS as any}
              onChange={setModel}
            />
          </div>

          <div className="pointer-events-auto">
            <ToolSelect
              current={tool}
              options={TOOL_OPTIONS}
              disabledByModel={disabledByModel}
              onChange={setTool}
            />
          </div>

          {tool === "translate" && (
            <div className="pointer-events-auto">
              <TranslateSelect value={targetLang} onChange={setTargetLang} />
            </div>
          )}
        </div>

        <Textarea
          ref={textareaRef}
          value={inputValue}
          onChange={(e) => updateValue(e.target.value)}
          placeholder={
            tool === "chat"
              ? "Ask Nano to help…"
              : tool === "summarize"
                ? "Paste text to summarize…"
                : tool === "translate"
                  ? "Text to translate…"
                  : tool === "detect"
                    ? "Text to detect language…"
                    : tool === "write"
                      ? "Describe what to write…"
                      : tool === "rewrite"
                        ? "Paste text to rewrite…"
                        : "Paste text to proofread…"
          }
          rows={4}
          maxLength={1000}
          className="resize-none max-h-40 overflow-y-auto"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />

        <SendControls
          busy={busy}
          onSend={handleSend}
          onStop={onStop}
          canQueue={busy && Boolean((inputValue ?? "").trim())}
          onQueueNext={handleQueueNext}
        />
      </div>
    </div>
  );

  if (mode === "center") {
    return (
      <motion.div
        className="w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
      >
        {queuedItems.length > 0 && (
          <div className="mb-2 border-2 border-black bg-card px-2 py-2 text-xs shadow-sm">
            <div className="flex items-center justify-between px-1 pb-1">
              <span className="text-muted-foreground">
                Queue ({queuedItems.length})
              </span>
            </div>
            <div className="max-h-40 overflow-auto pr-1">
              {queuedItems.map((q, idx) => (
                <div
                  key={q.id}
                  className="group mb-1 last:mb-0 flex items-center justify-between border bg-background px-2 py-1.5"
                  draggable
                  onDragStart={handleDragStart(q.id)}
                  onDragOver={handleDragOver}
                  onDrop={handleDropAtIndex(idx)}
                >
                  <div className="min-w-0 flex-1 pr-2 flex items-center gap-2">
                    <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="truncate font-medium">{q.text}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => handleEditQueued(q.id)}
                      title="Edit"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => handleDeleteQueued(q.id)}
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-7 w-7"
                      disabled={thinking}
                      onClick={() => handleForceSendQueued(q.id)}
                      title="Send now"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {Panel}
      </motion.div>
    );
  }

  return (
    <motion.div
      className="w-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
    >
      {queuedItems.length > 0 && (
        <div className="border-2 border-black border-b-0 bg-card px-2 py-2 text-xs shadow-sm">
          <div className="flex items-center justify-between px-1 pb-1">
            <span className="text-muted-foreground">
              Queue ({queuedItems.length})
            </span>
          </div>
          <div className="max-h-40 overflow-auto pr-1">
            {queuedItems.map((q, idx) => (
              <div
                key={q.id}
                className="group mb-1 last:mb-0 flex items-center justify-between border bg-background px-2 py-1.5"
                draggable
                onDragStart={handleDragStart(q.id)}
                onDragOver={handleDragOver}
                onDrop={handleDropAtIndex(idx)}
              >
                <div className="min-w-0 flex-1 pr-2 flex items-center gap-2">
                  <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="truncate font-medium">{q.text}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => handleEditQueued(q.id)}
                    title="Edit"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => handleDeleteQueued(q.id)}
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-7 w-7"
                    disabled={thinking}
                    onClick={() => handleForceSendQueued(q.id)}
                    title="Send now"
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {Panel}
    </motion.div>
  );
});
