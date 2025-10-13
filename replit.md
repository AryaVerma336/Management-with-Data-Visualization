# StoreFlow - Inventory Management System

## Overview

StoreFlow is a modern inventory management system built as a full-stack web application. The system provides real-time inventory tracking, analytics dashboards, and multi-language support for managing product catalogs. It features a clean, dark-mode-first interface inspired by modern SaaS tools like Linear and Vercel Dashboard, emphasizing clarity and data readability for business users.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Routing**
- React 18 with TypeScript for type-safe component development
- Wouter for lightweight client-side routing (Dashboard, Inventory, Analytics pages)
- Vite as the build tool and development server with HMR support

**UI Component System**
- shadcn/ui components built on Radix UI primitives for accessible, customizable components
- Tailwind CSS for utility-first styling with custom design tokens
- Class Variance Authority (CVA) for type-safe component variants
- Custom theme system supporting dark/light modes with CSS variables

**State Management & Data Fetching**
- TanStack Query (React Query) for server state management, caching, and synchronization
- React Hook Form with Zod validation for type-safe form handling
- Local component state using React hooks

**Internationalization**
- i18next with react-i18next for multi-language support (English, Spanish, French, Chinese)
- Browser language detection with persistent language preferences

**Data Visualization**
- Recharts library for rendering charts (bar charts, line charts, pie charts)
- Custom chart color palette integrated with the theme system

### Backend Architecture

**Server Framework**
- Express.js on Node.js for the HTTP server and API routing
- TypeScript throughout for end-to-end type safety
- ESM module system for modern JavaScript

**API Design**
- RESTful API endpoints under `/api` prefix
- JSON request/response format
- CRUD operations for products resource
- Request/response logging middleware for debugging

**Database & ORM**
- PostgreSQL as the primary database
- Drizzle ORM for type-safe database queries and migrations
- Neon Database serverless driver for PostgreSQL connections
- Schema-first design with Drizzle Kit for migrations

**Data Validation**
- Zod schemas for runtime validation
- Shared schema definitions between client and server via `shared/schema.ts`
- drizzle-zod integration for automatic schema generation from database models

**Storage Layer**
- In-memory storage implementation (`MemStorage`) for development/testing
- Interface-based storage design (`IStorage`) allowing easy swapping of implementations
- Seeded sample data for development environment

### Database Schema

**Products Table**
- UUID primary key with auto-generation
- Required fields: name, SKU (unique), category, price (decimal), stock (integer)
- Optional: description
- Inventory thresholds: minStock for low-stock alerts
- Stock status calculated dynamically (healthy/low/out of stock)

**Users Table**
- UUID primary key with auto-generation
- Username (unique) and password fields
- Foundation for future authentication implementation

### Design System

**Color Palette**
- Dark mode as primary theme (220° hue base for backgrounds)
- Semantic color tokens for status indicators:
  - Success/In Stock: Green (142° 71% 45%)
  - Warning/Low Stock: Amber (38° 92% 50%)
  - Danger/Out of Stock: Red (0° 84% 60%)
  - Primary Brand: Blue (217° 91% 60%)
- Chart-specific color palette (5 colors) for data visualization

**Typography**
- Primary: Inter font family via Google Fonts
- Monospace: JetBrains Mono for numerical data and SKUs
- Hierarchical scale from page titles (3xl) to metadata (xs)

**Component Patterns**
- Elevated surfaces with subtle hover/active states
- Consistent border radius (9px large, 6px medium, 3px small)
- Shadow system for depth and hierarchy
- Responsive layout with mobile breakpoint at 768px

### Build & Deployment

**Development**
- `npm run dev` starts both Vite dev server and Express backend
- Hot module replacement for frontend changes
- tsx for running TypeScript server code without compilation

**Production Build**
- `npm run build` compiles frontend with Vite and bundles backend with esbuild
- Static assets served from `dist/public`
- Backend served from `dist/index.js`
- Platform-specific Node.js bundling with external packages

**Database Management**
- `npm run db:push` syncs schema changes to database via Drizzle Kit
- Migration files stored in `migrations/` directory

## External Dependencies

### Core Libraries
- **@tanstack/react-query**: Server state management and caching
- **react-hook-form + @hookform/resolvers**: Form handling with validation
- **zod**: Runtime type validation and schema definition
- **drizzle-orm + drizzle-zod**: Type-safe ORM with schema validation

### Database
- **@neondatabase/serverless**: PostgreSQL serverless driver
- **PostgreSQL**: Primary database (connection via DATABASE_URL environment variable)

### UI Component Libraries
- **@radix-ui/***: 20+ accessible component primitives (dialogs, dropdowns, tooltips, etc.)
- **lucide-react**: Icon library
- **recharts**: Charting and data visualization
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Type-safe component variants
- **cmdk**: Command palette component

### Internationalization
- **i18next**: Core i18n framework
- **react-i18next**: React bindings for i18next
- **i18next-browser-languagedetector**: Automatic language detection

### Development Tools
- **vite**: Frontend build tool and dev server
- **@vitejs/plugin-react**: React support for Vite
- **typescript**: Type checking and compilation
- **esbuild**: Fast backend bundling
- **tsx**: TypeScript execution for development

### Replit-Specific
- **@replit/vite-plugin-runtime-error-modal**: Error overlay for development
- **@replit/vite-plugin-cartographer**: Replit IDE integration
- **@replit/vite-plugin-dev-banner**: Development environment indicator