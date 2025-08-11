"use client";

import { StatusPill } from "@/components/chat/status-badge";
import { cn } from "@/lib/utils";
import type { Availability } from "@/types";
import { Info } from "lucide-react";

type Row = {
  label: string;
  key: string;
  status: Availability;
};

type Props = {
  rows: Row[];
  onClickDownload?: (key: string) => void;
  isDownloading?: (key: string) => boolean;
  onClickInfo?: (key: string) => void;
};

export function StatusRows({
  rows,
  onClickDownload,
  isDownloading,
  onClickInfo,
}: Props) {
  return (
    <div className="space-y-1 text-xs">
      {rows.map((r) => (
        <div key={r.key} className="flex items-center justify-between gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-1 text-foreground hover:underline"
            onClick={() => onClickInfo?.(r.key)}
          >
            <Info className="h-3.5 w-3.5" /> {r.label}
          </button>
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "cursor-pointer",
                r.status === "downloadable" && "hover:opacity-80",
              )}
              onClick={() =>
                r.status === "downloadable" && onClickDownload?.(r.key)
              }
            >
              <StatusPill
                status={r.status}
                customLabel={
                  isDownloading?.(r.key) ? "Downloading..." : undefined
                }
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
