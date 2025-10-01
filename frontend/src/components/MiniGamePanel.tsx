import { useGameStore } from '../state/gameStore';
import styles from './MiniGamePanel.module.css';

export const MiniGamePanel = () => {
  const miniGame = useGameStore((state) => state.miniGame);
  const resolveMiniGame = useGameStore((state) => state.resolveMiniGame);

  if (!miniGame) {
    return (
      <section className={styles.panel}>
        <h2>Mini Games</h2>
        <p className={styles.idle}>No bonuses are spinning right now. Annihilate glowing Plinko cores to kick off a side mission.</p>
      </section>
    );
  }

  return (
    <section className={styles.panel}>
      <h2>{miniGame.label}</h2>
      <p className={styles.reward}>Reward: {miniGame.payout.toFixed(10)} unminted HASH</p>
      <p className={styles.subtitle}>Resolve the mini game to beam the payout into your unminted stash.</p>
      <button type="button" onClick={resolveMiniGame} disabled={miniGame.status === 'resolved'}>
        {miniGame.status === 'resolved' ? 'Resolved' : 'Resolve Bonus'}
      </button>
    </section>
  );
};
