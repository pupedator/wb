import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext.tsx';

interface HeroContentData {
  mainTitle: string;
  subtitle: string;
  description: string;
  buttonText: string;
  stat1Value: string;
  stat1Label: string;
  stat2Value: string;
  stat2Label: string;
  stat3Value: string;
  stat3Label: string;
}

/**
 * HeroContentEditor allows admins to customize all text content in the hero section
 */
const HeroContentEditor: React.FC = () => {
  const { t } = useLanguage();
  const [heroContent, setHeroContent] = useState<HeroContentData>({
    mainTitle: 'Gaming Cafe',
    subtitle: 'OYUN KAFESİ',
    description: 'Rəqəbətli oyun və immersiv təcrübələr üçün sizin asas mərkəziniz. Yüksək səviyyəli avadanlıqlar, sürətli internet və oyunçular cəmiyyəti sizi gözləyir.',
    buttonText: 'PC Rezerv Et',
    stat1Value: '24/7',
    stat1Label: 'Gaming Hours',
    stat2Value: '50+',
    stat2Label: 'Gaming PCs',
    stat3Value: 'VIP',
    stat3Label: 'Experience'
  });

  const [isSaving, setIsSaving] = useState(false);

  // Load current content from localStorage on component mount
  useEffect(() => {
    const savedContent = localStorage.getItem('pixelcafe_hero_content');
    if (savedContent) {
      try {
        const parsed = JSON.parse(savedContent);
        setHeroContent(prevState => ({
          ...prevState,
          ...parsed
        }));
      } catch (error) {
        console.error('Error loading hero content:', error);
      }
    }
  }, []);

  // Handle input changes
  const handleInputChange = (field: keyof HeroContentData, value: string) => {
    setHeroContent(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Save content to localStorage
  const saveContent = async () => {
    setIsSaving(true);
    try {
      localStorage.setItem('pixelcafe_hero_content', JSON.stringify(heroContent));
      
      // Small delay to show saving state
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Force page refresh to see changes immediately
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      console.error('Error saving hero content:', error);
      alert('Failed to save content. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Reset to defaults
  const resetToDefaults = () => {
    if (window.confirm('Are you sure you want to reset all hero content to defaults? This will overwrite all current content.')) {
      const defaultContent: HeroContentData = {
        mainTitle: 'Gaming Cafe',
        subtitle: 'OYUN KAFESİ',
        description: 'Rəqəbətli oyun və immersiv təcrübələr üçün sizin asas mərkəziniz. Yüksək səviyyəli avadanlıqlar, sürətli internet və oyunçular cəmiyyəti sizi gözləyir.',
        buttonText: 'PC Rezerv Et',
        stat1Value: '24/7',
        stat1Label: 'Gaming Hours',
        stat2Value: '50+',
        stat2Label: 'Gaming PCs',
        stat3Value: 'VIP',
        stat3Label: 'Experience'
      };
      
      setHeroContent(defaultContent);
      localStorage.setItem('pixelcafe_hero_content', JSON.stringify(defaultContent));
      
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Hero Content Editor</h2>
          <p className="text-gray-400 mt-1">Customize all text content in the hero section</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={resetToDefaults}
            className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg transition-colors text-sm"
          >
            Reset to Defaults
          </button>
          <button
            onClick={saveContent}
            disabled={isSaving}
            className="bg-violet-600 hover:bg-violet-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg transition-colors font-semibold"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Main Content Section */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-xl font-bold text-white mb-6">Main Titles & Content</h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Main Title */}
          <div className="space-y-2">
            <label className="block text-gray-300 text-sm font-medium">
              Main Title
            </label>
            <input
              type="text"
              value={heroContent.mainTitle}
              onChange={(e) => handleInputChange('mainTitle', e.target.value)}
              placeholder="e.g., Gaming Cafe"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
            />
            <p className="text-xs text-gray-500">This appears as the main white title</p>
          </div>

          {/* Subtitle */}
          <div className="space-y-2">
            <label className="block text-gray-300 text-sm font-medium">
              Subtitle (Shimmer Text)
            </label>
            <input
              type="text"
              value={heroContent.subtitle}
              onChange={(e) => handleInputChange('subtitle', e.target.value)}
              placeholder="e.g., OYUN KAFESİ"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
            />
            <p className="text-xs text-gray-500">This appears in violet below the main title</p>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2 mt-6">
          <label className="block text-gray-300 text-sm font-medium">
            Description
          </label>
          <textarea
            value={heroContent.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Enter your gaming cafe description..."
            rows={4}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 resize-none"
          />
          <p className="text-xs text-gray-500">Main descriptive text that appears below the titles</p>
        </div>

        {/* Button Text */}
        <div className="space-y-2 mt-6">
          <label className="block text-gray-300 text-sm font-medium">
            Call-to-Action Button Text
          </label>
          <input
            type="text"
            value={heroContent.buttonText}
            onChange={(e) => handleInputChange('buttonText', e.target.value)}
            placeholder="e.g., PC Rezerv Et"
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
          />
          <p className="text-xs text-gray-500">Text that appears on the main CTA button</p>
        </div>
      </div>

      {/* Statistics Section */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-xl font-bold text-white mb-6">Statistics Section</h3>
        <p className="text-gray-400 mb-6 text-sm">Customize the three statistics displayed at the bottom of the hero section</p>
        
        <div className="grid md:grid-cols-3 gap-6">
          {/* Stat 1 */}
          <div className="space-y-4 p-4 bg-gray-700/50 rounded-lg border border-gray-600">
            <div className="text-center">
              <div className="text-2xl font-bold text-violet-400 mb-1">
                {heroContent.stat1Value}
              </div>
              <div className="text-xs text-violet-300 uppercase tracking-wider">
                {heroContent.stat1Label}
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="block text-gray-300 text-xs font-medium mb-1">
                  Statistic Value
                </label>
                <input
                  type="text"
                  value={heroContent.stat1Value}
                  onChange={(e) => handleInputChange('stat1Value', e.target.value)}
                  placeholder="24/7"
                  className="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2 text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-gray-300 text-xs font-medium mb-1">
                  Label
                </label>
                <input
                  type="text"
                  value={heroContent.stat1Label}
                  onChange={(e) => handleInputChange('stat1Label', e.target.value)}
                  placeholder="Gaming Hours"
                  className="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2 text-white text-sm"
                />
              </div>
            </div>
          </div>

          {/* Stat 2 */}
          <div className="space-y-4 p-4 bg-gray-700/50 rounded-lg border border-gray-600">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400 mb-1">
                {heroContent.stat2Value}
              </div>
              <div className="text-xs text-blue-300 uppercase tracking-wider">
                {heroContent.stat2Label}
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="block text-gray-300 text-xs font-medium mb-1">
                  Statistic Value
                </label>
                <input
                  type="text"
                  value={heroContent.stat2Value}
                  onChange={(e) => handleInputChange('stat2Value', e.target.value)}
                  placeholder="50+"
                  className="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2 text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-gray-300 text-xs font-medium mb-1">
                  Label
                </label>
                <input
                  type="text"
                  value={heroContent.stat2Label}
                  onChange={(e) => handleInputChange('stat2Label', e.target.value)}
                  placeholder="Gaming PCs"
                  className="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2 text-white text-sm"
                />
              </div>
            </div>
          </div>

          {/* Stat 3 */}
          <div className="space-y-4 p-4 bg-gray-700/50 rounded-lg border border-gray-600">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400 mb-1">
                {heroContent.stat3Value}
              </div>
              <div className="text-xs text-purple-300 uppercase tracking-wider">
                {heroContent.stat3Label}
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="block text-gray-300 text-xs font-medium mb-1">
                  Statistic Value
                </label>
                <input
                  type="text"
                  value={heroContent.stat3Value}
                  onChange={(e) => handleInputChange('stat3Value', e.target.value)}
                  placeholder="VIP"
                  className="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2 text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-gray-300 text-xs font-medium mb-1">
                  Label
                </label>
                <input
                  type="text"
                  value={heroContent.stat3Label}
                  onChange={(e) => handleInputChange('stat3Label', e.target.value)}
                  placeholder="Experience"
                  className="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2 text-white text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Usage Tips */}
      <div className="bg-violet-900/20 border border-violet-400/30 rounded-lg p-6">
        <h3 className="text-lg font-bold text-violet-200 mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Tips for Best Results
        </h3>
        <div className="space-y-3 text-violet-100 text-sm">
          <p>
            <strong>Main Title:</strong> Keep it short and memorable - this is your brand name or primary identifier.
          </p>
          <p>
            <strong>Subtitle:</strong> Appears in violet below the main title, perfect for taglines or descriptive phrases.
          </p>
          <p>
            <strong>Description:</strong> Write a compelling description of your gaming cafe that highlights what makes it special.
          </p>
          <p>
            <strong>Statistics:</strong> Use compelling numbers that showcase your offerings (hours, PCs, experience level, etc.).
          </p>
          <p>
            <strong>Live Preview:</strong> Changes will be applied after saving and refreshing the page.
          </p>
        </div>
      </div>

      {/* Save Button (Bottom) */}
      <div className="flex justify-center pt-6">
        <button
          onClick={saveContent}
          disabled={isSaving}
          className="bg-violet-600 hover:bg-violet-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-bold text-lg transition-colors duration-300 transform hover:scale-105"
        >
          {isSaving ? 'Saving Changes...' : 'Save All Changes'}
        </button>
      </div>
    </div>
  );
};

export default HeroContentEditor;
