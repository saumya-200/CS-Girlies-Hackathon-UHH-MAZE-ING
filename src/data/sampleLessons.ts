// Sample lesson data for demonstration

import type { Lesson } from '../types/content.types';

export const sampleLessons: Record<string, Lesson> = {
  'intro-to-javascript': {
    id: 'intro-to-javascript',
    topic: 'JavaScript',
    title: 'Introduction to JavaScript',
    body: `
## What is JavaScript?

JavaScript is a versatile programming language that runs in web browsers, allowing you to create interactive websites and web applications.

### Key Concepts:

**1. Variables**
Variables store data that can be used and changed throughout your program.
\`\`\`javascript
let name = "Alice";
const age = 25;
\`\`\`

**2. Functions**
Functions are reusable blocks of code that perform specific tasks.
\`\`\`javascript
function greet(name) {
  return "Hello, " + name + "!";
}
\`\`\`

**3. Conditionals**
Make decisions in your code using if/else statements.
\`\`\`javascript
if (age >= 18) {
  console.log("Adult");
} else {
  console.log("Minor");
}
\`\`\`

### Why Learn JavaScript?
- Powers 95%+ of websites
- Full-stack development (frontend + backend)
- Huge community and ecosystem
- Great career opportunities
    `,
    summary: 'JavaScript is a programming language for creating interactive web content. Learn about variables, functions, and conditionals.',
    keywords: ['javascript', 'programming', 'variables', 'functions', 'web development'],
    estimatedReadingMinutes: 3,
    difficulty: 'beginner',
    createdAt: Date.now(),
    version: 1,
  },
  
  'python-basics': {
    id: 'python-basics',
    topic: 'Python',
    title: 'Python Programming Basics',
    body: `
## Getting Started with Python

Python is a beginner-friendly programming language known for its clean syntax and powerful capabilities.

### Core Concepts:

**1. Variables and Data Types**
\`\`\`python
name = "Bob"
age = 30
height = 5.9
is_student = True
\`\`\`

**2. Lists and Loops**
\`\`\`python
fruits = ["apple", "banana", "orange"]
for fruit in fruits:
    print(fruit)
\`\`\`

**3. Functions**
\`\`\`python
def calculate_area(length, width):
    return length * width
\`\`\`

### Python Applications:
- Data Science & Machine Learning
- Web Development (Django, Flask)
- Automation & Scripting
- Scientific Computing
    `,
    summary: 'Python is an easy-to-learn language used in data science, web development, and automation. Master the fundamentals here.',
    keywords: ['python', 'programming', 'data types', 'functions', 'loops'],
    estimatedReadingMinutes: 3,
    difficulty: 'beginner',
    createdAt: Date.now(),
    version: 1,
  },
  
  'algorithms-intro': {
    id: 'algorithms-intro',
    topic: 'Algorithms',
    title: 'Introduction to Algorithms',
    body: `
## Understanding Algorithms

An algorithm is a step-by-step procedure for solving a problem or accomplishing a task.

### What Makes a Good Algorithm?

**1. Correctness**
- Produces the right output for all valid inputs
- Handles edge cases properly

**2. Efficiency**
- Time complexity (how fast it runs)
- Space complexity (how much memory it uses)

**3. Clarity**
- Easy to understand and maintain
- Well-documented code

### Common Algorithm Types:

**Sorting Algorithms**
Arrange data in a specific order (ascending/descending).

**Search Algorithms**
Find specific items in a dataset efficiently.

**Graph Algorithms**
Navigate and analyze connected data structures.

### Big O Notation:
We measure algorithm efficiency using Big O:
- O(1): Constant time
- O(n): Linear time
- O(log n): Logarithmic time
- O(n²): Quadratic time
    `,
    summary: 'Algorithms are step-by-step procedures for solving problems. Learn about efficiency, Big O notation, and common algorithm types.',
    keywords: ['algorithms', 'big o', 'efficiency', 'sorting', 'searching'],
    estimatedReadingMinutes: 4,
    difficulty: 'intermediate',
    createdAt: Date.now(),
    version: 1,
  },
};
