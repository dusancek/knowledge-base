# Karpathy's AutoResearch

> "One GPU, one file, one metric." — Andrej Karpathy

AutoResearch is an autonomous experiment loop released by Andrej Karpathy in March 2026. The agent runs experiments, measures results against a single scalar metric, keeps improvements, discards failures, and repeats — unsupervised, overnight.

In Karpathy's first run it completed 126 ML experiments while he slept, found 20 meaningful improvements, and achieved an 11% training speedup that transferred to larger models.

- **Repo**: [github.com/karpathy/autoresearch](https://github.com/karpathy/autoresearch) (~630 lines of Python)
- **Talk**: [Skill Issue — Karpathy on Code Agents, AutoResearch, and the Loopy Era of AI](https://www.youtube.com/watch?v=kwSVtQ7dziU)

---

## How It Works

Three components, deliberately minimal:

| File | Who modifies it | What it contains |
|------|----------------|-----------------|
| `train.py` | The AI agent only | The thing being optimized (code, config, logic) |
| `program.md` | Humans only | Plain-English instructions: what to explore, what constraints to respect |
| Eval loop | Neither | Fixed time budget + single metric → commit or revert |

**The loop:**
1. Agent reads `program.md` and the current code
2. Forms a hypothesis ("try changing X")
3. Modifies the code
4. Runs for a fixed time budget (5 minutes in ML use case)
5. Measures a single scalar metric
6. If better → commit to git. If worse → revert.
7. Go to 1.

~12 experiments per hour. ~100 experiments overnight.

---

## The Core Insight

The constraint is **not** the domain — it's the metric. If you can reduce success to a single measurable number, this loop applies anywhere.

- ML training → val_bpb (validation bits per byte)
- Web server → p99 latency
- Sales process → qualified pipeline created per rep
- Marketing → cost per acquired customer
- Operations → time-to-resolve per ticket

The loop doesn't care what it's optimizing. It just needs a number to chase.

---

## Key Design Principles

**Fixed time budget per experiment** — every run gets the same wall-clock time, so results are comparable even if the thing being tested changes size or shape.

**Single scalar metric** — multiple objectives create ambiguity. The agent needs an unambiguous signal: higher or lower?

**Human-agent separation** — humans write goals in plain English (`program.md`); agents write code. Keeps humans in strategy, agents in execution.

**Git as the audit trail** — every improvement is a commit. You can see exactly what changed and replay or revert any step.

**Async and unsupervised** — the loop runs while you sleep. You review the results, not the process.

---

## Applying This to Business Performance

See: [[autoresearch-for-business]]
