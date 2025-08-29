import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext.tsx';
import type { Case } from '../types.ts';

const DropRatesModal: React.FC<{ caseData: Case, onClose: () => void }> = ({ caseData, onClose }) => {
    const { t } = useLanguage();
    const rarityColor: Record<string, string> = {
        common: 'text-neutral-300',
        uncommon: 'text-green-400',
        rare: 'text-blue-400',
        legendary: 'text-purple-400',
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4" onClick={onClose}>
            <div className="bg-neutral-900 border border-purple-500/30 rounded-lg p-6 max-w-md w-full animate-fade-in" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-2xl font-bold text-white mb-4">{caseData.name} - {t('cases.drops_button')}</h3>
                <ul className="space-y-2 max-h-60 overflow-y-auto pr-2">
                    {caseData.rewards
                        .sort((a, b) => b.chance - a.chance)
                        .map((reward, index) => (
                        <li key={index} className="flex justify-between items-center text-lg">
                            <span className={`${rarityColor[reward.rarity]} font-semibold`}>{reward.name}</span>
                            <span className="font-mono text-neutral-400">{reward.chance.toFixed(2)}%</span>
                        </li>
                    ))}
                </ul>
                <button onClick={onClose} className="mt-6 w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
                    {t('cases.close_button')}
                </button>
            </div>
        </div>
    );
};


const CaseCard: React.FC<{ caseData: Case, onOpen: () => void }> = ({ caseData, onOpen }) => {
    const { t } = useLanguage();
    const [isDropsModalOpen, setIsDropsModalOpen] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    const handleOpen = () => {
        if (isAnimating) return;
        setIsAnimating(true);
        onOpen();
        setTimeout(() => setIsAnimating(false), 300);
    };
    
    return (
        <>
            <div className={`bg-neutral-900/50 border border-neutral-800 rounded-xl p-6 flex flex-col items-center text-center transition-all duration-300 hover:border-purple-500 hover:shadow-2xl hover:shadow-purple-600/20 transform hover:-translate-y-2 ${isAnimating ? 'animate-brief-press' : ''}`}>
                <img src={caseData.image} alt={caseData.name} className="w-48 h-48 object-contain mb-4 drop-shadow-[0_5px_15px_rgba(147,51,234,0.2)]" />
                <h3 className="text-2xl font-bold text-white mb-2">{caseData.name}</h3>
                <p className="text-lg font-semibold text-purple-400 mb-6">{caseData.price}</p>
                <div className="w-full mt-auto">
                    <button onClick={handleOpen} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg mb-3 transition-transform transform hover:scale-105">
                        {t('cases.open_button')}
                    </button>
                    <button onClick={() => setIsDropsModalOpen(true)} className="w-full bg-transparent hover:bg-neutral-800 text-neutral-300 font-semibold py-2 rounded-lg transition-colors">
                        {t('cases.drops_button')}
                    </button>
                </div>
            </div>
            {isDropsModalOpen && <DropRatesModal caseData={caseData} onClose={() => setIsDropsModalOpen(false)} />}
        </>
    );
};

export default CaseCard;