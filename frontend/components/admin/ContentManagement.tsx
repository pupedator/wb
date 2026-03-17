import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext.tsx';
import GameEditor from './GameEditor.tsx';
import SpecEditor from './SpecEditor.tsx';
import GalleryEditor from './GalleryEditor.tsx';

type ContentSubTab = 'pc_games' | 'ps5_games' | 'ps4_games' | 'gallery' | 'specs';

const ContentManagement: React.FC = () => {
    const { t } = useLanguage();
    const [activeSubTab, setActiveSubTab] = useState<ContentSubTab>('pc_games');

    const SubTabButton: React.FC<{ tabId: ContentSubTab, label: string }> = ({ tabId, label }) => (
        <button
            onClick={() => setActiveSubTab(tabId)}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors whitespace-nowrap ${
                activeSubTab === tabId
                    ? 'bg-purple-700/50 text-white'
                    : 'bg-transparent text-neutral-400 hover:bg-neutral-700/50 hover:text-white'
            }`}
        >
            {label}
        </button>
    );

    const renderActiveSubTab = () => {
        switch (activeSubTab) {
            case 'pc_games':
                return <GameEditor category="games" title={t('admin_page.pc_games')} />;
            case 'ps5_games':
                return <GameEditor category="ps5Games" title={t('admin_page.ps5_games')} />;
            case 'ps4_games':
                return <GameEditor category="ps4Games" title={t('admin_page.ps4_games')} />;
            case 'gallery':
                return <GalleryEditor />;
            case 'specs':
                return <SpecEditor />;
            default:
                return null;
        }
    };

    return (
        <div>
            <div className="flex items-center space-x-2 border-b border-neutral-700 pb-4 mb-6 overflow-x-auto">
                <SubTabButton tabId="pc_games" label={t('admin_page.pc_games')} />
                <SubTabButton tabId="ps5_games" label={t('admin_page.ps5_games')} />
                <SubTabButton tabId="ps4_games" label={t('admin_page.ps4_games')} />
                <SubTabButton tabId="gallery" label={t('admin_page.gallery')} />
                <SubTabButton tabId="specs" label={t('admin_page.hardware_specs')} />
            </div>
            <div>
                {renderActiveSubTab()}
            </div>
        </div>
    );
};

export default ContentManagement;
