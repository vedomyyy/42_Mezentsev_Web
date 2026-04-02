import { NavLink } from 'react-router-dom';

export function Header() {
  return (
    <header className="site-header">
      <div className="header-inner">
        <NavLink to="/" className="logo">
          <div className="logo-icon">⚡</div>
          <span>
            Пульс<span className="logo-muted">.рф</span>
          </span>
        </NavLink>

        <nav className="main-nav" aria-label="Основная навигация">
          <NavLink
            to="/"
            end
            className={({ isActive }) => isActive ? 'active' : ''}
          >
            💬 Обсуждения
          </NavLink>
          <NavLink
            to="/news"
            className={({ isActive }) => isActive ? 'active' : ''}
          >
            📰 Новости
          </NavLink>
          <NavLink
            to="/profile"
            className={({ isActive }) => isActive ? 'active' : ''}
          >
            👤 Профиль
          </NavLink>
        </nav>

        <div className="header-live" aria-live="polite">
          <div className="live-dot" />
          <span>1 247 онлайн</span>
        </div>
      </div>
    </header>
  );
}