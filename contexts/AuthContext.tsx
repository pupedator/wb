import React, { createContext, useState, useContext, useEffect, useMemo } from 'react';
import type { UserProfile, PromoCode } from '../types.ts';
import { translations } from '../i18n/translations.ts';

// This is for EmailJS integration - we load it from their CDN in index.html
// Kinda old school but it works and saves bundle size
declare const emailjs: any;


// --- Type Definitions for Function Results ---
type AuthResult = { success: boolean; message?: string; };
type OTPResult = { success: boolean; message?: string; };

// --- Context Shape Definition ---
// This interface defines all the state and functions that the AuthContext will provide.
interface AuthContextType {
  user: UserProfile | null; // The currently logged-in user, or null.
  loading: boolean; // True while checking for an existing session on initial load.
  login: (email: string, password?: string) => Promise<AuthResult>;
  register: (name: string, email: string, password?: string) => Promise<AuthResult>;
  verifyOtpAndCompleteRegistration: (email: string, otp: string) => Promise<AuthResult>;
  resendOtp: (email: string) => Promise<AuthResult>;
  logout: () => void;
  updateUser: (profile: UserProfile) => void;
  forgotPassword: (email: string) => Promise<OTPResult>;
  resetPassword: (email: string, otp: string, newPassword: string) => Promise<AuthResult>;
  // Admin functions
  getAllUsers: () => UserProfile[];
  adminResetPassword: (userId: string) => Promise<AuthResult>;
  toggleUserStatus: (userId: string) => Promise<AuthResult>;
  // Promo code functions
  getPromoCodes: () => Promise<PromoCode[]>;
  generatePromoCode: (caseId: string) => Promise<{ success: boolean; code?: string; message?: string }>;
  validateAndRedeemPromoCode: (code: string, caseId: string) => Promise<AuthResult & { reward?: any }>;
}

// Create the React Context object.
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- Local Storage Keys ---
// Using constants for keys prevents typos and makes management easier.
// This application uses localStorage to simulate a backend database for users and promo codes.
const MOCK_USERS_DB_KEY = 'pixelMockUsersDB';
const MOCK_PROMOS_DB_KEY = 'pixelMockPromosDB';
// Session storage is used for OTPs as they are temporary and should not persist across browser sessions.
const PASSWORD_RESET_OTP_KEY = 'pixelPasswordResetOTP';
const REGISTRATION_OTP_KEY = 'pixelRegistrationOTP';
// The auth token is stored in localStorage to keep the user logged in.
const AUTH_TOKEN_KEY = 'pixelAuthToken';


// --- Mock JWT (JSON Web Token) Implementation ---
// This is a simplified, insecure simulation of JWT for demonstration purposes.
// In a real application, JWTs would be created and verified on a secure server.

/**
 * Creates a base64-encoded mock token from a user object.
 * @param user - The user profile to encode in the token.
 * @returns A string representing the mock JWT.
 */
const createMockToken = (user: UserProfile): string => {
    const payload = {
        ...user,
        exp: Date.now() + 24 * 60 * 60 * 1000, // Token expires in 24 hours.
    };
    // A real JWT has a header, payload, and signature. We'll mimic this structure.
    const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' }));
    const encodedPayload = btoa(JSON.stringify(payload));
    return `${header}.${encodedPayload}.mock_signature`;
};

/**
 * Decodes a mock token back into a user object.
 * @param token - The mock JWT string.
 * @returns The user profile if the token is valid and not expired, otherwise null.
 */
const decodeMockToken = (token: string): UserProfile | null => {
    try {
        const [, payload] = token.split('.');
        if (!payload) return null;
        const decodedPayload = JSON.parse(atob(payload));
        
        // Check if the token has expired.
        if (decodedPayload.exp && Date.now() > decodedPayload.exp) {
            console.warn("Mock token has expired.");
            return null;
        }

        return decodedPayload as UserProfile;
    } catch (e) {
        console.error("Failed to decode mock token", e);
        return null;
    }
};


/**
 * The AuthProvider component provides authentication-related state and functions
 * to all child components. It handles user login, registration, logout, session
 * management, and other user-related actions.
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    // --- EmailJS Configuration ---
    // IMPORTANT: To enable email sending for OTPs, you MUST fill in these values
    // from your EmailJS account dashboard.
    const emailjsConfig = {
        serviceID: 'service_q0tx7hg',      // Your EmailJS Service ID
        templateID: 'template_jpxitjo',     // Your EmailJS Template ID
        publicKey: '2eAtWO3FOq9JHjHqh',       // Your EmailJS Public Key
    };

    /**
     * Sends an OTP email using the EmailJS service.
     * If the service is not configured correctly, it will log an error and a fallback OTP for development.
     */
    const sendOtpEmail = async (to_email: string, name: string, otp: string, subject: string): Promise<AuthResult> => {
        // HARD CHECK: Prevent sending if configuration is missing.
        if (!emailjsConfig.serviceID || emailjsConfig.serviceID === 'YOUR_SERVICE_ID') {
            const errorMessage = "EmailJS is not configured. Please update your Service ID, Template ID, and Public Key in contexts/AuthContext.tsx.";
            console.error(errorMessage);
            // Log the OTP for debugging in development when email sending is disabled.
            console.log(`[DEV ONLY] Email to ${to_email} was not sent. OTP: ${otp}`);
            return { success: false, message: "Email system not configured. Please contact support." };
        }

        try {
            // These parameters must match the variables in your EmailJS template.
            const templateParams = {
                email: to_email.trim().toLowerCase(),
                to_name: name,
                otp,
                subject,
            };
            await emailjs.send(emailjsConfig.serviceID, emailjsConfig.templateID, templateParams, emailjsConfig.publicKey);
            return { success: true };
        } catch (err: any) {
            console.error('Failed to send email via EmailJS:', err);
            return { success: false, message: "Could not send verification email. Please try again later." };
        }
    };


    // --- Database Initialization ---
    // On the very first load, this effect checks if our mock user database exists
    // in localStorage. If not, it creates it and adds the default admin user.
    useEffect(() => {
        const initializeDB = () => {
            if (!localStorage.getItem(MOCK_USERS_DB_KEY)) {
                const adminUser = translations.en.user_profile as UserProfile;
                localStorage.setItem(MOCK_USERS_DB_KEY, JSON.stringify([adminUser]));
            }
        };
        initializeDB();
    }, []);

    // --- Authentication State Management on App Load ---
    // This effect runs once when the app starts. It checks for a saved auth token
    // in localStorage to automatically log the user in.
    useEffect(() => {
        try {
            const token = localStorage.getItem(AUTH_TOKEN_KEY);
            if (token) {
                const decodedUser = decodeMockToken(token);
                if (decodedUser) {
                    // Re-fetch user from the "DB" to ensure the data is fresh.
                    const users = JSON.parse(localStorage.getItem(MOCK_USERS_DB_KEY) || '[]') as UserProfile[];
                    const currentUser = users.find(u => u.id === decodedUser.id);
                    if (currentUser) {
                         setUser(currentUser);
                    } else {
                        // The user in the token doesn't exist in the DB anymore, so log them out.
                        localStorage.removeItem(AUTH_TOKEN_KEY);
                    }
                } else {
                    // Token is invalid or expired.
                    localStorage.removeItem(AUTH_TOKEN_KEY);
                }
            }
        } catch (error) {
            console.error("Error initializing auth state:", error);
            localStorage.removeItem(AUTH_TOKEN_KEY);
        } finally {
            setLoading(false); // Finished loading auth state.
        }
    }, []);

    // --- Core Auth Functions ---

    const login = async (email: string, password?: string): Promise<AuthResult> => {
        const users = JSON.parse(localStorage.getItem(MOCK_USERS_DB_KEY) || '[]') as UserProfile[];
        const normalizedEmail = email.trim().toLowerCase();
        const foundUser = users.find(u => u.email.toLowerCase() === normalizedEmail && u.password === password);

        if (foundUser) {
            if (foundUser.status === 'banned') {
                return { success: false, message: 'banned' };
            }
            // Create a token, save it, and update the global state.
            const token = createMockToken(foundUser);
            localStorage.setItem(AUTH_TOKEN_KEY, token);
            setUser(foundUser);
            return { success: true };
        }
        return { success: false, message: 'Invalid credentials' };
    };

    const register = async (name: string, email: string, password?: string): Promise<AuthResult> => {
         const users = JSON.parse(localStorage.getItem(MOCK_USERS_DB_KEY) || '[]') as UserProfile[];
         const normalizedEmail = email.trim().toLowerCase();
         if (users.some(u => u.email.toLowerCase() === normalizedEmail)) {
            return { success: false, message: 'Email already exists' };
        }

        // Generate a 6-digit OTP.
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const emailResult = await sendOtpEmail(normalizedEmail, name, otp, 'Your PixelCyberZone Verification Code');
        if (!emailResult.success) {
            return emailResult; // Forward the email error message to the UI.
        }
        
        // Store the OTP and user data temporarily in session storage.
        const otpData = {
            email: normalizedEmail,
            otp,
            expires: Date.now() + 10 * 60 * 1000, // OTP expires in 10 minutes.
            userData: { name, email: normalizedEmail, password }
        };
        sessionStorage.setItem(REGISTRATION_OTP_KEY, JSON.stringify(otpData));
        
        return { success: true };
    };

    const verifyOtpAndCompleteRegistration = async (email: string, otp: string): Promise<AuthResult> => {
        const otpDataString = sessionStorage.getItem(REGISTRATION_OTP_KEY);
        if (!otpDataString) return { success: false, message: 'No OTP found' };

        const otpData = JSON.parse(otpDataString);
        const normalizedEmail = email.trim().toLowerCase();

        if (otpData.email !== normalizedEmail || otpData.otp !== otp) {
            return { success: false, message: 'Invalid code' };
        }
        if (Date.now() > otpData.expires) {
            return { success: false, message: 'Expired code' };
        }
        
        // OTP is valid. Create the new user.
        const users = JSON.parse(localStorage.getItem(MOCK_USERS_DB_KEY) || '[]') as UserProfile[];
        const { name, password } = otpData.userData;
        const newUser: UserProfile = {
            id: `user-${Date.now()}`,
            name,
            email: normalizedEmail,
            password,
            avatar: `https://api.dicebear.com/8.x/initials/svg?seed=${name}`,
            role: 'user',
            registrationDate: new Date().toISOString(),
            status: 'active',
        };

        users.push(newUser);
        localStorage.setItem(MOCK_USERS_DB_KEY, JSON.stringify(users));
        sessionStorage.removeItem(REGISTRATION_OTP_KEY); // Clean up the used OTP data.

        // Automatically log in the new user.
        const token = createMockToken(newUser);
        localStorage.setItem(AUTH_TOKEN_KEY, token);
        setUser(newUser);

        return { success: true };
    };
    
     const resendOtp = async (email: string): Promise<AuthResult> => {
        const otpDataString = sessionStorage.getItem(REGISTRATION_OTP_KEY);
        if (!otpDataString) return { success: false, message: "No registration attempt found." };
        
        const otpData = JSON.parse(otpDataString);
        const normalizedEmail = email.trim().toLowerCase();
        if (otpData.email !== normalizedEmail) return { success: false, message: "Email mismatch." };

        // Generate and send a new OTP.
        const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
        const emailResult = await sendOtpEmail(normalizedEmail, otpData.userData.name, newOtp, 'Your New PixelCyberZone Verification Code');
        if (!emailResult.success) {
            return emailResult;
        }

        // Update the OTP data in session storage with the new code and expiry time.
        otpData.otp = newOtp;
        otpData.expires = Date.now() + 10 * 60 * 1000;
        sessionStorage.setItem(REGISTRATION_OTP_KEY, JSON.stringify(otpData));

        return { success: true };
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem(AUTH_TOKEN_KEY);
    };

    const updateUser = (profile: UserProfile) => {
        const users = JSON.parse(localStorage.getItem(MOCK_USERS_DB_KEY) || '[]') as UserProfile[];
        const userIndex = users.findIndex(u => u.id === profile.id);
        if (userIndex !== -1) {
            users[userIndex] = profile;
            localStorage.setItem(MOCK_USERS_DB_KEY, JSON.stringify(users));
            setUser(profile); // Update the state for the currently logged-in user.
            
            // If the updated user is the current user, refresh their auth token with the new data.
            if (user?.id === profile.id) {
                const token = createMockToken(profile);
                localStorage.setItem(AUTH_TOKEN_KEY, token);
            }
        }
    };
    
    const forgotPassword = async (email: string): Promise<OTPResult> => {
        const users = JSON.parse(localStorage.getItem(MOCK_USERS_DB_KEY) || '[]') as UserProfile[];
        const normalizedEmail = email.trim().toLowerCase();
        const foundUser = users.find(u => u.email.toLowerCase() === normalizedEmail);

        if (foundUser) {
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            const emailResult = await sendOtpEmail(normalizedEmail, foundUser.name, otp, 'Your PixelCyberZone Password Reset Code');
            if (emailResult.success) {
                 const otpData = { email: normalizedEmail, otp, expires: Date.now() + 10 * 60 * 1000 };
                 sessionStorage.setItem(PASSWORD_RESET_OTP_KEY, JSON.stringify(otpData));
            }
        } else {
            // Log for debugging, but don't reveal to the user that the email doesn't exist.
            console.log(`Password reset requested for non-existent email: ${email}`);
        }
        // Always return success to prevent user enumeration attacks (where an attacker could guess emails).
        return { success: true };
    };


    const resetPassword = async (email: string, otp: string, newPassword: string): Promise<AuthResult> => {
        const otpDataString = sessionStorage.getItem(PASSWORD_RESET_OTP_KEY);
        if (!otpDataString) return { success: false, message: 'No reset request found' };

        const otpData = JSON.parse(otpDataString);
        const normalizedEmail = email.trim().toLowerCase();

        if (otpData.email !== normalizedEmail || otpData.otp !== otp) {
            return { success: false, message: 'Invalid code' };
        }
        if (Date.now() > otpData.expires) {
            return { success: false, message: 'Expired code' };
        }

        const users = JSON.parse(localStorage.getItem(MOCK_USERS_DB_KEY) || '[]') as UserProfile[];
        const userIndex = users.findIndex(u => u.email.toLowerCase() === normalizedEmail);
        if (userIndex !== -1) {
            users[userIndex].password = newPassword;
            localStorage.setItem(MOCK_USERS_DB_KEY, JSON.stringify(users));
            sessionStorage.removeItem(PASSWORD_RESET_OTP_KEY);
            return { success: true };
        }
        
        return { success: false, message: 'User not found' };
    };
    
    // --- Admin Functions ---
    // These functions are intended to be called from the admin panel.

     const getAllUsers = (): UserProfile[] => {
        return JSON.parse(localStorage.getItem(MOCK_USERS_DB_KEY) || '[]') as UserProfile[];
    };
    
     const adminResetPassword = async (userId: string): Promise<AuthResult> => {
        const users = getAllUsers();
        const userIndex = users.findIndex(u => u.id === userId);
        if (userIndex !== -1) {
            users[userIndex].password = 'password123';
            localStorage.setItem(MOCK_USERS_DB_KEY, JSON.stringify(users));
            return { success: true };
        }
        return { success: false, message: 'User not found' };
    };

    const toggleUserStatus = async (userId: string): Promise<AuthResult> => {
        const users = getAllUsers();
        const userIndex = users.findIndex(u => u.id === userId);
        // Prevent an admin from banning themselves.
        if (userIndex !== -1 && users[userIndex].role !== 'admin') {
            users[userIndex].status = users[userIndex].status === 'banned' ? 'active' : 'banned';
            localStorage.setItem(MOCK_USERS_DB_KEY, JSON.stringify(users));
            return { success: true };
        }
        return { success: false, message: 'User not found or is an admin' };
    };
    
    // --- Promo Code Functions (Backend API) ---
    const getPromoCodes = async (): Promise<PromoCode[]> => {
        try {
            const token = localStorage.getItem(AUTH_TOKEN_KEY);
            if (!token) return [];
            
            const response = await fetch('/api/promo-codes', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                return data.promoCodes || [];
            }
        } catch (error) {
            console.error('Failed to fetch promo codes:', error);
        }
        return [];
    };

    const generatePromoCode = async (caseId: string): Promise<{ success: boolean; code?: string; message?: string }> => {
        try {
            const token = localStorage.getItem(AUTH_TOKEN_KEY);
            if (!token) {
                return { success: false, message: 'Authentication required' };
            }
            
            console.log('Generating promo code for case:', caseId);
            
            const response = await fetch('/api/promo-codes/generate', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ caseId })
            });
            
            console.log('Response status:', response.status);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('API Error Response:', errorText);
                
                try {
                    const errorData = JSON.parse(errorText);
                    return { success: false, message: errorData.message || `Server error (${response.status})` };
                } catch {
                    return { success: false, message: `Server error (${response.status}): ${errorText}` };
                }
            }
            
            const data = await response.json();
            console.log('Success response:', data);
            
            if (data.success) {
                return { success: true, code: data.code, message: data.message };
            } else {
                return { success: false, message: data.message || 'Failed to generate promo code' };
            }
        } catch (error) {
            console.error('Network error generating promo code:', error);
            return { success: false, message: `Network error: ${error.message}` };
        }
    };
    
    const validateAndRedeemPromoCode = async (code: string, caseId: string): Promise<AuthResult> => {
        try {
            const token = localStorage.getItem(AUTH_TOKEN_KEY);
            if (!token) {
                return { success: false, message: 'Authentication required' };
            }
            
            // First validate the code
            const validateResponse = await fetch('/api/cases/validate-promo', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ caseId, promoCode: code })
            });
            
            if (!validateResponse.ok) {
                const validateData = await validateResponse.json();
                return { success: false, message: validateData.message || 'Invalid promo code' };
            }
            
            // If validation passes, open the case
            const openResponse = await fetch(`/api/cases/${caseId}/open`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ caseId, promoCode: code })
            });
            
            const openData = await openResponse.json();
            
            if (openResponse.ok && openData.success) {
                return { success: true, message: openData.message, reward: openData.reward };
            } else {
                return { success: false, message: openData.message || 'Failed to open case' };
            }
        } catch (error) {
            console.error('Failed to validate/redeem promo code:', error);
            return { success: false, message: 'Network error occurred' };
        }
    };


    // Memoize the context value to prevent unnecessary re-renders in consumer components.
    const value = useMemo(() => ({
        user,
        loading,
        login,
        register,
        verifyOtpAndCompleteRegistration,
        resendOtp,
        logout,
        updateUser,
        forgotPassword,
        resetPassword,
        getAllUsers,
        adminResetPassword,
        toggleUserStatus,
        getPromoCodes,
        generatePromoCode,
        validateAndRedeemPromoCode,
    }), [user, loading]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook for easy access to the AuthContext.
export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};