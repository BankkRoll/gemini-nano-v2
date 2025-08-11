import type { ChatMessage, Conversation, ModelId, Tool } from "@/types";
import {
  APP_STORAGE_VERSION,
  DEFAULT_SETTINGS,
  STORAGE_KEYS,
  type AppSettings,
} from "./config";

type StoredRoot = {
  v: number;
};

function isClient() {
  return typeof window !== "undefined";
}

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isBoolean(value: unknown): value is boolean {
  return typeof value === "boolean";
}

function isRole(value: unknown): value is ChatMessage["role"] {
  return value === "user" || value === "assistant";
}

function isTool(value: unknown): value is Tool {
  return (
    value === "chat" ||
    value === "summarize" ||
    value === "translate" ||
    value === "detect" ||
    value === "write" ||
    value === "rewrite" ||
    value === "proofread"
  );
}

function isModelId(value: unknown): value is ModelId {
  return value === "auto" || value === "text" || value === "generic";
}

function isMessage(value: unknown): value is ChatMessage {
  const v = value as any;
  return v && isString(v.id) && isRole(v.role) && isString(v.content);
}

function isConversation(value: unknown): value is Conversation {
  const v = value as any;
  return (
    v &&
    isString(v.id) &&
    isString(v.title) &&
    isNumber(v.createdAt) &&
    isNumber(v.lastUpdatedAt) &&
    isModelId(v.model) &&
    isTool(v.tool) &&
    Array.isArray(v.messages) &&
    v.messages.every(isMessage)
  );
}

function coerceSettings(value: unknown): AppSettings {
  const v = value as any;
  const systemPrompt =
    isString(v?.systemPrompt) && v.systemPrompt.trim().length > 0
      ? v.systemPrompt
      : DEFAULT_SETTINGS.systemPrompt;
  const temperature = isNumber(v?.temperature)
    ? Math.max(0, Math.min(2, v.temperature))
    : DEFAULT_SETTINGS.temperature;
  const topK = isNumber(v?.topK)
    ? Math.max(1, Math.min(40, Math.floor(v.topK)))
    : DEFAULT_SETTINGS.topK;
  const stream = isBoolean(v?.stream) ? v.stream : DEFAULT_SETTINGS.stream;
  const targetLang =
    isString(v?.targetLang) && v.targetLang.trim().length > 0
      ? v.targetLang
      : DEFAULT_SETTINGS.targetLang;
  return { systemPrompt, temperature, topK, stream, targetLang };
}

function readSettingsRaw(): AppSettings | null {
  if (!isClient()) return null;
  const raw = safeParse<{ v: number; settings: AppSettings }>(
    localStorage.getItem(STORAGE_KEYS.settings),
  );
  if (!raw) return null;
  if (raw.v !== APP_STORAGE_VERSION) return null;
  return coerceSettings(raw.settings);
}

export function getSettings(): AppSettings {
  if (!isClient()) return DEFAULT_SETTINGS;
  const existing = readSettingsRaw();
  if (existing) return existing;
  try {
    localStorage.setItem(
      STORAGE_KEYS.settings,
      JSON.stringify({ v: APP_STORAGE_VERSION, settings: DEFAULT_SETTINGS }),
    );
  } catch {}
  return DEFAULT_SETTINGS;
}

export function setSettings(
  next: Partial<AppSettings> | ((prev: AppSettings) => AppSettings),
) {
  if (!isClient()) return DEFAULT_SETTINGS;
  const prev = getSettings();
  const value =
    typeof next === "function" ? (next as any)(prev) : { ...prev, ...next };
  const normalized = coerceSettings(value);
  try {
    localStorage.setItem(
      STORAGE_KEYS.settings,
      JSON.stringify({ v: APP_STORAGE_VERSION, settings: normalized }),
    );
  } catch {}
  return normalized;
}

export function getConversations(): Conversation[] {
  if (!isClient()) return [];
  const raw = safeParse<{ v: number; conversations: unknown }>(
    localStorage.getItem(STORAGE_KEYS.conversations),
  );
  if (
    raw &&
    raw.v === APP_STORAGE_VERSION &&
    Array.isArray(raw.conversations)
  ) {
    const list = raw.conversations as any[];
    const migrated: Conversation[] = list
      .map((c: any) => {
        if (!c) return null;
        const withTimestamps = {
          ...c,
          createdAt: isNumber(c.createdAt) ? c.createdAt : Date.now(),
          lastUpdatedAt: isNumber(c.lastUpdatedAt)
            ? c.lastUpdatedAt
            : isNumber(c.createdAt)
              ? c.createdAt
              : Date.now(),
        };
        return isConversation(withTimestamps)
          ? (withTimestamps as Conversation)
          : null;
      })
      .filter(Boolean) as Conversation[];
    migrated.sort((a, b) => b.lastUpdatedAt - a.lastUpdatedAt);
    return migrated;
  }
  return [];
}

export function setConversations(conversations: Conversation[]) {
  if (!isClient()) return [];
  const filtered = Array.isArray(conversations)
    ? conversations.filter(isConversation)
    : [];
  try {
    localStorage.setItem(
      STORAGE_KEYS.conversations,
      JSON.stringify({ v: APP_STORAGE_VERSION, conversations: filtered }),
    );
  } catch {}
  return filtered;
}

export function getActiveConversationId(): string | null {
  if (!isClient()) return null;
  const raw = safeParse<{ v: number; id: unknown }>(
    localStorage.getItem(STORAGE_KEYS.activeId),
  );
  if (raw && raw.v === APP_STORAGE_VERSION && isString(raw.id)) return raw.id;
  return null;
}

export function setActiveConversationId(id: string | null) {
  if (!isClient()) return id;
  try {
    localStorage.setItem(
      STORAGE_KEYS.activeId,
      JSON.stringify({ v: APP_STORAGE_VERSION, id: id ?? null }),
    );
  } catch {}
  return id;
}

export function readStoredChatState(): {
  conversations: Conversation[];
  activeId: string | null;
} {
  if (!isClient()) {
    return { conversations: [], activeId: null };
  }

  const conversations = getConversations();
  const activeId = getActiveConversationId();

  return { conversations, activeId };
}

export function onStorageChange(listener: () => void) {
  if (!isClient()) return () => {};
  const handler = (e: StorageEvent) => {
    if (!e.key) return;
    if (
      e.key === STORAGE_KEYS.settings ||
      e.key === STORAGE_KEYS.conversations ||
      e.key === STORAGE_KEYS.activeId
    )
      listener();
  };
  window.addEventListener("storage", handler);
  return () => window.removeEventListener("storage", handler);
}
