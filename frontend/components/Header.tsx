import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext.tsx';
import LanguageSwitcher from './LanguageSwitcher.tsx';
import MobileMenu from './MobileMenu.tsx';
import type { Page } from '../App.tsx';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useActiveSection } from '../hooks/useActiveSection.ts';

// Helper function to get custom images
const getCustomImage = (imageId: string, defaultUrl: string): string => {
  const customImages = JSON.parse(localStorage.getItem('pixelcafe_custom_images') || '{}');
  return customImages[imageId] || defaultUrl;
};

interface HeaderProps {
  setPage: (page: Page) => void;
  page: Page;
}

/**
 * The main header component for the website.
 * It's responsible for navigation, language switching, and showing login/logout actions.
 */
const Header: React.FC<HeaderProps> = ({ setPage, page }) => {
  // State to track if the page has been scrolled down, for applying a background to the header.
  const [isScrolled, setIsScrolled] = useState(false);
  // State for toggling the mobile menu.
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // Hooks for accessing language context and authentication context.
  const { t, navLinks } = useLanguage();
  const { user, logout } = useAuth();
  
  // Get the currently active section for highlighting
  const activeSection = useActiveSection();
  
  // Get customizable logo
  const logoUrl = getCustomImage('main-logo', 'https://i.ibb.co/5WBFyxC3/Pixel.png');

  // Effect to add a scroll event listener.
  // This detects if the user has scrolled more than 10 pixels to make the header sticky with a background.
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    // Cleanup: remove the event listener when the component unmounts.
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Closes the mobile menu.
  const handleLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  /**
   * Handles navigation clicks. This logic is a bit complex because it needs to handle
   * both internal page state changes (for pages like 'cases', 'login') and
   * smooth scrolling to sections on the homepage.
   */
  const handleNavClick = (event: React.MouseEvent<HTMLAnchorElement>, targetId?: string) => {
    event.preventDefault(); // Prevent the default anchor link behavior.
    const id = targetId || event.currentTarget.getAttribute('href')?.substring(1) as Page;

    // If the link is for a separate "page" (not a section on the homepage)...
    if (id === 'food' || id === 'cases' || id === 'cabinet' || id === 'admin' || id === 'login') {
        setPage(id); // ...change the application's page state.
        setIsMobileMenuOpen(false); // Close mobile menu if open.
        window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to the top of the new page.
        return;
    }
    
    // If we are currently on a different page but clicked a homepage link...
    if (page !== 'home') {
        setPage('home'); // ...first, switch back to the homepage.
    }

    // Use a short timeout to allow the homepage to render before scrolling.
    setTimeout(() => {
        if (id) {
            if (id === 'hero') {
                 window.scrollTo({ top: 0, behavior: 'smooth' });
                 return;
            }
            // Find the element by ID and scroll to it smoothly.
            const element = document.getElementById(id);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }, 50); 
    setIsMobileMenuOpen(false);
  };
  
  // Handles the user logout process.
  const handleLogout = () => {
      logout();
      setPage('home'); // Redirect to home after logout.
  }

  // Filter navigation links based on authentication status and user role.
  const authenticatedNavLinks = navLinks.filter(link => {
      if (link.id === 'cabinet') return !!user; // Only show 'Cabinet' if logged in.
      if (link.id === 'admin') return user?.role === 'admin'; // Only show 'Admin' for admin users.
      return true; // Show all other links.
  });


  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? 'bg-black/90 backdrop-blur-xl border-b border-violet-900/30' : 'bg-black/30 backdrop-blur-sm'}`}>
        <div className="container mx-auto px-4 sm:px-6 py-3 flex justify-between items-center">
          {/* Enhanced Logo Section */}
          <a href="#hero" onClick={(e) => handleNavClick(e, 'hero')} className="flex items-center space-x-2 sm:space-x-4 group logo-container">
            <div className="relative">
              {/* Logo with shimmer effect */}
              <div className="absolute inset-0 rounded-full bg-violet-500 opacity-20 group-hover:opacity-40 blur transition-opacity duration-500"></div>
              <img src={logoUrl} alt="Gaming Cafe" className="h-12 sm:h-14 lg:h-16 w-auto relative z-10 transform group-hover:scale-110 transition-transform duration-500 logo-shimmer" />
            </div>
            <div className="hidden sm:block">
              <div className="text-white font-bold text-lg sm:text-xl lg:text-2xl tracking-tight group-hover:text-violet-300 transition-colors duration-300 brand-text">
                Gaming Cafe
              </div>
              <div className="text-violet-400 text-xs sm:text-sm font-medium tracking-wider uppercase">
                Gaming Cafe
              </div>
            </div>
          </a>
          
          {/* Enhanced Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {authenticatedNavLinks.map((link) => {
              // Check if this link corresponds to the active section
              const isActive = activeSection === link.id || 
                             (activeSection === 'cases-teaser' && link.id === 'cases') ||
                             (link.id === 'hero' && activeSection === 'hero');
              
              return (
                <a
                  key={link.id}
                  href={`#${link.id}`}
                  onClick={handleNavClick}
                  className={`relative font-semibold px-4 py-2 rounded-full transition-all duration-300 nav-link group ${
                    isActive
                      ? 'text-violet-300 bg-violet-600/20 border border-violet-400/40'
                      : 'text-neutral-300 hover:text-white hover:bg-violet-500/10'
                  }`}
                >
                  <span className="relative z-10 tracking-wide">{link.label}</span>
                  
                  {/* Active section indicator dot */}
                  {isActive && (
                    <div className="absolute -top-1 left-1/2 transform -translate-x-1/2">
                      <div className="w-2 h-2 bg-violet-400 rounded-full animate-pulse"></div>
                      <div className="absolute inset-0 w-2 h-2 bg-violet-400 rounded-full animate-ping opacity-75"></div>
                    </div>
                  )}
                  
                  {/* Enhanced active section underline */}
                  <div className={`absolute -bottom-1 left-1/2 transform -translate-x-1/2 h-1 bg-violet-500 rounded-full transition-all duration-300 ${
                    isActive ? 'w-12 opacity-100' : 'w-0 opacity-0 group-hover:w-8 group-hover:opacity-70'
                  }`}></div>
                </a>
              );
            })}
          </nav>
          
          {/* Enhanced Desktop Actions */}
          <div className="hidden md:flex items-center space-x-3 lg:space-x-6">
            <div className="language-switcher-container">
              <LanguageSwitcher />
            </div>
            {user ? (
                <button 
                  onClick={handleLogout} 
                  className="bg-red-600 hover:bg-red-500 text-white font-semibold py-2 lg:py-3 px-4 lg:px-8 rounded-xl transition-colors duration-300 transform hover:scale-105 text-sm lg:text-base"
                >
                  {t('header.logout')}
                </button>
            ) : (
                <a 
                  href="#login" 
                  onClick={(e) => handleNavClick(e, 'login')} 
                  className="bg-violet-600 hover:bg-violet-500 text-white font-semibold py-2 lg:py-3 px-4 lg:px-8 rounded-xl transition-colors duration-300 transform hover:scale-105 text-sm lg:text-base"
                >
                  {t('header.login')}
                </a>
            )}
          </div>
          
          {/* Enhanced Mobile Menu Button */}
          <button 
            className="md:hidden relative p-3 text-white z-50 mobile-menu-btn transition-all duration-300 hover:bg-violet-500/20 rounded-lg" 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <div className="absolute inset-0 bg-violet-500/10 rounded-lg opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
            {isMobileMenuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 relative z-10 transform rotate-0 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
            )}
          </button>
        </div>
        
        {/* Navbar Shimmer Effects CSS */}
      <style dangerouslySetInnerHTML={{__html: `
          .mobile-menu-btn {
            background: rgba(139, 92, 246, 0.1);
            border: 1px solid rgba(139, 92, 246, 0.3);
          }
      `}} />
      </header>
      {/* The Mobile Menu component itself, which is toggled by state */}
      <MobileMenu isOpen={isMobileMenuOpen} onLinkClick={handleLinkClick} handleNavClick={handleNavClick} />
    </>
  );
};

export default Header;