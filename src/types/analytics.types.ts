// Analytics and metrics tracking types

export interface QuestionMetrics {
  questionId: string;
  topic: string;
  totalAttempts: number;
  correctAttempts: number;
  averageTimeSeconds: number;
  mostCommonWrongAnswers: Record<string, number>;
  hintUsageRate: number;
}

export interface TopicMetrics {
  topic: string;
  totalQuestions: number;
  accuracy: number;
  averageTime: number;
  completionRate: number;
  lastStudied: number;
}

export interface LevelMetrics {
  levelId: string;
  attempts: number;
  completions: number;
  averageCompletionTime: number;
  averageScore: number;
  dropOffRate: number;
}

export interface StudyReport {
  userId: string;
  generatedAt: number;
  timeRange: { start: number; end: number };
  strengths: TopicMetrics[];
  weaknesses: TopicMetrics[];
  recommendedReview: string[];
  totalTimeSpent: number;
  overallAccuracy: number;
  progressPercentage: number;
}

export interface LearningEvent {
  id: string;
  userId: string;
  eventType: 'lesson_start' | 'lesson_complete' | 'question_attempt' | 'level_complete' | 'hint_used';
  timestamp: number;
  data: Record<string, unknown>;
}

export interface AggregatedAnalytics {
  totalUsers: number;
  activeUsers: number;
  averageSessionLength: number;
  topicAccuracyMap: Record<string, number>;
  mostDifficultQuestions: QuestionMetrics[];
  contentQualityFlags: string[];
}

// Additional types for analytics service
export interface QuestionAttempt {
  questionId: string;
  topic: string;
  questionType: string;
  difficulty: number;
  correct: boolean;
  timeSpentSeconds: number;
  hintsUsed: number;
  attemptNumber: number;
  timestamp: number;
}

export interface LevelCompletion {
  levelId: string;
  topic: string;
  score: number;
  timeSpentSeconds: number;
  questionsAnswered: number;
  questionsCorrect: number;
  accuracy: number;
  livesRemaining: number;
  timestamp: number;
}

export interface AnalyticsEvent {
  type: string;
  timestamp: number;
  data: Record<string, unknown>;
}
