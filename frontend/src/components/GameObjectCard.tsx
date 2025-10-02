import { useMutation } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
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

  return (
    <button
      className={`${styles.card} ${styles.cardFloating}`}
      onClick={() => {
        destroyObject(object.id);
        if (address) {
          mutate({
            wallet: address,
            objectId: object.id,
            reward: object.reward.type === 'unminted_hash' ? object.reward.value : undefined,
            objectName: object.type,
          });
        }
      }}
      type="button"
    >
      <span className={styles.cardGlint} aria-hidden="true" />
      <span className={styles.cardContent}>
        <span className={styles.label}>{object.type}</span>
        <span className={styles.reward}>{rewardLabel(object)}</span>
        <span className={styles.meta}>Health: {object.health}</span>
      </span>
      <span className={styles.sparkles} aria-hidden="true">
        <span className={styles.sparkle} />
        <span className={styles.sparkle} />
        <span className={styles.sparkle} />
      </span>
    </button>
  );
};
