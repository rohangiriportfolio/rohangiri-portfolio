import { navLinks, profile } from '../data/content';
import { IconGithub, IconLinkedin, IconTwitter, IconInstagram, IconArrowUp } from './icons/Icons';

export default function Footer({ onNavigate }) {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__top">
          <div className="footer__brand">
            <span className="brand__name">{profile.name}</span>
            <p className="footer__tagline">
              ── Programming is thinking, not typing . . .
            </p>
          </div>

          <div className="footer__col">
            <h4>NAVIGATE</h4>
            <ul>
              {navLinks.map((link) => (
                <li key={link.id}>
                  <a
                    href={`#${link.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigate(link.id);
                    }}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer__col">
            <h4>CONNECT</h4>
            <ul>
              <li><a href={`mailto:${profile.email}`}>{profile.email}</a></li>
              <li><a href={profile.socials.github} target="_blank" rel="noreferrer">GitHub</a></li>
              <li><a href={profile.socials.linkedin} target="_blank" rel="noreferrer">LinkedIn</a></li>
            </ul>
          </div>

          <div className="footer__col">
            <h4>SOCIAL</h4>
            <div className="social-row">
              <a className="social-icon" href={profile.socials.github} target="_blank" rel="noreferrer" aria-label="GitHub">
                <IconGithub />
              </a>
              <a className="social-icon" href={profile.socials.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn">
                <IconLinkedin />
              </a>
              <a className="social-icon" href={profile.socials.twitter} target="_blank" rel="noreferrer" aria-label="Twitter">
                <IconTwitter />
              </a>
              <a className="social-icon" href={profile.socials.instagram} target="_blank" rel="noreferrer" aria-label="Instagram">
                <IconInstagram />
              </a>
            </div>
          </div>
        </div>

        <div className="footer__bottom">
          <span>© {year} {profile.name}. Built with ♥</span>
          <button type="button" className="to-top" onClick={() => onNavigate('home')} aria-label="Back to top">
            <IconArrowUp />
          </button>
        </div>
      </div>
    </footer>
  );
}
