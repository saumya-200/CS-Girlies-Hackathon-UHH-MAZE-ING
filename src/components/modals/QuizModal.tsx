// Quiz modal component for displaying questions

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Question } from '../../types/content.types';

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
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [userAnswer, setUserAnswer] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [currentQuestionId, setCurrentQuestionId] = useState(question.id);

  // Reset when question changes
  if (currentQuestionId !== question.id) {
    setCurrentQuestionId(question.id);
    setSelectedAnswer('');
    setUserAnswer('');
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

    // Check answer based on question type
    if (question.type === 'multiple_choice') {
      // For multiple choice, correctAnswer is an index, so find the index of selected option
      const selectedIndex = question.options?.indexOf(selectedAnswer) ?? -1;
      correct = selectedIndex === question.correctAnswer;
    } else if (question.type === 'short_answer') {
      // Case-insensitive comparison, trim whitespace
      const correctAnswerStr = String(question.correctAnswer);
      correct = userAnswer.trim().toLowerCase() === correctAnswerStr.toLowerCase();
    } else if (question.type === 'true_false') {
      correct = selectedAnswer === question.correctAnswer;
    }

    setIsCorrect(correct);
    setShowResult(true);

    // Auto-close and report after showing result
    setTimeout(() => {
      onAnswer(correct, newAttempts);
      onClose();
    }, 3000);
  };

  const handleHint = () => {
    setShowHint(true);
  };

  const canSubmit = () => {
    if (question.type === 'short_answer') {
      return userAnswer.trim().length > 0;
    }
    return selectedAnswer.length > 0;
  };

  return (
    <>
      {/* Backdrop */}
      <div className="modal-overlay" aria-hidden="true" />

      {/* Modal */}
      <div className="modal-content max-w-xl" role="dialog" aria-modal="true">
        {!showResult ? (
          <>
            {/* Header */}
            <div className="mb-6">
              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-400 mb-2">
                  <span>Question {currentQuestionNumber} of {totalQuestions}</span>
                  <span>{Math.round((currentQuestionNumber / totalQuestions) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(currentQuestionNumber / totalQuestions) * 100}%` }}
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-secondary-400 font-semibold uppercase">
                  {question.topic}
                </span>
                <span className="text-xs text-gray-500">
                  {t('quiz.difficulty', { level: question.difficulty })}
                </span>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                {t('quiz.questionLabel')}
              </h2>
            </div>

            {/* Question prompt */}
            <div className="bg-gray-700 bg-opacity-50 rounded-lg p-4 mb-6">
              <p className="text-lg text-gray-200 leading-relaxed">
                {question.prompt}
              </p>
            </div>

            {/* Answer options based on type */}
            <div className="mb-6">
              {question.type === 'multiple_choice' && question.options && (
                <div className="space-y-3">
                  {question.options.map((option, index) => {
                    const isSelected = selectedAnswer === option;
                    return (
                      <button
                        key={index}
                        onClick={() => setSelectedAnswer(option)}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 transform ${
                          isSelected
                            ? 'border-blue-500 bg-blue-500 bg-opacity-20 scale-105 shadow-lg'
                            : 'border-gray-600 hover:border-gray-500 bg-gray-700 bg-opacity-30 hover:scale-102'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-lg ${
                            isSelected ? 'text-white font-semibold' : 'text-gray-200'
                          }`}>
                            {option}
                          </span>
                          {isSelected && (
                            <div className="text-blue-400 text-xl">✓</div>
                          )}
                        </div>
                        {isSelected && (
                          <div className="mt-2 text-sm text-blue-300">
                            Selected option
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {question.type === 'short_answer' && (
                <div>
                  <input
                    type="text"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && canSubmit() && handleSubmit()}
                    placeholder="Type your answer here..."
                    className="w-full p-4 rounded-lg bg-gray-700 border-2 border-gray-600 text-white placeholder-gray-500 focus:border-primary-500 focus:outline-none"
                    autoFocus
                  />
                </div>
              )}

              {question.type === 'true_false' && (
                <div className="flex gap-4">
                  <button
                    onClick={() => setSelectedAnswer('true')}
                    className={`flex-1 p-6 rounded-lg border-2 transition-all ${
                      selectedAnswer === 'true'
                        ? 'border-green-500 bg-green-500 bg-opacity-20'
                        : 'border-gray-600 hover:border-gray-500 bg-gray-700 bg-opacity-30'
                    }`}
                  >
                    <span className="text-2xl mb-2 block">✓</span>
                    <span className="text-lg font-semibold text-gray-200">True</span>
                  </button>
                  <button
                    onClick={() => setSelectedAnswer('false')}
                    className={`flex-1 p-6 rounded-lg border-2 transition-all ${
                      selectedAnswer === 'false'
                        ? 'border-red-500 bg-red-500 bg-opacity-20'
                        : 'border-gray-600 hover:border-gray-500 bg-gray-700 bg-opacity-30'
                    }`}
                  >
                    <span className="text-2xl mb-2 block">✗</span>
                    <span className="text-lg font-semibold text-gray-200">False</span>
                  </button>
                </div>
              )}
            </div>

            {/* Hint section */}
            {question.hint && (
              <div className="mb-6">
                {!showHint ? (
                  <button
                    onClick={handleHint}
                    className="text-sm text-blue-400 hover:text-blue-300 underline"
                  >
                    💡 Need a hint?
                  </button>
                ) : (
                  <div className="bg-blue-900 bg-opacity-30 border border-blue-500 rounded-lg p-3">
                    <p className="text-sm text-blue-200">
                      <strong>Hint:</strong> {question.hint}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Attempts counter */}
            {attempts > 0 && (
              <p className="text-sm text-gray-500 mb-4">
                Attempts: {attempts}
              </p>
            )}

            {/* Submit button */}
            <button
              onClick={handleSubmit}
              disabled={!canSubmit()}
              className="btn btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit Answer
            </button>
          </>
        ) : (
          /* Result screen */
          <div className="text-center py-8">
            {isCorrect ? (
              <>
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="text-3xl font-bold text-green-400 mb-4">
                  Correct!
                </h2>
                <p className="text-gray-300 mb-6">
                  {question.explanation}
                </p>
                <div className="text-lg text-primary-400">
                  +{Math.max(100 - (attempts - 1) * 25, 25)} points
                </div>
              </>
            ) : (
              <>
                <div className="text-6xl mb-4">😅</div>
                <h2 className="text-3xl font-bold text-red-400 mb-4">
                  Incorrect
                </h2>
                <p className="text-gray-300 mb-4">
                  <strong>Correct answer:</strong> {question.correctAnswer}
                </p>
                <p className="text-gray-400 text-sm mb-6">
                  {question.explanation}
                </p>
                <div className="text-lg text-gray-500">
                  Try again next time!
                </div>
              </>
            )}
            <p className="text-sm text-gray-500 mt-6">
              Closing in 3 seconds...
            </p>
          </div>
        )}
      </div>
    </>
  );
}
