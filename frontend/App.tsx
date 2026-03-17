import React, { useState, useEffect } from 'react';
import './styles/buttonGlowEffects.css';
import Header from './components/Header.tsx';
import Hero from './components/Hero.tsx';
import ResidentSection from './components/ResidentSection.tsx';
import LocationSection from './components/ProcessSection.tsx';
import GamesSection from './components/TeachersSection.tsx';
import HardwareSection from './components/PartnersSection.tsx';
import FAQSection from './components/FAQSection.tsx';
import EnrollSection from './components/EnrollSection.tsx';
import Footer from './components/Footer.tsx';
import { useScrollAnimation } from './hooks/useScrollAnimation.ts';
import GallerySection from './components/GallerySection.tsx';
import PlaystationSection from './components/PlaystationSection.tsx';
import PS5GamesSection from './components/PS5GamesSection.tsx';
import PS4GamesSection from './components/PS4GamesSection.tsx';
import CasesPage from './components/CasesSection.tsx';
import CabinetPage from './components/CabinetPage.tsx';
import LoginPage from './components/LoginPage.tsx';
import AdminPage from './components/AdminPage.tsx';
import RegisterPage from './components/RegisterPage.tsx';
import ForgotPasswordPage from './components/ForgotPasswordPage.tsx';
import ResetPasswordPage from './components/ResetPasswordPage.tsx';
import OTPEntryPage from './components/OTPEntryPage.tsx';
import Food from './pages/Food.tsx';
import { useAuth } from './contexts/AuthContext.tsx';
import CasesTeaserSection from './components/CasesTeaserSection.tsx';

// Define the possible pages/routes in the application.
// This is used for simple, state-based routing instead of a library like React Router.
export type Page = 'home' | 'food' | 'cases' | 'cabinet' | 'login' | 'admin' | 'register' | 'forgotPassword' | 'resetPassword' | 'otpVerification';

/**
 * A wrapper component that applies a scroll-triggered fade-in animation.
 * It uses the `useScrollAnimation` custom hook.
 * @param {React.ReactNode} children - The content to be animated.
 * @param {string} [id] - An optional ID for the section, used for anchor linking.
 */
const AnimatedSection: React.FC<{children: React.ReactNode, id?: string}> = ({ children, id }) => {
  const ref = useScrollAnimation(); // The hook returns a ref to attach to the DOM element.
  return (
    <div ref={ref} id={id} className="opacity-0 translate-y-10 transition-all duration-700 ease-out">
      {children}
    </div>
  );
};

/**
 * Component that lays out all the sections for the main homepage.
 * This keeps the main App component cleaner.
 * @param {function} setPage - Function to change the current page.
 */
const HomePageContent: React.FC<{ setPage: (page: Page) => void }> = ({ setPage }) => (
  <>
    <main>
      <Hero />
      {/* Each main section is wrapped in AnimatedSection for the scroll effect */}
      <AnimatedSection id="resident"><ResidentSection /></AnimatedSection>
      <AnimatedSection id="cases-teaser"><CasesTeaserSection setPage={setPage} /></AnimatedSection>
      <AnimatedSection id="hardware"><HardwareSection /></AnimatedSection>
      <AnimatedSection id="games"><GamesSection /></AnimatedSection>
      <AnimatedSection id="gallery"><GallerySection /></AnimatedSection>
      <AnimatedSection id="playstation"><PlaystationSection /></AnimatedSection>
      <AnimatedSection id="ps5games"><PS5GamesSection /></AnimatedSection>
      <AnimatedSection id="ps4games"><PS4GamesSection /></AnimatedSection>
      <AnimatedSection id="location"><LocationSection /></AnimatedSection>
      <AnimatedSection id="faq"><FAQSection /></AnimatedSection>
      <AnimatedSection id="booking"><EnrollSection /></AnimatedSection>
    </main>
    <Footer />
  </>
);


/**
 * The main App component. It acts as the root of the application's UI,
 * managing routing, user authentication state, and rendering the correct page.
 */
const App: React.FC = () => {
  // State to manage which page is currently displayed.
  const [page, setPage] = useState<Page>('home');
  // State to pass the user's email between forgot password and reset password pages.
  const [emailForReset, setEmailForReset] = useState<string | null>(null);
   // State to pass the user's email between registration and OTP verification pages.
  const [emailForOtp, setEmailForOtp] = useState<string | null>(null);
  // Get user authentication status from the AuthContext.
  const { user, loading } = useAuth();

  // This effect handles protected routes.
  // It runs whenever the page, user, or loading state changes.
  useEffect(() => {
    // If the data is still loading, do nothing yet.
    if (loading) return;

    // Redirect to login if a non-logged-in user tries to access protected pages.
    if (!user && (page === 'cases' || page === 'cabinet' || page === 'admin')) {
        setPage('login');
    }
     // Redirect non-admin users away from the admin page.
    if (user && page === 'admin' && user.role !== 'admin') {
        setPage('home');
    }
  }, [page, user, loading]);

  // This effect manages the body's background class.
  // The 'cabinet' and 'cases' pages have a plain black background,
  // while the homepage has a background image.
  useEffect(() => {
    if (page === 'cabinet' || page === 'cases') {
      document.body.classList.add('cabinet-bg');
    } else {
      document.body.classList.remove('cabinet-bg');
    }
    // Cleanup function: remove the class when the component unmounts or page changes.
    return () => {
      document.body.classList.remove('cabinet-bg');
    };
  }, [page]);


  // This function determines which page component to render based on the `page` state.
  const renderPage = () => {
    // Show a loading indicator while the authentication state is being determined.
    if (loading) {
        return <div className="min-h-screen flex items-center justify-center text-white">Loading...</div>;
    }

    // A switch statement to handle the simple routing.
    switch(page) {
      case 'home':
        return <HomePageContent setPage={setPage} />;
      case 'food':
        return <Food />;
      // For protected pages, we do a final check for the user object.
      case 'cases':
        return user ? <CasesPage setPage={setPage} /> : <LoginPage setPage={setPage} />;
      case 'cabinet':
        return user ? <CabinetPage setPage={setPage} /> : <LoginPage setPage={setPage} />;
      case 'login':
        return <LoginPage setPage={setPage} />;
      case 'register':
        return <RegisterPage setPage={setPage} setEmailForOtp={setEmailForOtp} />;
      case 'otpVerification':
        return <OTPEntryPage setPage={setPage} email={emailForOtp} />;
      case 'forgotPassword':
        return <ForgotPasswordPage setPage={setPage} setEmailForReset={setEmailForReset} />;
      case 'resetPassword':
        return <ResetPasswordPage setPage={setPage} emailForReset={emailForReset} />;
      case 'admin':
          // The admin page has a double-check to ensure only an admin user can see it.
          return user && user.role === 'admin' ? <AdminPage setPage={setPage} /> : <HomePageContent setPage={setPage} />;
      default:
        return <HomePageContent setPage={setPage} />;
    }
  };

  return (
    // Main wrapper div for the entire application.
    <div className="text-neutral-200 font-sans antialiased relative overflow-x-hidden">
      {/* Decorative background gradient and blur elements */}
       <div className="absolute top-0 right-[-20%] w-96 h-96 bg-purple-600/10 rounded-full blur-3xl -z-10"></div>
      <div className="absolute top-[20%] left-[-10%] w-96 h-96 bg-purple-600/10 rounded-full blur-3xl -z-10"></div>
      
      {/* The Header is always visible, outside the main page rendering logic. */}
      <Header setPage={setPage} page={page} />
      
      {/* Render the currently active page */}
      {renderPage()}

    </div>
  );
};

export default App;