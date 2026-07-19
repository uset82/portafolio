---
name: portfolio-delivery
description: Execute the portfolio project through its living checkbox plan. Use when Codex is asked to start, continue, implement, verify, review, or report progress on work tracked in maintaskplan.md, including requests such as "do the next task," "continue the portfolio," or "mark completed work." Select only ready tasks, apply the relevant project or WebDesigner skills, verify the result, and update checkbox evidence without claiming partial work is complete.
---

# Portfolio Delivery

Deliver work in small, verifiable units while keeping `maintaskplan.md` accurate enough for another task to resume without hidden context.

## Workflow

1. Read `AGENTS.md`, `rules.md`, `skills.md`, the current phase in `maintaskplan.md`, and `git status`.
2. Identify the earliest unchecked task whose dependencies are checked. Respect a user-selected task when it is ready.
3. If the task requires a product decision, create the decision artifact and leave dependent build work untouched.
4. Select the smallest matching workflow:
   - content or case study: `$curate-portfolio-content`;
   - stack decision: `$framework-selector`;
   - visual system or page design: `$webdesigner-design-system` plus `$frontend-skill`;
   - scaffold or implementation: `$project-scaffolder` or `$code-generator` when compatible;
   - rendered QA: browser tooling;
   - release security or deployment: `$security-audit` or `$deploy-advisor`.
5. Implement only the selected task and directly necessary support work. Preserve unrelated changes.
6. Run the task's acceptance check. For UI work, inspect representative mobile and desktop renders; source review alone is insufficient.
7. If verification passes, change only that task's Markdown marker from `[ ]` to `[x]`, change its adjacent visible box from empty to checked, and add a dated completion-log entry with evidence.
8. If verification fails or input is missing, leave the checkbox unchecked and add a concise blocked or partial note beneath it.
9. Report the outcome, evidence, remaining risk, and next ready task.

## Completion rules

- Never check a parent milestone while any required child task remains unchecked.
- Never treat file creation, a successful build, or a screenshot as complete verification by itself.
- Do not backfill evidence that was not observed.
- Add discovered scope as a new unique task ID rather than changing the meaning of an existing checkbox.
- Keep decisions and their tradeoffs in the plan so later runs do not reopen settled questions without new evidence.
- If a user decision is required, complete safe preparatory analysis, document the options, and leave the decision task unchecked.

## Evidence format

Add one row to the plan's completion log:

```text
| YYYY-MM-DD | TASK-ID | What changed | Checks or review evidence |
```

Use exact commands, artifact names, viewport checks, or decision-document links. Keep the entry concise.
