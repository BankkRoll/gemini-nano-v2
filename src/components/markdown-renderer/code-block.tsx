"use client";

import { cn } from "@/lib/utils";
import { Check, ChevronDown, Copy } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { codeToHtml } from "shiki";

export type CodeBlockProps = {
  children?: React.ReactNode;
  className?: string;
} & React.HTMLProps<HTMLDivElement>;

export function CodeBlock({ children, className, ...props }: CodeBlockProps) {
  return (
    <div
      className={cn(
        "not-prose flex w-full flex-col overflow-hidden border-2",
        "border-foreground bg-card text-card-foreground rounded-none shadow-sm",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export type CodeBlockCodeProps = {
  code: string;
  language?: string;
  theme?: string;
  className?: string;
} & React.HTMLProps<HTMLDivElement>;

export function CodeBlockCode({
  code,
  language = "tsx",
  theme = "github-light",
  className,
  ...props
}: CodeBlockCodeProps) {
  const [highlightedHtml, setHighlightedHtml] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function highlight() {
      try {
        const safeCode = typeof code === "string" ? code : String(code ?? "");
        const html = await codeToHtml(safeCode, {
          lang: language,
          theme: "github-light",
        });
        if (active) setHighlightedHtml(html);
      } catch {
        if (active) setHighlightedHtml(null);
      }
    }
    highlight();
    return () => {
      active = false;
    };
  }, [code, language]);

  const classNames = cn(
    "w-full overflow-x-auto text-[13px]",
    "[&>pre]:px-4 [&>pre]:py-3 [&>pre]:m-0 [&>pre]:bg-transparent [&>pre]:border-0",
    "[&_.shiki]:bg-transparent [&_.shiki]:!bg-transparent [&_.shiki]:!bg-[transparent]",
    className,
  );

  return highlightedHtml ? (
    <div
      className={classNames}
      dangerouslySetInnerHTML={{ __html: highlightedHtml }}
      {...props}
    />
  ) : (
    <div className={classNames} {...props}>
      <pre>
        <code>{code}</code>
      </pre>
    </div>
  );
}

export type CodeBlockGroupProps = React.HTMLAttributes<HTMLDivElement>;

export function CodeBlockGroup({
  children,
  className,
  ...props
}: CodeBlockGroupProps) {
  return (
    <div
      className={cn("flex items-center justify-between", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export type CollapsibleCodeBlockProps = {
  code: string;
  language?: string;
  copiedCode?: string | null;
  onCopy?: (text: string) => void;
  initiallyOpen?: boolean;
  previewLines?: number;
  className?: string;
} & Omit<React.HTMLAttributes<HTMLDivElement>, "onCopy">;

export function CollapsibleCodeBlock({
  code,
  language = "tsx",
  copiedCode,
  onCopy,
  initiallyOpen = false,
  previewLines = 3,
  className,
  ...props
}: CollapsibleCodeBlockProps) {
  const [isOpen, setIsOpen] = useState<boolean>(initiallyOpen);

  const { previewCode, isTruncated } = useMemo(() => {
    const lines = (code ?? "").split("\n");
    if (lines.length <= previewLines) {
      return { previewCode: code ?? "", isTruncated: false };
    }
    const truncated = [...lines.slice(0, previewLines), "…"].join("\n");
    return { previewCode: truncated, isTruncated: true };
  }, [code, previewLines]);

  const handleCopy = () => {
    if (onCopy) onCopy(code);
  };

  return (
    <CodeBlock className={className} {...props}>
      <CodeBlockGroup className="px-4 py-2 border-b border-border/30 bg-muted/50">
        <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
          {language || "code"}
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleCopy}
            className="p-1.5 rounded-md hover:bg-muted-foreground/10 transition-colors"
            aria-label="Copy code"
          >
            {copiedCode === code ? (
              <Check className="w-4 h-4 text-green-500" />
            ) : (
              <Copy className="w-4 h-4 text-muted-foreground" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setIsOpen((v) => !v)}
            className="p-1.5 rounded-md hover:bg-muted-foreground/10 transition-colors"
            aria-label={isOpen ? "Collapse code" : "Expand code"}
            aria-expanded={isOpen}
          >
            <ChevronDown
              className={cn(
                "w-4 h-4 text-muted-foreground transition-transform",
                isOpen ? "rotate-180" : "rotate-0",
              )}
            />
          </button>
        </div>
      </CodeBlockGroup>
      <div className="relative">
        {isOpen ? (
          <CodeBlockCode code={code} language={language} />
        ) : (
          <div className="relative">
            <CodeBlockCode code={previewCode} language={language} />
            {isTruncated && (
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-muted to-transparent" />
            )}
          </div>
        )}
      </div>
    </CodeBlock>
  );
}
