import { GameBoard } from './components/GameBoard';
import { EconomyPanel } from './components/EconomyPanel';
import { MiniGamePanel } from './components/MiniGamePanel';
import { TopBar } from './components/TopBar';
import { StatsPanel } from './components/StatsPanel';
import { LeaderboardPanel } from './components/LeaderboardPanel';
import styles from './App.module.css';

export const App = () => (
  <div className={styles.app}>
    <TopBar />
    <main className={styles.mainContent}>
      <div className={styles.primaryColumn}>
        <GameBoard />
        <LeaderboardPanel />
        <MiniGamePanel />
      </div>
      <aside className={styles.sidebar}>
        <EconomyPanel />
        <StatsPanel />
      </aside>
    </main>
  </div>
);
