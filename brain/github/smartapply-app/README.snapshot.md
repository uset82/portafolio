<!-- generatedBy: brain:sync-github; source: https://github.com/uset82/smartapply-app/blob/master/README.md; checkedOn: 2026-07-31; redactions: 1 -->

# SmartApply - Job Application Tracker

A modern web application to help users track job applications and generate AI-powered cover letters.

## Features

- Track job applications in one place
- Generate customized cover letters using Gemini AI
- Search and filter applications
- Responsive design for all devices

## Tech Stack

- React + TypeScript
- Vite for fast development
- Tailwind CSS for styling
- Supabase for backend services
- React Router for navigation
- Heroicons for UI icons

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository
   ```bash
   git clone <repository-url>
   cd smartapply-app
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Configure environment variables
   Create a `.env` file in the root directory with your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_ANON_KEY=[REDACTED credential-like value]
   ```

4. Start the development server
   ```bash
   npm run dev
   ```

## Project Structure

- `/src/components` - Reusable UI components
- `/src/pages` - Page components
- `/src/hooks` - Custom React hooks
- `/src/services` - API and service functions
- `/src/utils` - Utility functions
- `/src/types` - TypeScript type definitions
- `/src/assets` - Static assets like images
- `/src/lib` - Third-party library configurations
- `/src/contexts` - React contexts for state management

## Deployment

The application is configured to be deployed to any static hosting service (Vercel, Netlify, etc.) that supports Vite applications.
