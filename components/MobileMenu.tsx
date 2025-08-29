import React from 'react';
import { useLanguage } from '../contexts/LanguageContext.tsx';
import LanguageSwitcher from './LanguageSwitcher.tsx';
import { useAuth } from '../contexts/AuthContext.tsx';

interface MobileMenuProps {
  isOpen: boolean;
  onLinkClick: () => void;
  handleNavClick: (event: React.MouseEvent<HTMLAnchorElement>) => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onLinkClick, handleNavClick }) => {
  const { navLinks, t } = useLanguage();
  const { user, logout } = useAuth();

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
    <div className={`fixed inset-0 bg-black/95 backdrop-blur-lg z-40 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'} md:hidden`}>
      <div className="container mx-auto h-full flex flex-col items-center justify-center space-y-8">
        <nav className="flex flex-col items-center space-y-6">
          {authenticatedNavLinks.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              onClick={handleNavClick}
              className="text-2xl font-semibold text-neutral-300 hover:text-purple-400 transition-colors duration-300"
            >
              {link.label}
            </a>
          ))}
        </nav>
         {user ? (
             <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-300">
                {t('header.logout')}
             </button>
         ) : (
            <a href="#login" onClick={handleNavClick} className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-300">
              {t('header.login')}
            </a>
         )}
        <div className="pt-8">
          <LanguageSwitcher />
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;