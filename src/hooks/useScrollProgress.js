import { useEffect, useState } from 'react';

/**
 * Tracks overall page scroll progress (0–1) and which section id
 * is currently most visible, for the navbar + side trace indicator.
 */
export function useScrollProgress(sectionIds) {
  const [progress, setProgress] = useState(0);
  const [activeId, setActiveId] = useState(sectionIds[0]);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let ticking = false;

    function update() {
      ticking = false;
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      const ratio = max > 0 ? window.scrollY / max : 0;
      setProgress(Math.min(1, Math.max(0, ratio)));
      setScrolled(window.scrollY > 40);

      const viewportAnchor = window.scrollY + window.innerHeight * 0.3;
      let current = sectionIds[0];
      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el && el.offsetTop <= viewportAnchor) {
          current = id;
        }
      }
      setActiveId(current);
    }

    function onScroll() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    }

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [sectionIds]);

  return { progress, activeId, scrolled };
}
