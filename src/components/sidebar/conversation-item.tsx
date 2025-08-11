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
import { useRef, useState } from "react";

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
          "group w-full rounded-none px-3 py-2 text-left text-sm border-2 border-foreground shadow-sm bg-input text-foreground hover:bg-muted",
          active && "bg-muted border-foreground",
        )}
        onClick={handleRowClick}
      >
        <div className="flex items-center justify-between gap-2">
          <span
            className="truncate max-w-[200px]"
            title={c.title || "Untitled"}
          >
            {c.title && c.title.length > 30
              ? `${c.title.slice(0, 30)}...`
              : c.title || "Untitled"}
          </span>
          <span className="text-[10px] uppercase text-muted-foreground">
            {c.tool}
          </span>
        </div>
        <div className="mt-1 flex gap-2">
          <Dialog
            open={isRenameOpen}
            onOpenChange={(open) => {
              setIsRenameOpen(open);
              if (!open) suppressNextSelectRef.current = true;
            }}
          >
            <DialogTrigger asChild>
              <div
                className="text-xs text-muted-foreground underline-offset-4 hover:underline cursor-pointer"
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
                className="text-xs text-muted-foreground underline-offset-4 hover:underline cursor-pointer"
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
                  Are you sure you want to delete this conversation? This action
                  cannot be undone.
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
      </button>
    </>
  );
}
