import { useMemo } from 'react';
import { GameBoard } from './components/GameBoard';
import { EconomyPanel } from './components/EconomyPanel';
import { MiniGamePanel } from './components/MiniGamePanel';
import { TopBar } from './components/TopBar';
import { StatsPanel } from './components/StatsPanel';
import { LeaderboardPanel } from './components/LeaderboardPanel';
import { InventoryPanel } from './components/InventoryPanel';
import { useGameStore } from './state/gameStore';
import heroCenter from './assets/coins/Object1-0.png';
import heroOrbit from './assets/coins/Object0-6.png';
import heroSignal from './assets/coins/Object0-3.png';
import styles from './App.module.css';

export const App = () => {
  const { objectsDestroyed, hashBalance, unminted } = useGameStore((state) => ({
    objectsDestroyed: state.objectsDestroyed,
    hashBalance: state.balances.hash,
    unminted: state.balances.unminted,
  }));

  const numberFormatter = useMemo(
    () => new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }),
    [],
  );
  const balanceFormatter = useMemo(
    () => new Intl.NumberFormat('en-US', { maximumFractionDigits: 6 }),
    [],
  );

  return (
    <div className={styles.page}>
      <TopBar />
      <section className={styles.hero} id="top">
        <div className={styles.heroCopy}>
          <span className={styles.eyebrow}>Polygon-powered destruction economy</span>
          <h1>Ignite the HashEquity arena</h1>
          <p>
            Drop into a living battlefield where every object you vaporize fuels the HASH
            token ecosystem. Connect, compete, and mint your victories straight from the
            arena floor.
          </p>
          <div className={styles.heroActions}>
            <a className={styles.primaryAction} href="#play">
              Launch the arena
            </a>
            <a className={styles.secondaryAction} href="#economy">
              Explore the economy brief
            </a>
          </div>
          <dl className={styles.heroStats}>
            <div>
              <dt>Objects destroyed</dt>
              <dd>{numberFormatter.format(objectsDestroyed)}</dd>
            </div>
            <div>
              <dt>Vault HASH balance</dt>
              <dd>{balanceFormatter.format(hashBalance)}</dd>
            </div>
            <div>
              <dt>Unminted HASH queued</dt>
              <dd>{balanceFormatter.format(unminted)}</dd>
            </div>
          </dl>
        </div>
        <div className={styles.heroArt} aria-hidden="true">
          <div className={styles.glow} />
          <img src={heroCenter} className={styles.primaryCoin} alt="" />
          <img src={heroOrbit} className={styles.secondaryCoin} alt="" />
          <img src={heroSignal} className={styles.tertiaryCoin} alt="" />
        </div>
      </section>
      <main className={styles.layout} id="play">
        <div className={styles.primaryColumn}>
          <GameBoard />
          <LeaderboardPanel />
          <MiniGamePanel />
        </div>
        <aside className={styles.sidebar} id="economy">
          <EconomyPanel />
          <InventoryPanel />
          <div id="intel">
            <StatsPanel />
          </div>
        </aside>
      </main>
    </div>
  );
};
