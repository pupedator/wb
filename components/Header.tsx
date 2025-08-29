import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext.tsx';
import LanguageSwitcher from './LanguageSwitcher.tsx';
import MobileMenu from './MobileMenu.tsx';
import type { Page } from '../App.tsx';
import { useAuth } from '../contexts/AuthContext.tsx';

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
    if (id === 'cases' || id === 'cabinet' || id === 'admin' || id === 'login') {
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
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-black/80 backdrop-blur-lg border-b border-purple-500/20' : 'bg-transparent'}`}>
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <a href="#hero" onClick={(e) => handleNavClick(e, 'hero')} className="flex items-center">
            <img src="https://i.ibb.co/5WBFyxC3/Pixel.png" alt="Pixel" className="h-10 w-auto" />
          </a>
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {authenticatedNavLinks.map((link) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                onClick={handleNavClick}
                className="text-neutral-300 hover:text-purple-400 transition-colors duration-300"
              >
                {link.label}
              </a>
            ))}
          </nav>
          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
             <LanguageSwitcher />
            {user ? (
                 <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-300">
                    {t('header.logout')}
                 </button>
            ) : (
                <a href="#login" onClick={(e) => handleNavClick(e, 'login')} className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-300 transform hover:scale-105">
                    {t('header.login')}
                </a>
            )}
          </div>
          {/* Mobile Menu Button */}
          <button className="md:hidden text-white z-50" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? (
                // Close Icon (X)
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            ) : (
                // Hamburger Icon
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
            )}
          </button>
        </div>
      </header>
      {/* The Mobile Menu component itself, which is toggled by state */}
      <MobileMenu isOpen={isMobileMenuOpen} onLinkClick={handleLinkClick} handleNavClick={handleNavClick} />
    </>
  );
};

export default Header;