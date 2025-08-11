"use client";

import type { AppSettings } from "@/lib/config";
import {
  endSession,
  getSignedInUser,
  startSession,
  type SessionUser,
} from "@/lib/session";
import {
  getSettings,
  getUsers,
  readStoredChatState,
  setActiveConversationId,
  setConversations,
  setSettings,
  upsertUser,
} from "@/lib/storage";
import type { ChatMessage, Conversation, ModelId, Tool } from "@/types";
import { create } from "zustand";
import { shallow } from "zustand/shallow";

const win = typeof window !== "undefined" ? (window as any) : undefined;

type Availability =
  | "unavailable"
  | "downloadable"
  | "downloading"
  | "available";

function hasAvailability(
  obj: any,
): obj is { availability: () => Promise<string> } {
  return !!obj && typeof obj.availability === "function";
}

type AISlice = {
  promptStatus: Availability;
  summarizerStatus: Availability;
  translatorStatus: Availability;
  detectorStatus: Availability;
  writerStatus: Availability;
  rewriterStatus: Availability;
  proofreaderStatus: Availability;
  refreshAI: () => Promise<void>;
  createPromptSession: (opts?: {
    system?: string;
    temperature?: number;
    topK?: number;
  }) => Promise<any>;
  promptStreaming: (
    session: any,
    input: string,
    signal?: AbortSignal,
  ) => Promise<AsyncIterable<string>>;
  createSummarizer: (opts?: any) => Promise<any>;
  createTranslator: (opts?: any) => Promise<any>;
  createDetector: (opts?: any) => Promise<any>;
  createWriter: (opts?: any) => Promise<any>;
  createRewriter: (opts?: any) => Promise<any>;
  createProofreader: (opts?: any) => Promise<any>;
};

type SettingsSlice = {
  settings: AppSettings;
  updateSettings: (
    next: Partial<AppSettings> | ((prev: AppSettings) => AppSettings),
  ) => void;
  resetSettings: () => void;
};

type SessionSlice = {
  sessionUser: SessionUser | null;
  signIn: (user: SessionUser) => void;
  signOut: () => void;
  users: SessionUser[];
  refreshUsers: () => void;
  createUser: (user: SessionUser) => void;
};

type ConversationsSlice = {
  conversations: Conversation[];
  activeId: string | null;
  pendingTool: Tool | null;
  pendingModel: ModelId | null;
  setActiveId: (id: string | null) => void;
  createConversation: (
    initial?: Partial<Pick<Conversation, "title" | "tool" | "model">>,
  ) => Conversation;
  renameConversation: (id: string, title: string) => void;
  deleteConversation: (id: string) => void;
  appendMessages: (conversationId: string, messages: ChatMessage[]) => void;
  updateMessage: (
    conversationId: string,
    messageId: string,
    patch: Partial<ChatMessage>,
  ) => void;
  setActiveTool: (tool: Tool) => void;
  setActiveModel: (model: ModelId) => void;
};

type ChatRuntimeSlice = {
  busy: boolean;
  thinking: boolean;
  send: (text: string) => Promise<void>;
  stop: () => void;
};

type DownloadSlice = {
  downloadOpen: boolean;
  setDownloadOpen: (v: boolean) => void;
  handleDownload: () => Promise<void>;
  handleRefresh: () => void;
};

type UISlice = {
  showSettings: boolean;
  setShowSettings: (v: boolean) => void;
};

type Hydration = {
  hydrate: () => void;
};

export type AppState = SettingsSlice &
  SessionSlice &
  ConversationsSlice &
  AISlice &
  ChatRuntimeSlice &
  DownloadSlice &
  UISlice &
  Hydration;

async function readAvailability(obj: any): Promise<Availability> {
  try {
    if (!obj) return "unavailable";
    if (hasAvailability(obj)) {
      const s = await obj.availability();
      if (s === "available") return "available";
      if (s === "after-download" || s === "downloadable") return "downloadable";
      if (s === "downloading") return "downloading";
      return "unavailable";
    }
    if (win?.ai?.canCreateTextSession) {
      const can = await win.ai.canCreateTextSession();
      if (can === "readily") return "available";
      if (can === "after-download") return "downloadable";
      return "unavailable";
    }
    return "unavailable";
  } catch {
    return "unavailable";
  }
}

export const useAppStore = create<AppState>((set, get) => ({
  settings: getSettings(),
  updateSettings: (next) => {
    const value =
      typeof next === "function"
        ? next(get().settings)
        : { ...get().settings, ...next };
    const normalized = setSettings(value);
    set({ settings: normalized });
  },
  resetSettings: () => {
    const reset = setSettings({});
    set({ settings: reset });
  },

  sessionUser: getSignedInUser(),
  users: getUsers() as any,
  refreshUsers: () => set({ users: getUsers() as any }),
  createUser: (user) => {
    upsertUser(user as any);
    set({ users: getUsers() as any });
  },
  signIn: (user) => {
    const s = startSession(user);
    upsertUser(user as any);
    setActiveConversationId(null);
    set({ sessionUser: s.user, users: getUsers() as any, activeId: null });
  },
  signOut: () => {
    endSession();
    setActiveConversationId(null);
    set({ sessionUser: null, activeId: null });
  },

  conversations: [],
  activeId: null,
  pendingTool: null as Tool | null,
  pendingModel: null as ModelId | null,
  setActiveId: (id) => {
    setActiveConversationId(id);
    set({ activeId: id });
  },
  createConversation: (initial) => {
    const id = crypto.randomUUID();
    const now = Date.now();
    const newConversation: Conversation = {
      id,
      title: (initial?.title?.trim() || "New chat") as string,
      createdAt: now,
      lastUpdatedAt: now,
      model: (initial?.model ??
        get().pendingModel ??
        "auto") as Conversation["model"],
      tool: (initial?.tool ??
        get().pendingTool ??
        "chat") as Conversation["tool"],
      messages: [],
    };

    const updatedConversations = [newConversation, ...get().conversations];
    setConversations(updatedConversations);
    set({ conversations: updatedConversations, activeId: id });
    return newConversation;
  },
  renameConversation: (id, title) => {
    const now = Date.now();
    const updatedConversations = get()
      .conversations.map((c) =>
        c.id === id
          ? { ...c, title: title.trim() || "Untitled", lastUpdatedAt: now }
          : c,
      )
      .sort((a, b) => b.lastUpdatedAt - a.lastUpdatedAt);

    setConversations(updatedConversations);
    set({ conversations: updatedConversations });
  },
  deleteConversation: (id) => {
    const updatedConversations = get().conversations.filter((c) => c.id !== id);
    setConversations(updatedConversations);
    set({ conversations: updatedConversations });
    if (get().activeId === id) {
      setActiveConversationId(null);
      set({ activeId: null });
    }
  },
  appendMessages: (conversationId, messages) => {
    const now = Date.now();
    const updatedConversations = get()
      .conversations.map((c) =>
        c.id === conversationId
          ? { ...c, messages: [...c.messages, ...messages], lastUpdatedAt: now }
          : c,
      )
      .sort((a, b) => b.lastUpdatedAt - a.lastUpdatedAt);

    setConversations(updatedConversations);
    set({ conversations: updatedConversations });
  },
  updateMessage: (conversationId, messageId, patch) => {
    const now = Date.now();
    const updatedConversations = get()
      .conversations.map((c) =>
        c.id === conversationId
          ? {
              ...c,
              messages: c.messages.map((m) =>
                m.id === messageId ? { ...m, ...patch } : m,
              ),
              lastUpdatedAt: now,
            }
          : c,
      )
      .sort((a, b) => b.lastUpdatedAt - a.lastUpdatedAt);

    setConversations(updatedConversations);
    set({ conversations: updatedConversations });
  },
  setActiveTool: (tool) => {
    const { activeId, conversations } = get();
    const now = Date.now();
    if (!activeId) {
      set({ pendingTool: tool });
      return;
    }
    const updatedConversations = conversations
      .map((c) => (c.id === activeId ? { ...c, tool, lastUpdatedAt: now } : c))
      .sort((a, b) => b.lastUpdatedAt - a.lastUpdatedAt);
    setConversations(updatedConversations);
    set({ conversations: updatedConversations });
  },
  setActiveModel: (model) => {
    const { activeId, conversations } = get();
    const now = Date.now();
    if (!activeId) {
      set({ pendingModel: model });
      return;
    }
    const updatedConversations = conversations
      .map((c) => (c.id === activeId ? { ...c, model, lastUpdatedAt: now } : c))
      .sort((a, b) => b.lastUpdatedAt - a.lastUpdatedAt);
    setConversations(updatedConversations);
    set({ conversations: updatedConversations });
  },

  promptStatus: "unavailable",
  summarizerStatus: "unavailable",
  translatorStatus: "unavailable",
  detectorStatus: "unavailable",
  writerStatus: "unavailable",
  rewriterStatus: "unavailable",
  proofreaderStatus: "unavailable",
  refreshAI: async () => {
    set({
      promptStatus: await readAvailability(win?.LanguageModel ?? win?.ai),
      summarizerStatus: await readAvailability(win?.Summarizer),
      translatorStatus: await readAvailability(
        win?.translation?.Translator ?? win?.Translator,
      ),
      detectorStatus: await readAvailability(
        win?.translation?.LanguageDetector ?? win?.LanguageDetector,
      ),
      writerStatus: await readAvailability(win?.Writer),
      rewriterStatus: await readAvailability(win?.Rewriter),
      proofreaderStatus: await readAvailability(win?.Proofreader),
    });
  },
  createPromptSession: async (opts = {}) => {
    if (win?.ai?.createTextSession) {
      return await win.ai.createTextSession({
        initialPrompts: opts.system
          ? [{ role: "system", content: opts.system }]
          : [],
        temperature: opts.temperature,
        topK: opts.topK,
      });
    }
    if (win?.LanguageModel?.create) {
      return await win.LanguageModel.create({
        initialPrompts: opts.system
          ? [{ role: "system", content: opts.system }]
          : [],
        temperature: opts.temperature,
        topK: opts.topK,
      });
    }
    throw new Error("Prompt API unavailable in this browser.");
  },
  promptStreaming: async (session, input, signal) => {
    if (typeof session?.promptStreaming === "function") {
      return await session.promptStreaming(input, { signal });
    }
    const res = await session?.prompt?.(input, { signal });
    async function* one() {
      yield String(res ?? "");
    }
    return one();
  },
  createSummarizer: async (opts = {}) => {
    if (!win?.Summarizer?.create)
      throw new Error("Summarizer API unavailable.");
    return await win.Summarizer.create(opts);
  },
  createTranslator: async (opts = {}) => {
    const T = win?.translation?.Translator ?? win?.Translator;
    if (!T?.create) throw new Error("Translator API unavailable.");
    return await T.create(opts);
  },
  createDetector: async (opts = {}) => {
    const D = win?.translation?.LanguageDetector ?? win?.LanguageDetector;
    if (!D?.create) throw new Error("Language Detector API unavailable.");
    return await D.create(opts);
  },
  createWriter: async (opts = {}) => {
    if (!win?.Writer?.create) throw new Error("Writer API unavailable.");
    return await win.Writer.create(opts);
  },
  createRewriter: async (opts = {}) => {
    if (!win?.Rewriter?.create) throw new Error("Rewriter API unavailable.");
    return await win.Rewriter.create(opts);
  },
  createProofreader: async (opts = {}) => {
    if (!win?.Proofreader?.create)
      throw new Error("Proofreader API unavailable.");
    return await win.Proofreader.create(opts);
  },

  busy: false,
  thinking: false,
  send: async (text) => {
    const trimmed = text.trim();
    if (!trimmed || get().busy) return;

    let activeId = get().activeId;
    if (!activeId) {
      const created = get().createConversation({});
      activeId = created.id;
    }

    const active = get().conversations.find((c) => c.id === activeId);
    if (!active) return;

    set({ busy: true, thinking: true });

    const user: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
      userId: get().sessionUser?.id,
      userName: get().sessionUser?.name,
      userAvatarUrl: get().sessionUser?.avatarUrl,
    };
    const assistant: ChatMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "",
    };

    const wasEmpty = (active.messages?.length ?? 0) === 0;
    const preTitle = active.title ?? "New chat";

    get().appendMessages(activeId, [user, assistant]);

    if (wasEmpty && preTitle === "New chat") {
      const fallbackTitle = trimmed.slice(0, 20) || "New chat";
      get().renameConversation(activeId, fallbackTitle);
    }

    const updateAssistant = (patch: Partial<ChatMessage>) =>
      get().updateMessage(activeId!, assistant.id, patch);

    try {
      const tool = active.tool;

      if (tool === "chat") {
        const session = await get().createPromptSession({
          system: get().settings.systemPrompt,
          temperature: get().settings.temperature,
          topK: get().settings.topK,
        });

        const streamIt = await get().promptStreaming(session, user.content);

        if (!get().settings.stream) {
          let out = "";
          for await (const chunk of streamIt) {
            out += typeof chunk === "string" ? chunk : String(chunk);
          }
          updateAssistant({ content: out });
        } else {
          let accumulatedContent = "";
          for await (const chunk of streamIt) {
            const piece = typeof chunk === "string" ? chunk : String(chunk);
            accumulatedContent += piece;
            updateAssistant({ content: accumulatedContent });
          }
        }
      } else if (tool === "summarize") {
        const s = await get().createSummarizer({
          type: "tldr",
          length: "long",
          format: "plain-text",
        });
        const out = await s.summarize(user.content);
        updateAssistant({ content: String(out ?? "") });
      } else if (tool === "translate") {
        const t = await get().createTranslator({
          sourceLanguage: "auto",
          targetLanguage: get().settings.targetLang,
        });
        const out = await t.translate(user.content);
        updateAssistant({ content: String(out ?? "") });
      } else if (tool === "detect") {
        const d = await get().createDetector();
        const det = await d.detect(user.content);
        updateAssistant({ content: JSON.stringify(det, null, 2) });
      } else if (tool === "write") {
        const w = await get().createWriter({ task: "compose" });
        const out = await w.write(user.content);
        updateAssistant({ content: String(out ?? "") });
      } else if (tool === "rewrite") {
        const r = await get().createRewriter({ style: "neutral" });
        const out = await r.rewrite(user.content);
        updateAssistant({ content: String(out ?? "") });
      } else if (tool === "proofread") {
        const p = await get().createProofreader({});
        const out = await p.proofread(user.content);
        updateAssistant({ content: String(out ?? "") });
      }
    } catch (error) {
      console.error("Error in send:", error);
    } finally {
      set({ busy: false, thinking: false });
    }
  },
  stop: () => {
    set({ busy: false, thinking: false });
  },

  downloadOpen: false,
  setDownloadOpen: (v) => set({ downloadOpen: v }),
  handleDownload: async () => {
    try {
      await get().refreshAI();
      const session = await get().createPromptSession({
        system: "Initialize model.",
        temperature: 0.7,
        topK: 1,
      });
      await session?.prompt?.("warm up");
      await get().refreshAI();
    } catch (error) {
      console.error("Download failed:", error);
    }
  },
  handleRefresh: () => {
    void get().refreshAI();
  },

  showSettings: false,
  setShowSettings: (v) => set({ showSettings: v }),

  hydrate: () => {
    const { conversations, activeId } = readStoredChatState();
    const sessionUser = getSignedInUser();
    set({ conversations, activeId, sessionUser });
  },
}));

export const useShallow = shallow;
