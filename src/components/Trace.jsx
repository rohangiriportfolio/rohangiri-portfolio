import { navLinks } from '../data/content';

export default function Trace({ progress, activeId, onNavigate }) {
  const activeIndex = navLinks.findIndex((l) => l.id === activeId);

  return (
    <nav className="trace" aria-label="Section progress">
      <div className="trace__rail">
        <div
          className="trace__fill"
          style={{ height: `${Math.max(4, progress * 100)}%` }}
        />
        {navLinks.map((link, i) => (
          <button
            key={link.id}
            type="button"
            className={
              'trace__node' +
              (link.id === activeId ? ' is-active' : i < activeIndex ? ' is-passed' : '')
            }
            style={{ top: `${(i / (navLinks.length - 1)) * 80}%` }}
            onClick={() => onNavigate(link.id)}
            aria-label={`Jump to ${link.label}`}
            title={link.label}
          />
        ))}
      </div>
    </nav>
  );
}
