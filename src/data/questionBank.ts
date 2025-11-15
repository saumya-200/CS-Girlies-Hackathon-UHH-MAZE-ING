/**
 * Comprehensive Question Bank - Multiple Streams with 15-20 questions each
 * Organized by: Stream → Difficulty → Questions
 */

import type { Question } from '../types/content.types';

export interface Stream {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export const STREAMS: Stream[] = [
  { id: 'science', name: 'Science', description: 'Physics, Chemistry, Biology', icon: '🔬', color: 'blue' },
  { id: 'math', name: 'Mathematics', description: 'Algebra, Geometry, Calculus', icon: '📐', color: 'green' },
  { id: 'history', name: 'History', description: 'World History & Events', icon: '📜', color: 'yellow' },
  { id: 'geography', name: 'Geography', description: 'Countries, Capitals, Landforms', icon: '🌍', color: 'teal' },
  { id: 'literature', name: 'Literature', description: 'Books, Authors, Quotes', icon: '📚', color: 'purple' },
  { id: 'programming', name: 'Programming', description: 'Code, Algorithms, Logic', icon: '💻', color: 'cyan' },
];

export type Difficulty = 'easy' | 'medium' | 'hard';

// Science Stream Questions
const scienceQuestions: Record<Difficulty, Question[]> = {
  easy: [
    { id: 'sci-e1', type: 'multiple_choice', prompt: 'What is the chemical symbol for water?', options: ['H2O', 'CO2', 'O2', 'N2'], correctAnswer: 0, hint: 'Hydrogen and Oxygen', explanation: 'Water is H2O - two hydrogen atoms and one oxygen atom', difficulty: 1, topic: 'Chemistry', estimatedTimeSeconds: 20 },
    { id: 'sci-e2', type: 'true_false', prompt: 'The Sun is a star.', correctAnswer: 'true', hint: 'Think about what stars are', explanation: 'The Sun is actually a star - it produces light through nuclear fusion', difficulty: 1, topic: 'Astronomy', estimatedTimeSeconds: 15 },
    { id: 'sci-e3', type: 'multiple_choice', prompt: 'How many planets are in our solar system?', options: ['7', '8', '9', '10'], correctAnswer: 1, hint: 'Pluto was reclassified', explanation: 'There are 8 planets after Pluto was reclassified as a dwarf planet in 2006', difficulty: 1, topic: 'Astronomy', estimatedTimeSeconds: 20 },
    { id: 'sci-e4', type: 'short_answer', prompt: 'What gas do plants absorb from the atmosphere?', correctAnswer: 'carbon dioxide', hint: 'CO2', explanation: 'Plants absorb carbon dioxide (CO2) during photosynthesis', difficulty: 1, topic: 'Biology', estimatedTimeSeconds: 25 },
    { id: 'sci-e5', type: 'true_false', prompt: 'Humans have five senses.', correctAnswer: 'true', hint: 'sight, hearing, smell, taste, touch', explanation: 'The five traditional senses are sight, hearing, smell, taste, and touch', difficulty: 1, topic: 'Biology', estimatedTimeSeconds: 15 },
    { id: 'sci-e6', type: 'multiple_choice', prompt: 'What is the largest organ in the human body?', options: ['Heart', 'Brain', 'Skin', 'Liver'], correctAnswer: 2, hint: 'It covers your entire body', explanation: 'The skin is the largest organ, covering about 20 square feet', difficulty: 1, topic: 'Biology', estimatedTimeSeconds: 20 },
  ],
  medium: [
    { id: 'sci-m1', type: 'multiple_choice', prompt: 'What is the speed of light?', options: ['300,000 km/s', '150,000 km/s', '450,000 km/s', '600,000 km/s'], correctAnswer: 0, hint: 'Approximately 3 x 10^8 m/s', explanation: 'Light travels at approximately 300,000 kilometers per second in a vacuum', difficulty: 3, topic: 'Physics', estimatedTimeSeconds: 30 },
    { id: 'sci-m2', type: 'short_answer', prompt: 'What is the powerhouse of the cell?', correctAnswer: 'mitochondria', hint: 'Produces ATP energy', explanation: 'Mitochondria are known as the powerhouse because they generate ATP', difficulty: 3, topic: 'Biology', estimatedTimeSeconds: 25 },
    { id: 'sci-m3', type: 'multiple_choice', prompt: 'What is the pH of pure water?', options: ['5', '7', '9', '11'], correctAnswer: 1, hint: 'Neutral', explanation: 'Pure water has a pH of 7, which is neutral (neither acidic nor basic)', difficulty: 3, topic: 'Chemistry', estimatedTimeSeconds: 25 },
    { id: 'sci-m4', type: 'true_false', prompt: 'Electrons have a positive charge.', correctAnswer: 'false', hint: 'Think about protons vs electrons', explanation: 'Electrons have a negative charge, protons have apositive charge', difficulty: 3, topic: 'Physics', estimatedTimeSeconds: 20 },
    { id: 'sci-m5', type: 'multiple_choice', prompt: 'What process do plants use to make food?', options: ['Respiration', 'Photosynthesis', 'Digestion', 'Fermentation'], correctAnswer: 1, hint: 'Uses sunlight', explanation: 'Photosynthesis converts light energy into chemical energy stored in glucose', difficulty: 3, topic: 'Biology', estimatedTimeSeconds: 25 },
    { id: 'sci-m6', type: 'short_answer', prompt: 'What is the most abundant gas in Earth\'s atmosphere?', correctAnswer: 'nitrogen', hint: 'Not oxygen', explanation: 'Nitrogen makes up about 78% of Earth\'s atmosphere', difficulty: 3, topic: 'Chemistry', estimatedTimeSeconds: 30 },
  ],
  hard: [
    { id: 'sci-h1', type: 'multiple_choice', prompt: 'What is the second law of thermodynamics about?', options: ['Energy conservation', 'Entropy increase', 'Force and acceleration', 'Gravity'], correctAnswer: 1, hint: 'Disorder in systems', explanation: 'The second law states that entropy (disorder) in an isolated system always increases', difficulty: 5, topic: 'Physics', estimatedTimeSeconds: 40 },
    { id: 'sci-h2', type: 'short_answer', prompt: 'What organelle contains the cell\'s genetic material?', correctAnswer: 'nucleus', hint: 'Contains DNA', explanation: 'The nucleus stores the cell\'s DNA and controls cellular activities', difficulty: 4, topic: 'Biology', estimatedTimeSeconds: 30 },
    { id: 'sci-h3', type: 'multiple_choice', prompt: 'What is Avogadro\'s number approximately?', options: ['6.02 x 10^23', '3.14 x 10^8', '9.8 x 10^2', '1.6 x 10^-19'], correctAnswer: 0, hint: 'Mole concept', explanation: 'Avogadro\'s number (6.02 x 10^23) represents the number of particles in one mole', difficulty: 5, topic: 'Chemistry', estimatedTimeSeconds: 35 },
    { id: 'sci-h4', type: 'true_false', prompt: 'DNA replication is semi-conservative.', correctAnswer: 'true', hint: 'Each strand serves as a template', explanation: 'Semi-conservative replication means each new DNA molecule contains one original and one new strand', difficulty: 4, topic: 'Biology', estimatedTimeSeconds: 30 },
    { id: 'sci-h5', type: 'multiple_choice', prompt: 'What particle has no electric charge?', options: ['Proton', 'Electron', 'Neutron', 'Positron'], correctAnswer: 2, hint: 'Found in the nucleus', explanation: 'Neutrons are neutral particles found in the atomic nucleus with no electric charge', difficulty: 4, topic: 'Physics', estimatedTimeSeconds: 25 },
  ],
};

// Math Stream Questions
const mathQuestions: Record<Difficulty, Question[]> = {
  easy: [
    { id: 'math-e1', type: 'multiple_choice', prompt: 'What is 7 × 8?', options: ['54', '56', '64', '72'], correctAnswer: 1, hint: 'Count by 7s', explanation: '7 × 8 = 56', difficulty: 1, topic: 'Arithmetic', estimatedTimeSeconds: 15 },
    { id: 'math-e2', type: 'short_answer', prompt: 'What is 15 + 27?', correctAnswer: '42', hint: 'Add the units, then tens', explanation: '15 + 27 = 42', difficulty: 1, topic: 'Arithmetic', estimatedTimeSeconds: 20 },
    { id: 'math-e3', type: 'true_false', prompt: 'A triangle has four sides.', correctAnswer: 'false', hint: 'Tri means three', explanation: 'A triangle has three sides (tri = three)', difficulty: 1, topic: 'Geometry', estimatedTimeSeconds: 15 },
    { id: 'math-e4', type: 'multiple_choice', prompt: 'What is 50% of 100?', options: ['25', '50', '75', '100'], correctAnswer: 1, hint: 'Half', explanation: '50% means half, so 50% of 100 is 50', difficulty: 1, topic: 'Percentages', estimatedTimeSeconds: 20 },
    { id: 'math-e5', type: 'short_answer', prompt: 'How many degrees in a right angle?', correctAnswer: '90', hint: 'Quarter of a circle', explanation: 'A right angle is 90 degrees, one quarter of a full 360° rotation', difficulty: 1, topic: 'Geometry', estimatedTimeSeconds: 20 },
    { id: 'math-e6', type: 'true_false', prompt: 'Zero is a positive number.', correctAnswer: 'false', hint: 'Neither positive nor negative', explanation: 'Zero is neither positive nor negative - it\'s neutral', difficulty: 1, topic: 'Number Theory', estimatedTimeSeconds: 15 },
  ],
  medium: [
    { id: 'math-m1', type: 'multiple_choice', prompt: 'What is the square root of 144?', options: ['10', '11', '12', '13'], correctAnswer: 2, hint: '12 × 12 = ?', explanation: 'The square root of 144 is 12 because 12 × 12 = 144', difficulty: 3, topic: 'Algebra', estimatedTimeSeconds: 25 },
    { id: 'math-m2', type: 'short_answer', prompt: 'What is 3^4 (3 to the power of 4)?', correctAnswer: '81', hint: '3 × 3 × 3 × 3', explanation: '3^4 = 3 × 3 × 3 × 3 = 81', difficulty: 3, topic: 'Exponents', estimatedTimeSeconds: 30 },
    { id: 'math-m3', type: 'multiple_choice', prompt: 'What is the formula for the area of a circle?', options: ['2πr', 'πr²', 'πd', '4πr'], correctAnswer: 1, hint: 'Pi times radius squared', explanation: 'The area of a circle is πr² (pi times radius squared)', difficulty: 3, topic: 'Geometry', estimatedTimeSeconds: 25 },
    { id: 'math-m4', type: 'true_false', prompt: 'All prime numbers are odd.', correctAnswer: 'false', hint: 'What about 2?', explanation: 'False - the number 2 is prime and even', difficulty: 3, topic: 'Number Theory', estimatedTimeSeconds: 20 },
    { id: 'math-m5', type: 'multiple_choice', prompt: 'Solve for x: 2x + 5 = 13', options: ['3', '4', '5', '6'], correctAnswer: 1, hint: 'Subtract 5 first', explanation: '2x + 5 = 13 → 2x = 8 → x = 4', difficulty: 3, topic: 'Algebra', estimatedTimeSeconds: 30 },
    { id: 'math-m6', type: 'short_answer', prompt: 'What is 0.5 as a fraction?', correctAnswer: '1/2', hint: 'One half', explanation: '0.5 equals 1/2 (one half)', difficulty: 3, topic: 'Fractions', estimatedTimeSeconds: 25 },
  ],
  hard: [
    { id: 'math-h1', type: 'multiple_choice', prompt: 'What is the derivative of x²?', options: ['x', '2x', 'x²', '2x²'], correctAnswer: 1, hint: 'Power rule', explanation: 'Using the power rule, d/dx(x²) = 2x', difficulty: 5, topic: 'Calculus', estimatedTimeSeconds: 35 },
    { id: 'math-h2', type: 'short_answer', prompt: 'What is the sum of angles in a pentagon?', correctAnswer: '540', hint: '(n-2) × 180', explanation: 'A pentagon has 5 sides, so (5-2) × 180 = 540 degrees', difficulty: 4, topic: 'Geometry', estimatedTimeSeconds: 35 },
    { id: 'math-h3', type: 'multiple_choice', prompt: 'What is log₁₀(1000)?', options: ['2', '3', '4', '10'], correctAnswer: 1, hint: '10 to what power equals 1000?', explanation: 'log₁₀(1000) = 3 because 10³ = 1000', difficulty: 5, topic: 'Logarithms', estimatedTimeSeconds: 30 },
    { id: 'math-h4', type: 'true_false', prompt: 'The quadratic formula can solve any quadratic equation.', correctAnswer: 'true', hint: 'ax² + bx + c = 0', explanation: 'True - the quadratic formula works for all quadratic equations', difficulty: 4, topic: 'Algebra', estimatedTimeSeconds: 25 },
    { id: 'math-h5', type: 'multiple_choice', prompt: 'What is the integral of 1/x?', options: ['x', 'ln(x)', '1/x²', 'e^x'], correctAnswer: 1, hint: 'Natural logarithm', explanation: 'The integral of 1/x is ln(x) + C (natural logarithm)', difficulty: 5, topic: 'Calculus', estimatedTimeSeconds: 35 },
  ],
};

// History Stream Questions
const historyQuestions: Record<Difficulty, Question[]> = {
  easy: [
    { id: 'hist-e1', type: 'multiple_choice', prompt: 'Who was the first President of the United States?', options: ['Thomas Jefferson', 'George Washington', 'John Adams', 'Benjamin Franklin'], correctAnswer: 1, hint: 'Father of the nation', explanation: 'George Washington served as the first U.S. President from 1789-1797', difficulty: 1, topic: 'US History', estimatedTimeSeconds: 20 },
    { id: 'hist-e2', type: 'true_false', prompt: 'World War II ended in 1945.', correctAnswer: 'true', hint: 'Mid-1940s', explanation: 'WWII officially ended on September 2, 1945', difficulty: 1, topic: 'World Wars', estimatedTimeSeconds: 15 },
    { id: 'hist-e3', type: 'multiple_choice', prompt: 'In which year did Christopher Columbus reach the Americas?', options: ['1492', '1520', '1607', '1776'], correctAnswer: 0, hint: 'Late 15th century', explanation: 'Columbus reached the Americas in 1492', difficulty: 1, topic: 'Exploration', estimatedTimeSeconds: 20 },
    { id: 'hist-e4', type: 'short_answer', prompt: 'What ancient civilization built the pyramids?', correctAnswer: 'egyptians', hint: 'Along the Nile River', explanation: 'The ancient Egyptians built the pyramids as tombs for pharaohs', difficulty: 1, topic: 'Ancient History', estimatedTimeSeconds: 20 },
    { id: 'hist-e5', type: 'true_false', prompt: 'The Great Wall of China is visible from space.', correctAnswer: 'false', hint: 'Common misconception', explanation: 'This is a myth - the Great Wall is not visible from space with the naked eye', difficulty: 1, topic: 'World History', estimatedTimeSeconds: 15 },
    { id: 'hist-e6', type: 'multiple_choice', prompt: 'Who wrote the Declaration of Independence?', options: ['George Washington', 'Benjamin Franklin', 'Thomas Jefferson', 'John Adams'], correctAnswer: 2, hint: 'Third President', explanation: 'Thomas Jefferson was the primary author of the Declaration of Independence', difficulty: 1, topic: 'US History', estimatedTimeSeconds: 20 },
  ],
  medium: [
    { id: 'hist-m1', type: 'multiple_choice', prompt: 'The Renaissance began in which country?', options: ['France', 'Italy', 'England', 'Spain'], correctAnswer: 1, hint: 'Home of Leonardo da Vinci', explanation: 'The Renaissance began in Italy in the 14th century', difficulty: 3, topic: 'Renaissance', estimatedTimeSeconds: 25 },
    { id: 'hist-m2', type: 'short_answer', prompt: 'What year did the Berlin Wall fall?', correctAnswer: '1989', hint: 'Late 1980s', explanation: 'The Berlin Wall fell on November 9, 1989', difficulty: 3, topic: 'Cold War', estimatedTimeSeconds: 25 },
    { id: 'hist-m3', type: 'multiple_choice', prompt: 'Who was the first person to walk on the moon?', options: ['Buzz Aldrin', 'Neil Armstrong', 'Yuri Gagarin', 'John Glenn'], correctAnswer: 1, hint: 'Apollo 11 commander', explanation: 'Neil Armstrong was the first human to walk on the moon on July 20, 1969', difficulty: 3, topic: 'Space Race', estimatedTimeSeconds: 25 },
    { id: 'hist-m4', type: 'true_false', prompt: 'Julius Caesar was the first Roman Emperor.', correctAnswer: 'false', hint: 'He was a dictator', explanation: 'False - Augustus was the first Roman Emperor. Caesar was a dictator', difficulty: 3, topic: 'Roman History', estimatedTimeSeconds: 20 },
    { id: 'hist-m5', type: 'multiple_choice', prompt: 'The French Revolution began in which year?', options: ['1776', '1789', '1804', '1815'], correctAnswer: 1, hint: 'Same year as US Constitution', explanation: 'The French Revolution began in 1789 with the storming of the Bastille', difficulty: 3, topic: 'French History', estimatedTimeSeconds: 25 },
    { id: 'hist-m6', type: 'short_answer', prompt: 'What ship sank in 1912 after hitting an iceberg?', correctAnswer: 'titanic', hint: 'Unsinkable ship', explanation: 'The RMS Titanic sank on April 15, 1912', difficulty: 3, topic: '20th Century', estimatedTimeSeconds: 20 },
  ],
  hard: [
    { id: 'hist-h1', type: 'multiple_choice', prompt: 'The Treaty of Versailles ended which war?', options: ['WWI', 'WWII', 'Napoleonic Wars', 'Crimean War'], correctAnswer: 0, hint: 'The Great War', explanation: 'The Treaty of Versailles officially ended World War I in 1919', difficulty: 5, topic: 'World Wars', estimatedTimeSeconds: 30 },
    { id: 'hist-h2', type: 'short_answer', prompt: 'Who was the leader of the Soviet Union during WWII?', correctAnswer: 'stalin', hint: 'Joseph...', explanation: 'Joseph Stalin led the Soviet Union from 1924-1953, including during WWII', difficulty: 4, topic: 'WWII', estimatedTimeSeconds: 30 },
    { id: 'hist-h3', type: 'multiple_choice', prompt: 'The Magna Carta was signed in which year?', options: ['1066', '1215', '1337', '1453'], correctAnswer: 1, hint: 'Early 13th century', explanation: 'The Magna Carta was signed in 1215, limiting the power of the English king', difficulty: 5, topic: 'Medieval History', estimatedTimeSeconds: 35 },
    { id: 'hist-h4', type: 'true_false', prompt: 'The Byzantine Empire fell in 1453.', correctAnswer: 'true', hint: 'Fall of Constantinople', explanation: 'True - Constantinople fell to the Ottomans in 1453, ending the Byzantine Empire', difficulty: 4, topic: 'Medieval History', estimatedTimeSeconds: 25 },
    { id: 'hist-h5', type: 'multiple_choice', prompt: 'Who unified the Mongol tribes?', options: ['Kublai Khan', 'Attila', 'Genghis Khan', 'Tamerlane'], correctAnswer: 2, hint: 'Greatest conqueror', explanation: 'Genghis Khan unified the Mongol tribes and created the largest land empire', difficulty: 4, topic: 'Asian History', estimatedTimeSeconds: 30 },
  ],
};

// Geography Stream Questions
const geographyQuestions: Record<Difficulty, Question[]> = {
  easy: [
    { id: 'geo-e1', type: 'multiple_choice', prompt: 'What is the capital of France?', options: ['London', 'Berlin', 'Paris', 'Rome'], correctAnswer: 2, hint: 'City of Light', explanation: 'Paris is the capital and largest city of France', difficulty: 1, topic: 'Capitals', estimatedTimeSeconds: 15 },
    { id: 'geo-e2', type: 'true_false', prompt: 'Africa is the largest continent.', correctAnswer: 'false', hint: 'Asia is larger', explanation: 'False - Asia is the largest continent by both area and population', difficulty: 1, topic: 'Continents', estimatedTimeSeconds: 15 },
    { id: 'geo-e3', type: 'multiple_choice', prompt: 'How many continents are there?', options: ['5', '6', '7', '8'], correctAnswer: 2, hint: 'Seven seas and...', explanation: 'There are 7 continents: Asia, Africa, North America, South America, Europe, Australia, Antarctica', difficulty: 1, topic: 'Continents', estimatedTimeSeconds: 20 },
    { id: 'geo-e4', type: 'short_answer', prompt: 'What is the largest ocean?', correctAnswer: 'pacific', hint: 'Peaceful ocean', explanation: 'The Pacific Ocean is the largest, covering about 63 million square miles', difficulty: 1, topic: 'Oceans', estimatedTimeSeconds: 20 },
    { id: 'geo-e5', type: 'true_false', prompt: 'The Amazon River is in South America.', correctAnswer: 'true', hint: 'Brazilian rainforest', explanation: 'True - The Amazon flows through South America, primarily Brazil', difficulty: 1, topic: 'Rivers', estimatedTimeSeconds: 15 },
    { id: 'geo-e6', type: 'multiple_choice', prompt: 'Which country has the largest population?', options: ['India', 'China', 'USA', 'Indonesia'], correctAnswer: 1, hint: 'East Asia', explanation: 'China has the world\'s largest population with over 1.4 billion people', difficulty: 1, topic: 'Demographics', estimatedTimeSeconds: 20 },
  ],
  medium: [
    { id: 'geo-m1', type: 'multiple_choice', prompt: 'What is the driest desert in the world?', options: ['Sahara', 'Gobi', 'Atacama', 'Arabian'], correctAnswer: 2, hint: 'In Chile', explanation: 'The Atacama Desert in Chile is the driest non-polar desert', difficulty: 3, topic: 'Deserts', estimatedTimeSeconds: 25 },
    { id: 'geo-m2', type: 'short_answer', prompt: 'What is the longest river in the world?', correctAnswer: 'nile', hint: 'Flows through Egypt', explanation: 'The Nile River is approximately 6,650 km long', difficulty: 3, topic: 'Rivers', estimatedTimeSeconds: 25 },
    { id: 'geo-m3', type: 'multiple_choice', prompt: 'Mount Everest is located in which mountain range?', options: ['Alps', 'Himalayas', 'Andes', 'Rockies'], correctAnswer: 1, hint: 'Nepal/Tibet border', explanation: 'Mount Everest is in the Himalayas on the Nepal-Tibet border', difficulty: 3, topic: 'Mountains', estimatedTimeSeconds: 25 },
    { id: 'geo-m4', type: 'true_false', prompt: 'Australia is both a country and a continent.', correctAnswer: 'true', hint: 'Island continent', explanation: 'True - Australia is unique as both a sovereign country and a continent', difficulty: 3, topic: 'Continents', estimatedTimeSeconds: 20 },
    { id: 'geo-m5', type: 'multiple_choice', prompt: 'Which country has the most time zones?', options: ['Russia', 'USA', 'France', 'China'], correctAnswer: 2, hint: 'Overseas territories', explanation: 'France has 12 time zones including overseas territories', difficulty: 3, topic: 'Time Zones', estimatedTimeSeconds: 30 },
    { id: 'geo-m6', type: 'short_answer', prompt: 'What is the smallest country in the world?', correctAnswer: 'vatican', hint: 'Within Rome', explanation: 'Vatican City is the smallest country at 0.17 square miles', difficulty: 3, topic: 'Countries', estimatedTimeSeconds: 25 },
  ],
  hard: [
    { id: 'geo-h1', type: 'multiple_choice', prompt: 'What is the deepest point in Earth\'s oceans?', options: ['Mariana Trench', 'Puerto Rico Trench', 'Java Trench', 'Philippine Trench'], correctAnswer: 0, hint: 'Pacific Ocean', explanation: 'The Mariana Trench reaches depths of about 36,000 feet', difficulty: 5, topic: 'Oceans', estimatedTimeSeconds: 35 },
    { id: 'geo-h2', type: 'short_answer', prompt: 'What is the capital of Australia?', correctAnswer: 'canberra', hint: 'Not Sydney or Melbourne', explanation: 'Canberra is Australia\'s capital, purposely built between Sydney and Melbourne', difficulty: 4, topic: 'Capitals', estimatedTimeSeconds: 30 },
    { id: 'geo-h3', type: 'multiple_choice', prompt: 'The Ring of Fire is associated with?', options: ['Volcanoes', 'Deserts', 'Rainforests', 'Grasslands'], correctAnswer: 0, hint: 'Pacific region', explanation: 'The Ring of Fire is a zone of frequent earthquakes and volcanic eruptions around the Pacific', difficulty: 5, topic: 'Geology', estimatedTimeSeconds: 30 },
    { id: 'geo-h4', type: 'true_false', prompt: 'The Dead Sea is the lowest point on Earth\'s surface.', correctAnswer: 'true', hint: 'Below sea level', explanation: 'True - The Dead Sea shore is about 430 meters below sea level', difficulty: 4, topic: 'Geography', estimatedTimeSeconds: 25 },
    { id: 'geo-h5', type: 'multiple_choice', prompt: 'Which country has the longest coastline?', options: ['Australia', 'Russia', 'Canada', 'Indonesia'], correctAnswer: 2, hint: 'Many islands', explanation: 'Canada has the longest coastline at over 200,000 km including islands', difficulty: 4, topic: 'Geography', estimatedTimeSeconds: 30 },
  ],
};

// Literature Stream Questions  
const literatureQuestions: Record<Difficulty, Question[]> = {
  easy: [
    { id: 'lit-e1', type: 'multiple_choice', prompt: 'Who wrote "Romeo and Juliet"?', options: ['Charles Dickens', 'William Shakespeare', 'Jane Austen', 'Mark Twain'], correctAnswer: 1, hint: 'The Bard', explanation: 'William Shakespeare wrote this famous tragedy around 1595', difficulty: 1, topic: 'Drama', estimatedTimeSeconds: 20 },
    { id: 'lit-e2', type: 'true_false', prompt: '"Harry Potter" was written by J.R.R. Tolkien.', correctAnswer: 'false', hint: 'J.K. Rowling wrote it', explanation: 'False - J.K. Rowling wrote the Harry Potter series', difficulty: 1, topic: 'Fantasy', estimatedTimeSeconds: 15 },
    { id: 'lit-e3', type: 'multiple_choice', prompt: 'In which book would you find the character "Sherlock Holmes"?', options: ['Pride and Prejudice', 'The Adventures of Sherlock Holmes', '1984', 'Moby Dick'], correctAnswer: 1, hint: 'Detective stories', explanation: 'Sherlock Holmes appears in stories by Sir Arthur Conan Doyle', difficulty: 1, topic: 'Mystery', estimatedTimeSeconds: 20 },
    { id: 'lit-e4', type: 'short_answer', prompt: 'What type of animal is "Charlotte" in Charlotte\'s Web?', correctAnswer: 'spider', hint: 'Eight legs', explanation: 'Charlotte is a spider who befriends Wilbur the pig', difficulty: 1, topic: 'Children\'s Literature', estimatedTimeSeconds: 15 },
    { id: 'lit-e5', type: 'true_false', prompt: 'A haiku has three lines.', correctAnswer: 'true', hint: 'Japanese poetry', explanation: 'True - A haiku is a three-line poem with 5-7-5 syllable pattern', difficulty: 1, topic: 'Poetry', estimatedTimeSeconds: 15 },
    { id: 'lit-e6', type: 'multiple_choice', prompt: 'Who wrote "To Kill a Mockingbird"?', options: ['Harper Lee', 'Toni Morrison', 'Maya Angelou', 'Alice Walker'], correctAnswer: 0, hint: 'Published in 1960', explanation: 'Harper Lee wrote this Pulitzer Prize-winning novel', difficulty: 1, topic: 'American Literature', estimatedTimeSeconds: 20 },
  ],
  medium: [
    { id: 'lit-m1', type: 'multiple_choice', prompt: 'What is the opening line of "A Tale of Two Cities"?', options: ['"Call me Ishmael"', '"It was the best of times"', '"Happy families are all alike"', '"In the beginning"'], correctAnswer: 1, hint: 'Dickens novel', explanation: '"It was the best of times, it was the worst of times" opens A Tale of Two Cities', difficulty: 3, topic: 'Classic Literature', estimatedTimeSeconds: 30 },
    { id: 'lit-m2', type: 'short_answer', prompt: 'Who wrote "1984"?', correctAnswer: 'orwell', hint: 'George...', explanation: 'George Orwell wrote the dystopian novel "1984" in 1949', difficulty: 3, topic: 'Science Fiction', estimatedTimeSeconds: 25 },
    { id: 'lit-m3', type: 'multiple_choice', prompt: 'In Greek mythology, who flew too close to the sun?', options: ['Daedalus', 'Icarus', 'Perseus', 'Theseus'], correctAnswer: 1, hint: 'Wax wings melted', explanation: 'Icarus flew too close to the sun, melting his wax wings', difficulty: 3, topic: 'Mythology', estimatedTimeSeconds: 25 },
    { id: 'lit-m4', type: 'true_false', prompt: 'Shakespeare wrote 37 plays.', correctAnswer: 'true', hint: 'Approximately correct', explanation: 'True - Shakespeare is credited with writing 37 plays', difficulty: 3, topic: 'Drama', estimatedTimeSeconds: 20 },
    { id: 'lit-m5', type: 'multiple_choice', prompt: 'What is an epic poem?', options: ['A short humorous poem', 'A long narrative poem', 'A love sonnet', 'A three-line poem'], correctAnswer: 1, hint: 'Homer\'s Odyssey', explanation: 'An epic poem is a long narrative celebrating heroic deeds', difficulty: 3, topic: 'Poetry', estimatedTimeSeconds: 25 },
    { id: 'lit-m6', type: 'short_answer', prompt: 'Who wrote "Pride and Prejudice"?', correctAnswer: 'austen', hint: 'Jane...', explanation: 'Jane Austen wrote this classic novel published in 1813', difficulty: 3, topic: 'Classic Literature', estimatedTimeSeconds: 25 },
  ],
  hard: [
    { id: 'lit-h1', type: 'multiple_choice', prompt: 'Who wrote "The Canterbury Tales"?', options: ['Geoffrey Chaucer', 'John Milton', 'Edmund Spenser', 'Christopher Marlowe'], correctAnswer: 0, hint: 'Medieval English poet', explanation: 'Geoffrey Chaucer wrote The Canterbury Tales in Middle English', difficulty: 5, topic: 'Medieval Literature', estimatedTimeSeconds: 35 },
    { id: 'lit-h2', type: 'short_answer', prompt: 'What literary device compares two things using "like" or "as"?', correctAnswer: 'simile', hint: 'Not a metaphor', explanation: 'A simile makes comparisons using "like" or "as"', difficulty: 4, topic: 'Literary Devices', estimatedTimeSeconds: 30 },
    { id: 'lit-h3', type: 'multiple_choice', prompt: 'In which Shakespearean play does the protagonist see his father\'s ghost?', options: ['Macbeth', 'Hamlet', 'Othello', 'King Lear'], correctAnswer: 1, hint: 'Prince of Denmark', explanation: 'In Hamlet, the ghost of Hamlet\'s father appears', difficulty: 5, topic: 'Shakespeare', estimatedTimeSeconds: 30 },
    { id: 'lit-h4', type: 'true_false', prompt: 'James Joyce wrote "Ulysses".', correctAnswer: 'true', hint: 'Irish modernist', explanation: 'True - Joyce\'s modernist novel Ulysses was published in 1922', difficulty: 4, topic: 'Modern Literature', estimatedTimeSeconds: 25 },
    { id: 'lit-h5', type: 'multiple_choice', prompt: 'What is a protagonist?', options: ['The villain', 'The main character', 'The narrator', 'The love interest'], correctAnswer: 1, hint: 'Hero of the story', explanation: 'The protagonist is the main character around whom the story revolves', difficulty: 4, topic: 'Literary Terms', estimatedTimeSeconds: 25 },
  ],
};

// Programming Stream Questions
const programmingQuestions: Record<Difficulty, Question[]> = {
  easy: [
    { id: 'prog-e1', type: 'multiple_choice', prompt: 'What does HTML stand for?', options: ['Hyper Text Markup Language', 'High Tech Modern Language', 'Home Tool Markup Language', 'Hyperlinks and Text Markup Language'], correctAnswer: 0, hint: 'Web pages', explanation: 'HTML stands for Hyper Text Markup Language', difficulty: 1, topic: 'Web Development', estimatedTimeSeconds: 20 },
    { id: 'prog-e2', type: 'true_false', prompt: 'Python is a programming language.', correctAnswer: 'true', hint: 'Named after Monty Python', explanation: 'True - Python is a high-level programming language', difficulty: 1, topic: 'Programming', estimatedTimeSeconds: 15 },
    { id: 'prog-e3', type: 'multiple_choice', prompt: 'What symbol is used for comments in JavaScript?', options: ['#', '//', '/*', '--'], correctAnswer: 1, hint: 'Two slashes', explanation: '// is used for single-line comments in JavaScript', difficulty: 1, topic: 'JavaScript', estimatedTimeSeconds: 20 },
    { id: 'prog-e4', type: 'short_answer', prompt: 'What keyword is used to declare a variable in JavaScript?', correctAnswer: 'var', hint: 'Also let or const', explanation: 'var, let, or const are used to declare variables in JavaScript', difficulty: 1, topic: 'JavaScript', estimatedTimeSeconds: 20 },
    { id: 'prog-e5', type: 'true_false', prompt: 'CSS is used to style web pages.', correctAnswer: 'true', hint: 'Cascading Style Sheets', explanation: 'True - CSS (Cascading Style Sheets) styles HTML elements', difficulty: 1, topic: 'Web Development', estimatedTimeSeconds: 15 },
    { id: 'prog-e6', type: 'multiple_choice', prompt: 'Which of these is NOT a programming language?', options: ['Java', 'Python', 'HTML', 'C++'], correctAnswer: 2, hint: 'Markup language', explanation: 'HTML is a markup language, not a programming language', difficulty: 1, topic: 'Programming', estimatedTimeSeconds: 20 },
  ],
  medium: [
    { id: 'prog-m1', type: 'multiple_choice', prompt: 'What is a loop in programming?', options: ['A function', 'A repeated action', 'A variable', 'An error'], correctAnswer: 1, hint: 'for, while', explanation: 'A loop repeats a block of code multiple times', difficulty: 3, topic: 'Programming Concepts', estimatedTimeSeconds: 25 },
    { id: 'prog-m2', type: 'short_answer', prompt: 'What data structure uses LIFO (Last In First Out)?', correctAnswer: 'stack', hint: 'Like a stack of plates', explanation: 'A stack follows Last In First Out principle', difficulty: 3, topic: 'Data Structures', estimatedTimeSeconds: 25 },
    { id: 'prog-m3', type: 'multiple_choice', prompt: 'What is the time complexity of binary search?', options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'], correctAnswer: 1, hint: 'Logarithmic', explanation: 'Binary search has O(log n) time complexity', difficulty: 3, topic: 'Algorithms', estimatedTimeSeconds: 30 },
    { id: 'prog-m4', type: 'true_false', prompt: 'An array can hold different data types in JavaScript.', correctAnswer: 'true', hint: 'Dynamically typed', explanation: 'True - JavaScript arrays can contain mixed data types', difficulty: 3, topic: 'JavaScript', estimatedTimeSeconds: 20 },
    { id: 'prog-m5', type: 'multiple_choice', prompt: 'What does SQL stand for?', options: ['Structured Query Language', 'Simple Question Language', 'Standard Quality Language', 'System Query Logic'], correctAnswer: 0, hint: 'Database queries', explanation: 'SQL stands for Structured Query Language', difficulty: 3, topic: 'Databases', estimatedTimeSeconds: 25 },
    { id: 'prog-m6', type: 'short_answer', prompt: 'What symbol represents "not equal to" in most languages?', correctAnswer: '!=', hint: 'Exclamation and equals', explanation: '!= represents "not equal to" in most programming languages', difficulty: 3, topic: 'Operators', estimatedTimeSeconds: 25 },
  ],
  hard: [
    { id: 'prog-h1', type: 'multiple_choice', prompt: 'What design pattern is used to create objects?', options: ['Factory Pattern', 'Observer Pattern', 'Strategy Pattern', 'Decorator Pattern'], correctAnswer: 0, hint: 'Object creation', explanation: 'The Factory Pattern is used for creating objects', difficulty: 5, topic: 'Design Patterns', estimatedTimeSeconds: 35 },
    { id: 'prog-h2', type: 'short_answer', prompt: 'What does REST stand for in web APIs?', correctAnswer: 'representational state transfer', hint: 'RESTful APIs', explanation: 'REST stands for Representational State Transfer', difficulty: 4, topic: 'Web APIs', estimatedTimeSeconds: 35 },
    { id: 'prog-h3', type: 'multiple_choice', prompt: 'Which sorting algorithm has O(n log n) average complexity?', options: ['Bubble Sort', 'Merge Sort', 'Selection Sort', 'Insertion Sort'], correctAnswer: 1, hint: 'Divide and conquer', explanation: 'Merge Sort has O(n log n) time complexity', difficulty: 5, topic: 'Algorithms', estimatedTimeSeconds: 35 },
    { id: 'prog-h4', type: 'true_false', prompt: 'JavaScript is single-threaded.', correctAnswer: 'true', hint: 'Event loop', explanation: 'True - JavaScript executes code on a single thread', difficulty: 4, topic: 'JavaScript', estimatedTimeSeconds: 25 },
    { id: 'prog-h5', type: 'multiple_choice', prompt: 'What is polymorphism in OOP?', options: ['Multiple inheritance', 'Method overriding', 'Data hiding', 'Code reuse'], correctAnswer: 1, hint: 'Different forms', explanation: 'Polymorphism allows objects to take multiple forms through method overriding', difficulty: 4, topic: 'OOP', estimatedTimeSeconds: 30 },
  ],
};

export const QUESTION_BANK: Record<string, Record<Difficulty, Question[]>> = {
  science: scienceQuestions,
  math: mathQuestions,
  history: historyQuestions,
  geography: geographyQuestions,
  literature: literatureQuestions,
  programming: programmingQuestions,
};

export function getQuestionsForStream(streamId: string, difficulty: Difficulty): Question[] {
  return QUESTION_BANK[streamId]?.[difficulty] || [];
}

export function getTotalQuestionsCount(streamId: string, difficulty: Difficulty): number {
  return getQuestionsForStream(streamId, difficulty).length;
}
