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
    <div className="mt-2 flex items-center justify-between">
      <div />
      <div className="flex items-center gap-2">
        {!busy ? (
          <Button
            size="sm"
            onClick={onSend}
            className="border-2 border-black shadow-sm"
          >
            <Send className="mr-2 h-4 w-4" /> Send
          </Button>
        ) : (
          <>
            {canQueue && (
              <Button
                size="sm"
                variant="secondary"
                className="border-2 border-black shadow-sm"
                onClick={onQueueNext}
              >
                <PlusCircle className="mr-2 h-4 w-4" /> Send next
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              className="border-2 border-black shadow-sm"
              onClick={onStop}
            >
              <Square className="mr-2 h-4 w-4" /> Stop
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

export const SendControls = memo(SendControlsBase);
