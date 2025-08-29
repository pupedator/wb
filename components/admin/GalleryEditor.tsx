import React, { useState } from 'react';
import { useContent } from '../../contexts/ContentContext.tsx';
import { useLanguage } from '../../contexts/LanguageContext.tsx';
import EditModal from './EditModal.tsx';

const GalleryEditor: React.FC = () => {
    const { t } = useLanguage();
    const { galleryImages, addGalleryImage, deleteGalleryImage } = useContent();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleSave = (formData: Record<string, string>) => {
        addGalleryImage({ src: formData.src });
        setIsModalOpen(false);
    };

    const handleDelete = (imageId: string) => {
        if (window.confirm(t('admin_page.confirm_delete'))) {
            deleteGalleryImage(imageId);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">{t('admin_page.gallery')}</h3>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
                >
                    {t('admin_page.add_new')}
                </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-96 overflow-y-auto pr-2">
                {galleryImages.map(image => (
                    <div key={image.id} className="relative group aspect-square">
                        <img src={image.src} alt="Gallery image" className="w-full h-full object-cover rounded-lg" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                            <button onClick={() => handleDelete(image.id)} className="text-red-400 hover:text-red-300 font-bold">{t('admin_page.delete')}</button>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <EditModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSave}
                    initialData={{ src: '' }}
                    fields={[{ name: 'src', label: t('admin_page.image_url'), type: 'text' }]}
                    title={`${t('admin_page.add_new')} Image`}
                />
            )}
        </div>
    );
};

export default GalleryEditor;
