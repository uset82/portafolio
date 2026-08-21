import type { Locale } from "@/lib/i18n";

/**
 * Interface copy that lives in components rather than in the content records.
 *
 * The English object is the shape: `UiCopy` is derived from it, so a Spanish
 * translation that forgets a key fails the type check instead of silently
 * rendering English inside a Spanish page.
 */
const EN = {
  common: {
    skipToContent: "Skip to main content",
    externalSite: " — external site",
    switchLanguage: "Leer en español",
    switchLanguageAria: "Cambiar a español",
  },
  header: {
    homeAria: "Carlos Alfredo Carpio Meza — home",
    primaryNavAria: "Primary navigation",
    experienceAria: "Experience settings",
    experience: "Experience",
  },
  footer: {
    primaryNavAria: "Primary site navigation",
    secondaryNavAria: "Explore and external links",
    nav: {
      play: "Play",
      see: "See",
      listen: "Listen",
      about: "About",
      laboratory: "Laboratory",
      cosmos: "Cosmos",
      support: "Support",
    },
    signature:
      "Carlos Alfredo Carpio Meza · Engineer · Inventor · Creative Technologist · Built as a semantic portfolio with an optional immersive layer.",
  },
  home: {
    guideNote: "CACM AI remains the public portfolio guide.",
    soundLabTitle: "Sound Lab",
    soundLabDescriptor: "Harmonic instrument",
  },
  arcadeTeaser: {
    label: "Arcade / 03",
    playableNow: (count: number) => `${count} playable now`,
    noneHosted: (total: number) => `${total} games, none hosted yet`,
    headingPlayable: "You can just play some of these games.",
    headingEmpty: "The games, and what each one needs.",
    descriptionPlayable:
      "Come in and try a game whenever you like. They run here in the browser, and you are welcome to browse the ones still on the way.",
    descriptionEmpty:
      "The full shelf is here: engine, controls, size, and why each one is not playable on this page yet.",
    action: "Enter the Arcade",
    cabinet: (total: number) => `Play / ${total} titles`,
  },
  mediaTeaser: {
    instrumentLabel: "Sound / Listen",
    pressPlay: "Press play to hear it",
    formatsAria: "Music and video",
  },
  mediaEmbed: {
    privacyEnhanced: "Privacy-enhanced URL",
    externalProvider: "External provider",
    load: (provider: string) => `Load ${provider}`,
    retry: (provider: string) => `Retry ${provider}`,
    openExternally: "Open externally",
    notice: (provider: string) =>
      `Loading ${provider} may share your IP address and browser information with that provider.`,
    noResponse: (provider: string) =>
      `${provider} did not respond. You can retry or use the approved source.`,
    loading: (provider: string) => `${provider} is loading…`,
    ready: (provider: string) => `${provider} is loaded. Its own privacy policy now applies.`,
  },
  supportTeaser: {
    reposAria: "Kinds of work on GitHub",
    markLabel: "GitHub / uset82",
    comeAndLook: "Come and look through the work",
  },
  personalTeaser: {
    themesAria: "Apps in Cosmos",
    fieldLabel: "Cosmos / apps",
    bothOpen: "Both apps are open to try",
  },
  orbit: {
    close: "Close project details",
    askAi: "Ask CACM AI",
    openRepository: "Open repository",
    viewProject: "View project",
    allSystems: "All systems",
  },
  laboratory: {
    label: "Laboratory / Concept register",
    boundaryActive: "Evidence boundary active",
    identity: "Software, energy, electronics, and aerial systems",
    heading: "Experiments where software meets matter.",
    lead: "A working index for future energy, electronics / AI, and aerial systems in the Laboratory.",
    note: "This page separates designed mechanisms from evidence-backed projects. Nothing here implies functioning hardware, live AI, measured performance, or a public product.",
    benchLabel: "Open bench / 04",
    benchCaption: "Concept mechanisms · no live data or flight claim",
    registerLabel: "Current register / 01",
    registerHeading: "Three mechanisms, each with a visible limit.",
    registerBody:
      "Only Future Energy has a held case-study route; Electronics / AI and Aerial systems remain in-scene Laboratory threads without separate product claims.",
    conceptsAria: "Laboratory concepts",
    viewHeldCaseStudy: "View held case study",
    noRoute: "No separate public project route",
    ledgerLabel: "Evidence ledger / 02",
    ledgerHeading: "Designed as concepts. Published with restraint.",
    ledgerBody:
      "The Laboratory can describe its intended visual language and public navigation. It cannot substitute those intentions for source material, working demonstrations, or measured outcomes.",
    boundaries: [
      {
        label: "Evidence state",
        value: "Concept",
        detail:
          "The public record contains visual and navigational concepts, not completed project proof.",
      },
      {
        label: "Hardware state",
        value: "Not represented as built",
        detail:
          "No working battery, electronics unit, chemistry, pressure rating, aircraft, flight controller, or physical prototype is claimed.",
      },
      {
        label: "Software and data",
        value: "No live system",
        detail:
          "No inference, model output, telemetry, connected device, or real-time data is running here.",
      },
      {
        label: "Media and links",
        value: "Held for evidence",
        detail:
          "External demos, repositories, photographs, and measurements remain absent until verified.",
      },
    ] as readonly { label: string; value: string; detail: string }[],
    runtimeLabel: "Runtime / static",
    runtimeCaption: "Semantic route remains complete",
    continueLabel: "Continue / 03",
    continueHeading: "Follow the evidence, not the machinery.",
    continueBody:
      "Work lists the public GitHub register. Contact provides the approved public path without implying a product enquiry, demonstration request, or open engagement.",
    alternativesAria: "Laboratory route alternatives",
    exploreWork: "Explore Work",
    visitContact: "Visit Contact",
  },
  sound: {
    identity: "Suno, YouTube, and a live-coding system",
    systemLabel: "System / 00",
    strudelPathsAria: "StrudelAI public paths",
    musicLabel: "Music / 01",
    musicHeading: "Tracks.",
    musicAria: "Music tracks",
    videoLabel: "Video / 02",
    videoHeading: "Video.",
    videoAria: "Video works",
    published: (date: string) => `Published ${date}`,
    listenOn: (platform: string) => `Listen on ${platform}`,
    watchOn: (platform: string) => `Watch on ${platform}`,
    onPlatform: (title: string, platform: string) => `${title}, on ${platform}`,
    onwardHeading: "If something here was worth your time.",
    onwardBody:
      "The music stays free either way. There is a game to play next door, and a way to give something back if you want to.",
    alternativesAria: "Sound route alternatives",
    playAGame: "Play a game",
    supportTheWork: "Support the work",
    exploreWork: "Explore Work",
  },
  cosmos: {
    label: "Cosmos / Personal practice",
    identity: "Two apps you can try and read",
    heading: "Personal systems for observing patterns and meaning.",
    atlasLabel: "Public apps / 02",
    bothOpen: "Both apps are open to try",
    registerLabel: "Practice register / 01",
    registerHeading: "Two apps you can try and read.",
    registerBody:
      "ASTROEA and Pináculo are public work. This page points to them; it does not host them, embed them, or collect birth data.",
    appsAria: "Cosmos apps",
    appLinksAria: (name: string) => `${name} links`,
    closeLabel: "Close / 02",
    closeHeading: "The apps are public. The private record stays private.",
    closeBody:
      "This page does not collect names or birth dates, and it does not publish Carlos's charts, journeys, or dates. ASTROEA and Pináculo live on their own sites.",
    routesAria: "Cosmos routes",
    exploreWork: "Explore Work",
    readStory: "Read Story",
  },
  story: {
    label: "Story / Public profile",
    approved: "Biography approved",
    portraitLabel: "Profile study / 01",
    portraitCaption: "Typographic portrait",
    perspectiveLabel: "Perspective / 01",
    perspectiveHeading: "The person behind the systems.",
    practiceLabel: "Practice / 02",
    practiceHeading: "Three threads, one evolving practice.",
    practiceAria: "Approved practice threads",
    recordLabel: "Public record / 03",
    recordHeading: "A web-first CV, released carefully.",
    recordBody:
      "This page currently publishes only Carlos's approved role, biography, practice areas, and public GitHub path. Experience, education, and skills remain withheld until a privacy-safe web record is separately approved.",
    publishedNow: "Published now",
    publishedNowValue: "Approved public biography and GitHub profile",
    heldForReview: "Held for review",
    heldForReviewValue: "Career timeline, education, skills, portrait, and résumé file",
    privacy:
      "No private résumé, portrait, location, direct contact detail, or unsupported career claim is exposed by this route.",
    actionsAria: "Public profile paths",
    exploreWork: "Explore the work",
    visitContact: "Visit Contact",
    viewGithub: "View GitHub",
  },
  contact: {
    label: "Contact / Public boundary",
    intro:
      "No public email, form, booking route, or availability statement has been approved. Until that decision is made, this page offers only Carlos's verified public GitHub profile and clear paths back into the work.",
    signalLabel: "Signal / privacy first",
    oneChannel: "One verified public channel",
    channelLabel: "Public channel / 01",
    channelHeading: "One verified profile. No hidden inbox.",
    channelBody:
      "GitHub is the only public account Carlos has approved for this portfolio. It is offered as a verified profile path—not as a response-time, availability, employment, or booking promise.",
    verifiedProfile: "Verified external profile",
    privacyLabel: "Privacy / 02",
    privacyHeading: "No contact data is collected here.",
    privacyBody:
      "This route contains no message field, file upload, tracking form, private address, or direct-contact value. The omitted options remain visible as decisions, not disguised as working features.",
    boundaries: [
      ["Public email", "Not published"],
      ["Contact form", "Not enabled"],
      ["Additional social accounts", "None approved"],
      ["Availability", "No claim published"],
    ] as readonly (readonly [string, string])[],
    continueLabel: "Continue / 03",
    continueHeading: "Start with the work and the public story.",
    continueBody:
      "These routes contain the approved context currently available without asking for personal information or implying an open engagement.",
    alternativesAria: "Contact route alternatives",
    exploreWork: "Explore Work",
    readStory: "Read Story",
  },
  support: {
    repositoriesOpen: (count: number) => `${count} repositories open`,
    twoWays: "Two ways, both optional",
    reposAria: "Repositories open to contribution",
    openIssues: "Open issues",
    source: "Source",
    auditRun: (date: string) => `Licence audit run ${date}.`,
    tipLabel: "Buy me a coffee / 02",
    tipHeading: "Or just buy me a coffee.",
    tipAction: (platform: string) => `Buy me a coffee on ${platform}`,
    optional: "Optional / 00",
  },
  work: {
    label: "Work / Register",
    publicRepositories: "public repositories",
    heading: "Work from 2022 to now.",
    intro:
      "This is the work I have been building since 2022. You are welcome to try what is open, and to contribute. Private repositories stay off this page.",
    welcomeAria: "Try and contribute",
    try: "Try",
    contribute: "Contribute",
    find: "Find",
    matching: (count: string) => `${count} matching`,
    searchPrompt: "Search the register",
    placeholder: "Project, game, or astro",
    clear: "Clear",
    playable: "Playable",
    astrology: "Astrology",
    groupsAria: "Work groups",
    empty: "No public repositories match. Clear the search to see the full register.",
    repository: "repository",
    repositories: "repositories",
    own: "Own",
    fork: "Fork",
  },
  arcadeIndex: {
    identity: "Games, built and measured",
    playableNow: (count: number) => `${count} playable now`,
    status: {
      playable: "Playable now",
      preparing: "Waiting on hosting",
      documentation: "Documented only",
    },
    groups: {
      playable: {
        label: "Play now",
        heading: "These run in your browser, from this page.",
        description: "Press play and they load. Nothing starts on its own.",
      },
      preparing: {
        label: "In preparation",
        heading: "Built and measured, waiting on hosting.",
        description:
          "Each of these runs; none of them is ready to serve to you honestly yet. The reason is stated per game rather than hidden behind a coming-soon label.",
      },
      documentation: {
        label: "Not in a browser",
        heading: "Real games that a browser cannot run.",
        description:
          "One lives on a circuit board and one is a desktop Java application. They are listed because they are mine, not because you can click them.",
      },
    },
    spec: {
      engine: "Engine",
      input: "Input",
      mobile: "On a phone",
      builtSize: "Built size",
    },
    play: (title: string) => `Play ${title}`,
    readDetail: "Read the detail",
    source: "Source",
  },
  arcadeGame: {
    breadcrumb: "Arcade",
    playable: "Playable now",
    notPlayable: "Not playable here yet",
    holdHeading: "Why you cannot play this one here",
    holdNote:
      "The code is public either way. Nothing about this game is hidden; it simply is not honest to put a play button on something this page cannot serve.",
    readSource: "Read the source",
    recordLabel: "The record / 01",
    recordHeading: "What it is built from.",
    spec: {
      engine: "Engine",
      input: "Input",
      controls: "Controls",
      mobile: "On a phone",
      builtSize: "Built size",
      license: "Licence",
    },
    measuredOn: (date: string) => ` Measured ${date}.`,
    navAria: "Arcade game links",
    back: "Back to the arcade",
    sourceOnGitHub: "Source on GitHub",
  },
  gameFrame: {
    playAria: (title: string) => `Play ${title}`,
    frameTitle: (title: string) => `${title}, playable`,
    ready: "Ready to play",
    controlsAria: "Controls",
    cameraWarning:
      "This one asks for your camera. Your browser will ask first, and nothing is recorded or sent anywhere.",
    play: (title: string) => `Play ${title}`,
    openInNewTab: "Open in a new tab",
    stop: "Stop and unload",
    running: (title: string) => `${title} is loaded and running in an isolated frame.`,
    idle: (title: string) => `${title} has not loaded yet. Nothing runs until you press play.`,
  },
};

/**
 * Derived from the English object rather than declared separately, so adding a
 * string in English is what forces a Spanish translation to exist. `EN` is
 * deliberately not `as const`: literal types here would make every Spanish
 * string a type error instead of only the missing ones.
 */
type UiCopy = typeof EN;

const ES: UiCopy = {
  common: {
    skipToContent: "Saltar al contenido principal",
    externalSite: " — sitio externo",
    switchLanguage: "Read in English",
    switchLanguageAria: "Switch to English",
  },
  header: {
    homeAria: "Carlos Alfredo Carpio Meza — inicio",
    primaryNavAria: "Navegación principal",
    experienceAria: "Ajustes de la experiencia",
    experience: "Experiencia",
  },
  footer: {
    primaryNavAria: "Navegación principal del sitio",
    secondaryNavAria: "Explorar y enlaces externos",
    nav: {
      play: "Juega",
      see: "Mira",
      listen: "Escucha",
      about: "Sobre mí",
      laboratory: "Laboratorio",
      cosmos: "Cosmos",
      support: "Apoyo",
    },
    signature:
      "Carlos Alfredo Carpio Meza · Ingeniero · Inventor · Tecnólogo creativo · Hecho como un portafolio semántico con una capa inmersiva opcional.",
  },
  home: {
    guideNote: "CACM AI sigue siendo la guía pública del portafolio.",
    soundLabTitle: "Laboratorio de sonido",
    soundLabDescriptor: "Instrumento armónico",
  },
  arcadeTeaser: {
    label: "Arcade / 03",
    playableNow: (count: number) => `${count} jugables ahora`,
    noneHosted: (total: number) => `${total} juegos, ninguno alojado todavía`,
    headingPlayable: "A algunos de estos juegos puedes jugar sin más.",
    headingEmpty: "Los juegos, y qué necesita cada uno.",
    descriptionPlayable:
      "Entra y prueba un juego cuando quieras. Funcionan aquí, en el navegador, y puedes curiosear también los que aún están en camino.",
    descriptionEmpty:
      "El estante completo está aquí: motor, controles, tamaño y por qué cada uno todavía no se puede jugar en esta página.",
    action: "Entrar en el Arcade",
    cabinet: (total: number) => `Juega / ${total} títulos`,
  },
  mediaTeaser: {
    instrumentLabel: "Sonido / Escucha",
    pressPlay: "Pulsa play para oírlo",
    formatsAria: "Música y vídeo",
  },
  mediaEmbed: {
    privacyEnhanced: "URL con privacidad reforzada",
    externalProvider: "Proveedor externo",
    load: (provider: string) => `Cargar ${provider}`,
    retry: (provider: string) => `Reintentar ${provider}`,
    openExternally: "Abrir en su sitio",
    notice: (provider: string) =>
      `Cargar ${provider} puede compartir tu dirección IP y la información de tu navegador con ese proveedor.`,
    noResponse: (provider: string) =>
      `${provider} no ha respondido. Puedes reintentarlo o ir a la fuente aprobada.`,
    loading: (provider: string) => `${provider} se está cargando…`,
    ready: (provider: string) =>
      `${provider} está cargado. Ahora se aplica su propia política de privacidad.`,
  },
  supportTeaser: {
    reposAria: "Tipos de trabajo en GitHub",
    markLabel: "GitHub / uset82",
    comeAndLook: "Ven a curiosear el trabajo",
  },
  personalTeaser: {
    themesAria: "Apps en Cosmos",
    fieldLabel: "Cosmos / apps",
    bothOpen: "Las dos apps están abiertas para probar",
  },
  orbit: {
    close: "Cerrar los detalles del proyecto",
    askAi: "Pregunta a CACM AI",
    openRepository: "Abrir el repositorio",
    viewProject: "Ver el proyecto",
    allSystems: "Todos los sistemas",
  },
  laboratory: {
    label: "Laboratorio / Registro de conceptos",
    boundaryActive: "Límite de evidencia activo",
    identity: "Software, energía, electrónica y sistemas aéreos",
    heading: "Experimentos donde el software se encuentra con la materia.",
    lead: "Un índice de trabajo para la energía del futuro, la electrónica y la IA, y los sistemas aéreos del Laboratorio.",
    note: "Esta página separa los mecanismos diseñados de los proyectos respaldados por evidencia. Nada de aquí da a entender hardware en funcionamiento, IA en vivo, rendimiento medido ni un producto público.",
    benchLabel: "Banco abierto / 04",
    benchCaption: "Mecanismos conceptuales · sin datos en vivo ni afirmaciones de vuelo",
    registerLabel: "Registro actual / 01",
    registerHeading: "Tres mecanismos, cada uno con un límite visible.",
    registerBody:
      "Solo Future Energy tiene una ruta de caso de estudio en espera; Electrónica / IA y Sistemas aéreos siguen siendo hilos del Laboratorio dentro de la escena, sin afirmaciones de producto aparte.",
    conceptsAria: "Conceptos del Laboratorio",
    viewHeldCaseStudy: "Ver el caso de estudio en espera",
    noRoute: "Sin ruta pública de proyecto aparte",
    ledgerLabel: "Libro de evidencia / 02",
    ledgerHeading: "Diseñados como conceptos. Publicados con contención.",
    ledgerBody:
      "El Laboratorio puede describir el lenguaje visual y la navegación pública que pretende. Lo que no puede es sustituir esas intenciones por material de origen, demostraciones que funcionen o resultados medidos.",
    boundaries: [
      {
        label: "Estado de la evidencia",
        value: "Concepto",
        detail:
          "El registro público contiene conceptos visuales y de navegación, no pruebas de proyectos terminados.",
      },
      {
        label: "Estado del hardware",
        value: "No se presenta como construido",
        detail:
          "No se afirma tener batería, unidad electrónica, química, presión nominal, aeronave, controlador de vuelo ni prototipo físico en funcionamiento.",
      },
      {
        label: "Software y datos",
        value: "Sin sistema en vivo",
        detail:
          "Aquí no hay inferencia, salida de modelo, telemetría, dispositivo conectado ni datos en tiempo real funcionando.",
      },
      {
        label: "Medios y enlaces",
        value: "En espera de evidencia",
        detail:
          "Las demos externas, los repositorios, las fotografías y las mediciones siguen ausentes hasta que se verifiquen.",
      },
    ] as readonly { label: string; value: string; detail: string }[],
    runtimeLabel: "Ejecución / estática",
    runtimeCaption: "La ruta semántica sigue completa",
    continueLabel: "Continuar / 03",
    continueHeading: "Sigue la evidencia, no la maquinaria.",
    continueBody:
      "Trabajo recoge el registro público de GitHub. Contacto ofrece la vía pública aprobada sin dar a entender una consulta de producto, una petición de demostración ni un compromiso abierto.",
    alternativesAria: "Alternativas a la vía del Laboratorio",
    exploreWork: "Explorar el trabajo",
    visitContact: "Ir a Contacto",
  },
  sound: {
    identity: "Suno, YouTube y un sistema de código en vivo",
    systemLabel: "Sistema / 00",
    strudelPathsAria: "Rutas públicas de StrudelAI",
    musicLabel: "Música / 01",
    musicHeading: "Pistas.",
    musicAria: "Pistas de música",
    videoLabel: "Vídeo / 02",
    videoHeading: "Vídeo.",
    videoAria: "Obras en vídeo",
    published: (date: string) => `Publicado el ${date}`,
    listenOn: (platform: string) => `Escuchar en ${platform}`,
    watchOn: (platform: string) => `Ver en ${platform}`,
    onPlatform: (title: string, platform: string) => `${title}, en ${platform}`,
    onwardHeading: "Si algo de aquí te ha valido el rato.",
    onwardBody:
      "La música sigue siendo gratis igualmente. Hay un juego al que jugar aquí al lado, y una forma de devolver algo si te apetece.",
    alternativesAria: "Alternativas a la vía de Sonido",
    playAGame: "Jugar a un juego",
    supportTheWork: "Apoyar el trabajo",
    exploreWork: "Explorar el trabajo",
  },
  cosmos: {
    label: "Cosmos / Práctica personal",
    identity: "Dos apps que puedes probar y leer",
    heading: "Sistemas personales para observar patrones y sentido.",
    atlasLabel: "Apps públicas / 02",
    bothOpen: "Las dos apps están abiertas para probar",
    registerLabel: "Registro de práctica / 01",
    registerHeading: "Dos apps que puedes probar y leer.",
    registerBody:
      "ASTROEA y Pináculo son trabajo público. Esta página apunta a ellas; no las aloja, no las incrusta y no recoge datos de nacimiento.",
    appsAria: "Apps de Cosmos",
    appLinksAria: (name: string) => `Enlaces de ${name}`,
    closeLabel: "Cierre / 02",
    closeHeading: "Las apps son públicas. El registro privado sigue siendo privado.",
    closeBody:
      "Esta página no recoge nombres ni fechas de nacimiento, y no publica las cartas, los recorridos ni las fechas de Carlos. ASTROEA y Pináculo viven en sus propios sitios.",
    routesAria: "Rutas de Cosmos",
    exploreWork: "Explorar el trabajo",
    readStory: "Leer la historia",
  },
  story: {
    label: "Historia / Perfil público",
    approved: "Biografía aprobada",
    portraitLabel: "Estudio de perfil / 01",
    portraitCaption: "Retrato tipográfico",
    perspectiveLabel: "Perspectiva / 01",
    perspectiveHeading: "La persona detrás de los sistemas.",
    practiceLabel: "Práctica / 02",
    practiceHeading: "Tres hilos, una práctica que evoluciona.",
    practiceAria: "Hilos de práctica aprobados",
    recordLabel: "Registro público / 03",
    recordHeading: "Un CV pensado para la web, publicado con cuidado.",
    recordBody:
      "Esta página publica por ahora solo el rol aprobado de Carlos, su biografía, sus áreas de práctica y su ruta pública en GitHub. La experiencia, la formación y las competencias siguen reservadas hasta que se apruebe por separado un registro web seguro para la privacidad.",
    publishedNow: "Publicado ahora",
    publishedNowValue: "Biografía pública aprobada y perfil de GitHub",
    heldForReview: "En revisión",
    heldForReviewValue:
      "Trayectoria profesional, formación, competencias, retrato y archivo del currículum",
    privacy:
      "Esta vía no expone currículum privado, retrato, ubicación, dato de contacto directo ni ninguna afirmación profesional sin respaldo.",
    actionsAria: "Rutas del perfil público",
    exploreWork: "Explorar el trabajo",
    visitContact: "Ir a Contacto",
    viewGithub: "Ver GitHub",
  },
  contact: {
    label: "Contacto / Límite público",
    intro:
      "No se ha aprobado ningún correo público, formulario, vía de reserva ni declaración de disponibilidad. Hasta que se decida, esta página ofrece solo el perfil público verificado de Carlos en GitHub y caminos claros de vuelta al trabajo.",
    signalLabel: "Señal / privacidad primero",
    oneChannel: "Un canal público verificado",
    channelLabel: "Canal público / 01",
    channelHeading: "Un perfil verificado. Ninguna bandeja escondida.",
    channelBody:
      "GitHub es la única cuenta pública que Carlos ha aprobado para este portafolio. Se ofrece como vía a un perfil verificado, no como promesa de tiempo de respuesta, disponibilidad, empleo o reserva.",
    verifiedProfile: "Perfil externo verificado",
    privacyLabel: "Privacidad / 02",
    privacyHeading: "Aquí no se recoge ningún dato de contacto.",
    privacyBody:
      "Esta vía no tiene campo de mensaje, subida de archivos, formulario de seguimiento, dirección privada ni ningún dato de contacto directo. Las opciones omitidas siguen visibles como decisiones, no disfrazadas de funciones que ya funcionan.",
    boundaries: [
      ["Correo público", "Sin publicar"],
      ["Formulario de contacto", "Sin activar"],
      ["Otras cuentas sociales", "Ninguna aprobada"],
      ["Disponibilidad", "Sin declaración publicada"],
    ] as readonly (readonly [string, string])[],
    continueLabel: "Continuar / 03",
    continueHeading: "Empieza por el trabajo y por la historia pública.",
    continueBody:
      "Estas vías contienen el contexto aprobado que está disponible ahora, sin pedir información personal ni dar a entender un compromiso abierto.",
    alternativesAria: "Alternativas a la vía de contacto",
    exploreWork: "Explorar el trabajo",
    readStory: "Leer la historia",
  },
  support: {
    repositoriesOpen: (count: number) => `${count} repositorios abiertos`,
    twoWays: "Dos maneras, las dos opcionales",
    reposAria: "Repositorios abiertos a contribución",
    openIssues: "Ver incidencias",
    source: "Código",
    auditRun: (date: string) => `Auditoría de licencias hecha el ${date}.`,
    tipLabel: "Invítame un café / 02",
    tipHeading: "O simplemente invítame un café.",
    tipAction: (platform: string) => `Invítame un café en ${platform}`,
    optional: "Opcional / 00",
  },
  work: {
    label: "Trabajo / Registro",
    publicRepositories: "repositorios públicos",
    heading: "Trabajo desde 2022 hasta hoy.",
    intro:
      "Este es el trabajo que llevo construyendo desde 2022. Puedes probar lo que está abierto y también contribuir. Los repositorios privados se quedan fuera de esta página.",
    welcomeAria: "Probar y contribuir",
    try: "Probar",
    contribute: "Contribuir",
    find: "Buscar",
    matching: (count: string) => `${count} coinciden`,
    searchPrompt: "Busca en el registro",
    placeholder: "Proyecto, juego o astro",
    clear: "Limpiar",
    playable: "Jugables",
    astrology: "Astrología",
    groupsAria: "Grupos de trabajo",
    empty: "Ningún repositorio público coincide. Limpia la búsqueda para ver el registro completo.",
    repository: "repositorio",
    repositories: "repositorios",
    own: "Propio",
    fork: "Fork",
  },
  arcadeIndex: {
    identity: "Juegos, hechos y medidos",
    playableNow: (count: number) => `${count} jugables ahora`,
    status: {
      playable: "Jugable ahora",
      preparing: "Esperando alojamiento",
      documentation: "Solo documentado",
    },
    groups: {
      playable: {
        label: "Juega ahora",
        heading: "Estos funcionan en tu navegador, desde esta página.",
        description: "Pulsa jugar y se cargan. Nada arranca por su cuenta.",
      },
      preparing: {
        label: "En preparación",
        heading: "Hechos y medidos, esperando alojamiento.",
        description:
          "Todos estos funcionan; ninguno está listo todavía para ofrecértelo con honestidad. El motivo se dice juego por juego en lugar de esconderlo tras un cartel de próximamente.",
      },
      documentation: {
        label: "Fuera del navegador",
        heading: "Juegos reales que un navegador no puede ejecutar.",
        description:
          "Uno vive en una placa de circuito y otro es una aplicación Java de escritorio. Están listados porque son míos, no porque puedas hacerles clic.",
      },
    },
    spec: {
      engine: "Motor",
      input: "Control",
      mobile: "En el móvil",
      builtSize: "Tamaño",
    },
    play: (title: string) => `Jugar a ${title}`,
    readDetail: "Leer la ficha",
    source: "Código",
  },
  arcadeGame: {
    breadcrumb: "Arcade",
    playable: "Jugable ahora",
    notPlayable: "Aquí todavía no se puede jugar",
    holdHeading: "Por qué a este no puedes jugar aquí",
    holdNote:
      "El código es público de todas formas. Nada de este juego está escondido; sencillamente no sería honesto poner un botón de jugar en algo que esta página no puede servir.",
    readSource: "Leer el código",
    recordLabel: "El registro / 01",
    recordHeading: "Con qué está hecho.",
    spec: {
      engine: "Motor",
      input: "Control",
      controls: "Controles",
      mobile: "En el móvil",
      builtSize: "Tamaño",
      license: "Licencia",
    },
    measuredOn: (date: string) => ` Medido el ${date}.`,
    navAria: "Enlaces del juego",
    back: "Volver al arcade",
    sourceOnGitHub: "Código en GitHub",
  },
  gameFrame: {
    playAria: (title: string) => `Jugar a ${title}`,
    frameTitle: (title: string) => `${title}, jugable`,
    ready: "Listo para jugar",
    controlsAria: "Controles",
    cameraWarning:
      "Este pide tu cámara. Tu navegador preguntará primero, y no se graba ni se envía nada a ninguna parte.",
    play: (title: string) => `Jugar a ${title}`,
    openInNewTab: "Abrir en una pestaña nueva",
    stop: "Parar y descargar",
    running: (title: string) => `${title} está cargado y funcionando en un marco aislado.`,
    idle: (title: string) =>
      `${title} todavía no se ha cargado. Nada funciona hasta que pulses jugar.`,
  },
};

export const UI: Record<Locale, UiCopy> = { en: EN, es: ES };

export function ui(locale: Locale): UiCopy {
  return UI[locale];
}
