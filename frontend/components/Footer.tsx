import React from 'react';
import { useLanguage } from '../contexts/LanguageContext.tsx';

const SocialIcon: React.FC<{ children: React.ReactNode, href: string }> = ({ children, href }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-neutral-500 hover:text-purple-400 transition-colors duration-300">
        {children}
    </a>
);

const Footer: React.FC = () => {
  const { t, navLinks, bookingLink } = useLanguage();

  const handleNavClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    const targetId = event.currentTarget.getAttribute('href')?.substring(1);
    if (targetId) {
      if (targetId === 'hero') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <footer className="bg-neutral-950/90 backdrop-blur-sm border-t border-purple-500/20">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <a href="#hero" onClick={handleNavClick} className="inline-block mb-4">
               <img src="https://i.ibb.co/5WBFyxC3/Pixel.png" alt="Pixel" className="h-12 w-auto" />
            </a>
            <p className="text-neutral-400 max-w-xs">{t('footer.description')}</p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">{t('footer.links_title')}</h4>
            <ul className="space-y-2">
              {navLinks.map(link => (
                <li key={link.id}><a href={`#${link.id}`} onClick={handleNavClick} className="text-neutral-400 hover:text-purple-400">{link.label}</a></li>
              ))}
               <li><a href={bookingLink} target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-purple-400">{t('header.book_now')}</a></li>
            </ul>
          </div>
           <div>
            <h4 className="font-semibold text-white mb-4">{t('footer.contact_title')}</h4>
            <ul className="space-y-3">
              <li className="flex items-center space-x-2 text-neutral-400 hover:text-purple-400 transition-colors duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <a href="tel:+994552966003">+994552966003</a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">{t('footer.social_title')}</h4>
            <div className="flex space-x-4">
               <SocialIcon href="https://api.whatsapp.com/send/?phone=994552966003&text&type=phone_number&app_absent=0">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-label="WhatsApp"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 12c0 1.77.46 3.45 1.28 4.88L2.07 22l5.27-1.38c1.37.81 2.94 1.28 4.6 1.28 5.46 0 9.91-4.45 9.91-9.9S17.5 2 12.04 2zM12.04 20.15c-1.42 0-2.8-.36-4.04-.98l-.29-.17-3 .78.8-2.92-.19-.31c-.7-1.15-1.11-2.48-1.11-3.88 0-4.42 3.59-8.02 8.02-8.02s8.02 3.59 8.02 8.02c0 4.42-3.6 8.02-8.02 8.02zm3.32-5.44c-.26-.13-1.53-.76-1.77-.84s-.42-.13-.6.13c-.18.26-.67.84-.82 1.01-.15.18-.3.2-.56.06-.26-.13-1.09-.4-2.08-1.28-.77-.69-1.29-1.54-1.44-1.8s-.03-.25.11-.38c.13-.13.29-.34.43-.51s.18-.29.28-.48.05-.38-.03-.51c-.08-.13-.6-1.44-.82-1.97-.22-.52-.44-.45-.6-.45s-.34-.03-.51-.03c-.18 0-.46.08-.7.34-.23.26-.88.86-.88 2.1s.9 2.43 1.03 2.6c.13.18 1.76 2.68 4.27 3.76 2.5 1.08 2.5.72 2.94.7s1.38-.56 1.57-1.11c.2-.55.2-1.02.13-1.11s-.25-.15-.51-.28z"/></svg>
              </SocialIcon>
              <SocialIcon href="https://www.instagram.com/">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-label="Instagram"><path d="M7.8,2H16.2C19.4,2 22,4.6 22,7.8V16.2A5.8,5.8 0 0,1 16.2,22H7.8C4.6,22 2,19.4 2,16.2V7.8A5.8,5.8 0 0,1 7.8,2M7.6,4A3.6,3.6 0 0,0 4,7.6V16.4C4,18.39 5.61,20 7.6,20H16.4A3.6,3.6 0 0,0 20,16.4V7.6C20,5.61 18.39,4 16.4,4H7.6M17.25,5.5A1.25,1.25 0 0,1 18.5,6.75A1.25,1.25 0 0,1 17.25,8A1.25,1.25 0 0,1 16,6.75A1.25,1.25 0 0,1 17.25,5.5M12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9Z"></path></svg>
              </SocialIcon>
            </div>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-neutral-800 text-center text-neutral-500">
          <p>&copy; {new Date().getFullYear()} {t('footer.copyright')}</p>
          <p className="text-sm mt-2">
            Made by <a href="https://www.linkedin.com/in/kamal-mahmud-060429294/" target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-purple-400 transition-colors duration-300">Mahmud Kamal</a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;