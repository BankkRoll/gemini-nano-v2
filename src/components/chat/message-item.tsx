"use client";

import { MarkdownRenderer } from "@/components/markdown-renderer";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/types";
import { memo } from "react";

function MessageItemBase({ m }: { m: ChatMessage }) {
  const isAssistant = m.role === "assistant";

  return (
    <div
      className={cn(
        "flex w-full",
        isAssistant ? "justify-start" : "justify-end",
      )}
    >
      <div
        className={cn(
          "border p-3 rounded-lg w-full sm:max-w-[85%] max-w-full",
          isAssistant
            ? "bg-muted/30 border-border/50"
            : "bg-card/30 border-border/60",
        )}
      >
        <div
          className={cn(
            "mb-2 text-xs font-medium uppercase tracking-wider",
            isAssistant
              ? "text-muted-foreground"
              : "text-foreground text-right",
          )}
        >
          {m.role}
        </div>
        <div className="prose prose-sm w-full break-words overflow-hidden">
          <MarkdownRenderer content={m.content} />
        </div>
      </div>
    </div>
  );
}

export const MessageItem = memo(MessageItemBase);
