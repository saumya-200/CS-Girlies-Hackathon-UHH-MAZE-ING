// User and progress tracking types

import type { Coordinate } from './game.types';

export interface UserSettings {
  textSize: 'small' | 'medium' | 'large' | 'extra-large';
  colorBlindMode: 'none' | 'deuteranopia' | 'protanopia' | 'tritanopia';
  highContrast: boolean;
  reducedMotion: boolean;
  soundEnabled: boolean;
  musicVolume: number; // 0-1
  sfxVolume: number; // 0-1
}

export interface AnsweredQuestion {
  questionId: string;
  levelId: string;
  correct: boolean;
  attempts: number;
  timeSpentSeconds: number;
  timestamp: number;
  hintsUsed: number;
}

export interface PlayerMetrics {
  totalPlayTime: number;
  accuracyByTopic: Record<string, number>; // topic -> accuracy %
  averageTimePerQuestion: number;
  hintUsageFrequency: number;
  learningStreak: number; // consecutive days
  lastPlayedDate: string;
}

export interface UserProgress {
  userId: string;
  currentLevel: number;
  totalScore: number;
  lives: number;
  levelsCompleted: number[];
  visitedTiles: Record<string, Coordinate[]>; // levelId -> coordinates
  answeredQuestions: AnsweredQuestion[];
  metrics: PlayerMetrics;
  settings: UserSettings;
  lastSyncedAt?: number;
  createdAt: number;
  updatedAt: number;
}

export interface SaveSlot {
  slotId: number;
  name: string;
  progress: UserProgress;
  thumbnail?: string; // Base64 screenshot
  lastSaved: number;
}

export interface UserAccount {
  id: string;
  email?: string;
  displayName: string;
  isGuest: boolean;
  createdAt: number;
  lastLoginAt: number;
}
