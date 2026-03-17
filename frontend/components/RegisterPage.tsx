import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext.tsx';
import { useAuth } from '../contexts/AuthContext.tsx';
import type { Page } from '../App.tsx';

interface RegisterPageProps {
    setPage: (page: Page) => void;
    setEmailForOtp: (email: string) => void;
}

const PasswordRequirement: React.FC<{ label: string; met: boolean }> = ({ label, met }) => (
    <div className={`flex items-center transition-colors text-xs ${met ? 'text-green-400' : 'text-neutral-500'}`}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            {met ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            )}
        </svg>
        <span>{label}</span>
    </div>
);


const RegisterPage: React.FC<RegisterPageProps> = ({ setPage, setEmailForOtp }) => {
    const { t } = useLanguage();
    const { register } = useAuth();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [passwordValidation, setPasswordValidation] = useState({
        minLength: false,
        hasUpper: false,
        hasLower: false,
        hasNumber: false,
        hasSpecial: false,
    });
    
    const validatePassword = (pass: string) => {
        const minLength = pass.length >= 8;
        const hasUpper = /[A-Z]/.test(pass);
        const hasLower = /[a-z]/.test(pass);
        const hasNumber = /\d/.test(pass);
        const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(pass);
        setPasswordValidation({ minLength, hasUpper, hasLower, hasNumber, hasSpecial });
        return minLength && hasUpper && hasLower && hasNumber && hasSpecial;
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newPassword = e.target.value;
        setPassword(newPassword);
        validatePassword(newPassword);
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        if (!validatePassword(password)) {
            setError('Password does not meet all requirements.');
            return;
        }
        
        setIsLoading(true);

        const result = await register(name, email, password);
        
        if (result.success) {
            setEmailForOtp(email);
            setPage('otpVerification');
        } else {
            if (result.message === 'Email already exists') {
                setError(t('register_page.error_exists'));
            } else {
                setError(result.message || t('register_page.error_general'));
            }
        }
        setIsLoading(false);
    };

    return (
        <main className="min-h-screen flex items-center justify-center pt-24 pb-16">
            <div className="container mx-auto px-6 max-w-md">
                <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-8 shadow-2xl shadow-purple-600/10">
                    <h1 className="text-3xl font-bold text-center text-white mb-2">{t('register_page.title')}</h1>
                    <p className="text-center text-neutral-400 mb-8">{t('register_page.subtitle')}</p>
                    <form onSubmit={handleSubmit} className="space-y-6">
                         <div>
                            <label htmlFor="name" className="block text-sm font-medium text-neutral-300 mb-2">{t('register_page.name_label')}</label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                autoComplete="name"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full glow-input rounded-lg px-4 py-3 placeholder-neutral-500"
                                placeholder="Your Name"
                            />
                        </div>
                        <div>
                            <label htmlFor="email-register" className="block text-sm font-medium text-neutral-300 mb-2">{t('register_page.email_label')}</label>
                            <input
                                id="email-register"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full glow-input rounded-lg px-4 py-3 placeholder-neutral-500"
                                placeholder="you@example.com"
                            />
                        </div>
                        <div>
                            <label htmlFor="password-register" className="block text-sm font-medium text-neutral-300 mb-2">{t('register_page.password_label')}</label>
                            <input
                                id="password-register"
                                name="password"
                                type="password"
                                autoComplete="new-password"
                                required
                                value={password}
                                onChange={handlePasswordChange}
                                className="w-full glow-input rounded-lg px-4 py-3 placeholder-neutral-500"
                                placeholder="••••••••"
                            />
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-3">
                                <PasswordRequirement label="8+ characters" met={passwordValidation.minLength} />
                                <PasswordRequirement label="1 uppercase" met={passwordValidation.hasUpper} />
                                <PasswordRequirement label="1 lowercase" met={passwordValidation.hasLower} />
                                <PasswordRequirement label="1 number" met={passwordValidation.hasNumber} />
                                <PasswordRequirement label="1 special" met={passwordValidation.hasSpecial} />
                            </div>
                        </div>

                        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading || !Object.values(passwordValidation).every(Boolean)}
                                className="w-full glow-btn glow-btn-success glow-btn-md"
                            >
                                {isLoading ? 'Registering...' : t('register_page.register_button')}
                            </button>
                        </div>
                    </form>
                    <p className="text-center text-sm text-neutral-400 mt-6">
                        {t('register_page.has_account')}{' '}
                        <a href="#" onClick={(e) => { e.preventDefault(); setPage('login'); }} className="font-semibold text-purple-400 hover:text-purple-300">
                            {t('register_page.login_link')}
                        </a>
                    </p>
                </div>
            </div>
        </main>
    );
};

export default RegisterPage;