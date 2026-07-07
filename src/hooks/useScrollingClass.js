import { useEffect } from 'react';

/**
 * Adds an `is-scrolling` class to <body> while the page is actively
 * scrolling, and removes it ~120ms after scrolling stops.
 *
 * Used on mobile to pause purely-decorative animations (background orb
 * drift, etc.) during a touch-scroll fling — fewer things for the browser
 * to keep compositing on the fixed backdrop layer at exactly the moment
 * some Android/Chrome builds are prone to dropping a repaint (the
 * "black flash"). Nothing user-facing changes; the animation just resumes
 * a fraction of a second after the finger lifts.
 */
export function useScrollingClass() {
  useEffect(() => {
    let tid;
    function onScroll() {
      document.body.classList.add('is-scrolling');
      clearTimeout(tid);
      tid = setTimeout(() => {
        document.body.classList.remove('is-scrolling');
      }, 120);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      clearTimeout(tid);
      window.removeEventListener('scroll', onScroll);
      document.body.classList.remove('is-scrolling');
    };
  }, []);
}
