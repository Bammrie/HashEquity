import { useGameStore } from '../state/gameStore';
import { GameObjectCard } from './GameObjectCard';
import styles from './GameBoard.module.css';

export const GameBoard = () => {
  const objects = useGameStore((state) => state.objects);

  return (
    <section className={styles.board} aria-label="Active game objects">
      {objects.map((object) => (
        <GameObjectCard key={object.id} object={object} />
      ))}
    </section>
  );
};
