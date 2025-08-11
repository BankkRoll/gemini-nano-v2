"use client";

import { MessageList } from "@/components/chat/message-list";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAutoScroll } from "@/hooks/use-auto-scroll";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/types";

export function ChatFeed({
  messages,
  className = "",
  busy = false,
}: {
  messages: ChatMessage[];
  className?: string;
  busy?: boolean;
}) {
  const last = messages?.[messages.length - 1];
  const dependencyToken = `${messages?.length ?? 0}:${last?.id ?? ""}:${
    last?.content?.length ?? 0
  }`;
  const { containerRef, scrollToBottom } = useAutoScroll<HTMLDivElement>(
    [dependencyToken],
    { behavior: "auto", bottomThresholdPx: 96 },
  );

  return (
    <div className={cn("h-full min-h-0", className)}>
      <ScrollArea className="h-full" ref={containerRef}>
        <div className="px-0 py-4">
          <MessageList messages={messages} busy={busy} />
          <div className="h-4" />
        </div>
      </ScrollArea>
    </div>
  );
}
