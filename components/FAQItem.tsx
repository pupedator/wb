import React, { useState, useRef, useEffect } from 'react';
import type { FAQ } from '../types.ts';

interface FAQItemProps {
  faq: FAQ;
}

const FAQItem: React.FC<FAQItemProps> = ({ faq }) => {
  const [isOpen, setIsOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <div className="border-b border-neutral-800">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center text-left py-5"
        aria-expanded={isOpen}
      >
        <span className="text-lg font-medium text-white">{faq.question}</span>
        <span className={`transform transition-transform duration-300 ${isOpen ? 'rotate-45' : 'rotate-0'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </span>
      </button>
      <div
        ref={contentRef}
        style={{ maxHeight: isOpen ? `${contentRef.current?.scrollHeight}px` : '0px' }}
        className="overflow-hidden transition-all duration-500 ease-in-out"
      >
        <p className="text-neutral-300 pb-5 pr-6">
          {faq.answer}
        </p>
      </div>
    </div>
  );
};

export default FAQItem;