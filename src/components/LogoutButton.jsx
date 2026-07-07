import { useState } from 'react';

const SESSION_KEY = 'rg_portfolio_session';

export function useLogout() {
  const [loggingOut, setLoggingOut] = useState(false);

  const logout = () => {
    if (loggingOut) return;
    setLoggingOut(true);
    localStorage.removeItem(SESSION_KEY);
    // brief flash + reload so the visitor sees the lock screen again
    setTimeout(() => window.location.reload(), 550);
  };

  return { loggingOut, logout };
}

export default function LogoutButton() {
  const { loggingOut, logout } = useLogout();

  return (
    <>
      <button
        className={'logout-fab' + (loggingOut ? ' logout-fab--active' : '')}
        onClick={logout}
        aria-label="Log out"
        title="Log out"
        type="button"
      >
        <span className="logout-fab__ring" />
        <svg viewBox="0 0 24 24" className="logout-fab__icon" fill="none">
          <path d="M12 3v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path
            d="M7 5.5a8 8 0 1 0 10 0"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      </button>
      {loggingOut && <div className="logout-flash" aria-hidden="true" />}
    </>
  );
}

