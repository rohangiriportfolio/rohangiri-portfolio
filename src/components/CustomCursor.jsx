import { useEffect, useRef } from 'react';

// Custom pointer: a classic isosceles-triangle arrow cursor (like a normal
// OS mouse pointer), filled with the site's blue/green accent shades and
// finished with a crisp thin border. It leaves a short trail of fading
// triangles, each randomly tinted somewhere between blue and green.
//
// Rendered as TWO canvases:
//  - a full-screen one for the trail (cheap: no filter, no shadow)
//  - a small one, just big enough for the pointer shape, that is moved
//    around with a CSS transform instead of being redrawn on a full-screen
//    canvas. Only this small canvas gets the CSS drop-shadow filter, so the
//    browser only has to blur a ~70px box each frame instead of the entire
//    viewport — putting a drop-shadow on the full-screen canvas made the
//    whole cursor visibly lag, since the shadow had to be recomputed across
//    the full screen on every animation frame.
//
// Does NOT rotate to face the direction of travel — it always sits at the
// same fixed tilt, like a real mouse pointer.

const CURSOR_BOX = 72; // CSS px size of the small cursor canvas (must fit the pointer shape at its largest)
const CURSOR_ANCHOR_X = 26; // where the apex/hotspot sits inside that box
const CURSOR_ANCHOR_Y = 14;

const TRAIL_MS = 500; // how long a trail point stays visible
const MAX_POINTS = 40; // safety cap on the trail buffer
const BLUE = [96, 165, 250]; // --blue-400
const GREEN = [78, 227, 184]; // --green-400
const BORDER_COLOR = 'rgb(255, 255, 255)'; // crisp thin border
const INTERACTIVE_SELECTOR =
  'a, button, input, textarea, select, [role="button"], .nav-link, .term-input, .mobile-menu__logout';

// Fixed tilt, in radians, applied to every triangle drawn (trail + live
// cursor alike). Matches the diagonal lean of a standard OS arrow pointer.
// This NEVER changes with mouse movement — that's the point.
const POINTER_TILT = -0.4;

// Traces a plain isosceles triangle with softly rounded corners: apex at
// the origin (the cursor's hotspot sits exactly on the actual mouse
// position), base below it. The two slanted sides are equal length by
// construction — a real arrow-cursor silhouette, just with the corners
// eased instead of razor-sharp.
function traceTriangle(ctx, size, roundness = 0.36) {
  const halfBase = 0.42 * size;
  const baseY = 1.15 * size;
  const verts = [
    [0, 0], // apex / tip
    [-halfBase, baseY], // base-left
    [halfBase, baseY], // base-right
  ];
  const n = verts.length;
  ctx.beginPath();
  for (let i = 0; i < n; i++) {
    const curr = verts[i];
    const prev = verts[(i - 1 + n) % n];
    const next = verts[(i + 1) % n];
    const pIn = [
      curr[0] + (prev[0] - curr[0]) * roundness,
      curr[1] + (prev[1] - curr[1]) * roundness,
    ];
    const pOut = [
      curr[0] + (next[0] - curr[0]) * roundness,
      curr[1] + (next[1] - curr[1]) * roundness,
    ];
    if (i === 0) ctx.moveTo(pIn[0], pIn[1]);
    else ctx.lineTo(pIn[0], pIn[1]);
    ctx.quadraticCurveTo(curr[0], curr[1], pOut[0], pOut[1]);
  }
  ctx.closePath();
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function lerpColor(c1, c2, t) {
  return [
    Math.round(lerp(c1[0], c2[0], t)),
    Math.round(lerp(c1[1], c2[1], t)),
    Math.round(lerp(c1[2], c2[2], t)),
  ];
}

// Blue-to-green gradient running from the tip down to the base, in the
// shape's own local (un-rotated) coordinate space.
function makeGradient(ctx, size) {
  const grad = ctx.createLinearGradient(0, 0, 0, 1.15 * size);
  grad.addColorStop(0, `rgb(${BLUE.join(',')})`);
  grad.addColorStop(1, `rgb(${GREEN.join(',')})`);
  return grad;
}

export default function CustomCursor() {
  const trailCanvasRef = useRef(null);
  const cursorCanvasRef = useRef(null);

  useEffect(() => {
    const trailCanvas = trailCanvasRef.current;
    const cursorCanvas = cursorCanvasRef.current;
    if (!trailCanvas || !cursorCanvas) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const noHover = window.matchMedia('(hover: none)').matches;
    if (reduceMotion || noHover) return; // touch devices keep their native pointer

    document.documentElement.classList.add('custom-cursor-active');

    const trailCtx = trailCanvas.getContext('2d');
    const cursorCtx = cursorCanvas.getContext('2d');
    let trailWidth, trailHeight, dpr;
    let rafId;

    const points = []; // { x, y, t, colorT } in CSS px
    let lastX = window.innerWidth / 2;
    let lastY = window.innerHeight / 2;
    let hasMoved = false;
    let hovering = false;
    let visible = true;

    const resize = () => {
      // Capped at 2x — on 3x/4x phone-class displays an uncapped DPR
      // quadruples+ the canvas's pixel area, and redrawing a full-screen
      // canvas every animation frame at that resolution is what was
      // making the cursor visibly lag behind the real mouse position.
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      trailWidth = trailCanvas.width = window.innerWidth * dpr;
      trailHeight = trailCanvas.height = window.innerHeight * dpr;
      trailCanvas.style.width = window.innerWidth + 'px';
      trailCanvas.style.height = window.innerHeight + 'px';

      // The small cursor canvas is a fixed, tiny size — independent of the
      // viewport — so its resolution (and the filter cost that scales with
      // it) never grows with screen size.
      cursorCanvas.width = CURSOR_BOX * dpr;
      cursorCanvas.height = CURSOR_BOX * dpr;
      cursorCanvas.style.width = CURSOR_BOX + 'px';
      cursorCanvas.style.height = CURSOR_BOX + 'px';
    };

    const onMove = e => {
      lastX = e.clientX;
      lastY = e.clientY;
      hasMoved = true;
      visible = true;
      points.push({ x: e.clientX, y: e.clientY, t: performance.now(), colorT: Math.random() });
      if (points.length > MAX_POINTS) points.shift();
    };

    const onLeave = () => { visible = false; };
    const onEnter = () => { visible = true; };

    const onOver = e => {
      if (e.target.closest && e.target.closest(INTERACTIVE_SELECTOR)) hovering = true;
    };
    const onOut = e => {
      if (e.target.closest && e.target.closest(INTERACTIVE_SELECTOR)) hovering = false;
    };

    const step = () => {
      trailCtx.clearRect(0, 0, trailWidth, trailHeight);
      cursorCtx.clearRect(0, 0, cursorCanvas.width, cursorCanvas.height);

      if (hasMoved && visible) {
        const now = performance.now();
        while (points.length && now - points[0].t > TRAIL_MS) points.shift();

        const n = points.length;
        for (let i = 0; i < n; i++) {
          const p = points[i];
          const age = (now - p.t) / TRAIL_MS; // 0 fresh -> 1 old
          if (age >= 1) continue;
          const progress = i / Math.max(1, n - 1); // 0 oldest -> 1 newest, used for size only
          const [r, g, b] = lerpColor(GREEN, BLUE, p.colorT); // random blue/green blend per point
          const alpha = (1 - age) * 0.5;
          const size = (9 + progress * 5) * (1 - age * 0.35) * dpr;

          trailCtx.save();
          trailCtx.translate(p.x * dpr, p.y * dpr);
          trailCtx.rotate(POINTER_TILT); // fixed tilt — never follows movement direction
          trailCtx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
          traceTriangle(trailCtx, size);
          trailCtx.fill();
          trailCtx.restore();
        }

        // Position the small cursor canvas over the real mouse position via
        // a CSS transform (GPU-composited, no layout/paint of anything
        // else) so the pointer shape itself can stay a tiny, cheap-to-blur
        // canvas instead of one drawn onto the full-screen surface.
        cursorCanvas.style.transform =
          `translate(${lastX - CURSOR_ANCHOR_X}px, ${lastY - CURSOR_ANCHOR_Y}px)`;

        // Live cursor shape: solid blue-to-green gradient fill plus a crisp
        // thin border, slightly bigger on hover. Drawn at a fixed anchor
        // point within the small canvas rather than at the real screen
        // coordinates.
        const mainSize = (hovering ? 20 : 16) * dpr;
        cursorCtx.save();
        cursorCtx.translate(CURSOR_ANCHOR_X * dpr, CURSOR_ANCHOR_Y * dpr);
        cursorCtx.rotate(POINTER_TILT); // fixed tilt — never follows movement direction

        traceTriangle(cursorCtx, mainSize);
        cursorCtx.fillStyle = makeGradient(cursorCtx, mainSize);
        cursorCtx.fill();

        // Crisp thin border. Canvas's current path is NOT reset by
        // save()/restore(), so it must be re-traced here. A thin dark
        // under-stroke first keeps the edge readable on light backgrounds;
        // the bright stroke on top keeps it readable on dark ones.
        traceTriangle(cursorCtx, mainSize);
        cursorCtx.lineWidth = 0.5 * dpr;
        cursorCtx.strokeStyle = 'rgb(255, 255, 255)';
        cursorCtx.stroke();
        // cursorCtx.lineWidth = 1 * dpr;
        // cursorCtx.strokeStyle = BORDER_COLOR;
        cursorCtx.stroke();
        cursorCtx.restore();
      }

      rafId = requestAnimationFrame(step);
    };

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('mouseleave', onLeave);
    document.addEventListener('mouseenter', onEnter);
    document.addEventListener('pointerover', onOver, { passive: true });
    document.addEventListener('pointerout', onOut, { passive: true });
    rafId = requestAnimationFrame(step);

    return () => {
      document.documentElement.classList.remove('custom-cursor-active');
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('mouseenter', onEnter);
      document.removeEventListener('pointerover', onOver);
      document.removeEventListener('pointerout', onOut);
    };
  }, []);

  return (
    <>
      <canvas ref={trailCanvasRef} className="custom-cursor-trail" aria-hidden="true" />
      <canvas ref={cursorCanvasRef} className="custom-cursor-dot" aria-hidden="true" />
    </>
  );
}
