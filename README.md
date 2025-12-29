# Airmini Frontend

AI travel assistant. Ask about visas, flights, accommodations, travel tips. It streams responses and shows you what the AI is "thinking" as it figures out your answer.

## Why I Built This

Wanted to build something with streaming AI responses that wasn't just another ChatGPT wrapper. Travel seemed like a good domain — it needs real-time data (visa requirements change, flight prices fluctuate), and there's actual value in combining multiple data sources into one answer.

The interesting frontend challenges: streaming text that renders as it arrives, visualizing the AI's reasoning process, and handling rate limiting gracefully.

## Tech Decisions

### Vercel AI SDK for Streaming

The AI SDK gives you a `useChat` hook that handles SSE streaming out of the box. You send a message, it opens a stream to your API route, and text appears token by token.

```typescript
const { messages, input, handleSubmit, isLoading } = useChat({
  api: '/api/chat',
  body: { chat_id, trip_context }
})
```

Without this, you'd be manually parsing SSE events, managing message state, handling reconnection. The SDK abstracts all of that. It also handles the message history format that most LLM APIs expect.

The `/api/chat` route is just a proxy — validates auth, checks rate limits, then forwards to the actual backend service that talks to the LLM.

### Thought Visualization

The backend doesn't just return a final answer. It streams "thought phases" — what it's analyzing, what it's searching for, what knowledge it's pulling from. The frontend parses these phases and renders them as collapsible sections above the response.

Phases like:
- **Analysis** — Understanding what you're asking
- **Search** — Looking up real-time data
- **Knowledge** — Pulling from trained knowledge
- **Visa** — Checking visa requirements specifically
- **Validation** — Verifying the answer makes sense

This isn't just for show. When the AI gives you visa info, you want to know if it actually checked a source or if it's hallucinating from training data. The thought visualization makes that transparent.

### Trip Context

Travel questions need context. "Do I need a visa?" depends on your nationality, where you're going, and why. Instead of asking every time, there's a trip context dialog where you set:

- Nationality
- Origin/destination countries
- Travel dates
- Cabin class (for flight recommendations)
- Trip purpose

This gets sent with every message. The backend uses it to personalize responses without you repeating yourself.

Stored in component state, not the database. If you refresh, it's gone. Intentional — travel context is session-specific, not something you'd want persisted forever.

### Rate Limiting with Upstash Redis

Free AI API calls aren't free. I needed to limit usage — 30 messages per 2-hour rolling window for authenticated users.

Upstash Redis handles this. It's serverless Redis, pay-per-request, works great with edge functions. The rate limit logic:

1. User sends message
2. Check Redis for their usage count in the current window
3. If under limit, increment and proceed
4. If over, return a 429 with time until reset

The count is stored in Clerk user metadata too, so the frontend can show "X messages remaining" without an extra API call.

### Clerk for Auth

Same as other projects — Google OAuth, session management, webhooks. The interesting bit here is using Clerk's `getToken()` to get a JWT that the backend can verify. The backend doesn't trust the frontend; it validates the token independently.

```typescript
const token = await getToken({ template: 'airmini' })
// Send to backend in Authorization header
```

### Theme System

Nine preset themes with HSL color variables. Users can also adjust border radius, scale, and layout. All stored in localStorage and applied via CSS custom properties.

```typescript
const themes = {
  default: { primary: '220 70% 50%', ... },
  'neon-lab': { primary: '280 100% 60%', ... },
  // ...
}
```

Overkill for an MVP? Probably. But theming is one of those things that's easy to add early and painful to retrofit later. And people actually use it — the neon theme is surprisingly popular.

## How Streaming Works

```
User types message
       ↓
useChatInterface hook
       ↓
POST /api/chat (Next.js API route)
       ├─ Verify Clerk session
       ├─ Check Upstash rate limit
       └─ Forward to Python backend
       ↓
Backend streams SSE
       ↓
useChat hook parses stream
       ↓
MessageList renders tokens as they arrive
```

The backend is a separate service (FastAPI + LangGraph). The frontend doesn't know anything about the LLM — it just renders what comes back. Clean separation.

## Stuff That Was Tricky

**Streaming markdown rendering** — Markdown needs to be parsed, but the text arrives incomplete. You can't parse half a code block. react-markdown handles this okay, but there are edge cases where formatting flickers as more tokens arrive.

**Thought phases mid-stream** — The backend sends structured data (thought phases) interleaved with the response text. Parsing that out of a stream without breaking the text flow required some state management gymnastics.

**Rate limit UX** — When someone hits the limit, what do you show? A countdown? A hard wall? I went with a soft warning at 5 remaining, then a modal when they're out. The modal shows when credits reset.

## Stack

| What | Why |
|------|-----|
| Next.js 16 + React 19 | App Router, server actions |
| Vercel AI SDK | Streaming chat without the boilerplate |
| Clerk | Auth + JWT for backend verification |
| Upstash Redis | Serverless rate limiting |
| Tailwind + shadcn/ui | Fast styling, theme support |
| Framer Motion | Smooth transitions for chat UI |
| Shiki | Code highlighting in responses |
