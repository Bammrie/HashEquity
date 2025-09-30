import { ActiveObject, useGameStore } from '../state/gameStore';
import styles from './GameObjectCard.module.css';

const rewardLabel = (object: ActiveObject): string => {
  if (object.reward.type === 'unminted_hash') {
    return `${object.reward.value.toFixed(10)} unminted HASH`;
  }
  return object.reward.label;
};

type Props = {
  object: ActiveObject;
};

export const GameObjectCard = ({ object }: Props) => {
  const destroyObject = useGameStore((state) => state.destroyObject);

  return (
    <button className={styles.card} onClick={() => destroyObject(object.id)} type="button">
      <span className={styles.label}>{object.type}</span>
      <span className={styles.reward}>{rewardLabel(object)}</span>
      <span className={styles.meta}>Health: {object.health}</span>
    </button>
  );
};
