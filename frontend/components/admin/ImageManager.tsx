import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../contexts/LanguageContext.tsx';

// Define image categories and their current sources
interface ImageCategory {
    id: string;
    name: string;
    description: string;
    images: ImageItem[];
}

interface ImageItem {
    id: string;
    name: string;
    description: string;
    currentUrl: string;
    category: string;
    editable: boolean;
}

/**
 * ImageManager provides comprehensive image management for the admin panel
 * Allows admins to update hero backgrounds, gallery images, logos, and other visual elements
 */
const ImageManager: React.FC = () => {
    const { t } = useLanguage();
    const [editingImage, setEditingImage] = useState<ImageItem | null>(null);
    const [newUrl, setNewUrl] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    
    // Define all customizable images in the system
    const imageCategories: ImageCategory[] = useMemo(() => [
        {
            id: 'hero',
            name: 'Hero & Main Backgrounds',
            description: 'Main background images and hero sections',
            images: [
                {
                    id: 'hero-bg',
                    name: 'Main Hero Background',
                    description: 'Large background image for the homepage hero section',
                    currentUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1920&h=1080&fit=crop',
                    category: 'hero',
                    editable: true
                },
                {
                    id: 'hero-blob-a',
                    name: 'Hero Organic Shape A (Top-Left)',
                    description: 'Top-left blob-shaped image in hero section',
                    currentUrl: 'https://i.ibb.co/JFBTFD45/5348288161576510546-1.jpg',
                    category: 'hero',
                    editable: true
                },
                {
                    id: 'hero-blob-b',
                    name: 'Hero Organic Shape B (Center-Right)',
                    description: 'Center-right S-curved image in hero section',
                    currentUrl: 'https://i.ibb.co/B55jMV2F/photo-2025-08-27-02-23-22.jpg',
                    category: 'hero',
                    editable: true
                },
                {
                    id: 'hero-blob-c',
                    name: 'Hero Organic Shape C (Bottom-Left)',
                    description: 'Bottom-left rounded blob image in hero section',
                    currentUrl: 'https://i.ibb.co/d3bVDnP/photo-2025-08-27-02-23-18.jpg',
                    category: 'hero',
                    editable: true
                }
            ]
        },
        {
            id: 'sections',
            name: 'Section Backgrounds',
            description: 'Background images for various website sections',
            images: [
                {
                    id: 'resident-bg',
                    name: 'Resident Section Background',
                    description: 'Background for resident membership section',
                    currentUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1920&h=1080&fit=crop',
                    category: 'sections',
                    editable: true
                },
                {
                    id: 'hardware-bg',
                    name: 'Hardware Section Background',
                    description: 'Background for hardware/specs section',
                    currentUrl: 'https://images.unsplash.com/photo-1560419015-7c427e8ae5ba?w=1920&h=1080&fit=crop',
                    category: 'sections',
                    editable: true
                },
                {
                    id: 'games-bg',
                    name: 'Games Section Background',
                    description: 'Background for games showcase section',
                    currentUrl: 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=1920&h=1080&fit=crop',
                    category: 'sections',
                    editable: true
                },
                {
                    id: 'gallery-bg',
                    name: 'Gallery Section Background',
                    description: 'Background for photo gallery section',
                    currentUrl: 'https://images.unsplash.com/photo-1518709414026-5a61b988c8c4?w=1920&h=1080&fit=crop',
                    category: 'sections',
                    editable: true
                },
                {
                    id: 'faq-bg',
                    name: 'FAQ Section Background',
                    description: 'Background for frequently asked questions section',
                    currentUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&h=1080&fit=crop',
                    category: 'sections',
                    editable: true
                },
                {
                    id: 'contact-bg',
                    name: 'Contact/Booking Section Background',
                    description: 'Background for contact and booking section',
                    currentUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1920&h=1080&fit=crop',
                    category: 'sections',
                    editable: true
                }
            ]
        },
        {
            id: 'branding',
            name: 'Logos & Branding',
            description: 'Company logos and branding elements',
            images: [
                {
                    id: 'main-logo',
                    name: 'Main Logo',
                    description: 'Primary company logo displayed in navigation',
                    currentUrl: 'https://i.ibb.co/2PQx7Nw/logo.png',
                    category: 'branding',
                    editable: true
                },
                {
                    id: 'logo-white',
                    name: 'White Logo Variant',
                    description: 'White version of logo for dark backgrounds',
                    currentUrl: 'https://i.ibb.co/2PQx7Nw/logo-white.png',
                    category: 'branding',
                    editable: true
                },
                {
                    id: 'favicon',
                    name: 'Favicon',
                    description: 'Small icon displayed in browser tab',
                    currentUrl: '/favicon.ico',
                    category: 'branding',
                    editable: true
                }
            ]
        },
        {
            id: 'gallery',
            name: 'Gallery Images',
            description: 'Photo gallery and showcase images',
            images: [
                {
                    id: 'gallery-1',
                    name: 'Gaming Setup 1',
                    description: 'Main gaming area photo',
                    currentUrl: 'https://i.ibb.co/JFBTFD45/5348288161576510546-1.jpg',
                    category: 'gallery',
                    editable: true
                },
                {
                    id: 'gallery-2',
                    name: 'Gaming Setup 2',
                    description: 'Secondary gaming area photo',
                    currentUrl: 'https://i.ibb.co/B55jMV2F/photo-2025-08-27-02-23-22.jpg',
                    category: 'gallery',
                    editable: true
                },
                {
                    id: 'gallery-3',
                    name: 'Interior View',
                    description: 'Cafe interior photo',
                    currentUrl: 'https://i.ibb.co/d3bVDnP/photo-2025-08-27-02-23-18.jpg',
                    category: 'gallery',
                    editable: true
                }
            ]
        },
        {
            id: 'cases',
            name: 'Case Images',
            description: 'Images for loot boxes and rewards',
            images: [
                {
                    id: 'bronze-case',
                    name: 'Bronze Case',
                    description: 'Image for bronze tier cases',
                    currentUrl: 'https://i.ibb.co/8nNjKtfR/Gemini-Generated-Image-6603js6603js6603-removebg-preview.png',
                    category: 'cases',
                    editable: true
                },
                {
                    id: 'silver-case',
                    name: 'Silver Case',
                    description: 'Image for silver tier cases',
                    currentUrl: 'https://i.ibb.co/7N0H63BG/Gemini-Generated-Image-i6l6w1i6l6w1i6l6-removebg-preview.png',
                    category: 'cases',
                    editable: true
                },
                {
                    id: 'gold-case',
                    name: 'Gold Case',
                    description: 'Image for gold tier cases',
                    currentUrl: 'https://i.ibb.co/hJhTM9Xq/Gemini-Generated-Image-dpb8nbdpb8nbdpb8-removebg-preview.png',
                    category: 'cases',
                    editable: true
                },
                {
                    id: 'vip-case',
                    name: 'VIP Case',
                    description: 'Image for VIP tier cases',
                    currentUrl: 'https://i.ibb.co/8nRHzbWt/Gemini-Generated-Image-o99l8to99l8to99l-removebg-preview.png',
                    category: 'cases',
                    editable: true
                }
            ]
        },
        {
            id: 'food',
            name: 'Food & Drinks',
            description: 'Images for menu items',
            images: [
                {
                    id: 'red-bull',
                    name: 'Red Bull',
                    description: 'Red Bull energy drink image',
                    currentUrl: 'https://i.ibb.co/PQtL4gG/redbull.png',
                    category: 'food',
                    editable: true
                },
                {
                    id: 'cola',
                    name: 'Cola',
                    description: 'Cola drink image',
                    currentUrl: 'https://i.ibb.co/9vGzZzW/cola.png',
                    category: 'food',
                    editable: true
                }
            ]
        },
        {
            id: 'decorative',
            name: 'Decorative Elements',
            description: 'Decorative graphics and overlays',
            images: [
                {
                    id: 'corner-graphic',
                    name: 'Bottom-Right Corner Graphic',
                    description: 'Decorative element anchored to bottom-right corner',
                    currentUrl: 'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=400&h=400&fit=crop',
                    category: 'decorative',
                    editable: true
                },
                {
                    id: 'accent-overlay',
                    name: 'Accent Overlay Pattern',
                    description: 'Pattern overlay for sections',
                    currentUrl: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=800&h=600&fit=crop',
                    category: 'decorative',
                    editable: true
                },
                {
                    id: 'particle-bg',
                    name: 'Particle Background',
                    description: 'Animated particle background texture',
                    currentUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&h=1080&fit=crop',
                    category: 'decorative',
                    editable: true
                }
            ]
        }
    ], []);

    // Get current image URLs from localStorage or use defaults
    const getCurrentImageUrl = (imageId: string, defaultUrl: string): string => {
        const customImages = JSON.parse(localStorage.getItem('pixelcafe_custom_images') || '{}');
        return customImages[imageId] || defaultUrl;
    };

    // Save new image URL to localStorage
    const saveImageUrl = (imageId: string, url: string) => {
        const customImages = JSON.parse(localStorage.getItem('pixelcafe_custom_images') || '{}');
        customImages[imageId] = url;
        localStorage.setItem('pixelcafe_custom_images', JSON.stringify(customImages));
    };

    // Start editing an image
    const startEditing = (image: ImageItem) => {
        setEditingImage(image);
        setNewUrl(getCurrentImageUrl(image.id, image.currentUrl));
    };

    // Cancel editing
    const cancelEditing = () => {
        setEditingImage(null);
        setNewUrl('');
    };

    // Save new image URL
    const saveImage = async () => {
        if (!editingImage || !newUrl.trim()) return;

        setIsUploading(true);
        
        try {
            // Validate URL by trying to load the image
            await new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = resolve;
                img.onerror = reject;
                img.src = newUrl.trim();
            });

            // Save the URL
            saveImageUrl(editingImage.id, newUrl.trim());
            
            // Reset form
            cancelEditing();
            
            // Force page refresh to see changes immediately
            setTimeout(() => {
                window.location.reload();
            }, 500);
            
        } catch (error) {
            alert('Failed to load image. Please check the URL and try again.');
        } finally {
            setIsUploading(false);
        }
    };

    // Reset image to default
    const resetToDefault = (image: ImageItem) => {
        if (window.confirm(`Reset "${image.name}" to default image?`)) {
            const customImages = JSON.parse(localStorage.getItem('pixelcafe_custom_images') || '{}');
            delete customImages[image.id];
            localStorage.setItem('pixelcafe_custom_images', JSON.stringify(customImages));
            
            // Force page refresh
            setTimeout(() => {
                window.location.reload();
            }, 500);
        }
    };

    // Render category section
    const renderCategory = (category: ImageCategory) => (
        <div key={category.id} className="mb-8">
            <div className="mb-4">
                <h3 className="text-xl font-bold text-white mb-2">{category.name}</h3>
                <p className="text-gray-400 text-sm">{category.description}</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.images.map(image => {
                    const currentUrl = getCurrentImageUrl(image.id, image.currentUrl);
                    const isCustom = currentUrl !== image.currentUrl;
                    
                    return (
                        <div key={image.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                            <div className="mb-3">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-semibold text-white">{image.name}</h4>
                                    {isCustom && (
                                        <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded">
                                            Custom
                                        </span>
                                    )}
                                </div>
                                <p className="text-gray-400 text-sm">{image.description}</p>
                            </div>
                            
                            <div className="mb-4">
                                <img
                                    src={currentUrl}
                                    alt={image.name}
                                    className="w-full h-32 object-cover rounded border border-gray-600"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x200/374151/9CA3AF?text=Image+Not+Found';
                                    }}
                                />
                            </div>
                            
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => startEditing(image)}
                                    className="flex-1 bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded text-sm transition-colors"
                                >
                                    Edit
                                </button>
                                {isCustom && (
                                    <button
                                        onClick={() => resetToDefault(image)}
                                        className="flex-1 bg-gray-600 hover:bg-gray-500 text-white px-3 py-2 rounded text-sm transition-colors"
                                    >
                                        Reset
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-white">Image Management</h2>
                    <p className="text-gray-400 mt-1">Customize all images across your website</p>
                </div>
                <div className="text-sm text-gray-400">
                    Changes will apply after page refresh
                </div>
            </div>

            {/* Editing Modal */}
            {editingImage && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-900 rounded-lg p-6 w-full max-w-lg">
                        <h3 className="text-xl font-bold text-white mb-4">
                            Edit {editingImage.name}
                        </h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-gray-300 text-sm font-medium mb-2">
                                    Image URL
                                </label>
                                <input
                                    type="url"
                                    value={newUrl}
                                    onChange={(e) => setNewUrl(e.target.value)}
                                    placeholder="https://example.com/image.jpg"
                                    className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white"
                                />
                            </div>
                            
                            {newUrl && (
                                <div>
                                    <label className="block text-gray-300 text-sm font-medium mb-2">
                                        Preview
                                    </label>
                                    <img
                                        src={newUrl}
                                        alt="Preview"
                                        className="w-full h-32 object-cover rounded border border-gray-600"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x200/374151/9CA3AF?text=Invalid+URL';
                                        }}
                                    />
                                </div>
                            )}
                            
                            <div className="text-sm text-gray-400">
                                <p className="mb-1">Tips for best results:</p>
                                <ul className="list-disc list-inside space-y-1">
                                    <li>Use high-quality images (at least 1920x1080 for backgrounds)</li>
                                    <li>Ensure images are hosted on reliable CDNs</li>
                                    <li>Test the URL in a new tab before saving</li>
                                    <li>Consider image load times for user experience</li>
                                </ul>
                            </div>
                        </div>

                        <div className="flex space-x-3 mt-6">
                            <button
                                onClick={saveImage}
                                disabled={isUploading || !newUrl.trim()}
                                className="flex-1 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded transition-colors"
                            >
                                {isUploading ? 'Saving...' : 'Save Image'}
                            </button>
                            <button
                                onClick={cancelEditing}
                                disabled={isUploading}
                                className="flex-1 bg-gray-600 hover:bg-gray-500 disabled:cursor-not-allowed text-white px-4 py-2 rounded transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Image Categories */}
            <div>
                {imageCategories.map(renderCategory)}
                
                {/* Usage Instructions */}
                <div className="mt-12 bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                    <h3 className="text-lg font-bold text-white mb-4">How to Use</h3>
                    <div className="space-y-3 text-gray-300">
                        <p>
                            <strong>1. Image Sources:</strong> You can use any publicly accessible image URL. 
                            Popular options include Unsplash, your own CDN, or image hosting services.
                        </p>
                        <p>
                            <strong>2. Recommended Sizes:</strong> Hero backgrounds should be at least 1920x1080px. 
                            Gallery images work best at 800x600px or higher.
                        </p>
                        <p>
                            <strong>3. Testing:</strong> Always test your image URLs in a new browser tab before saving 
                            to ensure they load correctly.
                        </p>
                        <p>
                            <strong>4. Backup:</strong> Keep a record of your custom URLs. You can always reset 
                            to defaults if needed.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImageManager;
