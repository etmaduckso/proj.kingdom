import {
  ConnectEmbed,
  useAddress,
  useSDK,
  useShowConnectEmbed,
  useUser,
  useWallet,
  useMetamask,
} from "@thirdweb-dev/react";
import React, { useEffect, useState, useCallback } from "react"; // Import useCallback
import styles from "../styles/Home.module.css";
import { useRouter } from "next/router";
import { getUser } from "./api/auth/[...thirdweb]";
import { LORD_CONTRACT_ADDRESS } from "../constants/contracts";
import LoadingAnimation from "../components/LoadingAnimator";
import ConnectWalletButton from '../components/ConnectWalletButton';
import Image from 'next/image'; // Importe o componente Image do Next.js

const logingOptional = false;

const Login = () => {
  const showConnectedEmbed = useShowConnectEmbed();
  const { isLoggedIn, isLoading } = useUser();
  const router = useRouter();
  const wallet = useWallet();
  const address = useAddress();
  const sdk = useSDK();
  const connectWithMetamask = useMetamask();
  const [loadingLordStatus, setLoadingLordStatus] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  // Use useCallback para memoizar a função checkNewPlayer
  const checkNewPlayer = useCallback(async () => {
      try {
          if (address && sdk) {
              setLoadingLordStatus(true);
              setLoadingMessage("Checking lord balance...");

              const lordContract = await sdk.getContract(LORD_CONTRACT_ADDRESS);
              const lordBalance = await lordContract.erc721.balanceOf(address);

              if (lordBalance.toNumber() === 0) {
                  setLoadingMessage("No worker found...");
                  try {
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
                  } catch (error) {
                      console.error(error); // Use console.error para erros
                  } finally {
                      setLoadingMessage("");
                      router.push("/marketplace");
                  }
              } else {
                  setLoadingMessage("");
                  router.push("/marketplace");
              }
          } else {
              alert("Wallet address or SDK is not available");
          }
      } catch (error) {
          console.error(error);
      }
  }, [address, sdk, router]); // Adicione as dependências corretas

  useEffect(() => {
      if (isLoggedIn && !isLoading) {
          checkNewPlayer();
      }
  }, [isLoggedIn, isLoading, checkNewPlayer]); // Adicione checkNewPlayer como dependência

  if (loadingLordStatus) {
      return (
          <div className={styles.loading_titled_container}>
              <h1 className="">{loadingMessage}</h1>
              <LoadingAnimation />
          </div>
      );
  }

  const handleMetamaskLogin = async (event) => {
      event.preventDefault();
      try {
          await connectWithMetamask();
      } catch (error) {
          console.error("Erro ao conectar com Metamask:", error);
          // Aqui você pode exibir uma mensagem de erro amigável para o usuário.
      }
  };

  return (
      <div className={styles.container}>
          <div className={styles.headers_login}>
              <Image src="/images/logo.png" alt="Logo" width={200} height={50} /> {/* Use o componente Image */}
              <h1 className="">Crafting Kingdoms</h1>
          </div>
          <div className={styles.loginOptions}>
              {showConnectedEmbed && (
                  <ConnectEmbed
                      auth={{
                          loginOptional: logingOptional,
                      }}
                  />
              )}
              <ConnectWalletButton onClick={handleMetamaskLogin} />
          </div>
      </div>
  );
};

export default Login;

// ... getServerSideProps (este código está correto)
