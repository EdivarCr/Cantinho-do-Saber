# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added - Database & Backend

- **Database Seed Script** (`packages/database/prisma/seed.ts`)
  - Comprehensive seed with realistic Brazilian data
  - 1 Admin user (admin@cantinho.com / Admin@123)
  - 3 Teachers with associated users (password: Professor@123)
  - 3 Classes with different shifts and grades
  - 10 Students distributed across classes with guardians and addresses
  - 3 Guardians with contact information
  - 6 Addresses (some shared between students and guardians)
  - 5 Lessons from the last 7 days
  - 20 Attendance records (60% PRESENTE, 30% AUSENTE, 10% JUSTIFICADO)

- **Backend Endpoints**
  - `GET /classes` - List all classes
  - `GET /lessons` - List all lessons
  - `GET /classes/:classId/lessons` - List lessons by class
  - Added `findAll()` methods to Class and Lesson repositories

- **Use Cases**
  - `FindAllClassesUseCase` - Retrieve all classes
  - `FindAllLessonsUseCase` - Retrieve all lessons

- **Controllers**
  - `FindAllClassesController` - Handle GET /classes
  - `FindAllLessonsController` - Handle GET /lessons
  - `FindLessonsByClassController` - Handle GET /classes/:classId/lessons

### Added - Frontend Services

- **Real API Services** (replacing localStorage mocks)
  - `students.ts` - Student management API calls
  - `teachers.ts` - Teacher management API calls
  - `classes.ts` - Class management API calls
  - `lessons.ts` - Lesson management API calls
  - `attendance.ts` - Attendance management API calls
  - `users.ts` - User management API calls
  - `index.ts` - Barrel export for all services

### Added - Reusable UI Components

- **Common Components** (`apps/web/src/renderer/components/common/`)
  - `LoadingSpinner` - Animated loading indicator with size variants
  - `ErrorMessage` - Error display with optional retry button
  - `EmptyState` - Empty state placeholder with customizable icon and action
  - `ConfirmDialog` - Confirmation modal for destructive actions
  - `ErrorBoundary` - React error boundary for graceful error handling (✨ NEW)
  - CSS Modules for all components

### Changed

- **Environment Configuration**
  - Updated `apps/server/.env.example` with complete configuration including JWT keys, SMTP settings
  - Updated `apps/web/.env.example` with correct API URL and port

- **Database Package**
  - Added `seed`, `reset` scripts to `packages/database/package.json`
  - Added dependencies: `tsx`, `bcrypt`, `ulid`, `@types/node`

- **API Service**
  - Enhanced `apps/web/src/renderer/services/api.ts` with:
    - Better error handling and logging
    - Auto logout on 401 (expired session)
    - Network error detection
    - Request/response logging in development mode
    - 10-second timeout

- **App.tsx** ✨ NEW
  - Wrapped entire application with ErrorBoundary component
  - Provides graceful error recovery for the entire app
  - Shows user-friendly error messages
  - Includes retry functionality

### Improved

- **Error Handling**
  - Centralized error messages
  - Automatic token refresh on expiration
  - User-friendly error messages in Portuguese

- **Developer Experience**
  - Better console logging with emojis (🔵 requests, ✅ success, ❌ errors)
  - Type-safe API service functions with JSDoc comments
  - Consistent service layer pattern across all resources

### Documentation

- **API.md** - Complete API documentation with:
  - All endpoints categorized by resource
  - Request/response examples
  - Authentication requirements
  - Enum values and constraints
  - Error response formats

- **README.md** - Enhanced with:
  - 🗄️ Database configuration guide
  - 🚀 How to run the project
  - 🔑 Test credentials (seed data)
  - 📁 Detailed project structure
  - 🛠️ Complete tech stack
  - 📚 Implemented features list

### Fixed

- Corrected API base URL inconsistencies
- Fixed authentication token handling in axios interceptors
- Removed hardcoded mock data initialization

### Removed

- Eliminated localStorage-based mock data pattern (to be fully removed in next phase)
- Cleaned up obsolete TODO comments

---

## [0.1.0] - Initial Setup

### Added
- Monorepo structure with PNPM and Turborepo
- Backend application with Express, Prisma, TypeScript
- Frontend application with React, Vite, TypeScript, Electron
- Prisma schema with all models (User, Profile, Student, Teacher, Class, Lesson, Attendance, Guardian, Address, etc.)
- Authentication with Passport.js and JWT
- CRUD operations for core resources
- Basic frontend pages and components
- Routing with React Router

### Infrastructure
- ESLint and Prettier configuration
- TypeScript strict mode
- Git repository structure
- Environment variable templates
