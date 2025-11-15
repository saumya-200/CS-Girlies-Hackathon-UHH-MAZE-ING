// Content caching service using IndexedDB for persistent storage

import type { Lesson, Question, CachedContent } from '../types/content.types';

const DB_NAME = 'educational-maze-cache';
const DB_VERSION = 1;
const LESSONS_STORE = 'lessons';
const QUESTIONS_STORE = 'questions';
const CACHE_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export class ContentCache {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  // Initialize IndexedDB
  async init(): Promise<void> {
    if (this.db) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        reject(new Error('Failed to open IndexedDB'));
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create lessons store
        if (!db.objectStoreNames.contains(LESSONS_STORE)) {
          const lessonsStore = db.createObjectStore(LESSONS_STORE, { keyPath: 'key' });
          lessonsStore.createIndex('topic', 'content.topic', { unique: false });
          lessonsStore.createIndex('cachedAt', 'cachedAt', { unique: false });
        }

        // Create questions store
        if (!db.objectStoreNames.contains(QUESTIONS_STORE)) {
          const questionsStore = db.createObjectStore(QUESTIONS_STORE, { keyPath: 'key' });
          questionsStore.createIndex('topic', 'content.topic', { unique: false });
          questionsStore.createIndex('cachedAt', 'cachedAt', { unique: false });
        }
      };
    });

    return this.initPromise;
  }

  // Generate cache key
  private generateKey(type: 'lesson' | 'question', topic: string, difficulty?: number): string {
    const parts = [type, topic.toLowerCase().replace(/\s+/g, '-')];
    if (difficulty !== undefined) {
      parts.push(difficulty.toString());
    }
    return parts.join('_');
  }

  // Save lesson to cache
  async saveLesson(lesson: Lesson): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    const key = this.generateKey('lesson', lesson.topic, 
      lesson.difficulty === 'beginner' ? 1 : lesson.difficulty === 'intermediate' ? 3 : 5);
    
    const cached: CachedContent = {
      key,
      content: lesson,
      cachedAt: Date.now(),
      expiresAt: Date.now() + CACHE_DURATION_MS,
      version: 1,
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([LESSONS_STORE], 'readwrite');
      const store = transaction.objectStore(LESSONS_STORE);
      const request = store.put(cached);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to save lesson to cache'));
    });
  }

  // Get lesson from cache
  async getLesson(topic: string, difficulty: number): Promise<Lesson | null> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    const key = this.generateKey('lesson', topic, difficulty);

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([LESSONS_STORE], 'readonly');
      const store = transaction.objectStore(LESSONS_STORE);
      const request = store.get(key);

      request.onsuccess = () => {
        const cached = request.result as CachedContent | undefined;
        
        if (!cached) {
          resolve(null);
          return;
        }

        // Check if cache is expired
        if (cached.expiresAt < Date.now()) {
          // Delete expired cache entry
          this.deleteLesson(key);
          resolve(null);
          return;
        }

        resolve(cached.content as Lesson);
      };

      request.onerror = () => reject(new Error('Failed to get lesson from cache'));
    });
  }

  // Save question to cache
  async saveQuestion(question: Question): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    const key = this.generateKey('question', question.topic, question.difficulty);
    
    const cached: CachedContent = {
      key,
      content: question,
      cachedAt: Date.now(),
      expiresAt: Date.now() + CACHE_DURATION_MS,
      version: 1,
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([QUESTIONS_STORE], 'readwrite');
      const store = transaction.objectStore(QUESTIONS_STORE);
      const request = store.put(cached);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to save question to cache'));
    });
  }

  // Get question from cache
  async getQuestion(topic: string, difficulty: number): Promise<Question | null> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    const key = this.generateKey('question', topic, difficulty);

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([QUESTIONS_STORE], 'readonly');
      const store = transaction.objectStore(QUESTIONS_STORE);
      const request = store.get(key);

      request.onsuccess = () => {
        const cached = request.result as CachedContent | undefined;
        
        if (!cached) {
          resolve(null);
          return;
        }

        // Check if cache is expired
        if (cached.expiresAt < Date.now()) {
          // Delete expired cache entry
          this.deleteQuestion(key);
          resolve(null);
          return;
        }

        resolve(cached.content as Question);
      };

      request.onerror = () => reject(new Error('Failed to get question from cache'));
    });
  }

  // Get all lessons by topic
  async getLessonsByTopic(topic: string): Promise<Lesson[]> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([LESSONS_STORE], 'readonly');
      const store = transaction.objectStore(LESSONS_STORE);
      const index = store.index('topic');
      const request = index.getAll(topic);

      request.onsuccess = () => {
        const cached = request.result as CachedContent[];
        const lessons = cached
          .filter(c => c.expiresAt >= Date.now())
          .map(c => c.content as Lesson);
        resolve(lessons);
      };

      request.onerror = () => reject(new Error('Failed to get lessons by topic'));
    });
  }

  // Get all questions by topic
  async getQuestionsByTopic(topic: string): Promise<Question[]> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([QUESTIONS_STORE], 'readonly');
      const store = transaction.objectStore(QUESTIONS_STORE);
      const index = store.index('topic');
      const request = index.getAll(topic);

      request.onsuccess = () => {
        const cached = request.result as CachedContent[];
        const questions = cached
          .filter(c => c.expiresAt >= Date.now())
          .map(c => c.content as Question);
        resolve(questions);
      };

      request.onerror = () => reject(new Error('Failed to get questions by topic'));
    });
  }

  // Delete lesson from cache
  private async deleteLesson(key: string): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([LESSONS_STORE], 'readwrite');
      const store = transaction.objectStore(LESSONS_STORE);
      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to delete lesson'));
    });
  }

  // Delete question from cache
  private async deleteQuestion(key: string): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([QUESTIONS_STORE], 'readwrite');
      const store = transaction.objectStore(QUESTIONS_STORE);
      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to delete question'));
    });
  }

  // Clear all expired entries
  async clearExpired(): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    const now = Date.now();

    // Clear expired lessons
    await new Promise<void>((resolve, reject) => {
      const transaction = this.db!.transaction([LESSONS_STORE], 'readwrite');
      const store = transaction.objectStore(LESSONS_STORE);
      const index = store.index('cachedAt');
      const request = index.openCursor();

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          const cached = cursor.value as CachedContent;
          if (cached.expiresAt < now) {
            cursor.delete();
          }
          cursor.continue();
        } else {
          resolve();
        }
      };

      request.onerror = () => reject(new Error('Failed to clear expired lessons'));
    });

    // Clear expired questions
    await new Promise<void>((resolve, reject) => {
      const transaction = this.db!.transaction([QUESTIONS_STORE], 'readwrite');
      const store = transaction.objectStore(QUESTIONS_STORE);
      const index = store.index('cachedAt');
      const request = index.openCursor();

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          const cached = cursor.value as CachedContent;
          if (cached.expiresAt < now) {
            cursor.delete();
          }
          cursor.continue();
        } else {
          resolve();
        }
      };

      request.onerror = () => reject(new Error('Failed to clear expired questions'));
    });
  }

  // Clear all cache
  async clearAll(): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    await Promise.all([
      new Promise<void>((resolve, reject) => {
        const transaction = this.db!.transaction([LESSONS_STORE], 'readwrite');
        const store = transaction.objectStore(LESSONS_STORE);
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(new Error('Failed to clear lessons'));
      }),
      new Promise<void>((resolve, reject) => {
        const transaction = this.db!.transaction([QUESTIONS_STORE], 'readwrite');
        const store = transaction.objectStore(QUESTIONS_STORE);
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(new Error('Failed to clear questions'));
      }),
    ]);
  }

  // Get cache statistics
  async getStats(): Promise<{ lessonCount: number; questionCount: number }> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    const lessonCount = await new Promise<number>((resolve, reject) => {
      const transaction = this.db!.transaction([LESSONS_STORE], 'readonly');
      const store = transaction.objectStore(LESSONS_STORE);
      const request = store.count();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(new Error('Failed to count lessons'));
    });

    const questionCount = await new Promise<number>((resolve, reject) => {
      const transaction = this.db!.transaction([QUESTIONS_STORE], 'readonly');
      const store = transaction.objectStore(QUESTIONS_STORE);
      const request = store.count();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(new Error('Failed to count questions'));
    });

    return { lessonCount, questionCount };
  }
}

// Export singleton instance
export const contentCache = new ContentCache();
