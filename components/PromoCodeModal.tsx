import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext.tsx';
import type { Case } from '../types.ts';

interface PromoCodeModalProps {
    caseData: Case;
    onClose: () => void;
    onSubmit: (code: string) => void;
    error: string;
    isSubmitting: boolean;
}

const PromoCodeModal: React.FC<PromoCodeModalProps> = ({ caseData, onClose, onSubmit, error, isSubmitting }) => {
    const { t } = useLanguage();
    const [promoInput, setPromoInput] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(promoInput);
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4" onClick={onClose}>
            <div className="bg-neutral-900 border border-purple-500/30 rounded-lg p-6 max-w-sm w-full animate-fade-in" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-2xl font-bold text-white mb-4 text-center">
                    {t('cases_page.promo_modal_title').replace('{caseName}', caseData.name)}
                </h3>
                <img src={caseData.image} alt={caseData.name} className="w-32 h-32 object-contain mx-auto my-4 drop-shadow-[0_5px_15px_rgba(147,51,234,0.15)]"/>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex items-center bg-neutral-950 border-2 border-neutral-700 rounded-lg focus-within:border-purple-500 transition-colors p-2">
                        <input 
                            type="text"
                            value={promoInput}
                            onChange={(e) => setPromoInput(e.target.value)}
                            placeholder={t('cases_page.promo_placeholder')}
                            className="w-full bg-transparent text-white placeholder-neutral-500 focus:outline-none px-4 py-2"
                            aria-label={t('cases_page.promo_placeholder')}
                        />
                         <button type="submit" disabled={isSubmitting || !promoInput} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-md transition-colors disabled:bg-neutral-600 disabled:cursor-not-allowed">
                            {t('cases.open_button')}
                        </button>
                    </div>
                    {error && <p className="text-red-500 text-center mt-2">{error}</p>}
                </form>
                 <button onClick={onClose} className="mt-6 w-full bg-transparent hover:bg-neutral-800 text-neutral-300 font-semibold py-2 rounded-lg transition-colors">
                    {t('cases.close_button')}
                </button>
            </div>
        </div>
    );
};

export default PromoCodeModal;
