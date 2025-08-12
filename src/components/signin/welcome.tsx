"use client";

import { WindowsLoadingBar } from "@/components/signin/windows-loading";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import { useEffect, useRef, useState } from "react";
import Logo from "../shared/logo";

export type WindowsUser = {
  id: string;
  name: string;
  avatarUrl?: string;
};

type Step = "select" | "signing";

const DEFAULT_USERS: WindowsUser[] = [
  { id: "user", name: "User", avatarUrl: "/logo.svg" },
];

export function Welcome() {
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<Step>("select");
  const [selected, setSelected] = useState<WindowsUser | null>(null);
  const [signingLines, setSigningLines] = useState<string[]>([]);
  const signTimerRef = useRef<number | null>(null);
  const [exiting, setExiting] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const startupBufferRef = useRef<AudioBuffer | null>(null);
  const [bootBlocks, setBootBlocks] = useState(0);
  const [newOpen, setNewOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const signIn = useAppStore((s) => s.signIn);
  const hydrate = useAppStore((s) => s.hydrate);
  const users = useAppStore((s) => s.users);
  const refreshUsers = useAppStore((s) => s.refreshUsers);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCreateUser = () => {
    const name = newName.trim();
    if (!name) return;
    const user: WindowsUser = {
      id:
        name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .slice(0, 24) || crypto.randomUUID(),
      name,
      avatarUrl: "/logo.svg",
    };
    setNewOpen(false);
    setNewName("");
    useAppStore.getState().createUser(user as any);
    refreshUsers();
  };

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

  const handleUserSelect = (user: WindowsUser) => {
    void playStartupSound();
    setSelected(user);
    setSigningLines([]);
    setStep("signing");
  };

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
        setTimeout(() => {
          signIn({
            id: selected.id,
            name: selected.name,
            avatarUrl: selected.avatarUrl,
          });
          useAppStore.getState().setActiveId(null);
          hydrate();
        }, 500);
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
  }, [step, selected, signIn, hydrate]);

  return (
    <div
      className={cn(
        "h-screen w-full bg-background flex items-center justify-center p-4",
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
                <span className="text-sm font-semibold">Nano Studio 98</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase">Select User</span>
              </div>
            </div>
            <div className="p-4">
              <div className="mb-3 text-sm text-muted-foreground">
                Click your user to sign in.
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                {(mounted && users?.length ? users : DEFAULT_USERS).map((u) => (
                  <button
                    key={u.id}
                    onClick={() => handleUserSelect(u)}
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
              <div className="flex justify-end">
                <Button onClick={() => setNewOpen(true)} className="px-6">
                  New User
                </Button>
              </div>
            </div>
          </div>
        )}

        {step === "signing" && (
          <div className="rounded-none border-2 border-foreground bg-card shadow-xl">
            <div className="flex items-center justify-between px-3 py-2 bg-primary text-primary-foreground border-b-2 border-foreground">
              <div className="flex items-center gap-2">
                <Logo />
                <span className="text-sm font-semibold">Nano Studio 98</span>
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

      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent className="sm:max-w-[400px]" title="Create User">
          <DialogHeader>
            <DialogTitle className="sr-only">Create User</DialogTitle>
            <DialogDescription className="text-muted-foreground mb-4">
              Create a local user to keep chats and settings separate.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label
                htmlFor="user-name"
                className="text-foreground font-medium"
              >
                Username
              </Label>
              <Input
                id="user-name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Enter a name"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreateUser();
                }}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter className="mt-3 gap-2">
            <Button variant="outline" onClick={() => setNewOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateUser}
              disabled={newName.trim().length < 2}
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
