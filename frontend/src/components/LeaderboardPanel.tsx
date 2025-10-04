import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import clsx from 'clsx';
import { useAccount } from 'wagmi';
import { fetchLeaderboard } from '../services/gameApi';
import { useGameStore } from '../state/gameStore';
import styles from './LeaderboardPanel.module.css';

const LEADERBOARD_LIMIT = 100;

const formatWallet = (wallet: string) => {
  if (!wallet) {
    return 'Unknown';
  }

  const normalized = wallet.trim();
  if (normalized.length <= 10) {
    return normalized;
  }

  return `${normalized.slice(0, 6)}…${normalized.slice(-4)}`;
};

export const LeaderboardPanel = () => {
  const { address } = useAccount();
  const normalizedWallet = address?.toLowerCase();
  const personalDestroyed = useGameStore((state) => state.personalDestroyed);

  const { data, isFetching, isError, error } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: fetchLeaderboard,
    staleTime: 60_000,
    refetchInterval: 120_000,
  });

  const entries = data ?? [];
  const userRank = useMemo(() => {
    if (!normalizedWallet) {
      return null;
    }

    const index = entries.findIndex((entry) => entry.walletAddress === normalizedWallet);
    return index >= 0 ? index + 1 : null;
  }, [entries, normalizedWallet]);

  const personalLabel = address
    ? 'Your total destroys'
    : 'Connect a wallet to track your personal total';

  return (
    <section className={styles.panel} aria-labelledby="leaderboard-heading">
      <header className={styles.header}>
        <div>
          <h2 id="leaderboard-heading">Leaderboard</h2>
          <p>Total objects destroyed by each wallet.</p>
        </div>
        <span className={clsx(styles.status, { [styles.syncing]: isFetching })}>
          {isFetching ? 'Syncing…' : 'Up to date'}
        </span>
      </header>
      <div className={styles.personal}>
        <div className={styles.personalMeta}>
          <p>{personalLabel}</p>
          {userRank && (
            <span className={styles.personalRank} aria-label={`Your leaderboard rank is ${userRank}`}>
              #{userRank}
            </span>
          )}
        </div>
        <strong>{personalDestroyed.toLocaleString()}</strong>
      </div>
      {isError ? (
        <p className={styles.error}>
          {error instanceof Error ? error.message : 'Unable to load leaderboard'}
        </p>
      ) : entries.length ? (
        <ol className={styles.list}>
          {entries.map((entry, index) => {
            const isYou = normalizedWallet === entry.walletAddress;
            return (
              <li
                key={entry.walletAddress}
                className={clsx(styles.row, { [styles.isYou]: isYou })}
              >
                <span className={styles.rank}>#{index + 1}</span>
                <div className={styles.identity}>
                  <span className={styles.wallet} title={entry.walletAddress}>
                    {formatWallet(entry.walletAddress)}
                  </span>
                  {isYou && <span className={styles.youBadge}>You</span>}
                </div>
                <span className={styles.total}>{entry.objectsDestroyed.toLocaleString()}</span>
              </li>
            );
          })}
        </ol>
      ) : (
        <p className={styles.empty}>No destroys recorded yet.</p>
      )}
      {address && personalDestroyed > 0 && userRank === null && entries.length >= LEADERBOARD_LIMIT && (
        <p className={styles.note}>
          You're outside the top {LEADERBOARD_LIMIT}. Keep destroying objects to climb the ranks!
        </p>
      )}
    </section>
  );
};
