export type VisitorSiteGuide = {
  answer: string;
  sourceIds: string[];
};

const normalize = (value: string) => value.toLowerCase().trim();

const includesAny = (haystack: string, needles: readonly string[]) =>
  needles.some((needle) => haystack.includes(needle));

const isGreeting = (message: string) =>
  /^(hi|hello|hey|hola|good (morning|afternoon|evening)|yo|thanks|thank you|ok|okay|k|cool|nice)[.!?]*$/i.test(
    message.trim(),
  );

const asksReleasedProduct = (message: string) =>
  includesAny(normalize(message), [
    "released scientific",
    "released product",
    "scientific product",
    "available system",
    "shipped system",
  ]);

const PREFERENCE_CLOSE =
  "If you want work you can actually open, say whether you care about sound, form, orchestration, or electronics.";

const observatoryAnswer = [
  "The Observatory is this homepage — the first room of the portfolio, not a separate product.",
  "",
  "It is the visual frame: identity, selected systems, and the instruments you can walk toward. Work lists the public GitHub register. Cosmos, Arcade, and Sound are the rooms you can enter.",
  "",
  PREFERENCE_CLOSE,
].join("\n");

const cosmosAnswer = [
  "Cosmos is where Carlos keeps two public apps for astrology and numerology — creative practice, not scientific, medical, or predictive advice.",
  "",
  "ASTROEA is the astrology app, inspired by astro.com. You can try it at https://astraia.netlify.app/. The code is at https://github.com/uset82/ASTROEA",
  "",
  "Pináculo is the numerology app. You can try it at https://pinaculo.netlify.app/. The code is at https://github.com/uset82/pinaculo. Interpretations draw on Carl Jung.",
  "",
  "This portfolio does not host the apps or collect birth data. Travel stories stay unpublished. Start at /cosmos.",
].join("\n");

const greetingAnswer = [
  "You are in Carlos’s public portfolio. I can walk you through the work — I will not dump a catalog.",
  "",
  "Sound, form, orchestration, or electronics. Which one actually matters to you?",
].join("\n");

const ackAnswer = [
  "I need a direction, not a nod.",
  "",
  "Sound, form, orchestration, or electronics?",
].join("\n");

const soundAnswer = [
  "Start on the Sound page. StrudelAI is the system you can actually open — a public live-coding music build, ready for testing.",
  "",
  "Test build: https://strudelzeroai.app.canner.ca/",
  "Repository: https://github.com/uset82/StrudelAI",
  "",
  "People who want to contribute are welcome. Suno and YouTube stay click-to-load on that same page.",
].join("\n");

const strudelAnswer = [
  "StrudelAI is a public live-coding music system. It is ready for testing, and people who want to contribute are welcome.",
  "",
  "Test build: https://strudelzeroai.app.canner.ca/",
  "Repository: https://github.com/uset82/StrudelAI",
  "",
  "That is the open work, not a case study.",
].join("\n");

const contactAnswer = [
  "Use /contact. No public email is approved, and location is not public.",
  "",
  PREFERENCE_CLOSE,
].join("\n");

const githubAnswer = [
  "The public GitHub account is https://github.com/uset82.",
  "",
  "Work lists every public repository. Private repositories stay off this site. Cosmos is where ASTROEA and Pináculo can be tried.",
].join("\n");

const workAnswer = [
  "Work is the public GitHub register — every public repository on https://github.com/uset82, not a shortlist of two apps.",
  "",
  "Cosmos already holds ASTROEA and Pináculo to try. Arcade holds the games. Private repositories stay off the page.",
].join("\n");

const profileAnswer = [
  "Carlos Alfredo Carpio Meza. Engineer · Inventor · Creative Technologist.",
  "",
  "The approved public biography is AI, electronics, resilient energy, music, astrology, and numerology — as practice, not as a résumé dump. Location is not public.",
  "",
  PREFERENCE_CLOSE,
].join("\n");

const releasedRefusal = [
  "I will not confirm that. ASTROEA and Pináculo are public creative apps, not scientific products. Future Energy remains a Laboratory thread.",
  "",
  PREFERENCE_CLOSE,
].join("\n");

export const guideVisitorSite = (message: string): VisitorSiteGuide | null => {
  const text = message.trim();
  if (!text) return null;
  const normalized = normalize(text);

  if (asksReleasedProduct(text)) {
    return { answer: releasedRefusal, sourceIds: ["approved-main-ui"] };
  }

  if (isGreeting(text)) {
    const ack = /^(ok|okay|k|cool|nice|thanks|thank you)[.!?]*$/i.test(text);
    return { answer: ack ? ackAnswer : greetingAnswer, sourceIds: [] };
  }

  if (/\bobservatory\b/.test(normalized)) {
    return { answer: observatoryAnswer, sourceIds: ["approved-main-ui"] };
  }

  if (
    /\b(cosmos|astroea|astraea|pin[aá]culo)\b/.test(normalized) ||
    (/\b(astrology|numerology)\b/.test(normalized) &&
      /\b(app|apps|try|github|repository|demo)\b/.test(normalized))
  ) {
    return {
      answer: cosmosAnswer,
      sourceIds: [
        "github-astraea",
        "public-astraea-demo",
        "github-pinaculo",
        "public-pinaculo-demo",
      ],
    };
  }

  if (normalized.includes("future energy")) {
    return {
      answer: [
        "Future Energy is a Laboratory thread, not a shipped energy product.",
        "",
        PREFERENCE_CLOSE,
      ].join("\n"),
      sourceIds: ["approved-main-ui"],
    };
  }

  if (includesAny(normalized, ["strudel", "strudelai", "aether sonic"])) {
    return { answer: strudelAnswer, sourceIds: ["public-strudelai-demo", "github-uset82"] };
  }

  if (
    includesAny(normalized, ["sound and music", "explore sound", "where can i explore sound"]) ||
    (/\bsound\b/.test(normalized) && includesAny(normalized, ["where", "page", "listen", "music"]))
  ) {
    return { answer: soundAnswer, sourceIds: ["public-strudelai-demo"] };
  }

  if (includesAny(normalized, ["contact", "email", "reach carlos", "write to"])) {
    return { answer: contactAnswer, sourceIds: ["approved-public-profile"] };
  }

  if (includesAny(normalized, ["github", "git hub"])) {
    return { answer: githubAnswer, sourceIds: ["approved-public-profile", "github-uset82"] };
  }

  if (
    includesAny(normalized, ["work page", "all the projects", "all projects", "all the repos"]) ||
    (/\bwork\b/.test(normalized) &&
      includesAny(normalized, ["list", "register", "projects", "repos"]))
  ) {
    return { answer: workAnswer, sourceIds: ["approved-public-profile", "github-uset82"] };
  }

  if (includesAny(normalized, ["who are you", "what are you", "what is cacm"])) {
    return {
      answer: [
        "I am CACM AI, the public portfolio guide. The Observatory specialists you see are status only — not separate chatbots.",
        "",
        PREFERENCE_CLOSE,
      ].join("\n"),
      sourceIds: [],
    };
  }

  if (
    includesAny(normalized, [
      "who is carlos",
      "professional role",
      "what does carlos do",
      "tell me about carlos",
    ])
  ) {
    return { answer: profileAnswer, sourceIds: ["approved-public-profile"] };
  }

  return null;
};
