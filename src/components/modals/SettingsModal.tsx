import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../../utils/i18n';
import { useGameStore } from '../../stores/gameStore';
import { useQuizProgressStore } from '../../stores/quizProgressStore';

interface SettingsModalProps {
  isVisible: boolean;
  onClose: () => void;
}

export function SettingsModal({ isVisible, onClose }: SettingsModalProps) {
  const { t } = useTranslation();
  const { characterName, setCharacterName } = useGameStore();
  const [tempName, setTempName] = useState(characterName || '');
  const [isEditingName, setIsEditingName] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language || 'en');

  const languages = [
    { code: 'en', name: t('languages.en'), flag: '🇺🇸' },
    { code: 'es', name: t('languages.es'), flag: '🇪🇸' },
    { code: 'fr', name: t('languages.fr'), flag: '🇫🇷' },
    { code: 'hi', name: t('languages.hi'), flag: '🇮🇳' },
  ];

  // Get some basic stats for display - placeholder values for now
  const totalScore = 0; // useQuizProgressStore.getState().getTotalScore();
  const completedLevels = 0; // useQuizProgressStore.getState().getCompletedLevelsForTopic();

  useEffect(() => {
    if (isVisible) {
      setTempName(characterName || '');
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
    setTempName(characterName || '');
    setIsEditingName(false);
  };

  const handleLanguageChange = async (languageCode: string) => {
    setSelectedLanguage(languageCode);
    await i18n.changeLanguage(languageCode);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
      <div className="bg-gray-900 border-2 border-primary-400 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">⚙️ {t('settings.title')}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors text-2xl"
            aria-label={t('accessibility.closeModal')}
          >
            ×
          </button>
        </div>

        {/* Score Display */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-3">📊 {t('settings.progress.title')}</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-800 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-yellow-400">{totalScore}</div>
              <div className="text-sm text-gray-400">{t('settings.progress.totalScore')}</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-400">{completedLevels}</div>
              <div className="text-sm text-gray-400">{t('settings.progress.levelsCompleted')}</div>
            </div>
          </div>
        </div>

        {/* Character Name */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-3">🧑 {t('settings.characterName')}</h3>
          {!isEditingName ? (
            <div className="flex items-center justify-between bg-gray-800 rounded-lg p-4">
              <span className="text-white font-medium">{characterName || 'Not Set'}</span>
              <button
                onClick={() => setIsEditingName(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors"
              >
                {t('settings.editName')}
              </button>
            </div>
          ) : (
            <div className="bg-gray-800 rounded-lg p-4 space-y-3">
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                placeholder={t('welcome.placeholder')}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                maxLength={20}
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSaveName}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition-colors"
                >
                  {t('common.save')}
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors"
                >
                  {t('common.cancel')}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Language Selection */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-3">🌐 {t('settings.language.label')}</h3>
          <div className="grid grid-cols-2 gap-3">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  selectedLanguage === lang.code
                    ? 'border-blue-500 bg-blue-500 bg-opacity-20'
                    : 'border-gray-600 hover:border-gray-500 bg-gray-800 hover:bg-opacity-30'
                }`}
              >
                <div className="text-2xl mb-1">{lang.flag}</div>
                <div className={`text-sm font-medium ${
                  selectedLanguage === lang.code ? 'text-white' : 'text-gray-300'
                }`}>
                  {lang.name}
                </div>
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">* Full i18n implementation coming soon</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-medium transition-colors"
          >
            Close
          </button>
          <button
            onClick={() => {
              // In full implementation, this would save all settings
              onClose();
            }}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
