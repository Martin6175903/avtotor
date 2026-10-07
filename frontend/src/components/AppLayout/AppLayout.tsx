import { SessionControls } from '@modules/auth';
import { NavLink, Outlet } from 'react-router-dom';

import { appLayoutNavigationItems } from './AppLayout.constants';
import styles from './AppLayout.module.scss';

export const AppLayout = () => {
  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <NavLink className={styles.brand} to="/">
          База знаний
        </NavLink>
        <nav>
          <ul className={styles.navigation}>
            {appLayoutNavigationItems.map((link) => (
              <li key={link.title}>
                <NavLink className={styles.navigationLink} to={link.to} end={link.end}>
                  {link.title}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <SessionControls />
      </header>
      <main className={styles.content}>
        <Outlet />
      </main>
    </div>
  );
};
