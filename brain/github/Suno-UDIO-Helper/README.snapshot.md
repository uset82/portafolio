<!-- generatedBy: brain:sync-github; source: https://github.com/uset82/Suno-UDIO-Helper/blob/main/README.md; checkedOn: 2026-07-31; redactions: 0 -->

# Suno-UDIO-Helper Documentation

Documentation site for the Suno & UDIO Helper, providing comprehensive guidance on metatags and usage.

## Development

1. Clone the repository:
   ```bash
   git clone https://github.com/uset82/Suno-UDIO-Helper.git
   cd Suno-UDIO-Helper
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

4. Open http://localhost:5173 in your browser

## Building

To create a production version:
```bash
npm run build
```

## Deployment to GitHub Pages

1. Push your changes to the main branch:
   ```bash
   git add .
   git commit -m "Update site"
   git push origin main
   ```

2. The GitHub Action will automatically:
   - Build the site
   - Deploy to GitHub Pages
   - Make it available at: https://uset82.github.io/Suno-UDIO-Helper/

## Project Structure

```
src/
├── lib/
│   ├── components/    # Reusable components
│   ├── styles/        # Global styles and variables
│   └── utils/         # Utility functions
├── routes/            # Page components
└── app.html           # HTML template
```
