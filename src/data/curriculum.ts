// Sample curriculum with topics for the educational maze game

export interface CurriculumTopic {
  id: string;
  title: string;
  description: string;
  subject: 'programming' | 'mathematics' | 'science' | 'language';
  targetComplexity: number; // 1-100
  suggestedQuestionCount: number;
  learningOutcomes: string[];
}

export const CURRICULUM_TOPICS: Record<string, CurriculumTopic> = {
  'js-basics': {
    id: 'js-basics',
    title: 'JavaScript Fundamentals',
    description: 'Learn the core concepts of JavaScript programming including variables, data types, and basic operators.',
    subject: 'programming',
    targetComplexity: 30,
    suggestedQuestionCount: 9,
    learningOutcomes: [
      'Understand variables and data types',
      'Use basic operators and expressions',
      'Write simple JavaScript statements',
      'Debug basic syntax errors',
    ],
  },
  
  'python-intro': {
    id: 'python-intro',
    title: 'Python Programming',
    description: 'Introduction to Python programming with focus on syntax, functions, and control structures.',
    subject: 'programming',
    targetComplexity: 35,
    suggestedQuestionCount: 9,
    learningOutcomes: [
      'Understand Python syntax basics',
      'Define and use functions',
      'Implement control flow structures',
      'Work with lists and dictionaries',
    ],
  },
  
  'algorithms-basics': {
    id: 'algorithms-basics',
    title: 'Algorithm Fundamentals',
    description: 'Core algorithmic concepts including searching, sorting, and complexity analysis.',
    subject: 'programming',
    targetComplexity: 55,
    suggestedQuestionCount: 12,
    learningOutcomes: [
      'Understand Big O notation',
      'Implement basic search algorithms',
      'Apply sorting techniques',
      'Analyze algorithm efficiency',
    ],
  },
  
  'data-structures': {
    id: 'data-structures',
    title: 'Data Structures',
    description: 'Essential data structures including arrays, linked lists, stacks, queues, and trees.',
    subject: 'programming',
    targetComplexity: 65,
    suggestedQuestionCount: 15,
    learningOutcomes: [
      'Choose appropriate data structures',
      'Implement common data structures',
      'Understand time/space tradeoffs',
      'Solve problems using data structures',
    ],
  },
  
  'web-development': {
    id: 'web-development',
    title: 'Web Development Basics',
    description: 'Fundamentals of web development with HTML, CSS, and JavaScript.',
    subject: 'programming',
    targetComplexity: 40,
    suggestedQuestionCount: 10,
    learningOutcomes: [
      'Create semantic HTML structure',
      'Style pages with CSS',
      'Add interactivity with JavaScript',
      'Understand client-server model',
    ],
  },
};

// Recommended learning path
export const LEARNING_PATHS = {
  'programming-beginner': {
    id: 'programming-beginner',
    title: 'Programming Fundamentals Path',
    description: 'Perfect for beginners starting their programming journey',
    topics: ['js-basics', 'python-intro', 'web-development'],
    estimatedTotalHours: 12,
  },
  
  'programming-intermediate': {
    id: 'programming-intermediate',
    title: 'Computer Science Essentials',
    description: 'Build strong CS foundations with algorithms and data structures',
    topics: ['algorithms-basics', 'data-structures'],
    estimatedTotalHours: 15,
  },
};

// Get topic by ID
export function getTopic(id: string): CurriculumTopic | undefined {
  return CURRICULUM_TOPICS[id];
}

// Get all topics for a subject
export function getTopicsBySubject(subject: string): CurriculumTopic[] {
  return Object.values(CURRICULUM_TOPICS).filter(t => t.subject === subject);
}

// Get recommended next topic based on completed topics
export function getNextRecommendedTopic(completedTopicIds: string[]): CurriculumTopic | null {
  // Simple recommendation: return first incomplete topic in beginner path
  const beginnerPath = LEARNING_PATHS['programming-beginner'];
  
  for (const topicId of beginnerPath.topics) {
    if (!completedTopicIds.includes(topicId)) {
      return CURRICULUM_TOPICS[topicId];
    }
  }
  
  // If beginner path complete, try intermediate
  const intermediatePath = LEARNING_PATHS['programming-intermediate'];
  for (const topicId of intermediatePath.topics) {
    if (!completedTopicIds.includes(topicId)) {
      return CURRICULUM_TOPICS[topicId];
    }
  }
  
  return null; // All topics completed!
}
