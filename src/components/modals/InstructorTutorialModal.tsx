import wiseOwl from "../../assets/wise-owl.png";

interface InstructorTutorialModalProps {
  isVisible: boolean;
  onComplete: () => void;
  characterName?: string | null;
}

export function InstructorTutorialModal({
  isVisible,
  onComplete,
  characterName = "Student",
}: InstructorTutorialModalProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
      <div className="bg-white border-[4px] border-[#ff008c] rounded-xl p-6 w-full max-w-md pixel-text">
        <h2 className="text-xl font-bold text-[#ff008c] mb-3">Welcome!</h2>

        <p className="mb-4">
          Hello <strong>{characterName}</strong>! I’m Miss Hootsworth.
          Let’s explore the ML Maze and learn ML concepts together.
        </p>

        <img
          src={wiseOwl}
          alt="Professor Owl"
          className="h-24 mx-auto mb-4 drop-shadow-[0_0_12px_rgba(255,0,140,0.5)]"
        />

        <button
          onClick={onComplete}
          className="w-full py-3 rounded-lg border-4 border-black bg-[#ff008c] text-white pixel-text font-bold hover:bg-[#e0007e]"
        >
          Continue →
        </button>
      </div>
    </div>
  );
}
