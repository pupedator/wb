import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext.tsx';

interface FieldConfig {
    name: string;
    label: string;
    type: 'text' | 'number' | 'textarea' | 'select';
    options?: { value: string; label: string }[] | string[];
}

interface EditModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (formData: Record<string, string>) => void;
    initialData: Record<string, string>;
    fields: FieldConfig[];
    title: string;
}

const EditModal: React.FC<EditModalProps> = ({ isOpen, onClose, onSave, initialData, fields, title }) => {
    const { t } = useLanguage();
    const [formData, setFormData] = useState(initialData);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    const renderField = (field: FieldConfig) => {
        const commonProps = {
            id: field.name,
            name: field.name,
            value: formData[field.name],
            onChange: handleChange,
            required: true,
            className: "w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors",
        };

        if (field.type === 'select') {
            return (
                <select {...commonProps}>
                    {field.options?.map(opt => {
                        const value = typeof opt === 'string' ? opt : opt.value;
                        const label = typeof opt === 'string' ? opt : opt.label;
                        return <option key={value} value={value}>{label}</option>;
                    })}
                </select>
            );
        }
        
        return <input {...commonProps} type={field.type} />;
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4" onClick={onClose}>
            <div className="bg-neutral-900 border border-purple-500/30 rounded-lg p-6 max-w-md w-full animate-fade-in" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-2xl font-bold text-white mb-6">{title}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {fields.map(field => (
                        <div key={field.name}>
                            <label htmlFor={field.name} className="block text-sm font-medium text-neutral-300 mb-2">{field.label}</label>
                            {renderField(field)}
                        </div>
                    ))}
                    <div className="flex justify-end space-x-4 pt-4">
                        <button type="button" onClick={onClose} className="bg-neutral-700 hover:bg-neutral-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
                            {t('admin_page.cancel')}
                        </button>
                        <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
                            {t('admin_page.save')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditModal;
