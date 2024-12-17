import React from 'react';
import styles from "../styles/Home.module.css";

interface ConnectWalletButtonProps {
    onClick: React.MouseEventHandler<HTMLButtonElement>;
}

const ConnectWalletButton: React.FC<ConnectWalletButtonProps> = ({ onClick }) => {
    return (
        <button onClick={onClick} className={styles.metamaskButton}>
            Connect Wallet
        </button>
    );
};

export default ConnectWalletButton;