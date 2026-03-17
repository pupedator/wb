import React from 'react';
import FAQItem from './FAQItem.tsx';
import { useLanguage } from '../contexts/LanguageContext.tsx';

const FAQSection: React.FC = () => {
  const { t, faqs } = useLanguage();

  return (
    <section id="faq" className="py-20 md:py-32 bg-neutral-950/90 backdrop-blur-sm">
      <div className="container mx-auto px-6 max-w-3xl">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-white" dangerouslySetInnerHTML={{ __html: t('faq.title') }}>
        </h2>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <FAQItem key={index} faq={faq} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;