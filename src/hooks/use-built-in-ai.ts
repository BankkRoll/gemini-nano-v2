"use client";

import type { Availability } from "@/types";
import { useEffect, useState } from "react";

declare global {
  interface Window {
    ai?: any;
    LanguageModel?: any;
    Summarizer?: any;
    translation?: any;
    LanguageDetector?: any;
    Writer?: any;
    Rewriter?: any;
    Proofreader?: any;
  }
}

async function readAvailability(obj: any): Promise<Availability> {
  try {
    if (!obj) return "unavailable";
    if (typeof obj.availability === "function") {
      const s = await obj.availability();
      if (s === "available") return "available";
      if (s === "after-download" || s === "downloadable") return "downloadable";
      if (s === "downloading") return "downloading";
      return "unavailable";
    }
    if (window.ai?.canCreateTextSession) {
      const can = await window.ai.canCreateTextSession();
      if (can === "readily") return "available";
      if (can === "after-download") return "downloadable";
      return "unavailable";
    }
    return "unavailable";
  } catch {
    return "unavailable";
  }
}

export function useBuiltInAI() {
  const [promptStatus, setPromptStatus] = useState<Availability>("unavailable");
  const [summarizerStatus, setSummarizerStatus] =
    useState<Availability>("unavailable");
  const [translatorStatus, setTranslatorStatus] =
    useState<Availability>("unavailable");
  const [detectorStatus, setDetectorStatus] =
    useState<Availability>("unavailable");
  const [writerStatus, setWriterStatus] = useState<Availability>("unavailable");
  const [rewriterStatus, setRewriterStatus] =
    useState<Availability>("unavailable");
  const [proofreaderStatus, setProofreaderStatus] =
    useState<Availability>("unavailable");

  const refresh = async () => {
    setPromptStatus(
      await readAvailability(
        typeof window !== "undefined"
          ? window.LanguageModel ?? window.ai
          : undefined,
      ),
    );
    setSummarizerStatus(
      await readAvailability(
        typeof window !== "undefined" ? window.Summarizer : undefined,
      ),
    );
    setTranslatorStatus(
      await readAvailability(
        typeof window !== "undefined"
          ? window.translation?.Translator
          : undefined,
      ),
    );
    setDetectorStatus(
      await readAvailability(
        typeof window !== "undefined"
          ? window.translation?.LanguageDetector ?? window.LanguageDetector
          : undefined,
      ),
    );
    setWriterStatus(
      await readAvailability(
        typeof window !== "undefined" ? window.Writer : undefined,
      ),
    );
    setRewriterStatus(
      await readAvailability(
        typeof window !== "undefined" ? window.Rewriter : undefined,
      ),
    );
    setProofreaderStatus(
      await readAvailability(
        typeof window !== "undefined" ? window.Proofreader : undefined,
      ),
    );
  };

  useEffect(() => {
    void refresh();
    const onVis = () =>
      document.visibilityState === "visible" && void refresh();
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  async function createPromptSession(
    opts: { system?: string; temperature?: number; topK?: number } = {},
  ) {
    if (typeof window !== "undefined" && window.ai?.createTextSession) {
      return await window.ai.createTextSession({
        initialPrompts: opts.system
          ? [{ role: "system", content: opts.system }]
          : [],
        temperature: opts.temperature,
        topK: opts.topK,
      });
    }
    if (typeof window !== "undefined" && window.LanguageModel?.create) {
      return await window.LanguageModel.create({
        initialPrompts: opts.system
          ? [{ role: "system", content: opts.system }]
          : [],
        temperature: opts.temperature,
        topK: opts.topK,
      });
    }
    throw new Error("Prompt API unavailable in this browser.");
  }

  async function promptStreaming(
    session: any,
    input: string,
    signal?: AbortSignal,
  ) {
    if (typeof session?.promptStreaming === "function") {
      return await session.promptStreaming(input, { signal });
    }
    const res = await session?.prompt?.(input, { signal });
    async function* one() {
      yield String(res ?? "");
    }
    return one();
  }

  async function createSummarizer(opts: any = {}) {
    if (!(typeof window !== "undefined" && window.Summarizer?.create))
      throw new Error("Summarizer API unavailable.");
    return await window.Summarizer.create(opts);
  }
  async function createTranslator(opts: any = {}) {
    const T =
      typeof window !== "undefined"
        ? window.translation?.Translator
        : undefined;
    if (!T?.create) throw new Error("Translator API unavailable.");
    return await T.create(opts);
  }
  async function createDetector(opts: any = {}) {
    const D =
      typeof window !== "undefined"
        ? window.translation?.LanguageDetector ?? window.LanguageDetector
        : undefined;
    if (!D?.create) throw new Error("Language Detector API unavailable.");
    return await D.create(opts);
  }
  async function createWriter(opts: any = {}) {
    if (!(typeof window !== "undefined" && window.Writer?.create))
      throw new Error("Writer API unavailable.");
    return await window.Writer.create(opts);
  }
  async function createRewriter(opts: any = {}) {
    if (!(typeof window !== "undefined" && window.Rewriter?.create))
      throw new Error("Rewriter API unavailable.");
    return await window.Rewriter.create(opts);
  }
  async function createProofreader(opts: any = {}) {
    if (!(typeof window !== "undefined" && window.Proofreader?.create))
      throw new Error("Proofreader API unavailable.");
    return await window.Proofreader.create(opts);
  }

  return {
    promptStatus,
    summarizerStatus,
    translatorStatus,
    detectorStatus,
    writerStatus,
    rewriterStatus,
    proofreaderStatus,
    refresh,
    createPromptSession,
    promptStreaming,
    createSummarizer,
    createTranslator,
    createDetector,
    createWriter,
    createRewriter,
    createProofreader,
  };
}
