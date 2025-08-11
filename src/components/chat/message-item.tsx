"use client";

import { AssistantMessage } from "@/components/chat/assistant-message";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/types";
import { memo } from "react";

function MessageItemBase({
  m,
  isStreaming = false,
}: {
  m: ChatMessage;
  isStreaming?: boolean;
}) {
  return (
    <div
      className={cn("border p-3", m.role === "assistant" ? "bg-muted/30" : "")}
    >
      <div className="mb-1 text-xs text-muted-foreground">{m.role}</div>
      <div className="whitespace-pre-wrap text-sm">
        {m.role === "assistant" ? (
          <AssistantMessage content={m.content} />
        ) : (
          <MarkdownRenderer content={m.content} />
        )}
      </div>
    </div>
  );
}

export const MessageItem = memo(MessageItemBase);
