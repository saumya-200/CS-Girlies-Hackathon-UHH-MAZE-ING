// Integrated content service with generation, validation, caching, and fallback

import { contentGenerator, type GenerationRequest, type QuestionGenerationRequest } from './contentGenerator';
import { contentValidator } from './contentValidator';
import { contentCache } from './contentCache';
import type { Lesson, Question } from '../types/content.types';

// Default fallback lesson template
const DEFAULT_LESSON: Lesson = {
  id: 'default-lesson',
  title: 'Introduction to Learning',
  body: `
# Welcome to Learning!

## Overview
This is a default lesson that helps you get started with the educational maze game.

## Key Concepts
- Explore the maze to find quiz tiles
- Answer questions correctly to earn keys
- Collect keys to unlock the goal
- Learn while playing!

## Getting Started
Move through the maze using arrow keys or WASD. Step on orange tiles marked with **?** to answer questions.

📚 **Summary**: Learn by exploring and answering questions throughout the maze.
  `.trim(),
  summary: 'Learn by exploring the maze and answering educational questions.',
  keywords: ['learning', 'education', 'maze', 'questions', 'knowledge'],
  estimatedReadingMinutes: 2,
  difficulty: 'beginner',
  topic: 'General Learning',
  createdAt: Date.now(),
  version: 1,
};

// Default fallback questions
const DEFAULT_QUESTIONS: Record<string, Question> = {
  'default-mc': {
    id: 'default-mc',
    type: 'multiple_choice',
    prompt: 'What is the best way to learn new concepts?',
    options: [
      'Practice and repetition',
      'Memorizing without understanding',
      'Avoiding challenging topics',
      'Never asking for help',
    ],
    correctAnswer: 0,
    hint: 'Think about effective learning strategies',
    explanation: 'Practice and repetition help reinforce learning and build understanding.',
    difficulty: 2,
    topic: 'Learning Strategies',
    estimatedTimeSeconds: 30,
  },
  'default-sa': {
    id: 'default-sa',
    type: 'short_answer',
    prompt: 'What word describes gaining knowledge through study?',
    correctAnswer: 'learning',
    hint: 'Think about the process of education',
    explanation: 'Learning is the process of acquiring knowledge through study and experience.',
    difficulty: 1,
    topic: 'Education',
    estimatedTimeSeconds: 25,
  },
  'default-tf': {
    id: 'default-tf',
    type: 'true_false',
    prompt: 'Educational games can make learning more engaging.',
    correctAnswer: 'true',
    hint: 'Consider how games motivate players',
    explanation: 'Educational games combine fun with learning, making the process more engaging.',
    difficulty: 1,
    topic: 'Educational Games',
    estimatedTimeSeconds: 20,
  },
};

export class ContentService {
  private failureCount = 0;
  private readonly MAX_FAILURES = 3;

  // Get or generate a lesson with full fallback support
  async getLesson(request: GenerationRequest): Promise<Lesson> {
    try {
      // Try to get from cache first
      const cached = await contentCache.getLesson(request.topic, request.complexity);
      if (cached) {
        console.log(`[ContentService] Lesson retrieved from cache: ${request.topic}`);
        return cached;
      }

      // Generate new lesson
      console.log(`[ContentService] Generating lesson: ${request.topic}`);
      const lesson = await contentGenerator.generateLesson(request);

      // Validate the generated lesson
      const validation = contentValidator.validateLesson(lesson);
      
      if (!validation.isValid) {
        console.warn(`[ContentService] Generated lesson failed validation:`, validation.errors);
        this.failureCount++;
        
        // If validation fails too many times, use fallback
        if (this.failureCount >= this.MAX_FAILURES) {
          console.error(`[ContentService] Max failures reached, using fallback lesson`);
          return this.getFallbackLesson(request.topic);
        }
        
        // Try generating again
        return this.getLesson(request);
      }

      // Validate quality threshold (70%)
      if (!contentValidator.validateContentQuality(validation, 70)) {
        console.warn(`[ContentService] Lesson quality below threshold (${validation.score}%)`);
        
        // Still cache and use it, but log warning
        if (validation.warnings.length > 0) {
          console.warn(`[ContentService] Warnings:`, validation.warnings);
        }
      }

      // Cache the valid lesson
      try {
        await contentCache.saveLesson(lesson);
        console.log(`[ContentService] Lesson cached: ${lesson.id}`);
      } catch (cacheError) {
        console.error(`[ContentService] Failed to cache lesson:`, cacheError);
        // Continue anyway - caching failure shouldn't block usage
      }

      // Reset failure count on success
      this.failureCount = 0;
      
      return lesson;

    } catch (error) {
      console.error(`[ContentService] Error getting lesson:`, error);
      this.failureCount++;
      
      // Use fallback after errors
      if (this.failureCount >= this.MAX_FAILURES) {
        console.error(`[ContentService] Max failures reached, using fallback lesson`);
        return this.getFallbackLesson(request.topic);
      }
      
      // Try again with exponential backoff
      await this.delay(Math.pow(2, this.failureCount) * 100);
      return this.getLesson(request);
    }
  }

  // Get or generate a question with full fallback support
  async getQuestion(request: QuestionGenerationRequest): Promise<Question> {
    try {
      // Try to get from cache first
      const cached = await contentCache.getQuestion(request.topic, request.difficulty);
      if (cached) {
        console.log(`[ContentService] Question retrieved from cache: ${request.topic}`);
        return cached;
      }

      // Generate new question
      console.log(`[ContentService] Generating question: ${request.topic}, type: ${request.type}`);
      const question = await contentGenerator.generateQuestion(request);

      // Validate the generated question
      const validation = contentValidator.validateQuestion(question);
      
      if (!validation.isValid) {
        console.warn(`[ContentService] Generated question failed validation:`, validation.errors);
        this.failureCount++;
        
        // If validation fails too many times, use fallback
        if (this.failureCount >= this.MAX_FAILURES) {
          console.error(`[ContentService] Max failures reached, using fallback question`);
          return this.getFallbackQuestion(request.type);
        }
        
        // Try generating again
        return this.getQuestion(request);
      }

      // Validate quality threshold
      if (!contentValidator.validateContentQuality(validation, 70)) {
        console.warn(`[ContentService] Question quality below threshold (${validation.score}%)`);
        
        if (validation.warnings.length > 0) {
          console.warn(`[ContentService] Warnings:`, validation.warnings);
        }
      }

      // Cache the valid question
      try {
        await contentCache.saveQuestion(question);
        console.log(`[ContentService] Question cached: ${question.id}`);
      } catch (cacheError) {
        console.error(`[ContentService] Failed to cache question:`, cacheError);
        // Continue anyway
      }

      // Reset failure count on success
      this.failureCount = 0;
      
      return question;

    } catch (error) {
      console.error(`[ContentService] Error getting question:`, error);
      this.failureCount++;
      
      // Use fallback after errors
      if (this.failureCount >= this.MAX_FAILURES) {
        console.error(`[ContentService] Max failures reached, using fallback question`);
        return this.getFallbackQuestion(request.type);
      }
      
      // Try again with exponential backoff
      await this.delay(Math.pow(2, this.failureCount) * 100);
      return this.getQuestion(request);
    }
  }

  // Get fallback lesson
  private getFallbackLesson(topic: string): Lesson {
    return {
      ...DEFAULT_LESSON,
      id: `fallback-lesson-${Date.now()}`,
      topic,
      title: `Introduction to ${topic}`,
      createdAt: Date.now(),
    };
  }

  // Get fallback question
  private getFallbackQuestion(type: 'multiple_choice' | 'short_answer' | 'true_false'): Question {
    const defaultKey = type === 'multiple_choice' ? 'default-mc' :
                       type === 'short_answer' ? 'default-sa' : 'default-tf';
    
    const defaultQuestion = DEFAULT_QUESTIONS[defaultKey];
    
    return {
      ...defaultQuestion,
      id: `fallback-${type}-${Date.now()}`,
    };
  }

  // Clear expired cache entries
  async clearExpiredCache(): Promise<void> {
    try {
      await contentCache.clearExpired();
      console.log(`[ContentService] Expired cache entries cleared`);
    } catch (error) {
      console.error(`[ContentService] Failed to clear expired cache:`, error);
    }
  }

  // Get cache statistics
  async getCacheStats(): Promise<{ lessonCount: number; questionCount: number }> {
    try {
      return await contentCache.getStats();
    } catch (error) {
      console.error(`[ContentService] Failed to get cache stats:`, error);
      return { lessonCount: 0, questionCount: 0 };
    }
  }

  // Clear all cache
  async clearAllCache(): Promise<void> {
    try {
      await contentCache.clearAll();
      console.log(`[ContentService] All cache cleared`);
    } catch (error) {
      console.error(`[ContentService] Failed to clear cache:`, error);
    }
  }

  // Helper: delay for backoff
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Reset failure counter (useful for testing or after manual intervention)
  resetFailureCount(): void {
    this.failureCount = 0;
  }
}

// Export singleton instance
export const contentService = new ContentService();
