import { FormEvent, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import { useGameStore } from '../state/gameStore';
import { fetchBalances } from '../services/gameApi';
import styles from './EconomyPanel.module.css';

export const EconomyPanel = () => {
  const { address } = useAccount();
  const syncBackendBalances = useGameStore((state) => state.syncBackendBalances);
  const addEvent = useGameStore((state) => state.addEvent);
  const { hash, unminted, vault } = useGameStore((state) => state.balances);
  const settleDailyMint = useGameStore((state) => state.settleDailyMint);
  const tradeInForHash = useGameStore((state) => state.tradeInForHash);
  const [tradeAmount, setTradeAmount] = useState('0.00000000');

  const { data, isFetching, refetch, error } = useQuery({
    queryKey: ['balances', address],
    queryFn: () => fetchBalances(address!),
    enabled: Boolean(address),
    refetchInterval: 30_000,
  });

  useEffect(() => {
    if (data) {
      syncBackendBalances({
        hashBalance: data.hashBalance,
        unmintedHash: data.unmintedHash,
      });
    }
  }, [data, syncBackendBalances]);

  useEffect(() => {
    if (error instanceof Error) {
      addEvent(`Failed to sync balances: ${error.message}`);
    }
  }, [error, addEvent]);

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
        <h2>Vault &amp; Economy</h2>
        <p>Steer the HASH flow — settle the daily mint run and convert unminted stash in one tap.</p>
        {address ? (
          <p className={styles.connection}>Connected wallet: {address}</p>
        ) : (
          <p className={styles.connection}>Connect a wallet to sync live balances.</p>
        )}
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
        <button type="button" onClick={settleDailyMint} disabled={isFetching}>
          {isFetching ? 'Syncing…' : 'Deploy Daily Mint'}
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
          <button type="submit" disabled={isFetching}>
            Convert 50%
          </button>
        </form>
        {address && (
          <button type="button" onClick={() => refetch()} className={styles.refreshButton} disabled={isFetching}>
            Refresh Balances
          </button>
        )}
      </div>
    </section>
  );
};
