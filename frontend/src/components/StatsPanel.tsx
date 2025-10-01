import { useQuery } from '@tanstack/react-query';
import clsx from 'clsx';
import { fetchGameStats } from '../services/gameApi';
import styles from './StatsPanel.module.css';

export const StatsPanel = () => {
  const {
    data: stats,
    isFetching,
    isError,
    error,
  } = useQuery({
    queryKey: ['game-stats'],
    queryFn: fetchGameStats,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });

  return (
    <section className={styles.panel}>
      <header className={styles.header}>
        <h2>Object Telemetry</h2>
        <p>Live destroy counts synced from the backend.</p>
        <span className={clsx(styles.status, { [styles.syncing]: isFetching })}>
          {isFetching ? 'Syncing…' : 'Up to date'}
        </span>
      </header>
      {isError ? (
        <p className={styles.error}>
          {(error instanceof Error ? error.message : 'Unable to load stats')}
        </p>
      ) : (
        <ul className={styles.list}>
          {(stats ?? []).map((entry) => (
            <li key={entry.objectId}>
              <div className={styles.meta}>
                {entry.image ? (
                  <img src={entry.image} alt="" />
                ) : (
                  <span className={styles.placeholder} aria-hidden="true">
                    ◎
                  </span>
                )}
                <div>
                  <strong>{entry.name || entry.objectId}</strong>
                  <span>{entry.objectId}</span>
                </div>
              </div>
              <span className={styles.count}>{entry.destroyed}</span>
            </li>
          ))}
          {!stats?.length && !isFetching && (
            <li className={styles.empty}>No telemetry recorded yet.</li>
          )}
        </ul>
      )}
    </section>
  );
};
