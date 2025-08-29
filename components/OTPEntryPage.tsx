import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext.tsx';
import { useAuth } from '../contexts/AuthContext.tsx';
import type { Page } from '../App.tsx';

interface OTPEntryPageProps {
    setPage: (page: Page) => void;
    email: string | null;
}

/**
 * A component for entering a 6-digit One-Time Password (OTP).
 * It features individual input boxes for each digit and handles user input
 * for a smooth experience (auto-focusing next input, backspace, paste).
 */
const OTPEntryPage: React.FC<OTPEntryPageProps> = ({ setPage, email }) => {
    const { t } = useLanguage();
    const { verifyOtpAndCompleteRegistration, resendOtp } = useAuth();
    // The OTP is stored as an array of strings, one for each input box.
    const [otp, setOtp] = useState<string[]>(new Array(6).fill(''));
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    // State for the "Resend Code" button cooldown.
    const [resendCooldown, setResendCooldown] = useState(60);
    const [resendMessage, setResendMessage] = useState('');
    // An array of refs to manage focus on the input boxes.
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Effect to handle initialization and error cases.
    useEffect(() => {
        if (!email) {
            // If the page is loaded without an email (e.g., direct navigation), redirect back to registration.
            setError('No email found. Please start registration again.');
            setTimeout(() => setPage('register'), 3000);
        } else {
             // Automatically focus the first input box on page load.
             inputRefs.current[0]?.focus();
        }
    }, [email, setPage]);
    
    // Effect to manage the resend cooldown timer.
    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>;
        if (resendCooldown > 0) {
            timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
        }
        return () => clearTimeout(timer); // Cleanup timer on unmount.
    }, [resendCooldown]);


    /**
     * Handles changes to an individual OTP input box.
     */
    const handleChange = (element: HTMLInputElement, index: number) => {
        // Only allow numeric input.
        if (isNaN(Number(element.value))) return;

        const newOtp = [...otp];
        newOtp[index] = element.value;
        setOtp(newOtp);

        // If a digit was entered, automatically focus the next input box.
        if (element.nextSibling && element.value) {
            (element.nextSibling as HTMLInputElement).focus();
        }
    };

    /**
     * Handles the Backspace key to allow easy correction.
     */
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        // If Backspace is pressed on an empty input, focus the previous input.
        if (e.key === 'Backspace' && !otp[index] && index > 0 && inputRefs.current[index - 1]) {
            inputRefs.current[index - 1]!.focus();
        }
    };

    /**
     * Handles pasting a code into the OTP inputs.
     */
     const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        const paste = e.clipboardData.getData('text');
        // If the pasted text is a 6-digit number, fill all the inputs.
        if (/^\d{6}$/.test(paste)) {
            const newOtp = paste.split('');
            setOtp(newOtp);
            // Focus the last input after pasting.
            if (inputRefs.current[5]) {
                 inputRefs.current[5]!.focus();
            }
        }
    };

    /**
     * Handles the form submission to verify the OTP.
     */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;
        
        const finalOtp = otp.join('');
        setError('');
        setIsLoading(true);
        const result = await verifyOtpAndCompleteRegistration(email, finalOtp);

        if (result.success) {
            setPage('cases'); // On success, navigate to the main app.
        } else {
            setError(t('otp_page.error_invalid_code'));
        }
        setIsLoading(false);
    };

    /**
     * Handles the "Resend Code" action.
     */
    const handleResend = async () => {
        if (!email || resendCooldown > 0) return;

        setResendCooldown(60); // Reset the cooldown.
        setError('');
        setResendMessage('');

        const result = await resendOtp(email);
        if (result.success) {
            setResendMessage(t('otp_page.resend_success'));
            setTimeout(() => setResendMessage(''), 3000);
        } else {
            setError('Failed to resend code. Please try again.');
        }
    };

    return (
        <main className="min-h-screen flex items-center justify-center pt-24 pb-16">
            <div className="container mx-auto px-6 max-w-md">
                <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-8 shadow-2xl shadow-purple-600/10">
                    <h1 className="text-3xl font-bold text-center text-white mb-2">{t('otp_page.title')}</h1>
                    <p className="text-center text-neutral-400 mb-8">
                        {t('otp_page.subtitle')}{' '}
                        <span className="font-semibold text-white">{email}</span>.
                    </p>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="otp-0" className="block text-sm font-medium text-neutral-300 mb-2 text-center">{t('otp_page.otp_label')}</label>
                            <div className="flex justify-center items-center gap-2 md:gap-3" onPaste={handlePaste}>
                                {otp.map((data, index) => (
                                    <input
                                        id={`otp-${index}`}
                                        key={index}
                                        type="text"
                                        name="otp"
                                        maxLength={1}
                                        value={data}
                                        onChange={e => handleChange(e.target, index)}
                                        onKeyDown={e => handleKeyDown(e, index)}
                                        onFocus={e => e.target.select()}
                                        ref={el => { inputRefs.current[index] = el; }}
                                        className="otp-input border-neutral-700 text-white focus:border-purple-500"
                                        aria-label={`OTP digit ${index + 1}`}
                                    />
                                ))}
                            </div>
                        </div>
                       
                        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                        {resendMessage && <p className="text-green-400 text-sm text-center">{resendMessage}</p>}

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading || !email || otp.join('').length !== 6}
                                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:bg-neutral-600 disabled:cursor-not-allowed"
                            >
                                {isLoading ? 'Verifying...' : t('otp_page.verify_button')}
                            </button>
                        </div>
                    </form>
                    <div className="text-center mt-6">
                         <button
                            onClick={handleResend}
                            disabled={resendCooldown > 0}
                            className="text-sm font-semibold text-purple-400 hover:text-purple-300 disabled:text-neutral-500 disabled:cursor-not-allowed"
                        >
                            {resendCooldown > 0 
                                ? t('otp_page.resend_cooldown').replace('{seconds}', String(resendCooldown))
                                : t('otp_page.resend_button')}
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default OTPEntryPage;