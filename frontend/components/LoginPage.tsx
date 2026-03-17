

import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext.tsx';
import { useAuth } from '../contexts/AuthContext.tsx';
import type { Page } from '../App.tsx';

interface LoginPageProps {
    setPage: (page: Page) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ setPage }) => {
    const { t } = useLanguage();
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        const result = await login(email, password);
        if (result.success) {
            setPage('cases');
        } else {
            if (result.message === 'banned') {
                setError(t('login_page.banned_error'));
            } else {
                setError(t('login_page.error'));
            }
        }
        setIsLoading(false);
    };

    return (
        <main className="min-h-screen flex items-center justify-center pt-24 pb-16">
            <div className="container mx-auto px-6 max-w-md">
                <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-8 shadow-2xl shadow-purple-600/10">
                    <h1 className="text-3xl font-bold text-center text-white mb-2">{t('login_page.title')}</h1>
                    <p className="text-center text-neutral-400 mb-8">{t('login_page.subtitle')}</p>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-neutral-300 mb-2">{t('login_page.email_label')}</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full glow-input rounded-lg px-4 py-3 placeholder-neutral-500"
                                placeholder="sample@email.com"
                            />
                        </div>
                        <div>
                             <div className="flex justify-between items-center">
                                <label htmlFor="password" className="block text-sm font-medium text-neutral-300 mb-2">{t('login_page.password_label')}</label>
                                <a href="#" onClick={(e) => { e.preventDefault(); setPage('forgotPassword'); }} className="text-xs text-purple-400 hover:text-purple-300">
                                    {t('login_page.forgot_password_link')}
                                </a>
                            </div>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full glow-input rounded-lg px-4 py-3 placeholder-neutral-500"
                                placeholder="••••••••"
                            />
                        </div>

                        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full glow-btn glow-btn-primary glow-btn-md"
                            >
                                {isLoading ? 'Logging in...' : t('login_page.login_button')}
                            </button>
                        </div>
                    </form>
                     <p className="text-center text-sm text-neutral-400 mt-6">
                        {t('login_page.no_account')}{' '}
                        <a href="#" onClick={(e) => { e.preventDefault(); setPage('register'); }} className="font-semibold text-purple-400 hover:text-purple-300">
                            {t('login_page.register_link')}
                        </a>
                    </p>
                </div>
            </div>
        </main>
    );
};

export default LoginPage;