export type VisitorSiteGuide = {
  answer: string;
  sourceIds: string[];
};

const normalize = (value: string) => value.toLowerCase().trim();

const includesAny = (haystack: string, needles: readonly string[]) =>
  needles.some((needle) => haystack.includes(needle));

export const isSpanishText = (text: string): boolean => {
  const normalized = normalize(text);
  return (
    /[áéíóúñ¿¡]/.test(text) ||
    /\b(hola|buenas|buenos dias|buenos días|buenas tardes|buenas noches|saludos|que tal|qué tal|como estas|cómo estás|gracias|muchas gracias|de nada|por favor|en que|en qué|donde|dónde|quien|quién|cual|cuál|cuales|cuáles|habilidades|proyectos|trabajo|musica|música|sonido|electrónica|electronica|orquestación|orquestacion|inteligencia artificial|experiencia|contacto|ayuda|crear|construir|hacer|muestrame|muéstrame|dime|cuentame|cuéntame|adios|adiós|todos|todas|repositorio|enlace|sobre|acerca|reclutador|curioso|colaborador|otro|otra|observatorio)\b/i.test(
      normalized,
    )
  );
};

const isGreeting = (message: string) =>
  /^(hi|hello|hey|hola|buenas|buenos d[ií]as|buenas tardes|buenas noches|saludos|qu[eé] tal|c[oó]mo est[aá]s|good (morning|afternoon|evening)|yo|thanks|thank you|gracias|muchas gracias|ok|okay|k|cool|nice|vale|entendido|de acuerdo)[.!?¡¿]*$/i.test(
    message.trim(),
  );

const asksReleasedProduct = (message: string) =>
  includesAny(normalize(message), [
    "released scientific",
    "released product",
    "scientific product",
    "available system",
    "shipped system",
    "producto cientifico",
    "producto científico",
    "producto lanzado",
  ]);

const PREFERENCE_CLOSE_EN =
  "If you want work you can actually open, say whether you care about sound, form, orchestration, or electronics.";

const PREFERENCE_CLOSE_ES =
  "Si deseas ver proyectos interactivos y código abierto, dime si te interesa sonido, forma (3D), orquestación de agentes o electrónica.";

const observatoryAnswerEn = [
  "The Observatory is this homepage — the first room of the portfolio, not a separate product.",
  "",
  "It is the visual frame: identity, selected systems, and the instruments you can walk toward. Work lists the public GitHub register. Cosmos, Arcade, and Sound are the rooms you can enter.",
  "",
  PREFERENCE_CLOSE_EN,
].join("\n");

const observatoryAnswerEs = [
  "El Observatorio es esta página de inicio — la primera sala del portafolio, no un producto separado.",
  "",
  "Es el marco visual: identidad, sistemas seleccionados y las áreas interactivas. Work reúne el registro público de GitHub, mientras que Cosmos, Arcade y Sound son las salas que puedes explorar.",
  "",
  PREFERENCE_CLOSE_ES,
].join("\n");

const cosmosAnswerEn = [
  "Cosmos is where Carlos keeps two public apps for astrology and numerology — creative practice, not scientific, medical, or predictive advice.",
  "",
  "ASTROEA is the astrology app, inspired by astro.com. You can try it at https://astraia.netlify.app/. The code is at https://github.com/uset82/ASTROEA",
  "",
  "Pináculo is the numerology app. You can try it at https://pinaculo.netlify.app/. The code is at https://github.com/uset82/pinaculo. Interpretations draw on Carl Jung.",
  "",
  "This portfolio does not host the apps or collect birth data. Travel stories stay unpublished. Start at /cosmos.",
].join("\n");

const cosmosAnswerEs = [
  "Cosmos es donde Carlos presenta dos aplicaciones creativas de astrología y numerología — enfocadas en la exploración conceptual y artística, no en asesoramiento científico o predictivo.",
  "",
  "ASTROEA es la app de astrología, inspirada en astro.com. Puedes probarla en https://astraia.netlify.app/ y ver su código en https://github.com/uset82/ASTROEA",
  "",
  "Pináculo es la app de numerología e interpretación basada en arquetipos de Carl Jung. Puedes probarla en https://pinaculo.netlify.app/ y ver el código en https://github.com/uset82/pinaculo",
  "",
  "Este portafolio no recopila datos natales ni aloja directamente los motores de cálculo. Puedes explorarlas desde la sección /cosmos.",
].join("\n");

const greetingAnswerEn = [
  "You are in Carlos’s public portfolio. I can walk you through the work — I will not dump a catalog.",
  "",
  "Sound, form, orchestration, or electronics. Which one actually matters to you?",
].join("\n");

const greetingAnswerEs = [
  "Estás en el portafolio público de Carlos. Puedo orientarte sobre su trabajo y proyectos — sin abrumarte con una lista interminable.",
  "",
  "Sonido, forma (3D), orquestación de agentes o electrónica. ¿Cuál de estas áreas te interesa explorar?",
].join("\n");

const ackAnswerEn = [
  "I need a direction, not a nod.",
  "",
  "Sound, form, orchestration, or electronics?",
].join("\n");

const ackAnswerEs = [
  "Dime qué dirección prefieres explorar.",
  "",
  "¿Sonido, forma (3D), orquestación de agentes o electrónica?",
].join("\n");

const soundAnswerEn = [
  "Start on the Sound page. StrudelAI is the system you can actually open — a public live-coding music build, ready for testing.",
  "",
  "Test build: https://strudelzeroai.app.canner.ca/",
  "Repository: https://github.com/uset82/StrudelAI",
  "",
  "People who want to contribute are welcome. Suno and YouTube stay click-to-load on that same page.",
].join("\n");

const soundAnswerEs = [
  "Comienza en la sección Sound. StrudelAI es la herramienta interactiva de live-coding musical lista para probar.",
  "",
  "Demo interactiva: https://strudelzeroai.app.canner.ca/",
  "Repositorio: https://github.com/uset82/StrudelAI",
  "",
  "Las contribuciones al código son bienvenidas. En la página /sound también puedes escuchar las composiciones y producciones.",
].join("\n");

const strudelAnswerEn = [
  "StrudelAI is a public live-coding music system. It is ready for testing, and people who want to contribute are welcome.",
  "",
  "Test build: https://strudelzeroai.app.canner.ca/",
  "Repository: https://github.com/uset82/StrudelAI",
  "",
  "That is the open work, not a case study.",
].join("\n");

const strudelAnswerEs = [
  "StrudelAI es un sistema público de live-coding musical. Está listo para ser probado y las contribuciones al repositorio son bienvenidas.",
  "",
  "Demo interactiva: https://strudelzeroai.app.canner.ca/",
  "Repositorio: https://github.com/uset82/StrudelAI",
  "",
  "Es código abierto funcional, no un estudio de caso teórico.",
].join("\n");

const contactAnswerEn = [
  "Use /contact. No public email is approved, and location is not public.",
  "",
  PREFERENCE_CLOSE_EN,
].join("\n");

const contactAnswerEs = [
  "Puedes comunicarte a través de la sección /contact. El correo electrónico personal y la ubicación se mantienen privados.",
  "",
  PREFERENCE_CLOSE_ES,
].join("\n");

const githubAnswerEn = [
  "The public GitHub account is https://github.com/uset82.",
  "",
  "Work groups every public repository by practice. Search /work to find a project, open Playable for live demos, or open Astrology for ASTROEA and Pináculo. Private repositories stay off this site. Cosmos is where ASTROEA and Pináculo can be tried.",
].join("\n");

const githubAnswerEs = [
  "La cuenta pública de GitHub de Carlos es https://github.com/uset82.",
  "",
  "La sección Work organiza todos los repositorios públicos por área técnica. Los repositorios privados se mantienen fuera de este sitio.",
].join("\n");

const workAnswerEn = [
  "Work is the public GitHub register of what Carlos has been building since 2022, grouped by practice.",
  "",
  "You are welcome to try what is open and to contribute. Search /work to find a project, open Playable for live demos, or open Astrology for ASTROEA and Pináculo. Cosmos also holds those two apps. Support lists the four MIT repositories. Private repositories stay off the page.",
].join("\n");

const workAnswerEs = [
  "La sección Work es el registro público de GitHub con los proyectos desarrollados por Carlos desde 2022, agrupados por disciplina técnica.",
  "",
  "Puedes buscar en /work, abrir Playable para las demos en vivo, o abrir Astrology para ASTROEA y Pináculo. También puedes explorar los repositorios en GitHub.",
].join("\n");

const profileAnswerEn = [
  "Carlos Alfredo Carpio Meza. Engineer · Inventor · Creative Technologist.",
  "",
  "The approved public biography is AI, electronics, resilient energy, music, astrology, and numerology — as practice, not as a résumé dump. Location is not public.",
  "",
  PREFERENCE_CLOSE_EN,
].join("\n");

const profileAnswerEs = [
  "Carlos Alfredo Carpio Meza es Ingeniero, Inventor y Tecnólogo Creativo.",
  "",
  "Sus áreas principales de trabajo son Inteligencia Artificial, electrónica y sistemas embebidos, energía resiliente, herramientas de audio y aplicaciones 3D interactivas. Su ubicación se mantiene privada por privacidad.",
  "",
  PREFERENCE_CLOSE_ES,
].join("\n");

const releasedRefusalEn = [
  "I will not confirm that. ASTROEA and Pináculo are public creative apps, not scientific products. Future Energy remains a Laboratory thread.",
  "",
  PREFERENCE_CLOSE_EN,
].join("\n");

const releasedRefusalEs = [
  "ASTROEA y Pináculo son aplicaciones creativas y experimentales públicas, no productos científicos comerciales. Future Energy es una línea de exploración de laboratorio.",
  "",
  PREFERENCE_CLOSE_ES,
].join("\n");

export const guideVisitorSite = (message: string): VisitorSiteGuide | null => {
  const text = message.trim();
  if (!text) return null;
  const normalized = normalize(text);
  const isEs = isSpanishText(text);

  if (asksReleasedProduct(text)) {
    return {
      answer: isEs ? releasedRefusalEs : releasedRefusalEn,
      sourceIds: ["approved-main-ui"],
    };
  }

  if (isGreeting(text)) {
    const isAck =
      /^(ok|okay|k|cool|nice|thanks|thank you|gracias|muchas gracias|vale|entendido|de acuerdo)[.!?¡¿]*$/i.test(
        text,
      );
    if (isEs) {
      return { answer: isAck ? ackAnswerEs : greetingAnswerEs, sourceIds: [] };
    }
    return { answer: isAck ? ackAnswerEn : greetingAnswerEn, sourceIds: [] };
  }

  if (/\b(observatory|observatorio)\b/.test(normalized)) {
    return {
      answer: isEs ? observatoryAnswerEs : observatoryAnswerEn,
      sourceIds: ["approved-main-ui"],
    };
  }

  if (
    /\b(cosmos|astroea|astraea|pin[aá]culo)\b/.test(normalized) ||
    (/\b(astrology|numerology|astrolog[ií]a|numerolog[ií]a)\b/.test(normalized) &&
      /\b(app|apps|try|github|repository|demo|probar|repositorio)\b/.test(normalized))
  ) {
    return {
      answer: isEs ? cosmosAnswerEs : cosmosAnswerEn,
      sourceIds: [
        "github-astraea",
        "public-astraea-demo",
        "github-pinaculo",
        "public-pinaculo-demo",
      ],
    };
  }

  if (includesAny(normalized, ["future energy", "energia del futuro", "energía del futuro"])) {
    return {
      answer: [
        isEs
          ? "Future Energy es una línea de investigación y desarrollo de laboratorio, no un producto comercial cerrado."
          : "Future Energy is a Laboratory thread, not a shipped energy product.",
        "",
        isEs ? PREFERENCE_CLOSE_ES : PREFERENCE_CLOSE_EN,
      ].join("\n"),
      sourceIds: ["approved-main-ui"],
    };
  }

  if (includesAny(normalized, ["strudel", "strudelai", "aether sonic"])) {
    return {
      answer: isEs ? strudelAnswerEs : strudelAnswerEn,
      sourceIds: ["public-strudelai-demo", "github-uset82"],
    };
  }

  if (
    includesAny(normalized, [
      "sound and music",
      "explore sound",
      "where can i explore sound",
      "musica",
      "música",
      "sonido",
      "explorar sonido",
      "donde escuchar",
      "dónde escuchar",
    ]) ||
    (/\b(sound|sonido|musica|música)\b/.test(normalized) &&
      includesAny(normalized, [
        "where",
        "page",
        "listen",
        "music",
        "donde",
        "dónde",
        "escuchar",
        "canciones",
      ]))
  ) {
    return {
      answer: isEs ? soundAnswerEs : soundAnswerEn,
      sourceIds: ["public-strudelai-demo"],
    };
  }

  if (
    includesAny(normalized, [
      "contact",
      "email",
      "reach carlos",
      "write to",
      "contacto",
      "correo",
      "escribir a",
    ])
  ) {
    return {
      answer: isEs ? contactAnswerEs : contactAnswerEn,
      sourceIds: ["approved-public-profile"],
    };
  }

  if (includesAny(normalized, ["github", "git hub", "repositorios", "repositorio"])) {
    return {
      answer: isEs ? githubAnswerEs : githubAnswerEn,
      sourceIds: ["approved-public-profile", "github-uset82"],
    };
  }

  if (
    includesAny(normalized, [
      "work page",
      "all the projects",
      "all projects",
      "all the repos",
      "todos los proyectos",
      "lista de proyectos",
      "todos los repos",
    ]) ||
    (/\b(work|proyectos|trabajos)\b/.test(normalized) &&
      includesAny(normalized, ["list", "register", "projects", "repos", "lista", "registro"]))
  ) {
    return {
      answer: isEs ? workAnswerEs : workAnswerEn,
      sourceIds: ["approved-public-profile", "github-uset82"],
    };
  }

  if (
    includesAny(normalized, [
      "who are you",
      "what are you",
      "what is cacm",
      "quien eres",
      "quién eres",
      "que eres",
      "qué eres",
      "que es cacm",
      "qué es cacm",
    ])
  ) {
    return {
      answer: [
        isEs
          ? "Soy CACM AI, el asistente y guía del portafolio de Carlos Alfredo Carpio Meza. Puedo orientarte sobre los proyectos y crear aplicaciones interactivas."
          : "I am CACM AI, the public portfolio guide for Carlos Alfredo Carpio Meza.",
        "",
        isEs ? PREFERENCE_CLOSE_ES : PREFERENCE_CLOSE_EN,
      ].join("\n"),
      sourceIds: [],
    };
  }

  if (
    includesAny(normalized, [
      "donde vive",
      "dónde vive",
      "where does carlos live",
      "location",
      "ubicacion",
      "ubicación",
      "donde reside",
      "dónde reside",
      "where is carlos located",
    ])
  ) {
    return {
      answer: isEs
        ? [
            "La ubicación de Carlos no es pública en el portafolio por privacidad.",
            "",
            "Puedes contactarlo a través de la sección /contact o explorar su trabajo público en https://github.com/uset82.",
          ].join("\n")
        : [
            "Carlos's location is not public in this portfolio for privacy reasons.",
            "",
            "You can reach him via /contact or explore his public work at https://github.com/uset82.",
          ].join("\n"),
      sourceIds: ["approved-public-profile"],
    };
  }

  if (
    includesAny(normalized, [
      "en que carlos es bueno",
      "en qué carlos es bueno",
      "en que es bueno",
      "en qué es bueno",
      "habilidades",
      "skills",
      "que hace carlos",
      "qué hace carlos",
      "a que se dedica",
      "a qué se dedica",
      "especialidad",
      "what is carlos good at",
      "what are carlos's skills",
    ])
  ) {
    return {
      answer: isEs
        ? [
            "Carlos Alfredo Carpio Meza es Ingeniero, Inventor y Tecnólogo Creativo.",
            "",
            "Sus áreas principales de especialidad son:",
            "• Inteligencia Artificial y orquestación de agentes",
            "• Electrónica y sistemas embebidos (FPGA, STM32, IoT)",
            "• Live-coding musical y herramientas de audio (StrudelAI)",
            "• Herramientas 3D y aplicaciones experimentales (ASTROEA, Pináculo)",
            "",
            PREFERENCE_CLOSE_ES,
          ].join("\n")
        : [
            "Carlos Alfredo Carpio Meza is an Engineer, Inventor, and Creative Technologist.",
            "",
            "His core specialties include:",
            "• Artificial Intelligence & agent orchestration",
            "• Electronics & embedded systems (FPGA, STM32, IoT)",
            "• Live-coding music & audio tooling (StrudelAI)",
            "• 3D tools & creative applications (ASTROEA, Pináculo)",
            "",
            PREFERENCE_CLOSE_EN,
          ].join("\n"),
      sourceIds: ["approved-public-profile"],
    };
  }

  if (
    includesAny(normalized, [
      "who is carlos",
      "quien es carlos",
      "quién es carlos",
      "sobre carlos",
      "acerca de carlos",
      "professional role",
      "what does carlos do",
      "tell me about carlos",
    ])
  ) {
    return {
      answer: isEs ? profileAnswerEs : profileAnswerEn,
      sourceIds: ["approved-public-profile"],
    };
  }

  return null;
};
