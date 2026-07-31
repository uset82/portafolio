<!-- generatedBy: brain:sync-github; source: https://github.com/uset82/pinaculo/blob/main/README.md; checkedOn: 2026-07-31; redactions: 0 -->

# ?? NUMEROLOGO - Sistema Avanzado de Numerolog?a del Pin?culo

Una aplicaci?n web moderna de numerolog?a que implementa el **Sistema Completo del Pin?culo** con 24 posiciones numerol?gicas, c?lculos precisos y an?lisis detallados en espa?ol.

## ?? Demo en Vivo

**?? Aplicaci?n Desplegada**: https://pinaculo.netlify.app/

## ? Caracter?sticas Principales

- ?? **Sistema del Pin?culo Completo (24 posiciones)** - Implementaci?n exacta con todas las reglas especiales
- ???? **Interfaz en Espa?ol** - Dise?ado espec?ficamente para la comunidad hispanohablante
- ?? **C?lculos Precisos con Reglas Especiales**:
  - Regla de conversi?n 11?2, 22?4, 33?6 para negativos
  - Verificaci?n especial para D y H
  - Triplicidad calculada solo de K,L,M,N,O,P,Q,R,S
  - C?lculo de n?meros ausentes (T)
- ?? **Dise?o Moderno** - Interfaz responsive con Tailwind CSS


## ?? Las 24 Posiciones del Pin?culo

### ?? N?meros Base:
- **A - TAREA NO APRENDIDA** (Mes)
- **B - MI ESENCIA** (D?a)
- **C - MI VIDA PASADA** (A?o)
- **D - MI M?SCARA** (con regla especial)

### ?? N?meros Superiores:
- **X - REACCI?N**
- **Y - MISI?N**
- **Z - REGALO DIVINO**

### ?? Ciclos de Vida:
- **E - 1ERA ETAPA** (Implantaci?n del Programa)
- **F - 2DA ETAPA** (Encuentro con tu Maestro)
- **G - 3RA ETAPA** (Re-identificaci?n con tu Yo)
- **H - 4TA ETAPA** (Tu Destino)

### ?? Aspectos Ocultos:
- **I - INCONSCIENTE POSITIVO**
- **J - MI ESPEJO**

### ?? Aspectos Negativos:
- **K - ADOLESCENCIA** | **L - JUVENTUD**
- **M - ADULTEZ** | **N - ADULTO MAYOR**
- **O - INCONSCIENTE NEGATIVO**
- **P - MI SOMBRA**
- **Q, R, S - SERES INFERIORES 1, 2, 3**

### ?? Aspectos Especiales:
- **W - TRIPLICIDAD** (n?meros que aparecen 3 veces)
- **T - AUSENTES** (n?meros que no aparecen)

##  Tecnolog?as

- **Framework**: Next.js 15 con TypeScript
- **Estilo**: Tailwind CSS
- **Testing**: Jest

- **Deploy**: Netlify con exportaci?n est?tica

##  Instalaci?n y Uso

```bash
# Clonar el repositorio
git clone https://github.com/uset82/NUMEROLOGO.git
cd NUMEROLOGO/MCP

# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Construir para producci?n
npm run build
```

##  Estructura del Proyecto

```text
NUMEROLOGO/
  MCP/                       # Aplicaci?n Next.js principal
    src/
      app/                  # App Router de Next.js
      components/           # Componentes React
    package.json            # Dependencias de la aplicaci?n
    next.config.js          # Configuraci?n de Next.js
  netlify.toml              # Configuraci?n de Netlify (base=MCP, publish=out)
  README.md                 # Este archivo
```

## ?? Reglas Especiales del Sistema

El sistema implementa las reglas exactas del Pin?culo profesional:

### ?? Reglas Cr?ticas:
1. **Conversi?n para Negativos**: Si A, B o C = 11, 22 o 33, se convierten a 2, 4 o 6 SOLO para calcular K, L, N
2. **Verificaci?n D y H**: Cuando resultan 2, 11, 4 o 22, se aplica regla especial de comprobaci?n
3. **Triplicidad (W)**: Solo cuenta n?meros de K,L,M,N,O,P,Q,R,S que aparezcan exactamente 3 veces
4. **Ausentes (T)**: N?meros del 1-9 que no aparecen en ninguna posici?n

<!-- Secci?n eliminada: mapeos de letras no forman parte de los PDFs de referencia -->

### ?? Caracter?sticas:
- **N?meros Maestros**: 11, 22 y 33 se preservan sin reducir
- **Valores Absolutos**: K, L, N siempre positivos
- **C?lculo de M**: Si K?L ? M=|K-L|, Si K=L ? M=K+L
- **Orden de C?lculo**: Importante para dependencias entre valores

##  Desarrollo

### Comandos Disponibles

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Construcci?n para producci?n
npm run start        # Servidor de producci?n
npm run lint         # Linting del c?digo
npm run test         # Ejecutar tests
```

##  Ejemplo de Uso

Ingresa tu nombre completo y fecha de nacimiento para obtener:

1. **An?lisis Completo del Pin?culo** (23 n?meros diferentes)
2. **Interpretaciones Detalladas** en espa?ol
3. **Ciclos de Vida** personalizados
4. **N?meros Ausentes** y su significado

##  Contribuciones

Este proyecto implementa el sistema de numerolog?a del Pin?culo con precisi?n profesional. Las contribuciones son bienvenidas.

##  Licencia

Proyecto de c?digo abierto para la comunidad de numerolog?a en espa?ol.

---

**Desarrollado con  para la comunidad hispanohablante de numerolog?a**
