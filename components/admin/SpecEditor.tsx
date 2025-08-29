import React, { useState } from 'react';
import { useContent } from '../../contexts/ContentContext.tsx';
import { useLanguage } from '../../contexts/LanguageContext.tsx';
import type { Spec } from '../../types.ts';
import EditModal from './EditModal.tsx';

const SpecEditor: React.FC = () => {
    const { t } = useLanguage();
    const { specs, updateSpec } = useContent();
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSpec, setEditingSpec] = useState<Spec | null>(null);

    const handleOpenModal = (spec: Spec) => {
        setEditingSpec(spec);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingSpec(null);
    };

    const handleSave = (formData: Record<string, string>) => {
        if (editingSpec) {
            updateSpec({ ...editingSpec, value: formData.value });
        }
        handleCloseModal();
    };

    return (
        <div>
            <h3 className="text-xl font-bold text-white mb-4">{t('admin_page.hardware_specs')}</h3>
            <div className="space-y-2">
                {specs.map(spec => (
                    <div key={spec.id} className="bg-neutral-800/50 p-3 rounded-lg flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-6 h-6 text-purple-400" dangerouslySetInnerHTML={{ __html: spec.icon }} />
                            <div>
                                <p className="font-bold text-white text-sm">{spec.name}</p>
                                <p className="text-neutral-400 text-sm">{spec.value}</p>
                            </div>
                        </div>
                        <button onClick={() => handleOpenModal(spec)} className="text-blue-400 hover:text-blue-300 text-sm font-semibold">{t('admin_page.edit')}</button>
                    </div>
                ))}
            </div>
            
            {isModalOpen && editingSpec && (
                <EditModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    onSave={handleSave}
                    initialData={{ value: editingSpec.value }}
                    fields={[
                        { name: 'value', label: t('admin_page.spec_value'), type: 'text' },
                    ]}
                    title={`${t('admin_page.edit')} ${editingSpec.name}`}
                />
            )}
        </div>
    );
};

export default SpecEditor;
