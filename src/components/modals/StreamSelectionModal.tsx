/**
 * Stream Selection Modal - Choose subject stream
 */

import { STREAMS, type Stream } from '../../data/questionBank';

interface StreamSelectionModalProps {
  isVisible: boolean;
  onSelectStream: (stream: Stream) => void;
  completedStreams?: string[];
}

export function StreamSelectionModal({ 
  isVisible, 
  onSelectStream,
  completedStreams = []
}: StreamSelectionModalProps) {
  if (!isVisible) return null;

  const colorMap: Record<string, string> = {
    blue: 'from-blue-500 to-blue-700',
    green: 'from-green-500 to-green-700',
    yellow: 'from-yellow-500 to-yellow-700',
    teal: 'from-teal-500 to-teal-700',
    purple: 'from-purple-500 to-purple-700',
    cyan: 'from-cyan-500 to-cyan-700',
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border-2 border-primary-500 shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 p-6 rounded-t-xl">
          <h2 className="text-3xl font-bold text-white text-center">
            🎓 Choose Your Subject Stream
          </h2>
          <p className="text-gray-200 text-center mt-2">
            Select a topic to begin your learning adventure!
          </p>
        </div>

        {/* Stream Grid */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {STREAMS.map((stream) => {
            const isCompleted = completedStreams.includes(stream.id);
            
            return (
              <button
                key={stream.id}
                onClick={() => onSelectStream(stream)}
                className={`
                  relative p-6 rounded-lg bg-gradient-to-br ${colorMap[stream.color]}
                  hover:scale-105 transform transition-all duration-200
                  border-2 border-transparent hover:border-white
                  shadow-lg hover:shadow-2xl
                  text-left group
                `}
              >
                {/* Completion Badge */}
                {isCompleted && (
                  <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg">
                    ✓
                  </div>
                )}

                {/* Icon */}
                <div className="text-6xl mb-3 group-hover:scale-110 transition-transform">
                  {stream.icon}
                </div>

                {/* Title */}
                <h3 className="text-2xl font-bold text-white mb-2">
                  {stream.name}
                </h3>

                {/* Description */}
                <p className="text-gray-100 text-sm opacity-90">
                  {stream.description}
                </p>

                {/* Hover Effect */}
                <div className="mt-4 text-white text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                  Click to start →
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer Stats */}
        <div className="bg-gray-800 p-4 rounded-b-xl border-t-2 border-gray-700">
          <div className="text-center text-gray-300">
            <span className="font-semibold">{completedStreams.length}</span> of{' '}
            <span className="font-semibold">{STREAMS.length}</span> streams completed
          </div>
        </div>
      </div>
    </div>
  );
}
