import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CheckCircle, Circle } from "lucide-react";
import { type Components } from "react-markdown";
import { CollapsibleCodeBlock } from "./code-block";

export interface MarkdownComponentsProps {
  copyToClipboard: (text: string) => void;
  copiedCode: string | null;
}

export function createMarkdownComponents({
  copyToClipboard,
  copiedCode,
}: MarkdownComponentsProps): Partial<Components> {
  return {
    code: ({ className, children, ...props }: any) => {
      const isInline = !className || !className.includes("language-");

      if (isInline) {
        return (
          <code
            className="bg-muted/50 px-1.5 py-0.5 rounded font-mono text-sm break-words break-all"
            {...props}
          >
            {children}
          </code>
        );
      }

      const language = className?.replace("language-", "") || "tsx";
      const code = String(children).replace(/\n$/, "");

      return (
        <CollapsibleCodeBlock
          code={code}
          language={language}
          copiedCode={copiedCode}
          onCopy={copyToClipboard}
          className="my-6"
        />
      );
    },

    pre: ({ children }) => <>{children}</>,

    // Headings
    h1: ({ children, ...props }) => (
      <h1
        className="text-3xl font-bold tracking-tight text-foreground mb-4 mt-8 first:mt-0 break-words"
        {...props}
      >
        {children}
      </h1>
    ),

    h2: ({ children, ...props }) => (
      <h2
        className="text-2xl font-bold tracking-tight text-foreground mb-4 mt-7 break-words"
        {...props}
      >
        {children}
      </h2>
    ),

    h3: ({ children, ...props }) => (
      <h3
        className="text-xl font-bold tracking-tight text-foreground mb-4 mt-6 break-words"
        {...props}
      >
        {children}
      </h3>
    ),

    h4: ({ children, ...props }) => (
      <h4
        className="text-lg font-bold tracking-tight text-foreground mb-3 mt-5 break-words"
        {...props}
      >
        {children}
      </h4>
    ),

    h5: ({ children, ...props }) => (
      <h5
        className="text-base font-bold tracking-tight text-foreground mb-3 mt-4 break-words"
        {...props}
      >
        {children}
      </h5>
    ),

    h6: ({ children, ...props }) => (
      <h6
        className="text-sm font-bold tracking-tight text-foreground mb-2 mt-3 break-words"
        {...props}
      >
        {children}
      </h6>
    ),

    // Lists
    ul: ({ children, ...props }) => (
      <ul
        className="list-disc list-outside ml-6 space-y-2 my-4 break-words"
        {...props}
      >
        {children}
      </ul>
    ),

    ol: ({ children, ...props }) => (
      <ol
        className="list-decimal list-outside ml-6 space-y-2 my-4 break-words"
        {...props}
      >
        {children}
      </ol>
    ),

    li: ({ children, ...props }: any) => {
      // Check if this is a task list item
      const text = String(children);
      const taskMatch = text.match(/^\[([ xX])\]\s(.+)$/);

      if (taskMatch) {
        const isCompleted = taskMatch[1].toLowerCase() === "x";
        const taskText = taskMatch[2];

        return (
          <li
            className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border/20 hover:bg-muted/50 transition-colors break-words"
            {...props}
          >
            <div className="flex-shrink-0 mt-0.5">
              {isCompleted ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <Circle className="w-5 h-5 text-muted-foreground" />
              )}
            </div>
            <span
              className={`text-sm leading-relaxed break-words ${
                isCompleted ? "line-through text-muted-foreground" : ""
              }`}
            >
              {taskText}
            </span>
          </li>
        );
      }

      return (
        <li className="text-sm leading-relaxed break-words" {...props}>
          {children}
        </li>
      );
    },

    // Blockquotes
    blockquote: ({ children, ...props }) => (
      <div className="relative my-6">
        <div className="relative pl-6 py-4 bg-gradient-to-r from-primary/5 to-primary/10 border-l-4 border-primary/30 rounded-r-xl">
          <blockquote
            className="text-sm italic text-muted-foreground leading-relaxed break-words"
            {...props}
          >
            {children}
          </blockquote>
        </div>
      </div>
    ),

    // Paragraphs
    p: ({ children, ...props }) => (
      <p
        className="text-sm leading-relaxed my-3 text-foreground/90 break-words"
        {...props}
      >
        {children}
      </p>
    ),

    // Links
    a: ({ href, children, ...props }) => {
      const safeHref =
        href && typeof href === "string" && /^(https?:)?\/\//i.test(href)
          ? href
          : undefined;
      if (!safeHref)
        return (
          <span className="break-words" {...props}>
            {children}
          </span>
        );

      return (
        <a
          href={safeHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-primary hover:text-primary/80 font-medium transition-colors group underline decoration-primary/30 underline-offset-4 break-words"
          {...props}
        >
          {children}
        </a>
      );
    },

    // Text formatting
    strong: ({ children, ...props }) => (
      <strong className="font-bold break-words" {...props}>
        {children}
      </strong>
    ),

    em: ({ children, ...props }) => (
      <em className="italic break-words" {...props}>
        {children}
      </em>
    ),

    del: ({ children, ...props }) => (
      <del
        className="line-through text-muted-foreground break-words"
        {...props}
      >
        {children}
      </del>
    ),

    // Tables
    table: ({ children, ...props }) => (
      <div className="relative my-6 overflow-x-auto max-w-full">
        <div className="border border-border/50 rounded-xl overflow-hidden shadow-lg max-w-full">
          <Table className="table-fixed w-full max-w-full" {...props}>
            {children}
          </Table>
        </div>
      </div>
    ),

    thead: ({ children, ...props }) => (
      <TableHeader {...props}>{children}</TableHeader>
    ),

    tbody: ({ children, ...props }) => (
      <TableBody {...props}>{children}</TableBody>
    ),

    tr: ({ children, ...props }) => <TableRow {...props}>{children}</TableRow>,

    th: ({ children, ...props }) => (
      <TableHead
        className="whitespace-normal break-words break-all align-top"
        {...props}
      >
        {children}
      </TableHead>
    ),

    td: ({ children, ...props }) => (
      <TableCell
        className="whitespace-normal break-words break-all align-top"
        {...props}
      >
        {children}
      </TableCell>
    ),

    // Horizontal rules
    hr: ({ ...props }) => (
      <hr
        className="my-8 border-0 h-px bg-gradient-to-r from-transparent via-border to-transparent"
        {...props}
      />
    ),

    // Images
    img: ({ src, alt, ...props }) => {
      const safeSrc =
        src &&
        typeof src === "string" &&
        (/^(https?:)?\/\//i.test(src) || src.startsWith("/"))
          ? src
          : undefined;
      if (!safeSrc) return null;

      return (
        <div className="my-4">
          <div className="inline-block">
            <img
              src={safeSrc}
              alt={alt || "Image"}
              loading="lazy"
              className="max-w-full h-auto border-2 border-foreground"
              referrerPolicy="no-referrer"
              draggable={false}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
              {...props}
            />
          </div>
        </div>
      );
    },
  };
}
