import { useMutation } from '@tanstack/react-query';
import type { CSSProperties } from 'react';
import { useAccount } from 'wagmi';
import { ActiveObject, useGameStore } from '../state/gameStore';
import { destroyGameObject, type BalancesResponse, type DestroyPayload } from '../services/gameApi';
import styles from './GameObjectCard.module.css';

type Props = {
  object: ActiveObject;
  position: { x: number; y: number };
  size: number;
};

export const GameObjectCard = ({ object, position, size }: Props) => {
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

  const handleDestroy = () => {
    destroyObject(object.id);
    if (address) {
      mutate({
        wallet: address,
        objectId: object.id,
        reward: object.reward.type === 'unminted_hash' ? object.reward.value : undefined,
        objectName: object.definitionKey,
      });
    }
  };

  const style: CSSProperties = {
    width: `${size}px`,
    height: `${size}px`,
    transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
  };

  return (
    <button

      className={styles.objectButton}
      onClick={handleDestroy}
      style={style}

      type="button"
      aria-label={`Interact with ${object.definitionKey}`}
    >

      <span className={styles.imageWrapper} aria-hidden="true">
        <img src={object.image} alt="" className={styles.image} />
      </span>
      <span className={styles.srOnly}>Health {object.health}</span>

    </button>
  );
};
