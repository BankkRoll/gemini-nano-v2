"use client";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAppStore } from "@/store/app-store";

export function StreamControl() {
  const checked = useAppStore((s) => s.settings.stream);
  const update = useAppStore((s) => s.updateSettings);
  return (
    <div className="flex items-center justify-between p-3 border-2 border-foreground bg-muted">
      <div className="space-y-0.5">
        <Label htmlFor="streaming" className="text-foreground font-medium">
          Streaming Responses
        </Label>
        <p className="text-xs text-muted-foreground">
          Show AI responses as they're generated in real-time.
        </p>
      </div>
      <Switch
        id="streaming"
        checked={checked}
        onCheckedChange={(v) => update({ stream: v })}
      />
    </div>
  );
}
