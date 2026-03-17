import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

interface CustomizationSetting {
    id: string;
    name: string;
    description: string;
    type: 'color' | 'number' | 'select' | 'toggle';
    currentValue: any;
    options?: Array<{ value: string; label: string }>;
    min?: number;
    max?: number;
    step?: number;
}

interface CustomizationSection {
    id: string;
    name: string;
    description: string;
    settings: CustomizationSetting[];
}

/**
 * WebsiteCustomizer provides comprehensive customization options for website appearance
 */
const WebsiteCustomizer: React.FC = () => {
    const { t } = useLanguage();
    const [activeSection, setActiveSection] = useState<string>('colors');

    // Get current settings from localStorage
    const getCustomSettings = (): Record<string, any> => {
        return JSON.parse(localStorage.getItem('pixelcafe_custom_settings') || '{}');
    };

    // Save setting to localStorage
    const saveSetting = (settingId: string, value: any) => {
        const customSettings = getCustomSettings();
        customSettings[settingId] = value;
        localStorage.setItem('pixelcafe_custom_settings', JSON.stringify(customSettings));
        
        // Apply CSS custom properties for immediate effect
        applyCSSVariables(customSettings);
    };

    // Apply settings as CSS custom properties
    const applyCSSVariables = (settings: Record<string, any>) => {
        const root = document.documentElement;
        
        // Apply color customizations
        if (settings['primary-color']) root.style.setProperty('--primary-color', settings['primary-color']);
        if (settings['secondary-color']) root.style.setProperty('--secondary-color', settings['secondary-color']);
        if (settings['accent-color']) root.style.setProperty('--accent-color', settings['accent-color']);
        
        // Apply other customizations
        if (settings['border-radius']) root.style.setProperty('--border-radius', `${settings['border-radius']}px`);
        if (settings['animation-speed']) root.style.setProperty('--animation-duration', `${settings['animation-speed']}ms`);
    };

    // Initialize CSS variables on component mount
    React.useEffect(() => {
        applyCSSVariables(getCustomSettings());
    }, []);

    // Define all customization options
    const customizationSections: CustomizationSection[] = useMemo(() => [
        {
            id: 'colors',
            name: 'Color Scheme',
            description: 'Customize the main colors used throughout the website',
            settings: [
                {
                    id: 'primary-color',
                    name: 'Primary Color',
                    description: 'Main brand color used for buttons and accents',
                    type: 'color',
                    currentValue: getCustomSettings()['primary-color'] || '#8B5CF6'
                },
                {
                    id: 'secondary-color',
                    name: 'Secondary Color',
                    description: 'Secondary brand color for highlights',
                    type: 'color',
                    currentValue: getCustomSettings()['secondary-color'] || '#06B6D4'
                },
                {
                    id: 'accent-color',
                    name: 'Accent Color',
                    description: 'Accent color for special elements',
                    type: 'color',
                    currentValue: getCustomSettings()['accent-color'] || '#10B981'
                },
                {
                    id: 'text-color',
                    name: 'Primary Text Color',
                    description: 'Main text color',
                    type: 'color',
                    currentValue: getCustomSettings()['text-color'] || '#FFFFFF'
                }
            ]
        },
        {
            id: 'layout',
            name: 'Layout & Spacing',
            description: 'Adjust layout properties and spacing',
            settings: [
                {
                    id: 'border-radius',
                    name: 'Border Radius',
                    description: 'Roundness of buttons and cards',
                    type: 'number',
                    currentValue: getCustomSettings()['border-radius'] || 12,
                    min: 0,
                    max: 50,
                    step: 1
                },
                {
                    id: 'container-max-width',
                    name: 'Container Max Width',
                    description: 'Maximum width of content containers',
                    type: 'select',
                    currentValue: getCustomSettings()['container-max-width'] || '1200px',
                    options: [
                        { value: '1024px', label: 'Narrow (1024px)' },
                        { value: '1200px', label: 'Standard (1200px)' },
                        { value: '1400px', label: 'Wide (1400px)' },
                        { value: '1600px', label: 'Extra Wide (1600px)' }
                    ]
                }
            ]
        },
        {
            id: 'animations',
            name: 'Animations & Effects',
            description: 'Control animation speeds and effects',
            settings: [
                {
                    id: 'animation-speed',
                    name: 'Animation Speed',
                    description: 'Global animation duration in milliseconds',
                    type: 'number',
                    currentValue: getCustomSettings()['animation-speed'] || 300,
                    min: 100,
                    max: 1000,
                    step: 50
                },
                {
                    id: 'enable-parallax',
                    name: 'Parallax Effects',
                    description: 'Enable/disable parallax scrolling effects',
                    type: 'toggle',
                    currentValue: getCustomSettings()['enable-parallax'] !== false
                },
                {
                    id: 'enable-particles',
                    name: 'Particle Effects',
                    description: 'Enable/disable floating particle animations',
                    type: 'toggle',
                    currentValue: getCustomSettings()['enable-particles'] !== false
                }
            ]
        },
        {
            id: 'typography',
            name: 'Typography',
            description: 'Font and text styling options',
            settings: [
                {
                    id: 'heading-font',
                    name: 'Heading Font',
                    description: 'Font family for headings',
                    type: 'select',
                    currentValue: getCustomSettings()['heading-font'] || 'Inter',
                    options: [
                        { value: 'Inter', label: 'Inter (Modern)' },
                        { value: 'Poppins', label: 'Poppins (Rounded)' },
                        { value: 'Roboto', label: 'Roboto (Clean)' },
                        { value: 'Playfair Display', label: 'Playfair (Elegant)' },
                        { value: 'Orbitron', label: 'Orbitron (Futuristic)' }
                    ]
                },
                {
                    id: 'body-font',
                    name: 'Body Font',
                    description: 'Font family for body text',
                    type: 'select',
                    currentValue: getCustomSettings()['body-font'] || 'Inter',
                    options: [
                        { value: 'Inter', label: 'Inter (Modern)' },
                        { value: 'Open Sans', label: 'Open Sans (Readable)' },
                        { value: 'Lato', label: 'Lato (Friendly)' },
                        { value: 'Source Sans Pro', label: 'Source Sans Pro (Professional)' }
                    ]
                }
            ]
        }
    ], []);

    // Handle setting change
    const handleSettingChange = (settingId: string, value: any) => {
        saveSetting(settingId, value);
    };

    // Reset all settings to default
    const resetAllSettings = () => {
        if (window.confirm('Are you sure you want to reset all customizations to default values?')) {
            localStorage.removeItem('pixelcafe_custom_settings');
            // Reset CSS variables
            const root = document.documentElement;
            root.style.removeProperty('--primary-color');
            root.style.removeProperty('--secondary-color');
            root.style.removeProperty('--accent-color');
            root.style.removeProperty('--border-radius');
            root.style.removeProperty('--animation-duration');
            
            // Force page refresh to see changes
            setTimeout(() => {
                window.location.reload();
            }, 500);
        }
    };

    // Render setting input
    const renderSettingInput = (setting: CustomizationSetting) => {
        const currentValue = getCustomSettings()[setting.id] ?? setting.currentValue;

        switch (setting.type) {
            case 'color':
                return (
                    <input
                        type="color"
                        value={currentValue as string}
                        onChange={(e) => handleSettingChange(setting.id, e.target.value)}
                        className="w-16 h-10 border-2 border-gray-600 rounded cursor-pointer"
                    />
                );
            
            case 'number':
                return (
                    <input
                        type="number"
                        value={currentValue as number}
                        min={setting.min}
                        max={setting.max}
                        step={setting.step}
                        onChange={(e) => handleSettingChange(setting.id, parseFloat(e.target.value))}
                        className="w-24 bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white"
                    />
                );
            
            case 'select':
                return (
                    <select
                        value={currentValue as string}
                        onChange={(e) => handleSettingChange(setting.id, e.target.value)}
                        className="bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white"
                    >
                        {setting.options?.map((option) => {
                            const value = typeof option === 'string' ? option : option.value;
                            const label = typeof option === 'string' ? option : option.label;
                            return (
                                <option key={value} value={value}>
                                    {label}
                                </option>
                            );
                        })}
                    </select>
                );
            
            case 'toggle':
                return (
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={currentValue as boolean}
                            onChange={(e) => handleSettingChange(setting.id, e.target.checked)}
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                );
            
            default:
                return null;
        }
    };

    const activeCustomizationSection = customizationSections.find(s => s.id === activeSection);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-white">Website Customization</h2>
                    <p className="text-gray-400 mt-1">Customize colors, layout, and visual effects</p>
                </div>
                <button
                    onClick={resetAllSettings}
                    className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                >
                    Reset All
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Section Navigation */}
                <div className="lg:col-span-1">
                    <div className="bg-gray-800 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-white mb-4">Sections</h3>
                        <nav className="space-y-2">
                            {customizationSections.map((section) => (
                                <button
                                    key={section.id}
                                    onClick={() => setActiveSection(section.id)}
                                    className={`w-full text-left px-3 py-2 rounded transition-colors ${
                                        activeSection === section.id
                                            ? 'bg-purple-600 text-white'
                                            : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                    }`}
                                >
                                    {section.name}
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>

                {/* Settings Panel */}
                <div className="lg:col-span-3">
                    {activeCustomizationSection && (
                        <div className="bg-gray-800 rounded-lg p-6">
                            <div className="mb-6">
                                <h3 className="text-xl font-bold text-white mb-2">
                                    {activeCustomizationSection.name}
                                </h3>
                                <p className="text-gray-400 text-sm">
                                    {activeCustomizationSection.description}
                                </p>
                            </div>

                            <div className="space-y-6">
                                {activeCustomizationSection.settings.map((setting) => (
                                    <div key={setting.id} className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-white mb-1">
                                                {setting.name}
                                            </h4>
                                            <p className="text-gray-400 text-sm">
                                                {setting.description}
                                            </p>
                                        </div>
                                        <div className="ml-4">
                                            {renderSettingInput(setting)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Live Preview Notice */}
            <div className="bg-blue-900/50 border border-blue-700 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                    <svg className="w-6 h-6 text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                        <h4 className="font-semibold text-blue-200 mb-1">Live Preview</h4>
                        <p className="text-blue-300 text-sm">
                            Most changes apply immediately. Some changes may require a page refresh to take full effect.
                            Your customizations are automatically saved and will persist across sessions.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WebsiteCustomizer;
