import {
    ConnectWallet,
    useAddress,
    useSDK,
    useUser,
    useWallet,
    useMetamask,
} from "@thirdweb-dev/react";
import React, { useEffect, useState, useCallback } from 'react';
import styles from "../styles/Home.module.css";
import { useRouter } from "next/router";
import { getUser } from "./api/auth/[...thirdweb]";
import { LORD_CONTRACT_ADDRESS } from "../constants/contracts";
import LoadingAnimation from "../components/LoadingAnimator";
import Image from 'next/image';

const Login = () => {
    const { isLoggedIn, isLoading } = useUser();
    const router = useRouter();
    const address = useAddress();
    const sdk = useSDK();
    const wallet = useWallet();
    const connectMetamask = useMetamask();
    const [loadingLordStatus, setLoadingLordStatus] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("");

    const handleDisconnect = useCallback(async () => {
        if (wallet) {
            try {
                await wallet.disconnect();
                console.log("Wallet desconectada.");
            } catch (error) {
                console.error("Erro ao desconectar a carteira:", error);
            }
        }
    }, [wallet]);

    const handleConnectWallet = async () => {
        try {
            await connectMetamask();
        } catch (error) {
            console.error("Erro ao conectar com a carteira:", error);
        }
    };

    useEffect(() => {
        handleDisconnect();
    }, [handleDisconnect]);

    useEffect(() => {
        const checkNewPlayer = async () => {
            if (address && sdk) {
                try {
                    setLoadingLordStatus(true);
                    setLoadingMessage("Checking lord balance...");

                    const lordContract = await sdk.getContract(LORD_CONTRACT_ADDRESS);
                    const lordBalance = await lordContract.erc721.balanceOf(address);

                    if (lordBalance.toNumber() === 0) {
                        setLoadingMessage("No worker found...");
                        setLoadingMessage("Minting new lord and tokens...");
                        const response = await fetch("/api/claimTokens", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({ address }),
                        });

                        const data = await response.json();
                        if (!response.ok) {
                            throw new Error(data.message);
                        }

                        setLoadingMessage("Lord and tokens claimed...");
                    }
                    router.push("/marketplace");
                } catch (error) {
                    console.error("Erro ao verificar/criar jogador:", error);
                    setLoadingMessage("Erro ao verificar/criar jogador.");
                } finally {
                    setLoadingLordStatus(false);
                    setLoadingMessage("");
                }
            }
        };

        if (isLoggedIn && !isLoading) {
            checkNewPlayer();
        }
    }, [isLoggedIn, isLoading, address, sdk, router]);

    if (loadingLordStatus) {
        return (
            <div className={styles.loading_titled_container}>
                <h1 className="">{loadingMessage}</h1>
                <LoadingAnimation />
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.headers_login}>
                 <Image src="/images/logo.png" alt="Logo" width={200} height={50} />
                <h1 className="">Crafting Kingdoms</h1>
            </div>
            <div className={styles.loginOptions}>
                {address && (
                    <div className={styles.addressDisplay}>
                        Conectado com: {address}
                    </div>
                )}
                {!address && (
                    <button onClick={handleConnectWallet} className={styles.connectWalletButton}>
                        Connect Wallet
                    </button>
                  )}
            </div>
        </div>
    );
};

export default Login;

export async function getServerSideProps(context: any) {
    const user = await getUser(context.req);

    if (user) {
        return {
            redirect: {
                destination: "/marketplace",
                permanent: false,
            },
        };
    }

    return {
        props: {},
    };
}