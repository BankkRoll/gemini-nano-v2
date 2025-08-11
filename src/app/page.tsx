"use client";

import { ChatFeed } from "@/components/chat/chat-feed";
import { WelcomeText } from "@/components/chat/welcome-text";
import { DownloadRequiredDialog } from "@/components/download-required-dialog";
import Logo from "@/components/logo";
import { PromptDock } from "@/components/prompt-dock";
import { SettingsDialog } from "@/components/settings-dialog";
import { Sidebar } from "@/components/sidebar";
import { BootLoader } from "@/components/signin/boot-loader";
import { Welcome } from "@/components/signin/welcome";
import { useAppStore } from "@/store/app-store";
import Link from "next/link";
import { useMemo } from "react";

export default function Page() {
  const sessionUser = useAppStore((s) => s.sessionUser);
  const conversations = useAppStore((s) => s.conversations);
  const activeId = useAppStore((s) => s.activeId);
  const busy = useAppStore((s) => s.busy);

  const active = useMemo(() => {
    if (!activeId) return null;
    return conversations.find((c) => c.id === activeId) || null;
  }, [conversations, activeId]);

  const hasMessages = active?.messages && active.messages.length > 0;

  return (
    <>
      <BootLoader />

      {sessionUser && (
        <div className="flex h-screen">
          <div className="hidden lg:block w-80 h-screen flex-shrink-0 bg-card">
            <Sidebar />
          </div>

          <div className="flex-1 flex flex-col min-h-0">
            <header className="bg-primary flex items-center justify-between border-b px-3 py-3 lg:hidden">
              <div className="flex items-center gap-2">
                <Link
                  href="/"
                  onClick={() => useAppStore.getState().setActiveId(null)}
                  className="flex items-center text-primary-foreground gap-2"
                >
                  <Logo />
                  <span className="text-sm text-primary-foreground font-semibold">
                    Nano Studio 98
                  </span>
                </Link>
              </div>
              <div className="flex items-center gap-2">
                <Sidebar />
              </div>
            </header>

            <main className="flex-1 flex flex-col min-h-0">
              {!hasMessages ? (
                <div className="relative flex-1 flex flex-col items-center justify-center gap-10 lg:gap-20 px-6">
                  <img
                    src="/background.webp"
                    alt="Background"
                    className="absolute inset-0 w-full h-full object-cover"
                    loading="eager"
                    decoding="sync"
                    fetchPriority="high"
                  />
                  <WelcomeText />

                  <div className="w-full max-w-3xl">
                    <PromptDock mode="center" />
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex-1 px-2 md:px-6 overflow-hidden">
                    <div className="h-full max-w-6xl mx-auto">
                      <ChatFeed messages={active?.messages ?? []} busy={busy} />
                    </div>
                  </div>

                  <div className="px-2 md:px-6 pb-2 md:pb-6">
                    <div className="max-w-3xl mx-auto">
                      <PromptDock mode="bottom" />
                    </div>
                  </div>
                </>
              )}
            </main>
          </div>

          <SettingsDialog />

          <DownloadRequiredDialog />
        </div>
      )}

      {!sessionUser && <Welcome />}
    </>
  );
}
