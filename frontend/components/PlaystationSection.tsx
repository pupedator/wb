import React from 'react';
import { useLanguage } from '../contexts/LanguageContext.tsx';

const PlaystationSection: React.FC = () => {
  const { t, playstationImages } = useLanguage();

  return (
    <section 
      id="playstation" 
      className="py-20 md:py-32 relative bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('https://i.ibb.co/MDmJG3vL/IMG-5811.jpg')" }}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
      <div className="container mx-auto px-6 relative z-10">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-white" dangerouslySetInnerHTML={{ __html: t('playstation.title') }}></h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {playstationImages.map((image, index) => (
            <div key={index} className="group relative aspect-[3/4] overflow-hidden rounded-lg">
              <img src={image.src} alt={`PlayStation setup ${index + 1}`} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500 ease-in-out" />
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors duration-300"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PlaystationSection;