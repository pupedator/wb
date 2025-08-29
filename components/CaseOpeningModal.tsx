import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext.tsx';
import type { Case, CaseReward } from '../types.ts';

/**
 * A utility function to select a random reward from a list based on their drop chances.
 * This is a weighted random selection algorithm.
 * @param rewards - An array of CaseReward objects, each with a `chance` property.
 * @returns The randomly selected CaseReward.
 */
const getRandomReward = (rewards: CaseReward[]): CaseReward => {
    // Sum up all the chances to get a total weight.
    const totalChance = rewards.reduce((sum, reward) => sum + reward.chance, 0);
    // Generate a random number between 0 and the total weight.
    let random = Math.random() * totalChance;

    // Iterate through the rewards, subtracting their chance from the random number.
    // The first reward for which the random number is less than its chance is the winner.
    for (const reward of rewards) {
        if (random < reward.chance) {
            return reward;
        }
        random -= reward.chance;
    }
    // Fallback in case of floating point inaccuracies, return the last item.
    return rewards[rewards.length - 1];
};

// A mapping of rarity levels to their corresponding Tailwind CSS classes for styling.
const RarityStyles: Record<string, { border: string; shadow: string; text: string; bg: string }> = {
    common: { border: 'border-neutral-500', shadow: 'shadow-neutral-500/20', text: 'text-neutral-200', bg: 'bg-gradient-to-b from-neutral-800 to-neutral-900' },
    uncommon: { border: 'border-green-500', shadow: 'shadow-green-500/30', text: 'text-green-300', bg: 'bg-gradient-to-b from-green-800/50 to-green-900/50' },
    rare: { border: 'border-blue-500', shadow: 'shadow-blue-500/40', text: 'text-blue-300', bg: 'bg-gradient-to-b from-blue-800/50 to-blue-900/50' },
    legendary: { border: 'border-purple-500', shadow: 'shadow-purple-500/50', text: 'text-purple-300', bg: 'bg-gradient-to-b from-purple-800/50 to-purple-900/50' },
};

// A simple React component for a single piece of confetti.
const ConfettiPiece: React.FC = () => {
  const style = {
    left: `${Math.random() * 100}%`,
    animationDuration: `${Math.random() * 2 + 3}s`, // 3s to 5s
    animationDelay: `${Math.random() * 2}s`,
    backgroundColor: ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722'][Math.floor(Math.random() * 16)],
  };
  return <div className="absolute top-[-10px] w-2 h-2 rounded-full animate-fall" style={style} />;
};

// The container for the confetti effect, which renders multiple pieces.
const Confetti: React.FC = () => (
    <div className="absolute inset-0 z-50 pointer-events-none overflow-hidden">
        {Array.from({ length: 100 }).map((_, i) => <ConfettiPiece key={i} />)}
        {/* The keyframes for the fall animation are defined directly in the component style for encapsulation. */}
        <style>{`
            @keyframes fall {
                0% { transform: translateY(-10vh) rotateZ(0deg); opacity: 1; }
                100% { transform: translateY(110vh) rotateZ(720deg); opacity: 0; }
            }
            .animate-fall {
                animation-name: fall;
                animation-timing-function: linear;
                animation-iteration-count: infinite;
            }
        `}</style>
    </div>
);


/**
 * The modal component that displays the case opening animation.
 */
const CaseOpeningModal: React.FC<{ isOpen: boolean; onClose: () => void; caseData: Case; onWin: (reward: CaseReward) => void }> = ({ isOpen, onClose, caseData, onWin }) => {
    const { t } = useLanguage();
    // 'phase' tracks the state of the animation: idle -> spinning -> revealed.
    const [phase, setPhase] = useState<'idle' | 'spinning' | 'revealed'>('idle');
    const [wonReward, setWonReward] = useState<CaseReward | null>(null);
    const [reelOffset, setReelOffset] = useState(0); // The horizontal scroll position of the reel.
    const [spinDuration, setSpinDuration] = useState(0); // The duration of the spin animation in ms.
    const [hasFiredWin, setHasFiredWin] = useState(false); // Prevents the onWin callback from firing multiple times.

    // Refs to control audio elements.
    const tickAudioRef = useRef<HTMLAudioElement>(null);
    const winAudioRef = useRef<HTMLAudioElement>(null);
    const containerRef = useRef<HTMLDivElement>(null); // Ref to the reel container to measure its width.

    // `useMemo` is used to create the list of items for the spinning reel animation.
    // It's memoized so it only recalculates if the caseData changes.
    const reelItems = useMemo(() => {
        if (!caseData) return [];
        const items: CaseReward[] = [];
        // 1. Create a base reel of 100 items using weighted randomness to represent the case's odds.
        for (let i = 0; i < 100; i++) {
            items.push(getRandomReward(caseData.rewards));
        }

        // 2. Sprinkle in some high-rarity items for visual flair, to make the spin more exciting.
        //    This does NOT affect the final prize, it just makes the animation more thrilling.
        const highRarityItems = caseData.rewards.filter(r => r.rarity === 'rare' || r.rarity === 'legendary');
        if (highRarityItems.length > 0) {
            for (let i = 0; i < 5; i++) { // Add 5 flashy items.
                const randomIndex = Math.floor(Math.random() * 80); // Only in the first 80 slots to not interfere with the winning item.
                const randomHighRarityItem = highRarityItems[Math.floor(Math.random() * highRarityItems.length)];
                items[randomIndex] = randomHighRarityItem;
            }
        }

        return items;
    }, [caseData]);

    // The main function to start the spin animation.
    const handleSpin = () => {
        // 1. Determine the actual winning reward.
        const reward = getRandomReward(caseData.rewards);
        setWonReward(reward);
        setPhase('spinning');

        // 2. Place the winning reward at a random position near the end of the reel.
        const targetIndexInReel = 80 + Math.floor(Math.random() * 19);
        reelItems[targetIndexInReel] = reward;

        // 3. Calculate the final scroll offset for the reel.
        const itemWidth = 150; // Must match the CSS width of .reel-item
        const containerWidth = containerRef.current ? containerRef.current.offsetWidth : 0;
        const targetPosition = targetIndexInReel * itemWidth;
        // Add a "jitter" to make the final position less predictable, so it doesn't always stop perfectly in the middle.
        const jitter = (Math.random() - 0.5) * (itemWidth * 0.8);
        // The final offset is calculated to center the target item under the ticker.
        const finalOffset = targetPosition - (containerWidth / 2) + (itemWidth / 2) + jitter;

        // 4. Set the animation duration and the final offset.
        const duration = 7000 + Math.random() * 1000; // 7-8 seconds spin.
        setSpinDuration(duration);
        setReelOffset(finalOffset);

        // 5. Play sound effects.
        if (tickAudioRef.current) {
            tickAudioRef.current.currentTime = 0;
            tickAudioRef.current.play();
        }

        // 6. Set a timeout to transition to the 'revealed' phase after the animation ends.
        setTimeout(() => {
            setPhase('revealed');
            if (tickAudioRef.current) tickAudioRef.current.pause();
            if (winAudioRef.current && (reward.rarity === 'rare' || reward.rarity === 'legendary')) {
                winAudioRef.current.currentTime = 0;
                winAudioRef.current.play();
            }
        }, duration);
    };

    // This effect starts the spin when the modal is opened.
    useEffect(() => {
        if (isOpen) {
            handleSpin();
        } else {
            // Reset the state after the modal is closed to be ready for the next opening.
            const timer = setTimeout(() => {
                setPhase('idle');
                setWonReward(null);
                setReelOffset(0);
                setSpinDuration(0);
                setHasFiredWin(false);
            }, 300); // Delay to allow the closing animation to finish.
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    // This effect calls the `onWin` callback once the reward is revealed.
    useEffect(() => {
        if (phase === 'revealed' && wonReward && !hasFiredWin) {
            onWin(wonReward);
            setHasFiredWin(true); // Set the flag to true to prevent it from firing again.
        }
    }, [phase, wonReward, onWin, hasFiredWin]);

    if (!isOpen) return null;

    const rarityStyle = wonReward ? RarityStyles[wonReward.rarity] : RarityStyles.common;

    return (
        <div
            className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4"
            onClick={phase !== 'spinning' ? onClose : undefined} // Prevent closing while spinning
            role="dialog"
            aria-modal="true"
            aria-labelledby="case-opening-title"
        >
            <div className="bg-neutral-950 border border-purple-500/30 rounded-lg p-6 max-w-2xl w-full relative overflow-hidden" onClick={(e) => e.stopPropagation()}>
                {/* Conditionally render confetti for high-rarity wins */}
                {phase === 'revealed' && (wonReward?.rarity === 'rare' || wonReward?.rarity === 'legendary') && <Confetti />}
                
                <h2 id="case-opening-title" className="text-2xl font-bold text-center mb-6 text-white">
                    {phase === 'spinning' ? t('cases.opening_title') : t('cases.won_title')}
                </h2>

                <div ref={containerRef} className="reel-container my-4">
                    <div 
                        className="reel"
                        style={{
                            transform: `translateX(-${reelOffset}px)`,
                            transition: `transform ${spinDuration}ms cubic-bezier(0.2, 0.6, 0.2, 1)` // Easing function for a smooth slowdown
                        }}
                    >
                        {reelItems.map((item, index) => (
                            <div key={index} className={`reel-item ${RarityStyles[item.rarity].bg}`}>
                                <img src={item.image} alt={item.name} className="reel-item-image" />
                                <span className={`reel-item-name ${RarityStyles[item.rarity].text}`}>{item.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* This section is shown only after the spinning is complete */}
                {phase === 'revealed' && wonReward && (
                     <div className="flex flex-col items-center justify-center text-center animate-fade-in relative z-10 mt-6">
                        <div className={`relative p-4 rounded-lg border-2 ${rarityStyle.border} ${rarityStyle.bg} shadow-lg ${rarityStyle.shadow}`}>
                            <img src={wonReward.image} alt={wonReward.name} className="h-32 w-32 object-contain drop-shadow-lg" />
                        </div>
                        <h3 className={`text-3xl font-bold mt-4 ${rarityStyle.text}`}>{wonReward.name}</h3>
                        <p className="text-neutral-400 capitalize">{wonReward.rarity}</p>
                        <button onClick={onClose} className="mt-6 w-full max-w-xs bg-neutral-700 hover:bg-neutral-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
                            {t('cases.close_button')}
                        </button>
                    </div>
                )}
            </div>
            {/* Audio elements - hidden from view */}
            <audio ref={tickAudioRef} src="https://cdn.pixabay.com/audio/2021/08/04/audio_12b0c1499b.mp3" loop></audio>
            <audio ref={winAudioRef} src="https://cdn.pixabay.com/audio/2022/11/17/audio_88c452e391.mp3"></audio>
        </div>
    );
};

export default CaseOpeningModal;