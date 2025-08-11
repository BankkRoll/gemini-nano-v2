"use client";

import { cn } from "@/lib/utils";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { parseBlocks } from "./blocks";

interface MarkdownRendererProps {
  content: string;
  className?: string;
  isStreaming?: boolean;
}

export function MarkdownRenderer({
  content,
  className,
  isStreaming = false,
}: MarkdownRendererProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const prevContentRef = useRef<string>("");

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCode(text);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  }, []);

  const normalizeContent = useCallback((text: string) => {
    if (!text) return "";
    let normalized = text.replace(/\r\n/g, "\n");
    if (
      (normalized.startsWith('"') && normalized.endsWith('"')) ||
      (normalized.startsWith("'") && normalized.endsWith("'"))
    ) {
      normalized = normalized.slice(1, -1);
    }
    return normalized.trim();
  }, []);

  const parseMarkdown = useCallback(
    (text: string) => parseBlocks(text, { copyToClipboard, copiedCode }),
    [copyToClipboard, copiedCode],
  );

  const renderedContent = useMemo(() => {
    const normalized = normalizeContent(content);
    return parseMarkdown(normalized);
  }, [content, normalizeContent, parseMarkdown]);

  useEffect(() => {
    if (content !== prevContentRef.current) {
      prevContentRef.current = content;

      if (isStreaming && contentRef.current) {
        contentRef.current.innerHTML = "";
        const tempContainer = document.createElement("div");
        const root = createRoot(tempContainer);
        root.render(<>{renderedContent}</>);
        while (tempContainer.firstChild) {
          contentRef.current.appendChild(tempContainer.firstChild);
        }
      }
    }
  }, [content, renderedContent, isStreaming]);

  return (
    <div
      ref={contentRef}
      className={cn("markdown-content space-y-2", className)}
    >
      {!isStreaming && renderedContent}
    </div>
  );
}
