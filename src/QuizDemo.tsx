import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
// NOTE: QuizModal is kept in the codebase but not used visually here
// import { QuizModal } from "./components/modals/QuizModal";
import { CharacterNamingModal } from "./components/modals/CharacterNamingModal";
import { InstructorTutorialModal } from "./components/modals/InstructorTutorialModal";
import { LevelInstructorModal } from "./components/modals/LevelInstructorModal";
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
import type { Question } from "./types/content.types";

type MazeMode = "stream-map" | "level-map" | "playing-level" | "results";

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
  } = useGameStore();

  const [mazeMode, setMazeMode] = useState<MazeMode>("stream-map");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuizQuestion, setCurrentQuizQuestion] =
    useState<Question | null>(null);
  const [currentQuizTile, setCurrentQuizTile] = useState<{ x: number; y: number } | null>(
    null
  );
  const [lockedMessage, setLockedMessage] = useState<string | null>(null);

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
  };

  const loadQuizMaze = async (levelNumber: number) => {
    if (!currentTopic) return;

    resetGame();
    setCurrentLevelNumber(levelNumber);

    try {
      useGameStore.getState().setLoadingQuestions(true, "Generating questions...");

      const rawQuestions = await GeminiService.fetchQuizQuestions(
        currentTopic.name,
        levelNumber,
        10
      );

      // Normalize so `hint` always exists
      const normalizedQuestions: Question[] = rawQuestions.map((q) => ({
        hint: "",
        ...q,
      }));

      let finalQuestions = normalizedQuestions;

      if (!normalizedQuestions.length) {
        finalQuestions = [
          {
            id: "fallback_1",
            prompt: "What is Machine Learning?",
            type: "multiple_choice",
            options: [
              "A type of language",
              "Teaching computers to learn patterns",
              "A programming paradigm",
              "A database technology",
            ],
            correctAnswer: 1,
            explanation: "Machine Learning teaches computers to learn patterns.",
            hint: "",
            topic: "machine-learning",
            difficulty: 1,
            estimatedTimeSeconds: 20,
          },
        ];
      }

      setQuestions(finalQuestions);
      startQuiz();

      const { width, height } = LEVEL_SIZES.EASY;
      let newMaze = generateMaze(width, height);

      const questionIds = finalQuestions.map((q) => q.id);
      newMaze = placeQuizTiles(newMaze, questionIds, finalQuestions.length);

      setMaze(newMaze);
      setPlayerPosition({ x: newMaze.width - 2, y: newMaze.height - 2 });

      setMazeMode("playing-level");
    } catch (error) {
      console.error("Failed to load quiz questions:", error);
    } finally {
      useGameStore.getState().setLoadingQuestions(false);
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
        if (player.keysCollected >= 8) {
          audioManager.playVictory();
          completeLevel(questions.length);
          setMazeMode("results");
          return;
        } else {
          const remaining = 8 - player.keysCollected;
          setLockedMessage(
            `🔒 Need ${remaining} more key${remaining > 1 ? "s" : ""}!`
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
    mazeMode,
    maze,
    showQuiz,
    player.keysCollected,
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

  // =============== NAVIGATION HELPERS ===============

  const handleBackToStreams = () => loadTopicSelectionMaze();

  const handleBackToLevelMap = () => {
    if (currentTopic) loadLevelProgressionMazeForTopic(currentTopic);
  };

  const handleMainMenu = () => {
    resetCurrentSession();
    loadTopicSelectionMaze();
  };

  const handleRetry = () => {
    if (currentTopic && currentLevelNumber) {
      resetCurrentSession();
      loadQuizMaze(currentLevelNumber);
    }
  };

  const handleNextLevel = () => {
    if (!currentTopic || !currentLevelNumber) return;
    const nextLevel = getNextLevelForTopic(currentTopic.id, currentLevelNumber);
    if (nextLevel) {
      resetCurrentSession();
      loadQuizMaze(nextLevel);
    }
  };

  const handleReturnToLevelMap = () => {
    resetCurrentSession();
    if (currentTopic) loadLevelProgressionMazeForTopic(currentTopic);
  };

  const handleNextStream = () => {
    resetCurrentSession();
    loadTopicSelectionMaze();
  };

  const getTimeSpent = () => {
    if (sessionStartTime <= 0) return 0;
    return Math.floor((Date.now() - sessionStartTime) / 1000);
  };

  useEffect(() => {
    loadTopicSelectionMaze();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // =============== INLINE QUESTION PANEL (NOT MODAL) ===============

  const showInlineQuiz = showQuiz && currentQuizQuestion != null;

  return (
    <div className="min-h-screen flex flex-col">
      {/* HEADER */}
      <header className="bg-pink-500 text-white p-4 border-b border-pink-600">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            🎓 ML Maze Quest
          </h1>

          <button
            onClick={() => setShowSettings(true)}
            className="px-4 py-2 bg-black/30 rounded shadow text-sm"
          >
            ⚙ Settings
          </button>
        </div>
      </header>

      {/* MAIN */}
      <main className="flex-1 px-4 py-4 flex justify-center">
        <div className="w-full max-w-6xl flex flex-col gap-4">
          {/* TOP ROW: other details + nav */}
          <div className="flex justify-between items-center text-sm text-white/90">
            <div>
              {currentTopic && currentLevelNumber && (
                <span>
                  {currentTopic.icon} {currentTopic.name} • Level{" "}
                  {currentLevelNumber}
                </span>
              )}
            </div>

            <div className="flex gap-2">
              {mazeMode === "level-map" && (
                <button
                  onClick={handleBackToStreams}
                  className="px-3 py-1 bg-black/30 rounded text-xs"
                >
                  ⬅ Subjects
                </button>
              )}

              {mazeMode === "playing-level" && (
                <button
                  onClick={handleBackToLevelMap}
                  className="px-3 py-1 bg-black/30 rounded text-xs"
                >
                  ⬅ Levels
                </button>
              )}

              <button
                onClick={handleMainMenu}
                className="px-3 py-1 bg-black/30 rounded text-xs"
              >
                🏠 Main Menu
              </button>
            </div>
          </div>

          {/* LOCK MESSAGE */}
          {lockedMessage && (
            <div className="bg-red-700 text-white px-4 py-2 rounded shadow text-sm">
              {lockedMessage}
            </div>
          )}

          {/* QUESTION ROW - right aligned, centered panel inside 65% */}
          <div className="flex w-full">
            <div className="flex-1" />
            <div className="w-[65%] px-6 py-4 flex justify-end">
              <div className="w-full max-w-2xl">
                {showInlineQuiz && currentQuizQuestion && (
                  <InlineQuizPanel
                    question={currentQuizQuestion}
                    onAnswer={handleQuizAnswer}
                    currentQuestionNumber={currentQuestionIndex + 1}
                    totalQuestions={questions.length}
                  />
                )}
              </div>
            </div>
          </div>

          {/* MAZE ROW - right aligned */}
          <div className="flex w-full h-[70vh]">
            {/* left side empty to show background */}
            <div className="flex-1" />
            <div className="relative w-[65%] h-full rounded-lg overflow-hidden border border-white/15 shadow-2xl bg-black">
              <MazeCanvas />
              <MiniMap size={140} position="bottom-right" />
            </div>
          </div>
        </div>
      </main>

      {/* RESULTS MODAL */}
      {mazeMode === "results" && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-4">Level Complete!</h3>
            <p className="text-gray-300 mb-4">
              Score: {currentScore} | Correct: {currentCorrectAnswers}/
              {questions.length} | Time: {getTimeSpent()}s
            </p>
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

      <LevelInstructorModal
        isVisible={showLevelInstructor}
        topicName={currentTopic?.name || ""}
        levelNumber={currentLevelNumber || 1}
        onStartLevel={() => {
          setShowLevelInstructor(false);
          const difficulty =
            maze?.tiles[player.position.y][player.position.x].difficulty ||
            "easy";
          const levelNum =
            difficulty === "easy" ? 1 : difficulty === "medium" ? 2 : 3;
          setTimeout(() => loadQuizMaze(levelNum), 100);
        }}
      />

      <SettingsModal
        isVisible={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </div>
  );
}

// =============== INLINE QUIZ PANEL (NO MODAL) ===============

interface InlineQuizPanelProps {
  question: Question;
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
  const { t } = useTranslation();

  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [userAnswer, setUserAnswer] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [currentQuestionId, setCurrentQuestionId] = useState(question.id);

  // Reset on question change
  if (currentQuestionId !== question.id) {
    setCurrentQuestionId(question.id);
    setSelectedAnswer("");
    setUserAnswer("");
    setAttempts(0);
    setShowHint(false);
    setShowResult(false);
    setIsCorrect(false);
  }

  const canSubmit = () => {
    if (question.type === "short_answer") {
      return userAnswer.trim().length > 0;
    }
    return selectedAnswer.length > 0;
  };

  const handleSubmit = () => {
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    let correct = false;

    if (question.type === "multiple_choice") {
      const selectedIndex = question.options?.indexOf(selectedAnswer) ?? -1;
      correct = selectedIndex === question.correctAnswer;
    } else if (question.type === "short_answer") {
      correct =
        userAnswer.trim().toLowerCase() ===
        String(question.correctAnswer).toLowerCase();
    } else if (question.type === "true_false") {
      correct = selectedAnswer === question.correctAnswer;
    }

    setIsCorrect(correct);
    setShowResult(true);

    setTimeout(() => {
      onAnswer(correct, newAttempts);
      setShowResult(false);
    }, 1200);
  };

  return (
  <div
    className="
      bg-white 
      border-4 border-black 
      rounded-2xl
      px-6 py-5 
      mb-3
    "
    style={{
      backgroundColor: "white",
      border: "4px solid black",
      color: "#ff0099",           // 🔥 Hot Pink Default Text
    }}
  >
    {/* HEADER */}
    <div className="mb-4">
      <div
        className="flex justify-between text-xs mb-1 font-bold"
        style={{ color: "#ff0099" }}       // 🔥 HOT PINK
      >
        <span>
          Question {currentQuestionNumber} of {totalQuestions}
        </span>
        <span>
          {Math.round((currentQuestionNumber / totalQuestions) * 100)}%
        </span>
      </div>

      <div className="w-full bg-black rounded-full h-2">
        <div
          className="h-2 rounded-full transition-all duration-500"
          style={{
            width: `${(currentQuestionNumber / totalQuestions) * 100}%`,
            backgroundColor: "#ff0099",    
          }}
        />
      </div>
    </div>

    {/* TOPIC + DIFFICULTY */}
    <div
      className="flex justify-between items-center text-xs font-bold mb-2"
      style={{ color: "#ff0099" }}      
    >
      <span>{question.topic}</span>
      <span>{t("quiz.difficulty", { level: question.difficulty })}</span>
    </div>

    {/* LABEL */}
    <h2
      className="text-xl font-extrabold mb-2 tracking-wide"
      style={{ color: "#ff0099" }}       
    >
      {t("quiz.questionLabel")}
    </h2>

    {/* QUESTION */}
    <p className="font-bold mb-4" style={{ color: "#ff0099" }}>
      {question.prompt}
    </p>

    {!showResult && (
      <>
        {/* ANSWERS */}
        <div className="mb-4">
          {question.type === "multiple_choice" && question.options && (
            <div className="space-y-2">
              {question.options.map((option, idx) => {
                const active = selectedAnswer === option;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedAnswer(option)}
                    style={{
                      border: "2px solid black",
                      backgroundColor: active ? "#ffcced" : "white",
                      color: "#ff0099",
                    }}
                    className="w-full text-left px-4 py-3 rounded-lg font-bold"
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          )}

          {question.type === "true_false" && (
            <div className="flex gap-3">
              {["true", "false"].map((val) => (
                <button
                  key={val}
                  onClick={() => setSelectedAnswer(val)}
                  className="flex-1 px-4 py-3 rounded-lg font-bold"
                  style={{
                    border: "2px solid black",
                    backgroundColor: selectedAnswer === val ? "#ffcced" : "white",
                    color: "#ff0099",
                  }}
                >
                  {val === "true" ? "True" : "False"}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* HINT */}
        {question.hint && (
          <div className="mb-4">
            {!showHint ? (
              <button
                type="button"
                onClick={() => setShowHint(true)}
                className="font-bold underline"
                style={{ color: "#ff0099" }}
              >
                💡 Need a hint?
              </button>
            ) : (
              <div
                className="px-3 py-2 rounded-lg font-bold"
                style={{
                  backgroundColor: "#ffe4f4",
                  border: "1px solid #ff0099",
                  color: "#ff0099",
                }}
              >
                <strong>Hint:</strong> {question.hint}
              </div>
            )}
          </div>
        )}

        {attempts > 0 && (
          <p className="text-xs font-bold mb-3" style={{ color: "#ff0099" }}>
            Attempts: {attempts}
          </p>
        )}

        <button
          type="button"
          disabled={!canSubmit()}
          className="w-full px-4 py-3 rounded-lg font-bold"
          style={{
            backgroundColor: "#ff0099",
            color: "white",
            border: "2px solid black",
            opacity: canSubmit() ? 1 : 0.4,
          }}
          onClick={handleSubmit}
        >
          Submit Answer
        </button>
      </>
    )}

    {/* RESULT */}
    {showResult && (
      <div className="mt-4 font-bold px-4 py-3 rounded-lg">
        {isCorrect ? (
          <div
            style={{
              backgroundColor: "#d4ffe0",
              border: "2px solid green",
              color: "green",
            }}
          >
            ✅ Correct!
          </div>
        ) : (
          <div
            style={{
              backgroundColor: "#ffe2e2",
              border: "2px solid red",
              color: "red",
            }}
          >
            ❌ Incorrect
          </div>
        )}
      </div>
    )}
  </div>
);

}
