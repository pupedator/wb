import React from 'react';
import type { ResidentPlan } from '../types.ts';

const CheckIcon = () => (
    <div className="w-6 h-6 flex items-center justify-center rounded-full bg-blue-500/50">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
    </div>
);

const CrossIcon = () => (
    <div className="w-6 h-6 flex items-center justify-center rounded-full bg-neutral-700/50">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
    </div>
);

const ResidentCard: React.FC<{ plan: ResidentPlan }> = ({ plan }) => {
    return (
        <div 
            className="bg-black/40 backdrop-blur-md border border-neutral-700 rounded-2xl p-4 sm:p-6 md:p-8 flex flex-col space-y-4 sm:space-y-6 font-mono"
            style={{
                boxShadow: '0 0 15px rgba(147, 51, 234, 0.1), 0 0 30px rgba(147, 51, 234, 0.05)'
            }}
        >
            <div className="flex justify-between items-start">
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white tracking-widest uppercase">{plan.title}</h3>
                <img src="https://i.ibb.co/5WBFyxC3/Pixel.png" alt="Pixel" className="h-6 sm:h-8 w-auto" />
            </div>

            <div className="flex justify-between items-baseline border-b border-neutral-700 pb-4 sm:pb-6">
                <p className="text-sm sm:text-base text-neutral-300">{plan.topUpLabel}</p>
                <p className="text-2xl sm:text-3xl font-bold text-white">{plan.topUpAmount}</p>
            </div>

            <div className="space-y-3 sm:space-y-4 flex-grow">
                {plan.features.map((feature, index) => (
                    <div key={index} className="flex justify-between items-center text-sm sm:text-base md:text-lg">
                        <span className="text-neutral-300 mr-2 sm:mr-4 flex-shrink-0">{feature.name}</span>
                        <div className="flex items-center w-full min-w-0">
                            <div className="flex-grow border-b border-dashed border-neutral-600 h-1 mx-1 sm:mx-2"></div>
                             {feature.type === 'string' ? (
                                <span className="font-bold text-white text-xs sm:text-sm md:text-base flex-shrink-0">{feature.value}</span>
                             ) : (
                                <div className="flex-shrink-0">{feature.value ? <CheckIcon /> : <CrossIcon />}</div>
                             )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ResidentCard;