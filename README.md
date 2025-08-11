# Nano Studio 98

> Chrome Built‑in AI Chat (Gemini Nano) - Local, Private, Fast

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)

<img alt="image" src="https://github.com/user-attachments/assets/fa89bb6b-5608-44a0-ad8a-a98fe1cb7486" />

<details>
 <summary>View it in action video</summary>
  <div align="center">
    <video src="https://github.com/user-attachments/assets/93f44d2e-4cf1-486c-9cc8-eb824bff7d77" alt="Nano Studio" width="120" height="120">
  </div>
</details>

---

## Features

- **Local AI** - Chrome Built‑in AI (Gemini Nano) on your device
- **Smart Chat** - Streaming responses, conversation management
- **AI Tools** - Summarize, translate, detect, write, rewrite, proofread
- **Responsive** - Works on desktop and mobile
- **Private** - No servers, no API keys, all local
- **Modern UI** - Clean interface with smooth animations

## Quick start

```bash
# Clone
git clone https://github.com/BankkRoll/gemini-nano-v2.git
cd gemini-nano-v2

# Install
pnpm install

# Dev
pnpm dev

# Build + start
pnpm build
pnpm start
```

## Project structure

```
src/
├─ app/
│  ├─ globals.css
│  ├─ layout.tsx
│  └─ page.tsx
├─ components/
│  ├─ chat/
│  │  ├─ auto-scroll-area.tsx
│  │  ├─ chat-feed.tsx
│  │  ├─ message-item.tsx
│  │  ├─ message-list.tsx
│  │  ├─ status-badge.tsx
│  │  ├─ thinking-animation.tsx
│  │  └─ welcome-text.tsx
│  ├─ markdown-renderer/
│  │  ├─ code-block.tsx
│  │  ├─ components.tsx
│  │  └─ index.tsx
│  ├─ prompt-dock/
│  │  ├─ index.tsx
│  │  ├─ model-select.tsx
│  │  ├─ send-controls.tsx
│  │  ├─ tool-select.tsx
│  │  └─ translate-select.tsx
│  ├─ settings-dialog/
│  │  ├─ index.tsx
│  │  ├─ language-select.tsx
│  │  ├─ stream-control.tsx
│  │  ├─ temperature-control.tsx
│  │  └─ topk-control.tsx
│  ├─ sidebar/
│  │  ├─ conversation-item.tsx
│  │  ├─ index.tsx
│  │  ├─ model-info-dialog.tsx
│  │  ├─ status-badge.tsx
│  │  └─ status-rows.tsx
│  ├─ signin/
│  │  ├─ boot-loader.tsx
│  │  ├─ welcome.tsx
│  │  └─ windows-loading.tsx
│  ├─ download-required-dialog.tsx
│  ├─ logo.tsx
│  ├─ theme-provider.tsx
│  └─ ui/  # Shadcn/Radix-based primitives
│     ├─ accordion.tsx … separator.tsx … sidebar.tsx … dialog.tsx … (and more)
├─ hooks/
│  ├─ use-auto-scroll.ts
│  └─ use-mobile.ts
├─ lib/
│  ├─ config.ts
│  ├─ session.ts
│  ├─ storage.ts
│  └─ utils.ts
├─ providers/
│  └─ app-providers.tsx
├─ store/
│  └─ app-store.ts
└─ types/
   └─ index.ts
```

## Development

### Commands

```bash
pnpm dev          # Start dev server
pnpm build        # Production build
pnpm start        # Serve production
pnpm lint         # Run linting
pnpm format       # Format code
```

### Requirements

- Chrome desktop with Built‑in AI enabled
- Node.js 18+
- pnpm 9+

### Tech Stack

- **Framework**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS v4, Radix UI
- **Animation**: motion/react
- **Storage**: localStorage/sessionStorage
- **Markdown**: Custom parser + Shiki highlighting

## Data Storage

```typescript
// localStorage (persistent, per user — keys are scoped to user id)
"nano:{userId}:settings"       // App settings
"nano:{userId}:conversations"  // Chat history
"nano:{userId}:active"         // Active conversation id

// sessionStorage (temporary)
nano: session; // User session
```

## Configuration

```typescript
// Default settings
{
  systemPrompt: "You are a helpful, concise assistant.",
  temperature: 0.7,
  topK: 1,
  stream: true,
  targetLang: "en"
}
```

## Contributing

1. Fork the repo
2. Create feature branch: `git checkout -b feat/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push: `git push origin feat/amazing-feature`
5. Open Pull Request

### Guidelines

- TypeScript strict mode
- Clean, readable code
- No TODOs - ship complete features
- Use `motion/react` (no framer-motion)
- Avoid scale/hover effects

## License

MIT License - see [LICENSE](LICENSE) file.
