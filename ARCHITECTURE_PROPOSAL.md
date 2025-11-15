# Educational Maze Game - Architecture Proposal

## Executive Summary

Since we're building from scratch, I propose a **modern, modular web-based architecture** using React for the frontend with a clean separation of concerns. This will give us maximum flexibility, maintainability, and the ability to scale features incrementally.

---

## 1. Technology Stack Recommendation

### Frontend Framework & UI
- **React 18** - Component-based architecture perfect for complex UI states
- **TypeScript** - Type safety for large codebase, better IDE support
- **Vite** - Fast development server and optimized builds
- **Tailwind CSS** - Utility-first styling for rapid UI development
- **Framer Motion** - Smooth animations and transitions

### Game Rendering
- **HTML5 Canvas** - Direct 2D rendering for maze and player
- **Pixi.js** (if needed) - Performance optimization for complex particle effects
- Rendering layer will be abstracted so we can swap if needed

### State Management
- **Zustand** - Lightweight, simple global state (better than Redux for our use case)
- React Context for localized component state
- Custom hooks for game logic encapsulation

### Storage & Persistence
- **IndexedDB** (via Dexie.js) - Large storage for:
  - Cached lessons and quizzes
  - Player progress data
  - Analytics metrics
  - Content versioning
- **localStorage** - Simple settings and preferences

### Backend & Sync (Phase 10)
- **Firebase** or **Supabase** - For account system and sync:
  - Authentication (email, Google, guest mode)
  - Firestore/Postgres for cloud saves
  - Real-time sync capabilities
  - Hosting included
- Alternative: Custom Node.js backend if needed

### Content Generation
- **Claude API** or **OpenAI API** - AI-generated educational content
- Pre-generated fallback content stored as JSON
- Content validation pipeline before caching

### Testing & Quality
- **Vitest** - Fast unit testing
- **React Testing Library** - Component testing
- **Playwright** - E2E testing for critical flows
- **ESLint + Prettier** - Code quality and formatting

### Build & Deployment
- **Vite** for production builds
- **Vercel** or **Netlify** for deployment (free tier available)
- GitHub Actions for CI/CD (if needed)

---

## 2. System Architecture

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     PRESENTATION LAYER                       │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │    Game     │  │     Quiz     │  │    Analytics     │   │
│  │   Screen    │  │    Modals    │  │    Dashboard     │   │
│  └─────────────┘  └──────────────┘  └──────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                      STATE MANAGEMENT                        │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐   │
│  │  Game State  │  │  User State  │  │  Content State  │   │
│  │ (Zustand)    │  │  (Zustand)   │  │   (Zustand)     │   │
│  └──────────────┘  └──────────────┘  └─────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                       SERVICE LAYER                          │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐   │
│  │   Maze Gen   │  │   Content    │  │   Analytics     │   │
│  │   Service    │  │   Service    │  │    Service      │   │
│  └──────────────┘  └──────────────┘  └─────────────────┘   │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐   │
│  │   Storage    │  │     Auth     │  │    Validation   │   │
│  │   Service    │  │   Service    │  │     Service     │   │
│  └──────────────┘  └──────────────┘  └─────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                       DATA LAYER                             │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐   │
│  │  IndexedDB   │  │  localStorage │  │  Firebase/API   │   │
│  │  (Dexie)     │  │              │  │   (Phase 10)    │   │
│  └──────────────┘  └──────────────┘  └─────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Component Architecture

```
src/
├── components/           # Reusable UI components
│   ├── game/
│   │   ├── MazeCanvas.tsx       # Main game canvas
│   │   ├── PlayerAvatar.tsx     # Player rendering
│   │   ├── FogOverlay.tsx       # Fog-of-war layer
│   │   ├── PathTrail.tsx        # Path memory visualization
│   │   └── QuizTile.tsx         # Quiz tile marker
│   ├── ui/
│   │   ├── HUD.tsx              # Heads-up display
│   │   ├── MiniMap.tsx          # Mini-map component
│   │   ├── Modal.tsx            # Base modal component
│   │   ├── Button.tsx           # Styled button
│   │   └── ProgressBar.tsx      # Progress indicator
│   ├── modals/
│   │   ├── LessonModal.tsx      # Lesson presentation
│   │   ├── QuizModal.tsx        # Quiz interaction
│   │   ├── SummaryModal.tsx     # Level summary
│   │   └── SettingsModal.tsx    # Settings panel
│   └── quiz/
│       ├── MultipleChoice.tsx   # MC question type
│       ├── ShortAnswer.tsx      # Short answer type
│       └── TrueFalse.tsx        # T/F question type
├── screens/              # Full-page screens
│   ├── SplashScreen.tsx
│   ├── TutorialScreen.tsx
│   ├── GameScreen.tsx
│   ├── AnalyticsScreen.tsx
│   └── SettingsScreen.tsx
├── services/             # Business logic services
│   ├── mazeGenerator.ts         # Maze generation algorithm
│   ├── contentService.ts        # Content generation & caching
│   ├── validationService.ts     # Content validation
│   ├── storageService.ts        # IndexedDB operations
│   ├── analyticsService.ts      # Metrics tracking
│   ├── authService.ts           # Authentication (Phase 10)
│   └── syncService.ts           # Cloud sync (Phase 10)
├── stores/               # Zustand stores
│   ├── gameStore.ts             # Game state (position, score, etc.)
│   ├── userStore.ts             # User progress & settings
│   ├── contentStore.ts          # Lessons & quizzes cache
│   └── analyticsStore.ts        # Metrics data
├── hooks/                # Custom React hooks
│   ├── useGameLoop.ts           # Game update loop
│   ├── useInputHandler.ts       # Keyboard/touch input
│   ├── useFogOfWar.ts           # Fog revelation logic
│   ├── usePathMemory.ts         # Path tracking
│   └── useAdaptiveDifficulty.ts # Difficulty adjustment
├── utils/                # Utility functions
│   ├── constants.ts             # Game constants
│   ├── pathfinding.ts           # A* for maze solving
│   ├── scoreCalculator.ts       # Score formulas
│   └── validators.ts            # Input validators
├── types/                # TypeScript types
│   ├── game.types.ts
│   ├── content.types.ts
│   ├── user.types.ts
│   └── analytics.types.ts
├── assets/               # Static assets
│   ├── images/
│   ├── sounds/
│   └── fonts/
├── data/                 # Fallback content
│   ├── defaultLessons.json
│   ├── defaultQuizzes.json
│   └── sampleCurriculum.json
├── styles/               # Global styles
│   └── globals.css
├── App.tsx               # Root component
└── main.tsx              # Entry point
```

---

## 3. Data Models

### Level Blueprint
```typescript
interface LevelBlueprint {
  id: string;
  levelNumber: number;
  topic: string;
  complexityScore: number;
  mazeSize: { width: number; height: number };
  questionTileCount: number;
  requiredCorrectAnswers: number;
  lessonId: string;
  questionIds: string[];
}
```

### Lesson
```typescript
interface Lesson {
  id: string;
  title: string;
  body: string;           // Rich text/markdown
  summary: string;
  keywords: string[];
  estimatedReadingMinutes: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  topic: string;
  createdAt: number;
  version: number;
}
```

### Question
```typescript
interface Question {
  id: string;
  type: 'multiple_choice' | 'short_answer' | 'true_false';
  prompt: string;
  options?: string[];      // For multiple choice
  correctAnswer: string | number;
  hint: string;
  explanation: string;
  difficulty: number;      // 1-5
  topic: string;
  estimatedTimeSeconds: number;
}
```

### User Progress
```typescript
interface UserProgress {
  userId: string;
  currentLevel: number;
  totalScore: number;
  lives: number;
  levelsCompleted: number[];
  visitedTiles: Record<string, Coordinate[]>;  // levelId -> coordinates
  answeredQuestions: AnsweredQuestion[];
  metrics: PlayerMetrics;
  settings: UserSettings;
  lastSyncedAt?: number;
  createdAt: number;
  updatedAt: number;
}

interface AnsweredQuestion {
  questionId: string;
  levelId: string;
  correct: boolean;
  attempts: number;
  timeSpentSeconds: number;
  timestamp: number;
  hintsUsed: number;
}

interface PlayerMetrics {
  totalPlayTime: number;
  accuracyByTopic: Record<string, number>;
  averageTimePerQuestion: number;
  hintUsageFrequency: number;
  learningStreak: number;
}
```

### Game State
```typescript
interface GameState {
  currentLevelId: string;
  playerPosition: Coordinate;
  revealedTiles: Set<string>;    // Set of "x,y" strings
  visitedPath: Coordinate[];
  collectedKeys: number;
  currentScore: number;
  lives: number;
  isPaused: boolean;
  activeQuiz: Question | null;
  fogOpacity: Record<string, number>;  // "x,y" -> opacity
}
```

---

## 4. Core Systems Design

### 4.1 Maze Generation System

**Algorithm**: Recursive Backtracking with guarantees
- Generate perfect maze (one solution path)
- Ensure start-to-goal connectivity
- Place quiz tiles along path and dead-ends
- Validate minimum path length

**Tile Types**:
- `WALL` - Impassable
- `PATH` - Walkable
- `QUIZ` - Triggers question
- `START` - Entry point
- `GOAL` - Exit door (locked initially)
- `DECORATIVE` - Visual interest only

### 4.2 Fog-of-War System

**Implementation**:
- Canvas overlay with alpha channel
- Circular revelation pattern (radius = 3 tiles)
- Decay formula: `opacity = min(1.0, currentOpacity + 0.1 * deltaTime)`
- Store fog state per tile in game state
- Re-apply fog on revisit (partial transparency)

**Performance Optimization**:
- Only update fog for tiles within render viewport
- Use dirty rectangle tracking
- Batch canvas updates

### 4.3 Path Memory System

**Implementation**:
- Array of coordinates in visit order
- Render as colored trail (rgba with alpha)
- Persist to IndexedDB on level exit
- Load and display on level re-entry
- Option to toggle visibility in settings

**Visual Style**:
- Primary path: blue trail, 50% opacity
- Recent steps: brighter, fade over time
- Line thickness: 3px

### 4.4 Quiz System

**Flow**:
1. Player steps on quiz tile → trigger event
2. Pause game loop, lock player movement
3. Display quiz modal with question
4. Player submits answer
5. Validate answer, show feedback animation
6. Award/deduct based on correctness
7. Display explanation
8. Update tile visual state
9. Resume game loop

**Question Type UI**:
- **Multiple Choice**: Radio buttons, submit button, hint button
- **Short Answer**: Text input, character limit, submit button
- **True/False**: Two large buttons (green/red on hover)

### 4.5 Content Generation System

**Pipeline**:
```
Topic + Complexity → AI API → Validation → Cache → Delivery
                         ↓
                    (if fails)
                         ↓
                  Fallback Content
```

**Validation Checks**:
- All required fields present
- Correct answer is valid
- Options are distinct (for MC)
- No inappropriate content (keyword filter)
- Difficulty matches requested level

**Caching Strategy**:
- Key: `{topic}_{levelId}_{contentType}`
- TTL: 30 days (configurable)
- Versioned content (increment on updates)
- LRU eviction if storage quota exceeded

### 4.6 Scoring System

**Formula**:
```
Base Points = 100 * difficulty
Time Bonus = max(0, 50 - timeSpentSeconds)
Attempt Penalty = (attempts - 1) * -25
Hint Penalty = hintsUsed * -10

Total = Base Points + Time Bonus + Attempt Penalty + Hint Penalty
```

**Lives System**:
- Start with 5 lives per level cluster
- -1 life per incorrect answer
- Game over at 0 lives (option to retry cluster)
- Lives reset on new cluster

**Gating**:
- Each correct answer = 1 key
- Door requires N keys (defined in blueprint)
- Keys shared across cluster (cumulative)

---

## 5. Adaptive Learning System

### Difficulty Adjustment Algorithm

```
For each topic T:
  accuracy[T] = correct_answers[T] / total_answers[T]
  
  if accuracy[T] > 0.8:
    next_difficulty[T] = current_difficulty[T] + 1
  elif accuracy[T] < 0.5:
    next_difficulty[T] = max(1, current_difficulty[T] - 1)
    trigger_remediation[T] = true
  else:
    next_difficulty[T] = current_difficulty[T]
```

### Remediation Triggers
- 3+ consecutive wrong answers on same topic → show mini-lesson
- Average time > 2x expected → provide scaffolding hints
- Pattern of same wrong answer → adjust distractors

---

## 6. Performance Budget & Optimization

### Targets
- **FPS**: 60 (minimum 30 on low-end devices)
- **Initial Load**: < 3 seconds
- **Level Load**: < 1 second
- **Memory**: < 200MB

### Optimization Strategies
1. **Lazy Loading**: Load screens and assets on-demand
2. **Code Splitting**: Separate bundles per phase
3. **Canvas Optimization**: Dirty rectangle rendering
4. **Particle Pooling**: Reuse particle objects
5. **Asset Compression**: WebP images, compressed audio
6. **Debounce Input**: 16ms throttle on movement
7. **IndexedDB Batching**: Batch writes every 5 seconds

---

## 7. Accessibility Implementation

### Features
- **Keyboard Navigation**: Tab order, arrow keys for movement
- **Screen Reader**: ARIA labels, semantic HTML
- **Text Scaling**: 4 sizes (small to extra-large)
- **Color Blind Modes**: Deuteranopia, Protanopia, Tritanopia palettes
- **High Contrast**: Black/white mode
- **Reduced Motion**: Disable animations if preferred
- **Focus Indicators**: Clear outlines on all interactive elements

### Testing
- WAVE browser extension
- axe DevTools
- Manual keyboard-only testing
- Screen reader testing (NVDA)

---

## 8. Development Phases & Timeline Estimate

### Phase 1: Foundation (Days 1-3)
- Project setup (Vite + React + TypeScript)
- Base component structure
- Canvas rendering setup
- Basic maze generation
- Player movement

### Phase 2: Core Mechanics (Days 4-7)
- Fog-of-war system
- Path memory
- Quiz tile triggering
- Modal system
- Input handling

### Phase 3: Educational Content (Days 8-12)
- Lesson system
- All question types
- Content service
- Validation pipeline
- Caching (IndexedDB)

### Phase 4: Progression (Days 13-16)
- Scoring system
- Lives & gating
- Save/load system
- Backtracking
- Level clustering

### Phase 5: Content Generation (Days 17-19)
- AI API integration
- Validation rules
- Fallback system
- Sample curriculum

### Phase 6: UI/UX Polish (Days 20-24)
- HUD implementation
- Mini-map
- Visual theme
- Animations
- Particle effects
- Sound system

### Phase 7: Analytics (Days 25-27)
- Metrics collection
- Study reports
- Adaptive difficulty
- Analytics dashboard

### Phase 8: Accessibility (Days 28-29)
- All accessibility features
- Onboarding tutorial
- Feedback system

### Phase 9: Account & Sync (Days 30-32)
- Firebase/Supabase setup
- Authentication
- Cloud sync
- Data management

### Phase 10: Optimization (Days 33-35)
- Performance profiling
- Error handling
- Offline mode
- Edge case testing

### Phase 11: Testing & QA (Days 36-40)
- Comprehensive testing
- Bug fixing
- Cross-browser testing
- Performance testing

### Phase 12: Launch Prep (Days 41-42)
- Documentation
- Product assets
- Deployment setup

**Total Estimate**: ~40-45 days of focused development

---

## 9. Budget Allocation Strategy

With ~40,500 Cline credits available:

- **Phases 1-4 (Core)**: 15,000 credits (37%) - Foundation and mechanics
- **Phases 5-6 (Content & UI)**: 12,000 credits (30%) - Polish and content
- **Phases 7-9 (Advanced)**: 8,000 credits (20%) - Analytics, accessibility, accounts
- **Phases 10-12 (Finish)**: 3,500 credits (8%) - Testing, optimization, docs
- **Buffer**: 2,000 credits (5%) - Unexpected issues

### If Budget Runs Low
Priority order:
1. Core gameplay (Phases 1-4) - Essential
2. Basic UI (simplified Phase 6) - Essential
3. Content generation (Phase 5) - Can use pre-generated JSON
4. Analytics (Phase 7) - Can be simplified
5. Account sync (Phase 9) - Can defer to post-launch
6. Advanced features - Nice-to-have

---

## 10. Risk Mitigation

### Technical Risks
- **Risk**: Performance issues with fog rendering
  - **Mitigation**: Pixi.js fallback, optimize early
  
- **Risk**: Content generation API costs/limits
  - **Mitigation**: Pre-generate content, aggressive caching
  
- **Risk**: IndexedDB browser compatibility
  - **Mitigation**: localStorage fallback for basic features

### Scope Risks
- **Risk**: Feature creep beyond budget
  - **Mitigation**: Strict MVP definition, phase-based delivery
  
- **Risk**: Complex adaptivity takes longer than expected
  - **Mitigation**: Start with simple rules, enhance iteratively

---

## 11. Success Metrics

### Technical Metrics
- ✅ 60 FPS on desktop, 30 FPS on mobile
- ✅ < 3s initial load time
- ✅ Zero critical bugs
- ✅ 100% keyboard navigable
- ✅ WCAG 2.1 AA compliance

### Product Metrics (Post-Launch)
- Average session length > 15 minutes
- Level completion rate > 70%
- Accuracy improvement over time (learning effectiveness)
- User retention: 40%+ return within 7 days

---

## 12. Next Steps for Approval

Please review this architecture proposal and let me know:

1. **Technology Stack**: Approve React + TypeScript + Vite approach?
2. **Timeline**: 40-45 day estimate acceptable?
3. **Budget Strategy**: Credit allocation plan makes sense?
4. **Architecture**: Any concerns with the proposed structure?
5. **Priorities**: Any features to emphasize or deprioritize?

Once approved, I'll begin with:
- Project scaffolding (Vite + React + TypeScript)
- Basic file structure
- First working prototype (maze + player movement)

---

## Ready to Build! 🚀

This architecture is designed to be:
- ✅ **Modular**: Easy to add/remove features
- ✅ **Scalable**: Can handle growing content and users
- ✅ **Maintainable**: Clean separation of concerns
- ✅ **Testable**: Each service is independently testable
- ✅ **Performant**: Optimized from the ground up

Let's create an amazing educational experience! 

What would you like me to focus on first?
