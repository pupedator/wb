import React from 'react';

// Helper function to get custom images
const getCustomImage = (imageId: string, defaultUrl: string): string => {
  const customImages = JSON.parse(localStorage.getItem('pixelcafe_custom_images') || '{}');
  return customImages[imageId] || defaultUrl;
};

interface CustomizableSectionProps {
  backgroundImageId: string;
  defaultBackgroundUrl?: string;
  className?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
  overlay?: 'light' | 'medium' | 'dark' | 'gradient' | 'none';
  overlayColor?: string;
}

/**
 * CustomizableSection component makes any section's background customizable
 * through the admin panel's image management system.
 */
const CustomizableSection: React.FC<CustomizableSectionProps> = ({
  backgroundImageId,
  defaultBackgroundUrl = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1920&h=1080&fit=crop',
  className = '',
  children,
  style = {},
  overlay = 'medium',
  overlayColor = 'black'
}) => {
  const backgroundUrl = getCustomImage(backgroundImageId, defaultBackgroundUrl);
  
  const getOverlayClass = () => {
    switch (overlay) {
      case 'light':
        return 'bg-black/20';
      case 'medium':
        return 'bg-black/50';
      case 'dark':
        return 'bg-black/70';
      case 'gradient':
        return 'bg-gradient-to-br from-black/70 via-black/40 to-transparent';
      case 'none':
        return '';
      default:
        return 'bg-black/50';
    }
  };

  return (
    <section 
      className={`relative ${className}`}
      style={{
        backgroundImage: `url(${backgroundUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        ...style
      }}
    >
      {/* Overlay */}
      {overlay !== 'none' && (
        <div 
          className={`absolute inset-0 ${getOverlayClass()}`}
        />
      )}
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </section>
  );
};

export default CustomizableSection;
