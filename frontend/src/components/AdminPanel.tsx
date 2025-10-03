import { useEffect, useMemo, useState } from 'react';
import { useAccount, useSignMessage } from 'wagmi';
import { useQuery } from '@tanstack/react-query';

import { adminConfig, isAdminWallet } from '../config/admin';
import { fetchAdminOverview } from '../services/adminApi';
import { walletLogin } from '../services/authApi';
import styles from './AdminPanel.module.css';

const LOGIN_MESSAGE = 'Login to HashEquity';

const formatHashAmount = (value: number) =>
  value.toLocaleString(undefined, {
    minimumFractionDigits: 8,
    maximumFractionDigits: 8,
  });

export const AdminPanel = () => {
  const { address, isConnected } = useAccount();
  const isAllowlisted = useMemo(() => isAdminWallet(address ?? ''), [address]);
  const [token, setToken] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [lastWallet, setLastWallet] = useState<string | null>(null);

  const {
    signMessageAsync,
    isPending: isSigning,
  } = useSignMessage();

  useEffect(() => {
    if (!address || address === lastWallet) {
      return;
    }
    setToken(null);
    setAuthError(null);
    setLastWallet(address);
  }, [address, lastWallet]);

  useEffect(() => {
    if (!isConnected) {
      setToken(null);
      setAuthError(null);
      setLastWallet(null);
    }
  }, [isConnected]);

  const {
    data,
    isFetching,
    error,
    refetch,
  } = useQuery({
    queryKey: ['admin-overview', token],
    queryFn: () => fetchAdminOverview(token ?? ''),
    enabled: Boolean(token),
    refetchInterval: 60_000,
    retry: false,
  });

  useEffect(() => {
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      if (message.includes('invalid token') || message.includes('admin access required')) {
        setToken(null);
        setAuthError(error.message);
      }
    }
  }, [error]);

  const handleAuthenticate = async () => {
    if (!address) {
      return;
    }
    try {
      setAuthError(null);
      const signature = await signMessageAsync({ message: LOGIN_MESSAGE });
      const response = await walletLogin({
        walletAddress: address,
        signature,
      });

      if (!response.isAdmin) {
        setToken(null);
        setAuthError('Wallet is not authorized for admin access.');
        return;
      }

      setToken(response.token);
      setAuthError(null);
    } catch (err) {
      if (err instanceof Error) {
        setAuthError(err.message);
      } else {
        setAuthError('Unable to authenticate wallet.');
      }
    }
  };

  let body: JSX.Element;

  if (!isConnected || !address) {
    body = <p className={styles.notice}>Connect a wallet to unlock admin telemetry.</p>;
  } else if (!token) {
    body = (
      <div className={styles.actions}>
        <p>Sign the login message below to view live user balances.</p>
        {!isAllowlisted && (
          <p className={styles.noticeWarning}>
            This wallet is not currently on the configured allowlist. Continue to authenticate if
            backend settings were updated.
          </p>
        )}
        <button type="button" onClick={handleAuthenticate} disabled={isSigning}>
          {isSigning ? 'Waiting for signature…' : 'Authenticate Admin Wallet'}
        </button>
        {authError && <p className={styles.error}>{authError}</p>}
        {!isAllowlisted && adminConfig.wallets.length > 0 && (
          <p className={styles.allowlist}>Allowlisted wallets: {adminConfig.wallets.join(', ')}</p>
        )}
      </div>
    );
  } else {
    body = (
      <div className={styles.dashboard}>
        <header className={styles.summaryHeader}>
          <div>
            <h3>Player Accounts</h3>
            <p>Balances are refreshed every 60 seconds.</p>
          </div>
          <button type="button" onClick={() => refetch()} disabled={isFetching}>
            {isFetching ? 'Refreshing…' : 'Refresh Now'}
          </button>
        </header>
        {authError && <p className={styles.error}>{authError}</p>}
        {error instanceof Error && <p className={styles.error}>{error.message}</p>}
        {data ? (
          <>
            <dl className={styles.metrics}>
              <div>
                <dt>Total Players</dt>
                <dd>{data.summary.totalPlayers}</dd>
              </div>
              <div>
                <dt>Total HASH</dt>
                <dd>{formatHashAmount(data.summary.hashBalanceTotal)}</dd>
              </div>
              <div>
                <dt>Total Unminted HASH</dt>
                <dd>{formatHashAmount(data.summary.unmintedHashTotal)}</dd>
              </div>
            </dl>
            <p className={styles.generatedAt}>
              Snapshot generated at {new Date(data.summary.generatedAt).toLocaleTimeString()}.
            </p>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col">Wallet</th>
                  <th scope="col">HASH</th>
                  <th scope="col">Unminted</th>
                  <th scope="col">Status</th>
                  <th scope="col">Updated</th>
                </tr>
              </thead>
              <tbody>
                {data.topUsers.length ? (
                  data.topUsers.map((user) => (
                    <tr key={user.walletAddress}>
                      <td className={styles.wallet}>{user.walletAddress}</td>
                      <td>{formatHashAmount(user.hashBalance)}</td>
                      <td>{formatHashAmount(user.unmintedHash)}</td>
                      <td>{user.isAdmin ? 'Admin' : 'Player'}</td>
                      <td>{new Date(user.updatedAt).toLocaleString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className={styles.empty}>No player balances recorded yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </>
        ) : (
          <p className={styles.notice}>Loading admin telemetry…</p>
        )}
      </div>
    );
  }

  return (
    <section className={styles.panel}>
      <header className={styles.header}>
        <h2>Admin Wallet Overview</h2>
        <p>Restricted telemetry for operations and economy monitoring.</p>
      </header>
      {body}
    </section>
  );
};

