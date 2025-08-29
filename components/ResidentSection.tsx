import React from 'react';
import { useLanguage } from '../contexts/LanguageContext.tsx';
import ResidentCard from './ResidentCard.tsx';

const ResidentSection: React.FC = () => {
    const { t, residentPlans } = useLanguage();
    return (
        <section id="resident" className="py-20 md:py-32 relative">
            <div className="absolute inset-0 bg-black/80"></div>
            <div className="container mx-auto px-6 relative z-10">
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-white" dangerouslySetInnerHTML={{ __html: t('resident.title') }}>
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                    {residentPlans.map((plan, index) => (
                        <ResidentCard key={index} plan={plan} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ResidentSection;