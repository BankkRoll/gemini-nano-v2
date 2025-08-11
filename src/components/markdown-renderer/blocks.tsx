import { CollapsibleCodeBlock } from "@/components/markdown-renderer/code-block";
import { processInlineMarkdown } from "@/components/markdown-renderer/inline";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { CheckCircle, Circle, Hash, Quote } from "lucide-react";
import React from "react";

type ParseOptions = {
  copyToClipboard: (text: string) => void;
  copiedCode: string | null;
};

export function parseBlocks(
  text: string,
  { copyToClipboard, copiedCode }: ParseOptions,
): React.ReactElement[] {
  if (!text) return [];

  const lines = text.split("\n");
  const blocks: React.ReactElement[] = [];
  let currentCodeBlock: string[] = [];
  let inCodeBlock = false;
  let codeBlockLanguage = "";
  let currentList: string[] = [];
  let inList = false;
  let listType: "ul" | "ol" = "ul";
  let currentTable: string[][] = [];
  let inTable = false;
  let tableHeaders: string[] = [];
  let currentTaskList: { text: string; completed: boolean }[] = [];
  let inTaskList = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();

    if (trimmedLine.startsWith("```")) {
      if (inCodeBlock) {
        if (currentCodeBlock.length > 0) {
          const code = currentCodeBlock.join("\n");
          const lang = (codeBlockLanguage || "").toLowerCase();
          const looksLikeMarkdown =
            /(^|\n)\s*#{1,6}\s+/.test(code) ||
            /(^|\n)\s*[-*]\s+/.test(code) ||
            /(^|\n)\s*\d+\.\s+/.test(code) ||
            /(^|\n)>\s+/.test(code) ||
            /(^|\n)```/.test(code);
          if (
            lang === "markdown" ||
            lang === "md" ||
            lang === "mdx" ||
            (lang === "" && looksLikeMarkdown)
          ) {
            const nested = parseBlocks(code, { copyToClipboard, copiedCode });
            blocks.push(
              <div key={`md-${blocks.length}`} className="my-4 space-y-2">
                {nested}
              </div>,
            );
          } else {
            blocks.push(
              <CollapsibleCodeBlock
                key={`code-${blocks.length}`}
                className="my-6"
                code={code}
                language={codeBlockLanguage || "tsx"}
                copiedCode={copiedCode}
                onCopy={copyToClipboard}
              />,
            );
          }
        }
        currentCodeBlock = [];
        inCodeBlock = false;
        codeBlockLanguage = "";
      } else {
        inCodeBlock = true;
        codeBlockLanguage = trimmedLine.slice(3).trim();
        currentCodeBlock = [];
      }
      continue;
    }
    if (inCodeBlock) {
      currentCodeBlock.push(line);
      continue;
    }

    const isTableLike =
      trimmedLine.includes("|") && (trimmedLine.match(/\|/g) || []).length >= 2;
    const isListItem =
      /^[\d]+\.\s/.test(trimmedLine) || /^[-*]\s/.test(trimmedLine);
    const isTaskItem = /^[-*]\s\[[ xX]\]\s/.test(trimmedLine);

    if (inTable && !isTableLike && trimmedLine !== "") {
      if (currentTable.length > 0) {
        blocks.push(
          <div
            key={`table-${blocks.length}`}
            className="relative my-6 overflow-x-auto"
          >
            <div className="border border-border/50 rounded-xl overflow-hidden shadow-lg">
              <Table className="w-full border-collapse">
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    {tableHeaders.map((header, headerIndex) => (
                      <TableHead
                        key={headerIndex}
                        className="px-4 py-3 text-left text-sm font-semibold text-foreground border-b border-border/30"
                      >
                        {header}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentTable.map((row, rowIndex) => (
                    <TableRow
                      key={rowIndex}
                      className={cn(
                        "border-b border-border/20",
                        rowIndex % 2 === 0 ? "bg-muted/20" : "bg-muted/10",
                      )}
                    >
                      {row.map((cell, cellIndex) => (
                        <TableCell
                          key={cellIndex}
                          className="px-4 py-3 text-sm text-foreground/90"
                        >
                          {processInlineMarkdown(cell)}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>,
        );
      }
      currentTable = [];
      tableHeaders = [];
      inTable = false;
      i--;
      continue;
    }

    if (inList && !isListItem && trimmedLine !== "") {
      if (currentList.length > 0) {
        const ListComponent = listType === "ol" ? "ol" : "ul";
        blocks.push(
          <div key={`list-${blocks.length}`} className="relative">
            <ListComponent
              className={cn(
                "space-y-2 my-4 pl-6",
                listType === "ol" ? "list-decimal" : "list-disc",
              )}
            >
              {currentList.map((item, itemIndex) => (
                <li
                  key={itemIndex}
                  className="text-sm leading-relaxed relative group"
                >
                  <span className="relative z-10">
                    {processInlineMarkdown(item)}
                  </span>
                  {listType === "ul" && (
                    <div className="absolute left-0 top-2 w-2 h-2 bg-primary/60 rounded-full -translate-x-6" />
                  )}
                </li>
              ))}
            </ListComponent>
          </div>,
        );
      }
      currentList = [];
      inList = false;
      i--;
      continue;
    }

    if (inTaskList && !isTaskItem && trimmedLine !== "") {
      if (currentTaskList.length > 0) {
        blocks.push(
          <div key={`task-list-${blocks.length}`} className="relative my-6">
            <div className="space-y-2">
              {currentTaskList.map((item, itemIndex) => (
                <div
                  key={itemIndex}
                  className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border/20 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {item.completed ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <Circle className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-sm leading-relaxed",
                      item.completed && "line-through text-muted-foreground",
                    )}
                  >
                    {processInlineMarkdown(item.text)}
                  </span>
                </div>
              ))}
            </div>
          </div>,
        );
      }
      currentTaskList = [];
      inTaskList = false;
      i--;
      continue;
    }
    if (
      trimmedLine.includes("|") &&
      (trimmedLine.match(/\|/g) || []).length >= 2
    ) {
      if (!inTable) {
        inTable = true;
        currentTable = [];
      }
      const cells = trimmedLine
        .split("|")
        .map((cell) => cell.trim())
        .filter((cell) => cell);
      if (trimmedLine.includes("---") && trimmedLine.match(/-{3,}/)) {
        continue;
      }
      if (tableHeaders.length === 0) {
        tableHeaders = cells;
      } else {
        currentTable.push(cells);
      }
      continue;
    } else if (inTable && trimmedLine === "") {
      if (currentTable.length > 0) {
        blocks.push(
          <div
            key={`table-${blocks.length}`}
            className="relative my-6 overflow-x-auto"
          >
            <div className="bg-gradient-to-br from-muted/80 to-muted border border-border/50 rounded-xl overflow-hidden shadow-lg">
              <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 border-b border-border/30">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Table
                </span>
              </div>
              <Table className="w-full border-collapse">
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    {tableHeaders.map((header, headerIndex) => (
                      <TableHead
                        key={headerIndex}
                        className="px-4 py-3 text-left text-sm font-semibold text-foreground border-b border-border/30"
                      >
                        {header}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentTable.map((row, rowIndex) => (
                    <TableRow
                      key={rowIndex}
                      className={cn(
                        "border-b border-border/20",
                        rowIndex % 2 === 0 ? "bg-muted/20" : "bg-muted/10",
                      )}
                    >
                      {row.map((cell, cellIndex) => (
                        <TableCell
                          key={cellIndex}
                          className="px-4 py-3 text-sm text-foreground/90"
                        >
                          {cell}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>,
        );
      }
      currentTable = [];
      tableHeaders = [];
      inTable = false;
      continue;
    }

    if (trimmedLine.match(/^[-*]\s\[[ xX]\]\s/)) {
      if (!inTaskList) {
        inTaskList = true;
        currentTaskList = [];
      }
      const match = trimmedLine.match(/^[-*]\s\[([ xX])\]\s(.+)$/);
      if (match) {
        currentTaskList.push({
          completed: match[1].toLowerCase() === "x",
          text: match[2],
        });
      }
      continue;
    } else if (inTaskList && trimmedLine === "") {
      if (currentTaskList.length > 0) {
        blocks.push(
          <div key={`task-list-${blocks.length}`} className="relative my-6">
            <div className="space-y-2">
              {currentTaskList.map((item, itemIndex) => (
                <div
                  key={itemIndex}
                  className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border/20 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {item.completed ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <Circle className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-sm leading-relaxed",
                      item.completed && "line-through text-muted-foreground",
                    )}
                  >
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </div>,
        );
      }
      currentTaskList = [];
      inTaskList = false;
      continue;
    }

    if (trimmedLine.match(/^[\d]+\.\s/) || trimmedLine.match(/^[-*]\s/)) {
      if (!inList) {
        inList = true;
        listType = trimmedLine.match(/^[\d]+\.\s/) ? "ol" : "ul";
        currentList = [];
      }
      currentList.push(trimmedLine.replace(/^[\d]+\.\s|^[-*]\s/, ""));
      continue;
    } else if (inList && trimmedLine === "") {
      if (currentList.length > 0) {
        const ListComponent = listType === "ol" ? "ol" : "ul";
        blocks.push(
          <div key={`list-${blocks.length}`} className="relative">
            <ListComponent
              className={cn(
                "space-y-2 my-4 pl-6",
                listType === "ol" ? "list-decimal" : "list-disc",
              )}
            >
              {currentList.map((item, itemIndex) => (
                <li
                  key={itemIndex}
                  className="text-sm leading-relaxed relative group"
                >
                  <span className="relative z-10">
                    {processInlineMarkdown(item)}
                  </span>
                  {listType === "ul" && (
                    <div className="absolute left-0 top-2 w-2 h-2 bg-primary/60 rounded-full -translate-x-6" />
                  )}
                </li>
              ))}
            </ListComponent>
          </div>,
        );
      }
      currentList = [];
      inList = false;
      continue;
    }

    if (trimmedLine.startsWith("#")) {
      const level = Math.min(trimmedLine.match(/^#+/)?.[0].length || 1, 6);
      const hText = trimmedLine.replace(/^#+\s/, "");
      const headingClasses = cn(
        "font-bold tracking-tight text-foreground",
        level === 1 &&
          "text-3xl bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent",
        level === 2 && "text-2xl",
        level === 3 && "text-xl",
        level >= 4 && "text-lg",
      );
      const content = (
        <>
          {level === 1 && (
            <Hash className="inline-block w-6 h-6 mr-2 text-primary/60" />
          )}{" "}
          {hText}
        </>
      );
      let headingElement: React.ReactElement;
      switch (level) {
        case 1:
          headingElement = (
            <h1 className={cn(headingClasses, "mb-4 mt-8 first:mt-0")}>
              {content}
            </h1>
          );
          break;
        case 2:
          headingElement = (
            <h2 className={cn(headingClasses, "mb-4 mt-7")}>{content}</h2>
          );
          break;
        case 3:
          headingElement = (
            <h3 className={cn(headingClasses, "mb-4 mt-6")}>{content}</h3>
          );
          break;
        case 4:
          headingElement = (
            <h4 className={cn(headingClasses, "mb-3 mt-5")}>{content}</h4>
          );
          break;
        case 5:
          headingElement = (
            <h5 className={cn(headingClasses, "mb-3 mt-4")}>{content}</h5>
          );
          break;
        default:
          headingElement = (
            <h6 className={cn(headingClasses, "mb-2 mt-3")}>{content}</h6>
          );
      }
      blocks.push(
        <div key={`heading-${blocks.length}`} className="group relative">
          {headingElement}
          {level === 1 && (
            <div className="h-1 bg-gradient-to-r from-primary/20 via-primary to-primary/20 rounded-full" />
          )}
        </div>,
      );
      continue;
    }

    if (trimmedLine.startsWith("> ")) {
      const quoteText = trimmedLine.slice(2);
      blocks.push(
        <div key={`blockquote-${blocks.length}`} className="relative my-6">
          <div className="relative pl-6 py-4 bg-gradient-to-r from-primary/5 to-primary/10 border-l-4 border-primary/30 rounded-r-xl">
            <Quote className="absolute -left-3 top-4 w-6 h-6 text-primary/40 bg-background rounded-full p-1" />
            <blockquote className="text-sm italic text-muted-foreground leading-relaxed">
              {processInlineMarkdown(quoteText)}
            </blockquote>
          </div>
        </div>,
      );
      continue;
    }

    if (/^(\s*-{3,}|\s*\*{3,}|\s*_{3,})$/.test(trimmedLine)) {
      blocks.push(
        <hr
          key={`hr-${blocks.length}`}
          className="my-8 border-0 h-px bg-gradient-to-r from-transparent via-border to-transparent"
        />,
      );
      continue;
    }

    const imageOnlyMatch = trimmedLine.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (imageOnlyMatch) {
      const alt = imageOnlyMatch[1] || "Image";
      const src = imageOnlyMatch[2];
      const safe =
        /^(https?:)\/\//i.test(src) || src.startsWith("/") ? src : "";
      blocks.push(
        <div key={`img-${blocks.length}`} className="my-4">
          {safe ? (
            <div className="inline-block">
              <img
                src={safe}
                alt={alt}
                loading="lazy"
                className="max-w-full h-auto border-2 border-foreground"
                referrerPolicy="no-referrer"
                draggable={false}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
          ) : null}
        </div>,
      );
      continue;
    }

    if (trimmedLine !== "") {
      const processedText = processInlineMarkdown(trimmedLine);
      blocks.push(
        <p
          key={`text-${blocks.length}`}
          className="text-sm leading-relaxed my-3 text-foreground/90"
        >
          {processedText}
        </p>,
      );
    }
  }

  if (inCodeBlock && currentCodeBlock.length > 0) {
    const code = currentCodeBlock.join("\n");
    blocks.push(
      <CollapsibleCodeBlock
        key={`code-${blocks.length}`}
        className="my-6"
        code={code}
        language={codeBlockLanguage || "tsx"}
        copiedCode={copiedCode}
        onCopy={copyToClipboard}
      />,
    );
  }

  if (inList && currentList.length > 0) {
    const ListComponent = listType === "ol" ? "ol" : "ul";
    blocks.push(
      <div key={`list-${blocks.length}`} className="relative">
        <ListComponent
          className={cn(
            "space-y-2 my-4 pl-6",
            listType === "ol" ? "list-decimal" : "list-disc",
          )}
        >
          {currentList.map((item, itemIndex) => (
            <li
              key={itemIndex}
              className="text-sm leading-relaxed relative group"
            >
              <span className="relative z-10">
                {processInlineMarkdown(item)}
              </span>
              {listType === "ul" && (
                <div className="absolute left-0 top-2 w-2 h-2 bg-primary/60 rounded-full -translate-x-6" />
              )}
            </li>
          ))}
        </ListComponent>
      </div>,
    );
  }

  if (inTable && currentTable.length > 0) {
    blocks.push(
      <div
        key={`table-${blocks.length}`}
        className="relative my-6 overflow-x-auto"
      >
        <div className="bg-gradient-to-br from-muted/80 to-muted border border-border/50 rounded-xl overflow-hidden shadow-lg">
          <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 border-b border-border/30">
            <Table className="w-4 h-4 text-primary" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Table
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-muted/30">
                  {tableHeaders.map((header, headerIndex) => (
                    <th
                      key={headerIndex}
                      className="px-4 py-3 text-left text-sm font-semibold text-foreground border-b border-border/30"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentTable.map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className={cn(
                      "border-b border-border/20",
                      rowIndex % 2 === 0 ? "bg-muted/20" : "bg-muted/10",
                    )}
                  >
                    {row.map((cell, cellIndex) => (
                      <td
                        key={cellIndex}
                        className="px-4 py-3 text-sm text-foreground/90"
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>,
    );
  }

  if (inTaskList && currentTaskList.length > 0) {
    blocks.push(
      <div key={`task-list-${blocks.length}`} className="relative my-6">
        <div className="space-y-2">
          {currentTaskList.map((item, itemIndex) => (
            <div
              key={itemIndex}
              className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border/20 hover:bg-muted/50 transition-colors"
            >
              <div className="flex-shrink-0 mt-0.5">
                {item.completed ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <Circle className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
              <span
                className={cn(
                  "text-sm leading-relaxed",
                  item.completed && "line-through text-muted-foreground",
                )}
              >
                {processInlineMarkdown(item.text)}
              </span>
            </div>
          ))}
        </div>
      </div>,
    );
  }

  return blocks;
}
