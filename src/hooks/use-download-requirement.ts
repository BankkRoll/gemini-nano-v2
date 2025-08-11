"use client";

import { useBuiltInAI } from "@/hooks/use-built-in-ai";
import { useEffect, useState } from "react";

export function useDownloadRequirement() {
  const ai = useBuiltInAI();
  const [showDownloadDialog, setShowDownloadDialog] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);

  const checkAvailability = () => {
    const allStatuses = [
      ai.promptStatus,
      ai.summarizerStatus,
      ai.translatorStatus,
      ai.detectorStatus,
      ai.writerStatus,
      ai.rewriterStatus,
      ai.proofreaderStatus,
    ];

    const hasAvailable = allStatuses.some((status) => status === "available");
    const hasDownloadable = allStatuses.some(
      (status) => status === "downloadable",
    );
    const allUnavailable = allStatuses.every(
      (status) => status === "unavailable",
    );

    if (hasAvailable) {
      setShowDownloadDialog(false);
    } else if (hasDownloadable || allUnavailable) {
      setShowDownloadDialog(true);
    }

    setHasChecked(true);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      checkAvailability();
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (hasChecked) {
      checkAvailability();
    }
  }, [
    ai.promptStatus,
    ai.summarizerStatus,
    ai.translatorStatus,
    ai.detectorStatus,
    ai.writerStatus,
    ai.rewriterStatus,
    ai.proofreaderStatus,
    hasChecked,
  ]);

  const handleDownload = async () => {
    try {
      await ai.refresh();
      const session = await ai.createPromptSession({
        system: "Initialize model.",
        temperature: 0.7,
        topK: 1,
      });
      await session?.prompt?.("warm up");
      await ai.refresh();
      checkAvailability();
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  const handleRefresh = () => {
    ai.refresh();
    checkAvailability();
  };

  return {
    showDownloadDialog,
    setShowDownloadDialog,
    hasChecked,
    checkAvailability,
    handleDownload,
    handleRefresh,
  };
}
