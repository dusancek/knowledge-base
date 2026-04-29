# AutoResearch Pattern: Applied to Business Performance

> The loop doesn't care what it's optimizing. It needs a goal written in plain English, a thing to change, and a number to improve.

This note translates Karpathy's [[karpathy-autoresearch]] loop into a framework for running autonomous improvement cycles on business operations.

---

## The Business Version of the Loop

| AutoResearch (ML)                        | Business equivalent                                  |
| ---------------------------------------- | ---------------------------------------------------- |
| `train.py` — the code the agent modifies | The process, prompt, copy, or config being optimized |
| `program.md` — human-written goals       | Your brief: what to improve, what's off-limits       |
| 5-minute training run                    | One sales call, one campaign send, one support shift |
| val_bpb (scalar metric)                  | Revenue, CAC, NPS, close rate, churn, resolve time   |
| git commit on improvement                | Log the change, tag the result                       |
| Revert on regression                     | Roll back, try a different hypothesis                |

The key shift: **you are the eval loop.** Or you build a lightweight one in your stack.

---

## Where to Apply It

### Sales
- **What changes**: cold email subject lines, opening scripts, objection responses, call sequencing
- **Metric**: reply rate, meeting booked rate, pipeline value created
- **Loop**: A/B test variants, measure for one week, keep winner, generate next hypothesis

### Marketing
- **What changes**: ad copy, landing page headlines, channel mix, offer framing
- **Metric**: cost per lead, cost per acquisition, conversion rate
- **Loop**: single-variable tests, fixed budget per experiment, commit winners to "standard playbook"

### Operations / Customer Support
- **What changes**: response templates, escalation rules, triage logic, SLA thresholds
- **Metric**: time-to-resolve, re-open rate, CSAT score
- **Loop**: deploy variant to a subset of tickets, measure over 2-week sprint, keep or revert

### Pricing & Packaging
- **What changes**: price points, tier structure, trial length, feature gating
- **Metric**: conversion rate, average contract value, expansion revenue
- **Loop**: cohort-based tests, 30-day windows, one variable at a time

### Internal Productivity
- **What changes**: meeting formats, reporting templates, onboarding docs, AI prompts
- **Metric**: time saved, output quality rating, employee NPS
- **Loop**: pilot with one team, survey after 2 weeks, standardize if better

---

## How to Set It Up (No Code Required)

**Step 1 — Pick one metric to own.**
Don't try to improve five things. Pick the number that matters most right now and run the loop on that.

**Step 2 — Write your `program.md`.**
A plain-English brief for the agent (or yourself) that specifies:
- What you're trying to improve
- What you're allowed to change
- What is off-limits (brand voice, pricing floor, legal constraints)
- How you'll measure success

**Step 3 — Define the time budget.**
Each experiment gets a fixed window: one week, one sprint, one campaign cycle. Fixed windows make results comparable.

**Step 4 — Run one change at a time.**
Single-variable testing. If you change three things and the metric moves, you don't know why. Boring but essential.

**Step 5 — Commit or revert.**
If the metric improved: document what changed and make it the new default. If not: revert and log what you tried (so you don't repeat it).

**Step 6 — Generate the next hypothesis.**
Use Claude to read your results log and suggest the next experiment. This is where the "autonomous" part kicks in.

---

## Practical Starting Point

Use this prompt with Claude weekly:

```
Here is my current performance metric: [METRIC + VALUE]
Here is the change I tested this week: [WHAT YOU CHANGED]
Here is the result: [BEFORE / AFTER]
Here is my constraints doc: [PASTE program.md]

Based on this, suggest the 3 most promising experiments to run next week. 
For each: what to change, why you'd expect it to help, and how to measure it.
```

Over time, your log of experiments becomes a compounding knowledge base — what worked, what didn't, and why.

---

## What Makes This Different from Normal A/B Testing

| Normal A/B testing                   | AutoResearch loop                                       |
| ------------------------------------ | ------------------------------------------------------- |
| Run a test, read results, move on    | Every result informs the next hypothesis                |
| Human decides what to test each time | Agent (or structured process) generates next experiment |
| No institutional memory              | Git log / experiment log = permanent record             |
| Stops when you stop                  | Designed to run indefinitely, unsupervised              |

The compounding effect is the point. 100 small improvements stack. You don't need breakthroughs — you need a loop that never stops.

---

## Related

- [[karpathy-autoresearch]] — the original concept
- [[modern-knowledge-worker]] — building systems that keep working without you
