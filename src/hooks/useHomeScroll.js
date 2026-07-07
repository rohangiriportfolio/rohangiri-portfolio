import { useEffect, useState } from 'react';

/**
 * Returns a ratio 0→1 as the user scrolls through the home section.
 * 0 = at home (scrollY ≈ 0), 1 = scrolled ~72% past home height.
 */
export function useHomeScroll() {
  const [ratio, setRatio] = useState(0);

  useEffect(() => {
    function onScroll() {
      const homeEl = document.getElementById('home');
      if (!homeEl) return;
      const max = homeEl.offsetHeight * 0.72;
      setRatio(Math.min(1, Math.max(0, window.scrollY / max)));
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return ratio;
}
