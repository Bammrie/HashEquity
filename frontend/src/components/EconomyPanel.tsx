import { useEffect } from 'react';
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
        inventory: result.inventory,
      });
      tradeInForHash({ tradedAmount: result.tradedAmount, mintedAmount: result.mintedAmount });
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
        inventory: data.inventory,
      });
    }
  }, [data, syncBackendBalances]);

  useEffect(() => {
    if (error instanceof Error) {
      addEvent(`Failed to sync balances: ${error.message}`);
    }
  }, [error, addEvent]);

  const handleTradeAll = () => {
    if (!address) {
      addEvent('Connect a wallet before trading in unminted HASH.');
      return;
    }

    if (unminted <= 0) {
      addEvent('No unminted HASH available to trade.');
      return;
    }

    tradeMutation(Number(unminted.toFixed(10)));
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
        <button
          type="button"
          className={styles.tradeButton}
          onClick={handleTradeAll}
          disabled={isBusy || unminted <= 0}
        >
          Convert All Unminted HASH (50% payout)
        </button>
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
