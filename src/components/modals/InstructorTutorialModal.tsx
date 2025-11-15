import React, { useState, useEffect } from 'react';
import { useGameStore } from '../../stores/gameStore';

interface InstructorTutorialModalProps {
  isVisible: boolean;
  onComplete: () => void;
  characterName: string | null;
}

export function InstructorTutorialModal({ isVisible, onComplete, characterName }: InstructorTutorialModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const { characterName: storedName } = useGameStore();

  const displayName = characterName || storedName || 'Student';

  useEffect(() => {
    if (!isVisible) setCurrentStep(0);
  }, [isVisible]);

  const tutorialSteps = [
    {
      title: "Welcome to ML Learning Maze!",
      content: `Hello ${displayName}! I'm Professor MindAI, your ML instructor. I'm here to help you learn Machine Learning through interactive maze challenges!`,
      icon: "👨‍🏫",
    },
    {
      title: "Your Learning Journey",
      content: `${displayName}, you are a student embarking on an incredible journey to master Machine Learning. Each maze represents a different ML concept, and solving it will deepen your understanding.`,
      icon: "🎒",
    },
    {
      title: "Maze Navigation",
      content: "Use WASD or Arrow keys to move your blue dot character through the maze. Blue dots represent quiz tiles - step on them to answer questions and collect keys!",
      icon: "⚡",
    },
    {
      title: "Game Mechanics",
      content: "Answer questions correctly to collect keys (🔑). For each level, you need a specific number of keys to reach the goal (🎯). Yellow checkpoints show your progress!",
      icon: "🎯",
    },
    {
      title: "Lives & Scoring",
      content: "You've got 5 lives! Wrong answers cost lives. Your score increases with correct answers. Gray tiles are locked - complete easy levels first to unlock harder ones!",
      icon: "❤️",
    },
    {
      title: "ML Topics to Explore",
      content: "Across 6 Machine Learning topics, you'll explore concepts like Linear Regression, Neural Networks, Decision Trees, and more. Each level gets progressively challenging!",
      icon: "🧠",
    },
    {
      title: "Ready to Begin!",
      content: `Great! ${displayName}, your ML learning adventure begins now. Click "Start Learning" to choose your first Machine Learning topic. I'll be here if you need help!`,
      icon: "🚀",
    },
  ];

  const nextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!isVisible) return null;

  const currentTutorial = tutorialSteps[currentStep];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-gray-900 border-2 border-primary-400 rounded-xl p-6 max-w-lg w-full mx-4 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-6xl mb-3">{currentTutorial.icon}</div>
          <h3 className="text-xl font-bold text-white mb-2">{currentTutorial.title}</h3>
          <div className="flex justify-center items-center space-x-2 mb-4">
            {tutorialSteps.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentStep ? 'bg-primary-400' : 'bg-gray-600'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="text-center mb-6">
          <p className="text-gray-300 leading-relaxed text-sm">
            {currentTutorial.content}
          </p>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className="px-4 py-2 text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed hover:text-white transition-colors"
          >
            ← Previous
          </button>

          <button
            onClick={nextStep}
            className={`px-6 py-3 rounded-lg font-bold text-white transition-all transform hover:scale-105 ${
              currentStep === tutorialSteps.length - 1
                ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800'
                : 'bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800'
            }`}
          >
            {currentStep === tutorialSteps.length - 1 ? 'Start Learning!' : 'Next →'}
          </button>
        </div>

        {/* Progress Text */}
        <div className="text-center mt-4">
          <p className="text-gray-500 text-xs">
            {currentStep + 1} of {tutorialSteps.length}
          </p>
        </div>
      </div>
    </div>
  );
}
