// src/components/modals/LevelInstructorModal.tsx
import { useState, useEffect } from "react";
import { useGameStore } from "../../stores/gameStore";
import wiseOwl from "../../assets/wise-owl.png";

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
  onStartLevel,
}: LevelInstructorModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const { characterName } = useGameStore();

  const displayName = characterName || "Student";

  useEffect(() => {
    if (!isVisible) setCurrentStep(0);
  }, [isVisible]);

  const pages = [
    {
      title: `${displayName}, let's tackle ${topicName}!`,
      content: `Miss Hootsworth here to guide you through ${topicName} Level ${levelNumber}.`,
      type: "Introduction",
    },
    {
      title: "Level Objectives",
      content: `Answer ${levelNumber + 3} questions and collect ${
        levelNumber + 3
      } keys to unlock the goal.`,
      icon: "🎯",
      type: "Objectives",
    },
    {
      title: "Tips",
      content:
        "Use hints wisely. Wrong answers cost lives. Collect all keys to open the exit.",
      icon: "💡",
      type: "Tips",
    },
    {
      title: "Ready?",
      content: `Let's begin your journey in ${topicName}!`,
      icon: "🚀",
      type: "Motivation",
    },
  ];

  if (!isVisible) return null;

  const page = pages[currentStep];

  const next = () => {
    if (currentStep < pages.length - 1) setCurrentStep((v) => v + 1);
    else onStartLevel();
  };

  return (
    <div className="w-full h-full bg-white flex flex-col p-4">
      {/* HEADER */}
      <div className="flex justify-between mb-3">
        <div>
          <span className="pixel-text text-xs text-[#ff008c]">
            Level Guide
          </span>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-lg">{page.icon}</span>
            <h2 className="pixel-text text-sm font-bold text-black leading-snug">
              {page.title}
            </h2>
          </div>
        </div>

        <button
          onClick={onStartLevel}
          className="text-xs underline text-[#ff008c] hover:text-black pixel-text"
        >
          Skip
        </button>
      </div>

      {/* PROGRESS */}
      <div className="flex items-center gap-2 mb-3">
        {pages.map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full ${
              i === currentStep ? "bg-[#ff008c]" : "bg-gray-300"
            }`}
          />
        ))}
        <span className="text-[10px] text-gray-600 pixel-text">
          Step {currentStep + 1} of {pages.length}
        </span>
      </div>

      {/* MAIN */}
      <div className="flex-1 text-sm pixel-text text-black">
        <p className="text-[#ff008c] text-xs">{page.type}</p>
        <p className="mt-2">{page.content}</p>

        <div className="grid grid-cols-2 gap-3 text-center mt-4">
          <div className="border-2 border-black rounded-lg px-2 py-2">
            <div className="pixel-text text-xl font-extrabold text-[#ff008c]">
              {levelNumber + 3}
            </div>
            <div className="text-[11px] text-black">Questions</div>
          </div>
          <div className="border-2 border-black rounded-lg px-2 py-2">
            <div className="pixel-text text-xl font-extrabold text-[#ff008c]">
              {levelNumber + 3}
            </div>
            <div className="text-[11px] text-black">Keys Needed</div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="flex justify-between items-end mt-4">
        <img
          src={wiseOwl}
          className="h-16 object-contain drop-shadow-[0_0_12px_rgba(255,0,140,0.4)]"
          alt="Professor Owl"
        />

        <button
          onClick={next}
          className="
            px-4 py-2 
            border-4 border-black 
            bg-[#ff008c] text-white 
            pixel-text text-xs 
            rounded-lg 
            hover:bg-[#e0007e]
          "
        >
          {currentStep === pages.length - 1 ? "START LEVEL →" : "NEXT →"}
        </button>
      </div>
    </div>
  );
}
