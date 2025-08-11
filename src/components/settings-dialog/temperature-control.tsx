"use client";

import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useAppStore } from "@/store/app-store";

export function TemperatureControl() {
  const value = useAppStore((s) => s.settings.temperature);
  const update = useAppStore((s) => s.updateSettings);
  return (
    <div className="space-y-2">
      <Label htmlFor="temperature" className="text-foreground font-medium">
        Temperature: {value}
      </Label>
      <Slider
        id="temperature"
        min={0}
        max={2}
        step={0.1}
        value={[value]}
        onValueChange={([v]: [number]) => update({ temperature: v || 0.7 })}
        className="w-full"
      />
    </div>
  );
}
