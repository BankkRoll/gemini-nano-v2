export type Availability =
  | "unavailable"
  | "downloadable"
  | "downloading"
  | "available";

export type Role = "user" | "assistant";

export type ChatMessage = {
  id: string;
  role: Role;
  content: string;
};

export type Tool =
  | "chat"
  | "summarize"
  | "translate"
  | "detect"
  | "write"
  | "rewrite"
  | "proofread";

export type ModelId = "auto" | "text" | "generic";

export type Conversation = {
  id: string;
  title: string;
  createdAt: number;
  lastUpdatedAt: number;
  model: ModelId;
  tool: Tool;
  messages: ChatMessage[];
};
