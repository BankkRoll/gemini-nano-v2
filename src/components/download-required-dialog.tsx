"use client";

import { StatusPill } from "@/components/chat/status-badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Availability } from "@/types";
import { Download, Info, X } from "lucide-react";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  promptStatus: Availability;
  summarizerStatus: Availability;
  translatorStatus: Availability;
  detectorStatus: Availability;
  writerStatus: Availability;
  rewriterStatus: Availability;
  proofreaderStatus: Availability;
  onDownload: () => void;
  onRefresh: () => void;
  downloading: boolean;
};

export function DownloadRequiredDialog({
  open,
  onOpenChange,
  promptStatus,
  summarizerStatus,
  translatorStatus,
  detectorStatus,
  writerStatus,
  rewriterStatus,
  proofreaderStatus,
  onDownload,
  onRefresh,
  downloading,
}: Props) {
  const allUnavailable = [
    promptStatus,
    summarizerStatus,
    translatorStatus,
    detectorStatus,
    writerStatus,
    rewriterStatus,
    proofreaderStatus,
  ].every((status) => status === "unavailable");

  const hasDownloadable = [
    promptStatus,
    summarizerStatus,
    translatorStatus,
    detectorStatus,
    writerStatus,
    rewriterStatus,
    proofreaderStatus,
  ].some((status) => status === "downloadable");

  const hasAvailable = [
    promptStatus,
    summarizerStatus,
    translatorStatus,
    detectorStatus,
    writerStatus,
    rewriterStatus,
    proofreaderStatus,
  ].some((status) => status === "available");

  if (hasAvailable) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" title="AI Models Required">
        <DialogHeader>
          <DialogTitle className="sr-only">AI Models Required</DialogTitle>
          <DialogDescription className="text-muted-foreground mb-4">
            Chrome's Built-in AI models need to be downloaded to use this
            application.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-none border-2 border-foreground p-4 bg-card">
            <h4 className="font-medium mb-3 text-foreground">Model Status</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">
                  Chat & Generation
                </span>
                <StatusPill status={promptStatus} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">Summarization</span>
                <StatusPill status={summarizerStatus} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">Translation</span>
                <StatusPill status={translatorStatus} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">
                  Language Detection
                </span>
                <StatusPill status={detectorStatus} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">
                  Writing Assistant
                </span>
                <StatusPill status={writerStatus} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">Rewriting</span>
                <StatusPill status={rewriterStatus} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">Proofreading</span>
                <StatusPill status={proofreaderStatus} />
              </div>
            </div>
          </div>

          {allUnavailable && (
            <div className="rounded-none border-2 border-amber-200 p-4 bg-amber-50">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-amber-800">
                  <p className="font-medium">Models not available</p>
                  <p>
                    Make sure you're using Chrome with Built-in AI enabled and
                    have the necessary permissions.
                  </p>
                </div>
              </div>
            </div>
          )}

          {hasDownloadable && (
            <div className="rounded-none border-2 border-blue-200 p-4 bg-blue-50">
              <div className="flex items-start gap-2">
                <Download className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium">Models ready to download</p>
                  <p>
                    Click download to install the required AI models locally on
                    your device.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onRefresh}
            disabled={downloading}
            className="border-2 border-foreground"
          >
            <X className="h-4 w-4 mr-2" />
            Refresh Status
          </Button>
          {hasDownloadable && (
            <Button
              onClick={onDownload}
              disabled={downloading}
              className="border-2 border-foreground"
            >
              <Download className="h-4 w-4 mr-2" />
              {downloading ? "Downloading..." : "Download Models"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
