"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { Availability } from "@/types";
import {
  BookOpenText,
  Bot,
  ExternalLink,
  Languages,
  Pencil,
  Repeat2,
  Search,
  ShieldCheck,
} from "lucide-react";
import React, { useMemo, useState } from "react";

type ToolKey =
  | "chat"
  | "summarize"
  | "translate"
  | "detect"
  | "write"
  | "rewrite"
  | "proofread";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initialTool?: ToolKey;
  statuses: Record<ToolKey, Availability>;
};

const TOOL_INFO: Record<
  ToolKey,
  {
    label: string;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    description: string;
    goodFor: string[];
    constraints: string[];
    apiStatus: string;
    docUrl: string;
    explainerLabel?: string;
    explainerUrl?: string;
    webSupportLabel?: string;
    webSupportUrl?: string;
    extensionsSupportLabel?: string;
    extensionsSupportUrl?: string;
    chromeStatusUrl?: string;
    intentUrl?: string;
  }
> = {
  chat: {
    label: "Chat",
    icon: Bot,
    description:
      "Conversational requests to Gemini Nano. Maintain lightweight sessions for local, private chat and assistants.",
    goodFor: [
      "Chatbots and assistants",
      "Quick Q&A without network round‑trip",
      "JSON‑structured responses (via responseConstraint)",
    ],
    constraints: [
      "Desktop only (Windows/macOS/Linux)",
      "Requires on‑device model (~22 GB, >4 GB VRAM)",
      "Web: Origin Trial; Extensions: Stable (Chrome ≥138)",
    ],
    apiStatus: "Chat API — Extensions: Stable; Web: Origin Trial",
    docUrl: "https://developer.chrome.com/docs/ai/built-in-apis#prompt_api",
    explainerLabel: "GitHub",
    explainerUrl: "https://github.com/webmachinelearning/prompt-api",
    webSupportLabel: "Origin trial",
    webSupportUrl:
      "https://developer.chrome.com/origintrials/#/view_trial/2533837740349325313",
    extensionsSupportLabel: "Chrome 138",
    chromeStatusUrl: "https://chromestatus.com/feature/5134603979063296",
    intentUrl:
      "https://groups.google.com/a/chromium.org/g/blink-dev/c/6uBwiiFohAU/m/WhaKAB9fAAAJ",
  },
  summarize: {
    label: "Summarize",
    icon: BookOpenText,
    description:
      "Condense long text locally (TL;DR, key points, headline). Supports chunking and recursive summary of summaries.",
    goodFor: [
      "Meeting notes, support transcripts",
      "Product review digests",
      "Generating short headlines",
    ],
    constraints: [
      "Desktop only; small context window — split text",
      "Use streaming for responsiveness",
      "Extensions: Stable; Web: EPP/experimentation",
    ],
    apiStatus: "Summarizer API — Stable (Extensions); EPP (Web)",
    docUrl: "https://developer.chrome.com/docs/ai/built-in-apis#summarizer_api",
    explainerLabel: "MDN",
    explainerUrl: "https://developer.mozilla.org/docs/Web/API/Summarizer/",
    webSupportLabel: "Chrome 138",
    extensionsSupportLabel: "Chrome 138",
    chromeStatusUrl: "https://chromestatus.com/feature/5193953788559360",
    intentUrl:
      "https://groups.google.com/a/chromium.org/g/blink-dev/c/cpyB56aHWs4/m/8NTdmGV8AAAJ",
  },
  translate: {
    label: "Translate",
    icon: Languages,
    description:
      "Translate text on demand with an expert on‑device model. Pair with Language Detector for source language.",
    goodFor: [
      "Realtime translation of user content",
      "Support workflows with mixed languages",
      "Accessibility labeling",
    ],
    constraints: [
      "Chrome ≥138, desktop",
      "Detect source language for best results",
      "Client‑side privacy; no server round‑trip",
    ],
    apiStatus: "Translator API — Stable (Chrome ≥138)",
    docUrl: "https://developer.chrome.com/docs/ai/built-in-apis#translator_api",
    explainerLabel: "MDN",
    explainerUrl:
      "https://developer.mozilla.org/docs/Web/API/Translator_and_Language_Detector_APIs",
    webSupportLabel: "Chrome 138",
    extensionsSupportLabel: "Chrome 138",
    chromeStatusUrl: "https://chromestatus.com/feature/5172811302961152",
    intentUrl:
      "https://groups.google.com/a/chromium.org/g/blink-dev/c/eCE8jIW2auo/m/3vMI6eQqBAAJ",
  },
  detect: {
    label: "Detect",
    icon: Search,
    description:
      "Detect the language of input text. Useful for labeling and as a precursor to translation.",
    goodFor: [
      "Auto‑label language for screen readers",
      "Determine source language for Translate",
    ],
    constraints: ["Chrome ≥138, desktop", "Short inputs perform best"],
    apiStatus: "Language Detector API — Stable (Chrome ≥138)",
    docUrl:
      "https://developer.chrome.com/docs/ai/built-in-apis#language_detector_api",
    explainerLabel: "MDN",
    explainerUrl:
      "https://developer.mozilla.org/docs/Web/API/Translator_and_Language_Detector_APIs",
    webSupportLabel: "Chrome 138",
    extensionsSupportLabel: "Chrome 138",
    chromeStatusUrl: "https://chromestatus.com/feature/6494349985841152",
    intentUrl:
      "https://groups.google.com/a/chromium.org/g/blink-dev/c/sWcHBe9wpbo/m/H8Xp7NXTCQAJ",
  },
  write: {
    label: "Write",
    icon: Pencil,
    description:
      "Generate new content locally based on a task (e.g., draft emails or responses).",
    goodFor: ["Drafting emails", "Brainstorming", "Boilerplate generation"],
    constraints: ["Origin Trial (Web/Extensions)", "Text‑to‑text only"],
    apiStatus: "Writer API — Origin Trial",
    docUrl:
      "https://developer.chrome.com/docs/ai/built-in-apis#writer_and_rewriter_apis",
    explainerLabel: "GitHub",
    explainerUrl:
      "https://github.com/explainers-by-googlers/writing-assistance-apis/",
    webSupportLabel: "Origin trial",
    webSupportUrl:
      "https://developer.chrome.com/origintrials/#/view_trial/-8779204523605360639",
    extensionsSupportLabel: "Origin trial",
    extensionsSupportUrl:
      "https://developer.chrome.com/origintrials/#/view_trial/-8779204523605360639",
    chromeStatusUrl: "https://chromestatus.com/feature/4712595362414592",
    intentUrl:
      "https://groups.google.com/a/chromium.org/g/blink-dev/c/LFaidO_GmIU/m/fwGOKFYPDwAJ",
  },
  rewrite: {
    label: "Rewrite",
    icon: Repeat2,
    description:
      "Revise or restructure text (tone, length, clarity) locally using the on‑device model.",
    goodFor: ["Polishing drafts", "Tone changes", "Length adjustments"],
    constraints: ["Origin Trial (Web/Extensions)", "Text‑to‑text only"],
    apiStatus: "Rewriter API — Origin Trial",
    docUrl:
      "https://developer.chrome.com/docs/ai/built-in-apis#writer_and_rewriter_apis",
    explainerLabel: "GitHub",
    explainerUrl:
      "https://github.com/explainers-by-googlers/writing-assistance-apis/",
    webSupportLabel: "Origin trial",
    webSupportUrl:
      "https://developer.chrome.com/origintrials/#/view_trial/444167513249415169",
    extensionsSupportLabel: "Origin trial",
    extensionsSupportUrl:
      "https://developer.chrome.com/origintrials/#/view_trial/444167513249415169",
    chromeStatusUrl: "https://chromestatus.com/feature/5112320150470656",
    intentUrl:
      "https://groups.google.com/a/chromium.org/g/blink-dev/c/LgPGLOV2vrc/m/1crxL0oPDwAJ",
  },
  proofread: {
    label: "Proofread",
    icon: ShieldCheck,
    description:
      "Interactive proofreading and correction of text. Guide users through grammar and clarity fixes.",
    goodFor: ["Comment editing", "Document fixes", "Chat message cleanup"],
    constraints: ["Chrome 139+ Canary / EPP", "Experimental"],
    apiStatus: "Proofreader API — EPP (Experimental)",
    docUrl:
      "https://developer.chrome.com/docs/ai/built-in-apis#proofreader_api",
    explainerLabel: "GitHub",
    explainerUrl: "https://github.com/explainers-by-googlers/proofreader-api",
    webSupportLabel: "Experimental (EPP)",
    webSupportUrl: "https://developer.chrome.com/docs/ai/join-epp",
    extensionsSupportLabel: "Experimental (EPP)",
    extensionsSupportUrl: "https://developer.chrome.com/docs/ai/join-epp",
    chromeStatusUrl: "https://chromestatus.com/feature/5164677291835392",
    intentUrl:
      "https://groups.google.com/a/chromium.org/g/blink-dev/c/1waIrgpXrRs/m/dFySNRrDBgAJ",
  },
};

function AvailabilityPill({ value }: { value: Availability }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm border px-2 py-0.5 text-[10px] uppercase",
        value === "available" &&
          "bg-green-500/15 border-green-600 text-green-700",
        value === "downloadable" &&
          "bg-amber-500/15 border-amber-600 text-amber-700",
        value === "downloading" &&
          "bg-blue-500/15 border-blue-600 text-blue-700",
        value === "unavailable" && "bg-red-500/15 border-red-600 text-red-700",
      )}
    >
      {value}
    </span>
  );
}

export function ModelInfoDialog({
  open,
  onOpenChange,
  initialTool = "chat",
  statuses,
}: Props) {
  const [current, setCurrent] = useState<ToolKey>(initialTool);
  const currentInfo = useMemo(() => TOOL_INFO[current], [current]);

  const CurrentIcon = currentInfo.icon;

  React.useEffect(() => {
    if (open) setCurrent(initialTool);
  }, [initialTool, open]);

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) setCurrent(initialTool);
        onOpenChange(v);
      }}
    >
      <DialogContent
        title="Built‑in AI — Model & Tool Info"
        className="w-full sm:max-w-3xl rounded-none border-2 border-foreground bg-card p-0"
      >
        <DialogTitle className="sr-only">
          Built‑in AI — Model & Tool Info
        </DialogTitle>

        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <div className="flex-1">
              <Select
                value={current}
                onValueChange={(v) => setCurrent(v as ToolKey)}
              >
                <SelectTrigger className="rounded-none border-2 border-foreground bg-input">
                  <SelectValue>
                    <span className="inline-flex items-center gap-2">
                      <CurrentIcon className="h-4 w-4" /> {currentInfo.label}
                    </span>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="rounded-none border-2 border-foreground bg-card">
                  {(Object.keys(TOOL_INFO) as ToolKey[]).map((key) => {
                    const ItemIcon = TOOL_INFO[key].icon;
                    return (
                      <SelectItem
                        key={key}
                        value={key}
                        className="rounded-none"
                      >
                        <span className="inline-flex items-center gap-2">
                          <ItemIcon className="h-3.5 w-3.5" />{" "}
                          {TOOL_INFO[key].label}
                        </span>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between sm:justify-end gap-2">
              <span className="text-xs opacity-70">Availability:</span>
              <AvailabilityPill value={statuses[current]} />
            </div>
          </div>

          <div className="rounded-none border-2 border-foreground">
            <div className="px-3 py-2 bg-muted border-b-2 border-foreground flex items-center gap-2 text-sm font-medium">
              <CurrentIcon className="h-4 w-4" /> {currentInfo.label}
            </div>
            <div className="p-3 space-y-3 text-sm">
              <p className="text-foreground/90">{currentInfo.description}</p>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                <div className="rounded-none border border-foreground/40 p-3 bg-background/50">
                  <h4 className="text-xs font-semibold mb-2 uppercase tracking-wide">
                    Good for
                  </h4>
                  <ul className="list-disc pl-5 space-y-1">
                    {currentInfo.goodFor.map((g, i) => (
                      <li key={i}>{g}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-none border border-foreground/40 p-3 bg-background/50">
                  <h4 className="text-xs font-semibold mb-2 uppercase tracking-wide">
                    Constraints
                  </h4>
                  <ul className="list-disc pl-5 space-y-1">
                    {currentInfo.constraints.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="opacity-70">API status:</span>{" "}
                  {currentInfo.apiStatus}
                </div>
                <div>
                  <span className="opacity-70">Docs:</span>{" "}
                  <a
                    href={currentInfo.docUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="underline inline-flex items-center gap-1"
                  >
                    Learn more <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                {currentInfo.explainerUrl && (
                  <div>
                    <span className="opacity-70">Explainer:</span>{" "}
                    <a
                      href={currentInfo.explainerUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="underline"
                    >
                      {currentInfo.explainerLabel ?? "Explainer"}
                    </a>
                  </div>
                )}
                <div>
                  <span className="opacity-70">Web:</span>{" "}
                  {currentInfo.webSupportUrl ? (
                    <a
                      href={currentInfo.webSupportUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="underline"
                    >
                      {currentInfo.webSupportLabel ?? "See details"}
                    </a>
                  ) : (
                    <span>{currentInfo.webSupportLabel ?? "—"}</span>
                  )}
                </div>
                <div>
                  <span className="opacity-70">Extensions:</span>{" "}
                  {currentInfo.extensionsSupportUrl ? (
                    <a
                      href={currentInfo.extensionsSupportUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="underline"
                    >
                      {currentInfo.extensionsSupportLabel ?? "See details"}
                    </a>
                  ) : (
                    <span>{currentInfo.extensionsSupportLabel ?? "—"}</span>
                  )}
                </div>
                {currentInfo.chromeStatusUrl && (
                  <div>
                    <span className="opacity-70">Chrome Status:</span>{" "}
                    <a
                      href={currentInfo.chromeStatusUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="underline"
                    >
                      View
                    </a>
                  </div>
                )}
                {currentInfo.intentUrl && (
                  <div>
                    <span className="opacity-70">Intent:</span>{" "}
                    <a
                      href={currentInfo.intentUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="underline"
                    >
                      View
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
