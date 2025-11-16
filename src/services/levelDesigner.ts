// Level design service for complexity mapping and level generation

import type { Lesson, Question } from '../types/content.types';

export interface ComplexityScore {
  topic: string;
  contentAmount: number; // 1-10 scale
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  recommendedLevels: number; // How many levels this topic should span
  score: number; // Overall complexity 1-100
}

export interface LevelBlueprint {
  levelNumber: number;
  topic: string;
  complexity: ComplexityScore;
  mazeSize: { width: number; height: number };
  questionTileCount: number;
  requiredCorrectAnswers: number;
  estimatedCompletionMinutes: number;
  questionTypes: Array<'multiple_choice' | 'short_answer' | 'true_false'>;
}

export interface LevelCluster {
  id: string;
  title: string;
  topic: string;
  levels: LevelBlueprint[];
  totalQuestions: number;
  estimatedTotalMinutes: number;
}

export class LevelDesigner {
  // Calculate complexity score for a topic
  calculateComplexityScore(
    topic: string,
    lesson: Lesson,
    questions: Question[]
  ): ComplexityScore {
    let score = 0;
    
    // Factor 1: Lesson length (30% weight)
    const wordCount = lesson.body.split(/\s+/).length;
    const lengthScore = Math.min(30, (wordCount / 100) * 10);
    score += lengthScore;
    
    // Factor 2: Difficulty level (25% weight)
    const difficultyScore = lesson.difficulty === 'beginner' ? 8 :
                           lesson.difficulty === 'intermediate' ? 18 : 25;
    score += difficultyScore;
    
    // Factor 3: Number of questions (20% weight)
    const questionScore = Math.min(20, questions.length * 2);
    score += questionScore;
    
    // Factor 4: Average question difficulty (15% weight)
    const avgDifficulty = questions.reduce((sum, q) => sum + q.difficulty, 0) / questions.length;
    const questionDifficultyScore = (avgDifficulty / 5) * 15;
    score += questionDifficultyScore;
    
    // Factor 5: Keyword count (5% weight)
    const keywordScore = Math.min(5, lesson.keywords.length);
    score += keywordScore;
    
    // Factor 6: Reading time (5% weight)
    const readingScore = Math.min(5, lesson.estimatedReadingMinutes / 2);
    score += readingScore;
    
    // Calculate recommended levels
    const recommendedLevels = score <= 30 ? 1 :
                              score <= 60 ? 2 : 3;
    
    // Content amount (1-10)
    const contentAmount = Math.ceil((wordCount / 200) * 2);
    
    return {
      topic,
      contentAmount: Math.min(10, contentAmount),
      difficulty: lesson.difficulty,
      recommendedLevels,
      score: Math.round(score),
    };
  }
  
  // Map complexity score to maze size
  getMazeSize(complexityScore: number): { width: number; height: number } {
    if (complexityScore <= 25) {
      return { width: 12, height: 12 }; // Easy/Small
    } else if (complexityScore <= 50) {
      return { width: 15, height: 15 }; // Medium
    } else if (complexityScore <= 75) {
      return { width: 18, height: 18 }; // Hard
    } else {
      return { width: 20, height: 20 }; // Very Hard
    }
  }
  
  // Calculate number of question tiles based on complexity
  getQuestionTileCount(complexityScore: number, mazeSize: { width: number; height: number }): number {
    const totalTiles = mazeSize.width * mazeSize.height;
    const pathTiles = Math.floor(totalTiles * 0.4); // ~40% are path tiles
    
    // Question tiles should be 15-25% of path tiles
    const minQuestions = Math.ceil(pathTiles * 0.15);
    const maxQuestions = Math.ceil(pathTiles * 0.25);
    
    // Scale with complexity
    const ratio = complexityScore / 100;
    const questions = Math.round(minQuestions + (maxQuestions - minQuestions) * ratio);
    
    return Math.max(3, Math.min(15, questions)); // Min 3, max 15
  }
  
  // Generate a level blueprint
  generateLevelBlueprint(
    levelNumber: number,
    topic: string,
    complexity: ComplexityScore,
    questionCount: number
  ): LevelBlueprint {
    const mazeSize = this.getMazeSize(complexity.score);
    const questionTileCount = Math.min(questionCount, this.getQuestionTileCount(complexity.score, mazeSize));
    
    // Required correct answers (50-75% of questions)
    const requiredCorrectAnswers = Math.ceil(questionTileCount * 0.6);
    
    // Estimated completion time
    // Base: 2 min + 1 min per question + maze exploration (based on size)
    const exploreTime = (mazeSize.width * mazeSize.height) / 50; // ~1 min per 50 tiles
    const questionTime = questionTileCount * 1; // 1 min per question
    const estimatedCompletionMinutes = Math.ceil(2 + exploreTime + questionTime);
    
    // Question type distribution based on difficulty
    const questionTypes: Array<'multiple_choice' | 'short_answer' | 'true_false'> = [];
    
    if (complexity.difficulty === 'beginner') {
      // More true/false, some multiple choice
      questionTypes.push('true_false', 'true_false', 'multiple_choice');
    } else if (complexity.difficulty === 'intermediate') {
      // Balanced mix
      questionTypes.push('multiple_choice', 'multiple_choice', 'short_answer');
    } else {
      // More challenging questions
      questionTypes.push('multiple_choice', 'short_answer', 'short_answer');
    }
    
    return {
      levelNumber,
      topic,
      complexity,
      mazeSize,
      questionTileCount,
      requiredCorrectAnswers,
      estimatedCompletionMinutes,
      questionTypes,
    };
  }
  
  // Generate a 3-level cluster for a topic
  generateLevelCluster(
    topic: string,
    complexity: ComplexityScore,
    availableQuestions: number
  ): LevelCluster {
    const levels: LevelBlueprint[] = [];
    const levelsToCreate = Math.min(3, complexity.recommendedLevels);
    
    // Distribute questions across levels
    const questionsPerLevel = Math.ceil(availableQuestions / levelsToCreate);
    
    for (let i = 0; i < levelsToCreate; i++) {
      // Gradually increase difficulty across levels
      const levelComplexity: ComplexityScore = {
        ...complexity,
        score: complexity.score + (i * 10), // +10 complexity per level
      };
      
      const blueprint = this.generateLevelBlueprint(
        i + 1,
        topic,
        levelComplexity,
        questionsPerLevel
      );
      
      levels.push(blueprint);
    }
    
    // Calculate cluster totals
    const totalQuestions = levels.reduce((sum, l) => sum + l.questionTileCount, 0);
    const estimatedTotalMinutes = levels.reduce((sum, l) => sum + l.estimatedCompletionMinutes, 0);
    
    return {
      id: `cluster-${topic.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
      title: `${topic} Mastery Challenge`,
      topic,
      levels,
      totalQuestions,
      estimatedTotalMinutes,
    };
  }
  
  // Create difficulty progression for a cluster
  createProgressionPath(cluster: LevelCluster): {
    level: number;
    description: string;
    goals: string[];
  }[] {
    return cluster.levels.map((level, index) => ({
      level: level.levelNumber,
      description: index === 0 ? `Introduction to ${cluster.topic}` :
                   index === 1 ? `Intermediate ${cluster.topic}` :
                   `Advanced ${cluster.topic}`,
      goals: [
        `Complete ${level.mazeSize.width}x${level.mazeSize.height} maze`,
        `Answer ${level.requiredCorrectAnswers}/${level.questionTileCount} questions correctly`,
        `Estimated time: ${level.estimatedCompletionMinutes} minutes`,
      ],
    }));
  }
  
  // Validate level design
  validateLevelBlueprint(blueprint: LevelBlueprint): {
    isValid: boolean;
    issues: string[];
  } {
    const issues: string[] = [];
    
    // Check maze size
    if (blueprint.mazeSize.width < 10 || blueprint.mazeSize.height < 10) {
      issues.push('Maze size too small (minimum 10x10)');
    }
    
    if (blueprint.mazeSize.width > 25 || blueprint.mazeSize.height > 25) {
      issues.push('Maze size too large (maximum 25x25)');
    }
    
    // Check question count
    if (blueprint.questionTileCount < 3) {
      issues.push('Too few questions (minimum 3)');
    }
    
    if (blueprint.questionTileCount > 15) {
      issues.push('Too many questions (maximum 15)');
    }
    
    // Check required answers
    if (blueprint.requiredCorrectAnswers > blueprint.questionTileCount) {
      issues.push('Required correct answers exceeds total questions');
    }
    
    if (blueprint.requiredCorrectAnswers < Math.ceil(blueprint.questionTileCount * 0.4)) {
      issues.push('Required correct answers too low (minimum 40% of questions)');
    }
    
    // Check completion time
    if (blueprint.estimatedCompletionMinutes < 3) {
      issues.push('Estimated completion time too short');
    }
    
    if (blueprint.estimatedCompletionMinutes > 30) {
      issues.push('Estimated completion time too long (maximum 30 minutes)');
    }
    
    return {
      isValid: issues.length === 0,
      issues,
    };
  }
  
  // Get recommended difficulty curve for a cluster
  getDifficultyCurve(cluster: LevelCluster): {
    level: number;
    complexity: number;
    challengeRating: 'easy' | 'medium' | 'hard';
  }[] {
    return cluster.levels.map(level => ({
      level: level.levelNumber,
      complexity: level.complexity.score,
      challengeRating: level.complexity.score <= 35 ? 'easy' :
                       level.complexity.score <= 65 ? 'medium' : 'hard',
    }));
  }
}

// Export singleton instance
export const levelDesigner = new LevelDesigner();
