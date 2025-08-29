import React from 'react';
import { useLanguage } from '../contexts/LanguageContext.tsx';
import GoogleMap from './GoogleMap.tsx';

const LocationSection: React.FC = () => {
    const { t } = useLanguage();

    return (
        <section id="location" className="py-20 md:py-32">
            <div className="container mx-auto px-6">
                 <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-white" dangerouslySetInnerHTML={{ __html: t('location.title') }}>
                </h2>
                <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                   <div className="w-full h-80 md:h-96 bg-neutral-900 rounded-lg border border-neutral-800 relative overflow-hidden">
                       <GoogleMap />
                   </div>
                   <div className="text-center md:text-left">
                       <h3 className="text-2xl font-bold text-white mb-4">{t('location.address_title')}</h3>
                       <p className="text-lg text-neutral-300 mb-6">
                           {t('location.address_value')}
                       </p>
                       <h3 className="text-2xl font-bold text-white mb-4">{t('location.hours_title')}</h3>
                       <p className="text-lg text-neutral-300" dangerouslySetInnerHTML={{__html: t('location.hours_value')}}>
                       </p>
                   </div>
                </div>
            </div>
        </section>
    );
};

export default LocationSection;