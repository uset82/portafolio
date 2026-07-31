<!-- generatedBy: brain:sync-github; source: https://github.com/uset82/chaclacayo/blob/main/README.md; checkedOn: 2026-07-31; redactions: 1 -->

# Chaclacayo ? Premium Real Estate Landing

Sitio web biling?e (ES/EN) de venta directa de la propiedad ubicada en
**Cooperativa Alfonso Cobi?n, Mz B Lt 25, Chaclacayo, Lima, Per?** ? propietario: Carlos Carpio.

## Stack

Vanilla HTML5 + CSS (custom properties) + JavaScript ES6+. **Cero dependencias**, pensado para hosting est?tico (Netlify, Vercel, GitHub Pages).

## Estructura

```
chaclacayo/
??? index.html              # P?gina principal (SPA con todas las secciones)
??? css/
?   ??? styles.css          # Design system + estilos por secci?n
??? js/
?   ??? i18n.js             # Sistema biling?e ES/EN
?   ??? gallery.js          # Carrusel + lightbox + swipe m?vil
?   ??? main.js             # Reveals, FAQ, ROI, formularios, sticky nav
??? FOTOS/                  # Fotos y video originales
??? assets/                 # (preparado para activos optimizados)
?   ??? images/
?   ??? video/
?   ??? og/
?   ??? icons/
?   ??? docs/
??? manifest.json           # PWA
??? robots.txt
??? sitemap.xml
??? main_idea.md            # Brief completo del proyecto
??? README.md               # Este archivo
```

## C?mo correrlo localmente

Cualquier servidor est?tico sirve. Las opciones m?s simples:

```bash
# Python 3
python -m http.server 5500

# Node (si tienes npx)
npx serve .

# VSCode / Cursor
# Click derecho en index.html ? "Open with Live Server"
```

Luego abre <http://localhost:5500> (o el puerto que indique tu herramienta).

## Datos pendientes

Antes del lanzamiento hay que completar valores marcados con `?` o `A consultar` en `index.html` y `js/i18n.js`:

- ?reas, habitaciones, ba?os, estacionamientos, a?o de construcci?n, precio
- Coordenadas GPS exactas para refinar el pin de Google Maps
- Foto profesional del propietario (sustituir el avatar `CC` en `?8`)
- Video tour optimizado (actualmente 15 MB; idealmente comprimir a <8 MB)

## Backend opcional (chatbot + comentarios)

El sitio sigue siendo 100% est?tico. Las nuevas funciones (chatbot inteligente y foro de comentarios) se apoyan en **Supabase** (base de datos + Edge Function que oculta la API key de OpenRouter).

### 1. Instalar Supabase CLI (una vez)

```powershell
# Windows (Scoop)
scoop install supabase

# o npm global
npm install -g supabase
```

Luego: `supabase login` y `supabase link --project-ref jcjygxooykoyhkbuoxex`.

### 2. Aplicar la migraci?n (crea tablas + RLS)

```powershell
supabase db push
```

Esto crea las tablas `comments` y `chat_logs`, habilita RLS y activa Realtime sobre `comments`.

### 3. Configurar secretos del Edge Function

```powershell
supabase secrets set OPENROUTER_API_KEY=[REDACTED credential-like value]
supabase secrets set OPENROUTER_MODEL=openrouter/free
```

> ?? La clave de OpenRouter compartida en la conversaci?n inicial est? expuesta ? **rotar en <https://openrouter.ai/keys> antes de desplegar**.

### 4. Desplegar el Edge Function

```powershell
supabase functions deploy chat
```

El endpoint queda en:
`https://jcjygxooykoyhkbuoxex.supabase.co/functions/v1/chat`

Ya est? apuntado en `index.html` ? `window.APP_CONFIG.CHAT_ENDPOINT`.

### 5. (Opcional) Endurecer CORS para producci?n

El Edge Function lee la lista de or?genes permitidos del secreto `ALLOWED_ORIGIN`. En desarrollo se acepta `*`; en producci?n conviene restringirlo a tu dominio real (soporta varios separados por coma):

```powershell
supabase secrets set ALLOWED_ORIGIN="https://chaclacayo.example.com,https://www.chaclacayo.example.com"
supabase functions deploy chat
```

Si el origen del request no est? en la lista, el preflight fallar? visiblemente en el navegador ? ?til para diagn?stico. Para volver al modo abierto: `supabase secrets unset ALLOWED_ORIGIN` o `supabase secrets set ALLOWED_ORIGIN="*"`.

### 6. Moderar comentarios (si alg?n d?a llega spam)

Las inserciones est?n limitadas a **1 cada 30 s por IP** (v?a trigger SQL). Si pese a eso aparece algo indeseado:

1. Abre el dashboard de Supabase ? **Table editor** ? `comments`
2. Pon `is_visible = false` en la fila ofensiva
3. RLS la oculta inmediatamente (los dem?s visitantes dejar?n de verla)

### 7. Chatbot BYOK ? "cualquiera puede chatear con su propia cuenta de OpenRouter"

El widget del chatbot soporta dos rutas de ejecuci?n:

1. **Servidor (por defecto)** ? el navegador llama a la Edge Function, que usa tu `OPENROUTER_API_KEY`. Carlos paga los tokens.
2. **BYOK (Bring Your Own Key)** ? cualquier visitante puede abrir `?` dentro del chat y:
   - **Conectar OpenRouter** (flujo OAuth PKCE ? un clic, aprueba en openrouter.ai, vuelve a la p?gina ya conectado).
   - O **pegar su propia API key** (`sk-or-v1-...`) manualmente.

Cuando el visitante est? conectado, el navegador llama DIRECTAMENTE a
`https://openrouter.ai/api/v1/chat/completions` con **su propia clave** ? no pasa por tu servidor, no cuenta contra tu cuota. La clave se guarda s?lo en su `localStorage`.

Esto significa que **el chatbot sigue funcionando aunque tu `OPENROUTER_API_KEY` del servidor expire o alcance el l?mite**: los usuarios pueden conectar su propia cuenta (la creaci?n en OpenRouter es gratis y soporta el modelo `openrouter/auto`).

No requiere configuraci?n adicional ? est? activo por defecto tras desplegar el sitio.

## Caracter?sticas clave

- **Biling?e ES/EN** con persistencia en `localStorage` y detecci?n autom?tica
- **Galer?a interactiva** con miniaturas, lightbox, swipe m?vil y atajos de teclado
- **Calculadora de ROI** en tiempo real (Airbnb / alquiler corto)
- **FAQ acorde?n** con 10 preguntas que matan objeciones
- **Mapa de Google embebido** + bot?n "C?mo llegar"
- **Owner Letter** ? bloque humano para conversi?n
- **Schema.org** `RealEstateListing` para SEO
- **Open Graph + Twitter Card** para compartir bonito en redes
- **WhatsApp flotante** apuntando a Carlos (+47 450 41 112)
- **Foro de comentarios** con realtime (Supabase) ? los visitantes pueden preguntar y leer otras dudas
- **Asistente IA** flotante en espa?ol/ingl?s (OpenRouter Free Models Router) que responde con datos reales de la propiedad y traspasa la conversaci?n a WhatsApp cuando hay intenci?n de compra
- **Accesible**: skip-link, focus visible, `prefers-reduced-motion`, contraste WCAG AA
- **PWA-ready** (`manifest.json` + theme color)
- **Responsive** desde 320px hasta desktop

## Despliegue

### Netlify / Vercel (recomendado)

```bash
# Solo subir el folder, sin build step
# Configurar dominio personalizado y SSL autom?tico
```

### GitHub Pages

```bash
git init && git add -A && git commit -m "Launch site"
# Push a la rama main del repo y habilitar Pages en Settings
```

Antes de desplegar, reemplazar `chaclacayo.example.com` por el dominio real en:

- `index.html` (canonical, JSON-LD)
- `sitemap.xml`
- `robots.txt`

## Brief detallado

El documento completo del proyecto vive en [`main_idea.md`](./main_idea.md): visi?n,
p?blico objetivo, design system, arquitectura, contenido por secci?n, estrategia
de conversi?n, viralidad, SEO, performance, legal y roadmap.

---

? 2026 Carlos Carpio ? Venta directa ? Sin intermediarios
