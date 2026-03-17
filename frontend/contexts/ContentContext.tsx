import React, { createContext, useState, useContext, useEffect, useMemo } from 'react';
import type { Game, Spec, GalleryImage, Case, CaseReward, FoodItem } from '../types.ts';
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
    foodItems: FoodItem[];
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
    // Functions for managing food items
    addFoodItem: (newFoodItem: Omit<FoodItem, 'id' | 'createdAt'>) => void;
    updateFoodItem: (updatedFoodItem: FoodItem) => void;
    deleteFoodItem: (foodItemId: string) => void;
    loading: boolean; // True until the initial content is loaded from localStorage.
}

// Create the React Context.
const ContentContext = createContext<ContentContextType | undefined>(undefined);

/**
 * A function to get the initial state for the content.
 * It first tries to load from localStorage. If that fails or doesn't exist,
 * it falls back to the default content defined in `initialContent.ts` and saves it.
 */
// Default food items data
const getDefaultFoodItems = (): FoodItem[] => [
    {
        id: 'drink-1',
        name: {
            en: 'Red Bull Energy Drink',
            az: 'Red Bull Enerji İçkisi',
            ru: 'Red Bull Энергетический напиток'
        },
        description: {
            en: 'Premium energy drink for gaming sessions',
            az: 'Oyun sessiyaları üçün premium enerji içkisi',
            ru: 'Премиум энергетический напиток для игровых сессий'
        },
        price: 3,
        image: 'https://i.ibb.co/PQtL4gG/redbull.png',
        category: {
            en: 'Drinks',
            az: 'İçkilər',
            ru: 'Напитки'
        },
        available: true,
        createdAt: new Date().toISOString()
    },
    {
        id: 'drink-2',
        name: {
            en: 'Coca Cola',
            az: 'Kola',
            ru: 'Кока-Кола'
        },
        description: {
            en: 'Classic refreshing cola',
            az: 'Klassik təravətli kola',
            ru: 'Классическая освежающая кола'
        },
        price: 2,
        image: 'https://i.ibb.co/9vGzZzW/cola.png',
        category: {
            en: 'Drinks',
            az: 'İçkilər',
            ru: 'Напитки'
        },
        available: true,
        createdAt: new Date().toISOString()
    },
    {
        id: 'drink-3',
        name: {
            en: 'Mountain Dew',
            az: 'Mountain Dew',
            ru: 'Маунтин Дью'
        },
        description: {
            en: 'Citrus flavored energy drink',
            az: 'Sitrus əli enerji içkisi',
            ru: 'Цитрусовый энергетический напиток'
        },
        price: 2.5,
        image: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=200&h=200&fit=crop',
        category: {
            en: 'Drinks',
            az: 'İçkilər',
            ru: 'Напитки'
        },
        available: true,
        createdAt: new Date().toISOString()
    },
    {
        id: 'drink-4',
        name: {
            en: 'Fresh Orange Juice',
            az: 'Təzə Portağal Şirəsi',
            ru: 'Свежий апельсиновый сок'
        },
        description: {
            en: 'Fresh squeezed orange juice',
            az: 'Təzə sıxılmış portağal şirəsi',
            ru: 'Свежевыжатый апельсиновый сок'
        },
        price: 4,
        image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=200&h=200&fit=crop',
        category: {
            en: 'Drinks',
            az: 'İçkilər',
            ru: 'Напитки'
        },
        available: true,
        createdAt: new Date().toISOString()
    },
    {
        id: 'snack-1',
        name: {
            en: 'Gaming Mix Chips',
            az: 'Oyun Çipsləri',
            ru: 'Игровые чипсы'
        },
        description: {
            en: 'Perfect snack for long gaming sessions',
            az: 'Uzun oyun sessiyaları üçün mükəmməl qəlyanaltı',
            ru: 'Идеальная закуска для долгих игровых сессий'
        },
        price: 3.5,
        image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=200&h=200&fit=crop',
        category: {
            en: 'Snacks',
            az: 'Qəlyanaltılar',
            ru: 'Закуски'
        },
        available: true,
        createdAt: new Date().toISOString()
    },
    {
        id: 'snack-2',
        name: {
            en: 'Energy Bars',
            az: 'Enerji Barları',
            ru: 'Энергетические батончики'
        },
        description: {
            en: 'High-energy protein bars',
            az: 'Yüksək enerjili protein barları',
            ru: 'Высокоэнергетические протеиновые батончики'
        },
        price: 4,
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop',
        category: {
            en: 'Snacks',
            az: 'Qəlyanaltılar',
            ru: 'Закуски'
        },
        available: true,
        createdAt: new Date().toISOString()
    },
    {
        id: 'meal-1',
        name: {
            en: 'Gamer Pizza Slice',
            az: 'Oyunçu Pizza Dilimi',
            ru: 'Геймерский кусок пиццы'
        },
        description: {
            en: 'Hot pizza slice with your choice of toppings',
            az: 'Seçdiyiniz əlavələrlə isti pizza dilimi',
            ru: 'Горячий кусок пиццы с выбранными топпингами'
        },
        price: 8,
        image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200&h=200&fit=crop',
        category: {
            en: 'Hot Meals',
            az: 'İsti Yeməklər',
            ru: 'Горячие блюда'
        },
        available: true,
        createdAt: new Date().toISOString()
    },
    {
        id: 'meal-2',
        name: {
            en: 'Gaming Burger',
            az: 'Oyun Burgeri',
            ru: 'Геймерский бургер'
        },
        description: {
            en: 'Juicy burger with fries',
            az: 'Kartof qızartması ilə şirəli burger',
            ru: 'Сочный бургер с картофелем фри'
        },
        price: 12,
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&h=200&fit=crop',
        category: {
            en: 'Hot Meals',
            az: 'İsti Yeməklər',
            ru: 'Горячие блюда'
        },
        available: true,
        createdAt: new Date().toISOString()
    }
];

const getInitialState = (): ContentData => {
    try {
        const storedData = localStorage.getItem(CONTENT_DB_KEY);
        if (storedData) {
            const parsed = JSON.parse(storedData);
            // This is a simple migration check. If a user has old data without new keys,
            // we add the default data to their stored data.
            if (!parsed.cases) {
                 parsed.cases = initialContent.en.cases;
            }
            if (!parsed.foodItems) {
                parsed.foodItems = getDefaultFoodItems();
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
        foodItems: getDefaultFoodItems(),
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

    // Food items management functions
    const addFoodItem = (newFoodItem: Omit<FoodItem, 'id' | 'createdAt'>) => {
        if (!content) return;
        const foodItemWithId: FoodItem = {
            ...newFoodItem,
            id: `food-${Date.now()}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        saveContent({ ...content, foodItems: [...content.foodItems, foodItemWithId] });
    };

    const updateFoodItem = (updatedFoodItem: FoodItem) => {
        if (!content) return;
        const newFoodItems = content.foodItems.map(item => 
            item.id === updatedFoodItem.id 
                ? { ...updatedFoodItem, updatedAt: new Date().toISOString() }
                : item
        );
        saveContent({ ...content, foodItems: newFoodItems });
    };

    const deleteFoodItem = (foodItemId: string) => {
        if (!content) return;
        const newFoodItems = content.foodItems.filter(item => item.id !== foodItemId);
        saveContent({ ...content, foodItems: newFoodItems });
    };

    // `useMemo` optimizes performance by ensuring the context value object is not
    // recreated on every render unless the `content` state itself changes.
    const value = useMemo(() => {
        // While content is being loaded from localStorage, provide a loading state.
        if (!content) {
            return {
                games: [], ps5Games: [], ps4Games: [], specs: [], galleryImages: [], cases: [], foodItems: [],
                loading: true,
                updateSpec: () => {}, addGame: () => {}, updateGame: () => {},
                deleteGame: () => {}, addGalleryImage: () => {}, deleteGalleryImage: () => {},
                addCase: () => {}, updateCase: () => {}, deleteCase: () => {},
                addRewardToCase: () => {}, updateRewardInCase: () => {}, deleteRewardFromCase: () => {},
                addFoodItem: () => {}, updateFoodItem: () => {}, deleteFoodItem: () => {},
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
            addFoodItem,
            updateFoodItem,
            deleteFoodItem,
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