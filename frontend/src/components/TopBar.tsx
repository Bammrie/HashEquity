import { ConnectButton } from '@rainbow-me/rainbowkit';
import logo from '../../images/logo.svg';
import styles from './TopBar.module.css';

export const TopBar = () => (
  <header className={styles.topBar}>
    <div className={styles.branding}>
      <img src={logo} alt="HashEquity" className={styles.logo} />
      <div className={styles.headline}>
        <span className={styles.tag}>Live Alpha</span>
        <h1>HashEquity Command Center</h1>
        <p>Gamified mint control — launch mini-games, route HASH, and watch the vault pulse.</p>
      </div>
    </div>
    <div className={styles.actions}>
      <div className={styles.status}>
        <span>Season Zero</span>
        <strong>Mint Online</strong>
      </div>
      <ConnectButton />
    </div>
  </header>
);
