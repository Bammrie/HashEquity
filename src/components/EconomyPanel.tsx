import { FormEvent, useState } from 'react';
import { useGameStore } from '../state/gameStore';
import styles from './EconomyPanel.module.css';

export const EconomyPanel = () => {
  const { hash, unminted, vault } = useGameStore((state) => state.balances);
  const settleDailyMint = useGameStore((state) => state.settleDailyMint);
  const tradeInForHash = useGameStore((state) => state.tradeInForHash);
  const [tradeAmount, setTradeAmount] = useState('0.00000000');

  const handleTradeSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const amount = Number(tradeAmount);
    if (Number.isNaN(amount)) {
      return;
    }
    tradeInForHash(Number(amount.toFixed(10)));
  };

  return (
    <section className={styles.panel}>
      <header>
        <h2>Economy</h2>
        <p>Daily minting taxes 20% to the Vault. Trades burn 50%.</p>
      </header>
      <dl className={styles.metrics}>
        <div>
          <dt>HASH</dt>
          <dd>{hash.toFixed(10)}</dd>
        </div>
        <div>
          <dt>Unminted HASH</dt>
          <dd>{unminted.toFixed(10)}</dd>
        </div>
        <div>
          <dt>Vault</dt>
          <dd>{vault.toFixed(10)}</dd>
        </div>
      </dl>
      <div className={styles.actions}>
        <button type="button" onClick={settleDailyMint}>
          Run Daily Mint
        </button>
        <form onSubmit={handleTradeSubmit} className={styles.tradeForm}>
          <label htmlFor="trade-amount">Trade In</label>
          <input
            id="trade-amount"
            name="trade-amount"
            type="number"
            step="0.00000001"
            min="0"
            value={tradeAmount}
            onChange={(event) => setTradeAmount(event.target.value)}
          />
          <button type="submit">Convert 50%</button>
        </form>
      </div>
    </section>
  );
};
