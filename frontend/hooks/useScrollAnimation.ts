import { useEffect, useRef } from 'react';

/**
 * A custom React hook that provides a simple way to apply animations when an element
 * is scrolled into the viewport.
 * 
 * How it works:
 * 1. It creates a `ref` which should be attached to the DOM element you want to observe.
 * 2. It uses the `IntersectionObserver` API, a modern browser feature that efficiently
 *    detects when an element enters or leaves the browser's viewport.
 * 3. When the observed element intersects with the viewport (even by a small amount, threshold: 0.1),
 *    it removes the initial 'hidden' classes (`opacity-0`, `translate-y-10`) and adds the
 *    'visible' classes (`opacity-100`, `translate-y-0`).
 * 4. After the animation is triggered once, it stops observing the element to save resources.
 * 
 * @returns {React.RefObject<HTMLDivElement>} A ref object to be assigned to a JSX element.
 */
export const useScrollAnimation = () => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return; // Do nothing if the element isn't rendered yet.

    // Create an observer instance with a callback function.
    const observer = new IntersectionObserver(
      ([entry]) => {
        // `entry.isIntersecting` is true if the element is in the viewport.
        if (entry.isIntersecting) {
          // Animate the element in.
          element.classList.remove('opacity-0', 'translate-y-10');
          element.classList.add('opacity-100', 'translate-y-0');
          // We only want the animation to run once, so we unobserve the element.
          observer.unobserve(element);
        }
      },
      {
        // The animation will trigger when 10% of the element is visible.
        threshold: 0.1,
      }
    );

    // Start observing the element.
    observer.observe(element);

    // Cleanup function: This is called when the component unmounts.
    // It's good practice to disconnect the observer to prevent memory leaks.
    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, []); // The empty dependency array means this effect runs only once after the component mounts.

  return ref;
};