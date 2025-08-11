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
import type { ModelId, Tool } from "@/types";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  systemPrompt: string;
  setSystemPrompt: (prompt: string) => void;
  temperature: number;
  setTemperature: (temp: number) => void;
  topK: number;
  setTopK: (topk: number) => void;
  stream: boolean;
  setStream: (stream: boolean) => void;
  targetLang: string;
  setTargetLang: (lang: string) => void;
  currentModel: ModelId;
  currentTool: Tool;
};

export function SettingsDialog({
  open,
  onOpenChange,
  systemPrompt,
  setSystemPrompt,
  temperature,
  setTemperature,
  topK,
  setTopK,
  stream,
  setStream,
  targetLang,
  setTargetLang,
  currentModel,
  currentTool,
}: Props) {
  const isGeminiModel = currentModel === "auto" || currentModel === "text";
  const isTranslateTool = currentTool === "translate";

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
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              className="min-h-[80px] resize-none border-2 border-foreground shadow-sm bg-input text-foreground placeholder:text-muted-foreground"
            />
            <p className="text-xs text-muted-foreground">
              Instructions that define how the AI should behave and respond.
            </p>
          </div>

          {isGeminiModel && (
            <div className="space-y-4">
              <TemperatureControl
                value={temperature}
                onChange={setTemperature}
              />
              <TopKControl value={topK} onChange={setTopK} />
            </div>
          )}

          {isTranslateTool && (
            <LanguageSelect value={targetLang} onChange={setTargetLang} />
          )}

          <StreamControl checked={stream} onChange={setStream} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
