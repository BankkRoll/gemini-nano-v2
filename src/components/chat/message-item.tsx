"use client";

import { MarkdownRenderer } from "@/components/markdown-renderer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/types";
import { memo } from "react";

function MessageItemBase({ m }: { m: ChatMessage }) {
  const isAssistant = m.role === "assistant";

  return (
    <div
      className={cn(
        "flex w-full gap-3",
        isAssistant ? "justify-start" : "justify-end",
      )}
    >
      {isAssistant && (
        <Avatar className="size-8 flex-shrink-0">
          <AvatarImage src="/google_deepmind.png" alt="NANO" />
          <AvatarFallback>N</AvatarFallback>
        </Avatar>
      )}

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
            "mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wider",
            isAssistant ? "text-foreground" : "text-foreground",
            isAssistant ? "justify-start" : "justify-end",
          )}
        >
          <span>{isAssistant ? "NANO" : m.userName || "User"}</span>
          {m.createdAt ? (
            <span className="normal-case tracking-normal text-muted-foreground">
              {new Date(m.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          ) : null}
        </div>
        <div className="prose prose-sm w-full break-words overflow-hidden">
          {isAssistant ? (
            <MarkdownRenderer content={m.content} />
          ) : (
            <div className="text-right">{m.content}</div>
          )}
        </div>
      </div>

      {!isAssistant && (
        <Avatar className="size-8 flex-shrink-0">
          <AvatarImage
            src={m.userAvatarUrl || "/logo.svg"}
            alt={m.userName || "User"}
          />
          <AvatarFallback>
            {m.userName?.[0]?.toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}

export const MessageItem = memo(MessageItemBase);
