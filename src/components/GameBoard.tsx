import { useGameStore } from '../state/gameStore';
import { GameObjectCard } from './GameObjectCard';
import styles from './GameBoard.module.css';

export const GameBoard = () => {
  const objects = useGameStore((state) => state.objects);

  return (
    <section className={styles.board} aria-label="Floating HashEquity objects arena">
      <div className={styles.glow} aria-hidden="true" />
      {objects.map((object) => (
        <GameObjectCard key={object.instanceId} object={object} />
      ))}
    </section>
  );
};
