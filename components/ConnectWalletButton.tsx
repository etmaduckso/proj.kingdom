// components/ConnectWalletButton.tsx
import React from 'react';
import styles from "../styles/Home.module.css";

const ConnectWalletButton = ({ onClick }) => {
  return (
    <button onClick={onClick} className={styles.metamaskButton}>
      Connect Wallet
    </button>
  );
};

export default ConnectWalletButton;