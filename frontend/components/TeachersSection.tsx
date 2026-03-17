import React from 'react';
import GameCard from './TeacherCard.tsx';
import { useLanguage } from '../contexts/LanguageContext.tsx';

const GamesSection: React.FC = () => {
  const { t, games } = useLanguage();

  return (
    <section id="games" className="py-20 md:py-32 bg-neutral-950/90 backdrop-blur-sm">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-white" dangerouslySetInnerHTML={{ __html: t('games.title') }}>
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
          {games.map((game, index) => (
            <GameCard key={index} game={game} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default GamesSection;