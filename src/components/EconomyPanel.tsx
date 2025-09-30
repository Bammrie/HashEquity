import { FormEvent, useEffect, useState } from 'react';
import { useGameStore } from '../state/gameStore';
import styles from './EconomyPanel.module.css';

const formatCountdown = (target: number): string => {
  const diff = target - Date.now();
  if (diff <= 0) {
    return 'Mint window open';
  }
  const totalSeconds = Math.floor(diff / 1000);
  const hours = Math.floor(totalSeconds / 3600)
    .toString()
    .padStart(2, '0');
  const minutes = Math.floor((totalSeconds % 3600) / 60)
    .toString()
    .padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
};

export const EconomyPanel = () => {
  const { hash, unminted } = useGameStore((state) => state.balances);
  const admin = useGameStore((state) => state.admin);
  const tradeInForHash = useGameStore((state) => state.tradeInForHash);
  const attemptAdminLogin = useGameStore((state) => state.attemptAdminLogin);
  const logoutAdmin = useGameStore((state) => state.logoutAdmin);
  const runScheduledMint = useGameStore((state) => state.runScheduledMint);
  const [tradeAmount, setTradeAmount] = useState('0.00000000');
  const [passcode, setPasscode] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [countdown, setCountdown] = useState(() => formatCountdown(admin.nextMintTimestamp));

  useEffect(() => {
    const interval = window.setInterval(() => {
      setCountdown(formatCountdown(admin.nextMintTimestamp));
    }, 1000);
    return () => window.clearInterval(interval);
  }, [admin.nextMintTimestamp]);

  const handleTradeSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const amount = Number(tradeAmount);
    if (Number.isNaN(amount)) {
      return;
    }
    tradeInForHash(Number(amount.toFixed(10)));
  };

  const handleLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const success = attemptAdminLogin(passcode.trim());
    setLoginError(!success);
    if (success) {
      setPasscode('');
    }
  };

  const canRunMint = admin.isLoggedIn && Date.now() >= admin.nextMintTimestamp && unminted > 0;

  return (
    <section className={styles.panel}>
      <header>
        <h2>Economy</h2>
        <p>
          HASH is minted once per day at 00:00 UTC. Only the site admin can trigger settlement; players may trade with the vault at
          a 2:1 rate to avoid the wait.
        </p>
      </header>
      <dl className={styles.metrics}>
        <div>
          <dt>Player HASH</dt>
          <dd>{hash.toFixed(10)}</dd>
        </div>
        <div>
          <dt>Player Unminted</dt>
          <dd>{unminted.toFixed(10)}</dd>
        </div>
        <div>
          <dt>Admin HASH Reserve</dt>
          <dd>{admin.hashReserve.toFixed(10)}</dd>
        </div>
        <div>
          <dt>Admin Unminted Bank</dt>
          <dd>{admin.unmintedBank.toFixed(10)}</dd>
        </div>
      </dl>

      <div className={styles.mintWindow}>
        <h3>Daily Mint Window</h3>
        <p className={countdown === 'Mint window open' ? styles.mintOpen : ''}>{countdown}</p>
        <p className={styles.mintHint}>Next settlement unlocks when the timer reaches zero.</p>
        <button type="button" onClick={runScheduledMint} disabled={!canRunMint}>
          {admin.isLoggedIn ? 'Settle Daily Mint' : 'Admin Access Required'}
        </button>
      </div>

      <form onSubmit={handleTradeSubmit} className={styles.tradeForm}>
        <label htmlFor="trade-amount">Trade Unminted for HASH (2:1)</label>
        <div className={styles.tradeInputs}>
          <input
            id="trade-amount"
            name="trade-amount"
            type="number"
            step="0.00000001"
            min="0"
            value={tradeAmount}
            onChange={(event) => setTradeAmount(event.target.value)}
          />
          <button type="submit">Swap with Admin</button>
        </div>
      </form>

      <div className={styles.adminGate}>
        <h3>Admin Vault Control</h3>
        {admin.isLoggedIn ? (
          <div className={styles.adminStatus}>
            <p>You are logged in as the vault admin. Minting and trade reserves are under your control.</p>
            <button type="button" onClick={logoutAdmin} className={styles.secondaryButton}>
              Sign Out
            </button>
          </div>
        ) : (
          <form onSubmit={handleLogin} className={styles.loginForm}>
            <label htmlFor="admin-passcode">Admin Passcode</label>
            <input
              id="admin-passcode"
              name="admin-passcode"
              type="password"
              value={passcode}
              onChange={(event) => setPasscode(event.target.value)}
              placeholder="Enter secure passcode"
            />
            <button type="submit" className={styles.secondaryButton}>
              Unlock Vault Controls
            </button>
            {loginError ? <p className={styles.error}>Access denied. Passcode incorrect.</p> : <p>Only the site owner can unlock vault access.</p>}
          </form>
        )}
      </div>
    </section>
  );
};
