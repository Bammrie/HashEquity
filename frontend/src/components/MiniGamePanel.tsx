import { useGameStore } from '../state/gameStore';
import styles from './MiniGamePanel.module.css';

export const MiniGamePanel = () => {
  const miniGame = useGameStore((state) => state.miniGame);
  const resolveMiniGame = useGameStore((state) => state.resolveMiniGame);

  if (!miniGame) {
    return (
      <section className={styles.panel}>
        <h2>Mini Games</h2>
        <p>No mini-games are active. Destroy wheel, slot, or plinko objects to trigger bonuses.</p>
      </section>
    );
  }

  return (
    <section className={styles.panel}>
      <h2>{miniGame.label}</h2>
      <p>Reward: {miniGame.payout.toFixed(10)} unminted HASH</p>
      <button type="button" onClick={resolveMiniGame} disabled={miniGame.status === 'resolved'}>
        {miniGame.status === 'resolved' ? 'Resolved' : 'Resolve Bonus'}
      </button>
    </section>
  );
};
