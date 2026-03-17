import React from 'react';
import { useLanguage } from '../contexts/LanguageContext.tsx';

const HardwareSection: React.FC = () => {
  const { t, partners, specs } = useLanguage();
  
  return (
    <section className="py-20 md:py-32 bg-neutral-950/90 backdrop-blur-sm">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-white" dangerouslySetInnerHTML={{ __html: t('hardware.title') }}>
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8 max-w-6xl mx-auto mb-16 sm:mb-20">
            {specs.map((spec, index) => (
                <div key={index} className="bg-neutral-900/50 p-4 sm:p-6 rounded-lg border border-neutral-800 flex items-center space-x-3 sm:space-x-4">
                    <div className="w-8 sm:w-10 h-8 sm:h-10 text-purple-400 flex-shrink-0" dangerouslySetInnerHTML={{ __html: spec.icon }} />
                    <div className="min-w-0">
                        <p className="font-bold text-white text-sm sm:text-base md:text-lg">{spec.name}</p>
                        <p className="text-neutral-400 text-xs sm:text-sm md:text-base">{spec.value}</p>
                    </div>
                </div>
            ))}
        </div>

        <h3 className="text-xl sm:text-2xl font-bold text-center text-neutral-400 mb-8 sm:mb-10">
          {t('partners.title')}
        </h3>
        <div className="flex flex-wrap justify-center items-center gap-x-8 sm:gap-x-12 md:gap-x-16 gap-y-6 sm:gap-y-8">
          {partners.map((logo, index) => (
            <div 
              key={index}
              className="h-8 sm:h-10 w-20 sm:w-24 md:w-28 text-neutral-500 hover:text-white transition-colors duration-300 flex justify-center items-center"
              dangerouslySetInnerHTML={{ __html: logo.src }}
              title={logo.alt}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HardwareSection;