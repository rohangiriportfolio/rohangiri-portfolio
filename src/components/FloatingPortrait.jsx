import { useEffect, useState } from 'react';
import { profile } from '../data/content';

function lerp(a, b, t) { return a + (b - a) * t; }
function smoothstep(t)  { return t * t * (3 - 2 * t); }

const P1_START = 0.05;  // portrait starts fading, floating starts appearing
const P1_END   = 0.15;  // portrait gone, floating fully opaque (at same position)
const P2_START = 0.15;  // floating starts moving toward navbar
const P2_END   = 0.42;  // floating arrives at navbar (shorter scroll = faster dock)

const AVATAR_SIZE     = 38;
const BRAND_SHIFT_MAX = 48;  // matches Navbar brandShift max
const AVATAR_GAP      = 10;  // gap between avatar right edge and brand "<"

export default function FloatingPortrait({ scrollRatio, brandShiftMax = BRAND_SHIFT_MAX }) {
  const [startPos, setStartPos] = useState(null);
  const [endPos,   setEndPos]   = useState(null);

  useEffect(() => {
    function measure() {
      const portrait = document.querySelector('.portrait');
      const navbar   = document.querySelector('.navbar');
      if (!portrait || !navbar) return;

      const pRect = portrait.getBoundingClientRect();
      setStartPos({
        left: pRect.left  + window.scrollX,
        top:  pRect.top   + window.scrollY,
        size: pRect.width,
      });

      // Navbar left padding = 28px always.
      // After brand shifts right by BRAND_SHIFT_MAX, brand's "<" is at:
      //   navbarLeft + BRAND_SHIFT_MAX
      // Avatar should sit just left of that with a gap:
      //   avatarLeft = navbarLeft + BRAND_SHIFT_MAX - AVATAR_SIZE - AVATAR_GAP
      const navRect = navbar.getBoundingClientRect();
      const navLeft = navRect.left + 28; // navbar left padding
      let dockLeft = navLeft + brandShiftMax - AVATAR_SIZE - AVATAR_GAP;

      // Safety: never let the dock position get closer than a safe gap to
      // the hamburger toggle (only present on mobile) — guarantees no
      // overlap regardless of screen width or brand font rendering.
      const toggle = document.querySelector('.nav-toggle');
      if (toggle) {
        const tRect = toggle.getBoundingClientRect();
        if (tRect.width > 0) {
          dockLeft = Math.min(dockLeft, tRect.left - AVATAR_SIZE - 14);
        }
      }

      setEndPos({
        left: dockLeft,
        top:  (navRect.height - AVATAR_SIZE) / 2,
        size: AVATAR_SIZE,
      });
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
  }, [brandShiftMax]);

  if (!startPos || !endPos) return null;

  // Phase 1: opacity cross-fade (portrait fades out, floating fades in)
  const crossT  = Math.max(0, Math.min(1, (scrollRatio - P1_START) / (P1_END - P1_START)));
  const opacity = crossT;
  if (opacity <= 0) return null;

  // Phase 2: movement from portrait position → navbar
  const moveRaw = Math.max(0, Math.min(1, (scrollRatio - P2_START) / (P2_END - P2_START)));
  const moveT   = smoothstep(moveRaw);

  const scrollY = window.scrollY || 0;
  const scrollX = window.scrollX || 0;
  const vpTop  = startPos.top  - scrollY;
  const vpLeft = startPos.left - scrollX;

  const rawLeft = lerp(vpLeft, endPos.left, moveT);
  const rawTop  = lerp(vpTop,  endPos.top,  moveT);
  const size    = lerp(startPos.size, endPos.size, moveT);
  const border  = lerp(4, 2, moveT);
  const glow    = lerp(24, 10, moveT);

  // Safety clamp: keeps the same flight animation on every screen size, but
  // guarantees the avatar can never be carried past the viewport edges —
  // e.g. if the mobile address bar hides/shows mid-scroll and momentarily
  // makes the measured start position stale, this stops it flying off.
  const margin = 4;
  const vw = window.innerWidth  || 0;
  const vh = window.innerHeight || 0;
  const left = Math.min(Math.max(rawLeft, margin), Math.max(margin, vw - size - margin));
  const top  = Math.min(Math.max(rawTop,  margin), Math.max(margin, vh - size - margin));

  return (
    <div
      className="floating-portrait"
      style={{
        left:        `${left}px`,
        top:         `${top}px`,
        width:       `${size}px`,
        height:      `${size}px`,
        opacity,
        borderWidth: `${border}px`,
        boxShadow:   `0 0 ${glow}px rgba(59,130,246,0.55)`,
      }}
    >
      <img src={profile.photo} alt="" />
    </div>
  );
}
