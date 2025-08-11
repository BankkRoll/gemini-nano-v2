"use client";

import { MessageItem } from "@/components/chat/message-item";
import { ThinkingAnimation } from "@/components/chat/thinking-animation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/types";

export function MessageList({ messages = [] as ChatMessage[], busy = false }) {
  if (!messages.length) return null;
  return (
    <div className="space-y-4 w-full">
      {messages.map((m, idx) => {
        const isAssistant = m.role === "assistant";
        const isWaitingForFirstToken = isAssistant && !m.content;
        if (isWaitingForFirstToken) {
          return (
            <div key={m.id} className={cn("flex gap-3 w-full", "")}>
              <Avatar className="size-8 flex-shrink-0">
                <AvatarImage src="/google_deepmind.png" alt="NANO" />
                <AvatarFallback>N</AvatarFallback>
              </Avatar>
              <div className="border p-3 bg-muted/30 rounded-lg w-full sm:max-w-[85%]">
                <div className="mb-1 text-xs uppercase text-foreground">
                  NANO
                </div>
                <ThinkingAnimation />
              </div>
            </div>
          );
        }
        return <MessageItem key={m.id} m={m} />;
      })}
    </div>
  );
}
