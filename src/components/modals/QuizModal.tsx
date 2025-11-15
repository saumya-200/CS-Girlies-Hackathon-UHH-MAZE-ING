// Quiz modal component for displaying questions
// Now used as an INLINE question panel above the maze (no full-screen overlay)

import { useState } from "react";
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

  // Use question.id as key to auto-reset state
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [userAnswer, setUserAnswer] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [currentQuestionId, setCurrentQuestionId] = useState(question.id);

  // Reset when question changes
  if (currentQuestionId !== question.id) {
    setCurrentQuestionId(question.id);
    setSelectedAnswer("");
    setUserAnswer("");
    setAttempts(0);
    setShowHint(false);
    setShowResult(false);
    setIsCorrect(false);
  }

  if (!isVisible) return null;

  const handleSubmit = () => {
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    let correct = false;

    if (question.type === "multiple_choice") {
      const selectedIndex = question.options?.indexOf(selectedAnswer) ?? -1;
      correct = selectedIndex === question.correctAnswer;
    } else if (question.type === "short_answer") {
      const correctAnswerStr = String(question.correctAnswer);
      correct =
        userAnswer.trim().toLowerCase() === correctAnswerStr.toLowerCase();
    } else if (question.type === "true_false") {
      correct = selectedAnswer === question.correctAnswer;
    }

    setIsCorrect(correct);
    setShowResult(true);

    setTimeout(() => {
      onAnswer(correct, newAttempts);
      onClose();
    }, 3000);
  };

  const handleHint = () => {
    setShowHint(true);
  };

  const canSubmit = () => {
    if (question.type === "short_answer") {
      return userAnswer.trim().length > 0;
    }
    return selectedAnswer.length > 0;
  };

  return (
    <div className="w-full bg-white border border-gray-300 rounded-xl shadow-xl px-6 py-4 text-gray-900">
      {!showResult ? (
        <>
          {/* Header with progress & meta */}
          <div className="mb-4">
            {/* Progress Bar */}
            <div className="mb-3">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>
                  Question {currentQuestionNumber} of {totalQuestions}
                </span>
                <span>
                  {Math.round(
                    (currentQuestionNumber / totalQuestions) * 100
                  )}
                  %
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-sky-500 h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${(currentQuestionNumber / totalQuestions) * 100}%`,
                  }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase text-sky-600">
                {question.topic}
              </span>
              <span className="text-[11px] text-gray-500">
                {t("quiz.difficulty", { level: question.difficulty })}
              </span>
            </div>

            <h2 className="text-lg font-bold text-gray-900">
              {t("quiz.questionLabel")}
            </h2>
          </div>

          {/* Question prompt */}
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-3 mb-4">
            <p className="text-base text-gray-900 leading-relaxed">
              {question.prompt}
            </p>
          </div>

          {/* Answer options based on type */}
          <div className="mb-4">
            {question.type === "multiple_choice" && question.options && (
              <div className="space-y-2">
                {question.options.map((option, index) => {
                  const isSelected = selectedAnswer === option;
                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setSelectedAnswer(option)}
                      className={`w-full text-left p-3 rounded-lg border transition-all duration-150 ${
                        isSelected
                          ? "border-sky-500 bg-sky-50 shadow-sm"
                          : "border-gray-300 bg-white hover:border-gray-400"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-sm ${
                            isSelected
                              ? "text-gray-900 font-semibold"
                              : "text-gray-800"
                          }`}
                        >
                          {option}
                        </span>
                        {isSelected && (
                          <span className="text-sky-500 text-base">✓</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {question.type === "short_answer" && (
              <div>
                <input
                  type="text"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && canSubmit() && handleSubmit()
                  }
                  placeholder="Type your answer here..."
                  className="w-full p-3 rounded-lg border border-gray-300 text-sm text-gray-900 placeholder-gray-400 focus:border-sky-500 focus:outline-none"
                  autoFocus
                />
              </div>
            )}

            {question.type === "true_false" && (
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedAnswer("true")}
                  className={`flex-1 p-4 rounded-lg border text-center transition-all ${
                    selectedAnswer === "true"
                      ? "border-emerald-500 bg-emerald-50"
                      : "border-gray-300 bg-white hover:border-gray-400"
                  }`}
                >
                  <span className="text-xl mb-1 block">✓</span>
                  <span className="text-sm font-semibold text-gray-800">
                    True
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedAnswer("false")}
                  className={`flex-1 p-4 rounded-lg border text-center transition-all ${
                    selectedAnswer === "false"
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300 bg-white hover:border-gray-400"
                  }`}
                >
                  <span className="text-xl mb-1 block">✗</span>
                  <span className="text-sm font-semibold text-gray-800">
                    False
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* Hint section */}
          {question.hint && (
            <div className="mb-3">
              {!showHint ? (
                <button
                  type="button"
                  onClick={handleHint}
                  className="text-xs text-sky-600 hover:text-sky-500 underline"
                >
                  💡 Need a hint?
                </button>
              ) : (
                <div className="bg-sky-50 border border-sky-200 rounded-lg p-2">
                  <p className="text-xs text-sky-800">
                    <strong>Hint:</strong> {question.hint}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Attempts counter */}
          {attempts > 0 && (
            <p className="text-xs text-gray-500 mb-2">
              Attempts: {attempts}
            </p>
          )}

          {/* Submit button */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit()}
            className="w-full inline-flex items-center justify-center px-4 py-2 rounded-lg bg-sky-600 text-white text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-sky-700 transition-colors"
          >
            Submit Answer
          </button>
        </>
      ) : (
        // Result screen
        <div className="text-center py-4">
          {isCorrect ? (
            <>
              <div className="text-4xl mb-2">🎉</div>
              <h2 className="text-xl font-bold text-emerald-600 mb-2">
                Correct!
              </h2>
              <p className="text-sm text-gray-800 mb-3">
                {question.explanation}
              </p>
              <div className="text-sm text-sky-600 font-semibold">
                +{Math.max(100 - (attempts - 1) * 25, 25)} points
              </div>
            </>
          ) : (
            <>
              <div className="text-4xl mb-2">😅</div>
              <h2 className="text-xl font-bold text-red-500 mb-2">
                Incorrect
              </h2>
              <p className="text-sm text-gray-800 mb-2">
                <strong>Correct answer:</strong> {question.correctAnswer}
              </p>
              <p className="text-xs text-gray-600 mb-3">
                {question.explanation}
              </p>
              <div className="text-sm text-gray-500">
                Try again next time!
              </div>
            </>
          )}
          <p className="text-xs text-gray-400 mt-3">
            Closing in 3 seconds...
          </p>
        </div>
      )}
    </div>
  );
}