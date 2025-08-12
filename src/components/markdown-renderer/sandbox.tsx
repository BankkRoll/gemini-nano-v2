"use client";

import { Card } from "@/components/ui/card";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  SandpackCodeEditor,
  SandpackConsole,
  SandpackFileExplorer,
  SandpackLayout,
  SandpackPreview,
  SandpackProvider,
} from "@codesandbox/sandpack-react";
import { useMemo, useState } from "react";

type ManifestFile = {
  path: string;
  content: string;
  encoding?: "utf8" | "base64";
  overwrite?: boolean;
  executable?: boolean;
};

type SandboxManifest = {
  projectType?: string;
  template?: string;
  deps?: Record<string, string>;
  devDeps?: Record<string, string>;
  files: ManifestFile[];
  entrypoints?: Record<string, string>;
  assets?: {
    path: string;
    content: string;
    encoding?: "base64" | "utf8";
    external?: boolean;
  }[];
  complete?: boolean;
  runtime?: "browser" | "react" | "nextjs" | "code-only";
};

export type SandBoxProps = {
  manifest: SandboxManifest;
  className?: string;
};

function toSandpackFiles(files: ManifestFile[]): Record<string, any> {
  const map: Record<string, any> = {};
  for (const f of files || []) {
    const code = f.encoding === "base64" ? atob(f.content) : f.content;
    const normalized = f.path.replace(/^\/*/, "");
    map[normalized] = { code };
  }
  return map;
}

export default function SandBox({ manifest, className }: SandBoxProps) {
  const [visible, setVisible] = useState(true);
  const defaultTab: "code" | "preview" | "console" = (() => {
    const rt = detectRuntime(manifest);
    return rt === "code-only" ? "code" : "preview";
  })();
  const [activeTab, setActiveTab] = useState<"code" | "preview" | "console">(
    defaultTab,
  );
  const [showFiles, setShowFiles] = useState<boolean>(false);

  const template =
    manifest?.template ||
    detectTemplateFromFiles(manifest?.files || []) ||
    "vanilla";
  const filesObj = useMemo(
    () => toSandpackFiles(manifest?.files || []),
    [manifest],
  );
  const filePaths = useMemo(
    () =>
      (manifest?.files || []).map(
        (f) => "/" + (f.path || "").replace(/^\/+/, ""),
      ),
    [manifest],
  );
  const activeFile = useMemo(() => {
    const main = manifest.entrypoints?.main || (manifest as any)?.mainFile;
    if (main) return "/" + String(main).replace(/^\/+/, "");
    const candidates = [
      "/index.html",
      "/src/main.tsx",
      "/src/index.tsx",
      "/src/index.jsx",
      "/index.tsx",
      "/index.jsx",
      "/pages/index.tsx",
      "/app/page.tsx",
      filePaths[0],
    ].filter(Boolean) as string[];
    const found = candidates.find((p) => filePaths.includes(p));
    return found || filePaths[0] || "/index.html";
  }, [manifest, filePaths]);
  const externalResources = useMemo(() => {
    const links: string[] = [];
    for (const a of manifest.assets || []) {
      if (a.external && /^https?:\/\//i.test(a.path)) links.push(a.path);
    }
    return links;
  }, [manifest.assets]);

  return (
    <Card className={cn("pt-0 border-2 border-foreground bg-card", className)}>
      <div className="flex items-center justify-between px-3 py-2 bg-primary text-primary-foreground border-b-2 border-foreground">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <span>Sandbox</span>
        </div>
      </div>

      {visible && (
        <div className="p-3">
          <SandpackProvider
            template={template as any}
            files={filesObj}
            customSetup={{
              dependencies: manifest?.deps,
              devDependencies: manifest?.devDeps,
            }}
            options={{
              visibleFiles: filePaths.length ? filePaths : undefined,
              activeFile,
              externalResources,
              autorun: true,
              recompileMode: "delayed",
              recompileDelay: 300,
            }}
            className="!w-full !h-full"
          >
            <Tabs
              value={activeTab}
              onValueChange={(v) => setActiveTab(v as any)}
              className="w-full"
            >
              <TabsList className="mb-2">
                <TabsTrigger value="code">Code</TabsTrigger>
                {shouldShowPreview(template) && (
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                )}
                {template !== "code-only" && (
                  <TabsTrigger value="console">Console</TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="code" className="m-0">
                <SandpackLayout className="!rounded-none !border-2 !border-foreground">
                  <ResizablePanelGroup direction="horizontal">
                    {showFiles && (
                      <>
                        <ResizablePanel
                          defaultSize={25}
                          minSize={15}
                          maxSize={40}
                          className="overflow-y-auto"
                        >
                          <SandpackFileExplorer className="h-full" />
                        </ResizablePanel>
                        <ResizableHandle withHandle />
                      </>
                    )}
                    <ResizablePanel className="overflow-y-auto">
                      <SandpackCodeEditor showTabs={false} />
                    </ResizablePanel>
                  </ResizablePanelGroup>
                </SandpackLayout>
              </TabsContent>

              {shouldShowPreview(template) && (
                <TabsContent value="preview" className="m-0">
                  <SandpackLayout className="!rounded-none !border-2 !border-foreground">
                    <SandpackPreview
                      showOpenInCodeSandbox={false}
                      showRefreshButton={false}
                      className="h-[520px]"
                    />
                  </SandpackLayout>
                </TabsContent>
              )}

              {template !== "code-only" && (
                <TabsContent value="console" className="m-0">
                  <SandpackLayout className="!rounded-none !border-2 !border-foreground">
                    <SandpackConsole className="h-[520px]" />
                  </SandpackLayout>
                </TabsContent>
              )}
            </Tabs>
          </SandpackProvider>
        </div>
      )}
    </Card>
  );
}

function detectTemplateFromFiles(files: ManifestFile[]): string | null {
  const names = (files || []).map((f) => f.path.toLowerCase());
  const has = (s: string) => names.some((n) => n.endsWith(s));
  if (has("package.json") && names.some((n) => n.includes("next")))
    return "nextjs";
  if (
    has("index.tsx") ||
    has("app.tsx") ||
    names.some((n) => n.endsWith(".tsx"))
  )
    return "react-ts";
  if (
    has("index.jsx") ||
    has("app.jsx") ||
    names.some((n) => n.endsWith(".jsx"))
  )
    return "react";
  if (names.some((n) => n.endsWith(".svelte"))) return "svelte";
  if (names.some((n) => n.endsWith(".vue"))) return "vue";
  if (has("index.ts")) return "vanilla-ts";
  return "vanilla";
}

function toTemplateLabel(t: string): string {
  const map: Record<string, string> = {
    nextjs: "Next.js",
    "react-ts": "React (TS)",
    react: "React",
    svelte: "Svelte",
    vue: "Vue",
    "vanilla-ts": "TypeScript",
    vanilla: "JavaScript",
  };
  return map[t] || t;
}

function detectRuntime(manifest: SandboxManifest): SandboxManifest["runtime"] {
  if (manifest.runtime) return manifest.runtime;
  const template =
    manifest.template ||
    detectTemplateFromFiles(manifest.files || []) ||
    "vanilla";
  if (template === "nextjs") return "nextjs";
  if (template === "react" || template === "react-ts") return "react";
  const hasHtml = (manifest.files || []).some((f) =>
    /index\.html$/i.test(f.path),
  );
  return hasHtml ? "browser" : "code-only";
}

function shouldShowPreview(template: string): boolean {
  return [
    "vanilla",
    "vanilla-ts",
    "react",
    "react-ts",
    "nextjs",
    "vue",
    "svelte",
  ].includes(template);
}
