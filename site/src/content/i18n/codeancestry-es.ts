import { CODEANCESTRY, type CodeAncestryPaper } from "@/content/codeancestry";
import type { Locale } from "@/lib/i18n";

/**
 * Spanish wording for the CodeAncestry concept paper.
 *
 * The boundaries are the point of the page, so they are translated as carefully
 * as the headings: a proposal must read as a proposal in both languages, and no
 * claim may become stronger in Spanish than it is in English. The record ids are
 * shared with the English object so both languages key the same list items.
 */
export const CODEANCESTRY_ES: CodeAncestryPaper = {
  register: {
    descriptor: "Artículo conceptual escrito",
    statusLabel: "Solo artículo",
    summary:
      "Una propuesta escrita de una capa semántica de linaje sobre Git: un proyecto lleva un genoma legible por máquina, una capacidad es un gen trazable, un cambio intencional es una mutación con evidencia, y un descendiente puede llevar un agente de linaje acotado que sigue conectado con sus parientes.",
    boundary:
      "Detrás de esta página no funciona ningún protocolo, registro, motor de linaje, red de agentes ni servicio alojado. Aquí no se informa de ninguna implementación, medición, especificación adoptada ni experimento terminado.",
    linkLabel: "Leer el artículo conceptual",
  },
  meta: {
    title: "CodeAncestry",
    description:
      "Un artículo conceptual del Laboratorio de Carlos Alfredo Carpio Meza que propone CodeAncestry: una capa semántica de linaje para genomas de software, genes trazables, mutaciones con evidencia y agentes de linaje acotados. Es una propuesta escrita y una agenda de investigación, no un protocolo desplegado ni un resultado medido.",
  },
  hero: {
    label: "Laboratorio / Artículo conceptual",
    statusLabel: "Propuesta, no un sistema en marcha",
    identity: "Genealogía del software para una era de descendientes generados",
    title: "CodeAncestry",
    subtitle:
      "Un protocolo de linaje vivo para genomas de software, herencia entre agentes y ecosistemas de software evolutivos.",
    attribution:
      "Carlos Carpio · Investigador independiente y constructor de software · agosto de 2026",
    lead: "El software ya se puede copiar, bifurcar, empaquetar y desplegar. Lo que no puede es explicarse: qué capacidades heredó un proyecto, qué comportamientos se cambiaron a propósito, qué agente propuso un cambio y si una mejora encontrada río abajo debería volver río arriba. Este artículo propone una capa que lleve esas respuestas.",
    boundary:
      "El vocabulario es biológico; el sustrato no lo es. Bajo la metáfora, el artículo se queda en ingeniería ordinaria: control de versiones, manifiestos, pruebas, firmas, motores de política, procedencia y mensajería controlada entre agentes.",
    markLabel: "Linaje / G0",
    markCaption: "Un genoma raíz, dos descendientes y una propuesta que vuelve",
  },
  origin: {
    label: "Origen / 01",
    heading: "Empezó como una bifurcación que no bastaba.",
    paragraphs: [
      "La idea salió de KEYLIT, una aplicación de aprendizaje de piano asistida por IA con un diseño, un repositorio, una estructura de lecciones y una interfaz concretos. Personas distintas podrían querer, con toda razón, formas radicalmente distintas del mismo sistema: una versión infantil con gamificación, otra centrada en la accesibilidad con navegación por voz, una versión de aula con paneles para docentes, una localización en español o quechua, una versión de composición que reutilice el motor MIDI, o una versión encarnada donde un avatar se convierte en el profesor.",
      "La respuesta convencional es una rama, una bifurcación, una plantilla o un repositorio nuevo. Pero cuanto más se aleja un derivado, más difícil resulta conservar una relación útil con el original. Las actualizaciones de arriba chocan con la personalización local, las invenciones de abajo nunca regresan al ancestro, y un agente de programación con IA no tiene forma de saber qué partes se heredaron, cuáles son adaptaciones locales soberanas y cuáles no deben sobrescribirse nunca.",
    ],
    question:
      "¿Y si crear una aplicación personalizada no se tratara solo como copiar código, sino como crear un hijo que sabe qué heredó?",
    questionCaption: "La pregunta que responde el resto del artículo",
  },
  vocabulary: {
    label: "Modelo / 02",
    heading: "Cinco palabras, definidas antes de usarlas.",
    body: "La propuesta es una capa de composición, no un reemplazo de Git, los SBOM, los estándares de procedencia, las líneas de producto ni los protocolos de agentes. Los enlaza alrededor de un vocabulario pequeño, y el vocabulario tiene que ser preciso antes de que nada de esto signifique algo.",
    aria: "El vocabulario de CodeAncestry",
    entries: [
      {
        id: "genome",
        term: "Genoma",
        gloss: "De qué declara estar hecho un proyecto",
        body: "Un manifiesto semántico legible por máquina que describe las capacidades, implementaciones, interfaces, pruebas, políticas, procedencia y relaciones de herencia de un proyecto. No es un modelo de variabilidad, sino un registro histórico y operativo de cómo se heredaron y cambiaron las capacidades.",
      },
      {
        id: "gene",
        term: "Gen",
        gloss: "Una capacidad, no un archivo",
        body: "Una capacidad semántica con referencias a su implementación: identificador, propósito, interfaz, implementación, pruebas, dependencias, origen, padre, licencia, política y evidencia. Un gen puede abarcar varios repositorios, y algunos son solo de configuración o solo de política. Dar por hecho que una capacidad equivale a un paquete es el error común que este modelo intenta evitar.",
      },
      {
        id: "mutation",
        term: "Mutación",
        gloss: "Un cambio intencional, con su evidencia",
        body: "Una transformación deliberada de un gen o de un conjunto de genes, acompañada de evidencia: pruebas, mediciones, análisis de seguridad, estudios con personas usuarias o revisión humana. Una mutación es una afirmación sobre un cambio, y la afirmación pretende ser verificable en vez de anecdótica.",
      },
      {
        id: "agent-dna",
        term: "ADN de agente",
        gloss: "Una identidad acotada para el agente de un proyecto",
        body: "Un manifiesto de identidad y política, legible por máquina, para el agente asociado a un proyecto: identificadores de linaje, rol, permisos de herramientas, referencias de memoria, privilegios de mutación, alcance de comunicación y adaptaciones locales protegidas. No son los pesos del modelo: un proyecto puede cambiar de proveedor y conservar la misma identidad de linaje.",
      },
      {
        id: "lineage-graph",
        term: "Grafo de linaje",
        gloss: "Un multigrafo dirigido, no un árbol",
        body: "Proyectos, genes, agentes y artefactos de conocimiento como vértices; ascendencia, derivación de genes, delegación entre agentes y propagación de conocimiento como conjuntos de aristas distintos. Admite herencia vertical, ramificación, fusión, recombinación y transferencia lateral entre familias sin parentesco.",
      },
    ],
  },
  modes: {
    label: "Reproducción / 03",
    heading: "Cuatro formas de descender de algo.",
    body: "Aquí la metáfora es musical antes que biológica. Una canción produce versiones, remezclas, samples y reinterpretaciones que siguen siendo reconociblemente parientes mientras se vuelven distintas de verdad. Aplicado al software, esto replantea la obra derivada: de “copiar y diferenciar” a heredar y expresar con intención.",
    aria: "Modos de reproducción",
    entries: [
      {
        id: "child",
        term: "Hijo / Bifurcación",
        gloss: "Se queda cerca",
        body: "Conserva casi todo del padre y sigue recibiendo de él las mejoras compatibles.",
      },
      {
        id: "remix",
        term: "Remezcla",
        gloss: "Guarda las piezas, cambia la experiencia",
        body: "Reutiliza capacidades seleccionadas mientras cambia de forma sustancial la experiencia o el comportamiento.",
      },
      {
        id: "cover",
        term: "Versión",
        gloss: "La misma idea, otro instrumento",
        body: "Conserva la especificación funcional o el concepto, pero lo reimplementa en otro stack, lenguaje, plataforma o arquitectura.",
      },
      {
        id: "hybrid",
        term: "Híbrido",
        gloss: "Más de un padre",
        body: "Combina genes de varios proyectos en un nuevo descendiente, sujeto a restricciones de licencia y compatibilidad.",
      },
    ],
  },
  agent: {
    label: "ADN de agente / 04",
    heading: "El segundo salto: el descendiente lleva un guardián.",
    body: "El concepto se vuelve más radical cuando cada proyecto lleva no solo un genoma, sino un agente ligado a él. Ese agente no es un generador de código. Se plantea como intérprete del linaje del proyecto: qué ancestros existen, qué genes se heredaron y cuáles se modificaron localmente, dónde están los límites arquitectónicos, qué parientes son compatibles, qué mutaciones se aceptaron o rechazaron antes, y qué puede compartirse hacia arriba, hacia abajo o de lado.",
    manifestLabel: "Qué declara el manifiesto",
    manifestAria: "Campos del manifiesto de ADN de agente",
    manifest: [
      {
        id: "identity",
        term: "Identidad",
        gloss: "Quién es este agente",
        body: "Un identificador de linaje único, sus agentes padre y ancestros, y el proyecto y genoma a los que pertenece.",
      },
      {
        id: "role",
        term: "Rol y capacidades",
        gloss: "Para qué está",
        body: "El rol declarado —guardián del linaje, por ejemplo— y las capacidades que ese rol tiene permitido ejercer.",
      },
      {
        id: "permissions",
        term: "Permisos de herramientas",
        gloss: "Qué puede tocar",
        body: "Permisos de herramientas y límites de confianza, de modo que la autoridad se conceda de forma explícita en vez de deducirse del acceso.",
      },
      {
        id: "memory",
        term: "Referencias de memoria",
        gloss: "Qué puede recordar",
        body: "Referencias de memoria y una política de retención, separadas del historial de conversación en bruto que las produjo.",
      },
      {
        id: "sharing",
        term: "Alcance de lo compartido",
        gloss: "Qué puede salir del proyecto",
        body: "Qué puede compartirse —resúmenes de mediciones, propuestas de mutación firmadas, lecciones no privadas— y qué no: datos privados de personas usuarias, secretos, registros de conversación sin restricción.",
      },
      {
        id: "protected",
        term: "Rasgos protegidos",
        gloss: "Qué no puede sobrescribirse nunca",
        body: "Las adaptaciones locales que un descendiente declara soberanas: una política de seguridad infantil, una interfaz simplificada, una decisión de accesibilidad que río arriba no debe revertir en silencio.",
      },
    ],
    neutrality:
      "Si la historia de un proyecto queda atada al modelo de un proveedor, la continuidad se rompe cada vez que el equipo cambia de herramienta. Hacer del proyecto la unidad estable —y mantener la identidad de linaje separada del modelo que hay detrás— es lo que permitiría que otro asistente, un modelo local o un futuro desarrollador autónomo actúen a través de la misma identidad, si se les autoriza.",
  },
  propagation: {
    label: "Propagación / 05",
    heading: "Los parientes pueden aprender unos de otros. Copiarse, no.",
    body: "Esta es la regla de seguridad de la que cuelga el resto del diseño. Una mutación exitosa en un descendiente se convierte en una propuesta candidata, nunca en una actualización automática, y cada proyecto que la recibe sigue siendo soberano para decidir si la adopta. Así la mejora puede viajar hacia arriba al ancestro, hacia abajo a los descendientes y de lado entre familias sin parentesco, siempre como propuesta con evidencia adjunta.",
    pipelineLabel: "El recorrido de una propuesta",
    pipelineAria: "Recorrido de propagación de mutaciones",
    pipeline: [
      "Descubrir",
      "Describir",
      "Atestiguar",
      "Simular",
      "Probar",
      "Revisar",
      "Adoptar / Rechazar / Poner en cuarentena",
    ],
    fitnessLabel: "La aptitud es un vector, no una nota",
    fitnessBody:
      "La aptitud biológica es una analogía imperfecta a propósito. Una mutación candidata debería evaluarse en varias dimensiones a la vez, y no debería exigirse una suma ponderada universal: un robot médico y una web de aprendizaje musical no tienen por qué optimizar el mismo objetivo. La política decide qué dimensiones son obligatorias y cuáles solo informativas.",
    fitnessAria: "Dimensiones de aptitud",
    fitness: [
      { id: "c", term: "C", gloss: "Corrección", body: "Corrección y calidad de las pruebas." },
      { id: "s", term: "S", gloss: "Seguridad", body: "Seguridad informática y seguridad de uso." },
      { id: "p", term: "P", gloss: "Rendimiento", body: "Rendimiento y uso de recursos." },
      { id: "u", term: "U", gloss: "Valor de uso", body: "Métricas de valor para quien lo usa." },
      { id: "k", term: "K", gloss: "Compatibilidad", body: "Compatibilidad entre parientes." },
      { id: "r", term: "R", gloss: "Fiabilidad", body: "Fiabilidad y confianza en la reversión." },
      { id: "l", term: "L", gloss: "Legal", body: "Compatibilidad legal y de licencias." },
    ],
    guardrailsLabel: "Lo que un linaje conectado hace posible y, por lo tanto, tiene que impedir",
    guardrailsAria: "Salvaguardas de gobernanza",
    guardrails: [
      {
        id: "poisoning",
        term: "Envenenamiento de mutaciones",
        gloss: "Una puerta trasera con buena nota",
        body: "Un descendiente malicioso podría anunciar una mutación atractiva que lleve una puerta trasera. Las contramedidas son procedencia firmada, pruebas reproducibles, aislamiento, validación independiente, puntuaciones de confianza, listas de permitidos y adopción sujeta a política.",
      },
      {
        id: "worms",
        term: "Gusanos de propagación",
        gloss: "Una epidemia de actualizaciones",
        body: "La propagación automática crearía un análogo de una epidemia, así que hay que prohibir la fusión automática de mutaciones no confiables por defecto. La adopción exige política explícita y umbrales de evidencia.",
      },
      {
        id: "impersonation",
        term: "Suplantación de agentes",
        gloss: "Afirmar no es ser",
        body: "Que un modelo diga ser cierto agente de linaje no basta. La identidad debe estar ligada criptográficamente a la autorización del proyecto y controlada por quien lo posee.",
      },
      {
        id: "privacy",
        term: "Fuga de privacidad",
        gloss: "Lecciones, no memorias",
        body: "Los agentes deberían intercambiar paquetes de conocimiento estructurados y aprobados por política, con alcance y caducidad, en vez de memorias en bruto, código propietario, datos de personas usuarias o credenciales.",
      },
      {
        id: "licence",
        term: "Contaminación de licencias",
        gloss: "Una restricción dura",
        body: "La hibridación entre proyectos puede crear obligaciones incompatibles, así que cada gen lleva metadatos de licencia y atribución, y el resolutor trata la compatibilidad de licencias como restricción dura, no como aviso cosmético.",
      },
      {
        id: "gaming",
        term: "Manipulación de métricas",
        gloss: "Por qué la aptitud sigue siendo múltiple",
        body: "Si la aptitud influye en la adopción, agentes y desarrolladores optimizarán lo que se ve. Mantenerla multidimensional, auditable y específica de cada dominio es lo que resiste la optimización de un solo número.",
      },
    ],
  },
  architecture: {
    label: "Arquitectura / 06",
    heading: "Una capa superpuesta, dibujada en cinco niveles.",
    body: "Git sigue siendo la fuente autorizada del historial de código. La propuesta evita a propósito construir un almacén de código paralelo y no trazable: los objetos de genoma y linaje referencian commits inmutables, etiquetas, artefactos, identificadores de paquete y hashes de contenido siempre que sea posible. Un MVP puede funcionar sobre PostgreSQL con consultas recursivas; una base de datos de grafos resulta útil a escala, pero no hace falta para empezar.",
    aria: "Niveles de la arquitectura propuesta",
    layers: [
      {
        id: "interfaces",
        term: "Interfaces de personas y agentes",
        gloss: "Por dónde se entra",
        body: "Asistentes de programación, IDE, sistemas de CI/CD, robots y agentes locales.",
      },
      {
        id: "interoperability",
        term: "Capa de interoperabilidad",
        gloss: "Cómo se conectan",
        body: "Adaptadores de herramientas estilo MCP, mensajería estilo A2A y conectores de repositorio y CI, para que una red de linaje no quede atada a un solo proveedor de modelos.",
      },
      {
        id: "engine",
        term: "Motor de linaje",
        gloss: "La contribución propuesta",
        body: "Grafo de proyectos, registro de genes, ADN de agente, propuestas de mutación, motor de política y resolutor de compatibilidad. La compatibilidad combina interfaces declaradas y versiones semánticas, restricciones de dependencias y de construcción, pruebas automatizadas, política de seguridad, obligaciones de licencia, límites del entorno y adaptaciones locales protegidas.",
      },
      {
        id: "evidence",
        term: "Capa de evidencia y confianza",
        gloss: "Por qué se puede creer una afirmación",
        body: "Firmas, atestaciones SLSA e in-toto, referencias de SBOM en SPDX o CycloneDX, pruebas, mediciones y registros de revisión. Un registro de mutación lleva a la vez la intención semántica y la evidencia verificable de construcción y pruebas.",
      },
      {
        id: "storage",
        term: "Fuente de verdad y almacenamiento",
        gloss: "Dónde vive de verdad",
        body: "Repositorios Git, almacenes de artefactos, una base de datos de grafos o de índices y un almacén de memoria cifrado.",
      },
    ],
  },
  roadmap: {
    label: "Hoja de ruta / 07",
    heading: "Primero un esquema pequeño. Los sistemas encarnados, al final.",
    body: "La primera especificación debería mantenerse pequeña a propósito. Modelar de entrada cada analogía biológica compraría complejidad antes que comprensión.",
    aria: "Fases de implementación propuestas",
    phases: [
      {
        id: "phase-0",
        term: "Fase 0",
        gloss: "Terminología y esquema",
        body: "Una especificación abierta mínima para los registros de proyecto, genoma, ADN de agente, mutación y adopción, más identificadores direccionados por contenido y firmas.",
      },
      {
        id: "phase-1",
        term: "Fase 1",
        gloss: "Un MVP conectado a repositorios",
        body: "Autenticar, elegir un repositorio, analizar manifiestos, estructura, pruebas y documentación, dejar que un agente proponga un genoma semántico, exigir confirmación humana de genes y límites, guardar el genoma en el repositorio, crear un hijo con metadatos de herencia explícitos y dibujar el primer grafo de linaje.",
      },
      {
        id: "phase-2",
        term: "Fase 2",
        gloss: "Propuestas de mutación",
        body: "Registros de mutación a nivel de gen, pruebas de compatibilidad, evidencia medida, firma y flujos de propuesta hacia arriba y hacia abajo, integrados con atestaciones y referencias de SBOM donde resulte útil.",
      },
      {
        id: "phase-3",
        term: "Fase 3",
        gloss: "Linaje multiagente",
        body: "ADN de agente persistente y adaptadores neutrales respecto al proveedor, para que un proyecto pueda cambiar de modelo con el tiempo conservando una sola identidad de linaje y su política.",
      },
      {
        id: "phase-4",
        term: "Fase 4",
        gloss: "Registro de genes entre familias",
        body: "Descubrimiento de genes entre proyectos sin parentesco, lo que exige licenciamiento, seguridad, gobernanza de esquemas y puntuación de confianza sólidos antes de intentarlo con seguridad.",
      },
      {
        id: "phase-5",
        term: "Fase 5",
        gloss: "Sistemas encarnados y de vida larga",
        body: "Extensión a firmware, configuraciones de hardware, comportamientos de robots, versiones de modelos y casos de seguridad, donde la genealogía de máquinas pasa a ser operativamente relevante y no solo cosa de quien programa.",
      },
    ],
  },
  questions: {
    label: "Preguntas abiertas / 08",
    heading: "Qué habría que medir.",
    body: "Las afirmaciones centrales son comprobables, y ninguna se ha comprobado. Un primer estudio podría crear varios descendientes de un mismo proyecto y comparar dos formas de mantenerlos a lo largo de una secuencia de cambios: bifurcaciones ordinarias con fusión y revisión manuales como referencia, y genomas explícitos con genes protegidos y propuestas conscientes del linaje como tratamiento.",
    aria: "Preguntas de investigación",
    items: [
      {
        id: "rq1",
        body: "¿Se pueden generar genomas semánticos con precisión suficiente para que quien desarrolla los acepte con poca corrección?",
      },
      {
        id: "rq2",
        body: "¿La herencia a nivel de gen reduce el esfuerzo de mantener descendientes especializados frente a las bifurcaciones convencionales?",
      },
      {
        id: "rq3",
        body: "¿Pueden los agentes de linaje detectar mejoras reutilizables de río abajo sin aumentar el riesgo de regresión?",
      },
      {
        id: "rq4",
        body: "¿Un ADN de agente explícito mejora la continuidad cuando un proyecto cambia de proveedor de programación con IA?",
      },
      {
        id: "rq5",
        body: "¿La procedencia de las mutaciones mejora la confianza de quien desarrolla y la velocidad de depuración?",
      },
      {
        id: "rq6",
        body: "¿Cómo debería medirse la aptitud sin fomentar la manipulación de métricas ni una optimización insegura?",
      },
      {
        id: "rq7",
        body: "¿Qué escala de grafo, patrones de consulta y garantías de consistencia hacen falta para millones de proyectos y miles de millones de relaciones entre genes?",
      },
      {
        id: "rq8",
        body: "¿Cómo pueden interoperar los linajes propietarios y los de código abierto sin filtrar código privado ni datos de personas usuarias?",
      },
    ],
  },
  limits: {
    label: "Límites / 09",
    heading: "Por dónde podría fallar.",
    body: "La propuesta se enfrenta a problemas conceptuales y de ingeniería reales, y debería empezar como un sistema pragmático de procedencia semántica con abstracciones evolutivas opcionales, no como un intento de meter toda la ingeniería de software en vocabulario biológico.",
    aria: "Limitaciones declaradas",
    items: [
      {
        id: "ambiguity",
        term: "Límites ambiguos",
        gloss: "Qué cuenta como gen",
        body: "Los límites semánticos son genuinamente ambiguos, y distintas personas desarrolladoras discreparán sobre dónde termina una capacidad y empieza la siguiente.",
      },
      {
        id: "extraction",
        term: "Error de extracción",
        gloss: "Un genoma puede estar mal",
        body: "La extracción de genomas por IA puede alucinar relaciones o inferir mal la intención; por eso la confirmación humana está dentro del MVP y no después de él.",
      },
      {
        id: "entanglement",
        term: "Cambio entrelazado",
        gloss: "No todo se descompone",
        body: "Muchos cambios reales abarcan varias capacidades a la vez y no se pueden atribuir con limpieza a un solo gen.",
      },
      {
        id: "legal",
        term: "Peso legal y social",
        gloss: "La ascendencia es delicada",
        body: "La procedencia puede dar a entender atribución, propiedad o responsabilidad. Esas implicaciones hay que representarlas con cuidado, no afirmarlas con una arista de grafo.",
      },
      {
        id: "surface",
        term: "Superficie de ataque",
        gloss: "Conectar es arriesgar",
        body: "Un linaje conectado de forma continua crea una exposición de seguridad y un riesgo de privacidad que una bifurcación desconectada sencillamente no tiene.",
      },
      {
        id: "noise",
        term: "Ruido en el grafo",
        gloss: "Demasiadas mutaciones",
        body: "Si cada cambio trivial se registra como mutación, un grafo de linaje grande se vuelve ruido y desaparece la señal que debía llevar.",
      },
      {
        id: "metaphor",
        term: "Deriva de la metáfora",
        gloss: "El software no está vivo",
        body: "La evolución del software es de ingeniería, guiada por políticas y a menudo discontinua a propósito. La metáfora genética engaña en cuanto se toma al pie de la letra.",
      },
    ],
    ledgerLabel: "Límite de publicación",
    ledger: [
      {
        label: "Estado de la evidencia",
        value: "Artículo conceptual",
        detail:
          "Una propuesta escrita y una agenda de investigación. Aquí no se informa de ninguna implementación, medición ni estudio con personas usuarias.",
      },
      {
        label: "Estado del sistema",
        value: "No hay nada funcionando",
        detail:
          "Detrás de esta ruta no hay motor de linaje, registro de genes, red de agentes, servicio alojado ni datos en vivo.",
      },
      {
        label: "Adopción",
        value: "No es un estándar",
        detail:
          "CodeAncestry no es una especificación aceptada y no afirma adopción, socios, grupo de trabajo ni respaldo alguno.",
      },
      {
        label: "Nombre",
        value: "Título de trabajo",
        detail:
          "El nombre es provisional. Las comprobaciones de nombre, dominio y marca están pendientes y habría que completarlas antes de cualquier lanzamiento.",
      },
    ],
  },
  close: {
    label: "Continuar / 10",
    heading: "Un cambio de pregunta, antes que un producto.",
    body: "El control de versiones pregunta qué líneas cambiaron. La gestión de dependencias, qué paquetes se incluyen. La procedencia, cómo se produjo un artefacto. Un genoma de software añade otra pregunta: ¿qué capacidades significativas se heredaron, mutaron, recombinaron o aprendieron a lo largo de la familia? Esa pregunta se vuelve más difícil de esquivar a medida que los agentes abaratan la producción de descendientes más rápido de lo que las personas pueden seguirlos.",
    aria: "Continuar desde el artículo conceptual",
    backToLaboratory: "Volver al Laboratorio",
    exploreWork: "Explorar el trabajo",
    visitContact: "Ir a Contacto",
  },
};

/** The paper in `locale`. English is the source text; Spanish is a full record. */
export function localizeCodeAncestry(locale: Locale): CodeAncestryPaper {
  return locale === "es" ? CODEANCESTRY_ES : CODEANCESTRY;
}
