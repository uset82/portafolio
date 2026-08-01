<!-- generatedBy: brain:sync-github; source: https://github.com/uset82/drone_Lips/blob/main/README.md; checkedOn: 2026-07-31; redactions: 0 -->

<div align="center">

# 🚁 Drone Lips

### *Fly a drone with just your mouth*

[![Astro](https://img.shields.io/badge/Astro-FF5D01?style=for-the-badge&logo=astro&logoColor=white)](https://astro.build)
[![Three.js](https://img.shields.io/badge/Three.js-000000?style=for-the-badge&logo=three.js&logoColor=white)](https://threejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Augment](https://img.shields.io/badge/Augment_Code-7C3AED?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTIgMkw0IDdWMTdMOCAyMEwxMiAxOEwxNiAyMEwyMCAxN1Y3TDEyIDJaIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiLz48L3N2Zz4=&logoColor=white)](https://docs.augmentcode.com/cli/sdk)

<br/>

<img src="./images/drone.png" alt="Drone Lips" width="400"/>

<br/>

**A mobile-first 3D drone flying game with a unique Mouth-Only Accessibility Mode**
*Control everything using just your mouth movements via webcam + AI face tracking*

[Play Now](#-getting-started) · [How It Works](#-how-it-works) · [Game Levels](#-game-levels)

</div>

<br/>

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 🎯 Mouth-Only Controls
Control the drone using facial movements tracked by MediaPipe Face Landmarker. No hands required!

### 📱 Mobile-First Design
Optimized for iPhone Safari with 60 FPS target performance.

</td>
<td width="50%">

### 🌍 10 Progressive Worlds
Journey from NYC Park tutorial to an epic Space War boss battle.

### ♿ Accessibility-First
Designed for players who can primarily move their mouth — gaming for everyone.

</td>
</tr>
</table>

---

## 🎮 How It Works

<table>
<tr>
<td width="50%">

### 👄 Mouth-Only Mode *(Primary)*

| Action | Control |
|:------:|:-------:|
| **Move** | Move mouth left/right/up/down |
| **Boost** | Open mouth wide |
| **Fire** | Blink or close eyes |
| **Hover** | Voice: *"stop"* |

</td>
<td width="50%">

### ⌨️ Keyboard Mode *(Fallback)*

| Action | Control |
|:------:|:-------:|
| **Move** | `WASD` or `↑↓←→` |
| **Fire** | `Space` |
| **Missile** | `M` |
| **Hover** | `X` |

</td>
</tr>
</table>

---

## 🛠️ Tech Stack

<div align="center">

| Frontend | 3D Engine | Face Tracking | AI Assistant | Language |
|:--------:|:---------:|:-------------:|:------------:|:--------:|
| [Astro](https://astro.build) + [React](https://react.dev) | [Three.js](https://threejs.org) + R3F | [MediaPipe](https://developers.google.com/mediapipe) | [Augment SDK](https://docs.augmentcode.com/cli/sdk) | TypeScript |

</div>

---

## 🤖 Powered by Augment Code

This project uses the [**Augment Code SDK**](https://docs.augmentcode.com/cli/sdk) for AI-assisted development features. Augment provides an intelligent coding assistant that helped build and iterate on this game.

```bash
# Start the dev server with Auggie (AI assistant)
npm run dev

# Or run just the UI without AI features
npm run dev:ui
```

---

## 🚀 Getting Started

### Prerequisites

> **Node.js 18+** and **npm** required

### Quick Start

```bash
# Clone the repository
git clone https://github.com/uset82/drone_Lips.git

# Navigate to the app
cd drone-lips/drone-lips

# Install dependencies
npm install

# Start the development server
npm run dev
```

🌐 Open **http://localhost:4321** in your browser

<details>
<summary>📱 <strong>Testing on iPhone / Mobile</strong></summary>

<br/>

Camera access requires **HTTPS** on non-localhost devices. Use [mkcert](https://github.com/FiloSottile/mkcert) to generate trusted certificates:

```bash
# Install mkcert and generate certs
mkcert -install
mkcert localhost 192.168.x.x  # replace with your local IP

# Move certs to the project
mv localhost+1.pem drone-lips/certs/dev-cert.pem
mv localhost+1-key.pem drone-lips/certs/dev-key.pem

# Start with LAN access
npm run dev:host
```

</details>

---

## 🎯 Game Levels

<div align="center">

| Level | 🌍 World | Description |
|:-----:|:--------:|:------------|
| 1 | **NYC Park** | 🌳 Tutorial — Learn movement, boost, hover |
| 2 | **Park Slalom** | 🌲 Precision flying through trees |
| 3 | **City Flight** | 🏙️ Navigate urban canyons |
| 4 | **Coast Wind** | 🌊 Deal with wind drift |
| 5 | **Desert Canyon** | 🏜️ High-speed corridors |
| 6 | **Military Base** | 🎖️ Combat introduction |
| 7 | **Upper Atmosphere** | ☁️ Transition to space |
| 8 | **Orbit Debris** | 🛸 Asteroid dodging |
| 9 | **Alien Zone** | 👽 UFO enemy patterns |
| 10 | **Space War** | 💥 Boss battle finale |

</div>

---

## 📁 Project Structure

```
drone-lips/
├── 📂 src/
│   ├── 📂 components/       # React components
│   │   └── DroneGame.tsx    # Main game component
│   ├── 📂 game/             # Game engine
│   │   ├── Game.ts          # Main loop & rendering
│   │   ├── Drone.ts         # Player drone model
│   │   ├── Enemy.ts         # Enemy logic & AI
│   │   ├── FaceTracker.ts   # MediaPipe face tracking
│   │   ├── VoiceHandler.ts  # Voice command support
│   │   └── InputRouter.ts   # Input handling
│   ├── 📂 pages/            # Astro pages
│   └── 📂 lib/              # Utilities
├── 📂 public/               # Static assets
└── 📂 scripts/              # Dev & build scripts
```

---

## 🔧 Scripts

| Command | Description |
|:--------|:------------|
| `npm run dev` | 🚀 Start dev server |
| `npm run dev:host` | 📱 Start with LAN access (for mobile) |
| `npm run build` | 📦 Build for production |
| `npm run preview` | 👀 Preview production build |
| `npm run test` | 🧪 Run tests |
| `npm run lint` | 🔍 Lint code |
| `npm run typecheck` | ✅ TypeScript checking |

---

## ♿ Accessibility

<div align="center">

| Feature | Description |
|:-------:|:------------|
| 🙌 **No Hands Required** | Full gameplay with mouth movements only |
| 📷 **Webcam Controls** | Works with any standard webcam |
| 🎯 **Calibration** | Adapts to each player's neutral position |
| 👁️ **Visual Feedback** | Clear UI for all game states |

</div>

> *"Gaming should be for everyone."*

---

## 🔒 Privacy

- 📹 Camera feed is used **only** for real-time face tracking
- 🚫 **No video is recorded or uploaded**
- 🔐 All processing happens locally in your browser

---

<div align="center">

## 📄 License

This project is currently private.

---

Made with ❤️ for accessible gaming

**[⬆ Back to Top](#-drone-lips)**

</div>
