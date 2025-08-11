"use client";

import { WindowsLoadingBar } from "@/components/windows-loading";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import Logo from "./logo";

export type WindowsUser = {
  id: string;
  name: string;
  avatarUrl?: string;
};

type Props = {
  users?: WindowsUser[];
  onSignIn: (user: WindowsUser) => void;
  className?: string;
};

type Step = "select" | "signing";

const DEFAULT_USERS: WindowsUser[] = [
  { id: "user", name: "User", avatarUrl: "/logo.svg" },
];

export function Welcome({ users = DEFAULT_USERS, onSignIn, className }: Props) {
  const [step, setStep] = useState<Step>("select");
  const [selected, setSelected] = useState<WindowsUser | null>(null);
  const [signingLines, setSigningLines] = useState<string[]>([]);
  const signTimerRef = useRef<number | null>(null);
  const [exiting, setExiting] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const startupBufferRef = useRef<AudioBuffer | null>(null);
  const [bootBlocks, setBootBlocks] = useState(0);

  async function ensureAudioContext(): Promise<AudioContext> {
    if (!audioCtxRef.current || audioCtxRef.current.state === "closed") {
      const Ctx =
        (window as any).AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new Ctx();
    }
    const ctx = audioCtxRef.current!;
    if (ctx.state === "suspended") {
      try {
        await ctx.resume();
      } catch {}
    }
    return ctx;
  }

  async function loadStartupBuffer(ctx: AudioContext): Promise<AudioBuffer> {
    if (startupBufferRef.current) return startupBufferRef.current;
    const res = await fetch("/startup.mp3");
    const arr = await res.arrayBuffer();
    const buf = await ctx.decodeAudioData(arr);
    startupBufferRef.current = buf;
    return buf;
  }

  async function playStartupSound() {
    try {
      const ctx = await ensureAudioContext();
      const buffer = await loadStartupBuffer(ctx);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      const gain = ctx.createGain();
      gain.gain.value = 0.7;
      source.connect(gain).connect(ctx.destination);
      source.start(0);
    } catch {
      // Ignore audio errors silently
    }
  }

  useEffect(() => {
    if (step !== "signing" || !selected) return;
    const lines = [
      `Signing in as ${selected.name}...`,
      "Initializing AI models...",
      "Checking Chrome built-in AI availability...",
      "Fetching conversation history...",
      "Loading user settings...",
      "Ready",
    ];
    let i = 0;
    const tick = () => {
      setSigningLines((prev) => [...prev, lines[i]]);
      i += 1;
      if (i >= lines.length) {
        window.clearInterval(signTimerRef.current ?? undefined);
        signTimerRef.current = null;
        setExiting(true);
        setTimeout(() => onSignIn(selected), 500);
      }
    };
    setBootBlocks(0);
    const blockId = window.setInterval(
      () => setBootBlocks((b) => Math.min(50, b + 1)),
      40,
    );
    tick();
    signTimerRef.current = window.setInterval(tick, 300);
    return () => {
      if (signTimerRef.current) window.clearInterval(signTimerRef.current);
      window.clearInterval(blockId);
    };
  }, [step, selected, onSignIn]);

  return (
    <div
      className={cn(
        "h-screen w-full bg-background flex items-center justify-center p-4",
        className,
      )}
    >
      <div
        className={cn(
          "w-full max-w-2xl transition-opacity duration-200",
          exiting && "opacity-0",
        )}
      >
        {step === "select" && (
          <div className="rounded-none border-2 border-foreground bg-card shadow-xl">
            <div className="flex items-center justify-between px-3 py-2 bg-primary text-primary-foreground border-b-2 border-foreground">
              <div className="flex items-center gap-2">
                <Logo />
                <span className="text-sm font-semibold">Nano Studio</span>
              </div>
              <span className="text-[10px] uppercase">Select User</span>
            </div>
            <div className="p-4">
              <div className="mb-3 text-sm text-muted-foreground">
                Click your user to sign in.
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {users.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => {
                      void playStartupSound();
                      setSelected(u);
                      setSigningLines([]);
                      setStep("signing");
                    }}
                    className={cn(
                      "group flex items-center gap-3 border-2 border-foreground bg-input text-foreground shadow-sm px-3 py-2 text-left",
                      "hover:bg-muted",
                    )}
                  >
                    <img
                      src={u.avatarUrl || "/logo.svg"}
                      alt={u.name}
                      className="h-10 w-10 object-cover border border-foreground"
                    />
                    <div>
                      <div className="text-sm font-medium">{u.name}</div>
                      <div className="text-xs text-muted-foreground">
                        Local user
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === "signing" && (
          <div className="rounded-none border-2 border-foreground bg-card shadow-xl">
            <div className="flex items-center justify-between px-3 py-2 bg-primary text-primary-foreground border-b-2 border-foreground">
              <div className="flex items-center gap-2">
                <Logo />
                <span className="text-sm font-semibold">Nano Studio</span>
              </div>
              <span className="text-[10px] uppercase">Signing In</span>
            </div>
            <div className="px-4 py-4 font-mono text-sm leading-relaxed">
              {selected && (
                <div className="mb-3 flex items-center gap-3">
                  <img
                    src={selected.avatarUrl || "/logo.svg"}
                    alt={selected.name}
                    className="h-8 w-8 object-cover border border-foreground"
                  />
                  <div className="text-foreground">{selected.name}</div>
                </div>
              )}
              <div className="mb-3" style={{ minHeight: 140 }}>
                {signingLines.map((line, idx) => (
                  <div key={idx} className="text-foreground/90">
                    {"> "}
                    {line}
                  </div>
                ))}
              </div>
              <WindowsLoadingBar
                totalBlocks={50}
                filledBlocks={bootBlocks}
                className="mt-4 h-5 w-full"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
