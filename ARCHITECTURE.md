# 🏗️ FitAI App Architecture

## Overview
This fitness AI application follows **Clean Architecture** principles with modern React Native best practices for 2025.

## 📁 Project Structure

```
fitai-app/
├── src/                          # Main source code
│   ├── domain/                   # Business logic layer
│   │   ├── entities/             # Business entities (User, Workout, Recipe)
│   │   ├── usecases/             # Application use cases
│   │   │   ├── auth/             # Authentication use cases
│   │   │   ├── workout/          # Workout-related use cases
│   │   │   ├── nutrition/        # Nutrition-related use cases
│   │   │   ├── ai-coaching/      # AI coaching use cases
│   │   │   └── progress/         # Progress tracking use cases
│   │   └── repositories/         # Repository interfaces
│   ├── infrastructure/           # External integrations
│   │   ├── api/                  # API clients and services
│   │   ├── storage/              # Data persistence
│   │   └── repositories/         # Repository implementations
│   ├── presentation/             # UI layer
│   │   ├── screens/              # Screen components
│   │   ├── components/           # Reusable UI components
│   │   └── hooks/                # Custom React hooks
│   └── shared/                   # Shared utilities
│       ├── types/                # TypeScript type definitions
│       ├── utils/                # Utility functions
│       ├── constants/            # App constants
│       └── stores/               # Global state stores
├── app/                          # Expo Router screens (existing)
├── constants/                    # App constants (existing)
├── __tests__/                    # Test files
├── jest-setup.ts                 # Jest test setup
├── TODO.md                       # Development progress tracking
└── ARCHITECTURE.md               # This file
```

## 🎯 Architecture Principles

### Clean Architecture Layers

1. **Domain Layer** (`/src/domain/`)
   - Contains business entities and rules
   - Independent of frameworks and external systems
   - Defines interfaces for external dependencies

2. **Infrastructure Layer** (`/src/infrastructure/`)
   - Implements external integrations (APIs, databases)
   - Concrete implementations of domain interfaces
   - Framework-specific code

3. **Presentation Layer** (`/src/presentation/`)
   - UI components and screens
   - React Native specific code
   - State management and user interactions

4. **Shared Layer** (`/src/shared/`)
   - Common utilities and types
   - Cross-cutting concerns
   - Reusable code across layers

### Dependency Flow
```
Presentation → Infrastructure → Domain
```
- Presentation layer depends on Domain interfaces
- Infrastructure layer implements Domain interfaces
- Domain layer has no dependencies on other layers

## 🛠️ Technology Stack

### Core Framework
- **React Native**: 0.79.5
- **Expo**: ~53.0.20
- **TypeScript**: ~5.8.3 (strict mode)

### State Management
- **Zustand**: Global state management
- **Immer**: Immutable state updates
- **TanStack React Query**: Server state and caching

### Form & Validation
- **React Hook Form**: Form management
- **Zod**: Schema validation

### Testing
- **Jest**: Test runner
- **React Native Testing Library**: Component testing

### Performance
- **FlashList**: Optimized list rendering
- **React Native Reanimated**: Smooth animations

### Internationalization
- **i18next**: Multi-language support (5 languages)
- **react-i18next**: React integration

## 🔄 Data Flow

### State Management Strategy
```
Component → Custom Hook → Zustand Store → Repository → API/Storage
```

### Error Handling Pattern
```typescript
// Result pattern for error handling
type Result<T, E = Error> = Success<T> | Failure<E>;

// Usage in use cases
async function getUserProfile(id: string): Promise<Result<User, UserError>> {
  try {
    const user = await userRepository.findById(id);
    return new Success(user);
  } catch (error) {
    return new Failure(new UserNotFoundError(id));
  }
}
```

## 📱 Screen Flow (Romanian Mermaid Architecture)

```
Language Selection → Onboarding → Main App
                                      ├── HomeScreen (Ecran Principal)
                                      ├── AI Coach Chat
                                      ├── Workout Plans (Plan Antrenamente)
                                      ├── Meal Plans (Plan Mese)
                                      ├── Progress (Vezi Progres)
                                      └── Settings (Setari)
```

## 🧪 Testing Strategy

### Test Structure
```
__tests__/
├── domain/           # Business logic tests
├── infrastructure/   # Integration tests
└── presentation/     # Component tests
```

### Test Types
- **Unit Tests**: Domain entities and use cases
- **Integration Tests**: Repository implementations
- **Component Tests**: UI components and screens

### Coverage Requirements
- Branches: 80%
- Functions: 80%
- Lines: 80%
- Statements: 80%

## 🚀 Development Scripts

```bash
# Development
npm start                 # Start Expo development server
npm run android          # Run on Android
npm run ios              # Run on iOS

# Testing
npm test                 # Run tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Run tests with coverage

# Quality
npm run type-check       # TypeScript type checking
npm run lint            # ESLint checking
```

## 📋 Next Steps

See [TODO.md](./TODO.md) for detailed development progress and upcoming tasks.

### Immediate Next Steps (Week 1):
1. Create domain entities (User, Workout, Recipe, Progress)
2. Implement basic use cases
3. Set up state management stores
4. Write first domain tests

### Upcoming Features (Week 2):
1. Enhanced onboarding flow
2. Main app navigation
3. UI component library
4. AI service integration

---

**Last Updated**: 2025-08-02  
**Architecture Version**: 1.0