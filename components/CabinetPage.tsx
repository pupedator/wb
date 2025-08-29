import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext.tsx';
import type { CaseHistoryItem } from '../types.ts';
import CaseHistory from './CaseHistory.tsx';
import { useAuth } from '../contexts/AuthContext.tsx';
import type { Page } from '../App.tsx';

/**
 * The CabinetPage component displays the logged-in user's profile information,
 * their bonus points, and their case opening history.
 */
const CabinetPage: React.FC<{ setPage: (page: Page) => void }> = ({ setPage }) => {
    const { t, language } = useLanguage();
    const { user, updateUser } = useAuth();
    // State to hold the user's case opening history.
    const [history, setHistory] = useState<CaseHistoryItem[]>([]);
    // State to hold the new avatar image as a base64 string before it's saved.
    const [newAvatar, setNewAvatar] = useState<string | null>(null);
    // State for displaying success or error messages (e.g., after avatar upload).
    const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
    // A ref to the hidden file input element to trigger it programmatically.
    const fileInputRef = useRef<HTMLInputElement>(null);

    // On component mount, load the case history from localStorage.
    useEffect(() => {
        const savedHistory = localStorage.getItem('pixelCaseHistory');
        if (savedHistory) {
            setHistory(JSON.parse(savedHistory));
        }
    }, []);

    // If the user data is not yet available (e.g., page loaded directly), don't render anything.
    // The main App component's protected route logic will handle redirection.
    if (!user) {
        return null;
    }

    // Format the registration date based on the current language.
    const registrationDate = user.registrationDate 
        ? new Date(user.registrationDate).toLocaleDateString(language, { year: 'numeric', month: 'long', day: 'numeric' })
        : 'N/A';
        
    /**
     * Handles the file selection for the new avatar.
     * It reads the selected image file and converts it to a base64 Data URL for preview.
     */
    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewAvatar(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };
    
    /**
     * Saves the new avatar. It updates the user's profile in the AuthContext
     * and shows a confirmation message.
     */
    const handleAvatarSave = () => {
        if (newAvatar && user) {
            try {
                // Update the user profile in the global state.
                updateUser({ ...user, avatar: newAvatar });
                setMessage({ type: 'success', text: t('cabinet_page.avatar_upload_success') });
                setNewAvatar(null); // Clear the preview state.
            } catch (error) {
                 setMessage({ type: 'error', text: t('cabinet_page.avatar_upload_error') });
            }
            // The message will disappear after 3 seconds.
            setTimeout(() => setMessage(null), 3000);
        }
    };

    return (
        <main className="min-h-screen pt-24 pb-16">
            <div className="container mx-auto px-6">
                <button onClick={() => setPage('cases')} className="flex items-center space-x-2 text-neutral-300 hover:text-purple-400 transition-colors mb-8">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    <span>{t('cabinet_page.back_to_cases')}</span>
                </button>
                <h1 className="text-4xl md:text-5xl font-bold text-center mb-12 text-white" dangerouslySetInnerHTML={{ __html: t('cabinet_page.title') }} />

                <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                    {/* Profile Information Card */}
                    <div className="md:col-span-1 bg-neutral-900/50 border border-neutral-800 rounded-xl p-6 flex flex-col items-center text-center">
                        <div className="relative group">
                            <img src={newAvatar || user.avatar} alt="User Avatar" className="w-24 h-24 rounded-full border-4 border-purple-500/50 mb-4 object-cover" />
                            {/* Overlay button to change avatar, appears on hover */}
                            <button onClick={() => fileInputRef.current?.click()} className="absolute inset-0 w-24 h-24 bg-black/70 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            </button>
                            {/* Hidden file input */}
                            <input type="file" ref={fileInputRef} onChange={handleAvatarChange} accept="image/*" className="hidden" />
                        </div>
                        {/* "Save" button appears only when a new avatar has been selected */}
                        {newAvatar && (
                             <button onClick={handleAvatarSave} className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-1 px-4 text-sm rounded-lg transition-all duration-300 mb-2">
                                {t('cabinet_page.save_avatar')}
                            </button>
                        )}
                        
                        <h2 className="text-2xl font-bold text-white">{user.name}</h2>

                        {/* Display success/error messages */}
                        {message && (
                            <p className={`text-sm mt-2 ${message.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>{message.text}</p>
                        )}

                        <div className="text-left w-full mt-4 space-y-2 text-sm">
                            <p className="text-neutral-400"><span className="font-semibold">{t('cabinet_page.user_id')}:</span> {user.id}</p>
                             <p className="text-neutral-400"><span className="font-semibold">{t('cabinet_page.email')}:</span> {user.email}</p>
                             <p className="text-neutral-400"><span className="font-semibold">{t('cabinet_page.member_since')}:</span> {registrationDate}</p>
                        </div>
                        <div className="mt-6 w-full bg-neutral-950 p-4 rounded-lg">
                            <p className="text-neutral-400 text-sm uppercase tracking-wider">{t('cabinet_page.account_status')}</p>
                            <p className="text-lg font-bold text-green-400 capitalize">{user.status || 'Active'}</p>
                            <p className="text-xs text-neutral-500 mt-1">{t('cabinet_page.access_level')}: {user.role}</p>
                        </div>
                    </div>

                    {/* Case History Section */}
                    <div className="md:col-span-2">
                        <h2 className="text-3xl font-bold text-left mb-6 text-white">{t('cases_page.history_title')}</h2>
                        {/* Display only the 5 most recent winnings */}
                        <CaseHistory history={history.slice(0, 5)} />
                    </div>
                </div>
            </div>
        </main>
    );
};

export default CabinetPage;