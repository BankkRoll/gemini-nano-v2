"use client";

import { cn } from "@/lib/utils";
import type { Availability } from "@/types";

export function StatusDot({ status }: { status: Availability }) {
  const color: Record<Availability, string> = {
    unavailable: "bg-red-500",
    downloadable: "bg-amber-500",
    downloading: "bg-blue-500",
    available: "bg-emerald-500",
  };
  return (
    <span className={cn("inline-block h-2 w-2 rounded-full", color[status])} />
  );
}

export function StatusPill({
  status,
  customLabel,
}: {
  status: Availability;
  customLabel?: string;
}) {
  const map: Record<Availability, string> = {
    unavailable: "bg-destructive/15 text-destructive",
    downloadable: "bg-amber-500/15 text-amber-400",
    downloading: "bg-blue-500/15 text-blue-400",
    available: "bg-emerald-500/15 text-emerald-400",
  };
  const label: Record<Availability, string> = {
    unavailable: "Unavailable",
    downloadable: "Downloadable",
    downloading: "Downloading…",
    available: "Available",
  };
  return (
    <span
      className={cn(
        "cursor-default inline-flex items-center rounded-full px-2 py-0.5 text-[10px]",
        map[status],
        status === "downloadable" && "cursor-pointer",
      )}
    >
      {customLabel || label[status]}
    </span>
  );
}
