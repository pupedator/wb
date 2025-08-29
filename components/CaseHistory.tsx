import React from 'react';
import { useLanguage } from '../contexts/LanguageContext.tsx';
import type { CaseHistoryItem } from '../types.ts';

const RarityStyles: Record<string, { border: string; text: string }> = {
    common: { border: 'border-neutral-500', text: 'text-neutral-200' },
    uncommon: { border: 'border-green-500', text: 'text-green-300' },
    rare: { border: 'border-blue-500', text: 'text-blue-300' },
    legendary: { border: 'border-purple-500', text: 'text-purple-300' },
};

const CaseHistory: React.FC<{ history: CaseHistoryItem[] }> = ({ history }) => {
    const { t } = useLanguage();
    if (!history || history.length === 0) {
        return (
            <div className="text-center text-neutral-500 mt-8 p-8 bg-neutral-900/30 rounded-lg">
                <p>{t('cases_page.no_history')}</p>
            </div>
        );
    }

    return (
        <div className="space-y-4 max-h-[40rem] overflow-y-auto pr-2">
            {history.map((item, index) => (
                <div key={index} className={`bg-neutral-900/50 border-l-4 ${RarityStyles[item.rewardRarity].border} p-4 rounded-r-lg flex items-center justify-between animate-fade-in`}>
                    <div className="flex items-center space-x-4">
                        <img src={item.rewardImage} alt={item.rewardName} className="w-12 h-12 object-contain" />
                        <div>
                            <p className={`font-bold text-lg ${RarityStyles[item.rewardRarity].text}`}>{item.rewardName}</p>
                            <p className="text-neutral-400 text-sm">from {item.caseName}</p>
                        </div>
                    </div>
                    <p className="text-neutral-500 text-xs">{new Date(item.date).toLocaleString()}</p>
                </div>
            ))}
        </div>
    );
};

export default CaseHistory;
