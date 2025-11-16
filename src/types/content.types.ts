// Content types for lessons and quizzes

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';
export type QuestionType = 'multiple_choice' | 'short_answer' | 'true_false';

export interface Lesson {
  id: string;
  title: string;
  body: string; // Rich text/markdown
  summary: string;
  keywords: string[];
  estimatedReadingMinutes: number;
  difficulty: DifficultyLevel;
  topic: string;
  createdAt: number;
  version: number;
}

export interface Question {
  id: string;
  type: QuestionType;
  prompt: string;
  options?: string[]; // For multiple choice
  correctAnswer: string | number | boolean;
  hint: string;
  explanation: string;
  difficulty: number; // 1-5
  topic: string;
  estimatedTimeSeconds: number;
}

export interface QuizAttempt {
  questionId: string;
  userAnswer: string | number;
  isCorrect: boolean;
  attemptNumber: number;
  timeSpentSeconds: number;
  hintsUsed: number;
  timestamp: number;
}

// Structure for AI-generated content
export interface LessonGenerationRequest {
  topic: string;
  complexity: number;
  difficulty: DifficultyLevel;
  length?: 'short' | 'medium' | 'long';
}

export interface QuestionGenerationRequest {
  topic: string;
  type: QuestionType;
  difficulty: number;
  count?: number;
}

// Content validation
export interface ContentValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  score: number; // 0-100
}

// Content cache structure
export interface CachedContent {
  key: string;
  content: Lesson | Question;
  cachedAt: number;
  expiresAt: number;
  version: number;
}
