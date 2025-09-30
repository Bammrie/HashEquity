import clsx from 'clsx';
import { ActiveObject, useGameStore } from '../state/gameStore';
import styles from './GameObjectCard.module.css';

const rewardLabel = (object: ActiveObject): string => {
  if (object.reward.type === 'unminted_hash') {
    return `${object.reward.value.toFixed(10)} unminted HASH`;
  }
  return `${object.reward.label} mini-game`;
};

type Props = {
  object: ActiveObject;
};

export const GameObjectCard = ({ object }: Props) => {
  const destroyObject = useGameStore((state) => state.destroyObject);

  return (
    <button
      className={clsx(styles.object, styles[object.position.floatAnimation])}
      style={{
        top: `${object.position.top}%`,
        left: `${object.position.left}%`,
        animationDuration: `${object.position.duration}s`,
        animationDelay: `${object.position.delay}s`,
      }}
      type="button"
      onClick={() => destroyObject(object.instanceId)}
      aria-label={`${object.objectId} – ${rewardLabel(object)}`}
    >
      <img src={object.sprite} alt={object.objectId} loading="lazy" />
      <span className={styles.tag}>{object.objectId}</span>
      <span className={styles.reward}>{rewardLabel(object)}</span>
    </button>
  );
};
