"use client";

import { useAppStore } from "@/store/app-store";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Logo } from "../shared/logo";
import { WindowsLoadingBar } from "./windows-loading";

export function BootLoader() {
  const [bootBlocks, setBootBlocks] = useState(0);
  const [bootDone, setBootDone] = useState(false);

  useEffect(() => {
    setBootBlocks(0);
    setBootDone(false);
    const id = window.setInterval(() => {
      setBootBlocks((prev) => {
        if (prev >= 50) return 50;
        const next = prev + 1;
        if (next >= 50) {
          setBootDone(true);
          window.clearInterval(id);
        }
        return next;
      });
    }, 20);
    return () => window.clearInterval(id);
  }, []);

  if (bootDone) return null;

  return (
    <div className="h-screen w-full bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="rounded-none border-2 border-foreground bg-card shadow-xl">
          <div className="flex items-center justify-between px-3 py-2 bg-primary text-primary-foreground border-b-2 border-foreground">
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
            <span className="text-[10px] uppercase">Loading</span>
          </div>
          <div className="p-4">
            <WindowsLoadingBar
              totalBlocks={50}
              filledBlocks={bootBlocks}
              className="mt-4 h-5 w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
