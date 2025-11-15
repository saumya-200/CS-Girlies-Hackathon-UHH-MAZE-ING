// Content generation service for creating educational content

import type { Lesson, Question } from '../types/content.types';

export interface GenerationRequest {
  topic: string;
  complexity: number; // 1-5 scale
  subtopics?: string[];
}

export interface QuestionGenerationRequest extends GenerationRequest {
  type: 'multiple_choice' | 'short_answer' | 'true_false';
  difficulty: number; // 1-5 scale
}

// Content generation templates
const LESSON_TEMPLATES = {
  introduction: (topic: string) => `
# Introduction to ${topic}

## Overview
${topic} is an essential concept that forms the foundation of many advanced topics.

## Key Concepts
- Fundamental principles
- Core terminology
- Basic applications
- Common patterns

## Why Learn ${topic}?
- Builds problem-solving skills
- Widely used in practice
- Opens doors to advanced topics
- Enhances critical thinking

## Getting Started
Begin by understanding the basic principles and gradually build up to more complex applications.

📚 **Summary**: ${topic} provides essential knowledge for continued learning and practical application.
  `.trim(),

  intermediate: (topic: string) => `
# Deep Dive into ${topic}

## Advanced Concepts
This lesson explores intermediate-level concepts in ${topic}.

## Core Principles
- Advanced techniques
- Best practices
- Real-world applications
- Common pitfalls to avoid

## Practical Applications
${topic} is used extensively in:
- Software development
- Data analysis
- Problem solving
- System design

## Expert Tips
- Practice regularly
- Build projects
- Learn from mistakes
- Stay updated

📚 **Summary**: Master ${topic} through practice and application of advanced concepts.
  `.trim(),

  advanced: (topic: string) => `
# Mastering ${topic}

## Expert-Level Content
Explore the most advanced aspects of ${topic}.

## Advanced Topics
- Complex patterns
- Optimization techniques
- Edge cases
- Performance considerations

## Industry Applications
Professionals use ${topic} for:
- Large-scale systems
- High-performance applications
- Critical infrastructure
- Innovation and research

## Mastery Path
- Deep understanding of fundamentals
- Extensive practical experience
- Contributing to community
- Continuous learning

📚 **Summary**: Achieve mastery in ${topic} through dedication and advanced practice.
  `.trim(),
};

export class ContentGenerator {
  // Generate a lesson based on topic and complexity
  async generateLesson(request: GenerationRequest): Promise<Lesson> {
    const { topic, complexity = 1 } = request;
    
    // Determine difficulty level
    const difficulty: 'beginner' | 'intermediate' | 'advanced' = 
      complexity <= 2 ? 'beginner' : complexity <= 4 ? 'intermediate' : 'advanced';
    
    // Select appropriate template
    const template = complexity <= 2 ? LESSON_TEMPLATES.introduction :
                    complexity <= 4 ? LESSON_TEMPLATES.intermediate :
                    LESSON_TEMPLATES.advanced;
    
    // Generate lesson content
    const content = template(topic);
    
    // Calculate estimated reading time (200 words per minute)
    const wordCount = content.split(/\s+/).length;
    const estimatedReadingMinutes = Math.max(1, Math.ceil(wordCount / 200));
    
    // Extract keywords from content
    const keywords = this.extractKeywords(content, topic);
    
    // Create lesson object
    const lesson: Lesson = {
      id: `${topic.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
      title: `${difficulty === 'beginner' ? 'Introduction to' : difficulty === 'intermediate' ? 'Deep Dive into' : 'Mastering'} ${topic}`,
      topic,
      difficulty,
      estimatedReadingMinutes,
      body: content,
      summary: this.generateSummary(topic, difficulty),
      keywords,
      createdAt: Date.now(),
      version: 1,
    };
    
    return lesson;
  }
  
  // Generate a question based on parameters
  async generateQuestion(request: QuestionGenerationRequest): Promise<Question> {
    const { topic, type, difficulty = 3 } = request;
    
    // Generate question based on type
    switch (type) {
      case 'multiple_choice':
        return this.generateMultipleChoice(topic, difficulty);
      case 'short_answer':
        return this.generateShortAnswer(topic, difficulty);
      case 'true_false':
        return this.generateTrueFalse(topic, difficulty);
      default:
        throw new Error(`Unknown question type: ${type}`);
    }
  }
  
  // Generate multiple choice question
  private generateMultipleChoice(topic: string, difficulty: number): Question {
    const templates = [
      {
        prompt: `What is a key characteristic of ${topic}?`,
        correct: `It provides essential functionality`,
        distractors: [
          'It is rarely used in practice',
          'It has no practical applications',
          'It should be avoided when possible',
        ],
      },
      {
        prompt: `Which of the following best describes ${topic}?`,
        correct: 'A fundamental concept with wide applications',
        distractors: [
          'An outdated technique',
          'A minor implementation detail',
          'A rarely used pattern',
        ],
      },
      {
        prompt: `When should you use ${topic}?`,
        correct: 'When solving problems in this domain',
        distractors: [
          'Never, it\'s deprecated',
          'Only in legacy systems',
          'As a last resort',
        ],
      },
    ];
    
    const template = templates[Math.floor(Math.random() * templates.length)];
    
    // Shuffle options
    const options = [template.correct, ...template.distractors];
    this.shuffleArray(options);
    
    const correctIndex = options.indexOf(template.correct);
    
    return {
      id: `${topic.toLowerCase().replace(/\s+/g, '-')}-mc-${Date.now()}`,
      type: 'multiple_choice',
      prompt: template.prompt,
      options,
      correctAnswer: correctIndex,
      hint: `Think about the core principles of ${topic}`,
      explanation: `${template.correct} is the correct answer because ${topic} is designed with this purpose in mind.`,
      difficulty,
      topic,
      estimatedTimeSeconds: 30 + (difficulty * 10),
    };
  }
  
  // Generate short answer question
  private generateShortAnswer(topic: string, difficulty: number): Question {
    const templates = [
      {
        prompt: `In one word, what is the primary purpose of ${topic}?`,
        answer: topic.split(' ').pop() || topic,
      },
      {
        prompt: `What concept does ${topic} relate to most closely?`,
        answer: 'fundamentals',
      },
    ];
    
    const template = templates[Math.floor(Math.random() * templates.length)];
    
    return {
      id: `${topic.toLowerCase().replace(/\s+/g, '-')}-sa-${Date.now()}`,
      type: 'short_answer',
      prompt: template.prompt,
      correctAnswer: template.answer,
      hint: `Think about the core meaning of ${topic}`,
      explanation: `The answer relates to the fundamental concept of ${topic}.`,
      difficulty,
      topic,
      estimatedTimeSeconds: 45 + (difficulty * 15),
    };
  }
  
  // Generate true/false question
  private generateTrueFalse(topic: string, difficulty: number): Question {
    const isTrue = Math.random() > 0.5;
    
    const templates = {
      true: [
        `${topic} is an important concept in its field.`,
        `Understanding ${topic} helps build foundational knowledge.`,
        `${topic} has practical real-world applications.`,
      ],
      false: [
        `${topic} should never be used in modern applications.`,
        `${topic} has no relevance to current practices.`,
        `Learning ${topic} provides no benefit.`,
      ],
    };
    
    const statements = isTrue ? templates.true : templates.false;
    const prompt = statements[Math.floor(Math.random() * statements.length)];
    
    return {
      id: `${topic.toLowerCase().replace(/\s+/g, '-')}-tf-${Date.now()}`,
      type: 'true_false',
      prompt,
      correctAnswer: isTrue ? 'true' : 'false',
      hint: `Consider the value and importance of ${topic}`,
      explanation: `This statement is ${isTrue ? 'true' : 'false'} because ${topic} ${isTrue ? 'is' : 'is not'} a valuable concept to understand.`,
      difficulty,
      topic,
      estimatedTimeSeconds: 20 + (difficulty * 5),
    };
  }
  
  // Extract keywords from content
  private extractKeywords(content: string, topic: string): string[] {
    const keywords: string[] = [topic];
    const lines = content.split('\n');
    
    // Extract words from headings and bullet points
    for (const line of lines) {
      if (line.trim().startsWith('#') || line.trim().startsWith('-')) {
        const words = line
          .replace(/[#-]/g, '')
          .split(/\s+/)
          .filter(w => w.length > 4 && w.toLowerCase() !== 'the');
        keywords.push(...words.slice(0, 2));
      }
    }
    
    // Return unique keywords, max 5
    return [...new Set(keywords)].slice(0, 5);
  }
  
  // Generate summary
  private generateSummary(topic: string, difficulty: string): string {
    const summaries = {
      beginner: `Learn the fundamentals of ${topic} and build a strong foundation for further study.`,
      intermediate: `Explore advanced concepts in ${topic} and apply them to real-world scenarios.`,
      advanced: `Master ${topic} through expert-level content and advanced applications.`,
    };
    
    return summaries[difficulty as keyof typeof summaries] || summaries.beginner;
  }
  
  // Fisher-Yates shuffle
  private shuffleArray<T>(array: T[]): void {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }
}

// Export singleton instance
export const contentGenerator = new ContentGenerator();
