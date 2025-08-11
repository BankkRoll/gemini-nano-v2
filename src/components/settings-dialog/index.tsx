"use client";

import { LanguageSelect } from "@/components/settings-dialog/language-select";
import { StreamControl } from "@/components/settings-dialog/stream-control";
import { TemperatureControl } from "@/components/settings-dialog/temperature-control";
import { TopKControl } from "@/components/settings-dialog/topk-control";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAppStore } from "@/store/app-store";
import { useMemo } from "react";

export function SettingsDialog() {
  const open = useAppStore((s) => s.showSettings);
  const onOpenChange = useAppStore((s) => s.setShowSettings);
  const settings = useAppStore((s) => s.settings);
  const updateSettings = useAppStore((s) => s.updateSettings);
  const conversations = useAppStore((s) => s.conversations);
  const activeId = useAppStore((s) => s.activeId);
  const current = useMemo(
    () => conversations.find((c) => c.id === activeId) || null,
    [conversations, activeId],
  );
  const isGeminiModel =
    (current?.model ?? "auto") === "auto" ||
    (current?.model ?? "auto") === "text";
  const isTranslateTool = (current?.tool ?? "chat") === "translate";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" title="Settings">
        <DialogHeader>
          <DialogTitle className="sr-only">Settings</DialogTitle>
          <DialogDescription className="text-muted-foreground mb-4">
            Configure your AI assistant preferences and behavior.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label
              htmlFor="system-prompt"
              className="text-foreground font-medium"
            >
              System Prompt
            </Label>
            <Textarea
              id="system-prompt"
              placeholder="You are a helpful, concise assistant."
              value={settings.systemPrompt}
              onChange={(e) => updateSettings({ systemPrompt: e.target.value })}
              className="min-h-[80px] resize-none border-2 border-foreground shadow-sm bg-input text-foreground placeholder:text-muted-foreground"
            />
            <p className="text-xs text-muted-foreground">
              Instructions that define how the AI should behave and respond.
            </p>
          </div>

          {isGeminiModel && (
            <div className="space-y-4">
              <TemperatureControl />
              <TopKControl />
            </div>
          )}

          {isTranslateTool && <LanguageSelect />}

          <StreamControl />
        </div>
      </DialogContent>
    </Dialog>
  );
}
