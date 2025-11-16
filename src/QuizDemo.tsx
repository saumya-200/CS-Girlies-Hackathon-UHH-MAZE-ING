// src/QuizDemo.tsx
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { CharacterNamingModal } from "./components/modals/CharacterNamingModal";
import { SettingsModal } from "./components/modals/SettingsModal";
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
import { InstructorTutorialModal } from "./components/modals/InstructorTutorialModal";
import { LevelInstructorModal } from "./components/modals/LevelInstructorModal";

import { LevelPdfViewer } from "./components/LevelPdfViewer";

import settingsIcon from "./assets/icons/settings.png";
import homeIcon from "./assets/icons/home.png";
import backIcon from "./assets/icons/back.png";

type MazeMode = "stream-map" | "level-map" | "playing-level" | "results";

const REQUIRED_CORRECT = 5;
const TOTAL_QUESTIONS = 7;

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
  const [currentQuizQuestion, setCurrentQuizQuestion] = useState<any | null>(
    null
  );
  const [currentQuizTile, setCurrentQuizTile] = useState<{
    x: number;
    y: number;
  } | null>(null);
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
      medium:
        isTopicLevelUnlocked(topic.id, 2) ||
        completed.some((l) => l.levelNumber === 1),
      hard:
        isTopicLevelUnlocked(topic.id, 3) ||
        completed.some((l) => l.levelNumber === 2),
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

      const rawQuestions = await GeminiService.fetchQuizQuestions(
        currentTopic.name,
        levelNumber,
        TOTAL_QUESTIONS
      );
      setQuestions(rawQuestions);
      startQuiz();

      const { width, height } = LEVEL_SIZES.EASY;
      let newMaze = generateMaze(width, height);

      const questionIds = rawQuestions.map((q) => q.id);
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
      const topic = ML_TOPICS.find((s) => s.id === tile.streamId);
      if (topic) {
        audioManager.playCorrectAnswer();
        setTimeout(() => loadLevelProgressionMazeForTopic(topic), 100);
      }
    }

    if (mazeMode === "level-map") {
      if (
        tile.type === TileType.LEVEL_CHECKPOINT &&
        tile.difficulty &&
        !tile.isLocked
      ) {
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
        } else {
          const needed = REQUIRED_CORRECT - currentCorrectAnswers;
          setLockedMessage(
            `Need ${needed} more correct answer${needed > 1 ? "s" : ""}!`
          );
          audioManager.playIncorrectAnswer();
          loseLife();
          setTimeout(() => setLockedMessage(null), 3000);
        }
      }

      if (tile.type === TileType.QUIZ && tile.questionId && !tile.isAnswered) {
        const question = questions.find((q) => q.id === tile.questionId);
        if (question) {
          audioManager.playQuizTrigger();
          setCurrentQuizQuestion(question);
          setCurrentQuizTile({ x, y });
          setShowQuiz(true);
        }
      }
    }
  }, [
    player.position,
    maze,
    mazeMode,
    showQuiz,
    currentCorrectAnswers,
    questions,
    t,
    loseLife,
    completeLevel,
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

  // =============== PDF DOWNLOAD (auto, via component) ===============

  const getTimeSpent = () =>
    sessionStartTime > 0
      ? Math.floor((Date.now() - sessionStartTime) / 1000)
      : 0;

  // =============== NAVIGATION ===============

  const handleBackToStreams = () => loadTopicSelectionMaze();
  const handleBackToLevelMap = () =>
    currentTopic && loadLevelProgressionMazeForTopic(currentTopic);
  const handleMainMenu = () => {
    resetCurrentSession();
    loadTopicSelectionMaze();
  };
  const handleRetry = () =>
    currentTopic && currentLevelNumber && loadQuizMaze(currentLevelNumber);
  const handleNextLevel = () => {
    const next = getNextLevelForTopic(
      currentTopic?.id || "",
      currentLevelNumber || 1
    );
    if (next) loadQuizMaze(next);
  };
  const handleReturnToLevelMap = () =>
    currentTopic && loadLevelProgressionMazeForTopic(currentTopic);
  const handleNextStream = () => {
    resetCurrentSession();
    loadTopicSelectionMaze();
  };

  useEffect(() => {
    loadTopicSelectionMaze();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showInlineQuiz = showQuiz && currentQuizQuestion != null;

  // ===================== RENDER =====================

  return (
    <div className="min-h-screen flex flex-col bg-pink-500">
      {/* HEADER */}
   <header className="bg-pink-500 text-white py-4 border-b border-pink-600">
  <div className="flex items-center justify-between w-full px-4">

    {/* LEFT BUTTONS — EMOJIS */}
    <div className="flex items-center gap-6 text-3xl select-none">

      {/* SETTINGS */}
      <button
        onClick={() => setShowSettings(true)}
        className="hover:scale-125 transition-transform"
        style={{ fontSize: "3rem", lineHeight: "1" }}
      >
        ⚙️
      </button>

      {/* HOME */}
      <button
        onClick={handleMainMenu}
        className="hover:scale-125 transition-transform"
        style={{ fontSize: "3rem", lineHeight: "1" }}
      >
        🏠
      </button>

      {/* BACK */}
      {(mazeMode === "level-map" || mazeMode === "playing-level") && (
        <button
          onClick={
            mazeMode === "level-map"
              ? handleBackToStreams
              : handleBackToLevelMap
          }
          className="hover:scale-125 transition-transform"
          style={{ fontSize: "3rem", lineHeight: "1" }}
        >
          ⬅️
        </button>
      )}
    </div>

    {/* CENTER LOGO */}
    <h1
      className="
        font-extrabold text-cyan-300 tracking-[0.18em]
        pixel-text animate-pulse text-center leading-none select-none
      "
      style={{
        fontSize: "5rem",
        lineHeight: "0.8",
        textShadow:
          '0 0 40px rgba(0,255,255,1), 0 0 80px rgba(0,255,255,0.8)',
      }}
    >
      UHH-MAZE-ING
    </h1>

    {/* RIGHT HEARTS */}
    <div
      className="flex items-center justify-end w-32"
      style={{ fontSize: "3rem", lineHeight: "1" }}
    >
      ❤️❤️❤️❤️❤️
    </div>

  </div>
</header>


      {/* MAIN */}
      <main className="flex-1 px-4 py-4 flex">
        <div className="w-full flex flex-col gap-4">
          {/* TOP ROW: LEVEL LABEL */}
          <div className="flex justify-between items-center text-sm text-white/90">
            <div>
              {currentTopic && currentLevelNumber && (
                <span>
                  {currentTopic.icon} {currentTopic.name} • Level{" "}
                  {currentLevelNumber}
                </span>
              )}
            </div>
            <div className="text-xs text-white/70">
              {sessionStartTime > 0 && `Time: {getTimeSpent()}s`}
            </div>
          </div>

          {/* LOCK MESSAGE */}
          {lockedMessage && (
            <div className="bg-red-700 text-white px-4 py-2 rounded shadow text-sm">
              {lockedMessage}
            </div>
          )}

          {/* MAZE + LEFT PANEL ROW */}
          <div className="flex w-full h-[70vh] gap-4">
            {/* LEFT PANEL — OWL FIRST, THEN PDF */}
            <div className="w-[35%] h-full rounded-lg overflow-hidden bg-white border-[6px] border-[#ff008c] shadow-2xl">
              {showLevelInstructor ? (
                <LevelInstructorModal
                  isVisible={showLevelInstructor}
                  topicName={currentTopic?.name || ""}
                  levelNumber={currentLevelNumber || 1}
                  onStartLevel={() => {
                    setShowLevelInstructor(false);
                    const tile =
                      maze?.tiles[player.position.y][player.position.x];
                    const levelNum =
                      tile?.difficulty === "easy"
                        ? 1
                        : tile?.difficulty === "medium"
                        ? 2
                        : 3;
                    setTimeout(() => loadQuizMaze(levelNum), 100);
                  }}
                />
              ) : mazeMode === "playing-level" ? (
                <LevelPdfViewer />
              ) : (
                <div className="h-full flex items-center justify-center px-4 text-center text-xs text-gray-500 pixel-text">
                  Walk into a level to see its guide here.
                </div>
              )}
            </div>

            {/* RIGHT PANEL — MAZE WINDOW */}
            <div className="relative w-[65%] h-full rounded-lg overflow-hidden border-[6px] border-[#ff008c] shadow-2xl bg-black">
              {/* MAZE */}
              <MazeCanvas />

              {/* MINI MAP — BOTTOM RIGHT INSIDE WINDOW */}
              <div className="absolute bottom-3 right-3 z-30">
                <MiniMap size={140} />
              </div>

              {/* INLINE QUIZ — APPEARS INSIDE THE MAZE WINDOW */}
              {showInlineQuiz && currentQuizQuestion && (
                <div className="absolute top-[8%] left-1/2 -translate-x-1/2 z-40 w-[80%]">
                  <InlineQuizPanel
                    question={currentQuizQuestion}
                    onAnswer={handleQuizAnswer}
                    currentQuestionNumber={currentQuestionIndex + 1}
                    totalQuestions={TOTAL_QUESTIONS}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* RESULTS MODAL */}
      {mazeMode === "results" && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-4">
              {goalUnlocked ? "Level Complete!" : "Try Again!"}
            </h3>
            <p className="text-gray-300 mb-4">Score: {currentScore}</p>
            {goalUnlocked && (
              <p className="text-green-400 mb-4">
                Goal Unlocked! PDF is downloading...
              </p>
            )}
            <div className="flex flex-wrap gap-2 justify-end">
              <button
                onClick={handleRetry}
                className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded text-sm"
              >
                Retry
              </button>
              {hasNextLevelForTopic(
                currentTopic?.id || "",
                currentLevelNumber || 1
              ) && (
                <button
                  onClick={handleNextLevel}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded text-sm"
                >
                  Next Level
                </button>
              )}
              <button
                onClick={handleReturnToLevelMap}
                className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded text-sm"
              >
                Back to Levels
              </button>
              <button
                onClick={handleNextStream}
                className="bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 rounded text-sm"
              >
                New Topic
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AUTO DOWNLOAD PDF ON COMPLETE */}
      {mazeMode === "results" &&
        goalUnlocked &&
        currentTopic &&
        currentLevelNumber && (
          <AutoDownloadPDF
            topic={currentTopic.name}
            level={currentLevelNumber}
          />
        )}

      {/* STARTUP MODALS */}
      <CharacterNamingModal
        isVisible={showCharacterNaming}
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
      <SettingsModal
        isVisible={showSettings}
        onClose={() => setShowSettings(false)}
      />
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

// =============== INLINE PIXEL QUIZ PANEL (NO MODAL) ===============
interface InlineQuizPanelProps {
  question: any;
  onAnswer: (correct: boolean, attempts: number) => void;
  currentQuestionNumber: number;
  totalQuestions: number;
}

function InlineQuizPanel({
  question,
  onAnswer,
  currentQuestionNumber,
  totalQuestions,
}: InlineQuizPanelProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [userAnswer, setUserAnswer] = useState("");
  const [attempts, setAttempts] = useState(0);

  // Reset when question changes
  useEffect(() => {
    setSelectedAnswer("");
    setUserAnswer("");
    setAttempts(0);
  }, [question.id]);

  const canSubmit = () => {
    if (question.type === "short_answer") {
      return userAnswer.trim().length > 0;
    }
    return selectedAnswer.length > 0;
  };

  const handleSubmit = () => {
    if (!canSubmit()) return;

    const attemptNum = attempts + 1;
    setAttempts(attemptNum);

    let correct = false;

    if (question.type === "multiple_choice") {
      correct =
        question.options?.indexOf(selectedAnswer) === question.correctAnswer;
    } else if (question.type === "short_answer") {
      correct =
        userAnswer.trim().toLowerCase() ===
        String(question.correctAnswer).toLowerCase();
    } else if (question.type === "true_false") {
      correct = selectedAnswer === question.correctAnswer;
    }

    setTimeout(() => {
      onAnswer(correct, attemptNum);
    }, 1000);
  };

  return (
    <div className="pixel-panel pixel-text mb-3 bg-white border-4 border-black rounded-xl shadow-2xl">
      {/* HEADER */}
      <div className="mb-4 px-4 pt-4">
        <div className="flex justify-between text-xs mb-1 pixel-text">
          <span>
            Q {currentQuestionNumber}/{totalQuestions}
          </span>
          <span>
            {Math.round((currentQuestionNumber / totalQuestions) * 100)}%
          </span>
        </div>

        <div className="w-full bg-black rounded-full h-2">
          <div
            className="h-2 bg-[#ff008c] rounded-full transition-all duration-500"
            style={{
              width: `${(currentQuestionNumber / totalQuestions) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* QUESTION */}
      <div className="mb-4 px-4">
        <div className="text-lg font-bold pixel-text">QUESTION</div>
        <p className="mt-2 pixel-text">{question.prompt}</p>
      </div>

      {/* MULTI CHOICE */}
      {question.type === "multiple_choice" && (
        <div className="flex flex-col gap-2 px-4 pb-4">
          {question.options?.map((opt: string, i: number) => (
            <button
              key={i}
              onClick={() => setSelectedAnswer(opt)}
              className={`
                w-full text-left px-4 py-3 rounded-lg border-4 border-black bg-white pixel-text 
                ${selectedAnswer === opt ? "bg-[#ffe0f4]" : ""}
              `}
            >
              {opt}
            </button>
          ))}
        </div>
      )}

      {/* SHORT ANSWER */}
      {question.type === "short_answer" && (
        <div className="px-4 pb-4">
          <input
            className="w-full px-4 py-3 rounded-lg border-4 border-black bg-white pixel-text outline-none"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
          />
        </div>
      )}

      {/* TRUE/FALSE */}
      {question.type === "true_false" && (
        <div className="flex gap-3 px-4 pb-4">
          {["true", "false"].map((v) => (
            <button
              key={v}
              onClick={() => setSelectedAnswer(v)}
              className={`
                flex-1 px-4 py-3 rounded-lg border-4 border-black bg-white pixel-text 
                ${selectedAnswer === v ? "bg-[#ffe0f4]" : ""}
              `}
            >
              {v.toUpperCase()}
            </button>
          ))}
        </div>
      )}

      {/* SUBMIT */}
      <div className="px-4 pb-4">
        <button
          onClick={handleSubmit}
          disabled={!canSubmit()}
          className="
            w-full mt-1 px-4 py-3 rounded-lg 
            border-4 border-black bg-[#ff008c] text-white 
            pixel-text font-bold disabled:opacity-50
          "
        >
          SUBMIT
        </button>
      </div>
    </div>
  );
}
