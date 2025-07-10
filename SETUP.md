# Water Polo Fantasy League - Development Guide

This guide covers everything needed to set up, develop, test, and deploy the Water Polo Fantasy League application.

## Prerequisites

Before starting development, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** (v9 or higher)
- **PostgreSQL** (v12 or higher)
- **Git**

## Project Structure

```
wp-fantasy/
├── backend/              # Node.js API
│   ├── src/
│   │   ├── controllers/  # Request handlers
│   │   ├── services/     # Business logic
│   │   ├── routes/       # API routes
│   │   ├── middleware/   # Custom middleware
│   │   └── __tests__/    # Test files
│   └── migrations/       # Database migrations
├── frontend/             # React application
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── api/          # API layer
│   │   ├── contexts/     # React contexts
│   │   └── theme/        # Material-UI theme
│   └── public/           # Static assets
├── shared/               # Shared types and utilities
│   └── src/
│       └── types.ts      # TypeScript definitions
└── documentation/        # Project documentation
    ├── api/              # API documentation
    ├── database/         # Database documentation
    ├── frontend/         # Frontend documentation
    └── development/      # Development guides
```

## Technology Stack

### Backend
- **Node.js + Express**: Web framework
- **TypeScript**: Type safety
- **PostgreSQL**: Database
- **JWT**: Authentication
- **Jest**: Testing framework
- **ESLint + Prettier**: Code quality

### Frontend
- **React 18**: UI library
- **TypeScript**: Type safety
- **Material-UI**: Component library
- **React Router**: Navigation
- **RTK Query**: State management
- **Vite**: Build tool

### Development Tools
- **Make**: Build automation
- **Git**: Version control
- **VS Code**: Recommended editor

## Initial Setup

(install homebrew, npm, make and all other dependencies)

### 1. Clone the Repository

```bash
git clone <repository-url>
cd wp-fantasy
```

### 2. Install Dependencies

```bash
# Install all dependencies (recommended)

# Or install individually
cd backend && npm install
cd ../frontend && npm install
cd ../shared && npm install
```

### 3. Environment Configuration

#### Backend Environment

Create `.env` file in the backend directory, look at `.env.example`:

```bash
cp backend/.env.example backend/.env
```

Edit the `.env` file with your database credentials and other configuration.

### 4. Database Setup

See [Database Setup Guide](../database/setup.md) for detailed instructions.



**Get the data base to your LOCAL – macOS with Homebrew:**
```bash
brew install postgresql
brew services start postgresql
```

Install and configure local database (or alternatively connect to a remote one):

```bash
# Create database and user
psql postgres
CREATE DATABASE wpfantasy;
CREATE USER wpfantasy_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE wpfantasy TO wpfantasy_user;
\q

# Run migrations
cd backend
npm run migrate:up
```

### 5. Start Development

```bash

# Or start individually
cd backend && npm run dev
cd frontend && npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5050

### 6. Build version

for the build / prod equivalent version:

```bash

make buildRun

```

Then the app (frontend and backend) is available at http://localhost:5050