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
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-2 h-2 bg-violet-400 rounded-full animate-pulse mobile-particle"></div>
        <div className="absolute top-40 right-20 w-1.5 h-1.5 bg-purple-500 rounded-full animate-ping mobile-particle delay-300"></div>
        <div className="absolute bottom-60 left-16 w-2.5 h-2.5 bg-blue-400 rounded-full animate-pulse mobile-particle delay-500"></div>
        <div className="absolute bottom-40 right-12 w-1.5 h-1.5 bg-indigo-400 rounded-full animate-ping mobile-particle delay-700"></div>
        <div className="absolute top-1/2 left-1/4 w-1 h-1 bg-violet-300 rounded-full animate-pulse mobile-particle delay-1000"></div>
        <div className="absolute top-1/3 right-1/3 w-1.5 h-1.5 bg-purple-300 rounded-full animate-ping mobile-particle delay-1200"></div>
      </div>
      
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
                
                {/* Active section indicator */}
                {isActive && (
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                    <div className="w-3 h-3 bg-violet-400 rounded-full animate-pulse"></div>
                    <div className="absolute inset-0 w-3 h-3 bg-violet-400 rounded-full animate-ping opacity-75"></div>
                  </div>
                )}
                
                {/* Enhanced underline for active/hover */}
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
        @keyframes mobileParticleFloat {
          0%, 100% { transform: translateY(0px) scale(1); opacity: 0.6; }
          50% { transform: translateY(-15px) scale(1.2); opacity: 1; }
        }
        .mobile-nav-link {
          animation: mobileMenuSlideIn 0.6s ease-out forwards;
          opacity: 0;
        }
        .mobile-particle {
          animation: mobileParticleFloat 4s ease-in-out infinite;
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