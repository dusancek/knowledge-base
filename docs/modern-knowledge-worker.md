# Modern Knowledge Worker with AI

> You don't need to become a programmer. You need to become someone who works well with AI — the way you'd work well with a great colleague.

## The Shift

A few years ago, knowing where to find information was valuable. Now AI can find it in seconds. What matters now is being able to **think clearly, delegate well, and build systems that keep knowledge useful** — for you, your team, and the AI tools helping you.

The good news: this is learnable. And it's mostly about habits, not technical expertise.

---

## Core Skills

### Talk to AI like a trusted colleague

The single most impactful skill is learning to have a real back-and-forth with Claude, ChatGPT, or similar tools — not just asking one-off questions.

Think of it like working with a smart, fast, very literal buddy who knows a lot but needs good direction:

- Tell it what you're trying to accomplish, not just what to do
- Share context: what you already know, what you've tried, what matters
- Push back on answers that feel off — "that's not quite right, here's why…"
- Ask it to try again, go deeper, or take a different angle

The more you treat it like a conversation, the more useful it gets.

### Delegate work and review the results

You don't have to do everything yourself anymore. A lot of tasks that used to take hours — drafting, summarizing, researching, formatting, rewriting — can be handed off to AI.

The skill is knowing:
- What to delegate ("summarize these notes into 5 bullets")
- How to brief it well so you get something usable back
- How to review the output critically — AI is fast but not always right
- When to say "good enough" vs. when to iterate

Treat AI output as a strong first draft, not a final answer.

### Build and use skills and specialized agents

This is where things get exciting. Most AI tools let you create reusable shortcuts — custom instructions, saved prompts, or full automated agents that do a sequence of steps on your behalf.

Examples:
- A "summarize my meeting notes" skill that always outputs the same clean format
- A research agent that searches, reads, and drafts a briefing for you
- A weekly review agent that reads your notes and suggests what needs follow-up
- An experiment loop that tests a change, measures the result, and proposes what to try next (see [[autoresearch-for-business]])

You don't need to code to do this. You just need to clearly describe what you want done, step by step — the same way you'd brief a capable intern.

### Write good briefs for your agents

The quality of what an AI agent produces is bounded by the quality of the brief you give it. Writing clear specs is the core skill.

A good brief for an agent includes:
- **Goal** — what success looks like, in measurable terms
- **What it can change** — explicit scope
- **What's off-limits** — constraints the agent must respect
- **How to measure success** — one metric, not five

"Make it better" is not a brief. "Increase reply rate without changing the brand voice or pricing" is a brief. See [[documenting-for-ai-agents]] for the full pattern.

### Write things down — for people and AI

The best habit you can build is capturing what you know in plain written notes. Not because it's old-fashioned, but because:

- AI can read your notes and answer questions from them
- Your future self will thank you
- Colleagues can onboard without picking your brain

Write short, clear notes. Link related ones. Don't overthink structure — the habit matters more than the system.

---

## Let the LLM Maintain Your Wiki

Here's a mindset shift that changes everything: **you don't have to write and maintain your knowledge base yourself.**

Andrej Karpathy's [LLM Wiki pattern](karpathy-llm-wiki.md) flips the traditional wiki model on its head. Instead of manually writing and updating notes, you feed raw material in — documents, transcripts, articles, recordings — and let an LLM build and maintain the structured wiki for you.

```
Raw sources → LLM → Structured markdown wiki → You / other agents
     ↑                                                  |
     └──────────── new sources added over time ─────────┘
```

You review what the LLM writes and redirect when it's wrong. You don't write the wiki yourself — you just guide it. Over time, the wiki compounds: each new source makes the whole thing more useful, and your effort per insight goes down, not up.

This knowledge base is already structured for exactly this pattern.

---

## The AutoResearch Loop: Let Agents Improve Your Work

Another pattern from Karpathy's [AutoResearch](karpathy-autoresearch.md): set up a loop where an agent runs experiments, measures results against a single metric, keeps what works, discards what doesn't, and repeats — with minimal involvement from you.

In his first run it completed 126 experiments overnight and found an 11% improvement.

The same logic applies to business work:

| What you're improving | Metric to track |
|-----------------------|-----------------|
| Cold email outreach | Reply rate |
| Landing page | Conversion rate |
| Support responses | Time-to-resolve |
| Internal processes | Time saved |
| AI prompts you use regularly | Output quality |

The practical version doesn't require code. Write a `program.md` — a plain-English brief with your goal, what's allowed to change, and the metric — then use Claude weekly to generate the next experiment based on what you've learned. See [[autoresearch-for-business]] for the full setup.

---

## Own Your Knowledge Base

This is the habit that multiplies everything else.

When your knowledge lives in plain markdown files — like this system — it becomes something other people and AI agents can actually use. Not locked in a chat thread or someone's head.

### What it unlocks
- You can point Claude at your `docs/` folder and it can answer questions, draft documents, or take actions based on what's already there
- New team members can get up to speed without a full handover call
- Specialized agents you build can use your knowledge base as their memory
- The LLM can maintain and expand the wiki as you feed it new sources
- You stop losing context every time a project pauses for a few weeks

### The full loop

> You build the wiki → the wiki briefs the agents → the agents produce work → you capture what worked back into the wiki.

Each lap of this loop makes the next one cheaper and better. That compounding is the point.

### What to write (and what to skip)
Write: decisions and their rationale, how-tos, reference material you return to, research notes with sources, briefs for recurring agent tasks.

Skip: raw brainstorms, chat logs, anything you can just link to. Extract the insight; discard the noise.

---

## Tools Worth Knowing

### For everyday AI work
| Tool | What it's good for |
|------|--------------------|
| Claude | Writing, reasoning, long-context document work, coding |
| ChatGPT | Wide general use, good integrations |
| Perplexity | Web research with sources cited |

### For building agents and automations
| Tool | What it's good for |
|------|--------------------|
| Claude Code | Claude in your terminal — reads files, writes code, takes actions |
| n8n / Make | Visual automation between apps, no code needed |
| Zapier | Simpler automation between tools you already use |

### For keeping your knowledge organized
| Tool | What it's good for |
|------|--------------------|
| Obsidian | Local markdown files, good for personal knowledge bases |
| Notion | Team wikis and structured databases |
| **This knowledge base** | Markdown files you own, readable by any AI tool, maintainable by LLM |

---

## A Simple Starting Point

You don't need to overhaul how you work. Try this:

- [ ] Next time you figure something out, spend 5 minutes writing it down as a note
- [ ] Ask Claude to help with one task you'd normally do alone this week
- [ ] If you repeat the same AI prompt more than a few times, save it as a reusable skill
- [ ] Feed 5 documents into Claude and ask it to build a wiki page on what it learned
- [ ] Pick one metric in your work and run one experiment to improve it this week

Small steps compound. The knowledge worker who builds these habits early operates at a completely different level — not because they work harder, but because their tools and their knowledge work for them.

---

## Related

- [[karpathy-llm-wiki]] — letting an LLM maintain your knowledge base
- [[karpathy-autoresearch]] — the autonomous experiment loop
- [[autoresearch-for-business]] — applying the loop to business operations
- [[documenting-for-ai-agents]] — how to write briefs agents can actually act on
