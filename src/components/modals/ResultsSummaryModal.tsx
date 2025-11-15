/**
 * Results Summary Modal - Show quiz completion results with navigation options
 */

import type { Topic } from '../../data/questionBank';

interface ResultsSummaryModalProps {
  isVisible: boolean;
  topic: Topic | null;
  levelNumber: number | null;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  timeSpent: number; // in seconds
  onNextTopic: () => void;
  onNextLevel: () => void;
  onRetry: () => void;
  onMainMenu: () => void;
  hasNextLevel: boolean;
}

export function ResultsSummaryModal({
  isVisible,
  topic,
  levelNumber,
  score,
  correctAnswers,
  totalQuestions,
  timeSpent,
  onNextTopic,
  onNextLevel,
  onRetry,
  onMainMenu,
  hasNextLevel,
}: ResultsSummaryModalProps) {
  if (!isVisible || !topic || !levelNumber) return null;

  const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
  const minutes = Math.floor(timeSpent / 60);
  const seconds = timeSpent % 60;

  // Determine performance message
  let performanceMessage = '';
  let performanceEmoji = '';
  let performanceColor = '';

  if (accuracy >= 90) {
    performanceMessage = 'Outstanding!';
    performanceEmoji = '🌟';
    performanceColor = 'text-yellow-400';
  } else if (accuracy >= 75) {
    performanceMessage = 'Great Job!';
    performanceEmoji = '🎉';
    performanceColor = 'text-green-400';
  } else if (accuracy >= 60) {
    performanceMessage = 'Good Effort!';
    performanceEmoji = '👍';
    performanceColor = 'text-blue-400';
  } else {
    performanceMessage = 'Keep Practicing!';
    performanceEmoji = '💪';
    performanceColor = 'text-orange-400';
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl max-w-2xl w-full border-2 border-primary-500 shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={onMainMenu}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10 text-2xl"
          title="Close and go to main menu"
        >
          ×
        </button>

        {/* Header with Performance */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 p-8 rounded-t-xl text-center">
          <div className="text-8xl mb-4">{performanceEmoji}</div>
          <h2 className={`text-4xl font-bold ${performanceColor} mb-2`}>
            {performanceMessage}
          </h2>
          <p className="text-gray-200 text-lg">
            {topic.icon} {topic.name} - Level {levelNumber}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="p-8 bg-gray-800">
          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* Score */}
            <div className="bg-gradient-to-br from-purple-600 to-purple-800 p-6 rounded-lg text-center">
              <div className="text-gray-200 text-sm mb-1">Total Score</div>
              <div className="text-4xl font-bold text-white">{score}</div>
            </div>

            {/* Accuracy */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-6 rounded-lg text-center">
              <div className="text-gray-200 text-sm mb-1">Accuracy</div>
              <div className="text-4xl font-bold text-white">{accuracy.toFixed(1)}%</div>
            </div>

            {/* Correct Answers */}
            <div className="bg-gradient-to-br from-green-600 to-green-800 p-6 rounded-lg text-center">
              <div className="text-gray-200 text-sm mb-1">Correct Answers</div>
              <div className="text-4xl font-bold text-white">
                {correctAnswers}/{totalQuestions}
              </div>
            </div>

            {/* Time */}
            <div className="bg-gradient-to-br from-orange-600 to-orange-800 p-6 rounded-lg text-center">
              <div className="text-gray-200 text-sm mb-1">Time Taken</div>
              <div className="text-4xl font-bold text-white">
                {minutes}:{seconds.toString().padStart(2, '0')}
              </div>
            </div>
          </div>

          {/* Encouragement Message */}
          <div className="bg-gray-700 rounded-lg p-4 mb-6 text-center">
            <p className="text-gray-300">
              {accuracy >= 90 && '🏆 Perfect performance! You\'ve mastered this level!'}
              {accuracy >= 75 && accuracy < 90 && '⭐ Excellent work! Just a few more to master!'}
              {accuracy >= 60 && accuracy < 75 && '📚 Good progress! Review the missed questions and try again!'}
              {accuracy < 60 && '💡 Don\'t give up! Review the material and you\'ll do better next time!'}
            </p>
          </div>

          {/* Download Summary Button */}
          <div className="mb-6">
            <button
              onClick={() => {
                const summary = `# 🎓 ML Learning Maze - Level Results

## ${topic ? topic.icon + ' ' + topic.name : ''} - Level ${levelNumber}

### 📊 Performance Summary
- **Score**: ${score} points
- **Accuracy**: ${accuracy.toFixed(1)}%
- **Correct Answers**: ${correctAnswers}/${totalQuestions}
- **Time Taken**: ${Math.floor(timeSpent / 60)}:${(timeSpent % 60).toString().padStart(2, '0')}

### 🎯 Level Assessment
${accuracy >= 90 ? '🏆 Perfect performance! You\'ve mastered this level!' : ''}
${accuracy >= 75 && accuracy < 90 ? '⭐ Excellent work! Just a few more to master!' : ''}
${accuracy >= 60 && accuracy < 75 ? '📚 Good progress! Review the missed questions and try again!' : ''}
${accuracy < 60 ? '💡 Don\'t give up! Review the material and you\'ll do better next time!' : ''}

### 📅 Completed on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}

*Generated by ML Learning Maze - AI-Powered ML Education*
`;

                const blob = new Blob([summary], { type: 'text/markdown' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${topic?.name || 'ML'}-Level-${levelNumber}-Results.md`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              }}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              📄 Download Level Summary
            </button>
          </div>

          {/* Navigation Buttons */}
          <div className="space-y-3">
            {/* Next Level Button (if available) */}
            {hasNextLevel && (
              <button
                onClick={onNextLevel}
                className="w-full bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white font-bold py-4 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                ⬆️ Next Level
              </button>
            )}

            {/* Choose Next Topic */}
            <button
              onClick={onNextTopic}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-bold py-4 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              🎓 Choose Next Topic
            </button>

            {/* Retry This Level */}
            <button
              onClick={onRetry}
              className="w-full bg-gradient-to-r from-yellow-500 to-yellow-700 hover:from-yellow-600 hover:to-yellow-800 text-white font-bold py-4 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              🔄 Retry This Level
            </button>

            {/* Main Menu */}
            <button
              onClick={onMainMenu}
              className="w-full bg-gradient-to-r from-gray-600 to-gray-800 hover:from-gray-700 hover:to-gray-900 text-white font-bold py-4 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              🏠 Main Menu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
