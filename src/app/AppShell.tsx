import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { featureNavItems } from './featureRoutes';
import { isFirebaseReady } from '../config/firebase';
import { useAdminData } from './AdminDataProvider';
import ToastViewport from './ToastViewport';

export default function AppShell() {
  const { pathname } = useLocation();
  const { message, toasts, dismissToast } = useAdminData();

  return (
    <div className="admin-container">
      <aside className="admin-sidebar">
        <header className="admin-header">
          <div className="header-left">
            <h1 className="brand">Movie KH Admin</h1>
            <p className="tagline">Admin Console</p>
          </div>
          <div className="header-right">
            <div className="sidebar-status">{isFirebaseReady ? 'Firebase connected' : 'Local mode'}</div>
            <p className="sidebar-note">{message}</p>
          </div>
        </header>

        <nav className="admin-nav">
          <p className="nav-heading">Navigation</p>
          {featureNavItems.map((item) => (
            <NavLink
              key={item.key}
              to={item.path}
              className={`nav-tab ${
                pathname.startsWith(`/${item.path.split('/')[1]}/`) || pathname === `/${item.path.split('/')[1]}`
                  ? 'active'
                  : ''
              }`}
            >
              <span className="tab-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="admin-main">
        <Outlet />
      </main>

      <ToastViewport toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
