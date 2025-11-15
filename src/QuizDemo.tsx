/**
 * Quiz Demo Page - Multi-stream quiz with maze-based navigation
 * New flow: Stream selection maze → Level progression maze → Quiz maze
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { QuizModal } from './components/modals/QuizModal';
import { ResultsSummaryModal } from './components/modals/ResultsSummaryModal';
import { CharacterNamingModal } from './components/modals/CharacterNamingModal';
import { InstructorTutorialModal } from './components/modals/InstructorTutorialModal';
import { LevelInstructorModal } from './components/modals/LevelInstructorModal';
import { SettingsModal } from './components/modals/SettingsModal';
import { MazeCanvas } from './components/game/MazeCanvas';
import { MiniMap } from './components/game/MiniMap';
import { useQuizProgressStore } from './stores/quizProgressStore';
import { useGameStore } from './stores/gameStore';
import { useInputHandler } from './hooks/useInputHandler';
import { ML_TOPICS, type Topic } from './data/questionBank';
import {
  generateMaze,
  placeQuizTiles,
  generateTopicSelectionMaze,
  generateLevelProgressionMaze
} from './services/mazeGenerator';
import GeminiService from './services/geminiService';
import { LEVEL_SIZES } from './utils/constants';
import { audioManager } from './utils/audioManager';
import { TileType } from './types/game.types';
import type { Question } from './types/content.types';
import { LoadingModal } from './components/modals/LoadingModal';

type MazeMode = 'stream-map' | 'level-map' | 'playing-level' | 'results';

export function QuizDemo() {
  const { t } = useTranslation();

  const {
    currentTopic,
    currentLevelNumber,
    currentQuestionIndex,
    currentScore,
    currentCorrectAnswers,
    setCurrentTopic,
    setCurrentLevelNumber,
    startQuiz,
    nextQuestion,
    addScore,
    completeLevel,
    resetCurrentSession,
    getCompletedLevelsForTopic,
    isTopicLevelUnlocked,
    hasNextLevelForTopic,
    getNextLevelForTopic,
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

  // Startup flow modals
  const [showCharacterNaming, setShowCharacterNaming] = useState(!useGameStore.getState().characterName);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showLevelInstructor, setShowLevelInstructor] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Enable keyboard input
  useInputHandler();

  // Load topic selection maze
  const loadTopicSelectionMaze = () => {
    resetGame();
    const topicMaze = generateTopicSelectionMaze(ML_TOPICS);
    setMaze(topicMaze);

    // Find start position
    for (let y = 0; y < topicMaze.height; y++) {
      for (let x = 0; x < topicMaze.width; x++) {
        if (topicMaze.tiles[y][x].type === TileType.START) {
          setPlayerPosition({ x, y });
          break;
        }
      }
    }

    setMazeMode('stream-map');
    setCurrentTopic(null);
    setCurrentLevelNumber(null);
  };

  // Load level progression maze for a topic
  const loadLevelProgressionMaze = (topic: Topic) => {
    resetGame();
    setCurrentTopic(topic);

    // For topic model, generate checkpoints based on topic levels
    // This needs to be implemented - for now use placeholder
    const progressionMaze = generateLevelProgressionMaze(topic.id, {
      easy: true, medium: false, hard: false  // Placeholder logic
    });
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

  // Load quiz maze for a level
  const loadQuizMaze = async (levelNumber: number) => {
    if (!currentTopic) return;

    resetGame();
    setCurrentLevelNumber(levelNumber);

    try {
      // Show loading state
      useGameStore.getState().setLoadingQuestions(true, 'Generating questions...');

      // Fetch questions from Gemini API
      const fetchedQuestions = await GeminiService.fetchQuizQuestions(currentTopic.name, levelNumber, 10);

      if (fetchedQuestions.length === 0) {
        throw new Error('No questions generated');
      }

      setQuestions(fetchedQuestions);
      startQuiz();

      // Generate maze (same size for now)
      const size = LEVEL_SIZES.EASY;
      let newMaze = generateMaze(size.width, size.height);

      // Place quiz tiles with question IDs
      const questionIds = fetchedQuestions.map(q => q.id);
      newMaze = placeQuizTiles(newMaze, questionIds, fetchedQuestions.length);

      setMaze(newMaze);
      setPlayerPosition({ x: newMaze.width - 2, y: newMaze.height - 2 });

      setMazeMode('playing-level');
    } catch (error) {
      console.error('Failed to load quiz questions:', error);

      // Fallback to basic questions
      const fallbackQuestions: Question[] = [
        {
          id: 'fallback_1',
          prompt: `What is Machine Learning?`,
          type: 'multiple_choice',
          options: [
            'A type of language',
            'Teaching computers to learn patterns',
            'A programming paradigm',
            'A database technology'
          ],
          correctAnswer: 1,
          explanation: 'Machine Learning teaches computers to learn patterns from data.',
          hint: 'Consider what ML aims to achieve',
          topic: 'machine-learning',
          difficulty: 1,
          estimatedTimeSeconds: 20
        },
        {
          id: 'fallback_2',
          prompt: 'What is supervised learning?',
          type: 'short_answer',
          correctAnswer: 'learning with labeled data',
          explanation: 'Supervised learning uses labeled examples to train ML models.',
          hint: 'Think about how the model learns',
          topic: 'machine-learning',
          difficulty: 1,
          estimatedTimeSeconds: 25
        }
      ];

      setQuestions(fallbackQuestions);
      startQuiz();
      setMazeMode('playing-level');
    } finally {
      // Hide loading state
      useGameStore.getState().setLoadingQuestions(false);
    }
  };

  // Check for endpoint/checkpoint/quiz tile interactions
  useEffect(() => {
    if (!maze || showQuiz) return;

    const { x, y } = player.position;
    const tile = maze.tiles[y]?.[x];
    if (!tile) return;

    // Topic selection mode
    if (mazeMode === 'stream-map' && tile.type === TileType.STREAM_ENDPOINT) {
      const topic = ML_TOPICS.find(s => s.id === tile.streamId);
      if (topic) {
        audioManager.playCorrectAnswer();
        setTimeout(() => loadLevelProgressionMaze(topic), 100);
      }
    }

    // Level progression mode
    if (mazeMode === 'level-map') {
      // Check for unlocked checkpoint
      if (tile.type === TileType.LEVEL_CHECKPOINT && tile.difficulty && !tile.isLocked) {
        audioManager.playCorrectAnswer();
        // Parse difficulty to level number (placeholder logic)
        const levelNum = tile.difficulty === 'easy' ? 1 : tile.difficulty === 'medium' ? 2 : 3;
        // Show level instructor modal first
        setShowLevelInstructor(true);
      }

      // Check for locked checkpoint
      if (tile.type === TileType.LOCKED_CHECKPOINT && tile.isLocked) {
        const requiredLevel = tile.difficulty === 'medium' ? 'Easy' : 'Medium';
        setLockedMessage(t('messages.goalLocked'));
        audioManager.playIncorrectAnswer();
        setTimeout(() => setLockedMessage(null), 2000);
      }
    }

    // Quiz maze mode
    if (mazeMode === 'playing-level') {
      // Check for goal reached
      if (tile.type === TileType.GOAL) {
        if (player.keysCollected >= 8) {
          // SUCCESS - 8 out of 10 keys collected!
          audioManager.playVictory();
          completeLevel(questions.length);
          setMazeMode('results');
          return;
        } else {
          // FAILURE - Not enough keys - LOSE LIFE and reset mods
          const remaining = 8 - player.keysCollected;
          setLockedMessage(`🔒 Need ${remaining} more key${remaining > 1 ? 's' : ''}! Answer more questions.`);
          audioManager.playIncorrectAnswer();
          loseLife();
          setTimeout(() => {
            setLockedMessage(`💔 Life lost! You need ${remaining} more key${remaining > 1 ? 's' : ''} to complete this level.`);
            setTimeout(() => setLockedMessage(null), 3000);
          }, 1000);
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
    loadTopicSelectionMaze();
  };

  const handleBackToLevelMap = () => {
    if (currentTopic) {
      loadLevelProgressionMaze(currentTopic);
    }
  };

  const handleNextStream = () => {
    resetCurrentSession();
    loadTopicSelectionMaze();
  };

  const handleNextLevel = () => {
    const nextLevel = getNextLevelForTopic(currentTopic?.id || '', currentLevelNumber || 1);
    if (nextLevel && currentTopic) {
      resetCurrentSession();
      loadQuizMaze(nextLevel);
    }
  };

  const handleRetry = () => {
    if (currentLevelNumber && currentTopic) {
      resetCurrentSession();
      loadQuizMaze(currentLevelNumber);
    }
  };

  const handleReturnToLevelMap = () => {
    resetCurrentSession();
    if (currentTopic) {
      loadLevelProgressionMaze(currentTopic);
    }
  };

  const handleMainMenu = () => {
    resetCurrentSession();
    loadTopicSelectionMaze();
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
          title: t('messages.topicSelect'),
          instructions: 'Navigate to a topic endpoint to select it',
        };
      case 'level-map':
        return {
          title: `${currentTopic?.icon} ${currentTopic?.name} - ${t('messages.levelSelect', { topic: currentTopic?.name })}`,
          instructions: 'Navigate to a checkpoint to start that level',
        };
      case 'playing-level':
        return {
          title: t('messages.playingLevel', { topic: currentTopic?.name, level: currentLevelNumber }),
          instructions: t('messages.collectKeys'),
        };
      default:
        return {
          title: t('game.title'),
          instructions: 'Navigate and learn!',
        };
    }
  };

  const { title, instructions } = getInstructions();

  // Initialize topic selection maze on mount
  useEffect(() => {
    loadTopicSelectionMaze();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary-600 to-primary-800 shadow-lg p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">
              🎓 {t('game.title')}
            </h1>
            <p className="text-gray-200 text-sm">
              {instructions}
            </p>
          </div>
          <button
            onClick={() => setShowSettings(true)}
            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors text-sm"
            title="Settings"
          >
            ⚙️ Settings
          </button>
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
                    <div className="text-gray-400 text-xs mb-1">{t('game.lives')}</div>
                    <div className="text-xl font-bold text-red-400">
                      {'❤️'.repeat(player.lives)}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-gray-400 text-xs mb-1">{t('game.score')}</div>
                    <div className="text-xl font-bold text-yellow-400">{player.score}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-gray-400 text-xs mb-1">{t('game.keys')}</div>
                    <div className="text-xl font-bold text-blue-400">
                      {player.keysCollected}/{questions.length}
                    </div>
                  </div>
                </>
              )}
              {currentTopic && (
                <div className="text-center">
                  <div className="text-gray-400 text-xs mb-1">{t('game.topic')}</div>
                  <div className="text-lg font-bold text-white">
                    {currentTopic.icon} {currentTopic.name}
                  </div>
                </div>
              )}
              {currentLevelNumber && mazeMode === 'playing-level' && (
                <div className="text-center">
                  <div className="text-gray-400 text-xs mb-1">{t('game.level')}</div>
                  <div className="text-lg font-bold text-green-400">
                    Level {currentLevelNumber}
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
                  ⬅️ {t('navigation.backToSubjects')}
                </button>
              )}
              {mazeMode === 'playing-level' && (
                <button
                  onClick={handleBackToLevelMap}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition text-sm"
                >
                  ⬅️ {t('navigation.backToLevels')}
                </button>
              )}
              <button
                onClick={handleMainMenu}
                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition text-sm"
              >
                🏠 {t('navigation.mainMenu')}
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
                    6 ML topics • Navigate to your choice
                  </p>
                )}
                {mazeMode === 'level-map' && (
                  <p className="text-gray-400 text-center text-sm">
                    Complete levels in order: 1 → 2 → 3 ...
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

      {/* TODO: Update ResultsSummaryModal interface to support topics */}
      {mazeMode === 'results' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-white mb-4">Level Complete!</h3>
            <p className="text-gray-300 mb-4">Score: {currentScore} | Correct: {currentCorrectAnswers}/{questions.length}</p>
            <button
              onClick={() => setMazeMode('stream-map')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Startup Modals */}
      <CharacterNamingModal
        isVisible={showCharacterNaming}
        onComplete={() => {
          setShowCharacterNaming(false);
          setShowTutorial(true);
        }}
      />

      <InstructorTutorialModal
        isVisible={showTutorial}
        onComplete={() => {
          setShowTutorial(false);
        }}
        characterName={useGameStore.getState().characterName}
      />

      <LevelInstructorModal
        isVisible={showLevelInstructor}
        topicName={currentTopic?.name || ''}
        levelNumber={currentLevelNumber || 1}
        onStartLevel={() => {
          setShowLevelInstructor(false);
          // Now start the quiz maze
          const levelNum = maze?.tiles[player.position.y][player.position.x].difficulty === 'easy' ? 1 :
                          maze?.tiles[player.position.y][player.position.x].difficulty === 'medium' ? 2 : 3;
          setTimeout(() => loadQuizMaze(levelNum || 1), 100);
        }}
      />

      <SettingsModal
        isVisible={showSettings}
        onClose={() => setShowSettings(false)}
      />

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 py-3 text-center text-gray-500 text-sm">
        <p>✨ ML Learning Maze • Maze-Based Navigation • Navigate & Learn! ✨</p>
      </footer>
    </div>
  );
}

export default QuizDemo;
