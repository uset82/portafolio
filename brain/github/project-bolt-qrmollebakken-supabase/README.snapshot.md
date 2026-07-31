<!-- generatedBy: brain:sync-github; source: https://github.com/uset82/project-bolt-qrmollebakken-supabase/blob/main/README.md; checkedOn: 2026-07-31; redactions: 1 -->


# QR Møllebakken Art Project

A digital art gallery platform for Møllebakken school, allowing teachers to upload student artwork and parents to view their children's creations through QR codes.

## Features

- Teacher dashboard for uploading student artwork
- Support for images, videos (max 20s), and audio recordings (max 1min)
- QR code-based parent access
- Offline support
- Responsive design

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Supabase (Authentication, Database, Storage)
- Lucide React Icons

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/uset82/qr-mollebakken.git
cd qr-mollebakken
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file with your Supabase configuration:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=[REDACTED credential-like value]
```

4. Start the development server:
```bash
npm run dev
```

## Project Structure

```
src/
  ├── components/        # Reusable UI components
  │   ├── artwork/      # Artwork-specific components
  │   └── ui/           # Generic UI components
  ├── lib/              # Core functionality
  │   ├── api/          # API integration layer
  │   ├── supabase/     # Supabase client and queries
  │   └── utils/        # Utility functions
  ├── pages/            # Application pages
  └── types/            # TypeScript type definitions
```

## Storage Quotas

Each student has the following storage limits:
- Images: Maximum 3 images
- Videos: Maximum 1 video (20 seconds, 50MB limit)
- Audio: Maximum 1 audio recording (1 minute, 10MB limit)

## Supabase Setup

### Database Tables

1. artworks
```sql
create table artworks (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  url text not null,
  file_path text not null,
  type text not null,
  student_id text not null,
  student_name text not null
);
```

2. students
```sql
create table students (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  folder_name text not null,
  grade text not null
);
```

### Storage Buckets

1. Create an `artworks` bucket with the following structure:
```
artworks/
  ├── [student-id]/
  │   ├── images/
  │   ├── videos/
  │   └── audio/
```

2. Configure storage policies to allow public read access and authenticated write access.

### Authentication

- Email/Password authentication for teachers
- Custom QR code authentication for parents
- Row Level Security (RLS) policies for data protection

## Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run type checking
npm run typecheck

# Run linting
npm run lint
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT
