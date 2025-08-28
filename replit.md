# Overview

This is a text-to-speech application built with React/TypeScript frontend and Express.js backend that integrates with ElevenLabs API to generate audio from text. The application allows users to create multiple paragraphs with different voice settings, languages (English and Hindi), and voice controls like speed, pitch, stability, and silence intervals between paragraphs.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Components**: Shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: React hooks (useState, useEffect) for local component state
- **Data Fetching**: TanStack Query (React Query) for server state management and API calls
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation

## Backend Architecture
- **Framework**: Express.js with TypeScript
- **API Design**: RESTful API with centralized route registration
- **Middleware**: Custom logging middleware for API request tracking
- **Error Handling**: Centralized error handling middleware
- **Development**: Vite middleware integration for development server

## Data Storage Solutions
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Connection**: Neon Database serverless PostgreSQL
- **Schema Management**: Drizzle Kit for migrations and schema management
- **In-Memory Storage**: Fallback MemStorage implementation for development/testing
- **Session Storage**: Browser localStorage for API key persistence

## Authentication and Authorization
- **API Key Management**: Client-side storage of ElevenLabs API key in localStorage
- **Session Handling**: Basic session management with connect-pg-simple for PostgreSQL session store
- **User Schema**: Basic user table with username/password fields (currently unused in main flow)

## External Dependencies

### Third-Party Services
- **ElevenLabs API**: Primary text-to-speech service integration
  - Voice synthesis with configurable parameters (stability, similarity_boost, speed, pitch)
  - Support for multiple voice IDs and languages
  - Audio generation with silence interval support

### Database Services
- **Neon Database**: Serverless PostgreSQL hosting
- **Drizzle ORM**: Type-safe database toolkit with PostgreSQL dialect

### Frontend Libraries
- **Radix UI**: Headless component primitives for accessibility
- **Shadcn/ui**: Pre-built component library with consistent design system
- **TanStack Query**: Server state management and caching
- **Wouter**: Minimalist routing library
- **React Hook Form**: Form state management with validation
- **Zod**: Runtime type validation and schema parsing
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library

### Development Tools
- **Vite**: Build tool and development server
- **TypeScript**: Static type checking
- **ESLint**: Code linting and formatting
- **PostCSS**: CSS processing with Tailwind and Autoprefixer

### Replit Integration
- **Vite Plugins**: Replit-specific plugins for error overlay and cartographer
- **Development Banner**: Replit development environment detection