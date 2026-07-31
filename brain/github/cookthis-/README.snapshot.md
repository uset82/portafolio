<!-- generatedBy: brain:sync-github; source: https://github.com/uset82/cookthis-/blob/main/README.md; checkedOn: 2026-07-31; redactions: 1 -->

# ?? COOKTHIS

**What's for dinner?** ? Snap your fridge, get AI-powered meal ideas in seconds.

COOKTHIS is a mobile-first web application that helps students (and anyone!) decide what to cook by analyzing photos of their fridge and pantry contents. Using AI-powered image recognition, it extracts ingredients and generates personalized meal suggestions based on your preferences.

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![React](https://img.shields.io/badge/React-19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8)

## ? Features

- ?? **Smart Ingredient Scanning** - Take photos of your fridge and pantry, AI detects ingredients automatically
- ??? **Personalized Meal Suggestions** - Get recipes based on what you have, your diet, allergies, time & budget
- ????? **AI Chef Assistant** - Chat with an AI cooking assistant for tips and guidance
- ?? **Shopping List** - Auto-generated lists for missing ingredients
- ?? **Save Favorites** - Keep your favorite recipes for quick access

## ?? Getting Started

```bash
# Clone the repository
git clone https://github.com/uset82/cookthis-.git
cd cookthis-/cookthis

# Install dependencies
npm install

# Set up environment variables (optional - works in demo mode without)
echo "NOVA_API_KEY=[REDACTED credential-like value]" > .env.local

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) - best viewed on mobile!

## ?? User Flow

1. **Onboarding** ? Set dietary preferences, allergies, cooking time & budget
2. **Scan** ? Take photos of your fridge and/or pantry
3. **Review** ? Edit the AI-detected ingredients
4. **Discover** ? Browse personalized meal suggestions
5. **Cook** ? View detailed recipes with step-by-step instructions
6. **Shop** ? Generate shopping lists for missing ingredients

## ??? Tech Stack

| Technology | Purpose |
|------------|---------|
| Next.js 16 | Full-stack framework with App Router |
| React 19 | UI components |
| TypeScript | Type safety |
| Tailwind CSS 4 | Styling |
| Amazon Nova 2 Lite | AI image analysis & meal generation |
| Vitest | Testing |

## ?? Project Structure

```
cookthis/
??? src/
?   ??? app/
?   ?   ??? api/          # Backend API routes
?   ?   ??? onboarding/   # User preferences
?   ?   ??? scan/         # Camera capture
?   ?   ??? ingredients/  # Review ingredients
?   ?   ??? meals/        # Meal suggestions
?   ?   ??? chef/         # AI chat assistant
?   ?   ??? shopping/     # Shopping list
?   ?   ??? saved/        # Saved recipes
?   ??? components/       # UI components
?   ??? lib/              # Utilities
??? public/               # Static assets
```

## ?? Testing

```bash
npm test           # Run tests once
npm run test:watch # Run tests in watch mode
```

## ?? Privacy

- Images are processed and immediately deleted
- Preferences stored locally in browser (no account needed)
- Your data stays on your device

## ?? Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm test` | Run tests |

---

Made with ?? for hungry students everywhere
