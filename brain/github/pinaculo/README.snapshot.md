<!-- generatedBy: brain:sync-github; source: https://github.com/uset82/pinaculo/blob/main/README.md; checkedOn: 2026-07-31; redactions: 0 -->

# 📿 NUMEROLOGO - Sistema Avanzado de Numerología del Pináculo

Una aplicación web moderna de numerología que implementa el **Sistema Completo del Pináculo** con 24 posiciones numerológicas, cálculos precisos y análisis detallados en español.

## 🌟 Demo en Vivo

**🚀 Aplicación Desplegada**: https://pinaculo.netlify.app/

## ✨ Características Principales

- 🎯 **Sistema del Pináculo Completo (24 posiciones)** - Implementación exacta con todas las reglas especiales
- 🇪🇸 **Interfaz en Español** - Diseñado específicamente para la comunidad hispanohablante
- 🔢 **Cálculos Precisos con Reglas Especiales**:
  - Regla de conversión 11→2, 22→4, 33→6 para negativos
  - Verificación especial para D y H
  - Triplicidad calculada solo de K,L,M,N,O,P,Q,R,S
  - Cálculo de números ausentes (T)
- 🎨 **Diseño Moderno** - Interfaz responsive con Tailwind CSS


## 📊 Las 24 Posiciones del Pináculo

### 🔷 Números Base:
- **A - TAREA NO APRENDIDA** (Mes)
- **B - MI ESENCIA** (Día)
- **C - MI VIDA PASADA** (Año)
- **D - MI MÁSCARA** (con regla especial)

### 🔷 Números Superiores:
- **X - REACCIÓN**
- **Y - MISIÓN**
- **Z - REGALO DIVINO**

### 🔷 Ciclos de Vida:
- **E - 1ERA ETAPA** (Implantación del Programa)
- **F - 2DA ETAPA** (Encuentro con tu Maestro)
- **G - 3RA ETAPA** (Re-identificación con tu Yo)
- **H - 4TA ETAPA** (Tu Destino)

### 🔷 Aspectos Ocultos:
- **I - INCONSCIENTE POSITIVO**
- **J - MI ESPEJO**

### 🔷 Aspectos Negativos:
- **K - ADOLESCENCIA** | **L - JUVENTUD**
- **M - ADULTEZ** | **N - ADULTO MAYOR**
- **O - INCONSCIENTE NEGATIVO**
- **P - MI SOMBRA**
- **Q, R, S - SERES INFERIORES 1, 2, 3**

### 🔷 Aspectos Especiales:
- **W - TRIPLICIDAD** (números que aparecen 3 veces)
- **T - AUSENTES** (números que no aparecen)

##  Tecnologías

- **Framework**: Next.js 15 con TypeScript
- **Estilo**: Tailwind CSS
- **Testing**: Jest

- **Deploy**: Netlify con exportación estática

##  Instalación y Uso

```bash
# Clonar el repositorio
git clone https://github.com/uset82/NUMEROLOGO.git
cd NUMEROLOGO/MCP

# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Construir para producción
npm run build
```

##  Estructura del Proyecto

```text
NUMEROLOGO/
  MCP/                       # Aplicación Next.js principal
    src/
      app/                  # App Router de Next.js
      components/           # Componentes React
    package.json            # Dependencias de la aplicación
    next.config.js          # Configuración de Next.js
  netlify.toml              # Configuración de Netlify (base=MCP, publish=out)
  README.md                 # Este archivo
```

## 📏 Reglas Especiales del Sistema

El sistema implementa las reglas exactas del Pináculo profesional:

### 🔴 Reglas Críticas:
1. **Conversión para Negativos**: Si A, B o C = 11, 22 o 33, se convierten a 2, 4 o 6 SOLO para calcular K, L, N
2. **Verificación D y H**: Cuando resultan 2, 11, 4 o 22, se aplica regla especial de comprobación
3. **Triplicidad (W)**: Solo cuenta números de K,L,M,N,O,P,Q,R,S que aparezcan exactamente 3 veces
4. **Ausentes (T)**: Números del 1-9 que no aparecen en ninguna posición

<!-- Sección eliminada: mapeos de letras no forman parte de los PDFs de referencia -->

### 🟢 Características:
- **Números Maestros**: 11, 22 y 33 se preservan sin reducir
- **Valores Absolutos**: K, L, N siempre positivos
- **Cálculo de M**: Si K≠L → M=|K-L|, Si K=L → M=K+L
- **Orden de Cálculo**: Importante para dependencias entre valores

##  Desarrollo

### Comandos Disponibles

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Construcción para producción
npm run start        # Servidor de producción
npm run lint         # Linting del código
npm run test         # Ejecutar tests
```

##  Ejemplo de Uso

Ingresa tu nombre completo y fecha de nacimiento para obtener:

1. **Análisis Completo del Pináculo** (23 números diferentes)
2. **Interpretaciones Detalladas** en español
3. **Ciclos de Vida** personalizados
4. **Números Ausentes** y su significado

##  Contribuciones

Este proyecto implementa el sistema de numerología del Pináculo con precisión profesional. Las contribuciones son bienvenidas.

##  Licencia

Proyecto de código abierto para la comunidad de numerología en español.

---

**Desarrollado con  para la comunidad hispanohablante de numerología**
