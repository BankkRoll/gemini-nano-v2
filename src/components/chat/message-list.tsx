"use client";

import { MessageItem } from "@/components/chat/message-item";
import { ThinkingAnimation } from "@/components/chat/thinking-animation";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/types";

export function MessageList({ messages = [] as ChatMessage[], busy = false }) {
  if (!messages.length) return null;
  return (
    <div className="space-y-4">
      {messages.map((m, idx) => {
        const isLast = idx === messages.length - 1;
        const isAssistant = m.role === "assistant";
        const isWaitingForFirstToken = isAssistant && !m.content;
        const isStreaming = isAssistant && isLast && busy && !!m.content;
        if (isWaitingForFirstToken) {
          return (
            <div key={m.id} className={cn("border p-3 bg-muted/30")}>
              <div className="mb-1 text-xs text-muted-foreground">
                assistant
              </div>
              <ThinkingAnimation />
            </div>
          );
        }
        return <MessageItem key={m.id} m={m} isStreaming={isStreaming} />;
      })}
    </div>
  );
}
