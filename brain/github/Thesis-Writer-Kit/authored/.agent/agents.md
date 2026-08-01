<!-- generatedBy: brain:sync-github; source: https://github.com/uset82/Thesis-Writer-Kit/blob/main/.agent/agents.md; checkedOn: 2026-07-31; redactions: 0 -->

# agents.md

**Purpose**: Orchestration hub for Thesis Research & Writing tasks.

---

## Primary Workflow

> **THE AGENT MUST FOLLOW**: `.agent/writing_workflow.md`

This is the master workflow containing:
- Paper title and thesis statement
- Research question
- Reference selection (Phase 0)
- Pre-writing structure (Phase 1)
- Writing with PEEL format (Phase 2)
- Post-writing checks (Phase 3)

---

## Document Hierarchy

```
writing_workflow.md          ← MASTER WORKFLOW (follow this)
    │
    ├── thesis_master.md     ← Data + claims per section
    ├── sources.md           ← Verified references (APA7)
    ├── thesis_writing_strategy.md  ← Style rules & Stealth
    └── Papers for presentation/   ← Academic sources
```

---

## File Reference

| File | Purpose | Priority |
|------|---------|----------|
| `.agent/writing_workflow.md` | **PRIMARY** - Complete workflow | 🔴 MUST FOLLOW |
| `thesis_master.md` | Section data + claims | 🟡 Reference |
| `sources.md` | APA7 citations | 🟡 Reference |
| `.agent/thesis_writing_strategy.md` | Writing style & Stealth rules | 🟡 Reference |
| `.agent/skills/harper/SKILL.md` | **Grammar checker** | 🟡 Phase 3 |
| `.agent/opendraft/` | **Research Engine (Python)** | 🔵 Backend |
| `Papers/` | Academic sources | 🟢 Source material |

---

## Paper Configuration

**Title**: Governing AI and Sustainability at Equinor: Balancing Efficiency, Ethics, and the Twin Transition

**Research Question**: How should Equinor govern its AI deployment to balance operational efficiency with ethical workforce transition and genuine sustainability commitments?

**Word Limit**: 4,000 words

**Sections**:
1. Introduction (~600 words)
2. Theoretical Framework (~600 words)
3. Case Study: Equinor (~800 words)
4. Ethical Analysis (~1000 words)
5. Recommendations (~800 words)
6. Conclusion (~400 words)

---

## Quick Commands

| Task | Command |
|------|---------|
| Write section | "Follow writing_workflow.md Phase 0-3 for Section X" |
| Check citations | "Verify against sources.md" |
| Apply style | "Apply thesis_writing_strategy.md rules" |
