"use client";

import { ChatFeed } from "@/components/chat/chat-feed";
import { WelcomeText } from "@/components/chat/welcome-text";
import { DownloadRequiredDialog } from "@/components/download-required-dialog";
import Logo from "@/components/logo";
import { PromptDock } from "@/components/prompt-dock";
import { SettingsDialog } from "@/components/settings-dialog";
import { Sidebar } from "@/components/sidebar";
import { Welcome, type WindowsUser } from "@/components/welcome";
import { WindowsLoadingBar } from "@/components/windows-loading";
import { useBuiltInAI } from "@/hooks/use-built-in-ai";
import { useConversations } from "@/hooks/use-conversations";
import { useDownloadRequirement } from "@/hooks/use-download-requirement";
import { useSettings } from "@/hooks/use-settings";
import { getSignedInUser, startSession, type SessionUser } from "@/lib/session";
import type { ChatMessage, ModelId, Tool } from "@/types";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/**
 * Page orchestrates session, conversations, AI interactions, URL sync, and layout.
 */
export default function Page() {
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null);
  const [hasCheckedUser, setHasCheckedUser] = useState(false);
  const [bootBlocks, setBootBlocks] = useState(0);
  const [bootDone, setBootDone] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const ai = useBuiltInAI();
  const { settings, update } = useSettings();
  const {
    conversations,
    activeId,
    createConversation,
    setActiveId,
    renameConversation,
    deleteConversation,
    appendMessages,
    updateMessage,
    setActiveTool,
    setActiveModel,
  } = useConversations(searchParams.get("chat"));

  const downloadRequirement = useDownloadRequirement();

  useEffect(() => {
    const u = getSignedInUser();
    setSessionUser(u);
    setHasCheckedUser(true);
  }, []);

  useEffect(() => {
    setBootBlocks(0);
    setBootDone(false);
    const id = window.setInterval(() => {
      setBootBlocks((prev) => {
        if (prev >= 50) return 50;
        const next = prev + 1;
        if (next >= 50) {
          setBootDone(true);
          window.clearInterval(id);
        }
        return next;
      });
    }, 20);
    return () => window.clearInterval(id);
  }, []);

  const showBoot = !hasCheckedUser || !bootDone;

  useEffect(() => {
    const url = new URL(window.location.href);
    const currentChat = url.searchParams.get("chat");

    if (!activeId) {
      if (currentChat !== null) {
        url.searchParams.delete("chat");
        if (url.search !== window.location.search) {
          router.replace(url.pathname + url.search, { scroll: false });
        }
      }
      return;
    }

    if (currentChat !== activeId) {
      url.searchParams.set("chat", activeId);
      if (url.search !== window.location.search) {
        router.replace(url.pathname + url.search, { scroll: false });
      }
    }
  }, [activeId, router]);

  const active = useMemo(() => {
    if (!activeId) return null;
    return conversations.find((c) => c.id === activeId) || null;
  }, [conversations, activeId]);

  const hasMessages = active?.messages && active.messages.length > 0;
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const lastMsg = hasMessages
    ? active!.messages[active!.messages.length - 1]
    : null;
  const isThinking =
    busy && !!lastMsg && lastMsg.role === "assistant" && !lastMsg.content;
  const [showSettings, setShowSettings] = useState(false);
  const [pendingTool, setPendingTool] = useState<Tool>("chat");
  const [pendingModel, setPendingModel] = useState<ModelId>("auto");

  const abortRef = useRef<AbortController | null>(null);
  const titleRequestsRef = useRef<Set<string>>(new Set());
  const conversationsRef = useRef(conversations);

  useEffect(() => {
    conversationsRef.current = conversations;
  }, [conversations]);

  function sanitizeTitle(raw: string): string {
    const cleaned = raw
      .replace(/[\n\r]+/g, " ")
      .replace(/^\s*["'`]+|["'`]+\s*$/g, "")
      .trim();
    return cleaned.slice(0, 60) || "Untitled";
  }

  function looksDefaultTitle(conversationTitle: string, firstUserText: string) {
    const fallback = firstUserText.trim().slice(0, 20) || "New chat";
    return conversationTitle === "New chat" || conversationTitle === fallback;
  }

  async function generateTitleInBackground(
    conversationId: string,
    firstUserText: string,
  ) {
    if (titleRequestsRef.current.has(conversationId)) return;
    titleRequestsRef.current.add(conversationId);
    try {
      const convo = conversationsRef.current.find(
        (c) => c.id === conversationId,
      );
      if (!convo) return;
      if (!looksDefaultTitle(convo.title, firstUserText)) return;

      if (ai.summarizerStatus !== "available") return;

      const summarizer = await ai.createSummarizer({
        type: "headline",
        length: "short",
        format: "plain-text",
      });
      const maybe = await summarizer.summarize(firstUserText);
      if (typeof maybe === "string" && maybe.trim()) {
        const safe = sanitizeTitle(maybe);
        const latest = conversationsRef.current.find(
          (c) => c.id === conversationId,
        );
        if (latest && looksDefaultTitle(latest.title, firstUserText)) {
          renameConversation(conversationId, safe);
        }
      }
    } catch (err) {
      console.warn("headline generation skipped:", err);
    } finally {
      titleRequestsRef.current.delete(conversationId);
    }
  }

  const handleSend = useCallback(
    async (text: string) => {
      if (!text.trim() || busy) return;

      let currentActive = active;
      let justCreated = false;
      if (!currentActive) {
        const created = createConversation({
          tool: pendingTool,
          model: pendingModel,
        });
        currentActive = created;
        justCreated = true;
      } else {
        const latestActive = conversations.find(
          (c) => c.id === currentActive!.id,
        );
        if (latestActive) {
          currentActive = latestActive;
        }
      }

      setBusy(true);

      const user: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: text.trim(),
      };
      const assistant: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "",
      };

      const wasEmpty = (currentActive?.messages?.length ?? 0) === 0;
      const preTitle = currentActive?.title ?? "New chat";
      appendMessages(currentActive.id, [user, assistant]);
      setInput("");

      if (wasEmpty) {
        if (looksDefaultTitle(preTitle, user.content)) {
          const fallbackTitle = user.content.trim().slice(0, 20) || "New chat";
          renameConversation(currentActive.id, fallbackTitle);
        }
        void generateTitleInBackground(currentActive.id, user.content);
      }

      const updateAssistant = (patch: Partial<ChatMessage>) =>
        updateMessage(currentActive.id, assistant.id, patch);

      try {
        const tool = currentActive.tool;

        if (tool === "chat") {
          const session = await ai.createPromptSession({
            system: settings.systemPrompt,
            temperature: settings.temperature,
            topK: settings.topK,
          });

          try {
            abortRef.current?.abort();
          } catch {}
          abortRef.current = new AbortController();

          const streamIt = await ai.promptStreaming(
            session,
            user.content,
            abortRef.current.signal,
          );

          if (!settings.stream) {
            let out = "";
            for await (const chunk of streamIt) {
              out +=
                typeof chunk === "string"
                  ? chunk
                  : String(chunk?.text ?? chunk);
            }
            updateAssistant({ content: out });
          } else {
            let accumulatedContent = "";
            for await (const chunk of streamIt) {
              const piece =
                typeof chunk === "string"
                  ? chunk
                  : String(chunk?.text ?? chunk);
              accumulatedContent += piece;
              updateAssistant({ content: accumulatedContent });
            }
          }
        } else if (tool === "summarize") {
          const s = await ai.createSummarizer({
            type: "tldr",
            length: "long",
            format: "plain-text",
          });
          const out = await s.summarize(user.content);
          updateAssistant({ content: String(out ?? "") });
        } else if (tool === "translate") {
          const t = await ai.createTranslator({
            sourceLanguage: "auto",
            targetLanguage: settings.targetLang,
          });
          const out = await t.translate(user.content);
          updateAssistant({ content: String(out ?? "") });
        } else if (tool === "detect") {
          const d = await ai.createDetector();
          const det = await d.detect(user.content);
          updateAssistant({ content: JSON.stringify(det, null, 2) });
        } else if (tool === "write") {
          const w = await ai.createWriter({ task: "compose" });
          const out = await w.write(user.content);
          updateAssistant({ content: String(out ?? "") });
        } else if (tool === "rewrite") {
          const r = await ai.createRewriter({ style: "neutral" });
          const out = await r.rewrite(user.content);
          updateAssistant({ content: String(out ?? "") });
        } else if (tool === "proofread") {
          const p = await ai.createProofreader({});
          const out = await p.proofread(user.content);
          updateAssistant({ content: String(out ?? "") });
        }
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }
        console.error("Error in handleSend:", error);
      } finally {
        abortRef.current = null;
        setBusy(false);
      }
    },
    [
      active,
      conversations,
      createConversation,
      pendingModel,
      pendingTool,
      busy,
      ai,
      settings,
      appendMessages,
      renameConversation,
      updateMessage,
    ],
  );

  const stop = () => {
    try {
      abortRef.current?.abort();
    } catch {}
    abortRef.current = null;
    setBusy(false);
  };

  function handleNewConversation() {
    const created = createConversation();
    setActiveId(created.id);
  }

  function handleSelectConversation(id: string) {
    setActiveId(id);
  }

  function handleDeleteConversation(id: string) {
    deleteConversation(id);
  }

  function handleRenameConversation(id: string, title: string) {
    renameConversation(id, title);
  }

  function handleToolChange(tool: Tool) {
    if (active) {
      setActiveTool(tool);
    } else {
      setPendingTool(tool);
    }
  }

  function handleModelChange(model: ModelId) {
    if (active) {
      setActiveModel(model);
    } else {
      setPendingModel(model);
    }
  }

  if (showBoot) {
    return (
      <div className="h-screen w-full bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <div className="rounded-none border-2 border-foreground bg-card shadow-xl">
            <div className="flex items-center justify-between px-3 py-2 bg-primary text-primary-foreground border-b-2 border-foreground">
              <Link
                href="/"
                className="flex items-center text-primary-foreground gap-2"
              >
                <Logo />
                <span className="text-sm text-primary-foreground font-semibold">
                  Nano Studio
                </span>
              </Link>
              <span className="text-[10px] uppercase">Loading</span>
            </div>
            <div className="p-4">
              <WindowsLoadingBar
                totalBlocks={50}
                filledBlocks={bootBlocks}
                className="mt-4 h-5 w-full"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!sessionUser) {
    const handleSignIn = (user: WindowsUser) => {
      const s = startSession({
        id: user.id,
        name: user.name,
        avatarUrl: user.avatarUrl,
      });
      setSessionUser(s.user);
    };
    return <Welcome onSignIn={handleSignIn} />;
  }

  return (
    <div className="flex h-screen bg-background">
      <div className="hidden lg:block w-80 h-screen flex-shrink-0 bg-card">
        <Sidebar
          conversations={conversations}
          activeId={activeId}
          onNew={handleNewConversation}
          onSelect={handleSelectConversation}
          onRename={handleRenameConversation}
          onDelete={handleDeleteConversation}
          promptStatus={ai.promptStatus}
          summarizerStatus={ai.summarizerStatus}
          translatorStatus={ai.translatorStatus}
          detectorStatus={ai.detectorStatus}
          writerStatus={ai.writerStatus}
          rewriterStatus={ai.rewriterStatus}
          proofreaderStatus={ai.proofreaderStatus}
          onDownload={downloadRequirement.handleDownload}
          downloading={busy}
        />
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        <header className="bg-primary flex items-center justify-between border-b px-3 py-3 lg:hidden">
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="flex items-center text-primary-foreground gap-2"
            >
              <Logo />
              <span className="text-sm text-primary-foreground font-semibold">
                Nano Studio
              </span>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Sidebar
              conversations={conversations}
              activeId={activeId}
              onNew={handleNewConversation}
              onSelect={handleSelectConversation}
              onRename={handleRenameConversation}
              onDelete={handleDeleteConversation}
              promptStatus={ai.promptStatus}
              summarizerStatus={ai.summarizerStatus}
              translatorStatus={ai.translatorStatus}
              detectorStatus={ai.detectorStatus}
              writerStatus={ai.writerStatus}
              rewriterStatus={ai.rewriterStatus}
              proofreaderStatus={ai.proofreaderStatus}
              onDownload={downloadRequirement.handleDownload}
              downloading={busy}
            />
          </div>
        </header>

        <main className="flex-1 flex flex-col min-h-0">
          {!hasMessages ? (
            <div className="flex-1 flex flex-col items-center justify-center px-6">
              <WelcomeText
                tool={active?.tool ?? pendingTool}
                model={active?.model ?? pendingModel}
              />

              <div className="w-full max-w-3xl">
                <PromptDock
                  tool={active?.tool ?? pendingTool}
                  setTool={handleToolChange}
                  model={active?.model ?? pendingModel}
                  setModel={handleModelChange}
                  targetLang={settings.targetLang}
                  setTargetLang={(lang) => update({ targetLang: lang })}
                  onSend={handleSend}
                  onStop={stop}
                  busy={busy}
                  thinking={isThinking}
                  promptStatus={ai.promptStatus}
                  summarizerStatus={ai.summarizerStatus}
                  translatorStatus={ai.translatorStatus}
                  detectorStatus={ai.detectorStatus}
                  writerStatus={ai.writerStatus}
                  rewriterStatus={ai.rewriterStatus}
                  proofreaderStatus={ai.proofreaderStatus}
                  mode="center"
                  onOpenSettings={() => setShowSettings(true)}
                />
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 px-6 overflow-hidden">
                <div className="h-full max-w-3xl mx-auto">
                  <ChatFeed messages={active?.messages ?? []} busy={busy} />
                </div>
              </div>

              <div className="px-6 pb-6">
                <div className="max-w-3xl mx-auto">
                  <PromptDock
                    tool={active?.tool ?? pendingTool}
                    setTool={handleToolChange}
                    model={active?.model ?? pendingModel}
                    setModel={handleModelChange}
                    targetLang={settings.targetLang}
                    setTargetLang={(lang) => update({ targetLang: lang })}
                    onSend={handleSend}
                    onStop={stop}
                    busy={busy}
                    thinking={isThinking}
                    promptStatus={ai.promptStatus}
                    summarizerStatus={ai.summarizerStatus}
                    translatorStatus={ai.translatorStatus}
                    detectorStatus={ai.detectorStatus}
                    writerStatus={ai.writerStatus}
                    rewriterStatus={ai.rewriterStatus}
                    proofreaderStatus={ai.proofreaderStatus}
                    mode="bottom"
                    onOpenSettings={() => setShowSettings(true)}
                  />
                </div>
              </div>
            </>
          )}
        </main>
      </div>

      <SettingsDialog
        open={showSettings}
        onOpenChange={setShowSettings}
        systemPrompt={settings.systemPrompt}
        setSystemPrompt={(prompt) => update({ systemPrompt: prompt })}
        temperature={settings.temperature}
        setTemperature={(temp) => update({ temperature: temp })}
        topK={settings.topK}
        setTopK={(topk) => update({ topK: topk })}
        stream={settings.stream}
        setStream={(s) => update({ stream: s })}
        targetLang={settings.targetLang}
        setTargetLang={(lang) => update({ targetLang: lang })}
        currentModel={active?.model ?? pendingModel}
        currentTool={active?.tool ?? pendingTool}
      />

      <DownloadRequiredDialog
        open={downloadRequirement.showDownloadDialog}
        onOpenChange={downloadRequirement.setShowDownloadDialog}
        promptStatus={ai.promptStatus}
        summarizerStatus={ai.summarizerStatus}
        translatorStatus={ai.translatorStatus}
        detectorStatus={ai.detectorStatus}
        writerStatus={ai.writerStatus}
        rewriterStatus={ai.rewriterStatus}
        proofreaderStatus={ai.proofreaderStatus}
        onDownload={downloadRequirement.handleDownload}
        onRefresh={downloadRequirement.handleRefresh}
        downloading={busy}
      />
    </div>
  );
}
