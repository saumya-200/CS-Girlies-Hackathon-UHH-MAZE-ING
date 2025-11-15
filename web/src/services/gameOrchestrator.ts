/**
 * Game Orchestrator - Helper utilities for level clustering and management
 * Provides utilities to work with the existing level design system
 */

import { levelDesigner, type LevelBlueprint, type LevelCluster } from './levelDesigner';
import { contentService } from './contentService';
import type { CurriculumTopic } from '../data/curriculum';
import type { Lesson, Question } from '../types/content.types';

/**
 * Level cluster generation result
 */
export interface ClusterGenerationResult {
  cluster: LevelCluster;
  content: Map<number, { lesson: Lesson; questions: Question[] }>;
  topic: CurriculumTopic;
}

/**
 * Generate a complete 3-level cluster with content
 */
export async function generateCompleteCluster(
  topic: CurriculumTopic
): Promise<ClusterGenerationResult> {
  console.log(`🎮 Generating cluster for topic: ${topic.title}`);
  
  // Get content first to calculate complexity
  const sampleContent = await contentService.getLesson({
    topic: topic.id,
    complexity: topic.targetComplexity,
  });
  
  // Generate sample questions (one of each type for complexity calculation)
  const sampleQuestions: Question[] = [];
  const questionTypes: Array<'multiple_choice' | 'short_answer' | 'true_false'> = 
    ['multiple_choice', 'short_answer', 'true_false'];
  
  for (const qType of questionTypes) {
    const question = await contentService.getQuestion({
      topic: topic.id,
      type: qType,
      difficulty: topic.targetComplexity > 50 ? 4 : topic.targetComplexity > 30 ? 3 : 2,
      complexity: topic.targetComplexity,
    });
    sampleQuestions.push(question);
  }
  
  // Calculate complexity
  const complexity = levelDesigner.calculateComplexityScore(
    topic.title,
    sampleContent,
    sampleQuestions
  );
  
  console.log('📊 Complexity score:', complexity);
  
  // Generate cluster blueprint
  const cluster = levelDesigner.generateLevelCluster(
    topic.title,
    complexity,
    topic.suggestedQuestionCount
  );
  
  console.log('📋 Cluster blueprint:', cluster);
  
  // Generate content for each level
  const contentMap = new Map<number, { lesson: Lesson; questions: Question[] }>();
  
  for (const level of cluster.levels) {
    // Get or generate lesson for this level
    const lesson = await contentService.getLesson({
      topic: topic.id,
      complexity: level.complexity.score,
    });
    
    // Generate questions based on recommended types
    const questions: Question[] = [];
    const questionTypesForLevel = level.questionTypes;
    const questionsPerType = Math.ceil(level.questionTileCount / questionTypesForLevel.length);
    
    for (const qType of questionTypesForLevel) {
      for (let i = 0; i < questionsPerType && questions.length < level.questionTileCount; i++) {
        const question = await contentService.getQuestion({
          topic: topic.id,
          type: qType,
          difficulty: Math.floor(level.complexity.score / 20) + 1, // 1-5 scale
          complexity: level.complexity.score,
        });
        questions.push(question);
      }
    }
    
    contentMap.set(level.levelNumber, { lesson, questions });
  }
  
  console.log(`✅ Cluster generated with ${cluster.levels.length} levels`);
  
  return {
    cluster,
    content: contentMap,
    topic,
  };
}

/**
 * Get progression path description for a cluster
 */
export function getClusterProgression(cluster: LevelCluster): string[] {
  const progression = levelDesigner.createProgressionPath(cluster);
  return progression.map(p => 
    `Level ${p.level}: ${p.description} - ${p.goals.join(', ')}`
  );
}

/**
 * Get difficulty curve for a cluster
 */
export function getClusterDifficultyCurve(cluster: LevelCluster) {
  return levelDesigner.getDifficultyCurve(cluster);
}

/**
 * Validate all levels in a cluster
 */
export function validateCluster(cluster: LevelCluster): {
  isValid: boolean;
  levelIssues: Map<number, string[]>;
} {
  const levelIssues = new Map<number, string[]>();
  let isValid = true;
  
  for (const level of cluster.levels) {
    const validation = levelDesigner.validateLevelBlueprint(level);
    if (!validation.isValid) {
      levelIssues.set(level.levelNumber, validation.issues);
      isValid = false;
    }
  }
  
  return { isValid, levelIssues };
}

/**
 * Calculate aggregate statistics for a cluster
 */
export function calculateClusterStats(cluster: LevelCluster) {
  return {
    totalLevels: cluster.levels.length,
    totalQuestions: cluster.totalQuestions,
    totalEstimatedMinutes: cluster.estimatedTotalMinutes,
    averageQuestionsPerLevel: Math.round(cluster.totalQuestions / cluster.levels.length),
    difficultyRange: {
      min: Math.min(...cluster.levels.map(l => l.complexity.score)),
      max: Math.max(...cluster.levels.map(l => l.complexity.score)),
    },
  };
}

/**
 * Get recommended question types for a level
 */
export function getRecommendedQuestionTypes(
  blueprint: LevelBlueprint
): Array<'multiple_choice' | 'short_answer' | 'true_false'> {
  return blueprint.questionTypes;
}

/**
 * Check if cluster meets quality standards
 */
export function meetsQualityStandards(cluster: LevelCluster): {
  meets: boolean;
  reasons: string[];
} {
  const reasons: string[] = [];
  
  // Check total questions
  if (cluster.totalQuestions < 9) {
    reasons.push('Too few questions (minimum 9 for a cluster)');
  }
  
  if (cluster.totalQuestions > 45) {
    reasons.push('Too many questions (maximum 45 for a cluster)');
  }
  
  // Check time requirements
  if (cluster.estimatedTotalMinutes < 10) {
    reasons.push('Cluster too short (minimum 10 minutes)');
  }
  
  if (cluster.estimatedTotalMinutes > 90) {
    reasons.push('Cluster too long (maximum 90 minutes)');
  }
  
  // Check level count
  if (cluster.levels.length < 1) {
    reasons.push('No levels in cluster');
  }
  
  if (cluster.levels.length > 3) {
    reasons.push('Too many levels (maximum 3 per cluster)');
  }
  
  // Validate each level
  for (const level of cluster.levels) {
    const validation = levelDesigner.validateLevelBlueprint(level);
    if (!validation.isValid) {
      reasons.push(`Level ${level.levelNumber}: ${validation.issues.join(', ')}`);
    }
  }
  
  return {
    meets: reasons.length === 0,
    reasons,
  };
}
