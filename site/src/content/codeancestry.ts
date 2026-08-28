/**
 * CodeAncestry: the Laboratory's written concept paper.
 *
 * This is the fourth Laboratory thread, and it is a different kind of object
 * from the other three. Future Energy, Electronics / AI, and Aerial systems are
 * designed mechanisms held back from any hardware claim. CodeAncestry is a
 * paper: an argued proposal for a semantic lineage layer above Git, written
 * around the KEYLIT project and the broader problem of AI-assisted software
 * remixing.
 *
 * The boundary is therefore about software rather than hardware, and it is just
 * as strict. Nothing on this route runs a protocol, a registry, a lineage
 * engine, or an agent network. There is no implementation result, no benchmark,
 * and no adopted specification behind any sentence here. The research questions
 * are proposed, not answered, and the name is a working title until naming and
 * trademark checks are done.
 *
 * Every claim below is traceable to the concept paper itself, which Carlos
 * wrote and approved for publication. Where the paper hedges — "may", "could",
 * "proposed" — this record keeps the hedge.
 */

export type PaperEntry = {
  id: string;
  /** The short name of the idea: a term, a mode, a layer, a phase. */
  term: string;
  /** One line of orientation, read before the body. */
  gloss: string;
  body: string;
};

export type PaperBoundary = {
  label: string;
  value: string;
  detail: string;
};

export type CodeAncestryPaper = {
  /** The register entry as the Laboratory index prints it. */
  register: {
    descriptor: string;
    statusLabel: string;
    summary: string;
    boundary: string;
    linkLabel: string;
  };
  meta: {
    title: string;
    description: string;
  };
  hero: {
    label: string;
    statusLabel: string;
    identity: string;
    title: string;
    subtitle: string;
    attribution: string;
    lead: string;
    boundary: string;
    markLabel: string;
    markCaption: string;
  };
  origin: {
    label: string;
    heading: string;
    paragraphs: readonly string[];
    question: string;
    questionCaption: string;
  };
  vocabulary: {
    label: string;
    heading: string;
    body: string;
    aria: string;
    entries: readonly PaperEntry[];
  };
  modes: {
    label: string;
    heading: string;
    body: string;
    aria: string;
    entries: readonly PaperEntry[];
  };
  agent: {
    label: string;
    heading: string;
    body: string;
    manifestLabel: string;
    manifestAria: string;
    manifest: readonly PaperEntry[];
    neutrality: string;
  };
  propagation: {
    label: string;
    heading: string;
    body: string;
    pipelineLabel: string;
    pipelineAria: string;
    pipeline: readonly string[];
    fitnessLabel: string;
    fitnessBody: string;
    fitnessAria: string;
    fitness: readonly PaperEntry[];
    guardrailsLabel: string;
    guardrailsAria: string;
    guardrails: readonly PaperEntry[];
  };
  architecture: {
    label: string;
    heading: string;
    body: string;
    aria: string;
    layers: readonly PaperEntry[];
  };
  roadmap: {
    label: string;
    heading: string;
    body: string;
    aria: string;
    phases: readonly PaperEntry[];
  };
  questions: {
    label: string;
    heading: string;
    body: string;
    aria: string;
    items: readonly { id: string; body: string }[];
  };
  limits: {
    label: string;
    heading: string;
    body: string;
    aria: string;
    items: readonly PaperEntry[];
    ledgerLabel: string;
    ledger: readonly PaperBoundary[];
  };
  close: {
    label: string;
    heading: string;
    body: string;
    aria: string;
    backToLaboratory: string;
    exploreWork: string;
    visitContact: string;
  };
};

export const CODEANCESTRY_HREF = "/laboratory/codeancestry";

export const CODEANCESTRY: CodeAncestryPaper = {
  register: {
    descriptor: "Written concept paper",
    statusLabel: "Paper only",
    summary:
      "A written proposal for a semantic lineage layer above Git: a project carries a machine-readable genome, a capability is a traceable gene, an intentional change is an attested mutation, and a descendant may carry a bounded lineage agent that stays connected to its relatives.",
    boundary:
      "No protocol, registry, lineage engine, agent network, or hosted service runs behind this page. Nothing here reports an implementation, a benchmark, an adopted specification, or a completed experiment.",
    linkLabel: "Read the concept paper",
  },
  meta: {
    title: "CodeAncestry",
    description:
      "A Laboratory concept paper by Carlos Alfredo Carpio Meza proposing CodeAncestry: a semantic lineage layer for software genomes, traceable genes, attested mutations, and bounded lineage agents. A written proposal and research agenda, not a deployed protocol or a measured result.",
  },
  hero: {
    label: "Laboratory / Concept paper",
    statusLabel: "Proposal, not a running system",
    identity: "Software genealogy for an age of generated descendants",
    title: "CodeAncestry",
    subtitle:
      "A living lineage protocol for software genomes, agent inheritance, and evolutionary software ecosystems.",
    attribution: "Carlos Carpio · Independent researcher and software builder · August 2026",
    lead: "Software can already be copied, forked, packaged, and deployed. What it cannot do is explain itself: which capabilities a project inherited, which behaviours were changed on purpose, which agent proposed a change, and whether an improvement found downstream should travel back up. This paper proposes a layer that carries those answers.",
    boundary:
      "The vocabulary is biological; the substrate is not. Underneath the metaphor the paper stays with ordinary engineering — version control, manifests, tests, signatures, policy engines, provenance, and controlled agent messaging.",
    markLabel: "Lineage / G0",
    markCaption: "A root genome, two descendants, one proposal travelling back",
  },
  origin: {
    label: "Genesis / 01",
    heading: "It started as a fork that was not good enough.",
    paragraphs: [
      "The idea came out of KEYLIT, an AI-assisted piano-learning application with a particular design, repository, lesson structure, and interface. Different people could reasonably want radically different forms of the same underlying system: a gamified children's version, an accessibility-focused one with voice navigation, a classroom version with teacher dashboards, a Spanish or Quechua localisation, a composition-oriented version reusing the MIDI engine, or an embodied one where an avatar becomes the teacher.",
      "The conventional answer is a branch, a fork, a template, or a fresh repository. But the further a derivative travels, the harder it becomes to keep a useful relationship with the original. Upstream updates collide with local customisation, downstream inventions never return to the ancestor, and an AI coding agent has no way to know which parts were inherited, which are sovereign local adaptations, and which must never be overwritten.",
    ],
    question:
      "What if creating a customized application were treated not merely as copying code, but as creating a child that knows what it inherited?",
    questionCaption: "The question the rest of the paper answers",
  },
  vocabulary: {
    label: "Model / 02",
    heading: "Five words, defined before they are used.",
    body: "The proposal is a composition layer, not a replacement for Git, SBOMs, provenance standards, product lines, or agent protocols. It links them around a small vocabulary, and the vocabulary has to be precise before any of it means anything.",
    aria: "The CodeAncestry vocabulary",
    entries: [
      {
        id: "genome",
        term: "Genome",
        gloss: "What a project declares it is made of",
        body: "A machine-readable semantic manifest describing a project's capabilities, implementations, interfaces, tests, policies, provenance, and inheritance relationships. It is not a variability model but a historical and operational record of how capabilities were inherited and changed.",
      },
      {
        id: "gene",
        term: "Gene",
        gloss: "A capability, not a file",
        body: "A semantic capability with references to its implementation — id, purpose, interface, implementation, tests, dependencies, origin, parent, licence, policy, and evidence. A gene may span several repositories, and some are configuration-only or policy-only. Assuming a capability maps neatly onto a package is the common mistake this model tries to avoid.",
      },
      {
        id: "mutation",
        term: "Mutation",
        gloss: "An intentional change, carrying its evidence",
        body: "A deliberate transformation of a gene or gene set, accompanied by evidence: tests, benchmarks, security scans, user studies, or human review. A mutation is a claim about a change, and the claim is meant to be verifiable rather than anecdotal.",
      },
      {
        id: "agent-dna",
        term: "Agent DNA",
        gloss: "A bounded identity for a project's agent",
        body: "A machine-readable identity and policy manifest for the agent associated with a project: lineage identifiers, role, tool permissions, memory references, mutation privileges, communication scope, and protected local adaptations. It is not the model weights — a project may change model providers and keep the same lineage identity.",
      },
      {
        id: "lineage-graph",
        term: "Lineage graph",
        gloss: "A directed multigraph, not a tree",
        body: "Projects, genes, agents, and knowledge artefacts as vertices; ancestry, gene derivation, agent delegation, and knowledge propagation as separate edge sets. It supports vertical inheritance, branching, merging, recombination, and lateral transfer between unrelated families.",
      },
    ],
  },
  modes: {
    label: "Reproduction / 03",
    heading: "Four ways to descend from something.",
    body: "The metaphor here is musical rather than biological. A song produces covers, remixes, samples, and reinterpretations that stay recognisably related while becoming meaningfully distinct. Applied to software, this reframes derivative work from “copy plus diff” to inheritance plus intentional expression.",
    aria: "Reproduction modes",
    entries: [
      {
        id: "child",
        term: "Child / Fork",
        gloss: "Stays close",
        body: "Preserves most of the parent and continues to receive compatible improvements from it.",
      },
      {
        id: "remix",
        term: "Remix",
        gloss: "Keeps the parts, changes the experience",
        body: "Reuses selected capabilities while substantially changing user experience or behaviour.",
      },
      {
        id: "cover",
        term: "Cover",
        gloss: "Same idea, different instrument",
        body: "Preserves the functional specification or concept but reimplements it in a different stack, language, platform, or architecture.",
      },
      {
        id: "hybrid",
        term: "Hybrid",
        gloss: "More than one parent",
        body: "Combines genes from several projects into a new descendant, subject to licensing and compatibility constraints.",
      },
    ],
  },
  agent: {
    label: "Agent DNA / 04",
    heading: "The second leap: the descendant carries a guardian.",
    body: "The concept becomes more radical when each project carries not only a genome but an agent bound to it. That agent is not a code generator. It is meant to act as the interpreter of the project's lineage: which ancestors exist, which genes were inherited and which were locally modified, where the architectural boundaries are, which relatives are compatible, which mutations were previously accepted or rejected, and what may be shared upstream, downstream, or laterally.",
    manifestLabel: "What the manifest declares",
    manifestAria: "Agent DNA manifest fields",
    manifest: [
      {
        id: "identity",
        term: "Identity",
        gloss: "Who this agent is",
        body: "A globally unique lineage identifier, its parent and ancestor agents, and the project and genome it belongs to.",
      },
      {
        id: "role",
        term: "Role and capabilities",
        gloss: "What it is for",
        body: "The declared role — lineage guardian, for instance — and the capabilities that role is allowed to exercise.",
      },
      {
        id: "permissions",
        term: "Tool permissions",
        gloss: "What it may touch",
        body: "Tool permissions and trust boundaries, so authority is granted explicitly rather than assumed from access.",
      },
      {
        id: "memory",
        term: "Memory references",
        gloss: "What it may remember",
        body: "Memory references and a retention policy, kept separate from the raw conversation history that produced them.",
      },
      {
        id: "sharing",
        term: "Sharing scope",
        gloss: "What may leave the project",
        body: "What may be shared — benchmark summaries, signed mutation proposals, non-private lessons — and what may not: private user data, secrets, unrestricted conversation logs.",
      },
      {
        id: "protected",
        term: "Protected traits",
        gloss: "What may never be overwritten",
        body: "The local adaptations a descendant declares sovereign: a child-safety policy, a simplified interface, an accessibility decision that upstream must not silently revert.",
      },
    ],
    neutrality:
      "If a project's history is tied to one vendor's model, continuity breaks whenever the team changes tools. Making the project the stable unit — and the lineage identity separate from the model behind it — is what allows a different assistant, a local model, or a future autonomous developer to act through the same identity, if authorised.",
  },
  propagation: {
    label: "Propagation / 05",
    heading: "Relatives may learn from each other. They may not copy each other.",
    body: "This is the safety rule the rest of the design hangs on. A successful mutation in one descendant becomes a candidate proposal, never an automatic update, and every receiving project stays sovereign over whether to adopt it. Improvement can therefore travel upstream to an ancestor, downstream to descendants, and laterally between unrelated families — always as a proposal with evidence attached.",
    pipelineLabel: "The proposal pipeline",
    pipelineAria: "Mutation propagation pipeline",
    pipeline: [
      "Discover",
      "Describe",
      "Attest",
      "Simulate",
      "Test",
      "Review",
      "Adopt / Reject / Quarantine",
    ],
    fitnessLabel: "Fitness is a vector, not a score",
    fitnessBody:
      "Biological fitness is an intentionally imperfect analogy. A candidate mutation should be evaluated across several dimensions at once, and no universal weighted sum should be required: a medical robot and a music-learning website have no business optimising the same objective. Policy decides which dimensions are mandatory and which are merely informative.",
    fitnessAria: "Fitness dimensions",
    fitness: [
      { id: "c", term: "C", gloss: "Correctness", body: "Correctness and test quality." },
      { id: "s", term: "S", gloss: "Safety", body: "Security and safety." },
      { id: "p", term: "P", gloss: "Performance", body: "Performance and resource use." },
      { id: "u", term: "U", gloss: "User value", body: "User-value metrics." },
      { id: "k", term: "K", gloss: "Compatibility", body: "Compatibility across relatives." },
      { id: "r", term: "R", gloss: "Reliability", body: "Reliability and rollback confidence." },
      { id: "l", term: "L", gloss: "Legal", body: "Legal and licence compatibility." },
    ],
    guardrailsLabel:
      "What a connected lineage makes possible, and what it therefore has to prevent",
    guardrailsAria: "Governance guardrails",
    guardrails: [
      {
        id: "poisoning",
        term: "Mutation poisoning",
        gloss: "A high-fitness backdoor",
        body: "A malicious descendant could advertise an attractive mutation carrying a backdoor. Signed provenance, reproducible tests, sandboxing, independent validation, trust scores, allowlists, and policy-gated adoption are the countermeasures.",
      },
      {
        id: "worms",
        term: "Propagation worms",
        gloss: "An epidemic of updates",
        body: "Automatic propagation would create a software analogue of an epidemic, so default auto-merge of untrusted mutations has to be forbidden. Adoption requires explicit policy and evidence thresholds.",
      },
      {
        id: "impersonation",
        term: "Agent impersonation",
        gloss: "A claim is not an identity",
        body: "A model claiming to be a given lineage agent is not sufficient. Identity must be cryptographically bound to project authorisation and controlled by the project owner.",
      },
      {
        id: "privacy",
        term: "Privacy leakage",
        gloss: "Lessons, not memories",
        body: "Agents should exchange structured, policy-approved knowledge packets with scope and expiry, rather than raw memories, proprietary code, user data, or credentials.",
      },
      {
        id: "licence",
        term: "Licence contamination",
        gloss: "A hard constraint",
        body: "Hybridisation across projects can create incompatible obligations, so every gene carries licence and attribution metadata and the resolver treats licence compatibility as a hard constraint rather than a cosmetic warning.",
      },
      {
        id: "gaming",
        term: "Metrics gaming",
        gloss: "Why fitness stays multidimensional",
        body: "If fitness affects adoption, agents and developers will optimise for what is visible. Keeping fitness multidimensional, auditable, and domain-specific is what resists single-number optimisation.",
      },
    ],
  },
  architecture: {
    label: "Architecture / 06",
    heading: "An overlay, drawn as five layers.",
    body: "Git stays the authoritative source for code history. The proposal deliberately avoids building a parallel, untraceable code store: genome and lineage objects reference immutable commits, tags, artefacts, package identifiers, and content hashes wherever possible. An MVP can run on PostgreSQL with recursive queries; a graph database becomes useful at scale but is not required to begin.",
    aria: "Proposed architecture layers",
    layers: [
      {
        id: "interfaces",
        term: "Developer and agent interfaces",
        gloss: "Where people and agents arrive",
        body: "Coding assistants, IDEs, CI/CD systems, robots, and local agents.",
      },
      {
        id: "interoperability",
        term: "Interoperability layer",
        gloss: "How they connect",
        body: "MCP-style tool adapters, A2A-style messaging, repository and CI connectors — so a lineage network is not tied to one model vendor.",
      },
      {
        id: "engine",
        term: "Lineage engine",
        gloss: "The proposed contribution",
        body: "Project graph, gene registry, Agent DNA, mutation proposals, policy engine, and compatibility resolver. Compatibility combines declared interfaces and semantic versions, dependency and build constraints, automated tests, security policy, licence obligations, environment limits, and protected local adaptations.",
      },
      {
        id: "evidence",
        term: "Evidence and trust layer",
        gloss: "Why a claim can be believed",
        body: "Signatures, SLSA and in-toto attestations, SBOM references in SPDX or CycloneDX, tests, benchmarks, and review records. A mutation record carries both semantic intent and verifiable build and test evidence.",
      },
      {
        id: "storage",
        term: "Source of truth and storage",
        gloss: "Where it actually lives",
        body: "Git repositories, artefact stores, a graph or index database, and an encrypted memory store.",
      },
    ],
  },
  roadmap: {
    label: "Roadmap / 07",
    heading: "Small schema first. Embodied systems last.",
    body: "The first specification should stay intentionally small. Modelling every biological analogy up front would buy complexity before it bought understanding.",
    aria: "Proposed implementation phases",
    phases: [
      {
        id: "phase-0",
        term: "Phase 0",
        gloss: "Terminology and schema",
        body: "A minimal open specification for the project, genome, Agent DNA, mutation, and adoption records, plus content-addressed identifiers and signatures.",
      },
      {
        id: "phase-1",
        term: "Phase 1",
        gloss: "A repository-connected MVP",
        body: "Authenticate, select a repository, analyse manifests and structure and tests and documentation, let an agent propose a semantic genome, require human confirmation of genes and boundaries, store the genome in the repository, create a child with explicit inheritance metadata, and draw the first lineage graph.",
      },
      {
        id: "phase-2",
        term: "Phase 2",
        gloss: "Mutation proposals",
        body: "Gene-level mutation records, compatibility tests, benchmark evidence, signing, and upward and downward proposal flows, integrated with attestation and SBOM references where useful.",
      },
      {
        id: "phase-3",
        term: "Phase 3",
        gloss: "Multi-agent lineage",
        body: "Persistent Agent DNA and vendor-neutral adapters, so a project can move between foundation models over time while keeping one lineage identity and policy.",
      },
      {
        id: "phase-4",
        term: "Phase 4",
        gloss: "Cross-family gene registry",
        body: "Gene discovery across unrelated projects, which requires robust licensing, security, schema governance, and trust scoring before it is safe to attempt.",
      },
      {
        id: "phase-5",
        term: "Phase 5",
        gloss: "Embodied and long-lived systems",
        body: "Extension to firmware, hardware configurations, robot behaviours, model versions, and safety cases — where machine genealogy becomes operationally significant rather than merely developer-facing.",
      },
    ],
  },
  questions: {
    label: "Open questions / 08",
    heading: "What would have to be measured.",
    body: "The central claims are testable, and none of them has been tested. A first study could create several descendants of one project and compare two maintenance approaches over a sequence of changes: ordinary forks with manual merge and review as the baseline, explicit genomes with protected genes and lineage-aware proposals as the treatment.",
    aria: "Research questions",
    items: [
      {
        id: "rq1",
        body: "Can semantic genomes be generated accurately enough that developers accept them with limited correction?",
      },
      {
        id: "rq2",
        body: "Does gene-level inheritance reduce the effort of maintaining specialised descendants compared with conventional forks?",
      },
      {
        id: "rq3",
        body: "Can lineage agents identify reusable downstream improvements without increasing regression risk?",
      },
      {
        id: "rq4",
        body: "Does explicit Agent DNA improve continuity when a project switches between AI coding providers?",
      },
      {
        id: "rq5",
        body: "Can mutation provenance improve developer trust and debugging speed?",
      },
      {
        id: "rq6",
        body: "How should fitness be measured without encouraging metric gaming or unsafe optimisation?",
      },
      {
        id: "rq7",
        body: "What graph scale, query patterns, and consistency guarantees are needed for millions of projects and billions of gene relationships?",
      },
      {
        id: "rq8",
        body: "How can proprietary and open-source lineages interoperate without leaking private code or user data?",
      },
    ],
  },
  limits: {
    label: "Limits / 09",
    heading: "Where this could fail.",
    body: "The proposal faces real conceptual and engineering problems, and it should begin as a pragmatic semantic provenance system with optional evolutionary abstractions — not as an attempt to force software engineering into biological terminology.",
    aria: "Stated limitations",
    items: [
      {
        id: "ambiguity",
        term: "Ambiguous boundaries",
        gloss: "What counts as a gene",
        body: "Semantic boundaries are genuinely ambiguous, and different developers will disagree about where one capability ends and the next begins.",
      },
      {
        id: "extraction",
        term: "Extraction error",
        gloss: "A genome can be wrong",
        body: "AI-generated genome extraction can hallucinate relationships or infer intent incorrectly, which is why human confirmation sits inside the MVP rather than after it.",
      },
      {
        id: "entanglement",
        term: "Entangled change",
        gloss: "Not everything decomposes",
        body: "Many real software changes span several capabilities at once and cannot be cleanly attributed to a single gene.",
      },
      {
        id: "legal",
        term: "Legal and social weight",
        gloss: "Ancestry is contentious",
        body: "Provenance can imply attribution, ownership, or responsibility. Those implications have to be represented carefully rather than asserted by a graph edge.",
      },
      {
        id: "surface",
        term: "Attack surface",
        gloss: "Connection is risk",
        body: "A continuously connected lineage creates security exposure and privacy risk that a disconnected fork simply does not have.",
      },
      {
        id: "noise",
        term: "Graph noise",
        gloss: "Too many mutations",
        body: "If every trivial change is recorded as a mutation, a large lineage graph becomes noise, and the signal it was built to carry disappears.",
      },
      {
        id: "metaphor",
        term: "Metaphor drift",
        gloss: "Software is not alive",
        body: "Software evolution is engineered, policy-driven, and often intentionally discontinuous. The genetics metaphor misleads the moment it is taken literally.",
      },
    ],
    ledgerLabel: "Publication boundary",
    ledger: [
      {
        label: "Evidence state",
        value: "Concept paper",
        detail:
          "A written proposal and research agenda. No implementation result, benchmark, or user study is reported here.",
      },
      {
        label: "System state",
        value: "Nothing is running",
        detail:
          "No lineage engine, gene registry, agent network, hosted service, or live data sits behind this route.",
      },
      {
        label: "Adoption",
        value: "Not a standard",
        detail:
          "CodeAncestry is not an accepted specification and claims no adoption, partner, working group, or endorsement.",
      },
      {
        label: "Name",
        value: "Working title",
        detail:
          "The name is provisional. Naming, domain, and trademark checks are outstanding and would have to be completed before any launch.",
      },
    ],
  },
  close: {
    label: "Continue / 10",
    heading: "A change of question, before it is a product.",
    body: "Version control asks which lines changed. Dependency management asks which packages are included. Provenance asks how an artefact was produced. A software genome asks a further question: which meaningful capabilities were inherited, mutated, recombined, or learned across the family? That question becomes harder to avoid as agents lower the cost of producing descendants faster than people can track them.",
    aria: "Continue from the concept paper",
    backToLaboratory: "Back to the Laboratory",
    exploreWork: "Explore the work",
    visitContact: "Go to Contact",
  },
};
