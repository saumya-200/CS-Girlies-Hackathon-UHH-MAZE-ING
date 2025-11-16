// Content validation service for ensuring quality of generated content

import type { Lesson, Question, ContentValidationResult } from '../types/content.types';

export class ContentValidator {
  private profanityList: Set<string> = new Set([
    // Basic profanity filter - can be expanded
    'damn', 'hell', 'crap', 'stupid', 'idiot', 
  ]);

  // Validate a lesson
  validateLesson(lesson: Lesson): ContentValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    let score = 100;

    // Required field checks
    if (!lesson.id || lesson.id.trim().length === 0) {
      errors.push('Lesson ID is required');
      score -= 20;
    }

    if (!lesson.title || lesson.title.trim().length === 0) {
      errors.push('Lesson title is required');
      score -= 20;
    }

    if (!lesson.body || lesson.body.trim().length === 0) {
      errors.push('Lesson body is required');
      score -= 30;
    }

    if (!lesson.summary || lesson.summary.trim().length === 0) {
      errors.push('Lesson summary is required');
      score -= 15;
    }

    if (!lesson.topic || lesson.topic.trim().length === 0) {
      errors.push('Lesson topic is required');
      score -= 15;
    }

    // Content length validation
    if (lesson.body) {
      const wordCount = lesson.body.split(/\s+/).length;
      
      if (wordCount < 50) {
        warnings.push('Lesson content is very short (< 50 words)');
        score -= 5;
      } else if (wordCount > 2000) {
        warnings.push('Lesson content is very long (> 2000 words)');
        score -= 5;
      }
    }

    // Keyword quality validation
    if (!lesson.keywords || lesson.keywords.length === 0) {
      warnings.push('No keywords provided');
      score -= 5;
    } else if (lesson.keywords.length < 3) {
      warnings.push('Fewer than 3 keywords provided');
      score -= 3;
    }

    // Reading time validation
    if (lesson.estimatedReadingMinutes <= 0) {
      errors.push('Invalid estimated reading time');
      score -= 10;
    }

    // Content sanitization
    const profanityCheck = this.checkProfanity(lesson.body + ' ' + lesson.title + ' ' + lesson.summary);
    if (!profanityCheck.isClean) {
      errors.push(`Inappropriate language detected: ${profanityCheck.words.join(', ')}`);
      score -= 25;
    }

    // Check for placeholder text
    if (lesson.body.includes('TODO') || lesson.body.includes('placeholder')) {
      warnings.push('Lesson contains placeholder text');
      score -= 10;
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      score: Math.max(0, score),
    };
  }

  // Validate a question
  validateQuestion(question: Question): ContentValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    let score = 100;

    // Required field checks
    if (!question.id || question.id.trim().length === 0) {
      errors.push('Question ID is required');
      score -= 20;
    }

    if (!question.prompt || question.prompt.trim().length === 0) {
      errors.push('Question prompt is required');
      score -= 25;
    }

    if (!question.hint || question.hint.trim().length === 0) {
      warnings.push('Question hint is missing');
      score -= 5;
    }

    if (!question.explanation || question.explanation.trim().length === 0) {
      errors.push('Question explanation is required');
      score -= 15;
    }

    if (!question.topic || question.topic.trim().length === 0) {
      errors.push('Question topic is required');
      score -= 10;
    }

    // Type-specific validation
    switch (question.type) {
      case 'multiple_choice':
        if (!question.options || question.options.length < 2) {
          errors.push('Multiple choice question must have at least 2 options');
          score -= 30;
        } else if (question.options.length < 4) {
          warnings.push('Multiple choice typically has 4 options');
          score -= 5;
        }

        // Verify correct answer is valid
        if (typeof question.correctAnswer === 'number') {
          if (question.correctAnswer < 0 || !question.options || question.correctAnswer >= question.options.length) {
            errors.push('Correct answer index is out of bounds');
            score -= 25;
          }
        } else {
          errors.push('Multiple choice correct answer must be a number (index)');
          score -= 25;
        }

        // Check distractor plausibility
        if (question.options) {
          const plausibilityCheck = this.checkDistractorPlausibility(question.options);
          if (!plausibilityCheck.isPlausible) {
            warnings.push('Some distractors may be too obviously wrong');
            score -= 10;
          }
        }
        break;

      case 'short_answer':
        if (typeof question.correctAnswer !== 'string' || question.correctAnswer.trim().length === 0) {
          errors.push('Short answer correct answer must be a non-empty string');
          score -= 25;
        }

        // Check if answer is too long for "short" answer
        if (typeof question.correctAnswer === 'string' && question.correctAnswer.split(/\s+/).length > 5) {
          warnings.push('Short answer seems too long (> 5 words)');
          score -= 5;
        }
        break;

      case 'true_false':
        if (question.correctAnswer !== 'true' && question.correctAnswer !== 'false') {
          errors.push('True/false correct answer must be "true" or "false" string');
          score -= 30;
        }
        break;

      default:
        errors.push(`Unknown question type: ${question.type}`);
        score -= 50;
    }

    // Difficulty validation
    if (question.difficulty < 1 || question.difficulty > 5) {
      errors.push('Question difficulty must be between 1 and 5');
      score -= 10;
    }

    // Estimated time validation
    if (question.estimatedTimeSeconds <= 0) {
      errors.push('Invalid estimated time');
      score -= 10;
    } else if (question.estimatedTimeSeconds > 300) {
      warnings.push('Question estimated time is very long (> 5 minutes)');
      score -= 5;
    }

    // Content sanitization
    const contentToCheck = `${question.prompt} ${question.hint} ${question.explanation} ${question.options?.join(' ') || ''}`;
    const profanityCheck = this.checkProfanity(contentToCheck);
    if (!profanityCheck.isClean) {
      errors.push(`Inappropriate language detected: ${profanityCheck.words.join(', ')}`);
      score -= 30;
    }

    // Check explanation clarity
    if (question.explanation) {
      if (question.explanation.length < 20) {
        warnings.push('Explanation is very brief');
        score -= 5;
      } else if (question.explanation.length > 500) {
        warnings.push('Explanation is very lengthy');
        score -= 5;
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      score: Math.max(0, score),
    };
  }

  // Check for profanity
  private checkProfanity(text: string): { isClean: boolean; words: string[] } {
    const words: string[] = [];
    const lowerText = text.toLowerCase();

    for (const word of this.profanityList) {
      if (lowerText.includes(word)) {
        words.push(word);
      }
    }

    return {
      isClean: words.length === 0,
      words,
    };
  }

  // Check distractor plausibility for multiple choice
  private checkDistractorPlausibility(options: string[]): { isPlausible: boolean; issues: string[] } {
    const issues: string[] = [];

    // Check for distractors that are obviously wrong
    const obviouslyWrong = [
      'never',
      'always',
      'impossible',
      'deprecated',
      'obsolete',
      'useless',
    ];

    for (const option of options) {
      const lowerOption = option.toLowerCase();
      for (const keyword of obviouslyWrong) {
        if (lowerOption.includes(keyword)) {
          issues.push(`Option "${option}" may be too obviously wrong`);
        }
      }
    }

    // Check for very short distractors
    for (const option of options) {
      if (option.trim().length < 5) {
        issues.push(`Option "${option}" is very short`);
      }
    }

    // Check for duplicate options
    const uniqueOptions = new Set(options.map(o => o.toLowerCase().trim()));
    if (uniqueOptions.size < options.length) {
      issues.push('Some options appear to be duplicates');
    }

    return {
      isPlausible: issues.length === 0,
      issues,
    };
  }

  // Validate content meets minimum quality threshold
  validateContentQuality(result: ContentValidationResult, threshold: number = 70): boolean {
    return result.isValid && result.score >= threshold;
  }

  // Add profanity words to filter
  addProfanityWords(words: string[]): void {
    words.forEach(word => this.profanityList.add(word.toLowerCase()));
  }
}

// Export singleton instance
export const contentValidator = new ContentValidator();
