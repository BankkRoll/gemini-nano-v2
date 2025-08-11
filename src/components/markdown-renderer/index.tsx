"use client";

import { cn } from "@/lib/utils";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { createMarkdownComponents } from "./components";

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

  const components = useMemo(
    () => createMarkdownComponents({ copyToClipboard, copiedCode }),
    [copyToClipboard, copiedCode],
  );

  const normalizedContent = useMemo(
    () => normalizeContent(content),
    [content, normalizeContent],
  );

  useEffect(() => {
    if (content !== prevContentRef.current) {
      prevContentRef.current = content;

      if (isStreaming && contentRef.current) {
        // react-markdown handles this efficiently, but we can add custom logic if needed
      }
    }
  }, [content, isStreaming]);

  return (
    <div
      ref={contentRef}
      className={cn(
        "markdown-content space-y-2 w-full mx-auto max-w-[80svw] lg:max-w-[60svw] 2xl:max-w-5xl overflow-hidden break-words",
        className,
      )}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {normalizedContent}
      </ReactMarkdown>
    </div>
  );
}
