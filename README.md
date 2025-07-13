# Water Polo Fantasy League

A comprehensive fantasy sports management application for water polo leagues, built with modern web technologies.

## Setup and quickstart

Look at 

## 🏆 Overview

The Water Polo Fantasy League is a full-stack web application that allows users to create and manage fantasy water polo teams. Users can draft players, track statistics, and compete in leagues with friends and colleagues.

## ✨ Features

### Core Functionality
- **Team Management**: Create and manage fantasy teams with player drafting
- **Player Statistics**: Track comprehensive water polo statistics
- **Match Day Management**: Schedule matches with automatic roster locking
- **Points Calculation**: Automated scoring based on player performance
- **League Management**: Multi-user leagues with rankings and history

### User Experience
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Dark/Light Theme**: Customizable theme with water polo-inspired colors
- **Real-time Updates**: Live score updates and roster changes
- **Admin Panel**: Complete content management for administrators

### Security & Performance
- **JWT Authentication**: Secure user authentication with role-based access
- **Rate Limiting**: Protection against abuse and spam
- **Database Migrations**: Robust schema management and versioning
- **Comprehensive Testing**: Unit, integration, and end-to-end tests

## 🚀 Technology Stack

### Frontend
- **React 18** with TypeScript for type safety
- **Material-UI (MUI)** for consistent, beautiful UI components
- **React Router** for client-side routing
- **RTK Query** for efficient state management and API calls
- **Vite** for lightning-fast development and building

### Backend
- **Node.js** with Express for robust API development
- **TypeScript** for type safety across the entire stack
- **PostgreSQL** with proper migrations for reliable data storage
- **JWT** for secure authentication and authorization
- **Jest** for comprehensive testing

### Development Tools
- **ESLint + Prettier** for code quality and consistency
- **Husky** for git hooks and pre-commit checks

## 📖 Documentation

Comprehensive documentation is available in the `/documentation` folder:

- **[Development Setup](documentation/development/setup.md)** - Complete development environment setup
- **[API Documentation](documentation/api/README.md)** - REST API endpoints and usage
- **[Database Guide](documentation/database/setup.md)** - Database schema and migrations
- **[Frontend Guide](documentation/frontend/README.md)** - React components and architecture
- **[Type Definitions](documentation/types/README.md)** - TypeScript type definitions

## 🛠️ Quick Start

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- npm 

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd wp-fantasy
   ```

2. **Install dependencies**
   ```bash
   npm
   husky
   postgres
   make
   ```

3. **Set up the database**
   ```bash
   
   # Start db service
   
   # Create database
   createdb wpfantasy
   
   # Run migrations
   cd backend
   npm run migrate:up
   ```

4. **Configure environment variables**
   ```bash
   # Backend
   cp backend/.env.example backend/.env
   
   # Frontend is configured
   ```

5. **Start development servers**
   ```bash
   backend & frontend: npm run dev
   ```
6. **Build versions**
   ```bash
   # this will build the production versions
   make build
   ```

The application will be available at:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5050`

## 🎯 Key Features Implemented

### ✅ Authentication System
- Secure user registration and login
- JWT-based authentication with refresh tokens
- Role-based access control (USER/ADMIN)
- Password reset functionality
- Account lockout protection

### ✅ Team Management
- Create and customize fantasy teams
- Player drafting with position requirements
- Captain selection with bonus points
- Team roster history tracking

### ✅ Match Day System
- Schedule matches with start/end times
- Automatic roster locking when matches begin
- Real-time score calculation
- Historical match data preservation

### ✅ Player & Club Management
- Comprehensive player database
- Club affiliations and transfers
- Statistical tracking across multiple categories
- Admin-only content management

### ✅ Roster History
- Automatic roster snapshotting
- Historical team compositions
- Captain tracking per match day
- Data integrity preservation

## 📊 Database Schema

The application uses PostgreSQL with a well-designed schema:

```
users ──┐
        │
        └──► teams ──┐
                     │
                     └──► roster_history ──┐
                                           │
players ──┐                               │
          │                               │
          └──► player_stats               │
          │                               │
          └──────────────────────────────┘
          │
clubs ────┘

matchdays ──┐
            │
            └──► player_stats
            │
            └──► roster_history
```

## 🚢 Deployment

###
```bash
make build
make run to test
```
