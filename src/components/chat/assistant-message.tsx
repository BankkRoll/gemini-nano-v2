"use client";

import { MarkdownRenderer } from "@/components/markdown-renderer";
import { memo } from "react";

function AssistantMessageBase({ content }: { content: string }) {
  if (!content) return null;
  return <MarkdownRenderer content={content} />;
}

export const AssistantMessage = memo(AssistantMessageBase);
