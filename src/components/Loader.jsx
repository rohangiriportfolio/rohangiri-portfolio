import { useEffect, useMemo, useRef, useState } from 'react';
import { profile } from '../data/content';

const PASSWORD = 'Rohan_Giri';
const SESSION_KEY = 'rg_portfolio_session';

const BOOT_LINES = [
  'mounting filesystem',
  'linking modules: react · node · mongodb',
  'compiling styles & assets',
  'calibrating render pipeline',
  'establishing secure session',
  'ready',
];

const CHECK_SESSION_MS = 1000; // how long the "verifying session" beat plays
const UNLOCK_MS = 550;
const CHAR_STEP = 16;
const CHECK_GAP = 110;
const LINE_GAP = 90;
const BOOT_MIN_VISIBLE = 3600;
const LEAVE_MS = 900;

const RING_R = 58;
const RING_C = 2 * Math.PI * RING_R;

export default function Loader() {
  // stages: checking-session -> lock -> unlocking -> boot -> leaving -> (hidden)
  const [stage, setStage] = useState(() =>
    typeof window !== 'undefined' && localStorage.getItem(SESSION_KEY) === 'true'
      ? 'checking-session'
      : 'lock'
  );
  const [hidden, setHidden] = useState(false);
  const [percent, setPercent] = useState(0);
  const rafRef = useRef(null);

  useEffect(() => {
    document.documentElement.classList.add('is-loading');
  }, []);

  // checking-session -> unlocking (auto, no password needed for a returning visitor)
  useEffect(() => {
    if (stage !== 'checking-session') return;
    const t = setTimeout(() => setStage('unlocking'), CHECK_SESSION_MS);
    return () => clearTimeout(t);
  }, [stage]);

  // unlocking -> boot
  useEffect(() => {
    if (stage !== 'unlocking') return;
    const t = setTimeout(() => setStage('boot'), UNLOCK_MS);
    return () => clearTimeout(t);
  }, [stage]);

  // boot: percent counter + wait for real page load, then -> leaving -> hidden
  useEffect(() => {
    if (stage !== 'boot') return;
    const start = performance.now();
    const duration = BOOT_MIN_VISIBLE - 250;

    const tick = now => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setPercent(Math.round(eased * 100));
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    const bootStart = Date.now();
    const finish = () => {
      const wait = Math.max(0, BOOT_MIN_VISIBLE - (Date.now() - bootStart));
      setTimeout(() => {
        setPercent(100);
        setTimeout(() => {
          setStage('leaving');
          document.documentElement.classList.remove('is-loading');
          setTimeout(() => setHidden(true), LEAVE_MS);
        }, 200);
      }, wait);
    };

    if (document.readyState === 'complete') finish();
    else window.addEventListener('load', finish);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('load', finish);
    };
  }, [stage]);

  const lineTimings = useMemo(() => {
    let acc = 0;
    return BOOT_LINES.map(text => {
      const startDelay = acc;
      const checkDelay = startDelay + text.length * CHAR_STEP + CHECK_GAP;
      acc = checkDelay + LINE_GAP;
      return { text, startDelay, checkDelay };
    });
  }, []);

  if (hidden) return null;

  const hex = Math.round(percent * 2.55).toString(16).toUpperCase().padStart(2, '0');
  const ringOffset = RING_C * (1 - percent / 100);

  const showLockUI = stage === 'lock' || stage === 'checking-session' || stage === 'unlocking';

  return (
    <div className={'loader loader--' + stage} role="status" aria-label="Loading">
      <div className="loader__panel loader__panel--top" />
      <div className="loader__panel loader__panel--bottom" />

      <ParticleField />

      {showLockUI && (
        <LockScreen
          checking={stage === 'checking-session'}
          unlocking={stage === 'unlocking'}
          onUnlock={() => {
            localStorage.setItem(SESSION_KEY, 'true');
            setStage('unlocking');
          }}
        />
      )}

      {(stage === 'boot' || stage === 'leaving') && (
        <div className="loader__frame">
          <span className="loader__corner loader__corner--tl" />
          <span className="loader__corner loader__corner--tr" />
          <span className="loader__corner loader__corner--bl" />
          <span className="loader__corner loader__corner--br" />
          <div className="loader__scan" />
          <BitStream side="left" />
          <BitStream side="right" />

          <div className="loader__stage">
            <div className="loader__orbit">
              <svg className="loader__ringmeter" viewBox="0 0 128 128">
                <circle className="loader__ringmeter-track" cx="64" cy="64" r={RING_R} />
                <circle
                  className="loader__ringmeter-fill"
                  cx="64"
                  cy="64"
                  r={RING_R}
                  strokeDasharray={RING_C}
                  strokeDashoffset={ringOffset}
                />
              </svg>

              <div className="loader__radar" />
              <div className="loader__orbit-ring loader__orbit-ring--outer">
                <span className="loader__electron loader__electron--a" />
              </div>
              <div className="loader__orbit-ring loader__orbit-ring--inner">
                <span className="loader__electron loader__electron--b" />
              </div>

              <div className="loader__mark">
                <span className="loader__mark-bracket">&lt;</span>
                <span className="loader__mark-text">RG</span>
                <span className="loader__mark-bracket">/&gt;</span>
              </div>
            </div>

            <div className="loader__terminal">
              <div className="loader__term-bar">
                <span className="loader__term-dot" />
                <span className="loader__term-dot" />
                <span className="loader__term-dot" />
                <span className="loader__term-path">boot.sh</span>
                <span className="loader__term-stat">
                  {String(percent).padStart(2, '0')}% · 0x{hex}
                </span>
              </div>
              <div className="loader__term-loadbar">
                <div className="loader__term-loadbar-fill" style={{ width: `${percent}%` }} />
              </div>
              <div className="loader__term-body" aria-hidden="true">
                {lineTimings.map(({ text, startDelay, checkDelay }) => (
                  <BootLine key={text} text={text} startDelay={startDelay} checkDelay={checkDelay} />
                ))}
                <span
                  className="loader__term-cursor"
                  style={{ animationDelay: `${lineTimings[lineTimings.length - 1].checkDelay}ms` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function LockScreen({ checking, unlocking, onUnlock }) {
  const [value, setValue] = useState('');
  const [error, setError] = useState(false);
  const [reveal, setReveal] = useState(false);
  const inputRef = useRef(null);

  const now = useMemo(() => new Date(), []);
  const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  const date = now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });

  useEffect(() => {
    if (!checking) inputRef.current?.focus();
  }, [checking]);

  const submit = () => {
    if (value === PASSWORD) {
      setError(false);
      onUnlock();
    } else {
      setError(true);
      setValue('');
      setTimeout(() => setError(false), 550);
      inputRef.current?.focus();
    }
  };

  return (
    <div className={'loader__lock' + (unlocking ? ' loader__lock--unlocking' : '')}>
      <div className="loader__lock-clock">
        <span className="loader__lock-time">{time}</span>
        <span className="loader__lock-date">{date}</span>
      </div>

      <div className="loader__lock-user">
        <div className="loader__lock-avatar">
          <img src={profile.photo} alt={profile.name} />
        </div>
        <div className="loader__lock-name">{profile.name}</div>
        <div className="loader__lock-role">Technical Enthusiast &amp; Developer</div>

        {checking ? (
          <div className="loader__lock-checking">
            <span className="loader__lock-spinner" />
            <span>Verifying saved session…</span>
          </div>
        ) : (
          <>
            <form
              className={'loader__lock-field' + (error ? ' loader__lock-field--error' : '')}
              onSubmit={e => {
                e.preventDefault();
                submit();
              }}
            >
              <svg className="loader__lock-icon" viewBox="0 0 24 24" fill="none">
                <rect x="5" y="10" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.6" />
                <path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="1.6" />
              </svg>

              <input
                ref={inputRef}
                type={reveal ? 'text' : 'password'}
                className="loader__lock-input"
                value={value}
                onChange={e => setValue(e.target.value)}
                placeholder="Enter password"
                autoComplete="off"
                spellCheck={false}
              />

              <button
                type="button"
                className="loader__lock-eye"
                onClick={() => setReveal(r => !r)}
                aria-label={reveal ? 'Hide password' : 'Show password'}
                tabIndex={-1}
              >
                {reveal ? (
                  <svg viewBox="0 0 24 24" fill="none">
                    <path
                      d="M3 3l18 18M10.6 10.6a2.5 2.5 0 0 0 3.5 3.5M7.4 7.5C5.3 8.8 3.7 10.6 3 12c1.6 3.2 5.1 6 9 6 1.5 0 2.9-.4 4.1-1.1M12 6c4 0 7.5 2.8 9 6a13.4 13.4 0 0 1-2 2.9"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none">
                    <path
                      d="M3 12c1.6-3.2 5.1-6 9-6s7.4 2.8 9 6c-1.6 3.2-5.1 6-9 6s-7.4-2.8-9-6z"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinejoin="round"
                    />
                    <circle cx="12" cy="12" r="2.6" stroke="currentColor" strokeWidth="1.6" />
                  </svg>
                )}
              </button>

              <button type="submit" className="loader__lock-arrow" aria-label="Unlock">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </form>

            <div className="loader__lock-hint">
              {error ? (
                <span className="loader__lock-error">Incorrect password — try the hint below</span>
              ) : (
                <>Password hint: <strong>{PASSWORD}</strong></>
              )}
            </div>
          </>
        )}
      </div>

      <div className="loader__lock-tray">
        <svg viewBox="0 0 24 24" className="loader__tray-icon">
          <path
            d="M2 8.5a15 15 0 0 1 20 0M5.5 12a10 10 0 0 1 13 0M9 15.5a5 5 0 0 1 6 0"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <circle cx="12" cy="19" r="1.1" fill="currentColor" />
        </svg>
        <svg viewBox="0 0 24 24" className="loader__tray-icon">
          <rect x="2" y="7" width="17" height="10" rx="2" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <rect x="4" y="9" width="10" height="6" fill="currentColor" />
          <path d="M21 10v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
}

function BootLine({ text, startDelay, checkDelay }) {
  return (
    <div className="loader__log-line" style={{ animationDelay: `${startDelay}ms` }}>
      <span className="loader__log-arrow">›</span>
      <span className="loader__log-text">
        {text.split('').map((ch, i) => (
          <span
            key={i}
            className="loader__log-char"
            style={{ animationDelay: `${startDelay + i * CHAR_STEP}ms` }}
          >
            {ch}
          </span>
        ))}
      </span>
      <span className="loader__log-check" style={{ animationDelay: `${checkDelay}ms` }}>
        ✓
      </span>
    </div>
  );
}

function BitStream({ side }) {
  const bits = useMemo(() => Array.from({ length: 24 }, () => (Math.random() > 0.5 ? '1' : '0')), []);
  return (
    <div className={'loader__bitstream loader__bitstream--' + side} aria-hidden="true">
      <div className="loader__bitstream-track">
        {[...bits, ...bits].map((b, i) => (
          <span key={i} className="loader__bit">{b}</span>
        ))}
      </div>
    </div>
  );
}

function ParticleField() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ctx = canvas.getContext('2d');
    let width, height, particles, rafId;
    const COLORS = ['rgba(96, 165, 250,', 'rgba(78, 227, 184,'];

    const resize = () => {
      width = canvas.width = window.innerWidth * window.devicePixelRatio;
      height = canvas.height = window.innerHeight * window.devicePixelRatio;
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
    };

    const init = () => {
      const count = Math.min(70, Math.floor((window.innerWidth * window.innerHeight) / 18000));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35 * window.devicePixelRatio,
        vy: (Math.random() - 0.5) * 0.35 * window.devicePixelRatio,
        c: COLORS[Math.floor(Math.random() * COLORS.length)],
      }));
    };

    const step = () => {
      ctx.clearRect(0, 0, width, height);
      const linkDist = 130 * window.devicePixelRatio;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const dx = p.x - q.x;
          const dy = p.y - q.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < linkDist) {
            ctx.strokeStyle = p.c + (0.16 * (1 - dist / linkDist)) + ')';
            ctx.lineWidth = 1 * window.devicePixelRatio;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
        }

        ctx.fillStyle = p.c + '0.85)';
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.6 * window.devicePixelRatio, 0, Math.PI * 2);
        ctx.fill();
      }
      rafId = requestAnimationFrame(step);
    };

    resize();
    init();
    window.addEventListener('resize', resize);

    if (!reduceMotion) {
      rafId = requestAnimationFrame(step);
    } else {
      step();
    }

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="loader__network" aria-hidden="true" />;
}
