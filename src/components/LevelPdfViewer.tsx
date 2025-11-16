// src/components/LevelPdfViewer.tsx
import React, { useState, useEffect } from "react";
import { useQuizProgressStore } from "../stores/quizProgressStore";
import { API_BASE } from "../utils/constants";

export function LevelPdfViewer() {
  const { currentTopic, currentLevelNumber } = useQuizProgressStore();
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!currentTopic || !currentLevelNumber) {
      setPdfUrl(null);
      setLoading(false);
      return;
    }

    const topicClean = currentTopic.name
      .toLowerCase()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_-]/g, "");

    const url = `${API_BASE}/api/materials/${encodeURIComponent(topicClean)}/${currentLevelNumber}/download`;

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.blob();
      })
      .then((blob) => {
        const objectUrl = URL.createObjectURL(blob);
        setPdfUrl(objectUrl);
        setError(false);
      })
      .catch(() => {
        setError(true);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [currentTopic, currentLevelNumber]);

  if (!currentTopic || !currentLevelNumber) {
    return (
      <div className="w-full h-full bg-white flex items-center justify-center pixel-text text-gray-500 text-sm">
        Select a level to view guide
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-white flex flex-col">
      {/* Top bar */}
      <div className="px-3 py-2 border-b-4 border-black bg-[#ff008c] text-white pixel-text text-xs flex items-center justify-between">
        <span>{currentTopic.icon} {currentTopic.name} • Level {currentLevelNumber}</span>
        <span className="text-[10px]">Scroll to read</span>
      </div>

      {/* PDF area */}
      <div className="flex-1 overflow-hidden">
        {loading && (
          <div className="w-full h-full flex items-center justify-center text-gray-500 pixel-text">
            Loading PDF...
          </div>
        )}

        {error && (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 pixel-text text-center p-4">
            <div className="text-6xl mb-4">Document not found</div>
            <p className="text-sm">No preview available</p>
          </div>
        )}

        {pdfUrl && !loading && !error && (
          <iframe
            src={pdfUrl}
            title={`${currentTopic.name} Level ${currentLevelNumber} Guide`}
            className="w-full h-full border-0"
          />
        )}
      </div>
    </div>
  );
}