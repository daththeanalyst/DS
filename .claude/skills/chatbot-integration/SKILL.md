---
name: chatbot-integration
description: Standard DS playbook for adding a chatbot to any client app. Uses @ds/chatbot-core (Anthropic SDK wrapper with prompt caching) + Supabase for session storage + a Tailwind/@ds/ui interface + RAG grounding against client-supplied knowledge. Emphasizes grounded answers, session persistence, and cost tracking — never an unguarded LLM endpoint on production.
---

## When to invoke

Trigger on:
- "add a chatbot to {X}"
- "add AI chat / AI assistant / Q&A to {site}"
- "integrate Claude into {client}"

## What the standard DS chatbot looks like

- **Model:** `claude-sonnet-4-6` as primary; Claude Haiku 4.5 for lightweight FAQ-style bots. `claude-opus-4-7` only when the client pays for premium reasoning latency.
- **Prompt caching:** mandatory. Cache the client's system prompt + knowledge base. Target ≥ 70% cache hit rate.
- **Session storage:** Supabase (`chat_sessions`, `chat_messages` tables) with Row Level Security.
- **Grounding:** all production answers backed by RAG retrieval from a client-specific vector store. Never a naked LLM endpoint on a client site.
- **UI:** built from `@ds/ui` chatbot components. Supports streaming, message history, typing indicators, mobile-responsive.
- **Guardrails:** refuse-out-of-scope prompt, profanity filter at ingress, rate limiting at the edge.
- **Cost tracking:** per-session token + dollar log. Dashboard in `apps/{client-slug}/admin/chat-usage`.

## Flow

1. **Scope the knowledge base.** What does this bot actually know? Client docs (pdf/docx → chunks), site content (scrape client site via Firecrawl), product catalog, support FAQ — pick explicitly, don't "ingest everything".
2. **Choose vector store.**
   - **Default:** Supabase pgvector (client already has a Supabase Postgres in most DS stacks — one less moving part)
   - **Alternative:** ChromaDB (local dev, or if client prefers self-host)
3. **Import `@ds/chatbot-core`** (Phase 2 package). It exposes:
   ```ts
   import { createChat } from "@ds/chatbot-core";

   const chat = createChat({
     model: "claude-sonnet-4-6",
     systemPrompt: loadClientSystemPrompt("acme-coffee"),
     ragClient: supabasePgvector({ table: "client_knowledge_acme" }),
     costTracker: supabaseCostLog({ clientId: "acme-coffee" }),
   });
   ```
4. **Wire the UI.** `@ds/ui` exposes a chatbot panel component:
   ```tsx
   import { ChatPanel } from "@ds/ui/chat";
   <ChatPanel chatId={chatId} greeting="Hi! I can answer questions about our menu." />
   ```
5. **Seed + test.** Populate vector store, run a test suite of 20 representative questions, capture latency + grounding rate + refusal rate. Must clear:
   - Median response latency ≤ 1.5 s (first token)
   - Grounding rate ≥ 90% on in-scope questions (answer cites or paraphrases retrieved chunks)
   - Refusal rate ≥ 80% on out-of-scope questions (refuses with "I don't have information about that")
6. **Ship** behind a feature flag or a `/beta` path until monitoring confirms stable behavior for a week.

## System-prompt skeleton (DS standard)

```
You are {ClientName}'s assistant. You help visitors with questions about {scope}.

GROUNDING:
- Answer only from the context provided below. If the context doesn't cover a question, say "I don't have information about that — please contact {client-contact-email}."
- Never invent product details, prices, hours, or policies.

TONE:
- {Use client's brand voice — extract from client POSITIONING doc}
- Direct, warm, no fluff.

SAFETY:
- Refuse any request for personal data extraction, discriminatory content, or off-topic chat.
- Escalate any request about pricing changes, account changes, or complaints to the client's support channel.

CONTEXT:
{retrieved chunks}

USER:
{message}
```

## Anti-patterns

- **Don't ship a chatbot without RAG grounding.** An LLM answering client-specific questions from its training data alone will hallucinate details the client didn't approve.
- **Don't skip the cost dashboard.** A chatbot without token monitoring is a financial liability — one viral week and the bill is four figures.
- **Don't enable the chat globally on a client site without a kill switch.** Every DS chatbot has a feature flag / env var that can disable it without a redeploy.
- **Don't reuse another client's system prompt verbatim.** Each client gets their own tone and scope. Copy the skeleton, not the content.
- **Don't hardcode the API key in client code.** API calls go through a server route, never client-side Anthropic SDK.
