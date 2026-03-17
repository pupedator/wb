import React from 'react';
import { useLanguage } from '../contexts/LanguageContext.tsx';

const BookingSection: React.FC = () => {
  const { t, bookingLink } = useLanguage();
  
  return (
    <section id="booking" className="py-20 md:py-32">
      <div className="container mx-auto px-6 text-center relative">
        <div className="absolute inset-0 max-w-lg mx-auto h-full bg-purple-600/20 rounded-full blur-3xl -z-0"></div>
        <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-extrabold mb-6 text-white leading-tight" dangerouslySetInnerHTML={{ __html: t('booking.title') }}>
            </h2>
            <p className="max-w-xl mx-auto text-lg text-neutral-300 mb-8">
                {t('booking.subtitle')}
            </p>
            <a href={bookingLink} target="_blank" rel="noopener noreferrer" className="glow-btn glow-btn-accent glow-btn-lg glow-btn-pulse inline-block rounded-full">
                {t('booking.cta')}
            </a>
        </div>
      </div>
    </section>
  );
};

export default BookingSection;