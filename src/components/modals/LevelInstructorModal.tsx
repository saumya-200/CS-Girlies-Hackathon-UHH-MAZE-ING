import React, { useState, useEffect } from 'react';
import { useGameStore } from '../../stores/gameStore';

interface LevelInstructorModalProps {
  isVisible: boolean;
  topicName: string;
  levelNumber: number;
  onStartLevel: () => void;
}

export function LevelInstructorModal({
  isVisible,
  topicName,
  levelNumber,
  onStartLevel
}: LevelInstructorModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const { characterName } = useGameStore();

  const displayName = characterName || 'Student';

  useEffect(() => {
    if (!isVisible) setCurrentStep(0);
  }, [isVisible]);

  const levelObjectives = [
    {
      title: `${displayName}, let's tackle ${topicName}!`,
      content: `Professor MindAI here to guide you through ${topicName} Level ${levelNumber}. This level challenges your understanding of key Machine Learning concepts.`,
      icon: "👨‍🏫",
      type: "introduction"
    },
    {
      title: "Level Objectives",
      content: `Navigate the maze, answer ${levelNumber + 3} quiz questions, and collect ${levelNumber + 3} keys to unlock the goal. Each correct answer builds your ML knowledge!`,
      icon: "🎯",
      type: "objectives"
    },
    {
      title: "Strategy Tips",
      content: `Take your time with each question - hints are available if needed. Wrong answers cost lives, but you have 5 total. The goal becomes unlocked only when you collect all keys.`,
      icon: "💡",
      type: "tips"
    },
    {
      title: "Ready to Begin Learning?",
      content: `${displayName}, you are equipped with everything needed for this ML challenge. Show me what you've learned about ${topicName} - let's begin your learning adventure!`,
      icon: "🚀",
      type: "motivation"
    }
  ];

  const nextStep = () => {
    if (currentStep < levelObjectives.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onStartLevel();
    }
  };

  const skipTutorial = () => {
    onStartLevel();
  };

  if (!isVisible) return null;

  const currentObjective = levelObjectives[currentStep];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-gray-900 border-2 border-primary-400 rounded-xl p-6 max-w-lg w-full mx-4 shadow-2xl">
        {/* Skip Button */}
        <button
          onClick={skipTutorial}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors text-sm underline"
        >
          Skip Tutorial
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-6xl mb-3">{currentObjective.icon}</div>
          <h3 className="text-xl font-bold text-white mb-2">{currentObjective.title}</h3>
          <div className="flex justify-center items-center space-x-2 mb-4">
            {levelObjectives.map((_, index) => (
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
        <div className="text-center mb-8">
          <p className="text-gray-300 leading-relaxed text-sm">
            {currentObjective.content}
          </p>
        </div>

        {/* Level Info */}
        <div className="bg-gray-800 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-400">{levelNumber + 3}</div>
              <div className="text-sm text-gray-400">Questions</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-400">{levelNumber + 3}</div>
              <div className="text-sm text-gray-400">Keys Needed</div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="text-center">
          <button
            onClick={nextStep}
            className={`px-8 py-3 rounded-lg font-bold text-white transition-all transform hover:scale-105 shadow-lg ${
              currentStep === levelObjectives.length - 1
                ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800'
                : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
            }`}
          >
            {currentStep === levelObjectives.length - 1 ? 'Start Level! 🎓' : 'Continue →'}
          </button>
        </div>

        {/* Progress Text */}
        <div className="text-center mt-4">
          <p className="text-gray-500 text-xs">
            {currentStep + 1} of {levelObjectives.length} • ML Learning Challenge
          </p>
        </div>
      </div>
    </div>
  );
}
