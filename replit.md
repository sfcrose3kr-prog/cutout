# replit.md

## Overview

A Korean-language daily work entry management system for tracking production and trade data. The application allows users to create, read, update, and delete day entries with fields for date, counterparty, product details (thickness, winding, work type, emboss, size), and notes. It also supports bulk entry creation and Excel file import functionality.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state caching and synchronization
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens for a premium clean-minimal aesthetic
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite with custom plugins for Replit integration

### Backend Architecture
- **Framework**: Express.js 5 (ESM modules)
- **Runtime**: Node.js with tsx for TypeScript execution
- **API Design**: RESTful endpoints defined in shared routes contract
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Validation**: Zod schemas shared between client and server via drizzle-zod

### Data Layer
- **Database**: PostgreSQL (connection via `DATABASE_URL` environment variable)
- **Schema**: Single `day_entries` table with fields for production/trade tracking
- **Migrations**: Drizzle Kit for schema migrations (`db:push` command)

### Shared Code Pattern
The `shared/` directory contains code used by both frontend and backend:
- `schema.ts`: Drizzle table definitions and Zod validation schemas
- `routes.ts`: API route definitions with type-safe input/output contracts

### Build System
- Development: Vite dev server with HMR proxied through Express
- Production: esbuild bundles server code, Vite builds client to `dist/public`
- Server dependencies are selectively bundled to optimize cold start times

## External Dependencies

### Database
- **PostgreSQL**: Primary data store, connected via `DATABASE_URL` environment variable
- **connect-pg-simple**: Session storage for PostgreSQL (available but sessions not currently implemented)

### Third-Party Libraries
- **xlsx**: Server-side Excel file parsing for import functionality
- **date-fns**: Date manipulation and formatting with Korean locale support

### Replit-Specific
- **@replit/vite-plugin-runtime-error-modal**: Development error overlay
- **@replit/vite-plugin-cartographer**: Development tooling
- **@replit/vite-plugin-dev-banner**: Development environment indicator