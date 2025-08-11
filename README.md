# Nano Studio

> Chrome Built‑in AI Chat (Gemini Nano) - Local, Private, Fast

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)

<img width="1669" height="945" alt="image" src="https://github.com/user-attachments/assets/2897d220-ab6d-486d-9066-9a1e823dc498" />

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

## Quick Start

```bash
# Clone
git clone https://github.com/BankkRoll/gemini-nano-v2.git
cd chrome-nano-ai-app

# Install
pnpm install

# Dev
pnpm dev

# Build
pnpm build
pnpm start
```

## Project Structure

```
src/
├── app/                    # Next.js app router
│   ├── globals.css        # Tailwind v4 + styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main app
├── components/             # UI components
│   ├── chat/              # Chat interface
│   ├── markdown-renderer/ # Markdown parsing
│   ├── prompt-dock/       # Input panel
│   ├── settings-dialog/   # Settings modal
│   ├── sidebar/           # Conversation list
│   └── ui/                # Reusable UI primitives
├── hooks/                  # Custom hooks
├── lib/                    # Storage, config, utils
└── types/                  # TypeScript types
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
// localStorage (persistent)
nano: settings; // App settings
nano: conversations; // Chat history
nano: active; // Active conversation

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
