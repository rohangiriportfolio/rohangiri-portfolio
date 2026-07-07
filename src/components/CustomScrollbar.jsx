import { useEffect, useRef, useState } from 'react';

// Native ::-webkit-scrollbar-thumb pseudo-elements don't reliably run CSS
// animations in most browsers (they mostly only repaint on hover/drag), so
// an animated gradient there just sits static. This renders a real DOM
// element instead — a small fixed track + thumb on the right edge — whose
// gradient keeps flowing because it's an ordinary animated element.
//
// One more gotcha: `html` has scroll-behavior: smooth globally. Per spec
// that applies to ANY scroll on the page — window.scrollTo(), and even a
// plain `element.scrollTop = value` assignment — not just scrollIntoView.
// So during a drag, every mousemove was queuing a fresh smooth-scroll
// animation on top of the last one, which made the page keep re-targeting
// instead of jumping straight to the mouse: it visibly lagged and only
// "caught up" once the drag ended and the last animation finished. The fix
// is to temporarily force scroll-behavior: auto on <html> for the duration
// of the drag, then restore it on release.

const THUMB_MIN_HEIGHT = 40;

function measure() {
  const doc = document.documentElement;
  const viewportHeight = window.innerHeight;
  const scrollHeight = doc.scrollHeight;
  const trackHeight = viewportHeight;
  const ratio = scrollHeight > 0 ? viewportHeight / scrollHeight : 1;
  const height = Math.min(trackHeight, Math.max(THUMB_MIN_HEIGHT, trackHeight * ratio));
  const maxThumbTop = trackHeight - height;
  const maxScroll = Math.max(0, scrollHeight - viewportHeight);
  const scrollTop = doc.scrollTop || window.scrollY || 0;
  const top = maxScroll > 0 ? (scrollTop / maxScroll) * maxThumbTop : 0;
  return { height, top, maxThumbTop, maxScroll, scrollable: scrollHeight > viewportHeight + 1 };
}

export default function CustomScrollbar() {
  const [thumb, setThumb] = useState({ top: 0, height: THUMB_MIN_HEIGHT });
  const [visible, setVisible] = useState(false);
  const draggingRef = useRef(false);
  const grabOffsetRef = useRef(0);

  useEffect(() => {
    const update = () => {
      const m = measure();
      setVisible(m.scrollable);
      setThumb({ top: m.top, height: m.height });
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);

    const toClientY = e => (e.touches && e.touches[0] ? e.touches[0].clientY : e.clientY);

    const onPointerMove = e => {
      if (!draggingRef.current) return;
      e.preventDefault();
      const m = measure();
      let newTop = toClientY(e) - grabOffsetRef.current;
      newTop = Math.min(Math.max(newTop, 0), m.maxThumbTop);
      const newScroll = m.maxThumbTop > 0 ? (newTop / m.maxThumbTop) * m.maxScroll : 0;
      document.documentElement.scrollTop = newScroll;
      document.body.scrollTop = newScroll; // Safari/older WebKit fallback
      // Update the thumb from the drag math immediately rather than
      // waiting for the resulting 'scroll' event, so it tracks the mouse
      // with zero perceived lag.
      setThumb({ top: newTop, height: m.height });
    };

    const onPointerUp = () => {
      draggingRef.current = false;
      document.body.style.userSelect = '';
      document.documentElement.style.scrollBehavior = ''; // restore the site's normal smooth in-page nav scrolling
    };

    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);
    window.addEventListener('touchmove', onPointerMove, { passive: false });
    window.addEventListener('touchend', onPointerUp);

    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      window.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('touchend', onPointerUp);
    };
  }, []);

  const startDrag = clientY => {
    draggingRef.current = true;
    grabOffsetRef.current = clientY - thumb.top;
    document.body.style.userSelect = 'none';
    document.documentElement.style.scrollBehavior = 'auto'; // suspend the smooth-scroll CSS for the duration of the drag
  };

  const onThumbMouseDown = e => {
    e.preventDefault();
    startDrag(e.clientY);
  };
  const onThumbTouchStart = e => {
    startDrag(e.touches[0].clientY);
  };

  const onTrackMouseDown = e => {
    if (e.target !== e.currentTarget) return; // clicked the thumb itself, not the bare track
    const m = measure();
    const targetTop = Math.min(Math.max(e.clientY - thumb.height / 2, 0), m.maxThumbTop);
    const newScroll = m.maxThumbTop > 0 ? (targetTop / m.maxThumbTop) * m.maxScroll : 0;
    window.scrollTo({ top: newScroll, behavior: 'smooth' });
  };

  if (!visible) return null;

  return (
    <div className="custom-scrollbar-track" onMouseDown={onTrackMouseDown}>
      <div
        className="custom-scrollbar-thumb"
        style={{ top: `${thumb.top}px`, height: `${thumb.height}px` }}
        onMouseDown={onThumbMouseDown}
        onTouchStart={onThumbTouchStart}
      />
    </div>
  );
}
