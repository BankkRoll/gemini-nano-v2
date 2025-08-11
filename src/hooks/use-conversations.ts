"use client";

import {
  readStoredChatState,
  setActiveConversationId,
  setConversations,
} from "@/lib/storage";
import type { ChatMessage, Conversation, ModelId, Tool } from "@/types";
import { useCallback, useEffect, useState } from "react";

export function useConversations(initialActiveId?: string | null) {
  const [conversations, setConversationsState] = useState<Conversation[]>([]);
  const [activeId, setActiveIdState] = useState<string | null>(null);
  const [active, setActiveState] = useState<Conversation | null>(null);

  useEffect(() => {
    const { conversations: initialConversations } = readStoredChatState();
    const sorted = [...initialConversations].sort(
      (a, b) => b.lastUpdatedAt - a.lastUpdatedAt,
    );
    setConversationsState(sorted);

    const finalActiveId =
      typeof initialActiveId === "string" &&
      initialConversations.some((c) => c.id === initialActiveId)
        ? initialActiveId
        : null;
    setActiveIdState(finalActiveId);

    const initialActive = finalActiveId
      ? initialConversations.find((c) => c.id === finalActiveId) || null
      : null;
    setActiveState(initialActive);
  }, [initialActiveId]);

  useEffect(() => {
    if (activeId) {
      const found = conversations.find((c) => c.id === activeId);
      if (found && (!active || active.id !== found.id || active !== found)) {
        setActiveState(found);
      }
    } else {
      setActiveState(null);
    }
  }, [activeId, conversations, active]);

  const createConversation = useCallback(
    (
      initial?: Partial<Pick<Conversation, "title" | "tool" | "model">>,
    ): Conversation => {
      const id = crypto.randomUUID();
      const now = Date.now();
      const newConversation: Conversation = {
        id,
        title: (initial?.title?.trim() || "New chat") as string,
        createdAt: now,
        lastUpdatedAt: now,
        model: (initial?.model ?? "auto") as Conversation["model"],
        tool: (initial?.tool ?? "chat") as Conversation["tool"],
        messages: [],
      };

      setConversationsState((prev) => {
        const updatedConversations = [newConversation, ...prev];
        setConversations(updatedConversations);
        return updatedConversations;
      });

      setActiveConversationId(id);
      setActiveIdState(id);
      setActiveState(newConversation);

      return newConversation;
    },
    [],
  );

  const setActiveId = useCallback(
    (id: string | null) => {
      setActiveConversationId(id);
      setActiveIdState(id);
      setActiveState((prev) => {
        if (!id) return null;
        return conversations.find((c) => c.id === id) || null;
      });
    },
    [conversations],
  );

  const renameConversation = useCallback(
    (id: string, title: string) => {
      setConversationsState((prev) => {
        const now = Date.now();
        const updatedConversations = prev
          .map((c) =>
            c.id === id
              ? {
                  ...c,
                  title: title.trim() || "Untitled",
                  lastUpdatedAt: now,
                }
              : c,
          )
          .sort((a, b) => b.lastUpdatedAt - a.lastUpdatedAt);

        setConversations(updatedConversations);

        if (active?.id === id) {
          const nextActive =
            updatedConversations.find((c) => c.id === id) || null;
          setActiveState(nextActive);
        }

        return updatedConversations;
      });
    },
    [active],
  );

  const deleteConversation = useCallback(
    (id: string) => {
      const updatedConversations = conversations.filter((c) => c.id !== id);

      setConversations(updatedConversations);

      setConversationsState(updatedConversations);

      if (activeId === id) {
        setActiveConversationId(null);
        setActiveIdState(null);
        setActiveState(null);
      }
    },
    [conversations, activeId],
  );

  const appendMessages = useCallback(
    (conversationId: string, messages: ChatMessage[]) => {
      setConversationsState((prev) => {
        const now = Date.now();
        const updatedConversations = prev
          .map((c) =>
            c.id === conversationId
              ? {
                  ...c,
                  messages: [...c.messages, ...messages],
                  lastUpdatedAt: now,
                }
              : c,
          )
          .sort((a, b) => b.lastUpdatedAt - a.lastUpdatedAt);

        setConversations(updatedConversations);

        const updatedActive =
          (activeId
            ? updatedConversations.find((c) => c.id === activeId)
            : null) || null;
        if (updatedActive || active) {
          setActiveState(updatedActive);
        }

        return updatedConversations;
      });
    },
    [active, activeId],
  );

  const updateMessage = useCallback(
    (
      conversationId: string,
      messageId: string,
      patch: Partial<ChatMessage>,
    ) => {
      setConversationsState((prev) => {
        const now = Date.now();
        const updatedConversations = prev
          .map((c) =>
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

        const updatedActive =
          (activeId
            ? updatedConversations.find((c) => c.id === activeId)
            : null) || null;
        if (updatedActive || active) {
          setActiveState(updatedActive);
        }

        return updatedConversations;
      });
    },
    [active, activeId],
  );

  const setActiveTool = useCallback(
    (tool: Tool) => {
      if (!active) return;
      const now = Date.now();
      const updatedConversation = { ...active, tool, lastUpdatedAt: now };
      const updatedConversations = conversations
        .map((c) => (c.id === active.id ? updatedConversation : c))
        .sort((a, b) => b.lastUpdatedAt - a.lastUpdatedAt);

      setConversations(updatedConversations);

      setConversationsState(updatedConversations);
      setActiveState(updatedConversation);
    },
    [active, conversations],
  );

  const setActiveModel = useCallback(
    (model: ModelId) => {
      if (!active) return;
      const now = Date.now();
      const updatedConversation = { ...active, model, lastUpdatedAt: now };
      const updatedConversations = conversations
        .map((c) => (c.id === active.id ? updatedConversation : c))
        .sort((a, b) => b.lastUpdatedAt - a.lastUpdatedAt);

      setConversations(updatedConversations);

      setConversationsState(updatedConversations);
      setActiveState(updatedConversation);
    },
    [active, conversations],
  );

  return {
    conversations,
    activeId,
    active,
    createConversation,
    setActiveId,
    renameConversation,
    deleteConversation,
    appendMessages,
    updateMessage,
    setActiveTool,
    setActiveModel,
  };
}
