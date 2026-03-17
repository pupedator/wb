import React from 'react';
import { useLanguage } from '../contexts/LanguageContext.tsx';

// Helper function to get custom images
const getCustomImage = (imageId: string, defaultUrl: string): string => {
  const customImages = JSON.parse(localStorage.getItem('pixelcafe_custom_images') || '{}');
  return customImages[imageId] || defaultUrl;
};


const Hero: React.FC = () => {
  const { bookingLink, t } = useLanguage();
  // Use translation system instead of hardcoded content
  const heroContent = {
    mainTitle: t('hero.title_part1'),
    subtitle: t('hero.title_part2'),
    description: t('hero.subtitle'),
    buttonText: t('hero.cta'),
    stats: {
      stat1: { value: '24/7', label: t('hero.stats.hours') || 'Gaming Hours' },
      stat2: { value: '50+', label: t('hero.stats.pcs') || 'Gaming PCs' },
      stat3: { value: 'VIP', label: t('hero.stats.experience') || 'Experience' }
    }
  };

  // Get customizable hero background
  const heroBgUrl = getCustomImage('hero-bg', 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1920&h=1080&fit=crop');
  
  return (
    <section 
      id="hero" 
      className="min-h-screen flex items-center relative overflow-hidden"
      style={{
        backgroundImage: `url(${heroBgUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Dark overlay for better text contrast */}
      <div className="absolute inset-0 bg-black/70"></div>
      
      {/* Animated particles effect */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute top-20 left-10 w-3 h-3 bg-violet-400 rounded-full animate-pulse shimmer-particle"></div>
        <div className="absolute top-32 right-20 w-2 h-2 bg-blue-500 rounded-full animate-ping shimmer-particle delay-300"></div>
        <div className="absolute bottom-40 left-20 w-2.5 h-2.5 bg-purple-400 rounded-full animate-pulse delay-500 shimmer-particle"></div>
        <div className="absolute bottom-60 right-32 w-2 h-2 bg-indigo-400 rounded-full animate-ping delay-700 shimmer-particle"></div>
        <div className="absolute top-1/2 left-1/4 w-1.5 h-1.5 bg-violet-300 rounded-full animate-pulse delay-1000 shimmer-particle"></div>
        <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-blue-300 rounded-full animate-ping delay-1200 shimmer-particle"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-20 z-10 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center min-h-[70vh] sm:min-h-[80vh]">
          {/* Left Content */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-6 lg:space-y-8">
            {/* Modern Badge */}
            <div className="inline-flex items-center space-x-2 bg-violet-900/20 backdrop-blur-sm border border-violet-400/30 rounded-full px-3 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-medium shimmer-badge">
              <div className="w-2 sm:w-3 h-2 sm:h-3 bg-violet-400 rounded-full animate-pulse"></div>
              <span className="text-violet-200 font-semibold tracking-wide">PREMIUM GAMING EXPERIENCE</span>
            </div>
            
            {/* Main Heading - Enhanced with violet-blue gradient */}
            <div className="space-y-3 sm:space-y-6">
              <h1 className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-bold leading-tight">
                <span className="block text-white font-light mb-2 sm:mb-4 tracking-tight">
                  {heroContent.mainTitle}
                </span>
                <span className="block text-violet-400 font-black">
                  {heroContent.subtitle}
                </span>
              </h1>
            </div>
            
            {/* Subtitle */}
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-violet-100 font-light leading-relaxed max-w-2xl">
              {heroContent.description}
            </p>
            
            {/* Enhanced CTA Button - Bigger and NO gift certificate */}
            <div className="pt-4 sm:pt-6">
              <a 
                href={bookingLink} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex items-center justify-center px-6 sm:px-8 lg:px-12 py-4 sm:py-5 lg:py-6 bg-violet-600 hover:bg-violet-500 text-white font-bold text-base sm:text-lg lg:text-xl rounded-xl sm:rounded-2xl transition-colors duration-300 w-full sm:w-auto justify-center"
              >
                <span>{heroContent.buttonText}</span>
                <svg className="ml-2 sm:ml-3 w-5 sm:w-6 h-5 sm:h-6 transition-transform group-hover:translate-x-2 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </a>
            </div>
            
            {/* Enhanced Customizable Stats */}
            <div className="grid grid-cols-3 gap-4 sm:gap-6 lg:gap-10 pt-8 sm:pt-12 border-t border-violet-400/20">
              <div className="text-center group">
                <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-violet-400 group-hover:scale-110 transition-transform duration-300">
                  {heroContent.stats.stat1.value}
                </div>
                <div className="text-xs sm:text-sm text-violet-300 font-medium tracking-wider uppercase mt-1 sm:mt-2">
                  {heroContent.stats.stat1.label}
                </div>
              </div>
              <div className="text-center group">
                <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-blue-400 group-hover:scale-110 transition-transform duration-300">
                  {heroContent.stats.stat2.value}
                </div>
                <div className="text-xs sm:text-sm text-blue-300 font-medium tracking-wider uppercase mt-1 sm:mt-2">
                  {heroContent.stats.stat2.label}
                </div>
              </div>
              <div className="text-center group">
                <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-purple-400 group-hover:scale-110 transition-transform duration-300">
                  {heroContent.stats.stat3.value}
                </div>
                <div className="text-xs sm:text-sm text-purple-300 font-medium tracking-wider uppercase mt-1 sm:mt-2">
                  {heroContent.stats.stat3.label}
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Content - Enhanced Organic Layout Canvas */}
          <div className="lg:col-span-5 relative order-first lg:order-last">
            {/* Main Canvas - Bigger organic blob-shaped images */}
            <div className="relative w-full h-[300px] sm:h-[400px] md:h-[500px] lg:h-[700px] overflow-hidden">
              {/* Image A (Top-Left) - Larger curved blob */}
              <div className="absolute top-1 sm:top-2 left-0 w-48 sm:w-64 md:w-72 lg:w-80 h-40 sm:h-52 md:h-60 lg:h-72 z-10">
                <div 
                  className="w-full h-full relative overflow-hidden group shimmer-image"
                  style={{
                    clipPath: 'polygon(20% 0%, 80% 10%, 100% 50%, 85% 90%, 30% 100%, 0% 60%)'
                  }}
                >
                  <img 
                    src={getCustomImage('hero-blob-a', 'https://i.ibb.co/JFBTFD45/5348288161576510546-1.jpg')}
                    alt="Gaming Lounge"
                    className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  {/* Enhanced logo overlay */}
                  <div className="absolute top-2 sm:top-4 left-2 sm:left-4 w-8 sm:w-12 lg:w-14 h-8 sm:h-12 lg:h-14 bg-violet-900/80 backdrop-blur-sm rounded-full border border-violet-400/50 flex items-center justify-center">
                    <img src={getCustomImage('main-logo', 'https://i.ibb.co/5WBFyxC3/Pixel.png')} alt="Logo" className="w-6 sm:w-8 lg:w-10 h-6 sm:h-8 lg:h-10 object-contain" />
                  </div>
                </div>
              </div>
              
              {/* Image B (Center-Right) - Taller S-curved foreground image */}
              <div className="absolute top-0 right-0 w-44 sm:w-56 md:w-64 lg:w-72 h-[200px] sm:h-[280px] md:h-[350px] lg:h-[420px] z-30">
                <div 
                  className="w-full h-full relative overflow-hidden group shimmer-image"
                  style={{
                    clipPath: 'polygon(30% 0%, 100% 15%, 85% 40%, 95% 65%, 70% 85%, 100% 100%, 0% 90%, 15% 60%, 5% 35%, 25% 10%)'
                  }}
                >
                  <img 
                    src={getCustomImage('hero-blob-b', 'https://i.ibb.co/B55jMV2F/photo-2025-08-27-02-23-22.jpg')}
                    alt="Gaming Area"
                    className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  {/* Enhanced live indicator */}
                  <div className="absolute top-2 sm:top-4 right-2 sm:right-4 flex items-center space-x-1 sm:space-x-2 bg-green-900/80 backdrop-blur-sm rounded-full px-2 sm:px-3 py-1 sm:py-2 border border-green-400/50">
                    <div className="w-2 sm:w-3 h-2 sm:h-3 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-green-300 text-xs sm:text-sm font-bold">LIVE</span>
                  </div>
                </div>
              </div>
              
              {/* Image C (Bottom-Left) - Bigger rounded blob */}
              <div className="absolute bottom-3 sm:bottom-6 left-8 sm:left-14 w-40 sm:w-52 md:w-58 lg:w-64 h-36 sm:h-44 md:h-50 lg:h-56 z-20">
                <div 
                  className="w-full h-full relative overflow-hidden group shimmer-image"
                  style={{
                    clipPath: 'polygon(25% 0%, 75% 5%, 100% 35%, 90% 70%, 60% 100%, 15% 85%, 0% 50%)'
                  }}
                >
                  <img 
                    src={getCustomImage('hero-blob-c', 'https://i.ibb.co/d3bVDnP/photo-2025-08-27-02-23-18.jpg')}
                    alt="Individual Gaming Station"
                    className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  {/* Enhanced station info */}
                  <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 right-2 sm:right-3">
                    <div className="bg-purple-900/80 backdrop-blur-sm rounded-lg p-1.5 sm:p-2 border border-purple-400/50">
                      <div className="text-purple-200 font-bold text-xs sm:text-sm">VIP Station</div>
                      <div className="text-purple-300 text-xs">Premium Setup</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Decorative Graphic Element - Bottom-Right Corner */}
              <div className="absolute bottom-0 right-0 w-20 sm:w-24 lg:w-32 h-20 sm:h-24 lg:h-32 z-10">
                <div
                  className="w-full h-full bg-white/5 backdrop-blur-sm border border-white/20"
                  style={{
                    clipPath: 'polygon(50% 0%, 100% 0%, 100% 100%, 0% 100%)'
                  }}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-10 sm:w-12 lg:w-16 h-10 sm:h-12 lg:h-16 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 flex items-center justify-center">
                      <svg className="w-5 sm:w-6 lg:w-8 h-5 sm:h-6 lg:h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
              
              
              {/* Floating decorative elements */}
              <div className="absolute top-16 right-20 w-3 h-3 bg-cyan-400/60 rounded-full animate-ping"></div>
              <div className="absolute bottom-20 left-8 w-2 h-2 bg-purple-400/60 rounded-full animate-pulse delay-500"></div>
              <div className="absolute top-32 left-16 w-1.5 h-1.5 bg-blue-400/60 rounded-full animate-ping delay-1000"></div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Advanced Violet-Blue Shimmer Effects CSS */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(3deg); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        /* Particle float */
        @keyframes particleFloat {
          0%, 100% { transform: translateY(0px) scale(1); opacity: 0.8; }
          50% { transform: translateY(-20px) scale(1.2); opacity: 1; }
        }
        .shimmer-particle {
          animation: particleFloat 3s ease-in-out infinite;
        }

        /* Images */
        .shimmer-image {
          border: 2px solid transparent;
          transition: border-color 0.3s ease;
        }
        .shimmer-image:hover {
          border-color: rgba(139, 92, 246, 0.4);
        }

        @media (max-width: 768px) {
          .shimmer-button {
            padding: 1rem 2rem;
            font-size: 1rem;
          }
        }
      `}} />
    </section>
  );
};

export default Hero;
