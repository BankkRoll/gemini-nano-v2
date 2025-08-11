export type AppSettings = {
  systemPrompt: string;
  temperature: number;
  topK: number;
  stream: boolean;
  targetLang: string;
};

export const DEFAULT_SETTINGS: AppSettings = {
  systemPrompt: "You are a helpful, concise assistant.",
  temperature: 0.7,
  topK: 1,
  stream: true,
  targetLang: "en",
};

export const STORAGE_KEYS = {
  conversations: "nano:conversations",
  activeId: "nano:active",
  settings: "nano:settings",
};

export const APP_STORAGE_VERSION = 1 as const;
