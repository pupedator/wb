import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { useContent } from '../../contexts/ContentContext.tsx';
import { useLanguage } from '../../contexts/LanguageContext.tsx';
import type { PromoCode } from '../../types.ts';
import EditModal from './EditModal.tsx';

const PromoEditor: React.FC = () => {
    const { t } = useLanguage();
    const { getPromoCodes, generatePromoCode } = useAuth();
    const { cases } = useContent();
    
    const [promos, setPromos] = useState<PromoCode[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    const loadPromoCodes = async () => {
        try {
            const codes = await getPromoCodes();
            setPromos(codes);
        } catch (error) {
            console.error('Failed to load promo codes:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPromoCodes();
    }, []);

    const handleGenerate = async (formData: Record<string, string>) => {
        const caseId = formData.caseId;
        if (!caseId) {
            alert('Please select a case.');
            return;
        }
        
        const result = await generatePromoCode(caseId);
        if (result.success) {
            await loadPromoCodes(); // Refresh list
            setIsModalOpen(false);
            alert(`Promo code generated: ${result.code}`);
        } else {
            alert(`Error: ${result.message}`);
        }
    };

    const getCaseName = (caseId: string) => {
        const caseItem = cases.find(c => c.id === caseId);
        return caseItem ? caseItem.name : 'Unknown Case';
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">{t('admin_page.promo_management')}</h3>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
                >
                    {t('admin_page.generate_new')}
                </button>
            </div>

            <div className="overflow-x-auto max-h-96">
                <table className="min-w-full divide-y divide-neutral-700">
                    <thead className="bg-neutral-800/50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">{t('admin_page.promo_code')}</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">{t('admin_page.assigned_case')}</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">{t('admin_page.created_at')}</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">{t('admin_page.status')}</th>
                        </tr>
                    </thead>
                    <tbody className="bg-neutral-900/50 divide-y divide-neutral-800">
                        {promos.map(promo => (
                            <tr key={promo.code}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-white">{promo.code}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-300">{getCaseName(promo.caseId)}</td>
                                 <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-400">{new Date(promo.createdAt).toLocaleDateString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${promo.status === 'used' ? 'bg-yellow-900 text-yellow-300' : 'bg-green-900 text-green-300'}`}>
                                        {promo.status === 'used' ? t('admin_page.used') : t('admin_page.active')}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <EditModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleGenerate}
                    initialData={{ caseId: cases[0]?.id || '' }}
                    fields={[
                        { 
                            name: 'caseId', 
                            label: t('admin_page.assigned_case'), 
                            type: 'select', 
                            options: cases.map(c => ({ value: c.id, label: c.name }))
                        }
                    ]}
                    title={t('admin_page.generate_new')}
                />
            )}
        </div>
    );
};

export default PromoEditor;
