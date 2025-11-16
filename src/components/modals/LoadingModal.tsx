/**
 * Loading Modal for API requests and content generation
 */

interface LoadingModalProps {
  isVisible: boolean;
  title?: string;
  message?: string;
}

export function LoadingModal({
  isVisible,
  title = "Generating Content...",
  message = "Please wait while we prepare your learning materials"
}: LoadingModalProps) {
  if (!isVisible) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        {/* Modal */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
          <div className="flex flex-col items-center text-center space-y-4">
            {/* Loading Spinner */}
            <div className="relative">
              <div className="w-12 h-12 border-4 border-gray-600 border-t-blue-500 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-6 h-6 bg-blue-500 rounded-full animate-pulse"></div>
              </div>
            </div>

            {/* Content */}
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white">{title}</h3>
              <p className="text-gray-300 text-sm">{message}</p>
            </div>

            {/* Progress indicators */}
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-blue-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default LoadingModal;
