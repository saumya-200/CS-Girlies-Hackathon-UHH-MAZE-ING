// Game constants and configuration

import type { GameConfig } from '../types/game.types';

// Game Configuration
export const GAME_CONFIG: GameConfig = {
  tileSize: 40, // pixels
  fogRevealRadius: 3, // tiles
  fogDecayRate: 0.1, // opacity per second
  movementSpeed: 150, // ms between moves
  initialLives: 5,
};

// Level Sizes
export const LEVEL_SIZES = {
  EASY: { width: 21, height: 21 },
  MEDIUM: { width: 31, height: 31 },
  HARD: { width: 41, height: 41 },
};

// Scoring Constants
export const SCORING = {
  BASE_POINTS: 100,
  TIME_BONUS_MAX: 50,
  ATTEMPT_PENALTY: -25,
  HINT_PENALTY: -10,
  DIFFICULTY_MULTIPLIER: {
    1: 1.0,
    2: 1.5,
    3: 2.0,
    4: 2.5,
    5: 3.0,
  },
};

// UI Constants
export const UI = {
  ANIMATION_DURATION: 300, // ms
  MODAL_TRANSITION: 200, // ms
  TOAST_DURATION: 3000, // ms
  HUD_HEIGHT: 80, // pixels
  MINIMAP_SIZE: 200, // pixels
};

// Fog of War
export const FOG = {
  INITIAL_OPACITY: 1.0,
  MIN_OPACITY: 0.0,
  REVISIT_OPACITY: 0.3,
  DECAY_RATE: 0.02, // per frame
};

// Path Memory
export const PATH = {
  TRAIL_COLOR: 'rgba(59, 130, 246, 0.5)', // blue-500 with 50% opacity
  TRAIL_WIDTH: 3, // pixels
  RECENT_FADE_DURATION: 2000, // ms
};

// Question Types
export const QUESTION_TYPES = {
  MULTIPLE_CHOICE: 'multiple_choice',
  SHORT_ANSWER: 'short_answer',
  TRUE_FALSE: 'true_false',
} as const;

// Content Cache
export const CACHE = {
  TTL_DAYS: 30,
  MAX_ITEMS: 1000,
  VERSION: 1,
};

// Storage Keys
export const STORAGE_KEYS = {
  USER_PROGRESS: 'edu_maze_progress',
  USER_SETTINGS: 'edu_maze_settings',
  SAVE_SLOTS: 'edu_maze_saves',
  CONTENT_CACHE: 'edu_maze_cache',
  ANALYTICS: 'edu_maze_analytics',
};

// Accessibility
export const A11Y = {
  TEXT_SIZES: {
    small: 14,
    medium: 16,
    large: 18,
    'extra-large': 22,
  },
  FOCUS_OUTLINE_WIDTH: 3, // pixels
  MIN_TOUCH_TARGET: 44, // pixels (WCAG recommendation)
};

// Performance
export const PERFORMANCE = {
  TARGET_FPS: 60,
  MIN_FPS: 30,
  MAX_PARTICLES: 500,
  RENDER_DISTANCE: 15, // tiles from player
};

// Default User Settings
export const DEFAULT_SETTINGS = {
  textSize: 'medium' as const,
  colorBlindMode: 'none' as const,
  highContrast: false,
  reducedMotion: false,
  soundEnabled: true,
  musicVolume: 0.5,
  sfxVolume: 0.7,
};

// Difficulty Levels
export const DIFFICULTY_LEVELS = {
  BEGINNER: 'beginner' as const,
  INTERMEDIATE: 'intermediate' as const,
  ADVANCED: 'advanced' as const,
};

// Input Keys
export const KEYS = {
  UP: ['ArrowUp', 'w', 'W'],
  DOWN: ['ArrowDown', 's', 'S'],
  LEFT: ['ArrowLeft', 'a', 'A'],
  RIGHT: ['ArrowRight', 'd', 'D'],
  PAUSE: ['Escape', 'p', 'P'],
  CONFIRM: ['Enter', ' '],
};

// Colors (Tailwind classes)
export const COLORS = {
  PRIMARY: 'primary-600',
  SECONDARY: 'secondary-600',
  SUCCESS: 'green-500',
  ERROR: 'red-500',
  WARNING: 'yellow-500',
  INFO: 'blue-500',
};

// Tile Type Colors
export const TILE_COLORS = {
  WALL: '#1f2937', // gray-800
  PATH: '#374151', // gray-700
  QUIZ: '#3b82f6', // blue-500
  QUIZ_CORRECT: '#10b981', // green-500
  QUIZ_INCORRECT: '#ef4444', // red-500
  START: '#8b5cf6', // purple-500
  GOAL: '#f59e0b', // yellow-500
};

// API Endpoints (for future backend integration)
export const API_ENDPOINTS = {
  GENERATE_LESSON: '/api/content/lesson',
  GENERATE_QUESTION: '/api/content/question',
  VALIDATE_CONTENT: '/api/content/validate',
  SYNC_PROGRESS: '/api/user/sync',
  ANALYTICS: '/api/analytics',
};

// Adaptive Learning Thresholds
export const ADAPTIVE_THRESHOLDS = {
  HIGH_ACCURACY: 0.8, // Increase difficulty
  LOW_ACCURACY: 0.5, // Decrease difficulty
  REMEDIATION_TRIGGER: 3, // consecutive wrong answers
  TIME_THRESHOLD_MULTIPLIER: 2, // x times expected time
};

// Level Progression
export const PROGRESSION = {
  MIN_CORRECT_ANSWERS_RATIO: 0.7, // 70% to unlock door
  CLUSTER_SIZE: 3, // levels per cluster
  LIVES_PER_CLUSTER: 5,
};

// src/utils/constants.ts
export const API_BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";