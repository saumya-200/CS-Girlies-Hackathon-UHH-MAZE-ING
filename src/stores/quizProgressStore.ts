/**
 * Quiz Progress Store - Track user progress across topics and level numbers
 */

import { create } from 'zustand';
import type { Topic } from '../data/questionBank';

export interface LevelProgress {
  topicId: string;
  topicName: string;
  levelNumber: number;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  timeSpent: number;
  completedAt: number;
  attempts: number;
}

interface QuizProgressState {
  // Progress tracking
  completedLevels: LevelProgress[];
  currentTopic: Topic | null;
  currentLevelNumber: number | null;
  currentQuestionIndex: number;
  currentScore: number;
  currentCorrectAnswers: number;
  sessionStartTime: number;

  // Actions
  setCurrentTopic: (topic: Topic | null) => void;
  setCurrentLevelNumber: (levelNumber: number | null) => void;
  startQuiz: () => void;
  nextQuestion: () => void;
  addScore: (points: number, correct: boolean) => void;
  completeLevel: (totalQuestions: number) => void;
  resetCurrentSession: () => void;
  getCompletedTopics: () => string[];
  getCompletedLevelsForTopic: (topicId: string) => Array<{ topicId: string; levelNumber: number }>;
  isTopicLevelUnlocked: (topicId: string, levelNumber: number) => boolean;
  hasNextLevelForTopic: (topicId: string, currentLevel: number) => boolean;
  getNextLevelForTopic: (topicId: string, currentLevel: number) => number | null;
  getTotalScore: () => number;
  saveProgress: () => void;
  loadProgress: () => void;
  clearAllProgress: () => void;
}

const STORAGE_KEY = 'quiz_progress_v1';

export const useQuizProgressStore = create<QuizProgressState>((set, get) => ({
  // Initial state
  completedLevels: [],
  currentTopic: null,
  currentLevelNumber: null,
  currentQuestionIndex: 0,
  currentScore: 0,
  currentCorrectAnswers: 0,
  sessionStartTime: 0,

  // Set current topic
  setCurrentTopic: (topic) => {
    set({ currentTopic: topic });
  },

  // Set current level number
  setCurrentLevelNumber: (levelNumber) => {
    set({ currentLevelNumber: levelNumber });
  },

  // Start a new quiz session
  startQuiz: () => {
    set({
      currentQuestionIndex: 0,
      currentScore: 0,
      currentCorrectAnswers: 0,
      sessionStartTime: Date.now(),
    });
  },

  // Move to next question
  nextQuestion: () => {
    set((state) => ({
      currentQuestionIndex: state.currentQuestionIndex + 1,
    }));
  },

  // Add score and track correct answers
  addScore: (points, correct) => {
    set((state) => ({
      currentScore: state.currentScore + points,
      currentCorrectAnswers: correct ? state.currentCorrectAnswers + 1 : state.currentCorrectAnswers,
    }));
  },

  // Complete the current level
  completeLevel: (totalQuestions) => {
    const state = get();
    if (!state.currentTopic || !state.currentLevelNumber) return;

    const timeSpent = Math.floor((Date.now() - state.sessionStartTime) / 1000);

    // Check if this level was completed before
    const existingIndex = state.completedLevels.findIndex(
      (level) =>
        level.topicId === state.currentTopic!.id &&
        level.levelNumber === state.currentLevelNumber
    );

    const newLevel: LevelProgress = {
      topicId: state.currentTopic.id,
      topicName: state.currentTopic.name,
      levelNumber: state.currentLevelNumber,
      score: state.currentScore,
      correctAnswers: state.currentCorrectAnswers,
      totalQuestions,
      timeSpent,
      completedAt: Date.now(),
      attempts: existingIndex >= 0 ? state.completedLevels[existingIndex].attempts + 1 : 1,
    };

    let updatedLevels: LevelProgress[];
    if (existingIndex >= 0) {
      // Update existing level (keep best score)
      updatedLevels = [...state.completedLevels];
      if (newLevel.score > updatedLevels[existingIndex].score) {
        updatedLevels[existingIndex] = newLevel;
      } else {
        updatedLevels[existingIndex].attempts = newLevel.attempts;
      }
    } else {
      // Add new level
      updatedLevels = [...state.completedLevels, newLevel];
    }

    set({ completedLevels: updatedLevels });

    // Auto-save progress
    setTimeout(() => get().saveProgress(), 100);
  },

  // Reset current session
  resetCurrentSession: () => {
    set({
      currentQuestionIndex: 0,
      currentScore: 0,
      currentCorrectAnswers: 0,
      sessionStartTime: 0,
    });
  },

  // Get list of completed topic IDs
  getCompletedTopics: () => {
    const state = get();
    const topicIds = new Set(state.completedLevels.map((level) => level.topicId));
    return Array.from(topicIds);
  },

  // Get completed levels for a specific topic
  getCompletedLevelsForTopic: (topicId) => {
    const state = get();
    return state.completedLevels
      .filter((level) => level.topicId === topicId)
      .map((level) => ({
        topicId: level.topicId,
        levelNumber: level.levelNumber,
      }));
  },

  // Check if a topic level is unlocked (sequential unlocking: level 1 unlocks level 2, etc.)
  isTopicLevelUnlocked: (topicId: string, levelNumber: number) => {
    const state = get();
    if (levelNumber === 1) return true; // Level 1 always unlocked

    // Level n requires level (n-1) to be completed
    return state.completedLevels.some(
      (level) => level.topicId === topicId && level.levelNumber === levelNumber - 1
    );
  },

  // Check if there's a next level available for a topic
  hasNextLevelForTopic: (topicId: string, currentLevel: number) => {
    const state = get();

    // Find the topic to see how many levels it has
    const topic = state.completedLevels.find(l => l.topicId === topicId) ||
                  (state.currentTopic && state.currentTopic.id === topicId ? state.currentTopic : null);

    if (!topic) return false;

    // Try to get from completedlevels, or assume max level if currently playing
    const maxLevel = Math.max(
      currentLevel,
      ...state.completedLevels.filter(l => l.topicId === topicId).map(l => l.levelNumber)
    );

    return currentLevel < maxLevel;
  },

  // Get the next level number for a topic
  getNextLevelForTopic: (topicId: string, currentLevel: number) => {
    // Simple: just increment
    return currentLevel + 1;
  },

  // Get total score across all completed levels
  getTotalScore: () => {
    const state = get();
    return state.completedLevels.reduce((total, level) => total + level.score, 0);
  },

  // Save progress to localStorage
  saveProgress: () => {
    const state = get();
    try {
      const dataToSave = {
        completedLevels: state.completedLevels,
        savedAt: Date.now(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
      console.log('✅ Progress saved successfully');
    } catch (error) {
      console.error('❌ Failed to save progress:', error);
    }
  },

  // Load progress from localStorage
  loadProgress: () => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (savedData) {
        const { completedLevels } = JSON.parse(savedData);
        set({ completedLevels });
        console.log('✅ Progress loaded successfully');
      }
    } catch (error) {
      console.error('❌ Failed to load progress:', error);
    }
  },

  // Clear all progress
  clearAllProgress: () => {
    set({
      completedLevels: [],
      currentTopic: null,
      currentLevelNumber: null,
      currentQuestionIndex: 0,
      currentScore: 0,
      currentCorrectAnswers: 0,
      sessionStartTime: 0,
    });
    localStorage.removeItem(STORAGE_KEY);
    console.log('🗑️ All progress cleared');
  },
}));

// Load progress on init
if (typeof window !== 'undefined') {
  useQuizProgressStore.getState().loadProgress();
}
