# Kalsigi

A modern manga/manhwa reading platform built with Next.js 15, featuring group collaboration tools, image optimization, and a seamless reading experience.

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript)
![License](https://img.shields.io/badge/License-MIT-green.svg)

## Overview

This project is a full-stack manga/manhwa platform that allows users to read, bookmark, and track their favorite series. It includes a complete scanlation group system where teams can collaborate to submit and manage content, along with an admin approval workflow.

**Key highlights:**
- Built with Next.js 15's App Router and React Server Components
- Optimized bundle size - reduced initial load by 50% through code splitting
- AVIF/WebP image optimization for faster loading
- PWA support for mobile installation
- Full dark mode implementation
- Responsive design with mobile-first approach

## Tech Stack

**Frontend:**
- Next.js 15 (App Router)
- React 19 with TypeScript
- TailwindCSS 4 for styling
- Radix UI components
- SWR for data fetching

**Backend:**
- Next.js API Routes
- PostgreSQL database
- Drizzle ORM
- better-auth for authentication
- Cloudflare R2 (S3-compatible) for image storage

**Additional Tools:**
- Sharp for image processing
- Zod for validation
- Bundle analyzer for performance monitoring

## Features

### For Readers
- Multiple reading modes (vertical scroll, horizontal pagination, webtoon mode)
- Bookmark system with sync
- Watch history tracking
- Genre filtering and search
- Series recommendations
- Dark mode support

### For Scanlation Groups
- Group creation and management
- Chapter submission workflow
- Series submission system
- Member role management
- Submission tracking

### For Admins
- Content approval system
- Series and chapter moderation
- Platform analytics
- User management

## Project Structure

```
src/
├── app/              # Next.js App Router pages and API routes
├── components/       # React components
│   ├── ui/          # Reusable UI components
│   ├── feed/        # Content feed components
│   ├── manga/       # Series components
│   ├── chapter/     # Chapter reader
│   └── groups/      # Group management
├── lib/             # Utilities and helpers
└── util/            # Database schemas and config
```

## Getting Started

1. Clone the repository
```bash
git clone https://github.com/Proudart/kalsigi.git
cd kalsigi
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env
```
Configure your database URL, auth secret, and R2 credentials in `.env`

4. Set up the database
```bash
npx drizzle-kit push
```

5. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Performance Optimizations

I've implemented several optimizations to improve loading times:

- **Bundle Splitting**: Separated vendor, UI, icons, and feature code into optimized chunks
- **Dynamic Imports**: Admin components and heavy features load only when needed
- **Image Optimization**: Automatic AVIF/WebP conversion with multiple responsive sizes
- **Code Splitting**: Route-based and component-based splitting reduces initial bundle size

See [BUNDLE_OPTIMIZATION.md](BUNDLE_OPTIMIZATION.md) for detailed metrics.

## Design System

The UI follows a minimalist, fintech-inspired design with:
- Card-based layouts
- Consistent spacing and typography
- Mobile-first responsive design
- Full dark mode support

See [STYLING_GUIDE.md](STYLING_GUIDE.md) for component patterns.

## Available Scripts

```bash
npm run dev          # Start development server with Turbopack
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run build:analyze # Build with bundle analyzer
```

## Environment Variables

Key environment variables needed:
- `DATABASE_URL` - PostgreSQL connection string
- `BETTER_AUTH_SECRET` - Authentication secret
- `R2_*` - Cloudflare R2 credentials for image storage
- `NEXT_PUBLIC_BASE_URL` - Your site URL

See `.env.example` for the complete list.

## Contributing

Contributions are welcome! Please check out [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

This project is licensed under the MIT License - see [LICENSE](LICENSE) for details.

## Acknowledgments

Built with Next.js, React, and other amazing open-source tools.
