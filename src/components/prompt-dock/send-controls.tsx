"use client";

import { Button } from "@/components/ui/button";
import { PlusCircle, Send, Square } from "lucide-react";
import { memo } from "react";

type Props = {
  busy: boolean;
  onSend: () => void;
  onStop: () => void;
  canQueue?: boolean;
  onQueueNext?: () => void;
};

function SendControlsBase({
  busy,
  onSend,
  onStop,
  canQueue,
  onQueueNext,
}: Props) {
  return (
    <div className="mt-2 flex items-center justify-between px-1 pb-1">
      <div />
      <div className="flex items-center gap-2">
        {!busy ? (
          <Button onClick={onSend}>
            <Send className="mr-2 h-4 w-4" /> Send
          </Button>
        ) : (
          <>
            {canQueue && (
              <Button variant="secondary" onClick={onQueueNext}>
                <PlusCircle className="mr-2 h-4 w-4" /> Send next
              </Button>
            )}
            <Button variant="outline" onClick={onStop}>
              <Square className="mr-2 h-4 w-4" /> Stop
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

export const SendControls = memo(SendControlsBase);
