"use client";

import Minesweeper from "@/components/games/minesweeper";
import { Win98Window } from "@/components/games/window";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAppStore } from "@/store/app-store";
import {
  Download,
  Gamepad2,
  LogOut,
  MonitorPlay,
  PanelsTopLeft,
  Settings,
  SquarePlus,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Separator } from "../ui/separator";
import Link from "next/link";
import Logo from "./logo";

export function Win98Footer() {
  const createConversation = useAppStore((s) => s.createConversation);
  const setShowSettings = useAppStore((s) => s.setShowSettings);
  const handleDownload = useAppStore((s) => s.handleDownload);
  const signOut = useAppStore((s) => s.signOut);

  const [now, setNow] = useState<Date>(() => new Date());
  const [minesweeperOpen, setMinesweeperOpen] = useState<boolean>(false);
  const [minesweeperMinimized, setMinesweeperMinimized] =
    useState<boolean>(false);
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);
  const time = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        hour: "2-digit",
        minute: "2-digit",
      }).format(now),
    [now],
  );

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t-2 border-foreground h-[40px] bg-card shadow-2xl">
      <div className="flex items-center justify-between gap-2 px-2 py-1.5">
        <div className="flex items-center gap-3">
          {/* Start menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                variant="secondary"
                className="h-7 gap-2 px-2 border-2 border-foreground shadow-sm"
                title="Start"
              >
                <PanelsTopLeft className="h-3.5 w-3.5" /> Start
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64">
              <div className="flex items-center justify-between px-3 py-2 bg-primary text-primary-foreground border-b-2 border-foreground">
                <Logo />
                <span className="text-sm text-primary-foreground font-semibold">
                  Nano Studio 98
                </span>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <span className="inline-flex  items-center gap-2">
                    <Gamepad2 className="h-3.5 w-3.5" /> Games
                  </span>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem
                    onClick={() => {
                      setMinesweeperOpen(true);
                      setMinesweeperMinimized(false);
                    }}
                  >
                    Minesweeper
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuItem
                onClick={() => {
                  createConversation({});
                }}
              >
                <SquarePlus className="h-3.5 w-3.5 mr-2" /> New Chat
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowSettings(true)}>
                <Settings className="h-3.5 w-3.5 mr-2" /> Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => void handleDownload()}>
                <Download className="h-3.5 w-3.5 mr-2" /> Download Models
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={() => signOut()}>
                <LogOut className="h-3.5 w-3.5 mr-2" /> Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Separator orientation="vertical" className="h-6 bg-foreground" />
          <div className="flex items-center gap-2">
            {minesweeperOpen && (
              <Button
                size="sm"
                variant={minesweeperMinimized ? "outline" : "secondary"}
                className="h-7 gap-1 px-2 border-2 border-foreground shadow-sm"
                onClick={() => setMinesweeperMinimized((v) => !v)}
                title={
                  minesweeperMinimized
                    ? "Restore Minesweeper"
                    : "Minimize Minesweeper"
                }
              >
                <MonitorPlay className="h-3.5 w-3.5" /> Minesweeper
              </Button>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-xs px-2 py-0.5 border-2 border-foreground bg-input shadow-sm">
            {time}
          </div>
          <Button
            size="sm"
            variant="secondary"
            className="h-7 gap-1 px-2 border-2 border-foreground shadow-sm"
            title="Settings"
            onClick={() => setShowSettings(true)}
          >
            <Settings className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {minesweeperOpen && !minesweeperMinimized && (
        <Win98Window
          title="Minesweeper"
          resizable={false}
          initialPosition={{ x: 24, y: 24 }}
          initialSize={{ width: 350, height: 465 }}
          onClose={() => setMinesweeperOpen(false)}
          onMinimize={() => setMinesweeperMinimized(true)}
        >
          <Minesweeper />
        </Win98Window>
      )}
    </div>
  );
}

export default Win98Footer;
