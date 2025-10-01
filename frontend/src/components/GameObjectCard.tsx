import { type CSSProperties, useMemo } from 'react';
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

  const floatingStyle = useMemo(() => {
    const style: CSSProperties & Record<string, string> = {
      top: `${object.motion.y}%`,
      left: `${object.motion.x}%`,
      width: `${object.sprite.size}px`,
      height: `${object.sprite.size}px`,
      '--float-duration': `${object.motion.floatDuration}s`,
      '--float-delay': `${object.motion.floatDelay}s`,
      '--drift-x': `${object.motion.driftX}px`,
      '--drift-y': `${object.motion.driftY}px`,
    };
    return style;
  }, [
    object.motion.driftX,
    object.motion.driftY,
    object.motion.floatDelay,
    object.motion.floatDuration,
    object.motion.x,
    object.motion.y,
    object.sprite.size,
  ]);

  return (
    <button
      className={styles.card}
      onClick={() => destroyObject(object.id)}
      type="button"
      style={floatingStyle}
      aria-label={`${object.sprite.name} — ${rewardLabel(object)}`}
    >
      <span className={styles.accessibleLabel}>{`${object.sprite.name} ${rewardLabel(object)}`}</span>
      <img src={object.sprite.image} alt="" className={styles.sprite} />
      <span className={styles.caption}>
        <span className={styles.name}>{object.sprite.name}</span>
        <span className={styles.reward}>{rewardLabel(object)}</span>
      </span>
    </button>
  );
};
