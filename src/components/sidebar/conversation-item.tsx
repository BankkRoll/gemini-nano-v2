"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { Conversation } from "@/types";
import { useEffect, useRef, useState } from "react";

type Props = {
  conversation: Conversation;
  active: boolean;
  onSelect: (id: string) => void;
  onRename: (id: string, title: string) => void;
  onDelete: (id: string) => void;
};

export function ConversationItem({
  conversation: c,
  active,
  onSelect,
  onRename,
  onDelete,
}: Props) {
  const [renameValue, setRenameValue] = useState(c.title || "");
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const suppressNextSelectRef = useRef(false);

  const [editedShort, setEditedShort] = useState<string>("—");
  const [editedMedium, setEditedMedium] = useState<string>("—");

  useEffect(() => {
    const d = new Date(c.lastUpdatedAt);
    if (isNaN(d.getTime())) {
      setEditedShort("—");
      setEditedMedium("—");
      return;
    }
    try {
      const shortFmt = new Intl.DateTimeFormat(undefined, {
        hour: "2-digit",
        minute: "2-digit",
      }).format(d);
      const dateFmt = new Intl.DateTimeFormat(undefined, {
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }).format(d);
      setEditedShort(shortFmt);
      setEditedMedium(dateFmt);
    } catch {
      setEditedShort("—");
      setEditedMedium("—");
    }
  }, [c.lastUpdatedAt]);

  const handleRename = () => {
    if (renameValue.trim()) {
      onRename(c.id, renameValue.trim());
      setIsRenameOpen(false);
    }
  };

  const handleDelete = () => {
    onDelete(c.id);
  };

  const handleRowClick = () => {
    if (suppressNextSelectRef.current) {
      suppressNextSelectRef.current = false;
      return;
    }
    onSelect(c.id);
  };

  return (
    <>
      <button
        className={cn(
          "cursor-pointer group w-full rounded-none px-3 py-2 text-left text-sm border-2 border-foreground shadow-sm bg-input text-foreground hover:bg-muted",
          active && "bg-muted border-foreground",
        )}
        onClick={handleRowClick}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span
              className="flex-1 min-w-0 truncate font-medium"
              title={c.title || "Untitled"}
            >
              {c.title && c.title.length > 30
                ? `${c.title.slice(0, 30)}...`
                : c.title || "Untitled"}
            </span>
          </div>
          <span className="inline-flex items-center border-2 border-foreground bg-card px-1.5 py-[1px] text-[10px] uppercase">
            {c.tool}
          </span>
        </div>
        <div className="mt-1 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <div className="flex items-center gap-2 min-w-0">
            <span className="shrink-0">{c.messages?.length ?? 0} msgs</span>
            <span className="hidden sm:inline shrink-0">Model: {c.model}</span>
            <span className="shrink-0">Edited {editedMedium}</span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Dialog
              open={isRenameOpen}
              onOpenChange={(open) => {
                setIsRenameOpen(open);
                if (!open) suppressNextSelectRef.current = true;
              }}
            >
              <DialogTrigger asChild>
                <div
                  className="underline-offset-4 hover:underline cursor-pointer"
                  onClick={(e) => e.stopPropagation()}
                >
                  Rename
                </div>
              </DialogTrigger>
              <DialogContent title="Rename Conversation">
                <DialogHeader>
                  <DialogTitle className="sr-only">
                    Rename Conversation
                  </DialogTitle>
                  <DialogDescription>
                    Enter a new name for this conversation.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <Input
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    placeholder="Enter conversation name"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleRename();
                      }
                    }}
                    autoFocus
                  />
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRename();
                    }}
                  >
                    Rename
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Dialog
              open={isDeleteOpen}
              onOpenChange={(open) => {
                setIsDeleteOpen(open);
                if (!open) suppressNextSelectRef.current = true;
              }}
            >
              <DialogTrigger asChild>
                <div
                  className="underline-offset-4 hover:underline cursor-pointer"
                  onClick={(e) => e.stopPropagation()}
                >
                  Delete
                </div>
              </DialogTrigger>
              <DialogContent title="Delete Conversation">
                <DialogHeader>
                  <DialogTitle className="sr-only">
                    Delete Conversation
                  </DialogTitle>
                  <DialogDescription>
                    Are you sure you want to delete this conversation? This
                    action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button
                    variant="destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete();
                    }}
                  >
                    Delete
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </button>
    </>
  );
}
