import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext.tsx';
import CaseCard from './CaseCard.tsx';
import CaseOpeningModal from './CaseOpeningModal.tsx';
import type { Case, CaseReward, CaseHistoryItem } from '../types.ts';
import PromoCodeModal from './PromoCodeModal.tsx';
import CaseHistory from './CaseHistory.tsx';
import { useAuth } from '../contexts/AuthContext.tsx';
import type { Page } from '../App.tsx';

// Points system removed - all cases now require promo codes


const CasesPage: React.FC<{ setPage: (page: Page) => void }> = ({ setPage }) => {
    const { t, casesData } = useLanguage();
    const { user, updateUser, validateAndRedeemPromoCode } = useAuth();

    const [history, setHistory] = useState<CaseHistoryItem[]>([]);
    
    const [selectedCaseForPromo, setSelectedCaseForPromo] = useState<Case | null>(null);
    const [caseForOpening, setCaseForOpening] = useState<Case | null>(null);
    
    const [promoError, setPromoError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const savedHistory = localStorage.getItem('pixelCaseHistory');
        if (savedHistory) {
            setHistory(JSON.parse(savedHistory));
        }
    }, []);

    const handleSelectCase = (caseData: Case) => {
        setPromoError('');
        // All cases now require promo codes
        setSelectedCaseForPromo(caseData);
    };

    const handlePromoSubmit = async (promoInput: string) => {
        if (!selectedCaseForPromo) return;

        setIsSubmitting(true);
        setPromoError('');
        const code = promoInput.trim().toUpperCase();

        const result = await validateAndRedeemPromoCode(code, selectedCaseForPromo.id);

        if (result.success) {
            setCaseForOpening(selectedCaseForPromo);
            setSelectedCaseForPromo(null);
        } else {
            setPromoError(t('cases_page.invalid_code'));
        }
        setIsSubmitting(false);
    };

    const handleWin = (reward: CaseReward) => {
        if (!caseForOpening || !user) return;
        
        const newItem: CaseHistoryItem = {
            rewardName: reward.name,
            rewardRarity: reward.rarity,
            rewardImage: reward.image,
            caseName: caseForOpening.name,
            date: new Date().toISOString(),
        };
        const newHistory = [newItem, ...history];
        setHistory(newHistory);
        localStorage.setItem('pixelCaseHistory', JSON.stringify(newHistory));
    };

    const handleCloseOpeningModal = () => {
        setCaseForOpening(null);
    };

    return (
        <main className="min-h-screen pt-24 pb-16">
            <div className="container mx-auto px-6">
                 <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl md:text-5xl font-bold text-white" dangerouslySetInnerHTML={{ __html: t('cases.title') }} />
                    <button onClick={() => setPage('cabinet')} className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center space-x-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a4 4 0 100 8 4 4 0 000-8z" clipRule="evenodd" /></svg>
                        <span>{t('cases_page.my_cabinet')}</span>
                    </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
                    {casesData.map((caseInfo) => (
                        <CaseCard key={caseInfo.id} caseData={caseInfo} onOpen={() => handleSelectCase(caseInfo)} />
                    ))}
                </div>

                <div className="mt-20 max-w-4xl mx-auto">
                     <h2 className="text-3xl font-bold text-center mb-8 text-white">{t('cases_page.history_title')}</h2>
                     <CaseHistory history={history.slice(0, 5)} />
                </div>
            </div>
            
            {selectedCaseForPromo && (
                <PromoCodeModal 
                    caseData={selectedCaseForPromo}
                    onClose={() => setSelectedCaseForPromo(null)}
                    onSubmit={handlePromoSubmit}
                    error={promoError}
                    isSubmitting={isSubmitting}
                />
            )}
            

            {caseForOpening && (
                <CaseOpeningModal 
                    isOpen={!!caseForOpening}
                    onClose={handleCloseOpeningModal}
                    caseData={caseForOpening}
                    onWin={handleWin}
                />
            )}
        </main>
    );
};

export default CasesPage;