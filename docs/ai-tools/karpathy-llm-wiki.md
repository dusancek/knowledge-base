# Karpathy's LLM Wiki — AI-Maintained Second Brain

> "You rarely ever write or edit the wiki manually. It's the domain of the LLM." — Andrej Karpathy

Released April 2026, Karpathy's **LLM Wiki** pattern treats a personal knowledge base the same way software engineers treat source code: raw documents, PDFs, and notes are the *source*, and a curated markdown wiki is the *compiled output* — maintained by an LLM, not by you.

- **Gist**: [gist.github.com/karpathy/442a6bf555914893e9891c11519de94f](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f)
- Inspired by Tiago Forte's *Building a Second Brain* — but inverts the maintenance burden

---

## The Problem It Solves

Traditional wikis and knowledge bases fail because **humans don't maintain them**. Keeping notes updated is work. Over time they go stale, become inconsistent, and get abandoned.

The LLM Wiki flips the contract:
- You keep feeding in raw material (documents, transcripts, articles, notes)
- The LLM builds and maintains the structured wiki
- You read and use the wiki; the LLM keeps it current

---

## How It Works

```
Raw sources → LLM → Structured markdown wiki → You / other agents
     ↑                                                  |
     └──────────── new sources added over time ─────────┘
```

**Input (raw sources):**
- PDFs, articles, research papers
- Meeting transcripts, voice memos
- Bookmarks, copied text snippets
- Any unstructured information you want to preserve

**Process (LLM task):**
- Incrementally reads new sources
- Extracts key facts, decisions, principles
- Adds to existing wiki pages or creates new ones
- Resolves contradictions, updates outdated entries
- Maintains links between related topics

**Output (the wiki):**
- Plain markdown files (like this knowledge base)
- Organized by topic, not chronology
- Always current, always internally consistent
- Readable by humans and AI agents alike

---

## Why Markdown Is the Right Format

- Any LLM can read and write it without special tooling
- Version controllable with git
- Portable — not locked into any app
- This knowledge base is already structured this way

---

## Karpathy's Key Principles

**LLM as writer, human as curator.** You review what the LLM writes and correct it. You don't write the wiki yourself — you just redirect it when it's wrong.

**Compounding value.** Each new source added makes the whole wiki more useful. The effort per insight decreases over time.

**Separation of concerns.** Raw messy input stays messy. The wiki stays clean. You never conflate the two.

**One canonical source per topic.** The wiki doesn't duplicate — it synthesizes. If two sources say conflicting things, the wiki notes the contradiction rather than silently picking one.

---

## What This Enables

Once your knowledge lives in a structured, LLM-readable wiki:

- **Ask questions**: "What do we know about X?" → agent reads wiki, answers immediately
- **Brief agents**: Point an agent at relevant wiki pages as context before it does work
- **Onboard people**: New team members read the wiki instead of picking your brain
- **Generate documents**: Proposals, reports, and briefs drafted from wiki content
- **Surface connections**: LLM can link ideas across topics you'd never have connected yourself

---

## Applying This to Your Business

Your business knowledge — processes, customer insights, pricing rationale, team decisions — lives mostly in people's heads or scattered across Slack, email, and docs.

The LLM Wiki pattern turns that into a usable asset:

| Raw input | Wiki output |
|-----------|-------------|
| Sales call recordings | Customer objections & responses page |
| Post-mortems | Lessons learned per function |
| Strategy decks | Current strategy & rationale in plain text |
| Support tickets | Known issues & resolution playbook |
| Meeting notes | Decisions log with context |

Start small: pick one domain (e.g., sales process) and feed 5 documents into Claude with the instruction: "Build me a wiki page on what we know about our sales process from these documents."

---

## Related

- [[documenting-for-ai-agents]] — how to write docs agents can act on
- [[karpathy-autoresearch]] — the same principle applied to autonomous experimentation
- [[modern-knowledge-worker]] — why owning your knowledge base multiplies everything else
