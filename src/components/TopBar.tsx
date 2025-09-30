import { ConnectButton } from '@rainbow-me/rainbowkit';
import styles from './TopBar.module.css';

export const TopBar = () => (
  <header className={styles.topBar}>
    <div className={styles.identity}>
      <h1>HashEquity Command Center</h1>
      <p>
        Strike the floating objects, harvest unminted HASH, and coordinate with the admin vault for the single daily mint.
      </p>
    </div>
    <ConnectButton />
  </header>
);
