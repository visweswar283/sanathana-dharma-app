# Sanathana Dharma App — Developer Guide

> Technical reference for building, running, and extending the app.

---

## Table of Contents

1. [Project Structure](#project-structure)
2. [Prerequisites](#prerequisites)
3. [Local Setup](#local-setup)
4. [Environment Variables](#environment-variables)
5. [Running the App](#running-the-app)
6. [Architecture Overview](#architecture-overview)
7. [Deity Plugin System](#deity-plugin-system)
8. [Adding a New Deity](#adding-a-new-deity)
9. [SSE Streaming](#sse-streaming)
10. [Auth Flow](#auth-flow)
11. [State Management](#state-management)
12. [Sacred Theme System](#sacred-theme-system)
13. [PR History](#pr-history)
14. [Known Issues & Fixes](#known-issues--fixes)
15. [GitHub Workflow](#github-workflow)

---

## Project Structure

```
sanathana-dharma-app/           ← monorepo root
├── backend/                    ← Express + TypeScript API
│   ├── src/
│   │   ├── config/
│   │   │   ├── anthropic.ts    ← Anthropic client singleton
│   │   │   └── environment.ts  ← Zod env validation
│   │   ├── deities/
│   │   │   ├── base/
│   │   │   │   ├── DeityPlugin.ts  ← Abstract base class
│   │   │   │   └── types.ts        ← Shared types (DeityMetadata, TextBlock)
│   │   │   ├── plugins/
│   │   │   │   ├── hanuma/     ← Phase 1 (active)
│   │   │   │   │   ├── index.ts
│   │   │   │   │   ├── metadata.ts
│   │   │   │   │   ├── systemPrompt.ts
│   │   │   │   │   └── knowledge.ts
│   │   │   │   ├── shiva/      ← Phase 2 (stub)
│   │   │   │   ├── vishnu/     ← Phase 2 (stub)
│   │   │   │   ├── vinayaka/   ← Phase 2 (stub)
│   │   │   │   └── brahma/     ← Phase 2 (stub)
│   │   │   └── registry.ts     ← DeityRegistry singleton
│   │   ├── middleware/
│   │   │   ├── auth.ts         ← JWT verification
│   │   │   ├── errorHandler.ts ← Global error handler
│   │   │   ├── rateLimit.ts    ← Per-user rate limiting
│   │   │   └── validate.ts     ← Zod request validation
│   │   ├── models/
│   │   │   ├── Conversation.ts
│   │   │   ├── User.ts
│   │   │   └── schemas.ts      ← Zod schemas for request bodies
│   │   ├── routes/
│   │   │   ├── auth.ts         ← POST /auth/register, /auth/login
│   │   │   ├── chat.ts         ← POST /chat/:deityId (SSE stream)
│   │   │   ├── conversations.ts
│   │   │   ├── deities.ts      ← GET /deities
│   │   │   └── health.ts       ← GET /health
│   │   ├── services/
│   │   │   ├── chat/
│   │   │   │   ├── ChatService.ts    ← Async generator, mock/real routing
│   │   │   │   └── MockResponses.ts  ← Pre-written deity responses
│   │   │   ├── conversation/
│   │   │   │   └── ConversationStore.ts  ← In-memory conversation history
│   │   │   └── user/
│   │   │       └── UserStore.ts      ← In-memory user accounts
│   │   ├── utils/
│   │   │   ├── errors.ts       ← AppError class, HTTP error helpers
│   │   │   └── logger.ts       ← Console logger
│   │   └── server.ts           ← Express app entry point
│   ├── .env                    ← Local secrets (git-ignored)
│   ├── .env.example            ← Template — copy this to .env
│   ├── package.json
│   └── tsconfig.json
│
├── mobile/                     ← Expo (React Native) app
│   ├── app/                    ← Expo Router file-based routes
│   │   ├── _layout.tsx         ← Root layout (auth gate)
│   │   ├── index.tsx           ← Splash/redirect
│   │   ├── (auth)/
│   │   │   ├── _layout.tsx
│   │   │   ├── login.tsx
│   │   │   └── register.tsx
│   │   └── (app)/
│   │       ├── _layout.tsx
│   │       ├── deities.tsx     ← Deity selection screen
│   │       └── chat/
│   │           ├── _layout.tsx
│   │           └── [deityId].tsx  ← Chat screen (dynamic route)
│   ├── src/
│   │   ├── components/
│   │   │   ├── chat/
│   │   │   │   ├── ChatBubble.tsx      ← User & deity message bubbles
│   │   │   │   ├── ChatInput.tsx       ← Text input + send button
│   │   │   │   ├── EmotionPicker.tsx   ← 6 emotion chips
│   │   │   │   └── TypingIndicator.tsx ← Animated dots
│   │   │   └── deity/
│   │   │       └── DeityCard.tsx       ← Deity selection card
│   │   ├── services/
│   │   │   ├── api/
│   │   │   │   ├── client.ts     ← Axios instance with JWT interceptor
│   │   │   │   ├── authApi.ts    ← login / register calls
│   │   │   │   └── deityApi.ts   ← GET /deities
│   │   │   └── streaming/
│   │   │       └── sseClient.ts  ← XHR-based SSE client
│   │   ├── store/
│   │   │   ├── chatStore.ts   ← Zustand: messages, streaming state
│   │   │   ├── deityStore.ts  ← Zustand: available deities list
│   │   │   └── userStore.ts   ← Zustand: auth state + AsyncStorage
│   │   ├── theme/
│   │   │   ├── colors.ts      ← Saffron, Gold, Deep Dark palette
│   │   │   ├── typography.ts  ← TYPE scale
│   │   │   └── index.ts       ← Re-exports COLORS, SPACING, RADIUS, TYPE
│   │   ├── types/
│   │   │   ├── auth.ts
│   │   │   ├── chat.ts        ← ChatMessage, EmotionalState
│   │   │   └── deity.ts       ← DeityMetadata
│   │   └── utils/
│   │       └── id.ts          ← RN-safe ID generator (no Web Crypto)
│   ├── app.json
│   ├── babel.config.js
│   ├── package.json
│   └── tsconfig.json
│
├── Sanathana_dharma.md         ← Product overview
├── sanathana_dharma_dev.md     ← This file
└── README.md
```

---

## Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| Node.js | 18+ | Use nvm or fnm |
| npm | 10+ | Comes with Node 18 |
| Expo Go (iPhone/Android) | SDK 54 | Must match — update in App Store if needed |
| Watchman | Latest | Prevents EMFILE errors on macOS: `brew install watchman` |
| Anthropic API key | Optional | Only needed for real AI mode |

---

## Local Setup

### 1. Clone the repo

```bash
git clone https://github.com/visweswar283/sanathana-dharma-app.git
cd sanathana-dharma-app
```

### 2. Backend setup

```bash
cd backend
cp .env.example .env
npm install
```

The default `.env` has `MOCK_MODE=true` — no API key needed to run locally.

### 3. Mobile setup

```bash
cd mobile
npm install
```

### 4. Set your machine's local IP (for phone testing)

Open `mobile/src/services/api/client.ts` and update `BASE_URL`:

```ts
// Find your Mac's IP: System Settings → Wi-Fi → Details
export const BASE_URL = 'http://YOUR_MAC_IP:3000/api';
```

Your phone and Mac must be on the **same Wi-Fi network**.

### 5. macOS file descriptor limit (required once)

```bash
ulimit -n 65536
```

Add to your `~/.zshrc` to make it permanent:
```bash
echo "ulimit -n 65536" >> ~/.zshrc
```

---

## Environment Variables

All variables live in `backend/.env`. Validated at startup using Zod — the server refuses to start if required types are wrong.

| Variable | Default | Description |
|----------|---------|-------------|
| `ANTHROPIC_API_KEY` | *(empty)* | Anthropic API key. Empty = mock mode automatically activated |
| `MOCK_MODE` | `true` | Force mock mode even if API key is set |
| `PORT` | `3000` | Express server port |
| `NODE_ENV` | `development` | `development` / `production` / `test` |
| `JWT_SECRET` | `dev-secret-...` | **Must change in production** |
| `JWT_EXPIRES_IN` | `7d` | JWT token lifetime |
| `ALLOWED_ORIGINS` | `http://localhost:8081` | Comma-separated CORS origins |

### Mock mode vs Real AI

```bash
# Mock mode (default — no API key needed)
ANTHROPIC_API_KEY=
MOCK_MODE=true

# Real Claude AI
ANTHROPIC_API_KEY=sk-ant-your-key-here
MOCK_MODE=false
```

Mock mode streams pre-written Hanuma responses word-by-word at 40ms intervals — the UI experience is identical to real AI mode.

---

## Running the App

### Terminal 1 — Backend

```bash
cd backend
npm run dev
```

Expected output:
```
✅ Server running on port 3000
🎭 Mock mode: true
```

### Terminal 2 — Mobile

```bash
cd mobile
npx expo start
```

Scan the QR code with:
- **iPhone**: Open Expo Go app → scan (do NOT use the camera app)
- **Android**: Open Expo Go app → scan

> If you see "Project is incompatible with this version of Expo Go", update Expo Go in the App Store. This project uses **SDK 54**.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│  React Native (Expo)                                    │
│                                                         │
│  Screens → Zustand stores → sseClient.ts (XHR)         │
│                ↓                              ↓         │
│         authApi.ts                   axios client       │
└────────────────────┬────────────────────────────────────┘
                     │  HTTP + SSE
┌────────────────────▼────────────────────────────────────┐
│  Express Backend                                        │
│                                                         │
│  auth routes → JWT → chat routes → ChatService          │
│                                         ↓               │
│                                  DeityRegistry          │
│                                         ↓               │
│                              DeityPlugin (abstract)     │
│                                   /    \                │
│                              Hanuma   [Shiva, Vishnu…]  │
│                                   \    /                │
│                             Anthropic API               │
│                            (or MockResponses)           │
└─────────────────────────────────────────────────────────┘
```

### Request lifecycle

1. User sends message in chat screen
2. `chatStore.sendMessage()` calls `streamChatResponse()`
3. `sseClient.ts` opens XHR to `POST /api/chat/:deityId`
4. Backend authenticates JWT, checks rate limit
5. `ChatService` fetches the deity plugin from `DeityRegistry`
6. Plugin's `buildCachedSystemBlocks()` assembles prompt with cache markers
7. In real mode: `anthropic.messages.stream()` yields chunks → SSE events
8. In mock mode: `MockResponses` streams words at 40ms → same SSE events
9. Mobile XHR `onprogress` fires on each chunk → `parseSSELines()` → Zustand patches the message bubble

---

## Deity Plugin System

The core design principle: **adding a new deity = one new file, zero changes elsewhere**.

### Base class contract

```ts
// backend/src/deities/base/DeityPlugin.ts
abstract class DeityPlugin {
  abstract readonly metadata: DeityMetadata;

  /** Personality, tone, rules — static, fully cacheable */
  abstract buildSystemPrompt(): string;

  /** Sacred texts, shlokas, episodes — large, fully cacheable */
  abstract getKnowledgeBlocks(): TextBlock[];

  /** Built-in — assembles blocks and marks last one for prompt caching */
  buildCachedSystemBlocks(): TextBlock[];

  /** Optional — transform user message before sending to Claude */
  transformUserMessage(raw: string, emotionalState?: string): string;
}
```

### Prompt caching

Claude's prompt caching cuts input token cost by ~89% on repeated requests. The strategy:

- All system blocks (personality + knowledge) are combined
- Only the **last block** gets `cache_control: { type: 'ephemeral' }`
- Claude caches everything up to that block on the first request
- Subsequent requests pay only ~10% of the input token cost

```ts
buildCachedSystemBlocks(): TextBlock[] {
  const allBlocks = [
    { type: 'text', text: this.buildSystemPrompt() },
    ...this.getKnowledgeBlocks(),
  ];
  // Mark last block — caches everything before it
  allBlocks[allBlocks.length - 1] = {
    ...allBlocks[allBlocks.length - 1],
    cache_control: { type: 'ephemeral' },
  };
  return allBlocks;
}
```

### DeityMetadata shape

```ts
interface DeityMetadata {
  id: string;              // e.g. 'hanuma'
  name: string;            // e.g. 'Lord Hanuma'
  sanskrit: string;        // e.g. 'हनुमान्'
  description: string;
  specialties: string[];
  isAvailable: boolean;    // false = shown as locked in UI
  phase: number;           // 1, 2, or 3
}
```

---

## Adding a New Deity

Example: adding Lord Shiva as a full deity in Phase 2.

### Step 1 — Create the plugin

```
backend/src/deities/plugins/shiva/
├── index.ts        ← extends DeityPlugin
├── metadata.ts     ← DeityMetadata object
├── systemPrompt.ts ← personality, tone, response modes
└── knowledge.ts    ← Shiva Purana excerpts, shlokas
```

**`metadata.ts`**
```ts
import type { DeityMetadata } from '../../base/types';

export const shivaMeta: DeityMetadata = {
  id: 'shiva',
  name: 'Lord Shiva',
  sanskrit: 'शिव',
  description: 'The destroyer and transformer, master of meditation and detachment',
  specialties: ['Transformation', 'Meditation', 'Detachment', 'Liberation', 'Fearlessness'],
  isAvailable: true,   // ← change from false when ready
  phase: 2,
};
```

**`index.ts`**
```ts
import { DeityPlugin } from '../../base/DeityPlugin';
import type { DeityMetadata, TextBlock } from '../../base/types';
import { shivaMeta } from './metadata';
import { buildShivaSystemPrompt } from './systemPrompt';
import { getShivaKnowledgeBlocks } from './knowledge';

export class ShivaDeity extends DeityPlugin {
  readonly metadata: DeityMetadata = shivaMeta;

  buildSystemPrompt(): string {
    return buildShivaSystemPrompt();
  }

  getKnowledgeBlocks(): TextBlock[] {
    return getShivaKnowledgeBlocks();
  }
}
```

### Step 2 — Register in registry

```ts
// backend/src/deities/registry.ts
import { ShivaDeity } from './plugins/shiva';

const ALL_DEITIES: DeityPlugin[] = [
  new HanumaDeity(),
  new ShivaDeity(),   // ← add here
  // ...
];
```

### Step 3 — Add mock responses

```ts
// backend/src/services/chat/MockResponses.ts
export const MOCK_RESPONSES: Record<string, Record<string, string>> = {
  hanuma: { /* ... */ },
  shiva: {
    default: 'Om Namah Shivaya... [Shiva mock response]',
    sad: '...',
  },
};
```

That's it. The routes, ChatService, mobile UI, and deity selection screen all pick up the new deity automatically.

---

## SSE Streaming

### Why XHR, not fetch

React Native's `fetch` does **not** support `response.body.getReader()` (ReadableStream). Using it produces: `"No response stream received"` or silent failure.

The solution is `XMLHttpRequest.onprogress` which fires incrementally as data arrives — works on both iOS and Android.

```ts
// mobile/src/services/streaming/sseClient.ts
xhr.onprogress = () => {
  const newText = xhr.responseText.slice(cursor);
  cursor = xhr.responseText.length;
  parseSSELines(newText, onEvent);
};
```

### SSE event format

The backend sends newline-delimited JSON over `text/event-stream`:

```
data: {"type":"chunk","content":"Jai "}
data: {"type":"chunk","content":"Shri "}
data: {"type":"chunk","content":"Ram"}
data: {"type":"done","conversationId":"abc","cachedTokens":1200,"totalTokens":1350}
```

### Event types

| Type | Fields | Description |
|------|--------|-------------|
| `chunk` | `content: string` | Partial text to append to the message bubble |
| `done` | `conversationId`, `cachedTokens`, `totalTokens` | Stream complete |
| `error` | `message: string` | Something went wrong |

---

## Auth Flow

```
Register/Login → POST /api/auth/register or /login
                 → bcryptjs hashes password
                 → JWT signed with JWT_SECRET
                 → token returned to mobile
                 → stored in AsyncStorage
                 → attached as Bearer token on all requests
```

**JWT middleware** (`backend/src/middleware/auth.ts`):
- Reads `Authorization: Bearer <token>` header
- Verifies signature and expiry
- Attaches `req.user = { id, email }` for downstream handlers

**In-memory stores** (Phase 1):
- `UserStore` — map of `userId → User`
- `ConversationStore` — map of `conversationId → Conversation`, with user index
- Both are cleared on server restart — no persistence in Phase 1

**Phase 2 upgrade path**: swap `UserStore` and `ConversationStore` for database calls (PostgreSQL or MongoDB) without changing any routes or services.

---

## State Management

Three Zustand stores:

### `userStore`
```ts
{ user, token, isLoading, error }
login(email, password) → POST /auth/login → saves token to AsyncStorage
register(email, name, password) → POST /auth/register
logout() → clears AsyncStorage + store
```

### `deityStore`
```ts
{ deities, isLoading, error }
fetchDeities() → GET /deities → populates list
```

### `chatStore`
```ts
{ messages, conversationId, isStreaming, error, abortController }
sendMessage(deityId, text, emotionalState) → streams response
clearConversation() → aborts any in-flight request, resets state
```

Message flow in `chatStore.sendMessage()`:
1. Appends user message immediately (optimistic)
2. Appends empty deity message with `isStreaming: true`
3. Opens XHR stream
4. On each `chunk` event: patches deity message content by ID
5. On `done`: sets `isStreaming: false`, saves `conversationId`
6. On `error`: shows error in deity message bubble

---

## Sacred Theme System

```ts
// mobile/src/theme/colors.ts
COLORS = {
  bgDeep:      '#0F0500',  // Deep dark brown — background
  bgMid:       '#1A0A00',  // Slightly lighter — gradient end
  saffron:     '#FF6B00',  // Primary CTA, user bubbles, active elements
  gold:        '#FFD700',  // Sanskrit text, OM symbol, accent
  textWhite:   '#FFFFFF',
  textCream:   '#F5E6D3',  // Body text
  textMuted:   '#8B6F5E',  // Placeholders
  inputBg:     '#1F0F00',
  inputBorder: '#3D1F00',
  error:       '#FF4444',
}
```

Usage pattern:
```ts
import { COLORS, SPACING, RADIUS, TYPE } from '../../src/theme';

const styles = StyleSheet.create({
  container: { backgroundColor: COLORS.bgDeep, padding: SPACING.md },
  title: { ...TYPE.heading1 },  // spread the type scale object
});
```

---

## PR History

All features were built through feature branches merged to `main` via GitHub PRs.

| PR | Branch | What it built |
|----|--------|---------------|
| 1 | `feature/project-scaffold` | Monorepo structure, backend+mobile scaffolding, TypeScript configs |
| 2 | `feature/deity-plugin-system` | `DeityPlugin` abstract base class, `DeityRegistry`, all 5 deity stubs |
| 3 | `feature/hanuma-full-implementation` | Full Hanuma system prompt, complete Hanuma Chalisa knowledge corpus, 8 situational shlokas |
| 4 | `feature/anthropic-integration` | Anthropic SDK, `ChatService` with async generator, prompt caching, SSE stream headers |
| 5 | `feature/mock-mode` | `MockResponses.ts` with per-deity/per-emotion responses, mock mode routing in `ChatService` |
| 6 | `feature/auth-system` | JWT auth, bcryptjs hashing, register/login routes, `UserStore`, auth middleware |
| 7 | `feature/conversation-store` | `ConversationStore`, conversation history endpoint, Claude message history (last 20) |
| 8 | `feature/sacred-theme` | Color palette, typography scale, SPACING/RADIUS constants |
| 9 | `feature/auth-screens` | Login + register screens, validation, error display, Expo Router auth layout |
| 10 | `feature/deity-selection-screen` | Deity selection screen, `DeityCard` component, `deityStore` |
| 11 | `feature/chat-screen` | Full chat screen, `ChatBubble`, `EmotionPicker`, `ChatInput`, `TypingIndicator` |
| 12 | `feature/streaming-client` | XHR-based SSE client, `sseClient.ts`, `chatStore`, RN-safe `generateId()` |
| 13 | `feature/integration-fixes` | Network IP fix, crypto fix, streaming fix, SDK 54 upgrade, watchman setup |

---

## Known Issues & Fixes

### Port 3000 already in use

```bash
lsof -ti :3000 | xargs kill -9
```

### EMFILE: too many open files (macOS)

```bash
brew install watchman
ulimit -n 65536
```

### Expo Go QR code not working

Use the Expo Go app to scan — not the iPhone camera. The camera opens a web URL; Expo Go opens the development server.

### "Project is incompatible with this version of Expo Go"

Update Expo Go in the App Store. This project requires **SDK 54**.

### Network Error on physical device

`localhost` resolves to the phone, not your Mac. Update `BASE_URL` in `mobile/src/services/api/client.ts` to your Mac's local IP address:

```bash
# Find your Mac's IP
ipconfig getifaddr en0
```

### "No response stream received" / silent streaming failure

React Native's `fetch` does not support `ReadableStream`. Use `XMLHttpRequest.onprogress` instead — already implemented in `sseClient.ts`.

### `crypto.getRandomValues() is not supported`

The `uuid` package uses the Web Crypto API which is unavailable in React Native. The project uses a custom `generateId()` in `mobile/src/utils/id.ts` instead — do not use `uuid` for client-side ID generation.

### TypeScript error on `cache_read_input_tokens`

The Anthropic SDK's `Usage` type doesn't include `cache_read_input_tokens`. Cast with:
```ts
const usage = finalMessage.usage as unknown as Record<string, number>;
const cachedTokens = usage['cache_read_input_tokens'] ?? 0;
```

---

## GitHub Workflow

### Branch naming

```
feature/<name>     ← new functionality
fix/<name>         ← bug fixes
chore/<name>       ← tooling, deps, config
```

### PR process

```bash
# 1. Create feature branch
git checkout -b feature/my-feature

# 2. Build, commit
git add <specific files>
git commit -m "feat: describe what this builds"

# 3. Push
git push origin feature/my-feature

# 4. Open PR on GitHub → review → merge to main
# 5. Delete branch after merge
```

### What NOT to commit

The `.gitignore` excludes:
- `backend/.env` — contains secrets
- `*.txt` — includes `Problems_avoid.txt` (internal notes)
- `node_modules/`
- Build artifacts (`dist/`, `.expo/`)

Always use `.env.example` as the reference for env vars — never commit the real `.env`.

---

## Phase 2 Checklist

When extending to Shiva, Vishnu, Vinayaka, Brahma:

- [ ] Write full `systemPrompt.ts` for each deity
- [ ] Write `knowledge.ts` with relevant Purana excerpts and shlokas
- [ ] Set `isAvailable: true` in each deity's `metadata.ts`
- [ ] Add mock responses in `MockResponses.ts`
- [ ] Add deity images / glyphs to mobile assets
- [ ] Swap `ConversationStore` for persistent DB (Redis or PostgreSQL)
- [ ] Add push notifications for daily motivation
- [ ] Deploy backend (Railway, Render, or AWS)

---

*"Seek the divine within" — Jai Shri Ram* 🙏
