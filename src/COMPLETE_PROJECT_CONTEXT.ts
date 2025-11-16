// src/pages/QuizDemo.tsx
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { CharacterNamingModal } from "./components/modals/CharacterNamingModal";
import { InstructorTutorialModal } from "./components/modals/InstructorTutorialModal";
import { LevelInstructorModal } from "./components/modals/LevelInstructorModal";
import { SettingsModal } from "./components/modals/SettingsModal";
import { QuizModal } from "./components/modals/QuizModal";
import { MazeCanvas } from "./components/game/MazeCanvas";
import { MiniMap } from "./components/game/MiniMap";
import { useQuizProgressStore } from "./stores/quizProgressStore";
import { useGameStore } from "./stores/gameStore";
import { useInputHandler } from "./hooks/useInputHandler";
import { ML_TOPICS, type Topic } from "./data/questionBank";
import {
  generateMaze,
  placeQuizTiles,
  generateTopicSelectionMaze,
  generateLevelProgressionMaze,
} from "./services/mazeGenerator";
import GeminiService from "./services/geminiService";
import { LEVEL_SIZES } from "./utils/constants";
import { audioManager } from "./utils/audioManager";
import { TileType } from "./types/game.types";

type MazeMode = "stream-map" | "level-map" | "playing-level" | "results";

const REQUIRED_CORRECT = 5; // 5 correct to unlock goal
const TOTAL_QUESTIONS = 7;  // Always 7 from Gemini

export default function QuizDemo() {
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
    setLoadingQuestions,
  } = useGameStore();

  const [mazeMode, setMazeMode] = useState<MazeMode>("stream-map");
  const [questions, setQuestions] = useState<any[]>([]);
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuizQuestion, setCurrentQuizQuestion] = useState<any | null>(null);
  const [currentQuizTile, setCurrentQuizTile] = useState<{ x: number; y: number } | null>(null);
  const [lockedMessage, setLockedMessage] = useState<string | null>(null);
  const [goalUnlocked, setGoalUnlocked] = useState(false);

  const [showCharacterNaming, setShowCharacterNaming] = useState(
    !useGameStore.getState().characterName
  );
  const [showTutorial, setShowTutorial] = useState(false);
  const [showLevelInstructor, setShowLevelInstructor] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useInputHandler();

  // =============== MAZE LOADERS ===============

  const loadTopicSelectionMaze = () => {
    resetGame();
    const topicMaze = generateTopicSelectionMaze(ML_TOPICS);
    setMaze(topicMaze);

    for (let y = 0; y < topicMaze.height; y++) {
      for (let x = 0; x < topicMaze.width; x++) {
        if (topicMaze.tiles[y][x].type === TileType.START) {
          setPlayerPosition({ x, y });
          break;
        }
      }
    }

    setMazeMode("stream-map");
    setCurrentTopic(null);
    setCurrentLevelNumber(null);
    setGoalUnlocked(false);
  };

  const loadLevelProgressionMazeForTopic = (topic: Topic) => {
    resetGame();
    setCurrentTopic(topic);

    const completed = getCompletedLevelsForTopic(topic.id);
    const unlocked = {
      easy: true,
      medium: isTopicLevelUnlocked(topic.id, 2) || completed.some(l => l.levelNumber === 1),
      hard: isTopicLevelUnlocked(topic.id, 3) || completed.some(l => l.levelNumber === 2),
    };

    const progressionMaze = generateLevelProgressionMaze(topic.id, unlocked);
    setMaze(progressionMaze);

    for (let y = 0; y < progressionMaze.height; y++) {
      for (let x = 0; x < progressionMaze.width; x++) {
        if (progressionMaze.tiles[y][x].type === TileType.START) {
          setPlayerPosition({ x, y });
          break;
        }
      }
    }

    setMazeMode("level-map");
    setGoalUnlocked(false);
  };

  const loadQuizMaze = async (levelNumber: number) => {
    if (!currentTopic) return;

    resetGame();
    setCurrentLevelNumber(levelNumber);
    setGoalUnlocked(false);

    try {
      setLoadingQuestions(true, "Generating 7 questions...");

      const rawQuestions = await GeminiService.fetchQuizQuestions(currentTopic.name, levelNumber, TOTAL_QUESTIONS);
      setQuestions(rawQuestions);
      startQuiz();

      const { width, height } = LEVEL_SIZES.EASY;
      let newMaze = generateMaze(width, height);
      const questionIds = rawQuestions.map(q => q.id);
      newMaze = placeQuizTiles(newMaze, questionIds, rawQuestions.length);

      setMaze(newMaze);
      setPlayerPosition({ x: newMaze.width - 2, y: newMaze.height - 2 });
      setMazeMode("playing-level");
    } catch (error) {
      console.error("Failed to load quiz:", error);
    } finally {
      setLoadingQuestions(false);
    }
  };

  // =============== TILE INTERACTIONS ===============

  useEffect(() => {
    if (!maze || showQuiz) return;

    const { x, y } = player.position;
    const tile = maze.tiles[y]?.[x];
    if (!tile) return;

    if (mazeMode === "stream-map" && tile.type === TileType.STREAM_ENDPOINT) {
      const topic = ML_TOPICS.find(s => s.id === tile.streamId);
      if (topic) {
        audioManager.playCorrectAnswer();
        setTimeout(() => loadLevelProgressionMazeForTopic(topic), 100);
      }
    }

    if (mazeMode === "level-map") {
      if (tile.type === TileType.LEVEL_CHECKPOINT && tile.difficulty && !tile.isLocked) {
        audioManager.playCorrectAnswer();
        setShowLevelInstructor(true);
      }

      if (tile.type === TileType.LOCKED_CHECKPOINT && tile.isLocked) {
        setLockedMessage(t("messages.goalLocked"));
        audioManager.playIncorrectAnswer();
        setTimeout(() => setLockedMessage(null), 2000);
      }
    }

    if (mazeMode === "playing-level") {
      if (tile.type === TileType.GOAL) {
        if (currentCorrectAnswers >= REQUIRED_CORRECT) {
          audioManager.playVictory();
          completeLevel(TOTAL_QUESTIONS);
          setMazeMode("results");
          setGoalUnlocked(true);
          // PDF will be downloaded in results modal
        } else {
          const needed = REQUIRED_CORRECT - currentCorrectAnswers;
          setLockedMessage(`Need ${needed} more correct answer${needed > 1 ? "s" : ""}!`);
          audioManager.playIncorrectAnswer();
          loseLife();
          setTimeout(() => setLockedMessage(null), 3000);
        }
      }

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
  }, [
    player.position, maze, mazeMode, showQuiz, currentCorrectAnswers,
    questions, t, loseLife, completeLevel
  ]);

  // =============== QUIZ ANSWER HANDLER ===============

  const handleQuizAnswer = (correct: boolean, attempts: number) => {
    const points = correct ? Math.max(100 - (attempts - 1) * 25, 25) : 0;

    if (correct) {
      audioManager.playCorrectAnswer();
      audioManager.playKeyCollected();
      updateGameScore(points);
      collectKey();
      addScore(points, true);

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

  // =============== PDF DOWNLOAD ===============

  const downloadPDF = async () => {
    if (!currentTopic || !currentLevelNumber) return;

    try {
      await GeminiService.downloadStudyMaterial(currentTopic.name, currentLevelNumber);
    } catch (err) {
      console.error("PDF download failed:", err);
    }
  };

  // =============== NAVIGATION ===============

  const handleBackToStreams = () => loadTopicSelectionMaze();
  const handleBackToLevelMap = () => currentTopic && loadLevelProgressionMazeForTopic(currentTopic);
  const handleMainMenu = () => { resetCurrentSession(); loadTopicSelectionMaze(); };
  const handleRetry = () => currentTopic && currentLevelNumber && loadQuizMaze(currentLevelNumber);
  const handleNextLevel = () => {
    const next = getNextLevelForTopic(currentTopic?.id || "", currentLevelNumber || 1);
    if (next) loadQuizMaze(next);
  };
  const handleReturnToLevelMap = () => currentTopic && loadLevelProgressionMazeForTopic(currentTopic);
  const handleNextStream = () => { resetCurrentSession(); loadTopicSelectionMaze(); };

  const getTimeSpent = () => sessionStartTime > 0 ? Math.floor((Date.now() - sessionStartTime) / 1000) : 0;

  useEffect(() => { loadTopicSelectionMaze(); }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* HEADER */}
      <header className="bg-pink-500 text-white p-4 border-b border-pink-600">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            ML Maze Quest
          </h1>
          <button
            onClick={() => setShowSettings(true)}
            className="px-4 py-2 bg-black/30 rounded shadow text-sm"
          >
            Settings
          </button>
        </div>
      </header>

      {/* MAIN */}
      <main className="flex-1 px-4 py-4 flex justify-center">
        <div className="w-full max-w-6xl flex flex-col gap-4">
          {/* TOP ROW */}
          <div className="flex justify-between items-center text-sm text-white/90">
            <div>
              {currentTopic && currentLevelNumber && (
                <span>
                  {currentTopic.icon} {currentTopic.name} • Level {currentLevelNumber}
                </span>
              )}
            </div>
            <div className="flex gap-2">
              {mazeMode === "level-map" && (
                <button onClick={handleBackToStreams} className="px-3 py-1 bg-black/30 rounded text-xs">
                  Subjects
                </button>
              )}
              {mazeMode === "playing-level" && (
                <button onClick={handleBackToLevelMap} className="px-3 py-1 bg-black/30 rounded text-xs">
                  Levels
                </button>
              )}
              <button onClick={handleMainMenu} className="px-3 py-1 bg-black/30 rounded text-xs">
                Main Menu
              </button>
            </div>
          </div>

          {/* LOCK MESSAGE */}
          {lockedMessage && (
            <div className="bg-red-700 text-white px-4 py-2 rounded shadow text-sm">
              {lockedMessage}
            </div>
          )}

          {/* MAZE */}
          <div className="flex w-full h-[70vh]">
            <div className="flex-1" />
            <div className="relative w-[65%] h-full rounded-lg overflow-hidden border border-white/15 shadow-2xl bg-black">
              <MazeCanvas />
              <MiniMap size={140} position="bottom-right" />
            </div>
          </div>
        </div>
      </main>

      {/* QUIZ MODAL */}
      {showQuiz && currentQuizQuestion && (
        <QuizModal
          isVisible={true}
          question={currentQuizQuestion}
          onAnswer={handleQuizAnswer}
          onClose={() => {
            setShowQuiz(false);
            setCurrentQuizTile(null);
          }}
          currentQuestionNumber={currentQuestionIndex + 1}
          totalQuestions={TOTAL_QUESTIONS}
        />
      )}

      {/* RESULTS MODAL */}
      {mazeMode === "results" && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-4">
              {goalUnlocked ? "Level Complete!" : "Try Again!"}
            </h3>
            <p className="text-gray-300 mb-4">
              Score: {currentScore} | Correct: {currentCorrectAnswers}/{TOTAL_QUESTIONS} | Time: {getTimeSpent()}s
            </p>
            {goalUnlocked && (
              <p className="text-green-400 mb-4">
                Goal Unlocked! PDF is downloading...
              </p>
            )}
            <div className="flex flex-wrap gap-2 justify-end">
              <button onClick={handleRetry} className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded text-sm">
                Retry
              </button>
              {hasNextLevelForTopic(currentTopic?.id || "", currentLevelNumber || 1) && (
                <button onClick={handleNextLevel} className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded text-sm">
                  Next Level
                </button>
              )}
              <button onClick={handleReturnToLevelMap} className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded text-sm">
                Back to Levels
              </button>
              <button onClick={handleNextStream} className="bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 rounded text-sm">
                New Topic
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AUTO DOWNLOAD PDF ON COMPLETE */}
      {mazeMode === "results" && goalUnlocked && currentTopic && currentLevelNumber && (
        <AutoDownloadPDF topic={currentTopic.name} level={currentLevelNumber} />
      )}

      {/* STARTUP MODALS */}
      <CharacterNamingModal
        ivalid={showCharacterNaming}
        onComplete={() => {
          setShowCharacterNaming(false);
          setShowTutorial(true);
        }}
      />
      <InstructorTutorialModal
        isVisible={showTutorial}
        onComplete={() => setShowTutorial(false)}
        characterName={useGameStore.getState().characterName}
      />
      <LevelInstructorModal
        isVisible={showLevelInstructor}
        topicName={currentTopic?.name || ""}
        levelNumber={currentLevelNumber || 1}
        onStartLevel={() => {
          setShowLevelInstructor(false);
          const tile = maze?.tiles[player.position.y][player.position.x];
          const levelNum = tile?.difficulty === "easy" ? 1 : tile?.difficulty === "medium" ? 2 : 3;
          setTimeout(() => loadQuizMaze(levelNum), 100);
        }}
      />
      <SettingsModal isVisible={showSettings} onClose={() => setShowSettings(false)} />
    </div>
  );
}

// Auto-download component
function AutoDownloadPDF({ topic, level }: { topic: string; level: number }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      GeminiService.downloadStudyMaterial(topic, level);
    }, 500);
    return () => clearTimeout(timer);
  }, [topic, level]);

  return null;
}