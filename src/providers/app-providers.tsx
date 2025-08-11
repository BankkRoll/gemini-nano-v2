"use client";

import { ThemeProvider } from "@/components/theme-provider";
import { useAppStore } from "@/store/app-store";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function SearchParamsHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const activeId = useAppStore((s) => s.activeId);
  const setActiveId = useAppStore((s) => s.setActiveId);

  useEffect(() => {
    const current = searchParams.get("chat");
    if (current && !activeId) {
      setActiveId(current);
    }
  }, [searchParams, activeId, setActiveId]);

  useEffect(() => {
    const url = new URL(window.location.href);
    const currentChat = url.searchParams.get("chat");
    if (!activeId && currentChat !== null) {
      url.searchParams.delete("chat");
      if (url.search !== window.location.search) {
        router.replace(pathname + url.search, { scroll: false });
      }
      return;
    }
    if (activeId && currentChat !== activeId) {
      url.searchParams.set("chat", activeId);
      if (url.search !== window.location.search) {
        router.replace(pathname + url.search, { scroll: false });
      }
    }
  }, [activeId, router, pathname]);

  return null; // This component doesn't render anything
}

export default function AppProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  const [aiInitialized, setAiInitialized] = useState(false);
  const hydrate = useAppStore((s) => s.hydrate);
  const refreshAI = useAppStore((s) => s.refreshAI);
  const setDownloadOpen = useAppStore((s) => s.setDownloadOpen);

  useEffect(() => {
    hydrate();
    void refreshAI().finally(() => setAiInitialized(true));
    const onVis = () => {
      if (document.visibilityState === "visible") void refreshAI();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [hydrate]);

  useEffect(() => {
    if (!aiInitialized) return;
    const statuses = [
      useAppStore.getState().promptStatus,
      useAppStore.getState().summarizerStatus,
      useAppStore.getState().translatorStatus,
      useAppStore.getState().detectorStatus,
      useAppStore.getState().writerStatus,
      useAppStore.getState().rewriterStatus,
      useAppStore.getState().proofreaderStatus,
    ];
    const hasAvailable = statuses.some((x) => x === "available");
    const hasDownloadable = statuses.some((x) => x === "downloadable");
    const allUnavailable = statuses.every((x) => x === "unavailable");
    if (hasAvailable) setDownloadOpen(false);
    else if (hasDownloadable || allUnavailable) setDownloadOpen(true);
  }, [aiInitialized, setDownloadOpen]);

  return (
    <ThemeProvider attribute="class">
      <Suspense fallback={null}>
        <SearchParamsHandler />
      </Suspense>
      {children}
    </ThemeProvider>
  );
}
