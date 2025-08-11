"use client";

import type { ModelId, Tool } from "@/types";
import { motion } from "motion/react";
import { useEffect, useMemo, useRef } from "react";

interface WelcomeTextProps {
  tool: Tool;
  model: ModelId;
}

export function WelcomeText({ tool, model: _model }: WelcomeTextProps) {
  const words = useMemo<string[]>(() => {
    const map: Record<Tool, string[]> = {
      chat: ["What", "can", "I", "help", "you", "build?"],
      summarize: ["What", "should", "I", "summarize?"],
      translate: ["What", "should", "I", "translate?"],
      detect: ["What", "language", "is", "this?"],
      write: ["What", "should", "I", "write?"],
      rewrite: ["What", "should", "I", "rewrite?"],
      proofread: ["What", "should", "I", "proofread?"],
    } as const;

    return map[tool] ?? map.chat;
  }, [tool]);

  const previousWordsRef = useRef<string[] | null>(null);
  const previousWords = previousWordsRef.current;

  useEffect(() => {
    previousWordsRef.current = words;
  }, [words]);

  const baseDelaySeconds = 0.06;

  return (
    <div className="mb-8 text-center">
      <h1 className="text-3xl font-semibold tracking-tight">
        {words.map((word, index) => {
          const hasChanged = !previousWords || previousWords[index] !== word;
          const key = `${index}-${word}`;

          return (
            <span key={key} className="inline-block mr-2">
              {hasChanged ? (
                <motion.span
                  className="inline-block"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 320,
                    damping: 28,
                    delay: index * baseDelaySeconds,
                  }}
                >
                  {word}
                </motion.span>
              ) : (
                <span className="inline-block">{word}</span>
              )}
            </span>
          );
        })}
      </h1>
    </div>
  );
}
