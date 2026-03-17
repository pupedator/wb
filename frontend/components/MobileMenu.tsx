import React from 'react';
import { useLanguage } from '../contexts/LanguageContext.tsx';
import LanguageSwitcher from './LanguageSwitcher.tsx';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useActiveSection } from '../hooks/useActiveSection.ts';

interface MobileMenuProps {
  isOpen: boolean;
  onLinkClick: () => void;
  handleNavClick: (event: React.MouseEvent<HTMLAnchorElement>) => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onLinkClick, handleNavClick }) => {
  const { navLinks, t } = useLanguage();
  const { user, logout } = useAuth();
  const activeSection = useActiveSection();

  const handleLogout = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      logout();
      handleNavClick(e as any);
  }
  
  const authenticatedNavLinks = navLinks.filter(link => {
      if (link.id === 'cabinet') return !!user;
      if (link.id === 'admin') return user?.role === 'admin';
      return true;
  });

  return (
    <div className={`fixed inset-0 bg-black/95 backdrop-blur-xl z-40 transform transition-all duration-500 ease-in-out ${isOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'} md:hidden`}>
      <div className="container mx-auto h-full flex flex-col items-center justify-center space-y-12 relative z-10">
        {/* Enhanced mobile navigation */}
        <nav className="flex flex-col items-center space-y-8">
          {authenticatedNavLinks.map((link, index) => {
            const isActive = activeSection === link.id || 
                           (activeSection === 'cases-teaser' && link.id === 'cases') ||
                           (link.id === 'hero' && activeSection === 'hero');
            
            return (
              <a
                key={link.id}
                href={`#${link.id}`}
                onClick={handleNavClick}
                className={`relative group mobile-nav-link px-6 py-3 rounded-2xl transition-all duration-300 ${
                  isActive
                    ? 'bg-violet-600/20 border border-violet-400/50'
                    : ''
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <span className={`text-3xl font-bold transition-all duration-300 relative z-10 ${
                  isActive 
                    ? 'text-white nav-link-active-mobile' 
                    : 'text-white hover:text-violet-300'
                }`}>
                  {link.label}
                </span>
                
                {/* Active underline */}
                <div className={`absolute -bottom-2 left-1/2 transform -translate-x-1/2 h-1 bg-violet-500 rounded-full transition-all duration-300 ${
                  isActive ? 'w-16 opacity-100' : 'w-0 opacity-0 group-hover:w-12 group-hover:opacity-70'
                }`}></div>
              </a>
            );
          })}
        </nav>
        
        {/* Enhanced action buttons */}
        <div className="flex flex-col items-center space-y-6">
          {user ? (
               <button
                 onClick={handleLogout}
                 className="bg-red-600 hover:bg-red-500 text-white font-bold py-4 px-12 rounded-2xl transition-colors duration-300 transform hover:scale-105"
               >
                  <span className="text-lg">{t('header.logout')}</span>
               </button>
           ) : (
              <a
                href="#login"
                onClick={handleNavClick}
                className="bg-violet-600 hover:bg-violet-500 text-white font-bold py-4 px-12 rounded-2xl transition-colors duration-300 transform hover:scale-105"
              >
                <span className="text-lg">{t('header.login')}</span>
              </a>
           )}
          
          {/* Enhanced language switcher container */}
          <div className="pt-8 mobile-language-switcher">
            <LanguageSwitcher />
          </div>
        </div>
      </div>
      
      {/* Mobile Menu Shimmer Effects CSS */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes mobileMenuSlideIn {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .mobile-nav-link {
          animation: mobileMenuSlideIn 0.5s ease-out forwards;
          opacity: 0;
        }
        .mobile-language-switcher {
          background: rgba(139, 92, 246, 0.1);
          padding: 1rem;
          border-radius: 1rem;
          border: 1px solid rgba(139, 92, 246, 0.3);
        }
      `}} />
    </div>
  );
};

export default MobileMenu;