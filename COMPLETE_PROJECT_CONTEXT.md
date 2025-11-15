\#\# 📄 Complete Project Context Document Created\!

I've prepared the comprehensive context below. Save this as \_\_\`COMPLETE\_PROJECT\_CONTEXT.md\`\_\_ in \`Maze/web/\` directory:

\---

\# MULTI-STREAM MAZE QUIZ \- COMPLETE PROJECT CONTEXT

\#\# Project Overview

Educational web game combining maze navigation with quiz-based learning. Built with React \+ TypeScript \+ Zustand \+ Tailwind CSS.

\_\_Core Concept\_\_: Replace traditional modal-based quiz selection with playable maze navigation for subject/difficulty selection.

\#\# System Architecture

\#\#\# Three-Tier Maze Navigation System

\`\`\`javascript  
1\. STREAM SELECTION MAZE (41x31)  
   ├─ 6 paths from center (cross \+ 2 L-shapes)  
   ├─ All paths orthogonal (up/down/left/right only)  
   └─ Purple endpoint tiles with subject icons  
     
2\. LEVEL PROGRESSION MAZE (25x13)    
   ├─ Linear corridor with 3 checkpoints  
   ├─ Sequential unlocking: Easy → Medium → Hard  
   └─ Green (unlocked) / Gray (locked) tiles  
     
3\. QUIZ MAZE (varies by difficulty)  
   ├─ Procedurally generated using recursive backtracking  
   ├─ Quiz tiles scattered throughout  
   ├─ Fog-of-war exploration  
   └─ Collect keys → reach goal  
\`\`\`

\#\# File Structure & Responsibilities

\#\#\# \`/src/QuizDemo.tsx\` (Main Orchestrator \- 450 lines)

\_\_Purpose\_\_: Controls entire application flow and maze mode transitions

\_\_State Management\_\_:

\- \`mazeMode\`: 'stream-map' | 'level-map' | 'playing-level' | 'results'  
\- \`questions\`: Current level's questions  
\- \`showQuiz\`: Quiz modal visibility  
\- \`lockedMessage\`: Feedback messages

\_\_Key Functions\_\_:

\`\`\`typescript  
loadStreamSelectionMaze() // Loads 6-endpoint maze  
loadLevelProgressionMaze(stream) // Loads 3-checkpoint maze  
loadQuizMaze(difficulty) // Loads actual quiz maze  
\`\`\`

\_\_Critical useEffect\_\_ (lines \~176-235):

\`\`\`typescript  
useEffect(() \=\> {  
  const tile \= maze.tiles\[player.y\]\[player.x\];  
    
  // Stream selection detection  
  if (mazeMode \=== 'stream-map' && tile.type \=== STREAM\_ENDPOINT) {  
    loadLevelProgressionMaze(stream);  
  }  
    
  // Checkpoint detection  
  if (mazeMode \=== 'level-map') {  
    if (tile.type \=== LEVEL\_CHECKPOINT && \!tile.isLocked) {  
      loadQuizMaze(tile.difficulty);  
    }  
    if (tile.type \=== LOCKED\_CHECKPOINT) {  
      showLockedMessage();  
    }  
  }  
    
  // Goal/Quiz tile detection  
  if (mazeMode \=== 'playing-level') {  
    if (tile.type \=== GOAL) {  
      if (keysCollected \>= questions.length) {  
        completeLevel(); // SUCCESS  
      } else {  
        showMessage("Need more keys\!"); // FAILURE  
      }  
    }  
    if (tile.type \=== QUIZ && \!tile.isAnswered) {  
      showQuizModal();  
    }  
  }  
}, \[player.position\]);  
\`\`\`

\_\_Navigation Handlers\_\_:

\- \`handleBackToStreams()\` \- Returns to stream selection  
\- \`handleBackToLevelMap()\` \- Returns to level progression  
\- \`handleReturnToLevelMap()\` \- From results modal  
\- \`handleNextLevel()\` \- Proceeds to next difficulty  
\- \`handleRetry()\` \- Replays current level

\---

\#\#\# \`/src/services/mazeGenerator.ts\` (Maze Creation \- 450 lines)

\_\_Function 1: \`generateMaze(width, height)\`\_\_

\- Recursive backtracking algorithm  
\- Creates perfect mazes (one solution)  
\- Used for quiz levels

\_\_Function 2: \`generateStreamSelectionMaze(streams)\` \- CRITICAL\_\_

\`\`\`typescript  
// Creates 41x31 maze with 6 orthogonal paths  
const centerX \= 20, centerY \= 15;

// Helper function  
const makePath \= (startX, startY, endX, endY, thickness \= 3\) \=\> {  
  // Creates rectangular path with thickness  
  // Ensures continuous connectivity  
};

// 6 Paths:  
makePath(centerX, centerY-2, centerX, 3, 3); // UP → Science  
makePath(centerX+2, centerY, width-4, centerY, 3); // RIGHT → Math  
makePath(centerX, centerY+2, centerX, height-4, 3); // DOWN → Geography  
makePath(3, centerY, centerX-2, centerY, 3); // LEFT → Literature

// L-shaped path (UP+RIGHT) → Programming  
makePath(centerX+4, centerY, centerX+4, centerY-8, 3);  
makePath(centerX+4, centerY-8, centerX+14, centerY-8, 3);

// L-shaped path (DOWN+LEFT) → History    
makePath(centerX-4, centerY, centerX-4, centerY+8, 3);  
makePath(3, centerY+8, centerX-4, centerY+8, 3);  
\`\`\`

\_\_Function 3: \`generateLevelProgressionMaze(streamId, unlockedLevels)\`\_\_

\`\`\`typescript  
// Creates simple 25x13 corridor  
// 3 checkpoints at x=7, x=13, x=19  
// Type based on unlock status:  
tiles\[y\]\[x\] \= {  
  type: unlocked ? LEVEL\_CHECKPOINT : LOCKED\_CHECKPOINT,  
  difficulty: 'easy'|'medium'|'hard',  
  isLocked: \!unlocked  
};  
\`\`\`

\_\_Function 4: \`placeQuizTiles(maze, questionIds, count)\`\_\_

\- Finds all PATH tiles  
\- Shuffles and selects random positions  
\- Assigns questionId to each

\---

\#\#\# \`/src/stores/quizProgressStore.ts\` (Progress Tracking \- 180 lines)

\_\_localStorage Key\_\_: \`'quiz\_progress\_v1'\`

\_\_State Structure\_\_:

\`\`\`typescript  
{  
  completedLevels: Array\<{  
    streamId: string;  
    difficulty: 'easy'|'medium'|'hard';  
    score: number;  
    correctAnswers: number;  
    totalQuestions: number;  
    timeSpent: number; // seconds  
    completedAt: number; // timestamp  
    attempts: number;  
  }\>;  
  currentStream: Stream | null;  
  currentDifficulty: Difficulty | null;  
  currentScore: number;  
  currentCorrectAnswers: number;  
  currentQuestionIndex: number;  
  sessionStartTime: number;  
}  
\`\`\`

\_\_Critical Function\_\_: \`isLevelUnlocked(streamId, difficulty)\`

\`\`\`typescript  
if (difficulty \=== 'easy') return true; // Always unlocked

const completed \= completedLevels.filter(l \=\> l.streamId \=== streamId);

if (difficulty \=== 'medium') {  
  return completed.some(l \=\> l.difficulty \=== 'easy');  
}

if (difficulty \=== 'hard') {  
  return completed.some(l \=\> l.difficulty \=== 'medium');  
}  
\`\`\`

\_\_Auto-Save\_\_: \`completeLevel()\` automatically calls \`saveProgress()\`

\---

\#\#\# \`/src/stores/gameStore.ts\` (Game Mechanics \- 250 lines)

\_\_Player State\_\_:

\`\`\`typescript  
player: {  
  position: { x, y },  
  direction: 'up'|'down'|'left'|'right',  
  lives: 3,  
  score: 0,  
  keysCollected: 0  
}  
\`\`\`

\_\_Actions\_\_:

\- \`movePlayer(direction)\` \- Updates position if tile is PATH/QUIZ/GOAL  
\- \`collectKey()\` \- Increments keysCollected  
\- \`loseLife()\` \- Decrements lives  
\- \`updateScore(points)\` \- Adds to score  
\- \`answerQuizTile(x, y, correct)\` \- Marks tile as answered  
\- \`setMaze(maze)\` \- Loads new maze  
\- \`resetGame()\` \- Clears all game state

\---

\#\#\# \`/src/hooks/useInputHandler.ts\` (Keyboard Control \- 60 lines)

\_\_CRITICAL FIX\_\_ (Lines 11-18):

\`\`\`typescript  
const handleKeyDown \= (event: KeyboardEvent) \=\> {  
  // Check if typing in input field  
  const target \= event.target as HTMLElement;  
  const isTyping \= target.tagName \=== 'INPUT' ||   
                   target.tagName \=== 'TEXTAREA' ||   
                   target.isContentEditable;  
    
  if (isTyping) return; // Don't move player\!  
    
  // Process WASD/Arrow keys for movement  
  if (KEYS.UP.includes(event.key)) {  
    movePlayer('up');  
    event.preventDefault();  
  }  
  // ... other directions  
};  
\`\`\`

\_\_Why This Matters\_\_: Without this check, typing 'w', 'a', 's', 'd' in answer boxes would move the player instead of typing letters.

\---

\#\#\# \`/src/types/game.types.ts\` (Type Definitions \- 150 lines)

\_\_TileType Enum\_\_:

\`\`\`typescript  
enum TileType {  
  WALL,              // Impassable  
  PATH,              // Walkable  
  START,             // Player spawn  
  GOAL,              // Level exit  
  QUIZ,              // Question tile  
  QUIZ\_CORRECT,      // Answered correctly  
  QUIZ\_INCORRECT,    // Answered incorrectly  
  STREAM\_ENDPOINT,   // Subject selection (purple)  
  LEVEL\_CHECKPOINT,  // Unlocked difficulty (green)  
  LOCKED\_CHECKPOINT  // Locked difficulty (gray)  
}  
\`\`\`

\_\_MazeTile Interface\_\_:

\`\`\`typescript  
interface MazeTile {  
  type: TileType;  
  coordinate: { x: number; y: number };  
  state?: TileState;  
  questionId?: string;          // For QUIZ tiles  
  streamId?: string;            // For STREAM\_ENDPOINT  
  difficulty?: Difficulty;      // For checkpoints  
  isLocked?: boolean;           // For LOCKED\_CHECKPOINT  
  label?: string;               // Display text  
  isAnswered?: boolean;         // Quiz completion  
}  
\`\`\`

\---

\#\#\# \`/src/data/questionBank.ts\` (Content \- 900 lines)

\_\_Structure\_\_:

\`\`\`typescript  
export const STREAMS: Stream\[\] \= \[  
  { id: 'science', name: 'Science', icon: '🔬', color: '\#3b82f6' },  
  { id: 'mathematics', name: 'Mathematics', icon: '📐', color: '\#10b981' },  
  { id: 'history', name: 'History', icon: '📜', color: '\#f59e0b' },  
  { id: 'geography', name: 'Geography', icon: '🌍', color: '\#06b6d4' },  
  { id: 'literature', name: 'Literature', icon: '📚', color: '\#8b5cf6' },  
  { id: 'programming', name: 'Programming', icon: '💻', color: '\#ec4899' }  
\];

const QUESTION\_BANK \= {  
  science: {  
    easy: \[/\* 6 questions \*/\],  
    medium: \[/\* 6 questions \*/\],  
    hard: \[/\* 5 questions \*/\]  
  },  
  // ... other streams  
};  
\`\`\`

\_\_Question Format\_\_:

\`\`\`typescript  
{  
  id: 'sci\_easy\_1',  
  question: 'What is the chemical symbol for water?',  
  type: 'multiple-choice',  
  options: \['H2O', 'CO2', 'O2', 'N2'\],  
  correctAnswer: 'H2O',  
  difficulty: 'easy',  
  streamId: 'science'  
}  
\`\`\`

\---

\#\#\# \`/src/components/modals/QuizModal.tsx\` (Question Display \- 200 lines)

\_\_Props\_\_:

\`\`\`typescript  
{  
  question: Question;  
  onAnswer: (correct: boolean, attempts: number) \=\> void;  
  onClose: () \=\> void;  
  isVisible: boolean;  
  currentQuestionNumber: number;  
  totalQuestions: number;  
}  
\`\`\`

\_\_Multi-Attempt Logic\_\_:

\`\`\`typescript  
const \[attempts, setAttempts\] \= useState(1);  
const \[incorrectAnswers, setIncorrectAnswers\] \= useState\<Set\<string\>\>(new Set());

const handleSubmit \= () \=\> {  
  const correct \= userAnswer \=== question.correctAnswer;  
    
  if (correct) {  
    onAnswer(true, attempts);  
  } else {  
    if (attempts \>= 3\) {  
      onAnswer(false, attempts); // Final incorrect  
    } else {  
      setAttempts(attempts \+ 1); // Try again  
      setIncorrectAnswers(prev \=\> new Set(\[...prev, userAnswer\]));  
      showFeedback('Try again\!');  
    }  
  }  
};  
\`\`\`

\---

\#\#\# \`/src/components/modals/ResultsSummaryModal.tsx\` (Level Complete \- 150 lines)

\_\_Props\_\_:

\`\`\`typescript  
{  
  stream: Stream | null;  
  difficulty: Difficulty | null;  
  score: number;  
  correctAnswers: number;  
  totalQuestions: number;  
  timeSpent: number;  
  hasNextLevel: boolean;  
  onNextLevel: () \=\> void;  
  onRetry: () \=\> void;  
  onMainMenu: () \=\> void;  // Returns to level progression  
  onNextStream: () \=\> void;  
}  
\`\`\`

\_\_Button Logic\_\_:

\`\`\`typescript  
{hasNextLevel && (  
  \<button onClick={onNextLevel}\>  
    Next Level (Medium/Hard)  
  \</button\>  
)}  
\<button onClick={onRetry}\>Retry This Level\</button\>  
\<button onClick={onMainMenu}\>Return to Level Map\</button\>  
\<button onClick={onNextStream}\>Choose Another Subject\</button\>  
\`\`\`

\---

\#\#\# \`/src/components/game/MazeCanvas.tsx\` (Rendering \- 300 lines)

\_\_Tile Colors\_\_ (Defined in \`/src/utils/constants.ts\`):

\`\`\`typescript  
export const TILE\_COLORS \= {  
  \[TileType.WALL\]: '\#1f2937',              // Dark gray  
  \[TileType.PATH\]: '\#4b5563',              // Medium gray  
  \[TileType.START\]: '\#3b82f6',             // Blue  
  \[TileType.GOAL\]: '\#10b981',              // Green  
  \[TileType.QUIZ\]: '\#f59e0b',              // Amber/Orange  
  \[TileType.QUIZ\_CORRECT\]: '\#10b981',      // Green  
  \[TileType.QUIZ\_INCORRECT\]: '\#ef4444',    // Red  
  \[TileType.STREAM\_ENDPOINT\]: '\#8b5cf6',   // Purple  
  \[TileType.LEVEL\_CHECKPOINT\]: '\#10b981',  // Green  
  \[TileType.LOCKED\_CHECKPOINT\]: '\#6b7280'  // Gray  
};  
\`\`\`

\_\_Rendering Logic\_\_:

\`\`\`typescript  
// Draw base tile  
ctx.fillStyle \= TILE\_COLORS\[tile.type\];  
ctx.fillRect(x, y, TILE\_SIZE, TILE\_SIZE);

// Draw icons on special tiles  
if (tile.type \=== TileType.STREAM\_ENDPOINT) {  
  ctx.font \= '20px Arial';  
  ctx.fillText(tile.label, x, y); // Shows emoji  
}

if (tile.type \=== TileType.LOCKED\_CHECKPOINT) {  
  ctx.fillText('🔒', x, y);  
}

// Draw player  
ctx.fillStyle \= '\#60a5fa';  
ctx.beginPath();  
ctx.arc(playerX, playerY, radius, 0, Math.PI \* 2);  
ctx.fill();  
\`\`\`

\---

\#\# Critical Integration Points

\#\#\# 1\. Adding a New Stream

\_\_Files to modify\_\_:

1\. \`/src/data/questionBank.ts\`:

   \`\`\`typescript  
   STREAMS.push({ id: 'newstream', name: 'New', icon: '🎨', color: '\#...' });

   QUESTION\_BANK.newstream \= {  
     easy: \[/\* 6 questions \*/\],  
     medium: \[/\* 6 questions \*/\],  
     hard: \[/\* 5 questions \*/\]  
   };  
   \`\`\`

2\. \`/src/services/mazeGenerator.ts\` \- \`generateStreamSelectionMaze()\`:

   \- Adjust grid size if needed  
   \- Add 7th path with makePath()  
   \- Add 7th endpoint

\_\_No other files need changes\_\_ \- streams array is passed dynamically

\#\#\# 2\. Changing Difficulty Progression

\_\_File\_\_: \`/src/stores/quizProgressStore.ts\` \- \`isLevelUnlocked()\`

Current: Easy → Medium → Hard (sequential)

To make all unlocked:

\`\`\`typescript  
isLevelUnlocked(streamId: string, difficulty: Difficulty) {  
  return true; // All always unlocked  
}  
\`\`\`

To require all streams' Easy before any Medium:

\`\`\`typescript  
if (difficulty \=== 'medium') {  
  return STREAMS.every(s \=\>   
    this.completedLevels.some(l \=\>   
      l.streamId \=== s.id && l.difficulty \=== 'easy'  
    )  
  );  
}  
\`\`\`

\#\#\# 3\. Adjusting Maze Sizes

\_\_File\_\_: \`/src/utils/constants.ts\`

\`\`\`typescript  
export const LEVEL\_SIZES \= {  
  EASY: { width: 21, height: 15 },    // Change here  
  MEDIUM: { width: 25, height: 19 },  
  HARD: { width: 29, height: 23 },  
};  
\`\`\`

\_\_Auto-propagates\_\_ to \`QuizDemo.tsx\` line \~137

\#\#\# 4\. Modifying Scoring

\_\_File\_\_: \`/src/QuizDemo.tsx\` \- \`handleQuizAnswer()\` (line \~246)

\`\`\`typescript  
const points \= correct   
  ? Math.max(100 \- (attempts \- 1\) \* 25, 25\)  // Current: 100/75/50/25  
  : 0;

// Alternative: Fixed points  
const points \= correct ? 50 : 0;

// Alternative: Time-based bonus  
const timeBonus \= Math.max(0, 50 \- timeSpent);  
const points \= correct ? 100 \+ timeBonus : 0;  
\`\`\`

\---

\#\# Common Modifications Guide

\#\#\# To Add New Tile Type:

1\. \`/src/types/game.types.ts\` \- Add to TileType enum  
2\. \`/src/utils/constants.ts\` \- Add color to TILE\_COLORS  
3\. \`/src/components/game/MazeCanvas.tsx\` \- Add rendering logic  
4\. \`/src/QuizDemo.tsx\` \- Add detection in useEffect

\#\#\# To Adjust Fog-of-War:

\_\_File\_\_: \`/src/utils/constants.ts\`

\`\`\`typescript  
export const GAME\_CONFIG \= {  
  fogRadius: 5,        // Visibility radius (increase for more visible area)  
  fogDecayRate: 0.3,   // How fast fog returns (0-1)  
  movementSpeed: 100,  // MS between moves (decrease for faster)  
};  
\`\`\`

\#\#\# To Change Lives System:

\_\_File\_\_: \`/src/stores/gameStore.ts\`

\`\`\`typescript  
// Initial lives  
player: {  
  lives: 5,  // Change from 3 to 5  
  // ...  
}

// In loseLife():  
if (this.player.lives \<= 0\) {  
  // Game over logic \- currently returns to level map  
  // Can change to show game over modal  
}  
\`\`\`

\---

\#\# Data Flow Diagram

\`\`\`javascript  
User Input (WASD)  
  ↓  
useInputHandler (checks if typing)  
  ↓  
gameStore.movePlayer(direction)  
  ↓  
Updates player.position  
  ↓  
QuizDemo useEffect detects new tile  
  ↓  
├─ STREAM\_ENDPOINT → loadLevelProgressionMaze()  
├─ LEVEL\_CHECKPOINT → loadQuizMaze()  
├─ LOCKED\_CHECKPOINT → show message  
├─ QUIZ → show QuizModal  
└─ GOAL (with keys) → show ResultsSummaryModal  
      ↓  
  quizProgressStore.completeLevel()  
      ↓  
  Save to localStorage  
      ↓  
  Unlock next difficulty  
\`\`\`

\---

\#\# Testing Checklist

\_\_Stream Selection Maze\_\_:

\- \[ \] Can move UP to Science  
\- \[ \] Can move RIGHT to Math  
\- \[ \] Can move DOWN to Geography  
\- \[ \] Can move LEFT to Literature  
\- \[ \] Can move UP+RIGHT to Programming  
\- \[ \] Can move DOWN+LEFT to History  
\- \[ \] Stepping on endpoint loads progression maze

\_\_Level Progression Maze\_\_:

\- \[ \] Easy checkpoint always green  
\- \[ \] Medium gray until Easy complete  
\- \[ \] Hard gray until Medium complete  
\- \[ \] Stepping on unlocked loads quiz  
\- \[ \] Stepping on locked shows message  
\- \[ \] "Back to Subjects" button works

\_\_Quiz Maze\_\_:

\- \[ \] 6 quiz tiles for Easy/Medium, 5 for Hard  
\- \[ \] Stepping on tile shows question  
\- \[ \] Can type WASD in answer box  
\- \[ \] Correct answer: key collected, tile green  
\- \[ \] Incorrect answer: life lost, tile red  
\- \[ \] Goal requires all keys  
\- \[ \] Goal without keys shows message  
\- \[ \] Completing level saves progress

\_\_Persistence\_\_:

\- \[ \] Refresh page, progress retained  
\- \[ \] Close browser, reopen, Medium still unlocked  
\- \[ \] localStorage shows completed levels

\---

\#\# Known Limitations & Future Enhancements

\_\_Current Limitations\_\_:

1\. No game over modal (just returns to level map)  
2\. Questions appear in same order each replay  
3\. Short answer matching is exact (case-sensitive)  
4\. No progress reset UI (must clear localStorage manually)  
5\. Desktop-only (no mobile touch controls)

\_\_Potential Enhancements\_\_:

1\. Leaderboards with score comparison  
2\. Achievement badges  
3\. Time trial mode  
4\. Multiplayer co-op  
5\. Custom quiz creation  
6\. Hint system (costs points)  
7\. Power-ups (extra lives, key magnets)  
8\. Animated tile transitions  
9\. Sound on/off toggle  
10\. Accessibility features (screen reader, high contrast)

\---

\#\# File Modification Priority

\_\_High Risk\_\_ (Test thoroughly after changes):

\- \`QuizDemo.tsx\` \- Main flow logic  
\- \`mazeGenerator.ts\` \- Path connectivity  
\- \`useInputHandler.ts\` \- Input detection  
\- \`quizProgressStore.ts\` \- Unlocking logic

\_\_Medium Risk\_\_:

\- \`gameStore.ts\` \- Game state  
\- \`QuizModal.tsx\` \- Question logic  
\- \`MazeCanvas.tsx\` \- Rendering

\_\_Low Risk\_\_:

\- \`questionBank.ts\` \- Adding questions  
\- \`constants.ts\` \- Configuration values  
\- \`ResultsSummaryModal.tsx\` \- UI only

\---

\#\# Debugging Tips

\_\_Player stuck, can't move\_\_:

\- Check fog radius in constants  
\- Verify tile types in maze generator  
\- Console log \`maze.tiles\[y\]\[x\].type\`

\_\_Endpoint not triggering\_\_:

\- Verify \`tile.streamId\` is set  
\- Check useEffect dependencies  
\- Ensure \`STREAM\_ENDPOINT\` type is correct

\_\_Progress not saving\_\_:

\- Check localStorage in DevTools  
\- Verify \`completeLevel()\` is called  
\- Check \`quiz\_progress\_v1\` key exists

\_\_Keys mismatch\_\_:

\- Verify question count matches tile count  
\- Check \`placeQuizTiles()\` logic  
\- Ensure no duplicate question IDs

\---

\_\_Document Location\_\_: Save as \`Maze/web/COMPLETE\_PROJECT\_CONTEXT.md\`

