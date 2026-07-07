import { projects } from '../data/content';
import Reveal from './Reveal';
import { IconGithub, IconExternal } from './icons/Icons';

function ProjectCard({ project, mini = false }) {
  return (
    <article className={`project-card${mini ? ' project-card--mini' : ''}`}>
      <div className="project-card__bar">
        <span /><span /><span />
        <small>{project.id}.jsx</small>
      </div>
      <div className="project-card__body">
        <h3 className="project-card__title">{project.title}</h3>
        <p className="project-card__subtitle">{project.subtitle}</p>
        <p className="project-card__desc">{project.description}</p>
        <div className="tech-tags">
          {project.stack.map(t => <span key={t}>{t}</span>)}
        </div>
        <div className="project-card__links">
          <a className="project-link" href={project.codeLink} target="_blank" rel="noreferrer">
            <IconGithub width={15} height={15} /> Code
          </a>
          <a className="project-link" href={project.liveLink} target="_blank" rel="noreferrer">
            <IconExternal /> Live
          </a>
        </div>
      </div>
    </article>
  );
}

/* ── Desktop: 3-column infinite scroll (left+right up, middle down) ── */
const makeTrack = arr => [...arr, ...arr];
const DESKTOP_COLS = [
  { cards: makeTrack([projects[0], projects[2], projects[4]]), dir: 'up',   duration: '22s' },
  { cards: makeTrack([projects[1], projects[3], projects[0]]), dir: 'down', duration: '28s' },
  { cards: makeTrack([projects[4], projects[3], projects[2]]), dir: 'up',   duration: '19s' },
];

/* ── Mobile: exactly 3 projects, duplicated once = 6 cards ──────────
   The -50% animation loops through precisely 3 cards then restarts
   seamlessly. No repeated groups — just 3 unique cards cycling.      */
const MOBILE_3 = [projects[0], projects[2], projects[4]]; // Annatra, Weather, SentimentScope
const MOBILE_TRACK = [...MOBILE_3, ...MOBILE_3];           // 6 cards → loop at -50%

export default function Creation() {
  return (
    <section id="creation" className="section">
      <div className="section__inner">
        <Reveal className="section__head">
          <span className="eyebrow">&lt;Creation/&gt;</span>
          <h2 className="section__title">
            Things I've <span className="accent">built</span>
          </h2>
          <p className="section__lede">
            Five projects spanning full-stack web apps, mobile AI and data-driven tools —
            hover / tap to pause.
          </p>
        </Reveal>

        {/* Desktop: 3-column */}
        <div className="creation-scroll-outer creation-desktop-only">
          <div className="creation-scroll-grid">
            {DESKTOP_COLS.map((col, ci) => (
              <div key={ci} className={`creation-col creation-col--${col.dir}`}>
                <div className="col-track" style={{ animationDuration: col.duration }}>
                  {col.cards.map((p, pi) => (
                    <ProjectCard key={`d${ci}-${pi}`} project={p} mini />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile: single-column, 3 projects cycling */}
        <div className="creation-scroll-outer creation-mobile-only">
          <div className="creation-col creation-col--up creation-col--mobile-single">
            <div className="col-track col-track--mobile" style={{ animationDuration: '18s' }}>
              {MOBILE_TRACK.map((p, i) => (
                <ProjectCard key={`m-${i}`} project={p} mini />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
