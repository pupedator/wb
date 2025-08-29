import React from 'react';
import { useLanguage } from '../contexts/LanguageContext.tsx';

const Hero: React.FC = () => {
  const { t, bookingLink } = useLanguage();

  return (
    <section id="hero" className="min-h-screen flex items-center relative pt-32 pb-16 md:pt-20 md:pb-20 px-4 bg-cover bg-center bg-fixed">
      <div className="absolute inset-0 bg-black/70"></div>
      <div className="container mx-auto z-10 relative">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12 items-center">
          <div className="md:col-span-3 text-center md:text-left">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tighter mb-4">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
                {t('hero.title_part1')}
              </span>{' '}
              <span className="text-white">{t('hero.title_part2')}</span>
            </h1>
            <p className="max-w-2xl text-lg md:text-xl text-neutral-300 mb-8 mx-auto md:mx-0">
              {t('hero.subtitle')}
            </p>
            <a href={bookingLink} target="_blank" rel="noopener noreferrer" className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-10 rounded-full text-lg transition-all duration-300 transform hover:scale-105 shadow-lg shadow-purple-600/30 inline-block">
              {t('hero.cta')}
            </a>
          </div>
          <div className="md:col-span-2 flex justify-center md:justify-end">
            <div className="w-full max-w-[280px] sm:max-w-xs rounded-xl overflow-hidden shadow-2xl shadow-purple-500/20 border-2 border-purple-500/30">
              <div style={{position: 'relative', width: '100%', paddingTop: '177.778%'}}>
                <iframe 
                  allow="fullscreen" 
                  allowFullScreen
                  height="100%" 
                  src="https://streamable.com/e/hebrv5?muted=1&nocontrols=1&autoplay=1&loop=1" 
                  width="100%" 
                  style={{border: 'none', width: '100%', height: '100%', position: 'absolute', left: '0px', top: '0px', overflow: 'hidden'}}
                  title="PixelCyberZone Ambiance"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;