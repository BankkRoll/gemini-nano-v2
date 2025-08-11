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
src/                                 - App source
├─ app/                               - Next.js app router entrypoints
│  ├─ globals.css                     - Tailwind v4 base/theme/styles
│  ├─ layout.tsx                      - Root HTML/body/providers
│  └─ page.tsx                        - Main application shell
├─ components/                        - UI and feature components
│  ├─ chat/                           - Chat UI and effects
│  ├─ markdown-renderer/              - Markdown rendering pipeline
│  ├─ prompt-dock/                    - Input dock (model/tool/translate/send)
│  ├─ settings-dialog/                - Settings modal
│  ├─ sidebar/                        - Conversations and model status
│  ├─ signin/                         - Windows‑style sign‑in flow
│  ├─ download-required-dialog.tsx    - Prompt to warm up/download models
│  ├─ logo.tsx                        - App logo SVG
│  ├─ theme-provider.tsx              - next-themes provider wrapper
│  └─ ui/                             - Reusable primitives (shadcn/radix)
├─ hooks/                             - Custom hooks
├─ lib/                               - App utilities and storage
├─ providers/                         - Global providers - Hydration, AI refresh, URL sync, dialog
├─ store/                             - Zustand store - Conversations, pending tool/model, AI
└─ types/                             - Shared types
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

- Users roster: `localStorage["nano:users"]` (list of local Windows‑style users)
- Signed‑in session: `sessionStorage["nano:session"]` (current user only)
- Per‑user scoped keys (persisted in `localStorage`):
  - `nano:{userId}:settings` — app settings (system prompt, temperature, …)
  - `nano:{userId}:conversations` — conversation list + messages
  - `nano:{userId}:active` — active conversation id

Notes

- Keys are automatically scoped by `userId` via `lib/storage.ts`.
- On sign‑in/out we clear the active conversation id to avoid stale selection.
- Tool/Model changes are stored as pending until the first message creates a chat.

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
