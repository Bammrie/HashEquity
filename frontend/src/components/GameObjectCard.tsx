import { useMutation } from '@tanstack/react-query';
import clsx from 'clsx';
import type { CSSProperties } from 'react';
import { useAccount } from 'wagmi';
import { ActiveObject, useGameStore } from '../state/gameStore';
import { destroyGameObject, type BalancesResponse, type DestroyPayload } from '../services/gameApi';
import styles from './GameObjectCard.module.css';

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
        objectsDestroyed: balances.objectsDestroyed,
        inventory: balances.inventory,
      });
      const totalDestroys = Number(balances.objectsDestroyed);
      const formattedTotal = Number.isFinite(totalDestroys)
        ? totalDestroys.toLocaleString()
        : '0';

      addEvent(
        `Backend recorded destroy for ${variables.objectId}. Total destroys: ${formattedTotal}.`,
      );
    },
    onError: (error) => {
      addEvent(`Failed to sync destroy with backend: ${error.message}`);
    },
  });

  const style: CSSProperties = {
    left: `${object.position.x}%`,
    top: `${object.position.y}%`,
    animationDuration: `${object.floatDuration}s`,
    animationDelay: `${object.floatDelay}s`,
  };

  const handleDestroy = () => {
    const outcome = destroyObject(object.id);
    if (outcome !== 'destroyed') {
      return;
    }
    if (address) {
      mutate({
        wallet: address,
        objectId: object.type,
        reward:
          object.reward.type === 'unminted_hash'
            ? { type: 'unminted_hash', value: object.reward.value }
            : object.reward.type === 'item'
            ? {
                type: 'item',
                itemId: object.reward.itemId,
                name: object.reward.name,
                image: object.reward.image,
                description: object.reward.description,
              }
            : undefined,
        objectName: object.name,
        objectImage: object.image,
      });
    }
  };

  const actionLabel = (() => {
    switch (object.reward.type) {
      case 'unminted_hash':
        return `Collect ${object.reward.value.toFixed(10)} unminted HASH from ${object.name}`;
      case 'mini_game':
        return `Trigger ${object.reward.label} from ${object.name}`;
      case 'item':
        return `Collect ${object.reward.name} from ${object.name}`;
      default:
        return `Destroy ${object.name}`;
    }
  })();

  return (
    <button
      className={clsx(styles.coin, styles[object.size])}
      onClick={handleDestroy}
      style={style}
      type="button"
      aria-label={actionLabel}
    >
      <img src={object.image} alt="" className={styles.art} />
    </button>
  );
};
