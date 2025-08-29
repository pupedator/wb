import React from 'react';
import type { Game } from '../types.ts';

interface GameCardProps {
  game: Game;
}

const GameCard: React.FC<GameCardProps> = ({ game }) => {
  return (
    <div className="text-center group">
      <div className="relative aspect-square mx-auto rounded-lg overflow-hidden shadow-lg transform group-hover:scale-105 transition-transform duration-300">
        <img src={game.image} alt={game.title} className="w-full h-full object-cover" />
         <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
        <h3 className="absolute bottom-4 left-4 text-xl font-bold text-white">{game.title}</h3>
      </div>
    </div>
  );
};

export default GameCard;