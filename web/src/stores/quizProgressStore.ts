/**
 * Quiz Progress Store - Track user progress across streams and difficulty levels
 */

import { create } from 'zustand';
import type { Stream, Difficulty } from '../data/questionBank';

export interface LevelProgress {
  streamId: string;
  streamName: string;
  difficulty: Difficulty;
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
  currentStream: Stream | null;
  currentDifficulty: Difficulty | null;
  currentQuestionIndex: number;
  currentScore: number;
  currentCorrectAnswers: number;
  sessionStartTime: number;
  
  // Actions
  setCurrentStream: (stream: Stream | null) => void;
  setCurrentDifficulty: (difficulty: Difficulty | null) => void;
  startQuiz: () => void;
  nextQuestion: () => void;
  addScore: (points: number, correct: boolean) => void;
  completeLevel: (totalQuestions: number) => void;
  resetCurrentSession: () => void;
  getCompletedStreams: () => string[];
  getCompletedLevelsForStream: (streamId: string) => Array<{ streamId: string; difficulty: Difficulty }>;
  hasNextLevel: () => boolean;
  getNextLevel: () => Difficulty | null;
  getTotalScore: () => number;
  saveProgress: () => void;
  loadProgress: () => void;
  clearAllProgress: () => void;
}

const STORAGE_KEY = 'quiz_progress_v1';

export const useQuizProgressStore = create<QuizProgressState>((set, get) => ({
  // Initial state
  completedLevels: [],
  currentStream: null,
  currentDifficulty: null,
  currentQuestionIndex: 0,
  currentScore: 0,
  currentCorrectAnswers: 0,
  sessionStartTime: 0,

  // Set current stream
  setCurrentStream: (stream) => {
    set({ currentStream: stream });
  },

  // Set current difficulty
  setCurrentDifficulty: (difficulty) => {
    set({ currentDifficulty: difficulty });
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
    if (!state.currentStream || !state.currentDifficulty) return;

    const timeSpent = Math.floor((Date.now() - state.sessionStartTime) / 1000);

    // Check if this level was completed before
    const existingIndex = state.completedLevels.findIndex(
      (level) =>
        level.streamId === state.currentStream!.id &&
        level.difficulty === state.currentDifficulty
    );

    const newLevel: LevelProgress = {
      streamId: state.currentStream.id,
      streamName: state.currentStream.name,
      difficulty: state.currentDifficulty,
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

  // Get list of completed stream IDs
  getCompletedStreams: () => {
    const state = get();
    const streamIds = new Set(state.completedLevels.map((level) => level.streamId));
    return Array.from(streamIds);
  },

  // Get completed levels for a specific stream
  getCompletedLevelsForStream: (streamId) => {
    const state = get();
    return state.completedLevels
      .filter((level) => level.streamId === streamId)
      .map((level) => ({
        streamId: level.streamId,
        difficulty: level.difficulty,
      }));
  },

  // Check if a level is unlocked (sequential unlocking)
  isLevelUnlocked: (streamId: string, difficulty: Difficulty) => {
    const state = get();
    
    // Easy is always unlocked
    if (difficulty === 'easy') return true;
    
    // Medium requires Easy to be completed
    if (difficulty === 'medium') {
      return state.completedLevels.some(
        (level) => level.streamId === streamId && level.difficulty === 'easy'
      );
    }
    
    // Hard requires Medium to be completed
    if (difficulty === 'hard') {
      return state.completedLevels.some(
        (level) => level.streamId === streamId && level.difficulty === 'medium'
      );
    }
    
    return false;
  },

  // Check if there's a next level available
  hasNextLevel: () => {
    const state = get();
    if (!state.currentDifficulty) return false;

    const difficultyOrder: Difficulty[] = ['easy', 'medium', 'hard'];
    const currentIndex = difficultyOrder.indexOf(state.currentDifficulty);
    return currentIndex < difficultyOrder.length - 1;
  },

  // Get the next difficulty level
  getNextLevel: () => {
    const state = get();
    if (!state.currentDifficulty) return null;

    const difficultyOrder: Difficulty[] = ['easy', 'medium', 'hard'];
    const currentIndex = difficultyOrder.indexOf(state.currentDifficulty);
    
    if (currentIndex < difficultyOrder.length - 1) {
      return difficultyOrder[currentIndex + 1];
    }
    return null;
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
      currentStream: null,
      currentDifficulty: null,
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
