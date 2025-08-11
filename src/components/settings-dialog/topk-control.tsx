"use client";

import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

type Props = {
  value: number;
  onChange: (v: number) => void;
};

export function TopKControl({ value, onChange }: Props) {
  return (
    <div className="space-y-2">
      <Label htmlFor="topk" className="text-foreground font-medium">
        Top-K: {value}
      </Label>
      <Slider
        id="topk"
        min={1}
        max={40}
        step={1}
        value={[value]}
        onValueChange={([v]: [number]) => onChange(v || 1)}
        className="w-full"
      />
    </div>
  );
}
