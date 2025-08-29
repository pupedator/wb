import React from 'react';
import { useLanguage } from '../contexts/LanguageContext.tsx';
import type { PricingPlan } from '../types.ts';

const PricingCard: React.FC<{ plan: PricingPlan, ctaText: string, bookingLink: string }> = ({ plan, ctaText, bookingLink }) => (
    <div className={`p-8 rounded-xl border flex flex-col ${plan.highlight ? 'bg-purple-600/10 border-purple-500' : 'bg-neutral-900 border-neutral-800'}`}>
        <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
        <p className="text-4xl font-extrabold text-purple-400 mb-6">{plan.price}<span className="text-lg font-normal text-neutral-400">/{plan.period}</span></p>
        <ul className="space-y-3 mb-8 text-neutral-300 flex-grow">
            {plan.features.map((feature, index) => (
                <li key={index} className="flex items-center space-x-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    <span>{feature}</span>
                </li>
            ))}
        </ul>
        <a href={bookingLink} target="_blank" rel="noopener noreferrer" className={`w-full text-center font-bold py-3 rounded-lg transition-all duration-300 ${plan.highlight ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200'}`}>
            {ctaText}
        </a>
    </div>
);

const PricingSection: React.FC = () => {
    const { t, pricingPlans, bookingLink } = useLanguage();
    return (
        <section id="pricing" className="py-20 md:py-32 bg-neutral-950">
            <div className="container mx-auto px-6">
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-white" dangerouslySetInnerHTML={{ __html: t('pricing.title') }}>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    {pricingPlans.map((plan, index) => (
                        <PricingCard key={index} plan={plan} ctaText={t('pricing.cta')} bookingLink={bookingLink} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default PricingSection;