import React, { createContext, useState, useContext, useEffect, useMemo } from 'react';
import type { Game, Spec, GalleryImage, Case, CaseReward } from '../types.ts';
import { initialContent } from '../i18n/initialContent.ts';

// The key used to store the entire content database in localStorage.
const CONTENT_DB_KEY = 'pixelContentDB';

// --- Interfaces for the Context ---

// Defines the shape of the dynamic content data.
interface ContentData {
    games: Game[];
    ps5Games: Game[];
    ps4Games: Game[];
    specs: Spec[];
    galleryImages: GalleryImage[];
    cases: Case[];
}

// Defines the full shape of the context, including the data and the functions to modify it.
interface ContentContextType extends ContentData {
    updateSpec: (updatedSpec: Spec) => void;
    addGame: (newGame: Omit<Game, 'id'>, category: 'games' | 'ps5Games' | 'ps4Games') => void;
    updateGame: (updatedGame: Game, category: 'games' | 'ps5Games' | 'ps4Games') => void;
    deleteGame: (gameId: string, category: 'games' | 'ps5Games' | 'ps4Games') => void;
    addGalleryImage: (newImage: Omit<GalleryImage, 'id'>) => void;
    deleteGalleryImage: (imageId: string) => void;
    // Functions for managing cases and their rewards
    addCase: (newCase: Omit<Case, 'id' | 'rewards'>) => void;
    updateCase: (updatedCase: Omit<Case, 'rewards'>) => void;
    deleteCase: (caseId: string) => void;
    addRewardToCase: (caseId: string, newReward: Omit<CaseReward, 'id'>) => void;
    updateRewardInCase: (caseId: string, updatedReward: CaseReward) => void;
    deleteRewardFromCase: (caseId: string, rewardId: string) => void;
    loading: boolean; // True until the initial content is loaded from localStorage.
}

// Create the React Context.
const ContentContext = createContext<ContentContextType | undefined>(undefined);

/**
 * A function to get the initial state for the content.
 * It first tries to load from localStorage. If that fails or doesn't exist,
 * it falls back to the default content defined in `initialContent.ts` and saves it.
 */
const getInitialState = (): ContentData => {
    try {
        const storedData = localStorage.getItem(CONTENT_DB_KEY);
        if (storedData) {
            const parsed = JSON.parse(storedData);
            // This is a simple migration check. If a user has old data without the 'cases' key,
            // we add the default cases to their stored data.
            if (!parsed.cases) {
                 parsed.cases = initialContent.en.cases;
            }
            return parsed;
        }
    } catch (error) {
        console.error("Failed to parse content from localStorage", error);
    }
    // If there's no stored data, create it using the initial content for the 'en' language.
    const defaultContent: ContentData = {
        games: initialContent.en.games,
        ps5Games: initialContent.en.ps5Games,
        ps4Games: initialContent.en.ps4Games,
        specs: initialContent.en.specs,
        galleryImages: initialContent.en.galleryImages,
        cases: initialContent.en.cases,
    };
    localStorage.setItem(CONTENT_DB_KEY, JSON.stringify(defaultContent));
    return defaultContent;
};

/**
 * The ContentProvider component manages all editable website content.
 * It provides the content and functions to modify it to any child component.
 * All changes are persisted to localStorage, acting as a simple, client-side CMS.
 */
export const ContentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [content, setContent] = useState<ContentData | null>(null);

    // On initial mount, load the content from localStorage.
    useEffect(() => {
        setContent(getInitialState());
    }, []);

    // A helper function to save the updated content state to both React state and localStorage.
    const saveContent = (newContent: ContentData) => {
        localStorage.setItem(CONTENT_DB_KEY, JSON.stringify(newContent));
        setContent(newContent);
    };

    // --- Content Management Functions ---

    const updateSpec = (updatedSpec: Spec) => {
        if (!content) return;
        const newSpecs = content.specs.map(spec => spec.id === updatedSpec.id ? updatedSpec : spec);
        saveContent({ ...content, specs: newSpecs });
    };

    const addGame = (newGame: Omit<Game, 'id'>, category: 'games' | 'ps5Games' | 'ps4Games') => {
        if (!content) return;
        const gameWithId = { ...newGame, id: `game-${Date.now()}` };
        const gameList = content[category] as Game[];
        const newGameList = [...gameList, gameWithId];
        saveContent({ ...content, [category]: newGameList });
    };

    const updateGame = (updatedGame: Game, category: 'games' | 'ps5Games' | 'ps4Games') => {
        if (!content) return;
        const gameList = content[category] as Game[];
        const newGameList = gameList.map(g => g.id === updatedGame.id ? updatedGame : g);
        saveContent({ ...content, [category]: newGameList });
    };
    
    const deleteGame = (gameId: string, category: 'games' | 'ps5Games' | 'ps4Games') => {
        if (!content) return;
        const gameList = content[category] as Game[];
        const newGameList = gameList.filter(g => g.id !== gameId);
        saveContent({ ...content, [category]: newGameList });
    };
    
    const addGalleryImage = (newImage: Omit<GalleryImage, 'id'>) => {
        if (!content) return;
        const imageWithId = { ...newImage, id: `gallery-${Date.now()}` };
        const newImageList = [...content.galleryImages, imageWithId];
        saveContent({ ...content, galleryImages: newImageList });
    };
    
    const deleteGalleryImage = (imageId: string) => {
        if (!content) return;
        const newImageList = content.galleryImages.filter(img => img.id !== imageId);
        saveContent({ ...content, galleryImages: newImageList });
    };

    const addCase = (newCase: Omit<Case, 'id' | 'rewards'>) => {
        if (!content) return;
        const caseWithId: Case = { ...newCase, id: `case-${Date.now()}`, rewards: [] };
        saveContent({ ...content, cases: [...content.cases, caseWithId] });
    };

    const updateCase = (updatedCase: Omit<Case, 'rewards'>) => {
        if (!content) return;
        const newCases = content.cases.map(c => c.id === updatedCase.id ? { ...c, ...updatedCase } : c);
        saveContent({ ...content, cases: newCases });
    };

    const deleteCase = (caseId: string) => {
        if (!content) return;
        const newCases = content.cases.filter(c => c.id !== caseId);
        saveContent({ ...content, cases: newCases });
    };
    
    const addRewardToCase = (caseId: string, newReward: Omit<CaseReward, 'id'>) => {
        if (!content) return;
        const rewardWithId = { ...newReward, id: `reward-${Date.now()}` };
        const newCases = content.cases.map(c => {
            if (c.id === caseId) {
                return { ...c, rewards: [...c.rewards, rewardWithId] };
            }
            return c;
        });
        saveContent({ ...content, cases: newCases });
    };

    const updateRewardInCase = (caseId: string, updatedReward: CaseReward) => {
        if (!content) return;
        const newCases = content.cases.map(c => {
            if (c.id === caseId) {
                const newRewards = c.rewards.map(r => r.id === updatedReward.id ? updatedReward : r);
                return { ...c, rewards: newRewards };
            }
            return c;
        });
        saveContent({ ...content, cases: newCases });
    };

    const deleteRewardFromCase = (caseId: string, rewardId: string) => {
        if (!content) return;
        const newCases = content.cases.map(c => {
            if (c.id === caseId) {
                const newRewards = c.rewards.filter(r => r.id !== rewardId);
                return { ...c, rewards: newRewards };
            }
            return c;
        });
        saveContent({ ...content, cases: newCases });
    };

    // `useMemo` optimizes performance by ensuring the context value object is not
    // recreated on every render unless the `content` state itself changes.
    const value = useMemo(() => {
        // While content is being loaded from localStorage, provide a loading state.
        if (!content) {
            return {
                games: [], ps5Games: [], ps4Games: [], specs: [], galleryImages: [], cases: [],
                loading: true,
                updateSpec: () => {}, addGame: () => {}, updateGame: () => {},
                deleteGame: () => {}, addGalleryImage: () => {}, deleteGalleryImage: () => {},
                addCase: () => {}, updateCase: () => {}, deleteCase: () => {},
                addRewardToCase: () => {}, updateRewardInCase: () => {}, deleteRewardFromCase: () => {},
            };
        }
        // Once loaded, provide the full content and all the management functions.
        return {
            ...content,
            loading: false,
            updateSpec,
            addGame,
            updateGame,
            deleteGame,
            addGalleryImage,
            deleteGalleryImage,
            addCase,
            updateCase,
            deleteCase,
            addRewardToCase,
            updateRewardInCase,
            deleteRewardFromCase,
        };
    }, [content]);

    return (
        <ContentContext.Provider value={value}>
            {children}
        </ContentContext.Provider>
    );
};

// A custom hook for easy access to the ContentContext.
export const useContent = (): ContentContextType => {
    const context = useContext(ContentContext);
    if (context === undefined) {
        throw new Error('useContent must be used within a ContentProvider');
    }
    return context;
};