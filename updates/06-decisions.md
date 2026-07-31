# Decisions log

Carlos's answers, recorded verbatim in intent, with the consequences each one triggers.
**Answered 2026-07-31.**

---

## ☑ Q.3 — Hero direction: **(a) video hero**

> *"forget about the 3D its a totally failure just leave the video effect"*

**Decided.** The video is the hero. The 3D world is dead, not paused.

This is the second time you have rejected it — `U.20` (2026-07-27) was the first. Recording it
as final so nobody proposes it again.

**Consequences — this is the biggest simplification in the whole plan:**

| Now unblocked | |
| --- | --- |
| `V.1` `V.2` `V.3` | Can start immediately. No more poster-vs-canvas ambiguity. |

| Now cancelled or changed | |
| --- | --- |
| `C.9` 3D hub | **Cancelled.** |
| `U.20` | Closed as "3D retired", not "awaiting framing". |
| `OBSERVATORY_LIVE_CANVAS_PRESENTATION` | Delete the gate rather than flip it. |
| `site/src/lib/three/**`, `components/three/**` | **~40 files become dead code.** Removal is now a task (`V.13`). |
| `site/public/three/decoders/**` | 1 258 KB of Draco/Basis decoders no longer needed. |
| `C.8` GLB optimization | Deprioritized — nothing renders them. |
| `assets:check`, `immersive:check` gates | Will need rewriting once the 3D layer goes. |

**This is a large, genuinely good win.** It cuts roughly a quarter of the codebase, removes two
CI gates, and deletes 1.2 MB of shipped decoders. It also means the artifact overlay cards
anchored to a painted image finally get a real answer: the video carries the hero alone.

---

## ☑ Q.5 — Music: yours, open to anyone, tips welcome

> *"the music i created are open to anyone i created with suno ai / maybe if public wants to buy
> me a coffee is fine"*

**Decided:** publish openly, add a tip link. `M.2` proceeds on that basis.

**⚠ One check before a single track publishes — and it is not optional.**

You can only license what you own, and with Suno that depends on **which plan the track was
generated under**. Suno's terms have historically granted ownership and commercial use on paid
tiers, while free-tier generations stay non-commercial with Suno retaining ownership. Those
terms also change over time.

So `M.2` needs one fact per track: **the plan tier active when it was generated.** Not a guess,
not this document — the actual current Suno terms for your account.

- If **paid tier** → you own them, "open to anyone" is yours to grant, and a licence choice
  (CC-BY is the natural fit for attribution + free reuse) closes it.
- If **free tier** → you cannot grant open reuse, and publishing them as open would be a claim
  you do not hold. They could still be *played* on the site if the terms allow it, just not
  offered for reuse.

This is the same class of risk already open in `maintaskplan.md` for 3D assets. One check now
avoids a second one.

**"Buy me a coffee":** fine and low-risk. It is a tip, not a sale, so it does not turn the
tracks into a commercial product. It does need a real destination — that is a new task, `M.10`.

---

## ⛔ Q.2 — Books: **needs one clarification before I can act**

> *"the books are mine as well"*

This is the one answer I cannot safely interpret, because the two readings lead to opposite
work and one of them carries legal exposure.

**Which do you mean?**

- **(a) You wrote them.** They are your authored work → Tier P, fully citable, index them
  directly, no copyright issue at all. `B.9` gets much simpler and the `library/` distillation
  step largely disappears.
- **(b) You own copies you bought or collected.** Owning a copy is not owning the copyright —
  the author still holds it. Then the two-tier approach stands: your distilled notes in your own
  words go public; the raw PDFs stay in `brain-private/` and are never indexed.

Your earlier message — *"inside my projects from chatgpt i have a loot of books that helps my
projects to answer the way i want"* — reads like **(b)**, reference books you use. But *"the
books are mine as well"*, right after *"the music I created"*, reads like **(a)**.

**I am not guessing on this one.** Under (a) I would index copyrighted text into a public
chatbot; under (b) I would throw away work that is legitimately yours. Tell me which, and
`B.9` unblocks immediately.

If it is a mix, say roughly which are yours — I will split the corpus accordingly.

---

## ☑ Q.4 — Games: **show all of them**

> *"i want to show all my games in the portafolio ... links from netlify or canner or maybe i
> can use my railway pro account to upload all my games in there"*

**Decided:** all games ship, not a launch three. `C.2` scope widens from 3 to the full set.

**Recommended hosting — you do not have to pick one, use all three by shape:**

| Game | Where | Why |
| --- | --- | --- |
| #37 `drone_Lips`, #42 `gimmemycake`, #14 `MandelBro` | `site/public/games/<slug>/` on Railway, same origin | Static builds. Free, no extra service, no third-party dependency. |
| #32 `My-Football-Game` | Own Railway service | Express server. **Already carries a `railway.json`** — closest to working today. |
| #46 `Monkey-Tug-of-War` | Railway static or same-origin | Flutter web. `C.1` decides on built size. |
| #12 `3Doodle` | Own Railway service + Postgres | Full-stack, needs a database. |
| #24 `v0-banana-piano-app`, #21 `bankAI` | Keep on Vercel, embed via `consent-embed` | Already live. Do not migrate what already works. |
| #23 `REACTIONGAME` and the C/C++ hardware set | Video documentation | Not web-playable. Still worth showing. |

**Recommendation: prefer Railway over Netlify/Canner for anything you move.** You already pay
for Railway Pro, it keeps everything on one domain and one dashboard, and it avoids adding two
more third-party dependencies to maintain. Leave the already-live Vercel apps alone.

`C.1` still has to run — built size is what settles same-origin vs own-service.

---

## ☑ Q.6 — Budget: **zero, open source, tips welcome**

> *"zero this is open source if public wants to buy me a coffee is fine"*

**Decided.** No paid model.

**⚠ This collides with the code as written, and you should know exactly how.**

`site/src/lib/ai/model-policy.ts` **refuses free routes when `CC_AI_MODE=production`.** That is
deliberate — it exists so a portfolio does not silently depend on a free tier. With a zero
budget you therefore cannot run production mode as the code stands.

Your three real options:

1. **Stay on free routing, and harden it.** Honest, costs nothing, matches your answer. But it
   makes `A.9` **urgent, not optional** — a public endpoint on a free tier with per-instance-only
   rate limiting is how you get your OpenRouter account throttled or suspended by one bot. It
   also means disclosing that the model is variable and may be unavailable.
2. **Relax the production policy** to allow named free models explicitly. Cleaner than option 1,
   still zero cost, and keeps the "no silent free-tier dependency" intent by naming the model.
3. **Switch CC AI off** until there is a budget. One Railway variable.

**My recommendation: option 2 plus `A.9` first.** It respects zero budget, keeps the policy
meaningful, and closes the abuse hole that is open right now — see `A.0`.

This directly changes `A.10`: it is no longer "pick a paid model", it is "make the policy
support a named free model honestly".

---

## ⏳ Q.7 — Flagship projects: "idk"

Fair. You should not have to rank 42 repos from memory. **I will propose a shortlist and you
approve or swap** — that is a smaller decision than an open question.

Proposed 10, chosen for evidence quality rather than recency:

| # | Repo | Why it earns a slot |
| --- | --- | --- |
| #59 | `webdesigner` | A design system with a 3D-scroll pack, Blender assets, and a distributable plugin. Your strongest single artifact. |
| #31 | `StrudelAI` | Largest authored documentation set — diary, dictionary, ~15 plan docs. |
| #60 | `avatar-studio` | pnpm monorepo with MCPs, docs, changelog. Systems-thinking evidence. |
| #45 | `Thesis-Writer-Kit` | Rust, MIT-licensed. Only Rust project — shows range. |
| #32 | `My-Football-Game` | Playable, and the arcade's first win. |
| #46 | `Monkey-Tug-of-War` | Flutter — another distinct stack. |
| #29 | `RS232_VHD_DE2115` | VHDL. Hardware evidence nothing else provides. |
| #35 | `Automatic-Watering-Elephant` | C++ embedded, substantial. |
| #13 | `LyriGenie` | Python + AI + music, ties three threads together. |
| #58 | `mentora` | Real collaborative development — framed as contribution (see `Q.9`). |

Deliberately spread across **web, design systems, Rust, Flutter, VHDL, C++, Python** — the range
is the argument. Swap any of them; this is a starting point, not a verdict.

---

## ☑ Q.8 — Licensing: here are the repos

You asked which. **37 of your 42 own non-empty repos have no license** — I said 35 earlier,
which was wrong; the correct count is 37.

> #4 `project-bolt-qrmollebakken-supabase` · #6 `LLM-Web-App` · #7 `Suno-UDIO-Helper` ·
> #10 `smartapply-app` · #12 `3Doodle` · #13 `LyriGenie` · #14 `MandelBro` · #18 `EFFATA` ·
> #19 `diagramcloner` · #20 `pinaculo` · #21 `bankAI` · #22 `TRAFFICLIGHT` · #23 `REACTIONGAME` ·
> #24 `v0-banana-piano-app` · #25 `hvl2025-microcontroller-assignment3` · #26 `elefante` ·
> #27 `piano-` · #28 `MicrocontrollerPiano` · #29 `RS232_VHD_DE2115` · #31 `StrudelAI` ·
> #32 `My-Football-Game` · #35 `Automatic-Watering-Elephant` · #36 `cookthis-` · #37 `drone_Lips` ·
> #40 `iFoundYou` · #42 `gimmemycake` · #43 `ASTROEA` · #44 `ReportAIEquinor` ·
> #46 `Monkey-Tug-of-War` · #48 `opennemoclaw` · #49 `opennemoclawsite` · #51 `QubeSolve` ·
> #52 `chaclacayo` · #53 `pacha` · #54 `CRM_SaaS_Educativo` · #55 `StillasCalculator` ·
> #59 `webdesigner`

**What "no license" means:** all rights reserved by default. People can read the code on GitHub
but cannot legally reuse, modify, or build on it. Fine if that is what you want — but you said
"open source", and right now 37 repos are not.

**Recommendation:** MIT on all of them. It is what `portafolio` (#61) already uses, it is the
most permissive common choice, and it matches "open to anyone". One decision covers all 37.

Two to look at individually: **#59 `webdesigner`** — it ships a plugin others install, so a
license matters most there. And **#60 `avatar-studio`** shows `NOASSERTION`, meaning GitHub
could not parse its LICENSE file — that one is probably a malformed file rather than a missing
choice.

---

## ☑ Q.9 — Fork framing: confirmed, and the evidence supports you

> *"Tetris it was course i took so the teacher provided the example but the code was mine / same
> as mentora is a fork from a college friend but i was the one i basically developed the whole
> project and fix morst of it"*

**I verified `mentora` against the GitHub API, and your account is well supported.**

| Author | Commits (most recent 100) |
| --- | ---: |
| **`uset82`** | **46** |
| **`carlos`** | **5** ← very likely also you, different git config |
| `g57436746-coder` | 9 |
| `mosores` (upstream owner) | 5 |

So roughly **51 of 65 commits are yours** — about 78 %. "I developed most of it" is not a claim
that needs softening; it is the record.

**Approved wording:**

- **`mentora` (#58)** — *"Primary developer on a forked college project. Built the Studio source
  picker, mind-map generation performance work, fullscreen visual artifacts, and responsive
  study visuals."* Honest on both counts: it names the fork, and it does not undersell 51 commits.
- **`Tetris` (#1)** — *"Course project. Implemented from a template provided by the instructor."*
  It stays out of the arcade for a **technical** reason — it is Java desktop, not web-playable —
  not because it is not yours.
- **`osiris` (#56)** — stays fork-only, no portfolio presence, until you can name specific
  contributions. Say the word and I will check its commit split the same way.

**Worth fixing:** the `carlos` author entry means some commits are not attributed to your GitHub
account. Adding that email to your GitHub profile would consolidate them. Small, one-time, and
it makes your contribution history read correctly everywhere.

---

## New tasks created by these answers

| ID | Owner | Task |
| --- | --- | --- |
| `V.13` | `CODEX` | Remove the dead 3D layer — `lib/three/**`, `components/three/**`, public decoders, and the gates that test them |
| `M.10` | `CLAUDE` | Tip/"buy me a coffee" destination and placement |
| `M.11` | `GEMINI` | Confirm the Suno plan tier per track, then choose the music licence |
| `A.13` | `CODEX` | Make `model-policy.ts` support a **named free model** in production mode |
| `Q.10` | `CARLOS` | **Books: did you write them, or do you own copies?** ← the one blocker left |
| `Q.11` | `CARLOS` | Approve or swap the 10 flagship projects above |
| `Q.12` | `CARLOS` | Apply MIT to the 37 unlicensed repos? |
