import { useMutation } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import { type CSSProperties, useMemo } from 'react';
import { ActiveObject, useGameStore } from '../state/gameStore';
import { destroyGameObject, type BalancesResponse, type DestroyPayload } from '../services/gameApi';
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
  const { address } = useAccount();
  const destroyObject = useGameStore((state) => state.destroyObject);
  const syncBackendBalances = useGameStore((state) => state.syncBackendBalances);
  const addEvent = useGameStore((state) => state.addEvent);

  const { mutate } = useMutation<BalancesResponse, Error, DestroyPayload>({
    mutationFn: destroyGameObject,
    onSuccess: (balances, variables) => {
      syncBackendBalances({
        hashBalance: balances.hashBalance,
        unmintedHash: balances.unmintedHash,
      });
      addEvent(`Backend recorded destroy for ${variables.objectId}. Balances synced.`);
    },
    onError: (error) => {
      addEvent(`Failed to sync destroy with backend: ${error.message}`);
    },
  });

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
      onClick={() => {
        destroyObject(object.id);
        if (address) {
          mutate({
            wallet: address,
            objectId: object.id,
            reward: object.reward.type === 'unminted_hash' ? object.reward.value : undefined,
            objectName: object.sprite.name,
            objectImage: object.sprite.image,
          });
        }
      }}
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
