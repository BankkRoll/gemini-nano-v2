"use client";

import { ConversationItem } from "@/components/sidebar/conversation-item";
import { ModelInfoDialog } from "@/components/sidebar/model-info-dialog";
import { StatusPill } from "@/components/sidebar/status-badge";
import { StatusRows } from "@/components/sidebar/status-rows";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAppStore } from "@/store/app-store";
import { Info, Menu, Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import Logo from "../logo";

export function Sidebar(_props?: any) {
  const conversations = useAppStore((s) => s.conversations);
  const activeId = useAppStore((s) => s.activeId);
  const createConversation = useAppStore((s) => s.createConversation);
  const setActiveId = useAppStore((s) => s.setActiveId);
  const renameConversation = useAppStore((s) => s.renameConversation);
  const deleteConversation = useAppStore((s) => s.deleteConversation);
  const promptStatus = useAppStore((s) => s.promptStatus);
  const summarizerStatus = useAppStore((s) => s.summarizerStatus);
  const translatorStatus = useAppStore((s) => s.translatorStatus);
  const detectorStatus = useAppStore((s) => s.detectorStatus);
  const writerStatus = useAppStore((s) => s.writerStatus);
  const rewriterStatus = useAppStore((s) => s.rewriterStatus);
  const proofreaderStatus = useAppStore((s) => s.proofreaderStatus);
  const handleDownload = useAppStore((s) => s.handleDownload);
  const signOut = useAppStore((s) => s.signOut);
  const downloading = useAppStore((s) => s.busy);
  const [downloadingModels, setDownloadingModels] = useState<Set<string>>(
    new Set(),
  );
  const [infoOpen, setInfoOpen] = useState(false);
  const [infoTool, setInfoTool] = useState<
    | "chat"
    | "summarize"
    | "translate"
    | "detect"
    | "write"
    | "rewrite"
    | "proofread"
  >("chat");

  const handleModelDownload = async (modelName: string) => {
    if (downloadingModels.has(modelName)) return;
    setDownloadingModels((prev) => new Set(prev).add(modelName));
    try {
      await handleDownload();
    } finally {
      setDownloadingModels((prev) => {
        const newSet = new Set(prev);
        newSet.delete(modelName);
        return newSet;
      });
    }
  };

  const isModelDownloading = (modelName: string) =>
    downloadingModels.has(modelName);

  const SidebarContent = () => (
    <>
      <div className="max-lg:hidden flex items-center justify-between px-3 py-2 bg-primary text-primary-foreground border-b-2 border-foreground">
        <Link
          href="/"
          onClick={() => {
            useAppStore.getState().setActiveId(null);
          }}
          className="flex items-center gap-2"
        >
          <Logo />
          <span className="text-sm text-primary-foreground font-semibold">
            Nano Studio 98
          </span>
        </Link>
        <StatusPill status={promptStatus} />
      </div>

      <div className="px-3 py-3">
        <Button
          className="w-full border-2 border-foreground shadow-sm bg-input text-foreground hover:bg-muted"
          onClick={() => createConversation()}
        >
          <Plus className="mr-2 h-4 w-4" /> New Chat
        </Button>
      </div>

      <ScrollArea className="flex-1 min-h-0 px-2">
        <div className="space-y-1 py-2">
          {conversations.map((c) => (
            <ConversationItem
              key={c.id}
              conversation={c}
              active={c.id === activeId}
              onSelect={(id) => setActiveId(id)}
              onRename={renameConversation}
              onDelete={deleteConversation}
            />
          ))}
        </div>
      </ScrollArea>

      <div className="border-t-2 border-foreground p-3 bg-card">
        <Accordion type="single" collapsible defaultValue="models">
          <AccordionItem value="models" className="border-2 border-foreground">
            <AccordionTrigger className="px-3 py-2 text-xs font-medium">
              Model Status
            </AccordionTrigger>
            <AccordionContent className="px-3 pb-3 pt-1">
              <StatusRows
                rows={[
                  { label: "Chat", key: "chat", status: promptStatus },
                  {
                    label: "Summarize",
                    key: "summarize",
                    status: summarizerStatus,
                  },
                  {
                    label: "Translate",
                    key: "translate",
                    status: translatorStatus,
                  },
                  { label: "Detect", key: "detect", status: detectorStatus },
                  { label: "Write", key: "write", status: writerStatus },
                  { label: "Rewrite", key: "rewrite", status: rewriterStatus },
                  {
                    label: "Proofread",
                    key: "proofread",
                    status: proofreaderStatus,
                  },
                ]}
                onClickDownload={(key) => handleModelDownload(key)}
                isDownloading={(key) => isModelDownloading(key)}
                onClickInfo={(key) => {
                  setInfoTool(key as any);
                  setInfoOpen(true);
                }}
              />
              <div className="mt-3 text-xs text-muted-foreground">
                <button
                  type="button"
                  className="cursor-pointer hover:underline flex items-center gap-1"
                  onClick={() => setInfoOpen(true)}
                >
                  <Info className="h-3 w-3" />
                  About Built‑in AI
                </button>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="my-3">
          <Separator className="bg-foreground" />
        </div>

        <Button
          className="w-full border-2 border-foreground shadow-sm bg-input text-foreground hover:bg-muted"
          onClick={() => {
            useAppStore.getState().setActiveId(null);
            signOut();
          }}
        >
          Log out
        </Button>
      </div>
    </>
  );

  return (
    <>
      <ModelInfoDialog
        open={infoOpen}
        onOpenChange={setInfoOpen}
        initialTool={infoTool}
        statuses={{
          chat: promptStatus,
          summarize: summarizerStatus,
          translate: translatorStatus,
          detect: detectorStatus,
          write: writerStatus,
          rewrite: rewriterStatus,
          proofread: proofreaderStatus,
        }}
      />
      <aside className="hidden lg:flex lg:w-full lg:flex-col h-full border-r-2 border-foreground bg-card shadow-2xl">
        <SidebarContent />
      </aside>

      <div className="lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="border-2 border-foreground shadow-sm bg-input text-foreground hover:bg-muted"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="right"
            className="w-80 p-0 h-full"
            title="Nano Studio 98"
          >
            <div className="h-full flex flex-col">
              <SidebarContent />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
