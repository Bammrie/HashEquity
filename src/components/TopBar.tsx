import { ConnectButton } from '@rainbow-me/rainbowkit';
import styles from './TopBar.module.css';

export const TopBar = () => (
  <header className={styles.topBar}>
    <div>
      <h1>HashEquity Operations Console</h1>
      <p>Track vault health, run mints, and trigger bonuses in the core loop.</p>
    </div>
    <ConnectButton />
  </header>
);
