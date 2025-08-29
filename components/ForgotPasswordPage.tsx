
import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext.tsx';
import { useAuth } from '../contexts/AuthContext.tsx';
import type { Page } from '../App.tsx';

interface ForgotPasswordPageProps {
    setPage: (page: Page) => void;
    setEmailForReset: (email: string) => void;
}

const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({ setPage, setEmailForReset }) => {
    const { t } = useLanguage();
    const { forgotPassword } = useAuth();
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');
        setIsLoading(true);
        const result = await forgotPassword(email);
        if (result.success) {
            setEmailForReset(email);
            setMessage(t('forgot_password_page.success_message'));
            setTimeout(() => {
                setPage('resetPassword');
            }, 3000);
        }
        // We don't show an error state to prevent email enumeration
        setIsLoading(false);
    };

    return (
        <main className="min-h-screen flex items-center justify-center pt-24 pb-16">
            <div className="container mx-auto px-6 max-w-md">
                <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-8 shadow-2xl shadow-purple-600/10">
                    <h1 className="text-3xl font-bold text-center text-white mb-2">{t('forgot_password_page.title')}</h1>
                    <p className="text-center text-neutral-400 mb-8">{t('forgot_password_page.subtitle')}</p>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="email-forgot" className="block text-sm font-medium text-neutral-300 mb-2">{t('forgot_password_page.email_label')}</label>
                            <input
                                id="email-forgot"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-4 py-3 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
                                placeholder="you@example.com"
                            />
                        </div>

                        {message && <p className="text-green-400 text-sm text-center">{message}</p>}

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:bg-neutral-600 disabled:cursor-not-allowed"
                            >
                                {isLoading ? 'Sending...' : t('forgot_password_page.send_code_button')}
                            </button>
                        </div>
                    </form>
                     <p className="text-center text-sm text-neutral-400 mt-6">
                        <a href="#" onClick={(e) => { e.preventDefault(); setPage('login'); }} className="font-semibold text-purple-400 hover:text-purple-300">
                            {t('forgot_password_page.back_to_login')}
                        </a>
                    </p>
                </div>
            </div>
        </main>
    );
};

export default ForgotPasswordPage;
