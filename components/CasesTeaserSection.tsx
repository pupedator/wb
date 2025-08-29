import React from 'react';
import { useLanguage } from '../contexts/LanguageContext.tsx';
import { useAuth } from '../contexts/AuthContext.tsx';
import type { Page } from '../App.tsx';
import type { Case } from '../types.ts';

const TeaserCaseDisplay: React.FC<{ caseItem: Case }> = ({ caseItem }) => (
    <div className="flex flex-col items-center text-center group">
        <img 
            src={caseItem.image} 
            alt={caseItem.name} 
            className="w-48 h-48 object-contain mb-4 drop-shadow-[0_5px_15px_rgba(147,51,234,0.2)] transition-transform duration-500 group-hover:scale-110 group-hover:drop-shadow-[0_8px_25px_rgba(147,51,234,0.4)]" 
        />
        <h3 className="text-xl font-bold text-white">{caseItem.name}</h3>
    </div>
);

const CasesTeaserSection: React.FC<{ setPage: (page: Page) => void }> = ({ setPage }) => {
    const { t, casesData } = useLanguage();
    const { user } = useAuth();

    const handleCTAClick = () => {
        if (user) {
            // User is logged in, take them to the cases page
            setPage('cases');
        } else {
            // User is not logged in, take them to register
            setPage('register');
        }
    };

    return (
        <section id="cases-teaser" className="py-20 md:py-32 bg-neutral-950/90 backdrop-blur-sm">
            <div className="container mx-auto px-6 text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-6 text-white" dangerouslySetInnerHTML={{ __html: t('cases_teaser.title') }} />
                <p className="max-w-2xl mx-auto text-lg text-neutral-300 mb-12">
                    {t('cases_teaser.subtitle')}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto mb-16">
                    {casesData.map((caseInfo) => (
                        <TeaserCaseDisplay key={caseInfo.id} caseItem={caseInfo} />
                    ))}
                </div>

                <button 
                    onClick={handleCTAClick} 
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-10 rounded-full text-lg transition-all duration-300 transform hover:scale-105 shadow-lg shadow-purple-600/30"
                >
                    {user ? t('cases.open_button') : t('cases_teaser.cta')}
                </button>
            </div>
        </section>
    );
};

export default CasesTeaserSection;
