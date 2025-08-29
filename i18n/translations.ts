import type { Game, FAQ, ResidentPlan, Spec, GalleryImage, PricingPlan, Case, CaseReward, UserProfile } from '../types.ts';
import { initialContent } from './initialContent.ts';

interface Translations {
    [key: string]: any;
}

const bookingLink = 'https://wa.me/994552966003';

// Rewards can remain here as they are complex and not part of the CMS yet.
// Azerbaijani Rewards
const rewards_bronze_az: CaseReward[] = [
    { id: 'br-az-1', name: '0.3L Kola', rarity: 'common', image: 'https://i.ibb.co/9vGzZzW/cola.png', chance: 50 },
    { id: 'br-az-2', name: '5% Endirim', rarity: 'uncommon', image: 'https://i.ibb.co/dK5CjJc/discount.png', chance: 30 },
    { id: 'br-az-3', name: '1 Saat Pulsuz (Standart)', rarity: 'rare', image: 'https://i.ibb.co/HCf4b8t/free-hour.png', chance: 15 },
    { id: 'br-az-4', name: 'Red Bull', rarity: 'legendary', image: 'https://i.ibb.co/PQtL4gG/redbull.png', chance: 5 },
];
const rewards_silver_az: CaseReward[] = [
    { id: 'sl-az-1', name: 'Red Bull', rarity: 'common', image: 'https://i.ibb.co/PQtL4gG/redbull.png', chance: 40 },
    { id: 'sl-az-2', name: '10% Endirim', rarity: 'uncommon', image: 'https://i.ibb.co/dK5CjJc/discount.png', chance: 35 },
    { id: 'sl-az-3', name: '1 Saat Pulsuz (Standart)', rarity: 'rare', image: 'https://i.ibb.co/HCf4b8t/free-hour.png', chance: 20 },
    { id: 'sl-az-4', name: '1 Saat Pulsuz (VIP)', rarity: 'legendary', image: 'https://i.ibb.co/nMSwVwZ/vip-upgrade.png', chance: 5 }
];
const rewards_gold_az: CaseReward[] = [
    { id: 'gd-az-1', name: 'Red Bull', rarity: 'common', image: 'https://i.ibb.co/PQtL4gG/redbull.png', chance: 40 },
    { id: 'gd-az-2', name: '15% Endirim', rarity: 'uncommon', image: 'https://i.ibb.co/dK5CjJc/discount.png', chance: 35 },
    { id: 'gd-az-3', name: '2 Saat Pulsuz (Standart)', rarity: 'rare', image: 'https://i.ibb.co/HCf4b8t/free-hour.png', chance: 20 },
    { id: 'gd-az-4', name: '1 Saat Pulsuz (VIP)', rarity: 'legendary', image: 'https://i.ibb.co/nMSwVwZ/vip-upgrade.png', chance: 5 }
];
const rewards_vip_az: CaseReward[] = [
    { id: 'vip-az-1', name: '25% Endirim', rarity: 'uncommon', image: 'https://i.ibb.co/dK5CjJc/discount.png', chance: 50 },
    { id: 'vip-az-2', name: '2 Saat Pulsuz (VIP)', rarity: 'rare', image: 'https://i.ibb.co/nMSwVwZ/vip-upgrade.png', chance: 30 },
    { id: 'vip-az-3', name: 'Eksklüziv Klub İmtiyazı', rarity: 'legendary', image: 'https://i.ibb.co/hZ5HwV1/perk.png', chance: 20 }
];

// Russian Rewards
const rewards_bronze_ru: CaseReward[] = [
    { id: 'br-ru-1', name: '0.3л Кола', rarity: 'common', image: 'https://i.ibb.co/9vGzZzW/cola.png', chance: 50 },
    { id: 'br-ru-2', name: 'Снэк-пакет', rarity: 'common', image: 'https://i.ibb.co/9vGzZzW/cola.png', chance: 30 },
    { id: 'br-ru-3', name: 'Скидка 5%', rarity: 'uncommon', image: 'https://i.ibb.co/dK5CjJc/discount.png', chance: 15 },
    { id: 'br-ru-4', name: '1 Бесплатный Час (Стандарт)', rarity: 'rare', image: 'https://i.ibb.co/HCf4b8t/free-hour.png', chance: 5 },
];
const rewards_silver_ru: CaseReward[] = [
    { id: 'sl-ru-1', name: 'Red Bull', rarity: 'common', image: 'https://i.ibb.co/PQtL4gG/redbull.png', chance: 40 },
    { id: 'sl-ru-2', name: 'Энергетик', rarity: 'common', image: 'https://i.ibb.co/PQtL4gG/redbull.png', chance: 25 },
    { id: 'sl-ru-3', name: 'Скидка 10%', rarity: 'uncommon', image: 'https://i.ibb.co/dK5CjJc/discount.png', chance: 20 },
    { id: 'sl-ru-4', name: '1 Бесплатный Час (Стандарт)', rarity: 'rare', image: 'https://i.ibb.co/HCf4b8t/free-hour.png', chance: 12 },
    { id: 'sl-ru-5', name: '1 Бесплатный Час (VIP)', rarity: 'legendary', image: 'https://i.ibb.co/nMSwVwZ/vip-upgrade.png', chance: 3 }
];
const rewards_gold_ru: CaseReward[] = [
    { id: 'gd-ru-1', name: 'Red Bull', rarity: 'common', image: 'https://i.ibb.co/PQtL4gG/redbull.png', chance: 35 },
    { id: 'gd-ru-2', name: 'Комбо-набор', rarity: 'uncommon', image: 'https://i.ibb.co/9vGzZzW/cola.png', chance: 25 },
    { id: 'gd-ru-3', name: 'Скидка 15%', rarity: 'rare', image: 'https://i.ibb.co/dK5CjJc/discount.png', chance: 20 },
    { id: 'gd-ru-4', name: '2 Бесплатных Часа (Стандарт)', rarity: 'rare', image: 'https://i.ibb.co/HCf4b8t/free-hour.png', chance: 15 },
    { id: 'gd-ru-5', name: '1 Бесплатный Час (VIP)', rarity: 'legendary', image: 'https://i.ibb.co/nMSwVwZ/vip-upgrade.png', chance: 5 }
];
const rewards_vip_ru: CaseReward[] = [
    { id: 'vip-ru-1', name: 'Премиум гейминг сессия', rarity: 'uncommon', image: 'https://i.ibb.co/nMSwVwZ/vip-upgrade.png', chance: 40 },
    { id: 'vip-ru-2', name: 'Скидка 25%', rarity: 'rare', image: 'https://i.ibb.co/dK5CjJc/discount.png', chance: 30 },
    { id: 'vip-ru-3', name: '2 Бесплатных Часа (VIP)', rarity: 'legendary', image: 'https://i.ibb.co/nMSwVwZ/vip-upgrade.png', chance: 20 },
    { id: 'vip-ru-4', name: 'Эксклюзивный Клубный Привилегий', rarity: 'legendary', image: 'https://i.ibb.co/hZ5HwV1/perk.png', chance: 10 }
];

const cases_data_az: Case[] = [
    { id: 'case-az-1', name: 'Bürünc Keys', price: 'Promo Kod Lazımdır', image: 'https://i.ibb.co/8nNjKtfR/Gemini-Generated-Image-6603js6603js6603-removebg-preview.png', rewards: rewards_bronze_az },
    { id: 'case-az-2', name: 'Gümüş Keys', price: 'Promo Kod Lazımdır', image: 'https://i.ibb.co/7N0H63BG/Gemini-Generated-Image-i6l6w1i6l6w1i6l6-removebg-preview.png', rewards: rewards_silver_az },
    { id: 'case-az-3', name: 'Qızıl Keys', price: 'Promo Kod Lazımdır', image: 'https://i.ibb.co/hJhTM9Xq/Gemini-Generated-Image-dpb8nbdpb8nbdpb8-removebg-preview.png', rewards: rewards_gold_az },
    { id: 'case-az-4', name: 'VIP Keys', price: 'Promo Kod Lazımdır', image: 'https://i.ibb.co/8nRHzbWt/Gemini-Generated-Image-o99l8to99l8to99l-removebg-preview.png', rewards: rewards_vip_az },
];
const cases_data_ru: Case[] = [
    { id: 'case-ru-1', name: 'Бронзовый Кейс', price: 'Промо-код обязателен', image: 'https://i.ibb.co/8nNjKtfR/Gemini-Generated-Image-6603js6603js6603-removebg-preview.png', rewards: rewards_bronze_ru },
    { id: 'case-ru-2', name: 'Серебряный Кейс', price: 'Промо-код обязателен', image: 'https://i.ibb.co/7N0H63BG/Gemini-Generated-Image-i6l6w1i6l6w1i6l6-removebg-preview.png', rewards: rewards_silver_ru },
    { id: 'case-ru-3', name: 'Золотой Кейс', price: 'Промо-код обязателен', image: 'https://i.ibb.co/hJhTM9Xq/Gemini-Generated-Image-dpb8nbdpb8nbdpb8-removebg-preview.png', rewards: rewards_gold_ru },
    { id: 'case-ru-4', name: 'VIP Кейс', price: 'Промо-код обязателен', image: 'https://i.ibb.co/8nRHzbWt/Gemini-Generated-Image-o99l8to99l8to99l-removebg-preview.png', rewards: rewards_vip_ru },
];

// Note: specs_data for az and ru are now defined here for static use. English version is in initialContent.ts
const specs_data_az: Spec[] = [
    { id: 'spec-1', name: 'CPU', value: 'Intel Core i5-12400', icon: initialContent.en.specs[0].icon },
    { id: 'spec-2', name: 'Videokart', value: 'NVIDIA RTX 4060 8GB', icon: initialContent.en.specs[1].icon },
    { id: 'spec-3', name: 'RAM', value: '32 GB 3600Mhz', icon: initialContent.en.specs[2].icon },
    { id: 'spec-4', name: 'Ana Plata', value: 'PRO B760M-E DDR4', icon: initialContent.en.specs[3].icon },
    { id: 'spec-5', name: 'Monitor', value: 'AOC 24" 240 Hz', icon: initialContent.en.specs[4].icon },
    { id: 'spec-6', name: 'Klaviatura', value: 'E-YOOSO" Mexaniki', icon: initialContent.en.specs[5].icon },
    { id: 'spec-7', name: 'Siçan', value: 'HyperX Pulsefire Core', icon: initialContent.en.specs[6].icon },
    { id: 'spec-8', name: 'Qulaqlıq', value: 'Hyperx Cloud Stinger 2', icon: initialContent.en.specs[7].icon }
];
const specs_data_ru: Spec[] = [
    { id: 'spec-1', name: 'Процессор', value: 'Intel Core i5-12400', icon: initialContent.en.specs[0].icon },
    { id: 'spec-2', name: 'Видеокарта', value: 'NVIDIA RTX 4060 8GB', icon: initialContent.en.specs[1].icon },
    { id: 'spec-3', name: 'ОЗУ', value: '32 ГБ 3600МГц', icon: initialContent.en.specs[2].icon },
    { id: 'spec-4', name: 'Материнская плата', value: 'PRO B760M-E DDR4', icon: initialContent.en.specs[3].icon },
    { id: 'spec-5', name: 'Монитор', value: 'AOC 24" 240 Гц', icon: initialContent.en.specs[4].icon },
    { id: 'spec-6', name: 'Клавиатура', value: 'E-YOOSO" Механическая', icon: initialContent.en.specs[5].icon },
    { id: 'spec-7', name: 'Мышь', value: 'HyperX Pulsefire Core', icon: initialContent.en.specs[6].icon },
    { id: 'spec-8', name: 'Гарнитура', value: 'Hyperx Cloud Stinger 2', icon: initialContent.en.specs[7].icon }
];

const pricing_plans_data_en: PricingPlan[] = [
    { name: 'Standard Hour', price: '3 AZN', period: 'hour', features: ['Standard PC', 'Access to all games'], highlight: false },
    { name: 'VIP Hour', price: '5 AZN', period: 'hour', features: ['VIP PC', 'Access to all games', 'No queue'], highlight: true },
    { name: 'Night Pass', price: '15 AZN', period: '8 hours', features: ['Valid from 00:00 to 08:00', 'Access to all games', 'Standard PC'], highlight: false }
];
const pricing_plans_data_az: PricingPlan[] = [
    { name: 'Standart Saat', price: '3 AZN', period: 'saat', features: ['Standart PC', 'Bütün oyunlara giriş'], highlight: false },
    { name: 'VIP Saat', price: '5 AZN', period: 'saat', features: ['VIP PC', 'Bütün oyunlara giriş', 'Növbəsiz'], highlight: true },
    { name: 'Gecə Paketi', price: '15 AZN', period: '8 saat', features: ['00:00-dan 08:00-dək etibarlıdır', 'Bütün oyunlara giriş', 'Standart PC'], highlight: false }
];
const pricing_plans_data_ru: PricingPlan[] = [
    { name: 'Стандартный час', price: '3 AZN', period: 'час', features: ['Стандартный ПК', 'Доступ ко всем играм'], highlight: false },
    { name: 'VIP час', price: '5 AZN', period: 'час', features: ['VIP ПК', 'Доступ ко всем играм', 'Без очереди'], highlight: true },
    { name: 'Ночной пакет', price: '15 AZN', period: '8 часов', features: ['Действует с 00:00 до 08:00', 'Доступ ко всем играм', 'Стандартный ПК'], highlight: false }
];

const resident_plans_data_az: ResidentPlan[] = [
    {
        title: 'Rezident',
        topUpLabel: 'Balansınızı artırdıqda',
        topUpAmount: '150AZN',
        features: [
            { name: 'Tariflərdə endirim', value: '5%', type: 'string' },
            { name: 'Promo kod bonus', value: '2%', type: 'string' },
            { name: 'Bonuslarla ödəniş', value: '25%', type: 'string' },
            { name: 'Kredit limiti', value: false, type: 'boolean' },
            { name: 'Şəxsi cihazların saxlanması', value: false, type: 'boolean' },
        ]
    },
    {
        title: 'VIP-Rezident',
        topUpLabel: 'Balansınızı artırdıqda',
        topUpAmount: '750AZN',
        features: [
            { name: 'Tariflərdə endirim', value: '10%', type: 'string' },
            { name: 'Promo kod bonus', value: '4%', type: 'string' },
            { name: 'Bonuslarla ödəniş', value: '50%', type: 'string' },
            { name: 'Kredit limiti', value: true, type: 'boolean' },
            { name: 'Şəxsi cihazların saxlanması', value: false, type: 'boolean' },
        ]
    },
    {
        title: 'Prime-Rezident',
        topUpLabel: 'Balansınızı artırdıqda',
        topUpAmount: '1500AZN',
        features: [
            { name: 'Tariflərdə endirim', value: '15%', type: 'string' },
            { name: 'Promo kod bonus', value: '6%', type: 'string' },
            { name: 'Bonuslarla ödəniş', value: '75%', type: 'string' },
            { name: 'Kredit limiti', value: true, type: 'boolean' },
            { name: 'Şəxsi cihazların saxlanması', value: true, type: 'boolean' },
        ]
    }
];

const resident_plans_data_en: ResidentPlan[] = [
    {
        title: 'Resident',
        topUpLabel: 'When topping up balance',
        topUpAmount: '150AZN',
        features: [
            { name: 'Discount on tariffs', value: '5%', type: 'string' },
            { name: 'Promo code bonus', value: '2%', type: 'string' },
            { name: 'Payment with bonuses', value: '25%', type: 'string' },
            { name: 'Credit limit', value: false, type: 'boolean' },
            { name: 'Personal device storage', value: false, type: 'boolean' },
        ]
    },
    {
        title: 'VIP-Resident',
        topUpLabel: 'When topping up balance',
        topUpAmount: '750AZN',
        features: [
            { name: 'Discount on tariffs', value: '10%', type: 'string' },
            { name: 'Promo code bonus', value: '4%', type: 'string' },
            { name: 'Payment with bonuses', value: '50%', type: 'string' },
            { name: 'Credit limit', value: true, type: 'boolean' },
            { name: 'Personal device storage', value: false, type: 'boolean' },
        ]
    },
    {
        title: 'Prime-Resident',
        topUpLabel: 'When topping up balance',
        topUpAmount: '1500AZN',
        features: [
            { name: 'Discount on tariffs', value: '15%', type: 'string' },
            { name: 'Promo code bonus', value: '6%', type: 'string' },
            { name: 'Payment with bonuses', value: '75%', type: 'string' },
            { name: 'Credit limit', value: true, type: 'boolean' },
            { name: 'Personal device storage', value: true, type: 'boolean' },
        ]
    }
];

const resident_plans_data_ru: ResidentPlan[] = [
    {
        title: 'Резидент',
        topUpLabel: 'При пополнении баланса',
        topUpAmount: '150AZN',
        features: [
            { name: 'Скидка на тарифы', value: '5%', type: 'string' },
            { name: 'Промо-код бонус', value: '2%', type: 'string' },
            { name: 'Оплата бонусами', value: '25%', type: 'string' },
            { name: 'Кредитный лимит', value: false, type: 'boolean' },
            { name: 'Хранение личных устройств', value: false, type: 'boolean' },
        ]
    },
    {
        title: 'VIP-Резидент',
        topUpLabel: 'При пополнении баланса',
        topUpAmount: '750AZN',
        features: [
            { name: 'Скидка на тарифы', value: '10%', type: 'string' },
            { name: 'Промо-код бонус', value: '4%', type: 'string' },
            { name: 'Оплата бонусами', value: '50%', type: 'string' },
            { name: 'Кредитный лимит', value: true, type: 'boolean' },
            { name: 'Хранение личных устройств', value: false, type: 'boolean' },
        ]
    },
    {
        title: 'Prime-Резидент',
        topUpLabel: 'При пополнении баланса',
        topUpAmount: '1500AZN',
        features: [
            { name: 'Скидка на тарифы', value: '15%', type: 'string' },
            { name: 'Промо-код бонус', value: '6%', type: 'string' },
            { name: 'Оплата бонусами', value: '75%', type: 'string' },
            { name: 'Кредитный лимит', value: true, type: 'boolean' },
            { name: 'Хранение личных устройств', value: true, type: 'boolean' },
        ]
    }
];

export const translations: Translations = {
    en: {
        booking_link: bookingLink,
        user_profile: {
            id: 'admin-001',
            name: "Admin",
            avatar: "https://i.ibb.co/6gBSVf9/logo.png",
            email: "admin@pixelcyberzone.com",
            role: "admin",
            registrationDate: new Date().toISOString(),
            password: "admin123456",
            status: "active"
        } as UserProfile,
        nav_links: [
            { id: 'resident', label: 'Resident Plans' },
            { id: 'cases', label: 'Cases' },
            { id: 'cabinet', label: 'Cabinet' },
            { id: 'admin', label: 'Admin Panel'},
            { id: 'hardware', label: 'Hardware' },
            { id: 'games', label: 'Games' },
            { id: 'gallery', label: 'Gallery' },
            { id: 'playstation', label: 'PlayStation' },
            { id: 'location', label: 'Location' },
            { id: 'faq', label: 'FAQ' }
        ],
        header: {
            book_now: 'Book Now',
            login: 'Login',
            logout: 'Logout'
        },
        login_page: {
            title: "Welcome Back",
            subtitle: "Log in to access your cabinet and cases.",
            email_label: "Email",
            password_label: "Password",
            login_button: "Log In",
            error: "Invalid credentials. Please try again.",
            banned_error: "This account has been banned.",
            no_account: "Don't have an account?",
            register_link: "Register",
            forgot_password_link: "Forgot Password?"
        },
        register_page: {
            title: "Create Account",
            subtitle: "Join the PixelCyberZone community.",
            name_label: "Name",
            email_label: "Email",
            password_label: "Password",
            register_button: "Register",
            error_exists: "A user with this email already exists.",
            error_general: "Registration failed. Please try again.",
            has_account: "Already have an account?",
            login_link: "Log In"
        },
        otp_page: {
            title: "Verify Your Email",
            subtitle: "We sent a 6-digit code to",
            otp_label: "Verification Code (OTP)",
            verify_button: "Verify & Create Account",
            resend_button: "Resend Code",
            resend_cooldown: "Resend in {seconds}s",
            error_invalid_code: "Invalid or expired code. Please try again.",
            error_general: "Verification failed. Please try again.",
            resend_success: "A new code has been sent."
        },
        forgot_password_page: {
            title: "Forgot Password",
            subtitle: "Enter your email to receive a password reset code.",
            email_label: "Email",
            send_code_button: "Send Code",
            success_message: "If an account with that email exists, a reset code has been sent.",
            back_to_login: "Back to Login"
        },
        reset_password_page: {
            title: "Reset Password",
            subtitle: "Enter the code from your email and your new password.",
            otp_label: "Reset Code (OTP)",
            new_password_label: "New Password",
            reset_button: "Reset Password",
            success: "Password reset successfully! You can now log in.",
            error_invalid_code: "Invalid or expired code. Please try again.",
            error_general: "Failed to reset password. Please request a new code.",
            no_email: "No email provided for reset. Please start over."
        },
        hero: {
            title_part1: 'PixelCyberZone',
            title_part2: 'GAMING CAFE',
            subtitle: 'Your premier hub for competitive gaming and immersive experiences. High-end rigs, lightning-fast internet, and a community of gamers await.',
            cta: 'Book a PC'
        },
        resident: {
            title: 'Our <span class="text-purple-400">Resident</span> Plans'
        },
        cases: {
            title: 'Open <span class="text-purple-400">Cases</span> for Rewards',
            open_button: 'Open Case',
            drops_button: 'View Drops',
            opening_title: 'Opening Case...',
            won_title: 'You Won!',
            close_button: 'Close',
        },
        cases_teaser: {
            title: 'Unlock <span class="text-purple-400">Exclusive Rewards</span>',
            subtitle: 'Register and play at PixelCyberZone to earn promo codes and open these cases for amazing prizes!',
            cta: 'Register & Play'
        },
        cases_page: {
            title: "Unlock Your <span class='text-purple-400'>Case</span>",
            my_cabinet: "My Cabinet",
            invalid_code: "Invalid, used, or incorrect promo code.",
            history_title: "Recent Winnings",
            no_history: "You haven't opened any cases yet.",
            promo_modal_title: "Unlock {caseName}",
            promo_placeholder: "Enter Promo Code",
            confirm_purchase_title: "Confirm Purchase",
            confirm_purchase_body: "Are you sure you want to spend {price} to open the {caseName}?",
            not_enough_points: "You do not have enough points to open this case.",
            purchase_button: "Purchase",
        },
        cabinet_page: {
            title: "Personal <span class='text-purple-400'>Cabinet</span>",
            back_to_cases: "Back to Cases",
            bonus_points: "Bonus Points",
            history_title: "Full Case History",
            user_id: "User ID",
            email: "Email",
            member_since: "Member Since",
            change_avatar: "Change Avatar",
            save_avatar: "Save",
            avatar_upload_success: "Avatar updated successfully!",
            avatar_upload_error: "Failed to upload avatar."
        },
        admin_page: {
            title: "Admin <span class='text-purple-400'>Panel</span>",
            user_management: "User Management",
            content_management: "Content Management",
            case_management: "Case Management",
            promo_management: "Promo Codes",
            back_to_home: "Back to Home",
            users: "Users",
            actions: "Actions",
            ban: "Ban",
            unban: "Unban",
            reset_password: "Reset Password",
            reset_password_confirm: "Are you sure you want to reset password for {name}? New password will be 'password123'.",
            ban_user_confirm: "Are you sure you want to ban {name}?",
            unban_user_confirm: "Are you sure you want to unban {name}?",
            case: "Case",
            rewards: "Rewards",
            edit: "Edit",
            delete: "Delete",
            save: "Save",
            cancel: "Cancel",
            add_new: "Add New",
            image_url: "Image URL",
            title_label: "Title",
            confirm_delete: "Are you sure you want to delete this item?",
            pc_games: "PC Games",
            ps5_games: "PS5 Games",
            ps4_games: "PS4 Games",
            gallery: "Gallery",
            hardware_specs: "Hardware Specs",
            spec_name: "Spec Name",
            spec_value: "Spec Value",
            promo_code: "Promo Code",
            assigned_case: "Assigned Case",
            status: "Status",
            active: "Active",
            banned: "Banned",
            used: "Used",
            generate_new: "Generate New",
            created_at: "Created At",
            case_name: "Case Name",
            price: "Price",
            add_new_case: "Add New Case",
            add_new_reward: "Add New Reward",
            reward_name: "Reward Name",
            rarity: "Rarity",
            chance: "Chance (%)"
        },
        hardware: {
            title: 'Top-Tier <span class="text-purple-400">Hardware</span>',
        },
        games: {
            title: 'Games <span class="text-purple-400">We Offer</span>'
        },
        gallery: {
            title: 'Our <span class="text-purple-400">Atmosphere</span>'
        },
        playstation: {
            title: 'Our <span class="text-purple-400">PlayStation</span> Zone'
        },
        ps5games: { title: 'Our <span class="text-purple-400">Playstation 5</span> Games' },
        ps4games: { title: 'Our <span class="text-purple-400">Playstation 4</span> Games' },
        location: {
            title: 'Find <span class="text-purple-400">Us</span>',
            address_title: 'Our Address',
            address_value: '142a Mirmahmud Kazimovski St, Baku 1114, Azerbaijan',
            hours_title: 'Hours',
            hours_value: '24/7'
        },
        partners: {
            title: 'Powered by Industry Leaders'
        },
        faq: {
            title: 'Frequently Asked <span class="text-purple-400">Questions</span>'
        },
        booking: {
            title: 'Ready to Dominate <br /> the Leaderboards?',
            subtitle: 'Your next victory awaits. Book your station now and experience gaming at its peak.',
            cta: 'Book Your Spot'
        },
        footer: {
            description: 'Your premier destination for competitive gaming and esports.',
            links_title: 'Quick Links',
            social_title: 'Follow Us',
            contact_title: 'Contact Us',
            copyright: 'PixelCyberZone. All rights reserved.'
        },
        pricing: {
            title: 'Our <span class="text-purple-400">Pricing</span>',
            cta: 'Book Now'
        },
        pricing_plans_data: pricing_plans_data_en,
        resident_plans_data: resident_plans_data_en,
        cases_data: initialContent.en.cases, // Sourced from initialContent
        faq_data: [
            { question: 'Do I need to bring my own headset or mouse?', answer: 'We provide high-quality peripherals at every station. However, you are more than welcome to bring your own gear and plug it in!' },
            { question: 'Can I reserve a PC in advance?', answer: 'Yes! We highly recommend booking a spot through our website, especially during peak hours and weekends, to guarantee your spot.' },
            { question: 'Do you sell food and drinks?', answer: 'Absolutely. We have a fully stocked snack bar with a variety of drinks, snacks, and light meals to keep you fueled up for your gaming session.' },
            { question: 'Can I install my own games?', answer: 'Our PCs come pre-loaded with a massive library of popular games. If there is a specific game you want to play that we don\'t have, please speak to our staff and we will do our best to accommodate.' },
            { question: 'Why should I choose PixelCyberZone?', answer: 'We offer a premium gaming experience with top-of-the-line hardware including RTX 4060 GPUs and 240Hz monitors, ensuring zero lag. Our extensive library includes the latest PC and PlayStation titles. We\'re open 24/7 and foster a vibrant community, making us the ultimate destination for both casual and competitive gamers.' }
        ] as FAQ[],
        partner_logos: initialContent.en.partnerLogos,
        games_data: initialContent.en.games,
        ps5_games_data: initialContent.en.ps5Games,
        ps4_games_data: initialContent.en.ps4Games,
        specs_data: initialContent.en.specs,
        gallery_images_data: initialContent.en.galleryImages,
        playstation_images_data: initialContent.en.playstationImages,
    },
    az: {
        booking_link: bookingLink,
         user_profile: {
            id: 'admin-001',
            name: "Admin",
            avatar: "https://i.ibb.co/6gBSVf9/logo.png",
            email: "admin@pixelcyberzone.com",
            role: "admin",
            registrationDate: new Date().toISOString(),
            password: "admin123456",
            status: "active"
        } as UserProfile,
        nav_links: [
            { id: 'resident', label: 'Rezident Planları' },
            { id: 'cases', label: 'Keyslər' },
            { id: 'cabinet', label: 'Kabinet' },
            { id: 'admin', label: 'Admin Panel'},
            { id: 'hardware', label: 'Avadanlıq' },
            { id: 'games', label: 'Oyunlar' },
            { id: 'gallery', label: 'Qalereya' },
            { id: 'playstation', label: 'PlayStation' },
            { id: 'location', label: 'Məkan' },
            { id: 'faq', label: 'FAQ' }
        ],
        header: {
            book_now: 'İndi Rezerv Et',
            login: 'Daxil Ol',
            logout: 'Çıxış'
        },
        login_page: {
            title: "Xoş Gördük",
            subtitle: "Kabinetinizə və keyslərə daxil olmaq üçün daxil olun.",
            email_label: "E-poçt",
            password_label: "Şifrə",
            login_button: "Daxil Ol",
            error: "Yanlış məlumatlar. Zəhmət olmasa yenidən cəhd edin.",
            banned_error: "Bu hesab bloklanıb.",
            no_account: "Hesabınız yoxdur?",
            register_link: "Qeydiyyatdan keçin",
            forgot_password_link: "Şifrəni unutmusunuz?"
        },
        register_page: {
            title: "Hesab Yarat",
            subtitle: "PixelCyberZone cəmiyyətinə qoşulun.",
            name_label: "Ad",
            email_label: "E-poçt",
            password_label: "Şifrə",
            register_button: "Qeydiyyatdan Keç",
            error_exists: "Bu e-poçt ilə artıq bir istifadəçi mövcuddur.",
            error_general: "Qeydiyyat baş tutmadı. Zəhmət olmasa yenidən cəhd edin.",
            has_account: "Artıq hesabınız var?",
            login_link: "Daxil Olun"
        },
        otp_page: {
            title: "E-poçtunuzu Təsdiqləyin",
            subtitle: "6 rəqəmli kod göndərildi:",
            otp_label: "Təsdiqləmə Kodu (OTP)",
            verify_button: "Təsdiqlə və Hesab Yarat",
            resend_button: "Kodu Yenidən Göndər",
            resend_cooldown: "{seconds}s sonra yenidən göndər",
            error_invalid_code: "Yanlış və ya müddəti bitmiş kod. Zəhmət olmasa yenidən cəhd edin.",
            error_general: "Təsdiqləmə uğursuz oldu. Zəhmət olmasa yenidən cəhd edin.",
            resend_success: "Yeni kod göndərildi."
        },
        forgot_password_page: {
            title: "Şifrəni Unutmusunuz",
            subtitle: "Şifrə sıfırlama kodu almaq üçün e-poçtunuzu daxil edin.",
            email_label: "E-poçt",
            send_code_button: "Kodu Göndər",
            success_message: "Bu e-poçt ilə hesab mövcuddursa, sıfırlama kodu göndərildi.",
            back_to_login: "Girişə Qayıt"
        },
        reset_password_page: {
            title: "Şifrəni Sıfırla",
            subtitle: "E-poçtunuzdan gələn kodu və yeni şifrənizi daxil edin.",
            otp_label: "Sıfırlama Kodu (OTP)",
            new_password_label: "Yeni Şifrə",
            reset_button: "Şifrəni Sıfırla",
            success: "Şifrə uğurla sıfırlandı! İndi daxil ola bilərsiniz.",
            error_invalid_code: "Yanlış və ya müddəti bitmiş kod. Zəhmət olmasa yenidən cəhd edin.",
            error_general: "Şifrəni sıfırlamaq mümkün olmadı. Zəhmət olmasa yeni kod tələb edin.",
            no_email: "Sıfırlama üçün e-poçt göstərilməyib. Zəhmət olmasa yenidən başlayın."
        },
        hero: {
            title_part1: 'PixelCyberZone',
            title_part2: 'OYUN KAFESİ',
            subtitle: 'Rəqabətli oyun və immersiv təcrübələr üçün sizin əsas mərkəziniz. Yüksək səviyyəli avadanlıqlar, ildırım sürətli internet və oyunçular cəmiyyəti sizi gözləyir.',
            cta: 'PC Rezerv Et'
        },
        resident: {
            title: 'Bizim <span class="text-purple-400">Rezident</span> Planlarımız'
        },
        cases: {
            title: 'Mükafatlar üçün <span class="text-purple-400">Keyslər</span> açın',
            open_button: 'Keysi Aç',
            drops_button: 'Mümkün Mükafatlar',
            opening_title: 'Keys açılır...',
            won_title: 'Siz Qazandınız!',
            close_button: 'Bağla',
        },
        cases_teaser: {
            title: 'Eksklüziv <span class="text-purple-400">Mükafatları</span> Açın',
            subtitle: 'Möhtəşəm hədiyyələr üçün promo kodlar qazanmaq və bu keysləri açmaq üçün PixelCyberZone-da qeydiyyatdan keçin və oynayın!',
            cta: 'Qeydiyyatdan Keç və Oyna'
        },
        cases_page: {
            title: "<span class='text-purple-400'>Keysinizi</span> Aktivləşdirin",
            my_cabinet: "Mənim Kabinetim",
            invalid_code: "Yanlış, istifadə edilmiş və ya uyğun olmayan promo kod.",
            history_title: "Son Uduşlar",
            no_history: "Siz hələ heç bir keys açmamısınız.",
            promo_modal_title: "{caseName} üçün Promo Kod",
            promo_placeholder: "Promo Kodu Daxil Edin",
            confirm_purchase_title: "Alışı Təsdiqlə",
            confirm_purchase_body: "{caseName} açmaq üçün {price} xərcləmək istədiyinizə əminsinizmi?",
            not_enough_points: "Bu keysi açmaq üçün kifayət qədər xalınız yoxdur.",
            purchase_button: "Al",
        },
        cabinet_page: {
            title: "Şəxsi <span class='text-purple-400'>Kabinet</span>",
            back_to_cases: "Keyslərə Qayıt",
            bonus_points: "Bonus Xalları",
            history_title: "Tam Keys Tarixçəsi",
            user_id: "İstifadəçi ID",
            email: "E-poçt",
            member_since: "Üzvlük Tarixi",
            change_avatar: "Profil Şəklini Dəyiş",
            save_avatar: "Yadda Saxla",
            avatar_upload_success: "Profil şəkli uğurla yeniləndi!",
            avatar_upload_error: "Profil şəklini yükləmək mümkün olmadı."
        },
        admin_page: {
            title: "Admin <span class='text-purple-400'>Paneli</span>",
            user_management: "İstifadəçi İdarəetməsi",
            content_management: "Məzmun İdarəetməsi",
            case_management: "Keys İdarəetməsi",
            promo_management: "Promo Kodlar",
            back_to_home: "Əsas Səhifəyə Qayıt",
            users: "İstifadəçilər",
            actions: "Əməliyyatlar",
            ban: "Blokla",
            unban: "Bloku aç",
            reset_password: "Şifrəni Sıfırla",
            reset_password_confirm: "{name} üçün şifrəni sıfırlamaq istədiyinizə əminsiniz? Yeni şifrə 'password123' olacaq.",
            case: "Keys",
            rewards: "Mükafatlar",
            edit: "Redaktə et",
            promo_code: "Promo Kod",
            assigned_case: "Təyin Edilmiş Keys",
            status: "Status",
            active: "Aktiv",
            banned: "Bloklanıb",
            used: "İstifadə edilib",
            generate_new: "Yeni Yarat",
        },
        hardware: {
            title: 'Yüksək Səviyyəli <span class="text-purple-400">Avadanlıq</span>',
        },
        games: {
            title: 'Təklif Etdiyimiz <span class="text-purple-400">Oyunlar</span>'
        },
        gallery: {
            title: 'Bizim <span class="text-purple-400">Atmosferimiz</span>'
        },
        playstation: {
            title: 'Bizim <span class="text-purple-400">PlayStation</span> Zonamız'
        },
        ps5games: { title: 'Bizim <span class="text-purple-400">Playstation 5</span> Oyunlarımız' },
        ps4games: { title: 'Bizim <span class="text-purple-400">Playstation 4</span> Oyunlarımız' },
        location: {
            title: 'Bizi <span class="text-purple-400">Tapın</span>',
            address_title: 'Ünvanımız',
            address_value: 'Mirmahmud Kazımovski küç. 142a, Bakı 1114, Azərbaycan',
            hours_title: 'İş Saatları',
            hours_value: '24/7'
        },
        partners: {
            title: 'Sənaye Liderləri tərəfindən dəstəklənir'
        },
        faq: {
            title: 'Tez-tez Verilən <span class="text-purple-400">Suallar</span>'
        },
        booking: {
            title: 'Liderlər Lövhəsində <br /> Dominant Olmağa Hazırsınız?',
            subtitle: 'Növbəti qələbəniz sizi gözləyir. İndi yerinizi rezerv edin və oyunun zirvəsini yaşayın.',
            cta: 'Yerinizi Rezerv Edin'
        },
        footer: {
            description: 'Rəqabətli oyun və e-idman üçün əsas məkanınız.',
            links_title: 'Cəld Keçidlər',
            social_title: 'Bizi İzləyin',
            contact_title: 'Əlaqə',
            copyright: 'PixelCyberZone. Bütün hüququqlar qorunur.'
        },
        pricing: {
            title: 'Bizim <span class="text-purple-400">Qiymətlərimiz</span>',
            cta: 'İndi Rezerv Et'
        },
        pricing_plans_data: pricing_plans_data_az,
        resident_plans_data: resident_plans_data_az,
        cases_data: cases_data_az,
        // Static data for non-english languages
        games_data: initialContent.en.games,
        ps5_games_data: initialContent.en.ps5Games,
        ps4_games_data: initialContent.en.ps4Games,
        specs_data: specs_data_az,
        gallery_images_data: initialContent.en.galleryImages,
        playstation_images_data: initialContent.en.playstationImages,
        partner_logos: initialContent.en.partnerLogos,
        faq_data: [
            { question: 'Öz qulaqlıq və ya siçanımı gətirməliyəm?', answer: 'Hər stansiyada yüksək keyfiyyətli periferiya təmin edirik. Ancaq öz avadanlığınızı gətirib qoşmaqda tam sərbəstsiniz!' },
            { question: 'Əvvəlcədən PC rezerv edə bilərəm?', answer: 'Bəli! Xüsusilə pik saatlarda və həftə sonları yerinizi təmin etmək üçün veb saytımız vasitəsilə yer sifariş etməyi şiddətlə tövsiyə edirik.' },
            { question: 'Yemək və içki satırsınız?', answer: 'Əlbəttə. Oyun sessiyanız üçün sizi enerji ilə təmin etmək üçün müxtəlif içkilər, qəlyanaltılar və yüngül yeməklərlə tam təchiz olunmuş bir barımız var.' },
            { question: 'Öz oyunlarımı quraşdıra bilərəm?', answer: 'Kompüterlərimizdə böyük bir populyar oyun kitabxanası əvvəlcədən yüklənib. Oynamaq istədiyiniz, bizdə olmayan xüsusi bir oyun varsa, lütfən, personalımızla danışın və biz bunu təmin etmək üçün əlimizdən gələni edəcəyik.' },
            { question: 'Niyə PixelCyberZone-u seçməliyəm?', answer: 'Biz RTX 4060 videokartları və 240Hz monitorlar daxil olmaqla ən yüksək səviyyəli avadanlıqla premium oyun təcrübəsi təqdim edirik ki, bu da sıfır gecikməni təmin edir. Geniş kitabxanamızda ən son PC və PlayStation oyunları var. Biz 24/7 fəaliyyət göstəririk və canlı bir cəmiyyət formalaşdırırıq, bu da bizi həm gündəlik, həm də rəqabətli oyunçular üçün son məkan edir.' }
        ] as FAQ[],
    },
    ru: {
        booking_link: bookingLink,
        user_profile: {
            id: 'admin-001',
            name: "Админ",
            avatar: "https://i.ibb.co/6gBSVf9/logo.png",
            email: "admin@pixelcyberzone.com",
            role: "admin",
            registrationDate: new Date().toISOString(),
            password: "admin123456",
            status: "active"
        } as UserProfile,
        nav_links: [
            { id: 'resident', label: 'Планы Резидентов' },
            { id: 'cases', label: 'Кейсы' },
            { id: 'cabinet', label: 'Кабинет' },
            { id: 'admin', label: 'Админ-панель'},
            { id: 'hardware', label: 'Оборудование' },
            { id: 'games', label: 'Игры' },
            { id: 'gallery', label: 'Галерея' },
            { id: 'playstation', label: 'PlayStation' },
            { id: 'location', label: 'Местоположение' },
            { id: 'faq', label: 'FAQ' }
        ],
        header: {
            book_now: 'Забронировать',
            login: 'Войти',
            logout: 'Выйти'
        },
        login_page: {
            title: "С Возвращением",
            subtitle: "Войдите, чтобы получить доступ к вашему кабинету и кейсам.",
            email_label: "Электронная почта",
            password_label: "Пароль",
            login_button: "Войти",
            error: "Неверные данные. Пожалуйста, попробуйте еще раз.",
            banned_error: "Этот аккаунт забанен.",
            no_account: "Нет аккаунта?",
            register_link: "Зарегистрироваться",
            forgot_password_link: "Забыли пароль?"
        },
        register_page: {
            title: "Создать Аккаунт",
            subtitle: "Присоединяйтесь к сообществу PixelCyberZone.",
            name_label: "Имя",
            email_label: "Электронная почта",
            password_label: "Пароль",
            register_button: "Зарегистрироваться",
            error_exists: "Пользователь с таким email уже существует.",
            error_general: "Ошибка регистрации. Пожалуйста, попробуйте еще раз.",
            has_account: "Уже есть аккаунт?",
            login_link: "Войти"
        },
        otp_page: {
            title: "Подтвердите Ваш Email",
            subtitle: "Введите 6-значный код, отправленный на",
            otp_label: "Код подтверждения (OTP)",
            verify_button: "Подтвердить и Создать Аккаунт",
            resend_button: "Отправить код повторно",
            resend_cooldown: "Повторно через {seconds}с",
            error_invalid_code: "Неверный или истекший код. Пожалуйста, попробуйте еще раз.",
            error_general: "Ошибка подтверждения. Пожалуйста, попробуйте еще раз.",
            resend_success: "Новый код отправлен."
        },
        forgot_password_page: {
            title: "Забыли Пароль",
            subtitle: "Введите ваш email, чтобы получить код для сброса пароля.",
            email_label: "Электронная почта",
            send_code_button: "Отправить Код",
            success_message: "Если аккаунт с таким email существует, код сброса был отправлен.",
            back_to_login: "Вернуться ко входу"
        },
        reset_password_page: {
            title: "Сброс Пароля",
            subtitle: "Введите код из письма и ваш новый пароль.",
            otp_label: "Код Сброса (OTP)",
            new_password_label: "Новый Пароль",
            reset_button: "Сбросить Пароль",
            success: "Пароль успешно сброшен! Теперь вы можете войти.",
            error_invalid_code: "Неверный или истекший код. Пожалуйста, попробуйте снова.",
            error_general: "Не удалось сбросить пароль. Пожалуйста, запросите новый код.",
            no_email: "Не указан email для сброса. Пожалуйста, начните сначала."
        },
        hero: {
            title_part1: 'PixelCyberZone',
            title_part2: 'ИГРОВОЕ КАФЕ',
            subtitle: 'Ваш главный центр для соревновательных игр и захватывающих впечатлений. Мощное оборудование, молниеносный интернет и сообщество геймеров ждут вас.',
            cta: 'Забронировать ПК'
        },
        resident: {
            title: 'Наши <span class="text-purple-400">Планы</span> Резидентов'
        },
        cases: {
            title: 'Открывайте <span class="text-purple-400">Кейсы</span> — получайте призы',
            open_button: 'Открыть Кейс',
            drops_button: 'Возможные Призы',
            opening_title: 'Открытие кейса...',
            won_title: 'Вы Выиграли!',
            close_button: 'Закрыть',
        },
        cases_teaser: {
            title: 'Откройте <span class="text-purple-400">Эксклюзивные Награды</span>',
            subtitle: 'Регистрируйтесь и играйте в PixelCyberZone, чтобы зарабатывать промокоды и открывать эти кейсы с потрясающими призами!',
            cta: 'Зарегистрироваться и играть'
        },
        cases_page: {
            title: "Активируйте свой <span class='text-purple-400'>Кейс</span>",
            my_cabinet: "Мой Кабинет",
            invalid_code: "Неверный, использованный или неподходящий промо-код.",
            history_title: "Последние выигрыши",
            no_history: "Вы еще не открывали ни одного кейса.",
            promo_modal_title: "Промо-код для {caseName}",
            promo_placeholder: "Введите Промо-код",
            confirm_purchase_title: "Подтвердить покупку",
            confirm_purchase_body: "Вы уверены, что хотите потратить {price}, чтобы открыть {caseName}?",
            not_enough_points: "У вас недостаточно баллов, чтобы открыть этот кейс.",
            purchase_button: "Купить",
        },
        cabinet_page: {
            title: "Личный <span class='text-purple-400'>Кабинет</span>",
            back_to_cases: "Вернуться к кейсам",
            bonus_points: "Бонусные баллы",
            history_title: "Полная история кейсов",
            user_id: "ID Пользователя",
            email: "Электронная почта",
            member_since: "Дата регистрации",
            change_avatar: "Сменить Аватар",
            save_avatar: "Сохранить",
            avatar_upload_success: "Аватар успешно обновлен!",
            avatar_upload_error: "Не удалось загрузить аватар."
        },
        admin_page: {
            title: "Админ <span class='text-purple-400'>Панель</span>",
            user_management: "Управление Пользователями",
            content_management: "Управление Контентом",
            case_management: "Управление Кейсами",
            promo_management: "Промо-коды",
            back_to_home: "Вернуться на главную",
            users: "Пользователи",
            actions: "Действия",
            ban: "Забанить",
            unban: "Разбанить",
            reset_password: "Сбросить пароль",
            reset_password_confirm: "Вы уверены, что хотите сбросить пароль для {name}? Новый пароль будет 'password123'.",
            case: "Кейс",
            rewards: "Награды",
            edit: "Редактировать",
            promo_code: "Промо-код",
            assigned_case: "Назначенный кейс",
            status: "Статус",
            active: "Активен",
            banned: "Забанен",
            used: "Использован",
            generate_new: "Сгенерировать новый",
        },
        hardware: {
            title: 'Топовое <span class="text-purple-400">Оборудование</span>',
        },
        games: {
            title: 'Игры, <span class="text-purple-400">которые мы предлагаем</span>'
        },
        gallery: {
            title: 'Наша <span class="text-purple-400">Атмосфера</span>'
        },
        playstation: {
            title: 'Наша <span class="text-purple-400">PlayStation</span> Зона'
        },
        ps5games: { title: 'Наши Игры для <span class="text-purple-400">Playstation 5</span>' },
        ps4games: { title: 'Наши Игры для <span class="text-purple-400">Playstation 4</span>' },
        location: {
            title: 'Найдите <span class="text-purple-400">Нас</span>',
            address_title: 'Наш Адрес',
            address_value: 'ул. Мирмахмуда Кязимовского 142а, Баку 1114, Азербайджан',
            hours_title: 'Часы Работы',
            hours_value: 'Круглосуточно'
        },
        partners: {
            title: 'При поддержке лидеров индустрии'
        },
        faq: {
            title: 'Часто Задаваемые <span class="text-purple-400">Вопросы</span>'
        },
        booking: {
            title: 'Готовы покорять <br /> таблицы лидеров?',
            subtitle: 'Ваша следующая победа ждет. Забронируйте место прямо сейчас и ощутите пик игровых возможностей.',
            cta: 'Забронировать Место'
        },
        footer: {
            description: 'Ваше главное место для соревновательных игр и киберспорта.',
            links_title: 'Быстрые Ссылки',
            social_title: 'Следите за нами',
            contact_title: 'Контакты',
            copyright: 'PixelCyberZone. Все права защищены.'
        },
        pricing: {
            title: 'Наши <span class="text-purple-400">Цены</span>',
            cta: 'Забронировать'
        },
        pricing_plans_data: pricing_plans_data_ru,
        resident_plans_data: resident_plans_data_ru,
        cases_data: cases_data_ru,
        // Static data for non-english languages
        games_data: initialContent.en.games,
        ps5_games_data: initialContent.en.ps5Games,
        ps4_games_data: initialContent.en.ps4Games,
        specs_data: specs_data_ru,
        gallery_images_data: initialContent.en.galleryImages,
        playstation_images_data: initialContent.en.playstationImages,
        partner_logos: initialContent.en.partnerLogos,
        faq_data: [
            { question: 'Нужно ли мне приносить свои наушники или мышь?', answer: 'Мы предоставляем высококачественную периферию на каждой станции. Однако вы можете принести свое оборудование и подключить его!' },
            { question: 'Могу ли я зарезервировать ПК заранее?', answer: 'Да! Мы настоятельно рекомендуем бронировать место через наш веб-сайт, особенно в часы пик и в выходные, чтобы гарантировать себе место.' },
            { question: 'Продаете ли вы еду и напитки?', answer: 'Конечно. У нас есть полностью укомплектованный снэк-бар с разнообразными напитками, закусками и легкими блюдами, чтобы вы могли подкрепиться во время игровой сессии.' },
            { question: 'Могу ли я устанавливать свои собственные игры?', answer: 'Наши ПК поставляются с предустановленной огромной библиотекой популярных игр. Если вы хотите сыграть в определенную игру, которой у нас нет, пожалуйста, обратитесь к нашему персоналу, и мы сделаем все возможное, чтобы вам помочь.' },
            { question: 'Почему мне стоит выбрать PixelCyberZone?', answer: 'Мы предлагаем первоклассный игровой опыт с топовым оборудованием, включая видеокарты RTX 4060 и мониторы 240 Гц, что обеспечивает нулевую задержку. Наша обширная библиотека включает последние игры для ПК и PlayStation. Мы открыты 24/7 и поддерживаем живое сообщество, что делает нас идеальным местом как для обычных, так и для соревновательных геймеров.' }
        ] as FAQ[],
    }
};