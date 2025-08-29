import React from 'react';
import { useLanguage } from '../contexts/LanguageContext.tsx';

const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const languages = ['en', 'az', 'ru'];

  return (
    <div className="flex items-center space-x-2 bg-neutral-900/50 border border-neutral-700 rounded-full p-1">
      {languages.map((lang) => (
        <button
          key={lang}
          onClick={() => setLanguage(lang as 'en' | 'az' | 'ru')}
          className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors duration-300 ${
            language === lang
              ? 'bg-purple-600 text-white'
              : 'bg-transparent text-neutral-400 hover:text-white'
          }`}
        >
          {lang.toUpperCase()}
        </button>
      ))}
    </div>
  );
};

export default LanguageSwitcher;