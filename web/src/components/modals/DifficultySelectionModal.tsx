/**
 * Difficulty Selection Modal - Choose difficulty level
 */

import type { Difficulty } from '../../data/questionBank';
import { getTotalQuestionsCount } from '../../data/questionBank';
import type { Stream } from '../../data/questionBank';

interface DifficultySelectionModalProps {
  isVisible: boolean;
  selectedStream: Stream | null;
  onSelectDifficulty: (difficulty: Difficulty) => void;
  onBack: () => void;
  completedLevels?: Array<{ streamId: string; difficulty: Difficulty }>;
}

export function DifficultySelectionModal({
  isVisible,
  selectedStream,
  onSelectDifficulty,
  onBack,
  completedLevels = [],
}: DifficultySelectionModalProps) {
  if (!isVisible || !selectedStream) return null;

  const difficulties: Array<{
    level: Difficulty;
    name: string;
    description: string;
    color: string;
    icon: string;
  }> = [
    {
      level: 'easy',
      name: 'Easy',
      description: 'Perfect for beginners',
      color: 'from-green-500 to-green-700',
      icon: '🌱',
    },
    {
      level: 'medium',
      name: 'Medium',
      description: 'Balanced challenge',
      color: 'from-yellow-500 to-yellow-700',
      icon: '🔥',
    },
    {
      level: 'hard',
      name: 'Hard',
      description: 'For experts only',
      color: 'from-red-500 to-red-700',
      icon: '⚡',
    },
  ];

  const isLevelCompleted = (difficulty: Difficulty) => {
    return completedLevels.some(
      (level) => level.streamId === selectedStream.id && level.difficulty === difficulty
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border-2 border-primary-500 shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 p-6 rounded-t-xl">
          <button
            onClick={onBack}
            className="text-white hover:text-gray-200 mb-2 flex items-center gap-2"
          >
            ← Back to Streams
          </button>
          <div className="text-center">
            <div className="text-6xl mb-2">{selectedStream.icon}</div>
            <h2 className="text-3xl font-bold text-white">
              {selectedStream.name}
            </h2>
            <p className="text-gray-200 mt-2">Choose your difficulty level</p>
          </div>
        </div>

        {/* Difficulty Options */}
        <div className="p-8 space-y-4">
          {difficulties.map((diff) => {
            const questionCount = getTotalQuestionsCount(
              selectedStream.id,
              diff.level
            );
            const isCompleted = isLevelCompleted(diff.level);

            return (
              <button
                key={diff.level}
                onClick={() => onSelectDifficulty(diff.level)}
                className={`
                  w-full relative p-6 rounded-lg bg-gradient-to-r ${diff.color}
                  hover:scale-105 transform transition-all duration-200
                  border-2 border-transparent hover:border-white
                  shadow-lg hover:shadow-2xl
                  group
                `}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-left">
                    {/* Icon */}
                    <div className="text-5xl group-hover:scale-110 transition-transform">
                      {diff.icon}
                    </div>

                    {/* Info */}
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-1">
                        {diff.name}
                      </h3>
                      <p className="text-gray-100 text-sm opacity-90">
                        {diff.description}
                      </p>
                      <p className="text-white text-sm mt-2 font-semibold">
                        📝 {questionCount} questions
                      </p>
                    </div>
                  </div>

                  {/* Completion Badge or Arrow */}
                  <div>
                    {isCompleted ? (
                      <div className="bg-green-500 text-white rounded-full w-12 h-12 flex items-center justify-center text-2xl">
                        ✓
                      </div>
                    ) : (
                      <div className="text-white text-3xl opacity-0 group-hover:opacity-100 transition-opacity">
                        →
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress Indicator (if completed) */}
                {isCompleted && (
                  <div className="mt-3 text-white text-sm text-center bg-black bg-opacity-30 rounded py-1">
                    ⭐ Completed! Play again to improve your score
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer Tip */}
        <div className="bg-gray-800 p-4 rounded-b-xl border-t-2 border-gray-700">
          <div className="text-center text-gray-300 text-sm">
            💡 Tip: Complete all difficulties to fully master {selectedStream.name}!
          </div>
        </div>
      </div>
    </div>
  );
}
