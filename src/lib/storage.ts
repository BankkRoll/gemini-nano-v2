import type { WindowsUser } from "@/components/signin/welcome";
import {
  APP_STORAGE_VERSION,
  DEFAULT_SETTINGS,
  STORAGE_KEYS,
  type AppSettings,
} from "@/lib/config";
import { getSignedInUser } from "@/lib/session";
import type { ChatMessage, Conversation, ModelId, Tool } from "@/types";

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
  const key = scopedKey(STORAGE_KEYS.settings);
  const raw = safeParse<{ v: number; settings: AppSettings }>(
    localStorage.getItem(key) ?? localStorage.getItem(STORAGE_KEYS.settings),
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
      scopedKey(STORAGE_KEYS.settings),
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
      scopedKey(STORAGE_KEYS.settings),
      JSON.stringify({ v: APP_STORAGE_VERSION, settings: normalized }),
    );
  } catch {}
  return normalized;
}

export function getConversations(): Conversation[] {
  if (!isClient()) return [];
  const key = scopedKey(STORAGE_KEYS.conversations);
  const raw = safeParse<{ v: number; conversations: unknown }>(
    localStorage.getItem(key) ??
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
      scopedKey(STORAGE_KEYS.conversations),
      JSON.stringify({ v: APP_STORAGE_VERSION, conversations: filtered }),
    );
  } catch {}
  return filtered;
}

export function getActiveConversationId(): string | null {
  if (!isClient()) return null;
  const key = scopedKey(STORAGE_KEYS.activeId);
  const raw = safeParse<{ v: number; id: unknown }>(
    localStorage.getItem(key) ?? localStorage.getItem(STORAGE_KEYS.activeId),
  );
  if (raw && raw.v === APP_STORAGE_VERSION && isString(raw.id)) return raw.id;
  return null;
}

export function setActiveConversationId(id: string | null) {
  if (!isClient()) return id;
  try {
    localStorage.setItem(
      scopedKey(STORAGE_KEYS.activeId),
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
    const suffixes = [
      STORAGE_KEYS.settings.split(":").slice(-1)[0],
      STORAGE_KEYS.conversations.split(":").slice(-1)[0],
      STORAGE_KEYS.activeId.split(":").slice(-1)[0],
    ];
    if (suffixes.some((s) => e.key?.endsWith(`:${s}`))) listener();
  };
  window.addEventListener("storage", handler);
  return () => window.removeEventListener("storage", handler);
}

function scopedKey(base: string): string {
  const userId = getSignedInUser()?.id || "user";
  return base.replace(/^nano:/, `nano:${userId}:`);
}

export function getUsers(): WindowsUser[] {
  if (!isClient())
    return [{ id: "user", name: "User", avatarUrl: "/logo.svg" }];
  const raw = safeParse<{ v: number; users: WindowsUser[] }>(
    localStorage.getItem("nano:users"),
  );
  if (raw && raw.v === APP_STORAGE_VERSION && Array.isArray(raw.users)) {
    const safe = raw.users.filter(
      (u) => u && typeof u.id === "string" && typeof u.name === "string",
    );
    return safe.length > 0
      ? safe
      : [{ id: "user", name: "User", avatarUrl: "/logo.svg" }];
  }
  return [{ id: "user", name: "User", avatarUrl: "/logo.svg" }];
}

export function upsertUser(user: WindowsUser) {
  if (!isClient()) return;
  const existing = getUsers();
  const filtered = existing.filter((u) => u.id !== user.id);
  const next = [user, ...filtered];
  try {
    localStorage.setItem(
      "nano:users",
      JSON.stringify({ v: APP_STORAGE_VERSION, users: next }),
    );
  } catch {}
}
