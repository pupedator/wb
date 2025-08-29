import type { Game, Spec, GalleryImage, CaseReward, Case } from '../types.ts';

const specs_data_en: Spec[] = [
    { id: 'spec-1', name: 'CPU', value: 'Intel Core i5-12400', icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 21v-1.5M15.75 3v1.5M19.5 8.25H21M19.5 12H21M19.5 15.75H21M15.75 21v-1.5m-7.5-12h7.5v7.5h-7.5z" /></svg>' },
    { id: 'spec-2', name: 'Graphics Card', value: 'NVIDIA RTX 4060 8GB', icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h12A2.25 2.25 0 0020.25 14.25V3M3.75 14.25v-1.5a3.375 3.375 0 013.375-3.375h9.75a3.375 3.375 0 013.375 3.375v1.5M3.75 14.25v3.75A2.25 2.25 0 006 20.25h12A2.25 2.25 0 0020.25 18v-3.75" /></svg>' },
    { id: 'spec-3', name: 'RAM', value: '32 GB 3600Mhz', icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 3.75H19.5M8.25 6.75H19.5M8.25 9.75H19.5M8.25 12.75H19.5m-11.25-9h-1.5a1.5 1.5 0 00-1.5 1.5v13.5a1.5 1.5 0 001.5 1.5h1.5v-16.5z" /></svg>' },
    { id: 'spec-4', name: 'Motherboard', value: 'PRO B760M-E DDR4', icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M20.25 6.375l-1.5-1.5-1.5 1.5-1.5-1.5-1.5 1.5-1.5-1.5-1.5 1.5-1.5-1.5-1.5 1.5-1.5-1.5-1.5 1.5-3-3-1.5 1.5-1.5-1.5-1.5 1.5-1.5-1.5-1.5 1.5-1.5-1.5-1.5 1.5v14.25l1.5-1.5 1.5 1.5 1.5-1.5 1.5 1.5 1.5-1.5 1.5 1.5 1.5-1.5 1.5 1.5 1.5-1.5 1.5 1.5 3 3 1.5-1.5 1.5 1.5 1.5-1.5 1.5 1.5 1.5-1.5 1.5 1.5 1.5-1.5V6.375z" /></svg>' },
    { id: 'spec-5', name: 'Monitor', value: 'AOC 24" 240 Hz', icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25A2.25 2.25 0 015.25 3h13.5A2.25 2.25 0 0121 5.25z" /></svg>' },
    { id: 'spec-6', name: 'Keyboard', value: 'E-YOOSO" Mechanical', icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.82m5.84-2.56a16.55 16.55 0 01.33-1.82m-1.51-6.04l-1.39-2.36a2.25 2.25 0 00-4.342 0l-1.39 2.36m5.84-2.56a42.49 42.49 0 00-5.84 2.56m11.68 0a42.49 42.49 0 00-5.84-2.56m5.84 2.56V11.82a2.25 2.25 0 01-2.25 2.25h-1.5a2.25 2.25 0 01-2.25-2.25V8.63m16.5 6.75h-1.5a2.25 2.25 0 01-2.25-2.25V8.63m0 0V3.32a2.25 2.25 0 00-2.25-2.25h-1.5A2.25 2.25 0 009.37 3.32v5.31m0 0a2.25 2.25 0 01-2.25 2.25h-1.5a2.25 2.25 0 01-2.25-2.25V8.63m0 0V3.32a2.25 2.25 0 00-2.25-2.25h-1.5A2.25 2.25 0 00.75 3.32v5.31m16.5 0h-1.5" /></svg>' },
    { id: 'spec-7', name: 'Mouse', value: 'HyperX Pulsefire Core', icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zm-7.518-.267A8.25 8.25 0 1120.25 10.5M8.288 14.212A5.25 5.25 0 1117.25 10.5" /></svg>' },
    { id: 'spec-8', name: 'Headset', value: 'Hyperx Cloud Stinger 2', icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m12 0v-1.5a6 6 0 00-6-6v0a6 6 0 00-6 6v1.5m6 13.5v-1.5" /></svg>' }
];

const games_data: Game[] = [
    { id: 'game-1', title: 'Fortnite', image: 'https://i.ibb.co/W4dVgFQJ/FNBR-37-00-C6-S4-EGS-Launcher-Key-Art-FNLogo-Carousel-PDP-2560x1440-logo-2560x1440-04348f5d3d52391f5.jpg' },
    { id: 'game-2', title: 'Arena Breakout', image: 'https://i.ibb.co/bRPvQHyH/unnamed.webp' },
    { id: 'game-3', title: 'Apex Legends', image: 'https://i.ibb.co/0L4M53f/capsule-616x353.jpg' },
    { id: 'game-4', title: 'Overwatch 2', image: 'https://i.ibb.co/k6MMvKXF/maxresdefault.jpg' },
    { id: 'game-5', title: 'Rust', image: 'https://i.ibb.co/cSGMpyCN/rust-pc-mac-game-steam-cover.jpg' },
    { id: 'game-6', title: 'GTA V', image: 'https://i.ibb.co/cKG3y5CY/unnamed.jpg' },
    { id: 'game-7', title: 'Counter-Strike 2', image: 'https://i.ibb.co/RW7tN6s/Cs2-boxart.webp' },
    { id: 'game-8', title: 'Valorant', image: 'https://i.ibb.co/mC9Mpptx/Valorant-cover.jpg' },
    { id: 'game-9', title: 'Dota 2', image: 'https://i.ibb.co/QF5pGnHc/Dota-2-Steam-artwork.jpg' },
    { id: 'game-10', title: 'Point Blank', image: 'https://i.ibb.co/tP1DDtsK/og-image-tr.jpg' },
    { id: 'game-11', title: "Tom Clancy's Rainbow Six Siege", image: 'https://i.ibb.co/Nn3Lqg1Z/header-2.jpg' },
    { id: 'game-12', title: 'PUBG', image: 'https://i.ibb.co/s9GGxwpm/pubg-battlegrounds-1rx7f.png' },
    { id: 'game-13', title: 'Battlefield 1', image: 'https://i.ibb.co/6RbdnGdc/Battlefield-1.jpg' },
    { id: 'game-14', title: 'War Thunder', image: 'https://i.ibb.co/hJ3mgVXB/opengraph-wtland.jpg' },
];

const ps5_games_data: Game[] = [
    { id: 'ps5-1', title: 'EA Sports FC 25', image: 'https://i0.wp.com/brignews.com/wp-content/uploads/2024/10/GOAL-Blank-WEB-Facebook-2024-07-17T151013.046.jpg.webp?fit=1920%2C1080&ssl=1' },
    { id: 'ps5-2', title: 'UFC 5', image: 'https://upload.wikimedia.org/wikipedia/en/c/cc/EA_Sports_UFC_5_cover_art.jpeg' },
    { id: 'ps5-3', title: 'Black Ops 6', image: 'https://static.wikia.nocookie.net/callofduty/images/7/79/BO6_Key_Art_04.png/revision/latest?cb=20240610221019&path-prefix=ru' },
    { id: 'ps5-4', title: 'Mortal Kombat 1', image: 'https://upload.wikimedia.org/wikipedia/en/5/5b/Mortal_Kombat_1_key_art.jpeg' },
    { id: 'ps5-5', title: 'Mortal Kombat 11', image: 'https://upload.wikimedia.org/wikipedia/en/7/7e/Mortal_Kombat_11_cover_art.png' },
    { id: 'ps5-6', title: 'GTA V', image: 'https://i.ibb.co/cKG3y5CY/unnamed.jpg' },
];

const ps4_games_data: Game[] = [
    { id: 'ps4-1', title: 'Red Dead Redemption 2', image: 'https://i.ibb.co/h1r3CBFD/Red-Dead-Redemption-II.jpg' },
    { id: 'ps4-2', title: 'Resident Evil 4', image: 'https://i.ibb.co/dwRmMNvR/Resident-Evil-4-remake-cover-art.jpg' },
    { id: 'ps4-3', title: 'EA Sports FC 25', image: 'https://i0.wp.com/brignews.com/wp-content/uploads/2024/10/GOAL-Blank-WEB-Facebook-2024-07-17T151013.046.jpg.webp?fit=1920%2C1080&ssl=1' },
    { id: 'ps4-4', title: 'Cyberpunk 2077', image: 'https://i.ibb.co/5hPVdqNK/Cyberpunk-2077-box-art.jpg' },
    { id: 'ps4-5', title: 'Mortal Kombat 11', image: 'https://upload.wikimedia.org/wikipedia/en/7/7e/Mortal_Kombat_11_cover_art.png' },
    { id: 'ps4-6', title: 'eFootball', image: 'https://i.ibb.co/4gnftMjs/co3h8g.jpg' },
    { id: 'ps4-7', title: "Marvel's Spider-Man", image: 'https://i.ibb.co/rXNx04k/Spider-Man-PS4-cover.jpg' },
    { id: 'ps4-8', title: 'The Last of Us Part II', image: 'https://i.ibb.co/849sFc0j/header.jpg' },
    { id: 'ps4-9', title: 'GTA V', image: 'https://i.ibb.co/cKG3y5CY/unnamed.jpg' },
];

const gallery_images_data: GalleryImage[] = [
    { id: 'gallery-1', src: 'https://i.ibb.co/JFBTFD45/5348288161576510546-1.jpg' },
    { id: 'gallery-2', src: 'https://i.ibb.co/B55jMV2F/photo-2025-08-27-02-23-22.jpg' },
    { id: 'gallery-3', src: 'https://i.ibb.co/d3bVDnP/photo-2025-08-27-02-23-18.jpg' },
];

const playstation_images_data: GalleryImage[] = [
    { id: 'psgallery-1', src: 'https://i.ibb.co/4wTmS7R5/photo-2025-08-27-02-23-14.jpg' },
    { id: 'psgallery-2', src: 'https://i.ibb.co/nqK6Rm6w/IMG-5807.jpg' },
    { id: 'psgallery-3', src: 'https://i.ibb.co/3ypD6KgV/IMG-5805.jpg' },
];

const partnerLogos = [
    { src: '<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M13.621 3.237L10.266 17.6l-3.238-2.61L3.93 3.237h3.356l1.965 8.657 2.083-8.657h2.287zm-2.022 17.526c-.414 0-.75.336-.75.75s.336.75.75.75.75-.336.75-.75-.336-.75-.75-.75zM20.763 3.237V2.5h-5.48v.737h2.152v15.026h-2.152v.737h5.48v-.737h-2.152V3.237h2.152z"/></svg>', alt: 'Intel' },
    { src: '<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M12.154 16.65L9.51 12.07l.343-4.14h4.316V3.81H5.432l2.946 9.165 2.54 4.417h-3.04L4.83 24h9.16l2.126-7.042h-4.01l.048-.308zM20.19 3.81h-4.05v8.28h4.05V3.81z"/></svg>', alt: 'NVIDIA' },
    { src: '<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M12 0L2.196 17.25h4.307L12 7.125l5.497 10.125H21.8L12 0zM12 11.625L9.44 16.12h5.12L12 11.625z"/></svg>', alt: 'AOC' },
    { src: '<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M13.064 3.327L1.13 6.99v9.117l11.934 3.663 11.935-3.663V6.99L13.064 3.327zm-1.129 1.488l9.48 2.91-4.148 2.684-9.48-2.91 4.148-2.684zm-9.046 3.4l4.148 2.684v5.39l-4.148-2.684V8.215zm10.174 8.075v-5.39l4.148-2.684v5.39l-4.148 2.684z"/></svg>', alt: 'HyperX' },
];

const cases_data_en: Case[] = [
    { 
        id: 'case-1', name: 'Bronze Case', price: '100 Points', image: 'https://i.ibb.co/8nNjKtfR/Gemini-Generated-Image-6603js6603js6603-removebg-preview.png', 
        rewards: [
            { id: 'br-1', name: '5 Bonus Points', rarity: 'common', image: 'https://i.ibb.co/3YYV3jC/bonus-points.png', chance: 50 },
            { id: 'br-2', name: '0.3L Cola', rarity: 'common', image: 'https://i.ibb.co/9vGzZzW/cola.png', chance: 30 },
            { id: 'br-3', name: '5% Discount', rarity: 'uncommon', image: 'https://i.ibb.co/dK5CjJc/discount.png', chance: 15 },
            { id: 'br-4', name: '1 Free Hour (Standard)', rarity: 'rare', image: 'https://i.ibb.co/HCf4b8t/free-hour.png', chance: 5 },
        ]
    },
    { 
        id: 'case-2', name: 'Silver Case', price: '250 Points', image: 'https://i.ibb.co/7N0H63BG/Gemini-Generated-Image-i6l6w1i6l6w1i6l6-removebg-preview.png', 
        rewards: [
            { id: 'sl-1', name: '15 Bonus Points', rarity: 'common', image: 'https://i.ibb.co/3YYV3jC/bonus-points.png', chance: 40 },
            { id: 'sl-2', name: 'Red Bull', rarity: 'uncommon', image: 'https://i.ibb.co/PQtL4gG/redbull.png', chance: 25 },
            { id: 'sl-3', name: '10% Discount', rarity: 'uncommon', image: 'https://i.ibb.co/dK5CjJc/discount.png', chance: 20 },
            { id: 'sl-4', name: '1 Free Hour (Standard)', rarity: 'rare', image: 'https://i.ibb.co/HCf4b8t/free-hour.png', chance: 12 },
            { id: 'sl-5', name: '1 Free Hour (VIP)', rarity: 'legendary', image: 'https://i.ibb.co/nMSwVwZ/vip-upgrade.png', chance: 3 }
        ]
    },
    { 
        id: 'case-3', name: 'Gold Case', price: '500 Points', image: 'https://i.ibb.co/hJhTM9Xq/Gemini-Generated-Image-dpb8nbdpb8nbdpb8-removebg-preview.png', 
        rewards: [
            { id: 'gd-1', name: '30 Bonus Points', rarity: 'common', image: 'https://i.ibb.co/3YYV3jC/bonus-points.png', chance: 35 },
            { id: 'gd-2', name: 'Red Bull', rarity: 'uncommon', image: 'https://i.ibb.co/PQtL4gG/redbull.png', chance: 25 },
            { id: 'gd-3', name: '15% Discount', rarity: 'rare', image: 'https://i.ibb.co/dK5CjJc/discount.png', chance: 20 },
            { id: 'gd-4', name: '2 Free Hours (Standard)', rarity: 'rare', image: 'https://i.ibb.co/HCf4b8t/free-hour.png', chance: 15 },
            { id: 'gd-5', name: '1 Free Hour (VIP)', rarity: 'legendary', image: 'https://i.ibb.co/nMSwVwZ/vip-upgrade.png', chance: 5 }
        ]
    },
    { 
        id: 'case-4', name: 'VIP Case', price: '1000 Points', image: 'https://i.ibb.co/8nRHzbWt/Gemini-Generated-Image-o99l8to99l8to99l-removebg-preview.png', 
        rewards: [
            { id: 'vip-1', name: '50 Bonus Points', rarity: 'uncommon', image: 'https://i.ibb.co/3YYV3jC/bonus-points.png', chance: 40 },
            { id: 'vip-2', name: '25% Discount', rarity: 'rare', image: 'https://i.ibb.co/dK5CjJc/discount.png', chance: 30 },
            { id: 'vip-3', name: '2 Free Hours (VIP)', rarity: 'legendary', image: 'https://i.ibb.co/nMSwVwZ/vip-upgrade.png', chance: 20 },
            { id: 'vip-4', name: 'Exclusive Club Perk', rarity: 'legendary', image: 'https://i.ibb.co/hZ5HwV1/perk.png', chance: 10 }
        ]
    },
];


export const initialContent = {
    en: {
        games: games_data,
        ps5Games: ps5_games_data,
        ps4Games: ps4_games_data,
        specs: specs_data_en,
        galleryImages: gallery_images_data,
        playstationImages: playstation_images_data,
        partnerLogos: partnerLogos,
        cases: cases_data_en
    }
}