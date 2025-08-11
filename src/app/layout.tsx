import { cn } from "@/lib/utils";
import AppProviders from "@/providers/app-providers";
import { Analytics } from "@vercel/analytics/next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title:
    "Nano Studio 98 - Chrome Built-in AI Chat (Gemini Nano) - Local, Private, Fast",
  description:
    "Windows 98-style Chrome Built-in AI Chat powered by Gemini Nano. Local, private, and fast AI conversations with built-in tools for chat, summarize, translate, detect, write, rewrite, and proofread. No external APIs required - runs entirely in your browser.",
  metadataBase: new URL("https://gemini-nano.vercel.app"),
  alternates: {
    canonical: "https://gemini-nano.vercel.app",
  },
  keywords: [
    "Chrome Built-in AI",
    "Gemini Nano",
    "Local AI Chat",
    "Private AI",
    "Windows 98",
    "Nano Studio",
    "Browser AI",
    "Offline AI",
    "AI Chat",
    "AI Summarizer",
    "AI Translator",
    "AI Writer",
    "AI Proofreader",
    "Chrome Extension AI",
    "Browser-based AI",
    "Privacy-focused AI",
    "No API Keys",
    "Local Processing",
  ],
  authors: [{ name: "Bankk", url: "https://bankkroll.xyz" }],
  creator: "Bankk",
  publisher: "Chrome Built-in AI",
  category: "AI Chat Application",
  classification: "Local AI Assistant",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "Nano Studio 98 - Chrome Built-in AI Chat",
    description:
      "Windows 98-style Chrome Built-in AI Chat powered by Gemini Nano. Local, private, and fast.",
    url: "https://gemini-nano.vercel.app",
    type: "website",
    locale: "en_US",
    siteName: "Nano Studio 98",
    images: [
      {
        url: "/og-meta-preview.png",
        width: 1200,
        height: 630,
        alt: "Nano Studio 98 - Chrome Built-in AI Chat Interface",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nano Studio 98 - Chrome Built-in AI Chat",
    description:
      "Windows 98-style Chrome Built-in AI Chat powered by Gemini Nano. Local, private, and fast.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(GeistSans.variable, GeistMono.variable)}
    >
      <head />
      <body>
        <AppProviders>{children}</AppProviders>
        <Analytics />
      </body>
    </html>
  );
}
