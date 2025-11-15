// Sample quiz questions for demonstration

import type { Question } from '../types/content.types';

export const sampleQuestions: Record<string, Question> = {
  'js-var-1': {
    id: 'js-var-1',
    type: 'multiple_choice',
    topic: 'JavaScript',
    prompt: 'Which keyword is used to declare a variable that can be reassigned in JavaScript?',
    options: ['let', 'const', 'var', 'function'],
    correctAnswer: 'let',
    hint: 'Think about which keyword allows you to change the value later.',
    explanation: 'The "let" keyword declares a block-scoped variable that can be reassigned. "const" creates a variable that cannot be reassigned.',
    difficulty: 1,
    estimatedTimeSeconds: 30,
  },
  
  'js-func-1': {
    id: 'js-func-1',
    type: 'multiple_choice',
    prompt: 'What is the correct syntax to define a function in JavaScript?',
    topic: 'JavaScript',
    options: [
      'function myFunc() {}',
      'def myFunc():',
      'func myFunc() {}',
      'function: myFunc() {}'
    ],
    correctAnswer: 'function myFunc() {}',
    hint: 'JavaScript uses the "function" keyword followed by the function name.',
    explanation: 'JavaScript functions are defined using the "function" keyword, followed by the function name, parentheses for parameters, and curly braces for the function body.',
    difficulty: 1,
    estimatedTimeSeconds: 30,
  },
  
  'js-cond-1': {
    id: 'js-cond-1',
    type: 'true_false',
    prompt: 'In JavaScript, the "===" operator checks for both value and type equality.',
    topic: 'JavaScript',
    correctAnswer: 'true',
    hint: 'Tri ple equals is the strict equality operator.',
    explanation: 'True! The "===" operator (strict equality) checks both value and type, while "==" (loose equality) only checks value after type coercion.',
    difficulty: 2,
    estimatedTimeSeconds: 20,
  },
  
  'py-type-1': {
    id: 'py-type-1',
    type: 'multiple_choice',
    prompt: 'Which of these is NOT a valid data type in Python?',
    topic: 'Python',
    options: ['int', 'str', 'bool', 'character'],
    correctAnswer: 'character',
    hint: 'Python doesn\'t have a separate type for single characters.',
    explanation: 'Python doesn\'t have a "character" type - single characters are just strings of length 1. The valid types are int, str, bool, float, list, dict, etc.',
    difficulty: 1,
    estimatedTimeSeconds: 30,
  },
  
  'py-loop-1': {
    id: 'py-loop-1',
    type: 'short_answer',
    prompt: 'What keyword is used to iterate over items in a Python list?',
    topic: 'Python',
    correctAnswer: 'for',
    hint: 'It\'s a 3-letter keyword commonly used in loops.',
    explanation: 'The "for" keyword is used to iterate over items: "for item in my_list:"',
    difficulty: 1,
    estimatedTimeSeconds: 25,
  },
  
  'py-func-1': {
    id: 'py-func-1',
    type: 'true_false',
    prompt: 'In Python, you must explicitly declare the return type of a function.',
    topic: 'Python',
    correctAnswer: 'false',
    hint: 'Python is dynamically typed.',
    explanation: 'False! Python is dynamically typed, so you don\'t need to declare return types (though type hints are optional).',
    difficulty: 2,
    estimatedTimeSeconds: 20,
  },
  
  'algo-time-1': {
    id: 'algo-time-1',
    type: 'multiple_choice',
    prompt: 'What is the time complexity of accessing an element in an array by index?',
    topic: 'Algorithms',
    options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
    correctAnswer: 'O(1)',
    hint: 'Accessing by index is direct - it doesn\'t depend on array size.',
    explanation: 'O(1) - constant time. Arrays store elements contiguously in memory, so accessing by index is instant regardless of array size.',
    difficulty: 2,
    estimatedTimeSeconds: 40,
  },
  
  'algo-search-1': {
    id: 'algo-search-1',
    type: 'multiple_choice',
    prompt: 'Which search algorithm requires the data to be sorted first?',
    topic: 'Algorithms',
    options: ['Binary Search', 'Linear Search', 'Both', 'Neither'],
    correctAnswer: 'Binary Search',
    hint: 'One algorithm divides the search space in half each time.',
    explanation: 'Binary Search requires sorted data because it works by repeatedly dividing the search space in half. Linear Search works on unsorted data.',
    difficulty: 2,
    estimatedTimeSeconds: 35,
  },
  
  'algo-big-o-1': {
    id: 'algo-big-o-1',
    type: 'short_answer',
    prompt: 'What Big O notation describes an algorithm whose runtime doubles when input doubles?',
    topic: 'Algorithms',
    correctAnswer: 'O(n)',
    hint: 'It\'s a linear relationship.',
    explanation: 'O(n) - linear time complexity. If input doubles, runtime doubles. This is characteristic of algorithms that process each element once.',
    difficulty: 3,
    estimatedTimeSeconds: 45,
  },
};
