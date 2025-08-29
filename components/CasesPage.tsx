import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext.tsx';
import CaseCard from './CaseCard.tsx';
import CaseOpeningModal from './CaseOpeningModal.tsx';
import type { Case, CaseReward, CaseHistoryItem } from '../types.ts';
import PromoCodeModal from './PromoCodeModal.tsx';
import CaseHistory from './CaseHistory.tsx';
import { useAuth } from '../contexts/AuthContext.tsx';
import type { Page } from '../App.tsx';



/**
 * The main component for the "Cases" page. It displays available cases
 * and manages the entire flow of opening them using promo codes only.
 */
const CasesPage: React.FC<{ setPage: (page: Page) => void }> = ({ setPage }) => {
    const { t, casesData } = useLanguage();
    const { user, validateAndRedeemPromoCode } = useAuth();

    // State to store the user's case opening history, loaded from localStorage.
    const [history, setHistory] = useState<CaseHistoryItem[]>([]);
    
    // States to manage which modal is currently open.
    const [selectedCaseForPromo, setSelectedCaseForPromo] = useState<Case | null>(null);
    const [caseForOpening, setCaseForOpening] = useState<Case | null>(null);
    
    // States for handling form submission and errors.
    const [promoError, setPromoError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // On component mount, load the case history from localStorage.
    useEffect(() => {
        const savedHistory = localStorage.getItem('pixelCaseHistory');
        if (savedHistory) {
            setHistory(JSON.parse(savedHistory));
        }
    }, []);

    /**
     * Handles the click on a "Open Case" button. All cases now require promo codes.
     */
    const handleSelectCase = (caseData: Case) => {
        setPromoError(''); // Reset any previous errors.
        setSelectedCaseForPromo(caseData);
    };

    /**
     * Submits a promo code for validation. If successful, it closes the promo
     * modal and triggers the case opening with the reward from backend.
     */
    const handlePromoSubmit = async (promoInput: string) => {
        if (!selectedCaseForPromo) return;

        setIsSubmitting(true);
        setPromoError('');
        const code = promoInput.trim().toUpperCase();

        const result = await validateAndRedeemPromoCode(code, selectedCaseForPromo.id);

        if (result.success && result.reward) {
            // Add the won item to history
            const newItem: CaseHistoryItem = {
                rewardName: result.reward.name,
                rewardRarity: result.reward.rarity,
                rewardImage: result.reward.image,
                caseName: selectedCaseForPromo.name,
                date: new Date().toISOString(),
            };
            
            const newHistory = [newItem, ...history];
            setHistory(newHistory);
            localStorage.setItem('pixelCaseHistory', JSON.stringify(newHistory));
            
            // Show the opening animation with the actual reward
            setCaseForOpening(selectedCaseForPromo);
            setSelectedCaseForPromo(null);
        } else {
            setPromoError(result.message || 'Invalid promo code');
        }
        setIsSubmitting(false);
    };
    
    /**
     * This callback is triggered by the CaseOpeningModal when a reward is won.
     * Now just handles the animation, as the reward is already added to history.
     */
    const handleWin = (reward: CaseReward) => {
        // The reward was already processed by the backend and added to history
        // This is just for the animation
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

                {/* Display the 5 most recent winnings */}
                <div className="mt-20 max-w-4xl mx-auto">
                     <h2 className="text-3xl font-bold text-center mb-8 text-white">{t('cases_page.history_title')}</h2>
                     <CaseHistory history={history.slice(0, 5)} />
                </div>
            </div>
            
            {/* Promo code modal - now used for all cases */}
            {selectedCaseForPromo && (
                <PromoCodeModal 
                    caseData={selectedCaseForPromo}
                    onClose={() => setSelectedCaseForPromo(null)}
                    onSubmit={handlePromoSubmit}
                    error={promoError}
                    isSubmitting={isSubmitting}
                />
            )}

            {/* Case opening animation modal */}
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
