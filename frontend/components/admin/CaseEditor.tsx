import React, { useState, useMemo } from 'react';
import { useContent } from '../../contexts/ContentContext.tsx';
import { useLanguage } from '../../contexts/LanguageContext.tsx';
import type { Case, CaseReward } from '../../types.ts';
import EditModal from './EditModal.tsx';

const CaseRewardsEditor: React.FC<{ caseItem: Case }> = ({ caseItem }) => {
    const { t } = useLanguage();
    const { addRewardToCase, updateRewardInCase, deleteRewardFromCase } = useContent();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingReward, setEditingReward] = useState<CaseReward | null>(null);
    
    const rarities: CaseReward['rarity'][] = ['common', 'uncommon', 'rare', 'legendary'];

    const totalChance = useMemo(() => {
        return caseItem.rewards.reduce((sum, reward) => sum + reward.chance, 0);
    }, [caseItem.rewards]);

    const handleOpenModal = (reward: CaseReward | null = null) => {
        setEditingReward(reward);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingReward(null);
    };
    
    const handleSave = (formData: Record<string, string>) => {
        const rewardData = {
            name: formData.name,
            image: formData.image,
            rarity: formData.rarity as CaseReward['rarity'],
            chance: parseFloat(formData.chance),
        };
        
        if (editingReward) {
            updateRewardInCase(caseItem.id, { ...editingReward, ...rewardData });
        } else {
            addRewardToCase(caseItem.id, rewardData);
        }
        handleCloseModal();
    };
    
    const handleDelete = (rewardId: string) => {
        if (window.confirm(t('admin_page.confirm_delete'))) {
            deleteRewardFromCase(caseItem.id, rewardId);
        }
    };

    return (
        <div className="bg-neutral-800/50 p-4 rounded-b-lg">
             <div className="flex justify-between items-center mb-3">
                <h4 className="text-md font-bold text-neutral-300">{t('admin_page.rewards')}</h4>
                 <div className="flex items-center space-x-4">
                    <span className={`text-xs font-mono ${totalChance !== 100 ? 'text-yellow-400' : 'text-green-400'}`}>
                        Total Chance: {totalChance.toFixed(2)}%
                    </span>
                    <button onClick={() => handleOpenModal(null)} className="bg-purple-700/80 hover:bg-purple-700 text-white font-semibold py-1 px-3 rounded-md transition-colors text-xs">
                        {t('admin_page.add_new_reward')}
                    </button>
                </div>
            </div>
            <div className="space-y-2">
                {caseItem.rewards.map(reward => (
                    <div key={reward.id} className="bg-neutral-900 p-2 rounded-md flex items-center justify-between">
                         <div className="flex items-center space-x-3">
                            <img src={reward.image} alt={reward.name} className="w-8 h-8 object-contain rounded-md" />
                            <span className="text-white text-xs font-medium">{reward.name} ({reward.rarity}, {reward.chance}%)</span>
                        </div>
                        <div className="space-x-2">
                            <button onClick={() => handleOpenModal(reward)} className="text-blue-400 hover:text-blue-300 text-xs font-semibold">{t('admin_page.edit')}</button>
                            <button onClick={() => handleDelete(reward.id)} className="text-red-400 hover:text-red-300 text-xs font-semibold">{t('admin_page.delete')}</button>
                        </div>
                    </div>
                ))}
                 {caseItem.rewards.length === 0 && <p className="text-center text-xs text-neutral-500 py-2">No rewards yet.</p>}
            </div>
             {isModalOpen && (
                <EditModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    onSave={handleSave}
                    initialData={editingReward 
                        ? { name: editingReward.name, image: editingReward.image, rarity: editingReward.rarity, chance: String(editingReward.chance) } 
                        : { name: '', image: '', rarity: 'common', chance: '0' }}
                    fields={[
                        { name: 'name', label: t('admin_page.reward_name'), type: 'text' },
                        { name: 'image', label: t('admin_page.image_url'), type: 'text' },
                        { name: 'rarity', label: t('admin_page.rarity'), type: 'select', options: rarities },
                        { name: 'chance', label: t('admin_page.chance'), type: 'number' },
                    ]}
                    title={editingReward ? `${t('admin_page.edit')} ${editingReward.name}` : `${t('admin_page.add_new_reward')}`}
                />
            )}
        </div>
    );
};

const CaseEditor: React.FC = () => {
    const { t } = useLanguage();
    const { cases, addCase, updateCase, deleteCase } = useContent();
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCase, setEditingCase] = useState<Case | null>(null);
    const [expandedCaseId, setExpandedCaseId] = useState<string | null>(null);

    const handleOpenModal = (caseItem: Case | null = null) => {
        setEditingCase(caseItem);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingCase(null);
    };

    const handleSave = (formData: Record<string, string>) => {
        if (editingCase) {
            updateCase({ id: editingCase.id, name: formData.name, image: formData.image, price: formData.price });
        } else {
            addCase({ name: formData.name, image: formData.image, price: formData.price });
        }
        handleCloseModal();
    };

    const handleDelete = (caseId: string) => {
        if (window.confirm(t('admin_page.confirm_delete'))) {
            deleteCase(caseId);
        }
    };

    const toggleExpand = (caseId: string) => {
        setExpandedCaseId(prevId => (prevId === caseId ? null : caseId));
    };
    
    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">{t('admin_page.case_management')}</h3>
                <button
                    onClick={() => handleOpenModal(null)}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
                >
                    {t('admin_page.add_new_case')}
                </button>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                {cases.map(caseItem => (
                    <div key={caseItem.id}>
                        <div className="bg-neutral-800/50 p-3 rounded-t-lg flex items-center justify-between cursor-pointer" onClick={() => toggleExpand(caseItem.id)}>
                            <div className="flex items-center space-x-3">
                                <img src={caseItem.image} alt={caseItem.name} className="w-16 h-10 object-contain rounded-md" />
                                <div>
                                    <span className="text-white text-sm font-medium">{caseItem.name}</span>
                                    <p className="text-xs text-neutral-400">{caseItem.price}</p>
                                </div>
                            </div>
                            <div className="space-x-3">
                                <button onClick={(e) => { e.stopPropagation(); handleOpenModal(caseItem); }} className="text-blue-400 hover:text-blue-300 text-sm font-semibold">{t('admin_page.edit')}</button>
                                <button onClick={(e) => { e.stopPropagation(); handleDelete(caseItem.id); }} className="text-red-400 hover:text-red-300 text-sm font-semibold">{t('admin_page.delete')}</button>
                            </div>
                        </div>
                        {expandedCaseId === caseItem.id && <CaseRewardsEditor caseItem={caseItem} />}
                    </div>
                ))}
            </div>
            
            {isModalOpen && (
                <EditModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    onSave={handleSave}
                    initialData={editingCase ? { name: editingCase.name, image: editingCase.image, price: editingCase.price } : { name: '', image: '', price: ''}}
                    fields={[
                        { name: 'name', label: t('admin_page.case_name'), type: 'text' },
                        { name: 'image', label: t('admin_page.image_url'), type: 'text' },
                        { name: 'price', label: t('admin_page.price'), type: 'text' },
                    ]}
                    title={editingCase ? `${t('admin_page.edit')} ${editingCase.name}` : `${t('admin_page.add_new_case')}`}
                />
            )}
        </div>
    );
};

export default CaseEditor;