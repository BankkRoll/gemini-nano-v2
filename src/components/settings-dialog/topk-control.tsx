"use client";

import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useAppStore } from "@/store/app-store";

export function TopKControl() {
  const value = useAppStore((s) => s.settings.topK);
  const update = useAppStore((s) => s.updateSettings);
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
        onValueChange={([v]: [number]) => update({ topK: v || 1 })}
        className="w-full"
      />
    </div>
  );
}
