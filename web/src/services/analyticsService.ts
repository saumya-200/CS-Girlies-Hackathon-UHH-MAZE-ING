/**
 * Analytics Service - Track learning metrics and player performance
 */

import type { AnalyticsEvent, QuestionAttempt, LevelCompletion } from '../types/analytics.types';

class AnalyticsService {
  private events: AnalyticsEvent[] = [];
  private sessionStartTime: number = Date.now();
  private questionAttempts: Map<string, QuestionAttempt[]> = new Map();
  private levelCompletions: LevelCompletion[] = [];

  /**
   * Track a question attempt
   */
  trackQuestionAttempt(data: {
    questionId: string;
    topic: string;
    type: string;
    difficulty: number;
    correct: boolean;
    timeSpentSeconds: number;
    hintsUsed: number;
    attemptNumber: number;
  }): void {
    const attempt: QuestionAttempt = {
      questionId: data.questionId,
      topic: data.topic,
      questionType: data.type,
      difficulty: data.difficulty,
      correct: data.correct,
      timeSpentSeconds: data.timeSpentSeconds,
      hintsUsed: data.hintsUsed,
      attemptNumber: data.attemptNumber,
      timestamp: Date.now(),
    };

    // Store attempt
    const attempts = this.questionAttempts.get(data.questionId) || [];
    attempts.push(attempt);
    this.questionAttempts.set(data.questionId, attempts);

    // Track event
    this.trackEvent({
      type: 'question_attempt',
      timestamp: Date.now(),
      data: attempt,
    });

    console.log('[Analytics] Question attempt tracked:', data.questionId, data.correct ? '✓' : '✗');
  }

  /**
   * Track level completion
   */
  trackLevelCompletion(data: {
    levelId: string;
    topic: string;
    score: number;
    timeSpentSeconds: number;
    questionsAnswered: number;
    questionsCorrect: number;
    livesRemaining: number;
  }): void {
    const completion: LevelCompletion = {
      levelId: data.levelId,
      topic: data.topic,
      score: data.score,
      timeSpentSeconds: data.timeSpentSeconds,
      questionsAnswered: data.questionsAnswered,
      questionsCorrect: data.questionsCorrect,
      accuracy: data.questionsAnswered > 0 
        ? (data.questionsCorrect / data.questionsAnswered) * 100 
        : 0,
      livesRemaining: data.livesRemaining,
      timestamp: Date.now(),
    };

    this.levelCompletions.push(completion);

    this.trackEvent({
      type: 'level_completion',
      timestamp: Date.now(),
      data: completion,
    });

    console.log('[Analytics] Level completion tracked:', data.levelId, `${completion.accuracy.toFixed(1)}% accuracy`);
  }

  /**
   * Track a generic event
   */
  trackEvent(event: AnalyticsEvent): void {
    this.events.push(event);
  }

  /**
   * Get question accuracy by topic
   */
  getAccuracyByTopic(): Map<string, number> {
    const topicStats = new Map<string, { correct: number; total: number }>();

    this.questionAttempts.forEach((attempts) => {
      attempts.forEach((attempt) => {
        const stats = topicStats.get(attempt.topic) || { correct: 0, total: 0 };
        stats.total++;
        if (attempt.correct) stats.correct++;
        topicStats.set(attempt.topic, stats);
      });
    });

    const accuracyMap = new Map<string, number>();
    topicStats.forEach((stats, topic) => {
      accuracyMap.set(topic, (stats.correct / stats.total) * 100);
    });

    return accuracyMap;
  }

  /**
   * Get average time per question type
   */
  getAverageTimeByQuestionType(): Map<string, number> {
    const typeStats = new Map<string, { totalTime: number; count: number }>();

    this.questionAttempts.forEach((attempts) => {
      attempts.forEach((attempt) => {
        const stats = typeStats.get(attempt.questionType) || { totalTime: 0, count: 0 };
        stats.totalTime += attempt.timeSpentSeconds;
        stats.count++;
        typeStats.set(attempt.questionType, stats);
      });
    });

    const avgTimeMap = new Map<string, number>();
    typeStats.forEach((stats, type) => {
      avgTimeMap.set(type, stats.totalTime / stats.count);
    });

    return avgTimeMap;
  }

  /**
   * Get hint usage statistics
   */
  getHintUsageStats(): {
    totalHints: number;
    averageHintsPerQuestion: number;
    questionsWithHints: number;
  } {
    let totalHints = 0;
    let questionsWithHints = 0;
    let totalQuestions = 0;

    this.questionAttempts.forEach((attempts) => {
      attempts.forEach((attempt) => {
        totalQuestions++;
        totalHints += attempt.hintsUsed;
        if (attempt.hintsUsed > 0) questionsWithHints++;
      });
    });

    return {
      totalHints,
      averageHintsPerQuestion: totalQuestions > 0 ? totalHints / totalQuestions : 0,
      questionsWithHints,
    };
  }

  /**
   * Get learning strengths (topics with >80% accuracy)
   */
  getLearningStrengths(): string[] {
    const accuracyByTopic = this.getAccuracyByTopic();
    const strengths: string[] = [];

    accuracyByTopic.forEach((accuracy, topic) => {
      if (accuracy >= 80) {
        strengths.push(topic);
      }
    });

    return strengths;
  }

  /**
   * Get learning weaknesses (topics with <60% accuracy)
   */
  getLearningWeaknesses(): string[] {
    const accuracyByTopic = this.getAccuracyByTopic();
    const weaknesses: string[] = [];

    accuracyByTopic.forEach((accuracy, topic) => {
      if (accuracy < 60) {
        weaknesses.push(topic);
      }
    });

    return weaknesses;
  }

  /**
   * Get overall session statistics
   */
  getSessionStats() {
    const totalQuestions = Array.from(this.questionAttempts.values())
      .reduce((sum, attempts) => sum + attempts.length, 0);
    
    const correctAnswers = Array.from(this.questionAttempts.values())
      .reduce((sum, attempts) => 
        sum + attempts.filter(a => a.correct).length, 0);

    const sessionDurationMinutes = (Date.now() - this.sessionStartTime) / 1000 / 60;

    return {
      sessionDurationMinutes: Math.round(sessionDurationMinutes * 10) / 10,
      totalQuestions,
      correctAnswers,
      overallAccuracy: totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0,
      levelsCompleted: this.levelCompletions.length,
      totalScore: this.levelCompletions.reduce((sum, lc) => sum + lc.score, 0),
    };
  }

  /**
   * Generate study report
   */
  generateStudyReport(): {
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
    stats: ReturnType<typeof this.getSessionStats>;
  } {
    const strengths = this.getLearningStrengths();
    const weaknesses = this.getLearningWeaknesses();
    const stats = this.getSessionStats();
    
    // Generate recommendations
    const recommendations: string[] = [];
    
    if (weaknesses.length > 0) {
      recommendations.push(`Review ${weaknesses.join(', ')} - accuracy below 60%`);
    }
    
    const hintStats = this.getHintUsageStats();
    if (hintStats.averageHintsPerQuestion > 0.5) {
      recommendations.push('Practice more to reduce hint dependency');
    }
    
    if (stats.overallAccuracy < 70) {
      recommendations.push('Slow down and read questions carefully');
    } else if (stats.overallAccuracy > 90) {
      recommendations.push('Great work! Try harder difficulty levels');
    }
    
    return {
      strengths,
      weaknesses,
      recommendations,
      stats,
    };
  }

  /**
   * Export analytics data as JSON
   */
  exportData(): string {
    return JSON.stringify({
      events: this.events,
      questionAttempts: Array.from(this.questionAttempts.entries()),
      levelCompletions: this.levelCompletions,
      sessionStartTime: this.sessionStartTime,
    }, null, 2);
  }

  /**
   * Clear all analytics data
   */
  clearData(): void {
    this.events = [];
    this.questionAttempts.clear();
    this.levelCompletions = [];
    this.sessionStartTime = Date.now();
    console.log('[Analytics] Data cleared');
  }

  /**
   * Get total events tracked
   */
  getEventCount(): number {
    return this.events.length;
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService();
