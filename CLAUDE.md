# Airmini Frontend — Claude Context

## Stack

| Layer | Tech | Version |
|---|---|---|
| Framework | Next.js (App Router) | 16.0.10 |
| React | React | 19.2.0 |
| Language | TypeScript | ^5 |
| Styling | Tailwind CSS | ^4 |
| UI Components | shadcn/ui + Radix UI | — |
| Auth | Clerk (`@clerk/nextjs`) | ^6 |
| AI / Streaming | Vercel AI SDK (`ai`, `@ai-sdk/react`) | ^5 |
| Animations | Framer Motion / Motion | ^12 |
| Notifications | Sonner | ^2 |
| Theme | next-themes | ^0.4.6 |
| Icons | Lucide React + Radix Icons | — |
| Markdown | react-markdown + remark-gfm + shiki | — |
| Date | date-fns | ^4 |

## Key Rules

### Next.js 16 / PPR
- This project uses **Partial Pre-rendering (PPR)**. Do not use `force-dynamic` — that is a Next.js 15 workaround.
- For non-deterministic operations (`new Date()`, `Math.random()`, `crypto.randomUUID()`) in Server Components or server actions, use:
  ```ts
  import { connection } from "next/server";
  await connection();
  // new Date() etc. below this line
  ```
- Wrap dynamic sections in `<Suspense>` with a skeleton fallback to enable streaming.
- Prefer Server Components. Only use `"use client"` when you need browser APIs, event handlers, or React hooks.

### AI SDK v5
- `useChat` from `@ai-sdk/react` returns `status` (`'submitted' | 'streaming' | 'ready' | 'error'`) — use this instead of manual `isStreaming` state.
- Regenerate the last message with `regenerate()` (not `reload()`).
- Stream format is `x-vercel-ai-ui-message-stream: v1` with `streamProtocol: "data"`.

### Auth (Clerk)
- All protected routes live under `app/(auth)/`.
- Get the session token server-side with `const { getToken } = await auth()`.
- Get the token client-side with `const { getToken } = useAuth()`.
- Send as `Authorization: Bearer <token>` to the backend.

### Styling
- Tailwind CSS v4 — use CSS variable tokens (`bg-background`, `text-foreground`, `text-primary`, etc.), not hardcoded colors.
- `cn()` from `@/lib/utils` for conditional class merging.

### Hydration
- Theme-dependent rendering (e.g. Sun/Moon toggle) must use a `mounted` state guard to avoid SSR/client mismatch:
  ```tsx
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <span className="size-5" />;
  ```

## Backend API

Base URL: `NEXT_PUBLIC_BACKEND_URL` (local: `http://localhost:8000`)

Full API reference: `backend.md` in project root.

Key endpoints:
- `POST /chat/stream` — SSE streaming chat (auth optional)
- `GET /chats` — list user chats
- `GET /chats/{id}/messages` — message history
- `PATCH /chats/{id}` — rename
- `DELETE /chats/{id}` — delete
- `GET|PUT|DELETE /trip-context/{chat_id}` — trip context CRUD

### SSE Stream event types
```
start → data-metadata (chatId + title) → data-thought (phases) → text-start → text-delta* → text-end → finish
```
Error events from the backend use `{"type":"error","error":"..."}` — the proxy at `/api/chat/route.ts` rewrites these to `{"type":"error","errorText":"..."}` for AI SDK compatibility.

## Project Structure

```
app/
  (auth)/chat/          # Protected chat routes
  (guest)/              # Guest layout
  api/chat/route.ts     # SSE proxy + credit check
components/
  chat-interface/       # All chat UI
    components/         # message-list, assistant-message, chat-input, etc.
    interface.tsx        # Main chat orchestrator
    trip-context-dialog.tsx
    sidebar.tsx
  layout/               # Navbar, settings, theme switch
  ui/custom/prompt/     # ChatContainer, Loader, Message, ScrollButton
hooks/
  use-chat-interface.ts # Main chat hook
lib/
  actions/              # Server actions (chat, credit-manager, trip-context)
  data/                 # countries.ts, airlines.ts
  utils/                # export-chat.ts, follow-ups.ts
types/
  chat.ts               # TripContext, UIMessage types, ThoughtPhase
```
