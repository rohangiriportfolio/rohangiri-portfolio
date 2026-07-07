import { useEffect, useRef, useState } from 'react';
import { profile, skillGroups, projects, terminalHelp } from '../data/content';
import Reveal from './Reveal';

const PROMPT_USER = 'rohan';
const PROMPT_HOST = 'portfolio';

function Prompt() {
  return (
    <span className="prompt">
      {PROMPT_USER}<span className="at">@</span>{PROMPT_HOST}<span className="at">:~$</span>
    </span>
  );
}

function welcomeLines() {
  return [
    { kind: 'heading', text: `Welcome to ${profile.name}'s terminal v1.0.0` },
    { kind: 'text',    text: "Type 'help' to see the list of available commands." },
    { kind: 'blank' },
  ];
}

function buildResponse(raw) {
  const cmd = raw.trim().toLowerCase();
  if (cmd === '') return [];

  if (cmd === 'help') return [
    { kind: 'heading', text: 'Available commands:' },
    { kind: 'table',   rows: terminalHelp.map(c => [c.cmd, c.desc]) },
    { kind: 'blank' },
  ];

  if (cmd === 'whoami') return [
    { kind: 'success', text: `${PROMPT_USER}` },
    { kind: 'text',    text: 'B.Tech CSE student, builder of things, occasional artist.' },
    { kind: 'blank' },
  ];

  if (cmd === 'about') return [
    { kind: 'heading', text: 'About' },
    ...profile.bioFull.map(p => ({ kind: 'text', text: p })),
    { kind: 'blank' },
  ];

  if (cmd === 'education') return [
    { kind: 'heading', text: 'Education' },
    { kind: 'table',   rows: [
      ['B.Tech CSE',       'Haldia Institute of Technology — in progress'],
      ['Higher Secondary', '93% — Poura Pathabhaban School'],
      ['Secondary',        '87% — Poura Pathabhaban School'],
    ]},
    { kind: 'blank' },
  ];

  if (cmd === 'skills') return [
    { kind: 'heading', text: 'Skills' },
    ...skillGroups.map(g => ({
      kind: 'table',
      rows: [[g.label, g.skills.map(s => s.name).join(', ')]],
    })),
    { kind: 'blank' },
  ];

  if (cmd === 'projects' || cmd === 'ls') return [
    { kind: 'heading', text: 'Projects' },
    { kind: 'table',   rows: projects.map(p => [p.title, p.subtitle]) },
    { kind: 'text',    text: "See the Creation section for full details and links." },
    { kind: 'blank' },
  ];

  if (cmd === 'contact') return [
    { kind: 'heading', text: 'Contact' },
    { kind: 'table',   rows: [
      ['email',    profile.email],
      ['github',   profile.socials.github],
      ['linkedin', profile.socials.linkedin],
    ]},
    { kind: 'blank' },
  ];

  if (cmd === 'date') return [
    { kind: 'text', text: new Date().toString() },
    { kind: 'blank' },
  ];

  if (cmd === 'sudo' || cmd.startsWith('sudo ')) return [
    { kind: 'error', text: `${PROMPT_USER} is not in the sudoers file. This incident will be reported. 😄` },
    { kind: 'blank' },
  ];

  if (cmd === 'clear' || cmd === 'cls') return 'CLEAR';

  return [
    { kind: 'error', text: `command not found: ${raw}` },
    { kind: 'text',  text: "Type 'help' to see available commands." },
    { kind: 'blank' },
  ];
}

// ── Render a single line (static, fully-revealed) ─────────────
function renderLine(line, key) {
  if (line.kind === 'blank')   return <div key={key} style={{ height: 6 }} />;
  if (line.kind === 'heading') return <div key={key} className="term-line is-heading">{line.text}</div>;
  if (line.kind === 'error')   return <div key={key} className="term-line is-error">{line.text}</div>;
  if (line.kind === 'success') return <div key={key} className="term-line is-success">{line.text}</div>;
  if (line.kind === 'table')   return (
    <dl key={key} className="term-table">
      {line.rows.map(([dt, dd], ri) => (
        <div key={ri} style={{ display: 'contents' }}>
          <dt>{dt}</dt>
          <dd>{dd}</dd>
        </div>
      ))}
    </dl>
  );
  return <div key={key} className="term-line">{line.text}</div>;
}

// ── Typing animation block ─────────────────────────────────────
function TypingBlock({ lines, instant }) {
  const [state, setState] = useState({ done: instant ? lines.length : 0, chars: 0 });

  useEffect(() => {
    if (instant) { setState({ done: lines.length, chars: 0 }); return; }

    let done = 0;
    let chars = 0;
    let tid = null;

    function tick() {
      const line = lines[done];
      if (!line) return;

      const isTyped = ['text', 'success', 'error'].includes(line.kind);
      const fullText = isTyped ? (line.text || '') : '';

      if (isTyped && chars < fullText.length) {
        chars++;
        setState({ done, chars });
        tid = setTimeout(tick, 13);
      } else {
        done++;
        chars = 0;
        setState({ done, chars });
        if (done < lines.length) tid = setTimeout(tick, isTyped ? 55 : 8);
      }
    }

    tid = setTimeout(tick, 30);
    return () => { if (tid) clearTimeout(tid); };
  }, []); // run once on mount

  return (
    <>
      {lines.map((line, i) => {
        if (i < state.done) return renderLine(line, `tl-${i}`);

        if (i === state.done) {
          const isTyped = ['text', 'success', 'error'].includes(line.kind);
          if (!isTyped) return renderLine(line, `tl-${i}`);
          const partial = (line.text || '').slice(0, state.chars);
          return (
            <div
              key={`tl-${i}`}
              className={`term-line${line.kind === 'error' ? ' is-error' : line.kind === 'success' ? ' is-success' : ''}`}
            >
              {partial}
              {state.chars < (line.text || '').length && (
                <span className="term-cursor-inline" aria-hidden />
              )}
            </div>
          );
        }
        return null;
      })}
    </>
  );
}

// ── Terminal ───────────────────────────────────────────────────
export default function Terminal() {
  const [history, setHistory]       = useState(() => [{ id: 'welcome', lines: welcomeLines(), instant: true }]);
  const [value, setValue]           = useState('');
  const [cmdHistory, setCmdHistory] = useState([]);
  const [histPtr, setHistPtr]       = useState(-1);
  const bodyRef  = useRef(null);
  const inputRef = useRef(null);
  const idRef    = useRef(1);

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [history]);

  function handleSubmit(e) {
    e.preventDefault();
    const raw = value.trim();
    if (!raw) return;

    const response = buildResponse(raw);

    if (response === 'CLEAR') {
      setHistory([]);
    } else {
      const id = idRef.current++;
      setHistory(h => [...h, { id, cmd: raw, lines: response, instant: false }]);
    }

    setCmdHistory(h => [...h, raw]);
    setHistPtr(-1);
    setValue('');
  }

  function handleKeyDown(e) {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!cmdHistory.length) return;
      const next = histPtr === -1 ? cmdHistory.length - 1 : Math.max(0, histPtr - 1);
      setHistPtr(next);
      setValue(cmdHistory[next]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (histPtr === -1) return;
      const next = histPtr + 1;
      if (next >= cmdHistory.length) { setHistPtr(-1); setValue(''); }
      else { setHistPtr(next); setValue(cmdHistory[next]); }
    }
  }

  return (
    <section id="terminal" className="section">
      <div className="section__inner">
        <Reveal className="section__head">
          <span className="eyebrow">&lt;Terminal/&gt;</span>
          <h2 className="section__title">
            Try it <span className="accent">yourself</span>
          </h2>
          <p className="section__lede">
            A tiny shell into this portfolio — type a command below or start with <code>help</code>.
          </p>
        </Reveal>

        <Reveal>
          <div className="terminal" onClick={() => inputRef.current?.focus()}>
            <div className="terminal__bar">
              <span /><span /><span />
              <span className="path">{PROMPT_USER}@{PROMPT_HOST}: ~</span>
            </div>

            <div className="terminal__body" ref={bodyRef}>
              {history.map(entry => (
                <div key={entry.id}>
                  {entry.cmd !== undefined && (
                    <div className="term-line is-cmd">
                      <Prompt />
                      <span>{entry.cmd}</span>
                    </div>
                  )}
                  <TypingBlock lines={entry.lines} instant={entry.instant} />
                </div>
              ))}

              <form className="terminal__input-row" onSubmit={handleSubmit}>
                <Prompt />
                <input
                  ref={inputRef}
                  className="terminal__input"
                  value={value}
                  onChange={e => setValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  spellCheck="false"
                  autoComplete="off"
                  aria-label="Terminal command input"
                />
                {/* <span className="term-cursor" aria-hidden /> */}
              </form>
            </div>
          </div>

          <p className="terminal__hint">
            Try <kbd>help</kbd> · <kbd>whoami</kbd> · <kbd>skills</kbd> · <kbd>projects</kbd> · <kbd>contact</kbd> · <kbd>sudo make me a sandwich</kbd>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
