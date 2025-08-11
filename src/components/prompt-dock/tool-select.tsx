"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { Tool } from "@/types";
import { PenTool } from "lucide-react";
import { memo } from "react";

type ToolOption = { id: Tool; label: string };

type Props = {
  current: Tool;
  options: ToolOption[];
  disabledByModel: (t: Tool) => boolean;
  onChange: (t: Tool) => void;
};

function ToolSelectBase({
  current,
  options,
  disabledByModel,
  onChange,
}: Props) {
  const currentLabel = options.find((x) => x.id === current)?.label ?? current;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant="secondary" className="h-7 gap-2 px-2">
          <PenTool className="h-3.5 w-3.5" />
          <span className="max-sm:hidden">{currentLabel}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel>Tool</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {options.map((opt) => {
          const disabled = disabledByModel(opt.id);
          return (
            <DropdownMenuItem
              key={opt.id}
              onClick={() => !disabled && onChange(opt.id)}
              className={cn(disabled && "pointer-events-none opacity-40")}
            >
              {opt.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export const ToolSelect = memo(ToolSelectBase);
