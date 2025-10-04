import { FormEvent, useEffect, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import { useGameStore } from '../state/gameStore';
import vaultEmblem from '../assets/coins/vault-emblem.svg';
import { fetchBalances, tradeUnmintedHash, type TradeResponse } from '../services/gameApi';
import styles from './EconomyPanel.module.css';

export const EconomyPanel = () => {
  const { address } = useAccount();
  const syncBackendBalances = useGameStore((state) => state.syncBackendBalances);
  const addEvent = useGameStore((state) => state.addEvent);
  const { hash, unminted, vault, objectsDestroyed } = useGameStore((state) => ({
    hash: state.balances.hash,
    unminted: state.balances.unminted,
    vault: state.balances.vault,
    objectsDestroyed: state.objectsDestroyed,
  }));
  const tradeInForHash = useGameStore((state) => state.tradeInForHash);
  const [tradeAmount, setTradeAmount] = useState('0.00000000');

  const fillMaxTrade = () => {
    setTradeAmount(unminted.toFixed(10));
  };

  const { data, isFetching, refetch, error } = useQuery({
    queryKey: ['balances', address],
    queryFn: () => fetchBalances(address!),
    enabled: Boolean(address),
    refetchInterval: 30_000,
  });

  const { mutate: tradeMutation, isPending: isTrading } = useMutation<TradeResponse, Error, number>({
    mutationFn: (amount) => tradeUnmintedHash({ wallet: address!, amount }),
    onSuccess: (result) => {
      syncBackendBalances({
        hashBalance: result.hashBalance,
        unmintedHash: result.unmintedHash,
        vaultHashBalance: result.vaultHashBalance,
        objectsDestroyed: result.objectsDestroyed,
      });
      tradeInForHash({ tradedAmount: result.tradedAmount, mintedAmount: result.mintedAmount });
      setTradeAmount('0.00000000');
    },
    onError: (tradeError) => {
      addEvent(`Failed to trade in: ${tradeError.message}`);
    },
  });

  useEffect(() => {
    if (data) {
      syncBackendBalances({
        hashBalance: data.hashBalance,
        unmintedHash: data.unmintedHash,
        vaultHashBalance: data.vaultHashBalance,
        objectsDestroyed: data.objectsDestroyed,
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
    if (amount <= 0) {
      addEvent('Enter an amount greater than zero to trade in.');
      return;
    }
    if (!address) {
      addEvent('Connect a wallet before trading in unminted HASH.');
      return;
    }
    tradeMutation(Number(amount.toFixed(10)));
  };

  const isBusy = isFetching || isTrading;

  return (
    <section className={styles.panel}>
      <header>
        <h2>Economy</h2>
        <p>Daily minting runs automatically and taxes 20% to the Vault. Trades burn 50%.</p>
        {address ? (
          <p className={styles.connection}>Connected wallet: {address}</p>
        ) : (
          <p className={styles.connection}>Connect a wallet to sync live balances.</p>
        )}
      </header>
      <div className={styles.vaultSpotlight}>
        <img src={vaultEmblem} alt="HashVault emblem" className={styles.vaultEmblem} />
        <div className={styles.vaultContent}>
          <span className={styles.vaultLabel}>HashVault Reserves</span>
          <strong className={styles.vaultValue}>{vault.toFixed(10)} HASH</strong>
          <span className={styles.vaultCaption}>Pays out 50% trades & collects the daily mint tax.</span>
        </div>
      </div>
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
          <dt>Objects Destroyed</dt>
          <dd>{objectsDestroyed.toLocaleString()}</dd>
        </div>
      </dl>
      <div className={styles.actions}>
        <form onSubmit={handleTradeSubmit} className={styles.tradeForm}>
          <label htmlFor="trade-amount">Trade In</label>
          <div className={styles.tradeInputGroup}>
            <input
              id="trade-amount"
              name="trade-amount"
              type="number"
              step="0.00000001"
              min="0"
              value={tradeAmount}
              onChange={(event) => setTradeAmount(event.target.value)}
            />
            <button type="button" className={styles.maxButton} onClick={fillMaxTrade}>
              Max
            </button>
          </div>
          <button type="submit" disabled={isFetching}>
            Convert 50%
          </button>
        </form>
        {address && (
          <button
            type="button"
            onClick={() => refetch()}
            className={styles.refreshButton}
            disabled={isBusy}
          >
            {isFetching ? 'Syncing…' : 'Refresh Balances'}
          </button>
        )}
      </div>
    </section>
  );
};
