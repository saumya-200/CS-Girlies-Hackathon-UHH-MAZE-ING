// src/components/modals/SettingsModal.tsx
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import i18n from "../../utils/i18n";
import { useGameStore } from "../../stores/gameStore";

interface SettingsModalProps {
  isVisible: boolean;
  onClose: () => void;
}

export function SettingsModal({ isVisible, onClose }: SettingsModalProps) {
  const { t } = useTranslation();
  const { characterName, setCharacterName } = useGameStore();
  const [tempName, setTempName] = useState(characterName || "");
  const [isEditingName, setIsEditingName] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language || "en");

  const languages = [
    { code: "en", name: t("languages.en"), flag: "🇺🇸" },
    { code: "es", name: t("languages.es"), flag: "🇪🇸" },
    { code: "fr", name: t("languages.fr"), flag: "🇫🇷" },
    { code: "hi", name: t("languages.hi"), flag: "🇮🇳" },
  ];

  const totalScore = 0;
  const completedLevels = 0;

  useEffect(() => {
    if (isVisible) {
      setTempName(characterName || "");
      setIsEditingName(false);
    }
  }, [isVisible, characterName]);

  const handleSaveName = () => {
    if (tempName.trim()) {
      setCharacterName(tempName.trim());
      setIsEditingName(false);
    }
  };

  const handleCancelEdit = () => {
    setTempName(characterName || "");
    setIsEditingName(false);
  };

  const handleLanguageChange = async (code: string) => {
    setSelectedLanguage(code);
    await i18n.changeLanguage(code);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      {/* HARD WHITE PANEL – NO TRANSPARENCY */}
      <div
        className="
          bg-white bg-opacity-100
          border-[4px] border-black
          rounded-xl p-6
          max-w-md w-full mx-4
          shadow-2xl
          pixel-text
        "
        style={{ backgroundColor: "#ffffff" }}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-extrabold text-[#ff008c]">
            ⚙️ {t("settings.title")}
          </h2>
          <button
            onClick={onClose}
            className="text-[#ff008c] hover:text-black text-3xl leading-none font-bold"
          >
            ×
          </button>
        </div>

        {/* SCORE BOXES */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-[#ff008c] mb-3">
            {t("settings.progress.title")}
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border-2 border-black text-center bg-white bg-opacity-100">
              <div className="text-3xl font-bold text-black">{totalScore}</div>
              <div className="text-sm text-[#ff008c]">
                {t("settings.progress.totalScore")}
              </div>
            </div>

            <div className="p-4 rounded-lg border-2 border-black text-center bg-white bg-opacity-100">
              <div className="text-3xl font-bold text-black">{completedLevels}</div>
              <div className="text-sm text-[#ff008c]">
                {t("settings.progress.levelsCompleted")}
              </div>
            </div>
          </div>
        </div>

        {/* CHARACTER NAME */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-[#ff008c] mb-3">
            {t("settings.characterName")}
          </h3>

          {!isEditingName ? (
            <div className="p-4 border-2 border-black rounded-lg flex justify-between items-center bg-white bg-opacity-100">
              <span className="text-black font-medium">{characterName}</span>
              <button
                onClick={() => setIsEditingName(true)}
                className="bg-[#ff008c] hover:bg-[#e0007e] text-white px-3 py-1 rounded"
              >
                {t("settings.editName")}
              </button>
            </div>
          ) : (
            <div className="p-4 border-2 border-black rounded-lg space-y-3 bg-white bg-opacity-100">
              <input
                className="w-full px-3 py-2 border-2 border-black rounded bg-white text-black"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
              />

              <div className="flex gap-2">
                <button
                  onClick={handleSaveName}
                  className="flex-1 bg-[#ff008c] hover:bg-[#e0007e] text-white px-3 py-1 rounded"
                >
                  {t("common.save")}
                </button>

                <button
                  onClick={handleCancelEdit}
                  className="flex-1 bg-black hover:bg-gray-900 text-white px-3 py-1 rounded"
                >
                  {t("common.cancel")}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* LANGUAGE SELECT */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-[#ff008c] mb-3">
            {t("settings.language.label")}
          </h3>

          <div className="grid grid-cols-2 gap-3">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`
                  p-3 rounded-lg border-2 bg-white bg-opacity-100
                  ${selectedLanguage === lang.code
                    ? "border-[#ff008c]"
                    : "border-black hover:border-[#ff008c]"
                  }
                `}
              >
                <div className="text-2xl">{lang.flag}</div>
                <div
                  className={`text-sm font-bold ${
                    selectedLanguage === lang.code
                      ? "text-[#ff008c]"
                      : "text-black"
                  }`}
                >
                  {lang.name}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex gap-3 pt-4">
          <button
            onClick={onClose}
            className="flex-1 bg-white bg-opacity-100 border-2 border-black text-[#ff008c] py-3 rounded-lg hover:bg-gray-100"
          >
            Close
          </button>

          <button
            onClick={onClose}
            className="flex-1 bg-[#ff008c] border-2 border-black text-white py-3 rounded-lg hover:bg-[#e0007e]"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
