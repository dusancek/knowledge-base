# Documenting for AI Agents

> Writing specifications is the new coding. The interface between you and an AI agent is a well-written markdown file.

Karpathy's work — from AutoResearch's `program.md` to the CLAUDE.md pattern — points at a consistent principle: **the quality of what an agent produces is bounded by the quality of the brief you give it.** This note is about how to write those briefs well.

---

## The Core Shift

Traditional documentation is written for humans skimming for intent.

Agent-readable documentation is written for a system that will follow instructions literally and needs explicit:
- Goals (what success looks like)
- Constraints (what is off-limits)
- Evaluation criteria (how to know if it worked)
- Context (what the agent needs to know that isn't obvious)

| Human-readable doc | Agent-readable doc |
|--------------------|--------------------|
| "Update the homepage" | "The homepage headline should test 3 variants; measure CTR over 7 days; keep winner; do not change the logo or nav" |
| "Improve customer support" | "Reduce average resolve time below 4 hours; you may edit response templates; do not change escalation paths without approval" |
| "Write better emails" | "Goal: increase reply rate. Constraints: max 150 words, no attachments, subject line under 9 words. Metric: reply rate in the first 48h" |

The more you specify, the less the agent has to guess — and guessing is where things go wrong.

---

## Karpathy's `program.md` Pattern

From AutoResearch: humans write `program.md`, agents execute against it. The file contains:

```markdown
## Goal
What we're trying to improve and why.

## What you can change
Explicit list of things the agent is allowed to modify.

## What is off-limits
Hard constraints. The agent never touches these.

## How to measure success
The single scalar metric. Lower is better / higher is better.

## Current best result
Baseline to beat.

## Ideas to explore
Optional: directions worth trying. Agent can go beyond this list.
```

This pattern works beyond ML. Use it to brief any agent on any repeating task.

---

## The CLAUDE.md Pattern

Karpathy's January 2026 posts on LLM coding failure modes inspired a widely-adopted briefing file format (71,000+ GitHub stars). Four principles that make agents perform better:

**1. Think before executing.**
Instruct the agent to reason about the problem before writing any output. Catches wrong assumptions early.

> "Before making any changes, write out your understanding of the problem, any hidden constraints, and the tradeoffs between approaches."

**2. Simplicity first.**
Agents default to elaborate solutions. Explicitly constrain this.

> "Prefer the simplest solution that works. Do not add abstractions unless they eliminate clear duplication."

**3. Surgical changes.**
Agents have a tendency to refactor adjacent code. Scope them tightly.

> "Only change what is necessary to accomplish the stated goal. Leave everything else exactly as it is."

**4. Goal-driven, not step-driven.**
Give the agent a success criterion, not a checklist. It can self-correct toward a measurable goal; it cannot recover from a wrong step list.

> "The goal is X. Here is how you'll know you've succeeded: Y. Figure out the steps yourself."

---

## Principles for Any Agent Brief

**One metric.** If the agent has two competing goals, it will optimize for the wrong one or produce mediocre work on both. Reduce to one.

**Explicit constraints beat implicit norms.** Don't assume the agent knows your brand voice, pricing floor, or legal constraints. Write them down.

**Separate goals from instructions.** Tell the agent what to achieve, not exactly how. Agents with goals self-correct; agents following steps fail silently when a step goes wrong.

**Write for a literal interpreter.** "Make it better" is not a brief. "Increase [metric] by at least 10% without changing [constraint]" is a brief.

**Include the baseline.** "The current reply rate is 12%. The goal is to exceed 15%." Without a baseline, the agent has no reference point for whether its changes helped.

---

## Applied to Business Operations

Every recurring business task that you hand to an agent — or that you want to systematize — needs a brief. The brief lives as a markdown file alongside the outputs it produces.

**Examples:**

| Task | Brief file | What the agent does |
|------|-----------|---------------------|
| Weekly performance report | `reporting-brief.md` | Reads metrics, drafts report in your format |
| Sales email sequences | `outreach-brief.md` | Writes variants, flags which metric to track |
| Support ticket responses | `support-brief.md` | Drafts responses, flags edge cases for human review |
| Content calendar | `content-brief.md` | Plans topics, drafts outlines, respects brand constraints |
| Hiring screen | `hiring-brief.md` | Reviews CVs against criteria, produces structured summary |

The brief is the only thing you maintain. The agent handles the execution.

---

## This Knowledge Base as Agent Context

This `docs/` folder is already structured for agent use:

- Plain markdown — readable by any LLM
- Organized by topic — easy to reference specific pages
- Persistent — builds up over time

To brief an agent using this knowledge base:
1. Point it at the relevant doc: "Read `docs/ai-tools/autoresearch-for-business.md`"
2. Give it a goal: "Apply the AutoResearch loop to our email outreach. Propose 3 experiments for this week."
3. Let it work against the knowledge you've already captured

This is the full circle: you build the wiki → the wiki briefs the agents → the agents produce work → you capture what worked back into the wiki.

---

## Related

- [[karpathy-llm-wiki]] — building a knowledge base agents can use
- [[karpathy-autoresearch]] — `program.md` in practice
- [[autoresearch-for-business]] — applying the loop to business metrics
