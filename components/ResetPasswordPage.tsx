import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext.tsx';
import { useAuth } from '../contexts/AuthContext.tsx';
import type { Page } from '../App.tsx';

interface ResetPasswordPageProps {
    setPage: (page: Page) => void;
    emailForReset: string | null;
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

const ResetPasswordPage: React.FC<ResetPasswordPageProps> = ({ setPage, emailForReset }) => {
    const { t } = useLanguage();
    const { resetPassword } = useAuth();
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [passwordValidation, setPasswordValidation] = useState({
        minLength: false,
        hasUpper: false,
        hasLower: false,
        hasNumber: false,
        hasSpecial: false,
    });

    useEffect(() => {
        if (!emailForReset) {
            setError(t('reset_password_page.no_email'));
        }
    }, [emailForReset, t]);
    
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
        const newPasswordValue = e.target.value;
        setNewPassword(newPasswordValue);
        validatePassword(newPasswordValue);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!emailForReset) return;

        if (!validatePassword(newPassword)) {
            setError('Password does not meet all requirements.');
            return;
        }
        
        setError('');
        setSuccessMessage('');
        setIsLoading(true);

        const result = await resetPassword(emailForReset, otp, newPassword);

        if (result.success) {
            setSuccessMessage(t('reset_password_page.success'));
             setTimeout(() => {
                setPage('login');
            }, 3000);
        } else {
            if (result.message === 'Invalid code' || result.message === 'Expired code') {
                 setError(t('reset_password_page.error_invalid_code'));
            } else {
                 setError(t('reset_password_page.error_general'));
            }
        }
        setIsLoading(false);
    };

    return (
        <main className="min-h-screen flex items-center justify-center pt-24 pb-16">
            <div className="container mx-auto px-6 max-w-md">
                <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-8 shadow-2xl shadow-purple-600/10">
                    <h1 className="text-3xl font-bold text-center text-white mb-2">{t('reset_password_page.title')}</h1>
                    <p className="text-center text-neutral-400 mb-8">{t('reset_password_page.subtitle')}</p>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="otp" className="block text-sm font-medium text-neutral-300 mb-2">{t('reset_password_page.otp_label')}</label>
                            <input
                                id="otp"
                                name="otp"
                                type="text"
                                required
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-4 py-3 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
                                placeholder="123456"
                            />
                        </div>
                         <div>
                            <label htmlFor="new-password" className="block text-sm font-medium text-neutral-300 mb-2">{t('reset_password_page.new_password_label')}</label>
                            <input
                                id="new-password"
                                name="new-password"
                                type="password"
                                required
                                value={newPassword}
                                onChange={handlePasswordChange}
                                className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-4 py-3 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
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
                        {successMessage && <p className="text-green-400 text-sm text-center">{successMessage}</p>}

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading || !emailForReset || !Object.values(passwordValidation).every(Boolean)}
                                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:bg-neutral-600 disabled:cursor-not-allowed"
                            >
                                {isLoading ? 'Resetting...' : t('reset_password_page.reset_button')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </main>
    );
};

export default ResetPasswordPage;