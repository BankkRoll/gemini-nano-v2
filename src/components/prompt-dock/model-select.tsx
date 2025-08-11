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
import type { ModelId, Tool } from "@/types";
import { Sparkles } from "lucide-react";
import { memo } from "react";

export type ModelOption = { id: ModelId; label: string; capabilities: Tool[] };

type Props = {
  current: ModelOption;
  options: ModelOption[];
  onChange: (id: ModelId) => void;
};

function ModelSelectBase({ current, options, onChange }: Props) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant="secondary" className="h-7 gap-2 px-2">
          <Sparkles className="h-3.5 w-3.5" />
          <span className="max-sm:hidden">{current.label}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel>Model</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {options.map((opt) => (
          <DropdownMenuItem key={opt.id} onClick={() => onChange(opt.id)}>
            {opt.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export const ModelSelect = memo(ModelSelectBase);
