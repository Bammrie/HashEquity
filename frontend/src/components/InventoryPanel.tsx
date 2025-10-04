import { useMemo } from 'react';
import { useGameStore } from '../state/gameStore';
import styles from './InventoryPanel.module.css';

export const InventoryPanel = () => {
  const inventory = useGameStore((state) => state.inventory);

  const items = useMemo(
    () => [...inventory].sort((a, b) => b.lastUpdated - a.lastUpdated),
    [inventory],
  );

  const timestampFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      }),
    [],
  );

  return (
    <section className={styles.panel} aria-labelledby="inventory-heading">
      <header className={styles.header}>
        <h2 id="inventory-heading">Inventory</h2>
        <p>Collectible rewards persist with your account and unlock future utility.</p>
      </header>
      {items.length === 0 ? (
        <p className={styles.empty}>Destroy rare objects to uncover collectible items.</p>
      ) : (
        <ul className={styles.list}>
          {items.map((item) => {
            const acquiredDate = new Date(item.lastUpdated);
            const formatted = timestampFormatter.format(acquiredDate);
            return (
              <li key={item.itemId} className={styles.entry}>
                {item.image ? (
                  <img src={item.image} alt="" className={styles.art} aria-hidden="true" />
                ) : (
                  <div className={styles.placeholder} aria-hidden="true" />
                )}
                <div className={styles.details}>
                  <div className={styles.row}>
                    <span className={styles.name}>{item.name}</span>
                    <span className={styles.quantity}>×{item.quantity}</span>
                  </div>
                  {item.description ? (
                    <p className={styles.description}>{item.description}</p>
                  ) : null}
                  <time className={styles.timestamp} dateTime={acquiredDate.toISOString()}>
                    Last acquired {formatted}
                  </time>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
};
