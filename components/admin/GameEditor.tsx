import React, { useState } from 'react';
import { useContent } from '../../contexts/ContentContext.tsx';
import { useLanguage } from '../../contexts/LanguageContext.tsx';
import type { Game } from '../../types.ts';
import EditModal from './EditModal.tsx';

interface GameEditorProps {
    category: 'games' | 'ps5Games' | 'ps4Games';
    title: string;
}

const GameEditor: React.FC<GameEditorProps> = ({ category, title }) => {
    const { t } = useLanguage();
    const content = useContent();
    const games = content[category];
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingGame, setEditingGame] = useState<Game | null>(null);

    const handleOpenModal = (game: Game | null = null) => {
        setEditingGame(game);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingGame(null);
    };

    const handleSave = (formData: Record<string, string>) => {
        if (editingGame) {
            content.updateGame({ ...editingGame, title: formData.title, image: formData.image }, category);
        } else {
            content.addGame({ title: formData.title, image: formData.image }, category);
        }
        handleCloseModal();
    };

    const handleDelete = (gameId: string) => {
        if (window.confirm(t('admin_page.confirm_delete'))) {
            content.deleteGame(gameId, category);
        }
    };
    
    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">{title}</h3>
                <button
                    onClick={() => handleOpenModal(null)}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
                >
                    {t('admin_page.add_new')}
                </button>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                {games.map(game => (
                    <div key={game.id} className="bg-neutral-800/50 p-3 rounded-lg flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <img src={game.image} alt={game.title} className="w-16 h-10 object-cover rounded-md" />
                            <span className="text-white text-sm font-medium">{game.title}</span>
                        </div>
                        <div className="space-x-3">
                            <button onClick={() => handleOpenModal(game)} className="text-blue-400 hover:text-blue-300 text-sm font-semibold">{t('admin_page.edit')}</button>
                            <button onClick={() => handleDelete(game.id)} className="text-red-400 hover:text-red-300 text-sm font-semibold">{t('admin_page.delete')}</button>
                        </div>
                    </div>
                ))}
            </div>
            
            {isModalOpen && (
                <EditModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    onSave={handleSave}
                    initialData={editingGame ? { title: editingGame.title, image: editingGame.image } : { title: '', image: ''}}
                    fields={[
                        { name: 'title', label: t('admin_page.title_label'), type: 'text' },
                        { name: 'image', label: t('admin_page.image_url'), type: 'text' },
                    ]}
                    title={editingGame ? `${t('admin_page.edit')} ${editingGame.title}` : `${t('admin_page.add_new')} Game`}
                />
            )}
        </div>
    );
};

export default GameEditor;
