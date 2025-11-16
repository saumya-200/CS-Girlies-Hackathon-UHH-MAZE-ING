// src/components/modals/QuizModal.tsx
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import type { Question } from "../../types/content.types";

interface QuizModalProps {
  question: Question;
  onAnswer: (correct: boolean, attempts: number) => void;
  onClose: () => void;
  isVisible: boolean;
  currentQuestionNumber?: number;
  totalQuestions?: number;
}

export function QuizModal({
  question,
  onAnswer,
  onClose,
  isVisible,
  currentQuestionNumber = 1,
  totalQuestions = 1,
}: QuizModalProps) {
  const { t } = useTranslation();

  // Safety: don't render if not visible or question missing
  if (!isVisible || !question) return null;

  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [userAnswer, setUserAnswer] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [currentQuestionId, setCurrentQuestionId] = useState(question.id);

  // Reset all local state when question changes
  useEffect(() => {
    if (currentQuestionId !== question.id) {
      setCurrentQuestionId(question.id);
      setSelectedAnswer("");
      setUserAnswer("");
      setAttempts(0);
      setShowHint(false);
      setShowResult(false);
      setIsCorrect(false);
    }
  }, [question.id, currentQuestionId]);

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
      const idx = (question.options || []).indexOf(selectedAnswer);
      correct = idx === question.correctAnswer;
    } else if (question.type === "short_answer") {
      correct =
        userAnswer.trim().toLowerCase() ===
        String(question.correctAnswer).trim().toLowerCase();
    } else if (question.type === "true_false") {
      const userBool = selectedAnswer === "true";
      const correctBool =
        typeof question.correctAnswer === "boolean"
          ? question.correctAnswer
          : String(question.correctAnswer) === "true";
      correct = userBool === correctBool;
    }

    setIsCorrect(correct);
    setShowResult(true);

    setTimeout(() => {
      onAnswer(correct, newAttempts);
      onClose();
    }, 3000);
  };

  const getDisplayCorrectAnswer = () => {
    if (question.type === "true_false") {
      const v = question.correctAnswer;
      if (typeof v === "boolean") return v ? "True" : "False";
      return String(v) === "true" ? "True" : "False";
    }

    if (question.type === "multiple_choice" && question.options) {
      const idx = question.correctAnswer as number;
      return question.options[idx] ?? `Option ${idx + 1}`;
    }

    return String(question.correctAnswer);
  };

  const displayOptions =
    question.type === "multiple_choice"
      ? question.options && question.options.length > 0
        ? question.options
        : ["A", "B", "C", "D"]
      : [];

  return (
    <>
      {/* Dark overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-70 z-40"
        aria-hidden="true"
      />

      {/* Centered pixel panel */}
      <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
        <div className="bg-white border-4 border-black rounded-xl shadow-2xl max-w-2xl w-full mx-4 overflow-hidden pixel-panel">
          {!showResult ? (
            <>
              {/* HEADER */}
              <div className="p-6 pb-4">
                {/* Progress */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs mb-1 pixel-text">
                    <span>
                      Q {currentQuestionNumber}/{totalQuestions}
                    </span>
                    <span>
                      {Math.round(
                        (currentQuestionNumber / totalQuestions) * 100
                      )}
                      %
                    </span>
                  </div>
                  <div className="w-full bg-black rounded-full h-2">
                    <div
                      className="h-2 bg-[#ff008c] rounded-full transition-all duration-500"
                      style={{
                        width: `${
                          (currentQuestionNumber / totalQuestions) * 100
                        }%`,
                      }}
                    />
                  </div>
                </div>

                {/* Topic + difficulty */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold uppercase tracking-wider pixel-text">
                    {question.topic}
                  </span>
                  <span className="text-xs pixel-text">
                    {t("quiz.difficulty", {
                      level: question.difficulty,
                    })}
                  </span>
                </div>

                <h2 className="text-2xl font-bold pixel-text">QUESTION</h2>
              </div>

              {/* PROMPT */}
              <div className="bg-gray-100 rounded-lg p-5 mx-6 mb-6 border-2 border-black">
                <p className="text-lg pixel-text leading-relaxed">
                  {question.prompt}
                </p>
              </div>

              {/* ANSWER AREA */}
              <div className="px-6 pb-6">
                {question.type === "multiple_choice" && (
                  <div className="space-y-3">
                    {displayOptions.map((opt, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedAnswer(opt)}
                        className={`
                          w-full text-left p-4 rounded-lg border-4 border-black bg-white pixel-text transition-all
                          ${
                            selectedAnswer === opt
                              ? "bg-[#ffe0f4]"
                              : ""
                          }
                        `}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}

                {question.type === "short_answer" && (
                  <input
                    type="text"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && canSubmit() && handleSubmit()
                    }
                    placeholder="Type your answer..."
                    className="w-full p-4 rounded-lg border-4 border-black bg-white pixel-text outline-none text-base"
                    autoFocus
                  />
                )}

                {question.type === "true_false" && (
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setSelectedAnswer("true")}
                      className={`
                        p-6 rounded-lg border-4 border-black bg-white pixel-text text-lg font-bold
                        ${
                          selectedAnswer === "true"
                            ? "bg-[#ffe0f4]"
                            : ""
                        }
                      `}
                    >
                      TRUE
                    </button>
                    <button
                      onClick={() => setSelectedAnswer("false")}
                      className={`
                        p-6 rounded-lg border-4 border-black bg-white pixel-text text-lg font-bold
                        ${
                          selectedAnswer === "false"
                            ? "bg-[#ffe0f4]"
                            : ""
                        }
                      `}
                    >
                      FALSE
                    </button>
                  </div>
                )}
              </div>

              {/* HINT */}
              {question.hint && (
                <div className="px-6 pb-4">
                  {!showHint ? (
                    <button
                      onClick={() => setShowHint(true)}
                      className="text-sm text-blue-600 underline pixel-text"
                    >
                      💡 Need a hint?
                    </button>
                  ) : (
                    <div className="bg-blue-100 border-2 border-blue-600 rounded-lg p-3">
                      <p className="text-sm pixel-text">
                        <strong>Hint:</strong> {question.hint}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Attempts */}
              {attempts > 0 && (
                <p className="text-center text-sm pixel-text px-6 pb-3">
                  Attempts: {attempts}
                </p>
              )}

              {/* SUBMIT BUTTON */}
              <div className="px-6 pb-6">
                <button
                  onClick={handleSubmit}
                  disabled={!canSubmit()}
                  className={`
                    w-full py-3 px-4 rounded-lg border-4 border-black text-white font-bold pixel-text text-lg
                    ${
                      canSubmit()
                        ? "bg-[#ff008c] hover:bg-[#e0007a]"
                        : "bg-gray-500 cursor-not-allowed"
                    }
                  `}
                >
                  SUBMIT
                </button>
              </div>
            </>
          ) : (
            // RESULT SCREEN
            <div className="text-center py-10 px-6">
              {isCorrect ? (
                <>
                  <div className="text-6xl mb-4">🎉</div>
                  <h2 className="text-3xl font-bold text-green-600 mb-4 pixel-text">
                    CORRECT!
                  </h2>
                  <p className="text-gray-800 mb-6 pixel-text leading-relaxed">
                    {question.explanation}
                  </p>
                  <div className="text-xl text-[#ff008c] font-bold pixel-text">
                    +{Math.max(100 - (attempts - 1) * 25, 25)} points
                  </div>
                </>
              ) : (
                <>
                  <div className="text-6xl mb-4">😅</div>
                  <h2 className="text-3xl font-bold text-red-600 mb-4 pixel-text">
                    INCORRECT
                  </h2>
                  <p className="text-gray-800 mb-4 pixel-text">
                    <strong>Correct answer:</strong>{" "}
                    <span className="font-bold">
                      {getDisplayCorrectAnswer()}
                    </span>
                  </p>
                  <p className="text-gray-600 text-sm mb-6 pixel-text leading-relaxed">
                    {question.explanation}
                  </p>
                  <div className="text-lg text-gray-500 pixel-text">
                    Try again next time!
                  </div>
                </>
              )}

              <p className="text-sm text-gray-500 mt-8 pixel-text">
                Closing in 3 seconds...
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
