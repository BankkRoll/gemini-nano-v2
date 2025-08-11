import React from "react";

export function processInlineMarkdown(text: string): React.ReactElement[] {
  if (!text) return [];

  const elements: React.ReactElement[] = [];
  let lastIndex = 0;

  const patterns = [
    { regex: /\*\*([^*]+)\*\*/g, type: "bold" as const },
    { regex: /\*([^*]+)\*/g, type: "italic" as const },
    { regex: /~~([^~]+)~~/g, type: "strikethrough" as const },
    { regex: /`([^`]+)`/g, type: "inline-code" as const },
    {
      regex: /\[([^\]]+)\]\(([^"\)\s]+)(?:\s+"([^"]+)")?\)/g,
      type: "link" as const,
    },
    { regex: /!\[([^\]]*)\]\(([^)]+)\)/g, type: "image" as const },
    { regex: /(https?:\/\/[^\s]+)/g, type: "url" as const },
  ];

  const matches: Array<{
    type: string;
    content: string;
    url?: string;
    alt?: string;
    title?: string;
    start: number;
    end: number;
  }> = [];

  patterns.forEach(({ regex, type }) => {
    let match: RegExpExecArray | null;
    while ((match = regex.exec(text)) !== null) {
      if (type === "link") {
        const href = match[2];
        const title = match[3];
        const safeHref = /^(https?:)?\/\//i.test(href) ? href : undefined;
        matches.push({
          type,
          content: match[1],
          url: safeHref,
          title,
          start: match.index,
          end: match.index + match[0].length,
        });
      } else if (type === "image") {
        const src = match[2];
        const safeSrc =
          /^(https?:)?\/\//i.test(src) || src.startsWith("/") ? src : undefined;
        matches.push({
          type,
          content: safeSrc || "",
          alt: match[1] || "Image",
          start: match.index,
          end: match.index + match[0].length,
        });
      } else if (type === "url") {
        const href = match[1];
        const safeHref = /^(https?:)?\/\//i.test(href) ? href : undefined;
        matches.push({
          type,
          content: safeHref || "",
          url: safeHref,
          start: match.index,
          end: match.index + match[1].length,
        });
      } else {
        matches.push({
          type,
          content: match[1],
          start: match.index,
          end: match.index + match[0].length,
        });
      }
    }
  });

  matches.sort((a, b) => a.start - b.start);

  matches.forEach((match) => {
    if (match.start > lastIndex) {
      const textBefore = text.slice(lastIndex, match.start);
      if (textBefore.trim())
        elements.push(
          <span key={`text-${elements.length}`}>{textBefore}</span>,
        );
    }
    switch (match.type) {
      case "bold":
        elements.push(
          <strong key={`bold-${elements.length}`} className="font-bold">
            {match.content}
          </strong>,
        );
        break;
      case "italic":
        elements.push(
          <em key={`italic-${elements.length}`} className="italic">
            {match.content}
          </em>,
        );
        break;
      case "strikethrough":
        elements.push(
          <del
            key={`strike-${elements.length}`}
            className="line-through text-muted-foreground"
          >
            {match.content}
          </del>,
        );
        break;
      case "inline-code":
        elements.push(
          <code
            key={`inline-code-${elements.length}`}
            className="bg-muted/50 px-1.5 py-0.5 rounded font-mono text-sm"
          >
            {match.content}
          </code>,
        );
        break;
      case "link":
        if (!match.url) {
          elements.push(
            <span key={`link-${elements.length}`}>{match.content}</span>,
          );
          break;
        }
        elements.push(
          <a
            key={`link-${elements.length}`}
            href={match.url}
            title={match.title}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-primary hover:text-primary/80 font-medium transition-colors group"
          >
            <span className="underline decoration-primary/30 underline-offset-4">
              {match.content}
            </span>
          </a>,
        );
        break;
      case "image":
        if (!match.content) {
          elements.push(
            <span key={`image-${elements.length}`} className="inline-block" />,
          );
          break;
        }
        elements.push(
          <span
            key={`image-${elements.length}`}
            className="inline-block align-middle"
          >
            <img
              src={match.content}
              alt={match.alt || "Image"}
              className="inline-block max-h-6 w-auto object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </span>,
        );
        break;
      case "url":
        if (!match.url) {
          elements.push(
            <span key={`url-${elements.length}`}>{match.content}</span>,
          );
          break;
        }
        elements.push(
          <a
            key={`url-${elements.length}`}
            href={match.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            {match.content}
          </a>,
        );
        break;
      default:
        elements.push(
          <span key={`text-${elements.length}`}>{match.content}</span>,
        );
    }
    lastIndex = match.end;
  });

  if (lastIndex < text.length) {
    const remainingText = text.slice(lastIndex);
    if (remainingText.trim())
      elements.push(
        <span key={`text-${elements.length}`}>{remainingText}</span>,
      );
  }

  return elements.length > 0 ? elements : [<span key="text">{text}</span>];
}
