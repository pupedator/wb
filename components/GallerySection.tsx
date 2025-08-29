import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext.tsx';
import type { GalleryImage } from '../types.ts';

const GallerySection: React.FC = () => {
  const { t, galleryImages } = useLanguage();
  const [shuffledImages, setShuffledImages] = useState<GalleryImage[]>([]);

  useEffect(() => {
    if (galleryImages && galleryImages.length > 0) {
      const shuffleArray = (array: GalleryImage[]) => {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
      };
      setShuffledImages(shuffleArray(galleryImages));
    }
  }, [galleryImages]);

  return (
    <section id="gallery" className="py-20 md:py-32">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-white" dangerouslySetInnerHTML={{ __html: t('gallery.title') }}></h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {shuffledImages.map((image, index) => (
            <div key={index} className="group relative aspect-square overflow-hidden rounded-lg">
              <img src={image.src} alt={`Gallery image ${index + 1}`} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500 ease-in-out" />
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors duration-300"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GallerySection;