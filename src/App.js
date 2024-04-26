
import "@solana/wallet-adapter-react-ui/styles.css";

import React, { useEffect, useMemo, useState } from 'react';
import './App.css';
import PlayCanvasApp from './components/PlayCanvasApp';
import { ConnectionProvider, WalletProvider, useWallet } from "@solana/wallet-adapter-react";
import { WalletDisconnectButton, WalletModalProvider, WalletMultiButton, useWalletModal } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter, } from "@solana/wallet-adapter-wallets";
import { SolanaMobileWalletAdapter, createDefaultAddressSelector, createDefaultAuthorizationResultCache, createDefaultWalletNotFoundHandler } from "@solana-mobile/wallet-adapter-mobile";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";


function App() {
  const endpoint = "https://red-late-lake.solana-mainnet.quiknode.pro/f88a154e7f97b1f789a0a1fd45c4ab48fa3f21ff/";
  const wallets = useMemo(() => [
    new PhantomWalletAdapter(),
    new SolanaMobileWalletAdapter({
      addressSelector: createDefaultAddressSelector(),
      appIdentity: {
          name: 'Cyberdogz: Survival',
          uri: 'https://game.cyberdogz.io',
          icon: 'relative/path/to/icon.png',
      },
      authorizationResultCache: createDefaultAuthorizationResultCache(),
      cluster: WalletAdapterNetwork.Mainnet,
      onWalletNotFound: createDefaultWalletNotFoundHandler(),
    })
  ], []);

  const wallet = useWallet();
  
  useEffect(() => {
    console.log(wallets);
  }, wallets);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect={true}>
        <WalletModalProvider>
          <PlayCanvasApp wallets={wallets} />
          {/* <WalletMultiButton /> */}
          {/* <WalletDisconnectButton /> */}
          {/* <Implementation1 /> */}
          {/* <Implementation2 /> */}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
    
    
  );
}

export default App;

// const WalletConnectionStatus = () => {
//   const mainWallet = useWallet();
//   return (
//     <p>{mainWallet.connected ? `Selected wallet: ${mainWallet.publicKey.toString()}` : "No wallet selected"}</p>
//   );
// };


// const OneClickButton = () => {
//   const wallet = useWallet();
//   const modal = useWalletModal();


//   useEffect(() => {
//     if (wallet.wallet) {
//       handleConnection();
//     }
//   }, [wallet.wallet]);

//   const handleOpenModal = () => {
//     if (!wallet.wallet) {
//       modal.setVisible(true);
//     } else {
//       handleConnection();
//     }
//   };

//   const handleConnection = async () => {
//     try {
//       await wallet.connect();
//     } catch (error) {
//       console.error("Failed to connect:", error);
//     }
//   };

//   return <button onClick={handleOpenModal}>One Click</button>
// }





// const Implementation2 = () => {
//   return (
//     <div>
//       {/* <WalletSelectionButton />
//       <WalletConnectButton /> */}
//       <OneClickButton />
//       <WalletConnectionStatus />
//     </div>
//   )
// }






































const Implementation1 = () => {
  const { select, connect, connecting, connected, publicKey, disconnect, wallet } = useWallet();

  // DISBLE ONLY ON MOBILE
  // useEffect(() => {
  //   if (wallet && !connected) {
  //     console.log("HAS WALLET, TRY TO CONNECT NOW")
  //     // Wallet is selected, attempt to connect.
  //     connect().catch((error) => {
  //       console.error('Error connecting to the wallet:', error);
  //     });
  //   } else {
  //     console.log("NO WALLET YET or maybe conneted naman na")
  //   }
  // }, [wallet, connect]);
  // END MOBILE

  const handleConnect = async () => {
    if (connected) {
      disconnect();
    } else {
      try {

        // DISBLE ONLY ON MOBILE
        //select('Phantom');
        // END MOBILE

        // ENABLE ONLY ON MOBILE
        connect().catch((error) => {
          console.error('Error connecting to the wallet:', error);
        });
        // END MOBILE

        console.log("handleConnect b")
      } catch (error) {
        console.error('Error selecting wallet:', error);
      }
    }
  };

  return (
    <div>
      {!connected ? (
        <button onClick={handleConnect} disabled={connecting}>
          Connect to Phantom Wallet
        </button>
      ) : (
        <div>Connected Address: {publicKey?.toBase58()}</div>
      )}
    </div>
  );
};
