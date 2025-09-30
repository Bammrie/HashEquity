import { GameBoard } from './components/GameBoard';
import { EconomyPanel } from './components/EconomyPanel';
import { MiniGamePanel } from './components/MiniGamePanel';
import { EventFeed } from './components/EventFeed';
import { TopBar } from './components/TopBar';
import styles from './App.module.css';

export const App = () => (
  <div className={styles.app}>
    <TopBar />
    <main className={styles.mainContent}>
      <div className={styles.primaryColumn}>
        <GameBoard />
        <MiniGamePanel />
      </div>
      <aside className={styles.sidebar}>
        <EconomyPanel />
        <EventFeed />
      </aside>
    </main>
  </div>
);
