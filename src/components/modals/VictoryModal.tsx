// Victory celebration modal

import type { PlayerState } from '../../types/game.types';

interface VictoryModalProps {
  isVisible: boolean;
  player: PlayerState;
  onContinue: () => void;
}

export function VictoryModal({ isVisible, player, onContinue }: VictoryModalProps) {
  if (!isVisible) return null;

  const timeBonus = 50; // Could calculate based on actual time
  const totalScore = player.score + timeBonus;

  return (
    <>
      {/* Backdrop */}
      <div className="modal-overlay" />
      
      {/* Modal */}
      <div className="modal-content max-w-lg">
        {/* Celebration Header */}
        <div className="text-center mb-6">
          <div className="text-7xl mb-4">🎉</div>
          <h1 className="text-4xl font-bold text-yellow-400 mb-2">
            Level Complete!
          </h1>
          <p className="text-gray-300">
            Congratulations! You've mastered this topic!
          </p>
        </div>

        {/* Stats */}
        <div className="bg-gray-700 bg-opacity-50 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">📊 Your Performance</h2>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Questions Answered:</span>
              <span className="text-2xl font-bold text-primary-400">{player.keysCollected}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Lives Remaining:</span>
              <span className="text-2xl">
                {'❤️'.repeat(player.lives)}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Base Score:</span>
              <span className="text-2xl font-bold text-yellow-400">{player.score}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Time Bonus:</span>
              <span className="text-2xl font-bold text-green-400">+{timeBonus}</span>
            </div>
            
            <div className="border-t border-gray-600 pt-3 flex justify-between items-center">
              <span className="text-lg font-semibold text-white">Total Score:</span>
              <span className="text-3xl font-bold text-yellow-300">{totalScore}</span>
            </div>
          </div>
        </div>

        {/* Achievements */}
        <div className="bg-gradient-to-r from-purple-900 to-blue-900 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-white mb-2">🏆 Achievements</h3>
          <div className="grid grid-cols-2 gap-2">
            {player.lives === 5 && (
              <div className="bg-green-600 bg-opacity-30 rounded px-3 py-2 text-sm text-white">
                ⭐ Perfect Health
              </div>
            )}
            {player.score >= 300 && (
              <div className="bg-yellow-600 bg-opacity-30 rounded px-3 py-2 text-sm text-white">
                ⭐ High Scorer
              </div>
            )}
            {player.keysCollected >= 3 && (
              <div className="bg-blue-600 bg-opacity-30 rounded px-3 py-2 text-sm text-white">
                ⭐ Key Collector
              </div>
            )}
          </div>
        </div>

        {/* Continue Button */}
        <button
          onClick={onContinue}
          className="btn btn-success w-full text-xl py-4"
        >
          Continue to Next Level 🚀
        </button>

        <p className="text-center text-gray-500 text-sm mt-4">
          Great job! Keep learning!
        </p>
      </div>
    </>
  );
}
