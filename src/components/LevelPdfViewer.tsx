// src/components/LevelPdfViewer.tsx
import React from "react";
import level1Pdf from "../assets/pdfs/Level1.pdf";

export function LevelPdfViewer() {
  return (
    <div className="w-full h-full bg-white flex flex-col">
      {/* Top bar */}
      <div className="px-3 py-2 border-b-4 border-black bg-[#ff008c] text-white pixel-text text-xs flex items-center justify-between">
        <span>📘 Level 1 Guide</span>
        <span className="text-[10px]">Scroll to read</span>
      </div>

      {/* PDF area */}
      <div className="flex-1 overflow-hidden">
        <iframe
          src={level1Pdf}
          title="Level 1 Study Guide"
          className="w-full h-full"
        />
      </div>
    </div>
  );
}
