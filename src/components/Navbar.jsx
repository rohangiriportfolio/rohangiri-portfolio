import { useEffect, useRef, useState } from 'react';
import { navLinks, profile } from '../data/content';
import { IconHome, IconSkills, IconCreation, IconTerminal, IconChat } from './icons/Icons';
import { useLogout } from './LogoutButton.jsx';

const ICONS = {
  home: IconHome, skills: IconSkills,
  creation: IconCreation, terminal: IconTerminal, testimonials: IconChat,
};

const BRAND_SHIFT_MAX = 48; // must match FloatingPortrait.jsx

export default function Navbar({ activeId, scrolled, scrollRatio = 0, onNavigate, onShiftMaxChange }) {
  const [open, setOpen] = useState(false);
  const [shiftMax, setShiftMax] = useState(BRAND_SHIFT_MAX);
  const brandRef = useRef(null);
  const toggleRef = useRef(null);
  const { loggingOut, logout } = useLogout();
  const scrollYRef = useRef(0);
  // Set right before a nav link closes the drawer to navigate somewhere.
  // Tells the close-effect below "don't restore the old scroll position —
  // onNavigate()'s scrollIntoView() is already handling where we land."
  const navigatingRef = useRef(false);

  // overflow:hidden alone doesn't stop mobile Safari/Chrome from letting
  // the background rubber-band/scroll while a drawer is open — and THAT
  // touch-scroll is what makes the address bar collapse mid-gesture,
  // leaving a blank strip below the fixed drawer. Locking body position
  // instead fully pins the page so no scroll gesture can reach it.
  useEffect(() => {
    if (open) {
      scrollYRef.current = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollYRef.current}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.width = '100%';
    } else {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.width = '';

      // Only restore the pre-open scroll position when the drawer was
      // dismissed without navigating (overlay tap / close button). If a
      // nav link triggered this close, handleNavigate() already started a
      // smooth scrollIntoView() to the target section — restoring here too
      // would snap the page straight back to the old position and cancel
      // that scroll before it's visible, which is why nav links looked
      // broken on mobile.
      if (navigatingRef.current) {
        navigatingRef.current = false;
      } else {
        // Force truly instant (bypassing the global CSS scroll-behavior:
        // smooth) by toggling the inline style, which beats stylesheet
        // rules regardless of the 'instant' keyword's browser support.
        const html = document.documentElement;
        const prevBehavior = html.style.scrollBehavior;
        html.style.scrollBehavior = 'auto';
        window.scrollTo(0, scrollYRef.current);
        html.style.scrollBehavior = prevBehavior;
      }
    }
    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.width = '';
    };
  }, [open]);

  // Measure the real gap between the brand's unshifted right edge and the
  // hamburger toggle, and cap the shift so the brand (after translateX) can
  // never visually overlap it — regardless of screen width or font metrics.
  // `offsetWidth`/parent padding are layout values, unaffected by the
  // transform, so this stays accurate even after the brand has shifted.
  useEffect(() => {
    function measure() {
      const brandEl  = brandRef.current;
      const toggleEl = toggleRef.current;
      const navbarEl = brandEl?.closest('.navbar');
      if (!brandEl || !navbarEl) return;

      const navRect = navbarEl.getBoundingClientRect();
      const navLeft = navRect.left + 28; // navbar left padding
      const brandNaturalRight = navLeft + brandEl.offsetWidth;

      let cap = BRAND_SHIFT_MAX;
      if (toggleEl) {
        const tRect = toggleEl.getBoundingClientRect();
        if (tRect.width > 0) {
          const available = tRect.left - brandNaturalRight - 16; // safe gap
          cap = Math.max(0, Math.min(BRAND_SHIFT_MAX, available));
        }
      }
      setShiftMax(cap);
      onShiftMaxChange?.(cap);
    }

    const tid = setTimeout(measure, 400);
    let resizeTid;
    function onResize() {
      clearTimeout(resizeTid);
      resizeTid = setTimeout(measure, 200);
    }
    window.addEventListener('resize', onResize);
    return () => {
      clearTimeout(tid);
      clearTimeout(resizeTid);
      window.removeEventListener('resize', onResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleNavigate(id) {
    // Tell the effect above to skip its own scroll restore when it sees
    // `open` flip to false in a moment — this navigation is already taking
    // the page somewhere new, so that restore must not run.
    navigatingRef.current = true;

    // Release the scroll lock synchronously first. The effect below also
    // does this, but only after React re-renders — which is too late for
    // onNavigate()'s scrollIntoView() below, since that runs synchronously
    // right now while body is still position:fixed and can't visibly
    // scroll. Unlocking here first is what makes the nav link's scroll
    // actually happen.
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    document.body.style.width = '';

    // Jump instantly back to the saved Y before scrolling to the target —
    // otherwise the browser starts from Y=0 (where body-fixed pinned the
    // viewport) and the smooth scrollIntoView() below animates from the
    // wrong place. Force instant regardless of the global smooth
    // scroll-behavior by toggling the inline style, which always wins over
    // stylesheet rules.
    const html = document.documentElement;
    const prevBehavior = html.style.scrollBehavior;
    html.style.scrollBehavior = 'auto';
    window.scrollTo(0, scrollYRef.current);
    html.style.scrollBehavior = prevBehavior;

    setOpen(false);

    // Give mobile browsers a frame (sometimes it takes two) to settle the
    // now-unlocked layout before starting the smooth scroll. Starting
    // scrollIntoView() in the exact same tick the fixed-position lock is
    // released is unreliable on iOS Safari / Android Chrome — the engine
    // hasn't finished recomputing the scrollable area yet, so the call can
    // silently no-op, which is why nav links appeared dead on mobile.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => onNavigate(id));
    });
  }

  // Brand shifts right as portrait arrives (scrollRatio 0.32 → 0.42,
  // synced to finish exactly when FloatingPortrait's flight completes)
  const brandShift = Math.round(
    Math.max(0, Math.min(1, (scrollRatio - 0.32) / 0.10)) * shiftMax
  );

  return (
    <>
      <header className={'navbar' + (scrolled ? ' is-scrolled' : '')}>
        <div className="navbar__inner">

          {/* Brand — shifts right to make gap for docking avatar */}
          <a
            href="#home"
            className="brand"
            ref={brandRef}
            style={{ transform: `translateX(${brandShift}px)`, transition: 'none' }}
            onClick={e => { e.preventDefault(); handleNavigate('home'); }}
          >
            <span className="brand__arrow brand__arrow--l">&lt;</span>
            <span className="brand__name">{profile.name}</span>
            <span className="brand__arrow brand__arrow--r">/&gt;</span>
          </a>

          {/* Desktop nav links */}
          <nav className="nav-links" aria-label="Primary">
            {navLinks.map(link => {
              const Icon = ICONS[link.id];
              return (
                <a
                  key={link.id}
                  href={`#${link.id}`}
                  className={'nav-link' + (activeId === link.id ? ' is-active' : '')}
                  onClick={e => { e.preventDefault(); handleNavigate(link.id); }}
                >
                  <span className="tag">&lt;</span>
                  <Icon style={{ verticalAlign: '-2px', margin: '0 3px' }} />
                  {link.label}
                  <span className="tag">/&gt;</span>
                </a>
              );
            })}
          </nav>

          {/* Desktop avatar — visible after morph completes */}
          {/* <div className="nav-extra">
            <div className="nav-divider" />
            <div
              className="avatar-chip"
              style={{
                opacity: scrollRatio > 0.4 ? 1 : 0,
                pointerEvents: scrollRatio > 0.4 ? 'auto' : 'none',
                transition: 'opacity 0.2s ease',
              }}
            >
              <img src={profile.photo} alt="" />
            </div>
          </div> */}

          {/* Hamburger */}
          <button
            type="button"
            className={'nav-toggle' + (open ? ' is-open' : '')}
            ref={toggleRef}
            onClick={() => setOpen(v => !v)}
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            <span /><span /><span />
          </button>
        </div>
      </header>

      {/* Backdrop overlay */}
      <div
        className={'mobile-menu-overlay' + (open ? ' is-open' : '')}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      {/* Right-slide drawer */}
      <aside className={'mobile-menu' + (open ? ' is-open' : '')} aria-label="Navigation">
        <div className="mobile-menu__header">
          <span className="mobile-menu__title">NAVIGATION</span>
          <button type="button" className="mobile-menu__close" onClick={() => setOpen(false)} aria-label="Close">✕</button>
        </div>
        <div className="mobile-menu__inner">
          {navLinks.map(link => {
            const Icon = ICONS[link.id];
            return (
              <a
                key={link.id}
                href={`#${link.id}`}
                className={'nav-link' + (activeId === link.id ? ' is-active' : '')}
                onClick={e => { e.preventDefault(); handleNavigate(link.id); }}
              >
                <span className="tag">&lt;</span>
                <Icon style={{ verticalAlign: '-2px', margin: '0 5px' }} />
                {link.label}
                <span className="tag">/&gt;</span>
              </a>
            );
          })}
        </div>
        <div className="mobile-menu__footer">
          <button
            type="button"
            className={'mobile-menu__logout' + (loggingOut ? ' mobile-menu__logout--active' : '')}
            onClick={logout}
          >
            <svg viewBox="0 0 24 24" className="mobile-menu__logout-icon" fill="none">
              <path d="M12 3v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path
                d="M7 5.5a8 8 0 1 0 10 0"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
            {loggingOut ? 'Logging out…' : 'Log out'}
          </button>
        </div>
      </aside>

      {loggingOut && <div className="logout-flash" aria-hidden="true" />}
    </>
  );
}
