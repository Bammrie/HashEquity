import { ConnectButton } from '@rainbow-me/rainbowkit';
import logo from '../assets/branding/Logo.png';
import styles from './TopBar.module.css';

export const TopBar = () => (
  <header className={styles.topBar}>
    <a className={styles.brand} href="#top">
      <span className={styles.logoWrap}>
        <img src={logo} alt="HashEquity" />
      </span>
      <div>
        <strong>HashEquity</strong>
        <span>Web3 destruction economy</span>
      </div>
    </a>
    <nav className={styles.links} aria-label="Primary">
      <a href="#play">Play</a>
      <a href="#economy">Economy</a>
      <a href="#intel">Intel feed</a>
    </nav>
    <ConnectButton chainStatus="icon" showBalance={false} />
  </header>
);
