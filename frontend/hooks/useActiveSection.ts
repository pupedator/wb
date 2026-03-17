import { useState, useEffect, useRef } from 'react';

export const useActiveSection = () => {
  const [activeSection, setActiveSection] = useState<string>('hero');
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    // Define all sections to observe
    const sectionIds = [
      'hero',
      'resident', 
      'cases-teaser',
      'hardware',
      'games',
      'gallery',
      'playstation',
      'ps5games',
      'ps4games',
      'location',
      'faq',
      'booking'
    ];

    // Create intersection observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        // Find the section that's most in view
        const visibleSections = entries
          .filter(entry => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visibleSections.length > 0) {
          const mostVisible = visibleSections[0];
          setActiveSection(mostVisible.target.id);
        }
      },
      {
        // Trigger when 30% of the section is visible
        threshold: 0.3,
        // Add some margin to make transitions smoother
        rootMargin: '-20% 0px -20% 0px'
      }
    );

    // Observe all sections
    sectionIds.forEach(id => {
      const element = document.getElementById(id);
      if (element && observerRef.current) {
        observerRef.current.observe(element);
      }
    });

    // Cleanup
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return activeSection;
};
