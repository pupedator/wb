import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../contexts/LanguageContext.tsx';
import { useContent } from '../../contexts/ContentContext.tsx';
import type { FoodItem, MultilingualText } from '../../types.ts';

/**
 * The FoodEditor component provides full CRUD operations for food items.
 * Admins can add new food items, edit existing ones, delete items, and manage availability.
 */
const FoodEditor: React.FC = () => {
    const { t, language } = useLanguage();
    const { foodItems, addFoodItem, updateFoodItem, deleteFoodItem } = useContent();
    const [isCreating, setIsCreating] = useState(false);
    const [editingItem, setEditingItem] = useState<FoodItem | null>(null);

    // Form state for creating/editing food items
    const [formData, setFormData] = useState<Partial<FoodItem>>({
        name: { en: '', az: '', ru: '' },
        description: { en: '', az: '', ru: '' },
        price: 0,
        image: '',
        category: { en: '', az: '', ru: '' },
        available: true
    });

    // Categorize food items for better display
    const categorizedItems = useMemo(() => {
        const drinks: FoodItem[] = [];
        const snacks: FoodItem[] = [];
        const hotMeals: FoodItem[] = [];
        const other: FoodItem[] = [];

        foodItems.forEach(item => {
            const categoryName = item.category?.[language]?.toLowerCase() || '';
            if (categoryName.includes('drink') || categoryName.includes('içki') || categoryName.includes('напиток')) {
                drinks.push(item);
            } else if (categoryName.includes('snack') || categoryName.includes('qəlyan') || categoryName.includes('закуск')) {
                snacks.push(item);
            } else if (categoryName.includes('meal') || categoryName.includes('yemək') || categoryName.includes('блюд')) {
                hotMeals.push(item);
            } else {
                other.push(item);
            }
        });

        return { drinks, snacks, hotMeals, other };
    }, [foodItems, language]);

    // Handle form field updates
    const handleInputChange = (field: keyof FoodItem, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    // Handle multilingual text updates
    const handleMultilingualChange = (field: 'name' | 'description' | 'category', lang: 'en' | 'az' | 'ru', value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: {
                ...(prev[field] as MultilingualText),
                [lang]: value
            }
        }));
    };

    // Start creating a new food item
    const startCreating = () => {
        setFormData({
            name: { en: '', az: '', ru: '' },
            description: { en: '', az: '', ru: '' },
            price: 0,
            image: '',
            category: { en: '', az: '', ru: '' },
            available: true
        });
        setEditingItem(null);
        setIsCreating(true);
    };

    // Start editing an existing food item
    const startEditing = (item: FoodItem) => {
        setFormData(item);
        setEditingItem(item);
        setIsCreating(true);
    };

    // Cancel creating/editing
    const cancelEditing = () => {
        setIsCreating(false);
        setEditingItem(null);
        setFormData({
            name: { en: '', az: '', ru: '' },
            description: { en: '', az: '', ru: '' },
            price: 0,
            image: '',
            category: { en: '', az: '', ru: '' },
            available: true
        });
    };

    // Save the food item (create or update)
    const saveFoodItem = () => {
        if (!formData.name?.en || !formData.description?.en || !formData.image || formData.price === undefined) {
            alert('Please fill in all required fields (at least English name, description, image, and price)');
            return;
        }

        if (editingItem) {
            // Update existing item
            updateFoodItem({
                ...editingItem,
                ...formData,
                name: formData.name as MultilingualText,
                description: formData.description as MultilingualText,
                category: formData.category as MultilingualText,
            } as FoodItem);
        } else {
            // Create new item
            addFoodItem({
                name: formData.name as MultilingualText,
                description: formData.description as MultilingualText,
                price: formData.price!,
                image: formData.image!,
                category: formData.category as MultilingualText,
                available: formData.available!
            });
        }

        cancelEditing();
    };

    // Delete a food item with confirmation
    const handleDelete = (item: FoodItem) => {
        if (window.confirm(`Are you sure you want to delete "${item.name[language]}"?`)) {
            deleteFoodItem(item.id);
        }
    };

    // Toggle availability of a food item
    const toggleAvailability = (item: FoodItem) => {
        updateFoodItem({
            ...item,
            available: !item.available
        });
    };

    // Render a category section
    const renderCategory = (title: string, items: FoodItem[]) => (
        <div className="mb-8">
            <h3 className="text-xl font-bold text-white mb-4 border-b border-neutral-700 pb-2">
                {title} ({items.length})
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map(item => (
                    <div key={item.id} className="bg-neutral-800 rounded-lg p-4 border border-neutral-700">
                        <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold text-white text-lg">{item.name[language]}</h4>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                                item.available 
                                    ? 'bg-green-900 text-green-300' 
                                    : 'bg-red-900 text-red-300'
                            }`}>
                                {item.available ? 'Available' : 'Unavailable'}
                            </span>
                        </div>
                        <p className="text-neutral-400 text-sm mb-2">{item.description[language]}</p>
                        <div className="flex items-center mb-3">
                            <img 
                                src={item.image} 
                                alt={item.name[language]}
                                className="w-16 h-16 object-cover rounded mr-3"
                            />
                            <div>
                                <p className="text-purple-400 font-bold text-lg">{item.price} AZN</p>
                                <p className="text-neutral-500 text-sm">{item.category?.[language]}</p>
                            </div>
                        </div>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => startEditing(item)}
                                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-sm transition-colors"
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => toggleAvailability(item)}
                                className={`flex-1 px-3 py-1 rounded text-sm transition-colors ${
                                    item.available
                                        ? 'bg-orange-600 hover:bg-orange-500 text-white'
                                        : 'bg-green-600 hover:bg-green-500 text-white'
                                }`}
                            >
                                {item.available ? 'Disable' : 'Enable'}
                            </button>
                            <button
                                onClick={() => handleDelete(item)}
                                className="flex-1 bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded text-sm transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Food & Drinks Management</h2>
                <button
                    onClick={startCreating}
                    className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg transition-colors"
                >
                    + Add New Item
                </button>
            </div>

            {isCreating && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-neutral-900 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <h3 className="text-xl font-bold text-white mb-4">
                            {editingItem ? 'Edit Food Item' : 'Add New Food Item'}
                        </h3>
                        
                        <div className="space-y-4">
                            {/* Name fields */}
                            <div>
                                <label className="block text-white font-medium mb-2">Name</label>
                                <div className="space-y-2">
                                    <input
                                        type="text"
                                        placeholder="English Name*"
                                        value={formData.name?.en || ''}
                                        onChange={(e) => handleMultilingualChange('name', 'en', e.target.value)}
                                        className="w-full bg-neutral-800 border border-neutral-600 rounded px-3 py-2 text-white"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Azerbaijani Name"
                                        value={formData.name?.az || ''}
                                        onChange={(e) => handleMultilingualChange('name', 'az', e.target.value)}
                                        className="w-full bg-neutral-800 border border-neutral-600 rounded px-3 py-2 text-white"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Russian Name"
                                        value={formData.name?.ru || ''}
                                        onChange={(e) => handleMultilingualChange('name', 'ru', e.target.value)}
                                        className="w-full bg-neutral-800 border border-neutral-600 rounded px-3 py-2 text-white"
                                    />
                                </div>
                            </div>

                            {/* Description fields */}
                            <div>
                                <label className="block text-white font-medium mb-2">Description</label>
                                <div className="space-y-2">
                                    <textarea
                                        placeholder="English Description*"
                                        value={formData.description?.en || ''}
                                        onChange={(e) => handleMultilingualChange('description', 'en', e.target.value)}
                                        className="w-full bg-neutral-800 border border-neutral-600 rounded px-3 py-2 text-white"
                                        rows={2}
                                    />
                                    <textarea
                                        placeholder="Azerbaijani Description"
                                        value={formData.description?.az || ''}
                                        onChange={(e) => handleMultilingualChange('description', 'az', e.target.value)}
                                        className="w-full bg-neutral-800 border border-neutral-600 rounded px-3 py-2 text-white"
                                        rows={2}
                                    />
                                    <textarea
                                        placeholder="Russian Description"
                                        value={formData.description?.ru || ''}
                                        onChange={(e) => handleMultilingualChange('description', 'ru', e.target.value)}
                                        className="w-full bg-neutral-800 border border-neutral-600 rounded px-3 py-2 text-white"
                                        rows={2}
                                    />
                                </div>
                            </div>

                            {/* Category fields */}
                            <div>
                                <label className="block text-white font-medium mb-2">Category</label>
                                <div className="space-y-2">
                                    <input
                                        type="text"
                                        placeholder="English Category (e.g., Drinks, Snacks, Hot Meals)"
                                        value={formData.category?.en || ''}
                                        onChange={(e) => handleMultilingualChange('category', 'en', e.target.value)}
                                        className="w-full bg-neutral-800 border border-neutral-600 rounded px-3 py-2 text-white"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Azerbaijani Category"
                                        value={formData.category?.az || ''}
                                        onChange={(e) => handleMultilingualChange('category', 'az', e.target.value)}
                                        className="w-full bg-neutral-800 border border-neutral-600 rounded px-3 py-2 text-white"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Russian Category"
                                        value={formData.category?.ru || ''}
                                        onChange={(e) => handleMultilingualChange('category', 'ru', e.target.value)}
                                        className="w-full bg-neutral-800 border border-neutral-600 rounded px-3 py-2 text-white"
                                    />
                                </div>
                            </div>

                            {/* Price and Image */}
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-white font-medium mb-2">Price (AZN)*</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        value={formData.price || 0}
                                        onChange={(e) => handleInputChange('price', parseFloat(e.target.value))}
                                        className="w-full bg-neutral-800 border border-neutral-600 rounded px-3 py-2 text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-white font-medium mb-2">Image URL*</label>
                                    <input
                                        type="url"
                                        placeholder="https://example.com/image.jpg"
                                        value={formData.image || ''}
                                        onChange={(e) => handleInputChange('image', e.target.value)}
                                        className="w-full bg-neutral-800 border border-neutral-600 rounded px-3 py-2 text-white"
                                    />
                                </div>
                            </div>

                            {/* Availability toggle */}
                            <div>
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        checked={formData.available}
                                        onChange={(e) => handleInputChange('available', e.target.checked)}
                                        className="form-checkbox h-5 w-5 text-purple-600"
                                    />
                                    <span className="text-white">Available for order</span>
                                </label>
                            </div>

                            {/* Image preview */}
                            {formData.image && (
                                <div>
                                    <label className="block text-white font-medium mb-2">Preview</label>
                                    <img
                                        src={formData.image}
                                        alt="Preview"
                                        className="w-32 h-32 object-cover rounded border border-neutral-600"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                        }}
                                    />
                                </div>
                            )}
                        </div>

                        <div className="flex space-x-3 mt-6">
                            <button
                                onClick={saveFoodItem}
                                className="flex-1 bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded transition-colors"
                            >
                                {editingItem ? 'Update Item' : 'Create Item'}
                            </button>
                            <button
                                onClick={cancelEditing}
                                className="flex-1 bg-neutral-600 hover:bg-neutral-500 text-white px-4 py-2 rounded transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Food items by category */}
            <div>
                {renderCategory('Drinks', categorizedItems.drinks)}
                {renderCategory('Snacks', categorizedItems.snacks)}
                {renderCategory('Hot Meals', categorizedItems.hotMeals)}
                {categorizedItems.other.length > 0 && renderCategory('Other Items', categorizedItems.other)}
                
                {foodItems.length === 0 && (
                    <div className="text-center text-neutral-400 py-12">
                        <p className="text-lg">No food items found.</p>
                        <p className="text-sm mt-2">Click "Add New Item" to create your first food item.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FoodEditor;
