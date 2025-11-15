import React, { useState } from 'react';
import { useGameStore } from '../../stores/gameStore';

interface CharacterNamingModalProps {
  isVisible: boolean;
  onComplete: () => void;
}

export function CharacterNamingModal({ isVisible, onComplete }: CharacterNamingModalProps) {
  const [characterName, setCharacterName] = useState('');
  const [error, setError] = useState('');
  const { setCharacterName: setStoreCharacterName } = useGameStore();

  if (!isVisible) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate input
    if (!characterName.trim()) {
      setError('Please enter a character name');
      return;
    }

    if (characterName.length < 2) {
      setError('Character name must be at least 2 characters long');
      return;
    }

    if (characterName.length > 20) {
      setError('Character name must be less than 20 characters long');
      return;
    }

    // Save character name
    setStoreCharacterName(characterName.trim());
    setError('');
    onComplete();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 max-w-md w-full mx-4 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">🎓</div>
          <h2 className="text-2xl font-bold text-white mb-2">Welcome to ML Learning Maze!</h2>
          <p className="text-gray-300 text-sm">
            Embark on an educational adventure through Machine Learning concepts
          </p>
        </div>

        {/* Character Icon */}
        <div className="text-center mb-6">
          <div className="text-8xl mb-4">🧑‍🎓</div>
          <p className="text-yellow-400 text-sm font-medium">Choose your character name</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              value={characterName}
              onChange={(e) => {
                setCharacterName(e.target.value);
                setError('');
              }}
              placeholder="Enter your character name..."
              className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-400 transition-all text-center text-xl font-bold ${
                error ? 'border-red-500 focus:ring-red-400' : 'border-gray-600'
              }`}
              autoFocus
              maxLength={20}
            />
            {error && (
              <p className="text-red-400 text-sm mt-1 text-center">{error}</p>
            )}
          </div>

          <div className="text-center">
            <button
              type="submit"
              className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white px-8 py-3 rounded-lg font-bold text-lg transition-all transform hover:scale-105 shadow-lg"
            >
              Begin Your Journey! 🚀
            </button>
          </div>
        </form>

        {/* Instructions */}
        <div className="mt-6 text-center">
          <p className="text-gray-400 text-xs">
            Your character will explore mazes to learn Machine Learning topics.
            Answer questions and navigate through interactive challenges!
          </p>
        </div>
      </div>
    </div>
  );
}
