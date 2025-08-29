import React, { createContext, useState, useContext, useMemo } from 'react';
import { translations } from '../i18n/translations.ts';
import type { Game, FAQ, ResidentPlan, Spec, GalleryImage, PricingPlan, Case, UserProfile } from '../types.ts';
import { useContent } from './ContentContext.tsx';

// Define the available languages for the application.
type Language = 'en' | 'az' | 'ru';

// Define the shape of the context that will be provided to consuming components.
interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string; // The translation function.
  // The following properties are derived from the current language's translation data.
  navLinks: { id: string, label: string }[];
  residentPlans: ResidentPlan[];
  games: Game[];
  ps5Games: Game[];
  ps4Games: Game[];
  faqs: FAQ[];
  partners: { src: string, alt: string }[];
  specs: Spec[];
  galleryImages: GalleryImage[];
  playstationImages: GalleryImage[];
  bookingLink: string;
  pricingPlans: PricingPlan[];
  casesData: Case[];
  userProfile: UserProfile; // Note: This is a static profile, mainly for admin.
}

// Create the React Context.
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

/**
 * The LanguageProvider component wraps parts of the app that need access to language settings and translations.
 * It manages the current language state and provides the translation function `t` and language-specific content.
 */
export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State to hold the currently selected language. 'az' is the default.
  const [language, setLanguage] = useState<Language>('az');
  // Use the ContentContext to get dynamically managed content (e.g., from an admin panel).
  const content = useContent();

  /**
   * The translation function `t`.
   * @param key A dot-separated string representing the path to the translation key (e.g., 'hero.title').
   * @returns The translated string for the current language. If not found, it falls back to English, then to the key itself.
   */
  const t = (key: string): string => {
    const keys = key.split('.');
    let result: any = translations[language];
    // Traverse the translation object to find the string.
    for (const k of keys) {
        result = result?.[k];
        if (result === undefined) {
            // Fallback to English if the translation is missing in the current language.
            let fallbackResult: any = translations.en;
            for (const fk of keys) {
                fallbackResult = fallbackResult?.[fk];
            }
            return fallbackResult || key; // If English is also missing, return the key.
        }
    }
    return result || key;
  };
  
  // `useMemo` is used to optimize performance. The context value is only recalculated
  // when the `language` or `content` from the ContentContext changes.
  const value = useMemo(() => {
    const currentTranslations = translations[language];
    
    // Check if the current language is English.
    const isEnglish = language === 'en';
    
    // This is a key feature:
    // If the language is English, we use the dynamic, editable content from ContentContext.
    // For other languages (AZ, RU), we use the static, hardcoded translations from `translations.ts`.
    // This allows an admin to edit content for the primary language (English) without affecting the other languages.
    return {
        language,
        setLanguage,
        t,
        navLinks: currentTranslations.nav_links,
        residentPlans: currentTranslations.resident_plans_data,
        games: isEnglish && content ? content.games : currentTranslations.games_data,
        ps5Games: isEnglish && content ? content.ps5Games : currentTranslations.ps5_games_data,
        ps4Games: isEnglish && content ? content.ps4Games : currentTranslations.ps4_games_data,
        faqs: currentTranslations.faq_data,
        partners: currentTranslations.partner_logos,
        specs: isEnglish && content ? content.specs : currentTranslations.specs_data,
        galleryImages: isEnglish && content ? content.galleryImages : currentTranslations.gallery_images_data,
        playstationImages: currentTranslations.playstation_images_data,
        bookingLink: currentTranslations.booking_link,
        pricingPlans: currentTranslations.pricing_plans_data,
        casesData: isEnglish && content ? content.cases : currentTranslations.cases_data,
        userProfile: currentTranslations.user_profile,
    };
  }, [language, content]);

  // Provide the calculated value to all children components.
  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

/**
 * A custom hook `useLanguage` for easy access to the LanguageContext.
 * This avoids having to use `useContext(LanguageContext)` in every component.
 */
export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};