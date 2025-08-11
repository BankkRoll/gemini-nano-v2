"use client";

import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

type Props = {
  value: number;
  onChange: (v: number) => void;
};

export function TemperatureControl({ value, onChange }: Props) {
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
        onValueChange={([v]: [number]) => onChange(v || 0.7)}
        className="w-full"
      />
    </div>
  );
}
