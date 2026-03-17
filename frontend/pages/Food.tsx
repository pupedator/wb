import React, { useMemo } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useContent } from '../contexts/ContentContext';
import type { FoodItem } from '../types';

const Food: React.FC = () => {
    const { t, language } = useLanguage();
    const { foodItems, loading } = useContent();
    const currentLang = language;

    // Categorize food items by their category
    const categorizedItems = useMemo(() => {
        if (loading || !foodItems) return { drinks: [], snacks: [], hotMeals: [] };
        
        const drinks: FoodItem[] = [];
        const snacks: FoodItem[] = [];
        const hotMeals: FoodItem[] = [];
        
        foodItems
            .filter(item => item.available)
            .forEach(item => {
                const categoryName = item.category?.[currentLang]?.toLowerCase() || '';
                
                if (categoryName.includes('drink') || categoryName.includes('içki') || categoryName.includes('напиток')) {
                    drinks.push(item);
                } else if (categoryName.includes('snack') || categoryName.includes('qəlyan') || categoryName.includes('закуск')) {
                    snacks.push(item);
                } else if (categoryName.includes('meal') || categoryName.includes('yemək') || categoryName.includes('блюд')) {
                    hotMeals.push(item);
                } else {
                    // Default categorization based on price (rough heuristic)
                    if (item.price <= 5) {
                        drinks.push(item);
                    } else if (item.price <= 8) {
                        snacks.push(item);
                    } else {
                        hotMeals.push(item);
                    }
                }
            });
            
        return { drinks, snacks, hotMeals };
    }, [foodItems, currentLang, loading]);

    const FoodCard: React.FC<{ item: FoodItem }> = ({ item }) => (
        <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-purple-500/20 transition-all duration-300 group">
                <div className="relative overflow-hidden">
                <img
                    src={item.image}
                    alt={item.name[currentLang]}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <div className="p-4">
                <h3 className="text-lg font-bold text-white mb-2">{item.name[currentLang]}</h3>
                <p className="text-gray-400 text-sm mb-3">{item.description[currentLang]}</p>
                <div className="flex justify-between items-center">
                    <span className="text-purple-400 text-xl font-bold">{item.price} AZN</span>
                    <button className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg transition-colors duration-200">
                        Order
                    </button>
                </div>
            </div>
        </div>
    );

    const SectionTitle: React.FC<{ title: string }> = ({ title }) => (
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            <span dangerouslySetInnerHTML={{ __html: title }} />
        </h2>
    );

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Hero Section */}
            <section className="relative py-20 px-4">
                <div className="absolute inset-0 bg-black" />
                <div className="relative max-w-6xl mx-auto text-center">
                    <h1 className="text-5xl md:text-7xl font-bold mb-6">
                        <span dangerouslySetInnerHTML={{ __html: t('food.title') }} />
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
                        {t('food.subtitle')}
                    </p>
                </div>
            </section>

            {/* Drinks Section */}
            <section className="py-16 px-4">
                <div className="max-w-6xl mx-auto">
                    <SectionTitle title={t('food.drinks_title')} />
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {categorizedItems.drinks.map((item) => (
                            <FoodCard key={item.id} item={item} />
                        ))}
                        {categorizedItems.drinks.length === 0 && (
                            <div className="col-span-full text-center text-gray-400 py-8">
                                {t('food.no_items_available') || 'No drinks available at the moment'}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Snacks Section */}
            <section className="py-16 px-4 bg-gray-900/30">
                <div className="max-w-6xl mx-auto">
                    <SectionTitle title={t('food.snacks_title')} />
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {categorizedItems.snacks.map((item) => (
                            <FoodCard key={item.id} item={item} />
                        ))}
                        {categorizedItems.snacks.length === 0 && (
                            <div className="col-span-full text-center text-gray-400 py-8">
                                {t('food.no_items_available') || 'No snacks available at the moment'}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Hot Meals Section */}
            <section className="py-16 px-4">
                <div className="max-w-6xl mx-auto">
                    <SectionTitle title={t('food.hot_meals_title')} />
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {categorizedItems.hotMeals.map((item) => (
                            <FoodCard key={item.id} item={item} />
                        ))}
                        {categorizedItems.hotMeals.length === 0 && (
                            <div className="col-span-full text-center text-gray-400 py-8">
                                {t('food.no_items_available') || 'No hot meals available at the moment'}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Call to Action */}
            <section className="py-20 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-4xl md:text-5xl font-bold mb-8">
                        Ready to Order?
                    </h2>
                    <p className="text-xl text-gray-300 mb-8">
                        Visit our gaming cafe to enjoy these delicious options while playing your favorite games!
                    </p>
                    <a
                        href={t('booking_link')}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block bg-violet-600 hover:bg-violet-500 text-white font-bold py-4 px-8 rounded-lg text-xl transition-colors duration-300 transform hover:scale-105"
                    >
                        Visit Us Now
                    </a>
                </div>
            </section>
        </div>
    );
};

export default Food;
