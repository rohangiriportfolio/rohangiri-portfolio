import { useState, useEffect } from 'react';
import { testimonials } from '../data/content';
import Reveal from './Reveal';

const STORAGE_KEY = 'portfolio_visitor_testimonials';

function StarPicker({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="tform-stars" role="group" aria-label="Star rating">
      {[1,2,3,4,5].map(n => (
        <button
          key={n} type="button"
          className={'tform-star' + (n <= (hovered || value) ? ' active' : '')}
          onClick={() => onChange(n)}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          aria-label={`${n} star${n>1?'s':''}`}
        >★</button>
      ))}
    </div>
  );
}

function PreCard({ t }) {
  return (
    <div className="testimonial-card">
      <div className="tcard-quote-mark">❝</div>
      <div className="tcard-stars">
        {[...Array(5)].map((_,i) => <span key={i} className="tcard-star">★</span>)}
      </div>
      <p className="tcard-quote">{t.quote}</p>
      <div className="testimonial-card__author">
        <div className="testimonial-card__avatar">{t.initial}</div>
        <div>
          <strong>{t.name}</strong>
          <span>{t.role}</span>
        </div>
      </div>
    </div>
  );
}

function VisitorCard({ t, onDelete }) {
  return (
    <div className="testimonial-card testimonial-card--visitor">
      <div className="tcard-visitor-badge">Visitor</div>
      <div className="tcard-quote-mark">"</div>
      <div className="tcard-stars">
        {[1,2,3,4,5].map((_,i) => (
          <span key={i} className={'tcard-star' + (i < t.stars ? '' : ' dim')}>★</span>
        ))}
      </div>
      <p className="tcard-quote">{t.quote}</p>
      <div className="testimonial-card__author">
        <div className="testimonial-card__avatar visitor-avatar">
          {t.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <strong>{t.name}</strong>
          <span>{t.role}</span>
        </div>
      </div>
      {onDelete && (
        <button className="tcard-delete" onClick={onDelete} aria-label="Remove my testimonial">
          ✕ Remove mine
        </button>
      )}
    </div>
  );
}

const EMPTY = { name: '', role: '', quote: '', stars: 5 };

export default function Testimonials() {
  const [visitors, setVisitors]     = useState([]);
  const [form, setForm]             = useState(EMPTY);
  const [errors, setErrors]         = useState({});
  const [submitted, setSubmitted]   = useState(false);
  const [showForm, setShowForm]     = useState(false);
  const [myId, setMyId]             = useState(null);

  // Load from localStorage
  useEffect(() => {
    try {
      const raw  = localStorage.getItem(STORAGE_KEY);
      const myRaw = localStorage.getItem(STORAGE_KEY + '_mine');
      if (raw)   setVisitors(JSON.parse(raw));
      if (myRaw) setMyId(myRaw);
    } catch {}
  }, []);

  function validate() {
    const e = {};
    if (!form.name.trim())  e.name  = 'Name is required';
    if (!form.role.trim())  e.role  = 'Role is required';
    if (form.quote.trim().length < 20) e.quote = 'Please write at least 20 characters';
    return e;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const id = Date.now().toString();
    const entry = {
      id,
      name:  form.name.trim(),
      role:  form.role.trim(),
      quote: form.quote.trim(),
      stars: form.stars,
      date:  new Date().toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }),
    };

    const next = [entry, ...visitors];
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      localStorage.setItem(STORAGE_KEY + '_mine', id);
    } catch {}
    setVisitors(next);
    setMyId(id);
    setForm(EMPTY);
    setErrors({});
    setSubmitted(true);
    setShowForm(false);
    setTimeout(() => setSubmitted(false), 4000);
  }

  function handleDelete(id) {
    const next = visitors.filter(v => v.id !== id);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      localStorage.removeItem(STORAGE_KEY + '_mine');
    } catch {}
    setVisitors(next);
    setMyId(null);
  }

  const field = (key) => ({
    value: form[key],
    onChange: e => { setForm(f => ({ ...f, [key]: e.target.value })); setErrors(err => ({ ...err, [key]: '' })); },
  });

  return (
    <section id="testimonials" className="section">
      <div className="section__inner">

        {/* ── Header ── */}
        <Reveal className="section__head">
          <span className="eyebrow">&lt;Testimonials/&gt;</span>
          <h2 className="section__title">What people <span className="accent">say</span></h2>
          <p className="section__lede">
            Words from mentors, teammates, and collaborators I've had the pleasure of working with.
          </p>
        </Reveal>

        {/* ── Pre-defined cards ── */}
        <Reveal as="div" stagger className="testimonials-grid">
          {testimonials.map((t, i) => <PreCard key={i} t={t} />)}
        </Reveal>

        {/* ── Visitor testimonials ── */}
        {visitors.length > 0 && (
          <Reveal>
            <div className="tvisitor-section">
              <h3 className="tvisitor-heading">
                <span className="accent">From Visitors</span>
                <span className="tvisitor-count">{visitors.length}</span>
              </h3>
              <div className="testimonials-grid">
                {visitors.map(v => (
                  <VisitorCard
                    key={v.id}
                    t={v}
                    onDelete={v.id === myId ? () => handleDelete(v.id) : null}
                  />
                ))}
              </div>
            </div>
          </Reveal>
        )}

        {/* ── Add testimonial ── */}
        <Reveal>
          <div className="tform-wrapper">
            {submitted && (
              <div className="tform-success">
                ✓ Thank you! Your testimonial has been added.
              </div>
            )}

            {!myId ? (
              <>
                {!showForm ? (
                  <button className="tform-trigger" onClick={() => setShowForm(true)}>
                    <span className="tform-trigger__icon">+</span>
                    Leave a testimonial
                  </button>
                ) : (
                  <div className="tform-card">
                    <div className="tform-card__head">
                      <h3>Share your experience</h3>
                      <button className="tform-close" onClick={() => { setShowForm(false); setErrors({}); }}>✕</button>
                    </div>

                    <form className="tform" onSubmit={handleSubmit} noValidate>
                      <div className="tform-row">
                        <div className="tform-group">
                          <label htmlFor="tf-name">Your Name *</label>
                          <input id="tf-name" type="text" placeholder="Riya Das" maxLength={60} {...field('name')} />
                          {errors.name && <span className="tform-error">{errors.name}</span>}
                        </div>
                        <div className="tform-group">
                          <label htmlFor="tf-role">Your Role *</label>
                          <input id="tf-role" type="text" placeholder="Senior Developer, Google" maxLength={80} {...field('role')} />
                          {errors.role && <span className="tform-error">{errors.role}</span>}
                        </div>
                      </div>

                      <div className="tform-group">
                        <label>Rating *</label>
                        <StarPicker value={form.stars} onChange={v => setForm(f => ({ ...f, stars: v }))} />
                      </div>

                      <div className="tform-group">
                        <label htmlFor="tf-quote">Your Message * <span className="tform-counter">{form.quote.length}/400</span></label>
                        <textarea
                          id="tf-quote"
                          rows={4}
                          maxLength={400}
                          placeholder="Share your experience working or studying with Rohan…"
                          {...field('quote')}
                        />
                        {errors.quote && <span className="tform-error">{errors.quote}</span>}
                      </div>

                      <div className="tform-actions">
                        <button type="button" className="tform-cancel" onClick={() => { setShowForm(false); setErrors({}); }}>
                          Cancel
                        </button>
                        <button type="submit" className="tform-submit">
                          Submit Testimonial
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </>
            ) : (
              <p className="tform-submitted-note">
                ✓ You've already submitted a testimonial. Find it above and remove it if you'd like to update.
              </p>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
