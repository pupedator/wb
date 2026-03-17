import React from 'react';
import { useLanguage } from '../contexts/LanguageContext.tsx';

const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const languages = ['en', 'az', 'ru'];
  
  const handleLanguageChange = (newLang: 'en' | 'az' | 'ru') => {
    console.log('Language changing from', language, 'to', newLang);
    setLanguage(newLang);
  };

  return (
    <div className="flex items-center space-x-1 sm:space-x-2 bg-neutral-900/80 border border-neutral-600 rounded-full p-1 backdrop-blur-sm">
      {languages.map((lang) => (
        <button
          key={lang}
          onClick={() => handleLanguageChange(lang as 'en' | 'az' | 'ru')}
          className={`px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-semibold rounded-full transition-all duration-300 ${
            language === lang
              ? 'bg-violet-600 text-white'
              : 'bg-transparent text-neutral-400 hover:text-white hover:bg-purple-500/20'
          }`}
        >
          {lang.toUpperCase()}
        </button>
      ))}
    </div>
  );
};

export default LanguageSwitcher;