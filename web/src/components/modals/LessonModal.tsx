// Lesson modal component for displaying educational content

import { useEffect, useRef } from 'react';
import type { Lesson } from '../../types/content.types';

interface LessonModalProps {
  lesson: Lesson;
  onStart: () => void;
  isVisible: boolean;
}

export function LessonModal({ lesson, onStart, isVisible }: LessonModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Focus modal when it appears for accessibility
    if (isVisible && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isVisible]);

  useEffect(() => {
    // Handle Escape key to start (skip reading)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isVisible) {
        onStart();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, onStart]);

  if (!isVisible) return null;

  // Parse the lesson body for better rendering
  const renderLessonBody = (body: string) => {
    // Split by sections
    const lines = body.trim().split('\n');
    
    return lines.map((line, index) => {
      // Handle headers
      if (line.startsWith('### ')) {
        const text = line.replace('### ', '');
        return (
          <h3 key={index} className="text-xl font-bold text-primary-400 mt-6 mb-3">
            {text}
          </h3>
        );
      }
      if (line.startsWith('## ')) {
        const text = line.replace('## ', '');
        return (
          <h2 key={index} className="text-2xl font-bold text-white mt-8 mb-4">
            {text}
          </h2>
        );
      }
      
      // Handle bold text
      if (line.startsWith('**') && line.endsWith('**')) {
        const text = line.replace(/\*\*/g, '');
        return (
          <p key={index} className="font-semibold text-gray-200 mt-3">
            {text}
          </p>
        );
      }
      
      // Handle bullet points
      if (line.startsWith('- ')) {
        const text = line.replace('- ', '');
        return (
          <li key={index} className="text-gray-300 ml-6 my-1">
            {text}
          </li>
        );
      }
      
      // Handle code blocks
      if (line.startsWith('```')) {
        return null; // Skip code fence markers
      }
      
      // Regular paragraph
      if (line.trim() && !line.startsWith('```')) {
        return (
          <p key={index} className="text-gray-300 my-2 leading-relaxed">
            {line}
          </p>
        );
      }
      
      return <br key={index} />;
    });
  };

  return (
    <>
      {/* Backdrop overlay */}
      <div 
        className="modal-overlay"
        onClick={onStart}
        aria-hidden="true"
      />
      
      {/* Modal content */}
      <div
        ref={modalRef}
        className="modal-content"
        role="dialog"
        aria-labelledby="lesson-title"
        aria-modal="true"
        tabIndex={-1}
      >
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-primary-400 font-semibold uppercase tracking-wide">
              {lesson.topic}
            </span>
            <span className="text-sm text-gray-500">
              📚 {lesson.estimatedReadingMinutes} min read
            </span>
          </div>
          <h1 id="lesson-title" className="text-3xl font-display font-bold text-white mb-3">
            {lesson.title}
          </h1>
          <div className="flex items-center gap-2">
            <span className={`text-xs px-3 py-1 rounded-full ${
              lesson.difficulty === 'beginner' ? 'bg-green-600 text-white' :
              lesson.difficulty === 'intermediate' ? 'bg-yellow-600 text-white' :
              'bg-red-600 text-white'
            }`}>
              {lesson.difficulty.charAt(0).toUpperCase() + lesson.difficulty.slice(1)}
            </span>
          </div>
        </div>

        {/* Lesson body */}
        <div className="prose prose-invert max-w-none mb-8">
          {renderLessonBody(lesson.body)}
        </div>

        {/* Summary */}
        <div className="bg-gray-700 bg-opacity-50 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-semibold text-primary-400 mb-2">📝 Summary</h3>
          <p className="text-gray-300 text-sm leading-relaxed">
            {lesson.summary}
          </p>
        </div>

        {/* Keywords */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-400 mb-2">Key Concepts:</h3>
          <div className="flex flex-wrap gap-2">
            {lesson.keywords.map((keyword) => (
              <span
                key={keyword}
                className="text-xs bg-gray-700 text-gray-300 px-3 py-1 rounded-full"
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>

        {/* Start button */}
        <div className="flex justify-center pt-4 border-t border-gray-700">
          <button
            onClick={onStart}
            className="btn btn-primary text-lg px-8 py-4"
            autoFocus
          >
            Start Level 🎮
          </button>
        </div>

        {/* Help text */}
        <p className="text-center text-gray-500 text-sm mt-4">
          Press <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">Esc</kbd> or click outside to skip
        </p>
      </div>
    </>
  );
}
