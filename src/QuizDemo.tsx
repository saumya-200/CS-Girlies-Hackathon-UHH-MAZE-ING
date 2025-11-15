/**
 * Quiz Demo Page - Multi-stream quiz with maze-based navigation
 * New flow: Stream selection maze → Level progression maze → Quiz maze
 */

import { useState, useEffect } from 'react';
import { QuizModal } from './components/modals/QuizModal';
import { ResultsSummaryModal } from './components/modals/ResultsSummaryModal';
import { MazeCanvas } from './components/game/MazeCanvas';
import { MiniMap } from './components/game/MiniMap';
import { useQuizProgressStore } from './stores/quizProgressStore';
import { useGameStore } from './stores/gameStore';
import { useInputHandler } from './hooks/useInputHandler';
import { getQuestionsForStream, STREAMS, type Stream, type Difficulty } from './data/questionBank';
import { 
  generateMaze, 
  placeQuizTiles, 
  generateStreamSelectionMaze, 
  generateLevelProgressionMaze 
} from './services/mazeGenerator';
import { LEVEL_SIZES } from './utils/constants';
import { audioManager } from './utils/audioManager';
import { TileType } from './types/game.types';
import type { Question } from './types/content.types';

type MazeMode = 'stream-map' | 'level-map' | 'playing-level' | 'results';

export function QuizDemo() {
  const {
    currentStream,
    currentDifficulty,
    currentQuestionIndex,
    currentScore,
    currentCorrectAnswers,
    setCurrentStream,
    setCurrentDifficulty,
    startQuiz,
    nextQuestion,
    addScore,
    completeLevel,
    resetCurrentSession,
    getCompletedLevelsForStream,
    hasNextLevel,
    getNextLevel,
    sessionStartTime,
  } = useQuizProgressStore();

  const {
    setMaze,
    setPlayerPosition,
    player,
    maze,
    updateScore: updateGameScore,
    collectKey,
    loseLife,
    answerQuizTile,
    resetGame,
  } = useGameStore();

  const [mazeMode, setMazeMode] = useState<MazeMode>('stream-map');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuizQuestion, setCurrentQuizQuestion] = useState<Question | null>(null);
  const [currentQuizTile, setCurrentQuizTile] = useState<{x: number, y: number} | null>(null);
  const [lockedMessage, setLockedMessage] = useState<string | null>(null);

  // Enable keyboard input
  useInputHandler();

  // Load stream selection maze
  const loadStreamSelectionMaze = () => {
    resetGame();
    const streamMaze = generateStreamSelectionMaze(STREAMS);
    setMaze(streamMaze);
    
    // Find start position
    for (let y = 0; y < streamMaze.height; y++) {
      for (let x = 0; x < streamMaze.width; x++) {
        if (streamMaze.tiles[y][x].type === TileType.START) {
          setPlayerPosition({ x, y });
          break;
        }
      }
    }
    
    setMazeMode('stream-map');
    setCurrentStream(null);
    setCurrentDifficulty(null);
  };

  // Load level progression maze for a stream
  const loadLevelProgressionMaze = (stream: Stream) => {
    resetGame();
    setCurrentStream(stream);
    
    // Check which levels are unlocked
    const completedLevels = getCompletedLevelsForStream(stream.id);
    const unlockedLevels = {
      easy: true, // Always unlocked
      medium: completedLevels.some(l => l.difficulty === 'easy'),
      hard: completedLevels.some(l => l.difficulty === 'medium'),
    };
    
    const progressionMaze = generateLevelProgressionMaze(stream.id, unlockedLevels);
    setMaze(progressionMaze);
    
    // Find start position
    for (let y = 0; y < progressionMaze.height; y++) {
      for (let x = 0; x < progressionMaze.width; x++) {
        if (progressionMaze.tiles[y][x].type === TileType.START) {
          setPlayerPosition({ x, y });
          break;
        }
      }
    }
    
    setMazeMode('level-map');
  };

  // Load quiz maze for a difficulty level
  const loadQuizMaze = (difficulty: Difficulty) => {
    if (!currentStream) return;
    
    resetGame();
    setCurrentDifficulty(difficulty);
    
    const loadedQuestions = getQuestionsForStream(currentStream.id, difficulty);
    setQuestions(loadedQuestions);
    startQuiz();
    
    // Generate maze based on difficulty
    const size = difficulty === 'hard' ? LEVEL_SIZES.HARD :
                 difficulty === 'medium' ? LEVEL_SIZES.MEDIUM : LEVEL_SIZES.EASY;
    
    let newMaze = generateMaze(size.width, size.height);
    
    // Place quiz tiles with question IDs
    const questionIds = loadedQuestions.map(q => q.id);
    newMaze = placeQuizTiles(newMaze, questionIds, loadedQuestions.length);
    
    setMaze(newMaze);
    setPlayerPosition({ x: newMaze.width - 2, y: newMaze.height - 2 });
    
    setMazeMode('playing-level');
  };

  // Check for endpoint/checkpoint/quiz tile interactions
  useEffect(() => {
    if (!maze || showQuiz) return;

    const { x, y } = player.position;
    const tile = maze.tiles[y]?.[x];
    if (!tile) return;

    // Stream selection mode
    if (mazeMode === 'stream-map' && tile.type === TileType.STREAM_ENDPOINT) {
      const stream = STREAMS.find(s => s.id === tile.streamId);
      if (stream) {
        audioManager.playCorrectAnswer();
        setTimeout(() => loadLevelProgressionMaze(stream), 100);
      }
    }

    // Level progression mode
    if (mazeMode === 'level-map') {
      // Check for unlocked checkpoint
      if (tile.type === TileType.LEVEL_CHECKPOINT && tile.difficulty && !tile.isLocked) {
        audioManager.playCorrectAnswer();
        setTimeout(() => loadQuizMaze(tile.difficulty!), 100);
      }
      
      // Check for locked checkpoint
      if (tile.type === TileType.LOCKED_CHECKPOINT && tile.isLocked) {
        const requiredLevel = tile.difficulty === 'medium' ? 'Easy' : 'Medium';
        setLockedMessage(`🔒 Complete ${requiredLevel} level first!`);
        audioManager.playIncorrectAnswer();
        setTimeout(() => setLockedMessage(null), 2000);
      }
    }

    // Quiz maze mode
    if (mazeMode === 'playing-level') {
      // Check for goal reached
      if (tile.type === TileType.GOAL) {
        if (player.keysCollected >= questions.length) {
          // SUCCESS - All keys collected!
          audioManager.playVictory();
          completeLevel(questions.length);
          setMazeMode('results');
          return;
        } else {
          // FAILURE - Not enough keys
          const remaining = questions.length - player.keysCollected;
          setLockedMessage(`🔒 Need ${remaining} more key${remaining > 1 ? 's' : ''}! Answer more questions.`);
          audioManager.playIncorrectAnswer();
          setTimeout(() => setLockedMessage(null), 3000);
        }
      }

      // Check for quiz tile
      if (tile.type === TileType.QUIZ && tile.questionId && !tile.isAnswered) {
        const question = questions.find(q => q.id === tile.questionId);
        if (question) {
          audioManager.playQuizTrigger();
          setCurrentQuizQuestion(question);
          setCurrentQuizTile({ x, y });
          setShowQuiz(true);
        }
      }
    }
  }, [player.position, maze, mazeMode, showQuiz, questions]);

  // Handle quiz answer
  const handleQuizAnswer = (correct: boolean, attempts: number) => {
    const points = correct ? Math.max(100 - (attempts - 1) * 25, 25) : 0;
    
    if (correct) {
      audioManager.playCorrectAnswer();
      audioManager.playKeyCollected();
      updateGameScore(points);
      collectKey();
      addScore(points, correct);
      
      if (currentQuizTile) {
        answerQuizTile(currentQuizTile.x, currentQuizTile.y, true);
      }
    } else {
      audioManager.playIncorrectAnswer();
      audioManager.playLifeLost();
      loseLife();
      addScore(0, false);
      
      if (currentQuizTile) {
        answerQuizTile(currentQuizTile.x, currentQuizTile.y, false);
      }
    }

    setShowQuiz(false);
    setCurrentQuizTile(null);
    nextQuestion();
  };

  // Navigation handlers
  const handleBackToStreams = () => {
    loadStreamSelectionMaze();
  };

  const handleBackToLevelMap = () => {
    if (currentStream) {
      loadLevelProgressionMaze(currentStream);
    }
  };

  const handleNextStream = () => {
    resetCurrentSession();
    loadStreamSelectionMaze();
  };

  const handleNextLevel = () => {
    const nextDiff = getNextLevel();
    if (nextDiff && currentStream) {
      resetCurrentSession();
      loadQuizMaze(nextDiff);
    }
  };

  const handleRetry = () => {
    if (currentDifficulty && currentStream) {
      resetCurrentSession();
      loadQuizMaze(currentDifficulty);
    }
  };

  const handleReturnToLevelMap = () => {
    resetCurrentSession();
    if (currentStream) {
      loadLevelProgressionMaze(currentStream);
    }
  };

  const handleMainMenu = () => {
    resetCurrentSession();
    loadStreamSelectionMaze();
  };

  const getTimeSpent = () => {
    if (sessionStartTime <= 0) return 0;
    const now = Date.now();
    return Math.floor((now - sessionStartTime) / 1000);
  };

  // Get instructions based on mode
  const getInstructions = () => {
    switch (mazeMode) {
      case 'stream-map':
        return {
          title: '📚 Choose Your Subject',
          instructions: 'Navigate to a subject endpoint to select it',
        };
      case 'level-map':
        return {
          title: `${currentStream?.icon} ${currentStream?.name} - Select Difficulty`,
          instructions: 'Navigate to a checkpoint to start that level',
        };
      case 'playing-level':
        return {
          title: `${currentStream?.icon} ${currentStream?.name} - ${currentDifficulty}`,
          instructions: 'Answer questions, collect keys, reach the goal!',
        };
      default:
        return {
          title: 'Multi-Stream Maze Quiz',
          instructions: 'Navigate and learn!',
        };
    }
  };

  const { title, instructions } = getInstructions();

  // Initialize stream selection maze on mount
  useEffect(() => {
    loadStreamSelectionMaze();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary-600 to-primary-800 shadow-lg p-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-1">
            🎓 Multi-Stream Maze Quiz
          </h1>
          <p className="text-gray-200 text-sm">
            {instructions}
          </p>
        </div>
      </header>

      {/* Stats Bar */}
      {mazeMode !== 'results' && (
        <div className="bg-gray-800 border-b border-gray-700 py-3">
          <div className="max-w-7xl mx-auto px-4 flex justify-between items-center flex-wrap gap-4">
            <div className="flex gap-4">
              {mazeMode === 'playing-level' && (
                <>
                  <div className="text-center">
                    <div className="text-gray-400 text-xs mb-1">Lives</div>
                    <div className="text-xl font-bold text-red-400">
                      {'❤️'.repeat(player.lives)}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-gray-400 text-xs mb-1">Score</div>
                    <div className="text-xl font-bold text-yellow-400">{player.score}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-gray-400 text-xs mb-1">Keys</div>
                    <div className="text-xl font-bold text-blue-400">
                      {player.keysCollected}/{questions.length}
                    </div>
                  </div>
                </>
              )}
              {currentStream && (
                <div className="text-center">
                  <div className="text-gray-400 text-xs mb-1">Subject</div>
                  <div className="text-lg font-bold text-white">
                    {currentStream.icon} {currentStream.name}
                  </div>
                </div>
              )}
              {currentDifficulty && mazeMode === 'playing-level' && (
                <div className="text-center">
                  <div className="text-gray-400 text-xs mb-1">Level</div>
                  <div className="text-lg font-bold text-green-400 capitalize">
                    {currentDifficulty}
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              {mazeMode === 'level-map' && (
                <button
                  onClick={handleBackToStreams}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition text-sm"
                >
                  ⬅️ Back to Subjects
                </button>
              )}
              {mazeMode === 'playing-level' && (
                <button
                  onClick={handleBackToLevelMap}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition text-sm"
                >
                  ⬅️ Back to Levels
                </button>
              )}
              <button
                onClick={handleMainMenu}
                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition text-sm"
              >
                🏠 Main Menu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        {mazeMode !== 'results' && (
          <div className="max-w-6xl w-full">
            <div className="flex flex-col items-center gap-4">
              {/* Title */}
              <div className="bg-gray-800 rounded-lg p-4 max-w-2xl w-full">
                <h2 className="text-2xl font-bold text-white text-center mb-2">{title}</h2>
                {mazeMode === 'stream-map' && (
                  <p className="text-gray-400 text-center text-sm">
                    6 subjects • 102+ questions • Navigate to your choice
                  </p>
                )}
                {mazeMode === 'level-map' && (
                  <p className="text-gray-400 text-center text-sm">
                    Complete levels in order: Easy → Medium → Hard
                  </p>
                )}
              </div>

              {/* Controls hint */}
              <div className="bg-gray-800 rounded-lg p-3 max-w-2xl w-full">
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-300">
                  <div><strong className="text-blue-400">Arrow Keys / WASD:</strong> Move</div>
                  <div><strong className="text-purple-400">Purple Tiles:</strong> Subject Endpoints</div>
                  <div><strong className="text-green-400">Green Tiles:</strong> Unlocked Levels</div>
                  <div><strong className="text-gray-400">Gray Tiles:</strong> Locked Levels</div>
                </div>
              </div>

              {/* Locked message */}
              {lockedMessage && (
                <div className="bg-red-900 border border-red-700 text-white px-6 py-3 rounded-lg font-semibold">
                  {lockedMessage}
                </div>
              )}

              {/* Maze Canvas */}
              <div className="relative">
                <MazeCanvas />
                <MiniMap size={150} position="bottom-right" />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      {showQuiz && currentQuizQuestion && (
        <QuizModal
          question={currentQuizQuestion}
          onAnswer={handleQuizAnswer}
          onClose={() => setShowQuiz(false)}
          isVisible={true}
          currentQuestionNumber={currentQuestionIndex + 1}
          totalQuestions={questions.length}
        />
      )}

      <ResultsSummaryModal
        isVisible={mazeMode === 'results'}
        stream={currentStream}
        difficulty={currentDifficulty}
        score={currentScore}
        correctAnswers={currentCorrectAnswers}
        totalQuestions={questions.length}
        timeSpent={getTimeSpent()}
        onNextStream={handleNextStream}
        onNextLevel={handleNextLevel}
        onRetry={handleRetry}
        onMainMenu={handleReturnToLevelMap}
        hasNextLevel={hasNextLevel()}
      />

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 py-3 text-center text-gray-500 text-sm">
        <p>✨ Multi-Stream Maze Quiz • Maze-Based Navigation • Navigate & Learn! ✨</p>
      </footer>
    </div>
  );
}

export default QuizDemo;
