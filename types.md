# Type Definitions

This document defines the core data types used throughout the Water Polo Fantasy application.

## Core Types

### User

```typescript
interface User {
  id: string;
  username: string;
  email: string;
  role: 'USER' | 'ADMIN';
  isActive: boolean;
  failedLoginAttempts: number;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### Team

```typescript
interface Team {
  id: string;
  name: string;
  userId: string;
  players: Player[];
  captain?: Player;
  scoreHistory: Record<string, number>; // matchdayId -> score
  createdAt: Date;
  updatedAt: Date;
}
```

### Player

```typescript
interface Player {
  id: string;
  name: string;
  position: PlayerPosition;
  club: Club;
  statsHistory: Record<string, PlayerStats>; // matchdayId -> stats
  scoreHistory: Record<string, number>; // matchdayId -> score
  createdAt: Date;
  updatedAt: Date;
}
```

### PlayerPosition

```typescript
type PlayerPosition = 'goalkeeper' | 'defender' | 'midfielder' | 'attacker';
```

### Club

```typescript
interface Club {
  id: string;
  name: string;
  players: Player[];
  createdAt: Date;
  updatedAt: Date;
}
```

### MatchDay

```typescript
interface MatchDay {
  id: string;
  title: string;
  multiplier: number;
  startTime?: Date;
  endTime?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### PlayerStats

```typescript
interface PlayerStats {
  id: string;
  playerId: string;
  matchdayId: string;
  
  // Offensive Stats
  goals: number;
  assists: number;
  shots: number;
  
  // Defensive Stats
  blocks: number;
  steals: number;
  saves: number; // Goalkeeper specific
  
  // Disciplinary Stats
  personalFouls: number;
  personalFoulsDrawn: number;
  contraFouls: number;
  brutality: number;
  
  // Possession Stats
  ballsLost: number;
  swimOffs: number;
  
  // Game Stats
  wins: number;
  
  createdAt: Date;
  updatedAt: Date;
}
```

### RosterHistory

```typescript
interface RosterHistory {
  id: string;
  teamId: string;
  matchdayId: string;
  playerId: string;
  isCaptain: boolean;
  createdAt: Date;
}
```

### UserSession

```typescript
interface UserSession {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}
```

### PasswordResetToken

```typescript
interface PasswordResetToken {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  used: boolean;
  createdAt: Date;
}
```

## API Response Types

### ApiResponse

```typescript
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  code?: string;
}
```

### PaginatedResponse

```typescript
interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

## Form Types

### LoginForm

```typescript
interface LoginForm {
  email: string;
  password: string;
}
```

### RegisterForm

```typescript
interface RegisterForm {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}
```

### TeamForm

```typescript
interface TeamForm {
  name: string;
  playerIds: string[];
  captainId?: string;
}
```

### PlayerForm

```typescript
interface PlayerForm {
  name: string;
  position: PlayerPosition;
  clubId: string;
}
```

### ClubForm

```typescript
interface ClubForm {
  name: string;
}
```

### MatchDayForm

```typescript
interface MatchDayForm {
  title: string;
  multiplier: number;
  startTime?: Date;
  endTime?: Date;
}
```

### StatsForm

```typescript
interface StatsForm {
  playerId: string;
  matchdayId: string;
  stats: Partial<PlayerStats>;
}
```

## Frontend-Specific Types

### Theme Types

```typescript
interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
}
```

### AuthContext Types

```typescript
interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (data: RegisterForm) => Promise<void>;
  isLoading: boolean;
}
```

### Navigation Types

```typescript
interface NavigationItem {
  label: string;
  path: string;
  icon?: React.ComponentType;
  adminOnly?: boolean;
}
```

## Utility Types

### Database Entity Base

```typescript
interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Timestamps

```typescript
interface Timestamps {
  createdAt: Date;
  updatedAt: Date;
}
```

### Audit Fields

```typescript
interface AuditFields extends Timestamps {
  createdBy?: string;
  updatedBy?: string;
}
```

## Validation Types

### Field Validation

```typescript
interface FieldValidation {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean | string;
}
```

### Form Validation

```typescript
interface FormValidation<T> {
  fields: Partial<Record<keyof T, FieldValidation>>;
  validate: (data: Partial<T>) => ValidationResult;
}
```

### Validation Result

```typescript
interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}
```

## Scoring Types

### PointsCalculation

```typescript
interface PointsCalculation {
  playerId: string;
  matchdayId: string;
  basePoints: number;
  multiplier: number;
  captainBonus: number;
  totalPoints: number;
  breakdown: PointsBreakdown;
}
```

### PointsBreakdown

```typescript
interface PointsBreakdown {
  goals: number;
  assists: number;
  blocks: number;
  steals: number;
  saves: number;
  personalFoulsDrawn: number;
  penalties: number; // Negative points from fouls, etc.
}
```

## Export Configuration

All types are exported from the shared package:

```typescript
// shared/src/types.ts
export type {
  User,
  Team,
  Player,
  PlayerPosition,
  Club,
  MatchDay,
  PlayerStats,
  RosterHistory,
  UserSession,
  PasswordResetToken,
  ApiResponse,
  PaginatedResponse,
  // ... other types
};
```

## Usage Examples

### Type Guards

```typescript
function isUser(obj: any): obj is User {
  return obj && 
    typeof obj.id === 'string' &&
    typeof obj.username === 'string' &&
    typeof obj.email === 'string' &&
    ['USER', 'ADMIN'].includes(obj.role);
}
```

### Type Assertions

```typescript
const userData = response.data as User;
```

### Generic Type Usage

```typescript
const apiCall = async <T>(endpoint: string): Promise<ApiResponse<T>> => {
  const response = await fetch(endpoint);
  return response.json();
};
```

## Notes

1. **Default Values**: All numeric stats default to 0 when not provided
2. **Nullable Fields**: Optional fields are marked with `?` or can be `null`
3. **Timestamps**: All entities include `createdAt` and `updatedAt` timestamps
4. **IDs**: All IDs are strings (UUIDs in production, auto-increment in development)
5. **Validation**: Client-side validation should match server-side constraints
