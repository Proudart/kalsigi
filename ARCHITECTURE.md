# Architecture Documentation

## Overview

Kalsigi is built using a modern, scalable architecture leveraging Next.js 15's App Router, PostgreSQL, and cloud storage. This document outlines the technical architecture and key design decisions.

## Technology Stack

### Frontend Layer
- **Framework**: Next.js 15 (App Router)
- **UI Library**: React 19
- **Language**: TypeScript 5.9
- **Styling**: TailwindCSS 4
- **State Management**: SWR for server state, React Context for client state
- **Form Management**: React Hook Form with Zod validation
- **UI Components**: Radix UI primitives

### Backend Layer
- **Runtime**: Node.js
- **API**: Next.js API Routes
- **Authentication**: better-auth
- **Database**: PostgreSQL 14+
- **ORM**: Drizzle ORM
- **Storage**: AWS S3 / Cloudflare R2
- **Image Processing**: Sharp

### Infrastructure
- **Deployment**: Vercel / Docker
- **CDN**: Cloudflare R2
- **Analytics**: PostHog, Plausible
- **Security**: Cloudflare Turnstile

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Client Layer                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Browser │  │  Mobile  │  │   PWA    │  │  Tablet  │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘   │
└───────┼─────────────┼─────────────┼─────────────┼──────────┘
        │             │             │             │
        └─────────────┴─────────────┴─────────────┘
                        │
        ┌───────────────▼──────────────────────────┐
        │         Next.js Application              │
        │  ┌────────────────────────────────────┐  │
        │  │         App Router (RSC)           │  │
        │  │  ┌──────────┐  ┌──────────────┐   │  │
        │  │  │  Pages   │  │  API Routes  │   │  │
        │  │  └──────────┘  └──────────────┘   │  │
        │  └────────────────────────────────────┘  │
        │  ┌────────────────────────────────────┐  │
        │  │        Server Components           │  │
        │  └────────────────────────────────────┘  │
        │  ┌────────────────────────────────────┐  │
        │  │        Client Components           │  │
        │  └────────────────────────────────────┘  │
        └────────────┬──────────────┬──────────────┘
                     │              │
        ┌────────────▼──────┐  ┌───▼──────────────┐
        │    PostgreSQL     │  │  Cloudflare R2   │
        │     Database      │  │  (Image Storage) │
        └───────────────────┘  └──────────────────┘
```

## Database Architecture

### Entity Relationship Diagram

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│    User     │         │    Series    │         │   Chapter   │
├─────────────┤         ├──────────────┤         ├─────────────┤
│ id          │◄───┐    │ id           │         │ id          │
│ email       │    │    │ title        │◄────────┤ seriesId    │
│ username    │    │    │ description  │         │ title       │
│ role        │    │    │ coverImage   │         │ content     │
│ createdAt   │    │    │ genres       │         │ chapterNum  │
└─────────────┘    │    │ status       │         │ groupId     │
                   │    │ createdAt    │         │ createdAt   │
┌─────────────┐    │    └──────────────┘         └─────────────┘
│  Bookmark   │    │            │                        │
├─────────────┤    │            │                        │
│ userId      │────┘    ┌───────▼────────┐       ┌──────▼──────┐
│ seriesId    │─────────┤ SeriesHistory  │       │  Scanlation │
│ chapterId   │         ├────────────────┤       │    Group    │
└─────────────┘         │ userId         │       ├─────────────┤
                        │ seriesId       │       │ id          │
┌─────────────┐         │ lastChapter    │       │ name        │
│  Series     │         │ progress       │       │ description │
│ Submission  │         └────────────────┘       │ members     │
├─────────────┤                                  └─────────────┘
│ id          │         ┌────────────────┐              │
│ groupId     │─────────┤ Group Members  │──────────────┘
│ title       │         ├────────────────┤
│ status      │         │ userId         │
│ submittedBy │         │ groupId        │
└─────────────┘         │ role           │
                        └────────────────┘
```

### Key Tables

#### Core Tables
- **series**: Main manga/manhwa series data
- **chapters**: Chapter content and metadata (JSONB for pages)
- **user**: User accounts and authentication
- **session**: Active user sessions
- **account**: OAuth account links

#### Content Management
- **seriesSubmissions**: Pending series awaiting approval
- **chapterSubmissions**: Pending chapter uploads
- **scanlationGroups**: Translation groups
- **groupMembers**: Group membership and roles

#### User Data
- **bookmarks**: User bookmarks
- **seriesHistory**: Reading progress tracking
- **ratings**: User ratings for series

## API Architecture

### API Route Structure

```
/api/
├── auth/                    # Authentication endpoints
│   ├── [...all]/           # better-auth handler
│   ├── addBookmark/
│   ├── syncBookmarks/
│   └── getCurrentUser/
├── admin/                   # Admin endpoints
│   ├── series/
│   │   ├── route.ts        # GET, POST
│   │   ├── [id]/
│   │   │   ├── route.ts    # GET, PUT, DELETE
│   │   │   ├── approve/
│   │   │   └── reject/
│   │   ├── approved/
│   │   ├── pending/
│   │   └── stats/
│   ├── chapter/
│   └── groups/
├── series/                  # Public series endpoints
├── chapters/               # Public chapter endpoints
├── feed/                   # Content feeds
│   ├── recommended/
│   ├── updated/
│   ├── continue/
│   └── genre/
└── groups/                 # Group management
    ├── [slug]/
    ├── invite/
    └── submissions/
```

### API Design Patterns

#### RESTful Conventions
- GET: Retrieve resources
- POST: Create new resources
- PUT/PATCH: Update resources
- DELETE: Remove resources

#### Response Format
```typescript
// Success response
{
  success: true,
  data: { /* resource data */ }
}

// Error response
{
  success: false,
  error: "Error message",
  code: "ERROR_CODE"
}
```

#### Authentication
- Session-based authentication via better-auth
- Role-based access control (reader, admin, moderator)
- API route protection via middleware

## Component Architecture

### Component Hierarchy

```
app/
├── layout.tsx                 # Root layout
├── page.tsx                   # Home page
├── series/
│   ├── page.tsx              # Series list
│   └── [series]/
│       ├── page.tsx          # Series detail
│       └── [group]/
│           └── [chapter]/
│               └── page.tsx  # Chapter reader
└── admin/
    └── page.tsx              # Admin dashboard

components/
├── ui/                       # Reusable UI components
│   ├── button.tsx
│   ├── card.tsx
│   └── input.tsx
├── feed/                     # Feed components
│   ├── recommended/
│   ├── updated/
│   └── continue/
├── manga/                    # Series components
│   ├── manga.tsx
│   ├── chapterList.tsx
│   └── seriesStats.tsx
├── chapter/                  # Reader components
│   ├── chapter.tsx
│   ├── chapterNav.tsx
│   └── modeSelector.tsx
└── groups/                   # Group management
    ├── GroupDashboard.tsx
    └── MemberManagement.tsx
```

### Component Patterns

#### Server Components (Default)
- Data fetching at the server level
- SEO-friendly
- Zero client-side JavaScript

#### Client Components
- Interactive features (forms, modals)
- Use "use client" directive
- Minimal client-side JavaScript

#### Dynamic Components
- Lazy-loaded for performance
- Admin interfaces
- Heavy UI components

## Data Flow

### Reading a Chapter

```
User Request
    │
    ▼
Next.js Server
    │
    ├─► Check Authentication
    │       │
    │       ▼
    │   Get User Session
    │
    ├─► Fetch Chapter Data
    │       │
    │       ├─► Query Database (Drizzle)
    │       └─► Get Series Info
    │
    ├─► Load Images
    │       │
    │       └─► Fetch from R2/CDN
    │
    ├─► Update Watch History
    │       │
    │       └─► Write to Database
    │
    └─► Render Page
            │
            ▼
    Server Component
            │
            ├─► Chapter Content (SSR)
            ├─► Navigation (SSR)
            └─► Reader Controls (Client)
                    │
                    ▼
            Client Hydration
```

### Submitting Content

```
User Upload (Client)
    │
    ├─► Form Validation (Zod)
    │
    ├─► Image Compression
    │
    └─► API Request
            │
            ▼
    API Route Handler
            │
            ├─► Authentication Check
            │
            ├─► Authorization Check
            │       (Group Member?)
            │
            ├─► Upload Images to R2
            │       │
            │       └─► Generate URLs
            │
            ├─► Create Submission Record
            │       │
            │       └─► Database Insert
            │
            └─► Return Success
                    │
                    ▼
            Client Updates UI
```

## Performance Optimizations

### Bundle Optimization
- Code splitting by route and feature
- Dynamic imports for heavy components
- Tree shaking for unused code
- Chunk optimization (vendor, UI, icons, etc.)

### Image Optimization
- AVIF/WebP format conversion
- Responsive image sizes
- Progressive loading
- Blur placeholders
- CDN delivery

### Data Fetching
- React Server Components for initial data
- SWR for client-side data fetching
- Request deduplication
- Automatic revalidation

### Caching Strategy
- Next.js build-time caching
- SWR cache with revalidation
- CDN caching for images
- Static generation for series lists

## Security Architecture

### Authentication Flow
```
Login Request
    │
    ▼
better-auth Handler
    │
    ├─► Validate Credentials
    │
    ├─► Create Session
    │
    ├─► Set Secure Cookie
    │       (httpOnly, secure, sameSite)
    │
    └─► Return Session Token
```

### Authorization Layers
1. **Route Protection**: Middleware checks authentication
2. **API Protection**: Route handlers verify permissions
3. **Database Protection**: Row-level security considerations
4. **Resource Protection**: Ownership verification

### Security Measures
- Rate limiting on API routes
- CSRF protection via better-auth
- XSS prevention (React escaping)
- SQL injection prevention (Drizzle ORM)
- Secure session management
- Content Security Policy headers

## Deployment Architecture

### Production Deployment

```
┌────────────────────────────────────────────────┐
│              Cloudflare CDN                    │
│  ┌──────────────────────────────────────────┐ │
│  │      Edge Cache / DDoS Protection        │ │
│  └────────────────┬─────────────────────────┘ │
└───────────────────┼────────────────────────────┘
                    │
        ┌───────────▼──────────┐
        │   Load Balancer      │
        └───────────┬──────────┘
                    │
        ┌───────────▼──────────┐
        │   Next.js Server     │
        │   (Vercel/Docker)    │
        └───────┬───────┬──────┘
                │       │
    ┌───────────▼───┐   └──────────────┐
    │  PostgreSQL   │                  │
    │   (Primary)   │                  │
    └───────────────┘           ┌──────▼──────┐
                                │  R2 Storage │
                                └─────────────┘
```

### Environment Configuration
- **Development**: Local PostgreSQL, local R2 emulation
- **Staging**: Separate database, test R2 bucket
- **Production**: Production database, production R2 bucket

## Monitoring & Observability

### Metrics Tracked
- **Web Vitals**: FCP, LCP, CLS, FID, TTFB
- **Bundle Size**: Tracked via bundlesize
- **API Performance**: Response times
- **Error Rates**: Client and server errors
- **User Analytics**: Page views, engagement

### Logging
- Server-side logging for errors
- API request/response logging
- Authentication event logging
- Performance monitoring

## Scalability Considerations

### Horizontal Scaling
- Stateless Next.js servers
- Shared session store
- CDN for static assets

### Database Optimization
- Indexed queries for common operations
- Connection pooling
- Read replicas (future consideration)

### Caching Layers
1. **CDN Cache**: Static assets and images
2. **Server Cache**: Next.js build cache
3. **Client Cache**: SWR data cache
4. **Database Cache**: Query result caching

## Future Architecture Improvements

### Planned Enhancements
- [ ] Redis for session storage and caching
- [ ] Full-text search with Elasticsearch
- [ ] WebSocket for real-time features
- [ ] Microservices for image processing
- [ ] GraphQL API option
- [ ] Kubernetes deployment
- [ ] Database read replicas
- [ ] Multi-region deployment

---

For implementation details, see the [CONTRIBUTING.md](CONTRIBUTING.md) guide.
