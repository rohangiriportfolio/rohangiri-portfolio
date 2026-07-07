import { useEffect, useRef, useState } from 'react';
import { profile } from '../data/content';
import { useTypewriter } from '../hooks/useTypewriter';
import {
  IconGithub, IconLinkedin, IconTwitter,
  IconInstagram, IconDownload, IconPin,
} from './icons/Icons';

// ── Hexagon paddings: line1 & line3 are narrow, line2 is full-width ──
const HEX_PAD = ['20%', '0%', '20%'];

function HexBioSlide({ lines, idPrefix }) {
  const idB = `hgB-${idPrefix}`;
  const idF = `hgF-${idPrefix}`;
  return (
    <div className="bio-hex-slide">
      {/* Wide flat-sided hexagon SVG border */}
      <svg className="bio-hex-svg" viewBox="0 0 300 160" fill="none" preserveAspectRatio="none">
        <defs>
          <linearGradient id={idB} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%"   stopColor="#60a5fa" stopOpacity="0.6" className="bio-hex-stop-a" />
            <stop offset="100%" stopColor="#4ee3b8" stopOpacity="0.5" className="bio-hex-stop-b" />
          </linearGradient>
          <linearGradient id={idF} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%"   stopColor="#3b82f6" stopOpacity="0.09" />
            <stop offset="100%" stopColor="#14d39a" stopOpacity="0.06" />
          </linearGradient>
        </defs>
        <polygon points="0,80 44,0 256,0 300,80 256,160 44,160" fill={`url(#${idF})`} />
        <polygon className="bio-hex-border" points="0,80 44,0 256,0 300,80 256,160 44,160" stroke={`url(#${idB})`} strokeWidth="1.5" />
      </svg>

      {/* 3 lines: narrow → wide → narrow */}
      <div className="bio-hex-lines">
        {lines.map((line, i) => (
          <p
            key={i}
            className={'bio-hex-line ' + (i === 1 ? 'bio-hex-line--wide' : 'bio-hex-line--narrow')}
            style={{ paddingInline: HEX_PAD[i] }}
          >
            {line}
          </p>
        ))}
      </div>
    </div>
  );
}

function BioSlider({ slides, wrapClassName, variant }) {
  const [slide, setSlide]         = useState(0);
  const [direction, setDirection] = useState('next');
  const timerRef = useRef(null);
  const total    = slides.length;

  function resetTimer() {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setDirection('next');
      setSlide(s => (s + 1) % total);
    }, 7000);
  }
  function goTo(next, dir) {
    setDirection(dir);
    setSlide(((next % total) + total) % total);
    resetTimer();
  }
  useEffect(() => { resetTimer(); return () => clearInterval(timerRef.current); }, []);

  return (
    <div className={wrapClassName}>
      <div className="bio-slider">
        <button type="button" className="bio-arrow" onClick={() => goTo(slide - 1, 'prev')} aria-label="Previous">&lt;</button>

        <div className="bio-slider__viewport">
          {slides.map((lines, i) => (
            <div
              key={i}
              className={
                'bio-slide' +
                (i === slide ? ' is-active' : '') +
                (i !== slide && direction === 'next' ? ' is-leaving' : '')
              }
            >
              <HexBioSlide lines={lines} idPrefix={`${variant}-${i}`} />
            </div>
          ))}
        </div>

        <button type="button" className="bio-arrow" onClick={() => goTo(slide + 1, 'next')} aria-label="Next">&gt;</button>
      </div>

      <div className="bio-dots">
        {slides.map((_, i) => (
          <button key={i} type="button" className={i === slide ? 'is-active' : ''} onClick={() => goTo(i, i > slide ? 'next' : 'prev')} aria-label={`Slide ${i + 1}`} />
        ))}
      </div>
    </div>
  );
}

export default function Home({ scrollRatio = 0 }) {
  const typed = useTypewriter(profile.typingWords);

  // Portrait fades 1→0 from scrollRatio 0.05→0.15 (synced with FloatingPortrait)
  const fadeT          = Math.max(0, Math.min(1, (scrollRatio - 0.05) / 0.10));
  const portraitOpacity = 1 - fadeT;
  const portraitScale   = 1 - fadeT * 0.18;

  return (
    <section id="home" className="section hero">
      <div className="section__inner hero__grid">

        {/* Portrait */}
        <div className="hero__portrait">
          <div
            className="portrait"
            style={{ opacity: portraitOpacity, transform: `scale(${portraitScale})`, transition: 'none' }}
          >
            <div className="portrait__glow" />
            <div className="portrait__ring"><div className="portrait__ring-inner" /></div>
            <div className="portrait__photo">
              <img src={profile.photo} alt={profile.name} />
            </div>
            <span className="portrait__dot portrait__dot--1" />
            <span className="portrait__dot portrait__dot--2" />
          </div>
        </div>

        {/* Content */}
        <div className="hero__content">
          <p className="hero__greeting">
            <span className="wave" role="img" aria-label="waving hand">👋</span>
            Hello / Bonjour / Hola <span className="muted">Coders</span>
          </p>

          <h1 className="hero__headline">
            <span className="pre">I'm</span>
            <span className="typewriter">
              {typed}<span className="typewriter__cursor" aria-hidden />
            </span>
          </h1>

          <span className="location-chip">
            <IconPin />{profile.location}
          </span>

          {/* Hexagon bio slider: 3 slides on laptop, 5 on mobile */}
          <BioSlider slides={profile.bioSlidesDesktop} wrapClassName="bio-slider-wrap bio-slider-wrap--desktop-only" variant="desktop" />
          <BioSlider slides={profile.bioSlidesMobile}  wrapClassName="bio-slider-wrap bio-slider-wrap--mobile-only" variant="mobile" />

          <div className="hero__actions">
            <div className="social-row">
              {[
                { href: profile.socials.github,   Icon: IconGithub,    label: 'GitHub'    },
                { href: profile.socials.linkedin,  Icon: IconLinkedin,  label: 'LinkedIn'  },
                { href: profile.socials.twitter,   Icon: IconTwitter,   label: 'Twitter'   },
                { href: profile.socials.instagram, Icon: IconInstagram, label: 'Instagram' },
              ].map(({ href, Icon, label }) => (
                <a key={label} className="social-icon" href={href} target="_blank" rel="noreferrer" aria-label={label}>
                  <Icon />
                </a>
              ))}
            </div>
            <a className="cv-button" href={profile.cvLink} target="_blank" rel="noreferrer">
              <IconDownload /> Get CV
            </a>
          </div>
        </div>
      </div>

      <div className="scroll-cue">
        <span className="scroll-cue__mouse" />
        SCROLL
      </div>
    </section>
  );
}
