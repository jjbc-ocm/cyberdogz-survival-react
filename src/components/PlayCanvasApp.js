import React, { forwardRef, useEffect, useMemo, useRef, useState } from 'react';
import OverlayComponent, { useWalletContext } from './OverlayComponent';
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection, LAMPORTS_PER_SOL, PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, createTransferCheckedInstruction, getAssociatedTokenAddress } from '@solana/spl-token';
import { PhantomWalletAdapter, PhantomWalletName } from '@solana/wallet-adapter-wallets';
import { WalletDisconnectButton, WalletModalProvider, WalletMultiButton, useWalletModal } from '@solana/wallet-adapter-react-ui';

const PlayCanvasApp = forwardRef((wallets, props) => {
  const endpoint = "https://red-late-lake.solana-mainnet.quiknode.pro/f88a154e7f97b1f789a0a1fd45c4ab48fa3f21ff/";

  const iframeRef = useRef(null);
  const [isInitialized, setInitialized] = useState(false);
  const [isOpenSelectWalletModal, setOpenSelectWalletModal] = useState(false);

  const wallet = useWallet();
  const modal = useWalletModal();

  useEffect(() => {
    if (!isInitialized) {
      wallet.disconnect();
      // wallet.wallet = null;
      setInitialized(true);
    }
    
  }, [isInitialized]); 

  // Called when publicKey value has been updated
  useEffect(() => {
    if (wallet.publicKey) {
      console.log('CONNECTED', wallet.publicKey.toString());
      sendMessageToPlayCanvas('login_success', wallet.publicKey.toString());
    }
  }, [wallet.publicKey]);

  useEffect(() => {
    console.log('heeet', wallet.connected)
}, [wallet.connected]);

useEffect(() => {
  console.log('walllet', wallet.wallet)
}, [wallet.wallet]);


  // Called when player is done selecting a target wallet
  useEffect(() => {
    const connectWallet = async () => {
      setOpenSelectWalletModal(false);
      try {
        await wallet.connect();
      } catch (error) {
        console.log(wallet.wallet);
        console.error(error);
        sendMessageToPlayCanvas('login_failed', 'error');
      }
    };
    if (isOpenSelectWalletModal && wallet.wallet && wallet.wallet.readyState === "Installed") {
      console.log('Attempting to connect wallet ', wallet.wallet);
      connectWallet();
    }
  }, [wallet.wallet, isOpenSelectWalletModal]);

  // Handle all message received from playcanvas
  useEffect(() => {
    const handleReceiveMessage = event => {
      if (event.data.type === 'login') {
        openSelectWalletModal();
      }

      if (event.data.type === 'pay_token') {
        payToken(event.data.payload);
      }
    };
    window.addEventListener('message', handleReceiveMessage);
    return () => {
      window.removeEventListener('message', handleReceiveMessage);
    };
  }, []);
  


  const openSelectWalletModal = () => {
    setOpenSelectWalletModal(true);
    modal.setVisible(true);
  };

  const sendMessageToPlayCanvas = (type, payload) => {
    const iframe = iframeRef.current;
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage({ type: type, payload: payload }, '*');
    }
  };







  // const payToken = async (amount) => {console.log(typeof wallet.publicKey.equals);
  //   try {
  //     const fromWalletAddress = wallet.publicKey;
  //     const toWalletAddress = new PublicKey('F6CZz6P3qAQgjF9Sdt138yK8gthmd9d9RUAhmsufhHq2');
  //     const tokenMintAddress = new PublicKey('G4USAGAtyEfW6B5abRRNHnvn1x2Vhcxhfvdv2h3m24iW');
  //     const connection = new Connection(endpoint, 'confirmed');
    
  //     // Get the associated token addresses for the sender and receiver
  //     // console.log(wallet, toWalletAddressStr, amount);
  //     const fromTokenAccount = await getAssociatedTokenAddress(tokenMintAddress, fromWalletAddress);
  //     const toTokenAccount = await getAssociatedTokenAddress(tokenMintAddress, toWalletAddress);
    
  //     // Create the transfer instruction
  //     const transferInstruction = createTransferCheckedInstruction(
  //       fromTokenAccount,
  //       toTokenAccount,
  //       fromWalletAddress,
  //       amount * LAMPORTS_PER_SOL,
  //       [],
  //       TOKEN_PROGRAM_ID
  //     );
    
  //     // Create a transaction
  //     let transaction = new Transaction().add(transferInstruction);
    
  //     // Fetch the latest blockhash
  //     const { blockhash } = await connection.getLatestBlockhash();
  //     transaction.recentBlockhash = blockhash;
  //     transaction.feePayer = fromWalletAddress;

  //     console.log(transaction);
    
  //     // Have the wallet sign the transaction
  //     const signedTransaction = await wallet.signTransaction(transaction);
    
  //     // Send the transaction
  //     const rawTransaction = signedTransaction.serialize();
  //     const signature = await connection.sendRawTransaction(rawTransaction, {
  //       skipPreflight: false,
  //       preflightCommitment: "finalized",
  //     });
    
  //     console.log("Transaction successful with signature:", signature);

  //     sendMessageToPlayCanvas('pay_success', signature);
  //   } catch (error) {
  //     console.error("Error during signing:", error);
  //     if (error instanceof Error) {
  //       console.error("Error message:", error.message);
  //       console.error("Error stack:", error.stack);
  //     }
  //     sendMessageToPlayCanvas('pay_failed', 'error');
  //   }
  // };




  const payToken = async (amount) => {
    try {
      const fromWalletAddress = wallet.publicKey;
      const toWalletAddress = new PublicKey('F6CZz6P3qAQgjF9Sdt138yK8gthmd9d9RUAhmsufhHq2');
      const tokenMintAddress = new PublicKey('G4USAGAtyEfW6B5abRRNHnvn1x2Vhcxhfvdv2h3m24iW');
      const connection = new Connection(endpoint, 'confirmed');
      
      const fromTokenAccount = await getAssociatedTokenAddress(tokenMintAddress, fromWalletAddress);
      const toTokenAccount = await getAssociatedTokenAddress(tokenMintAddress, toWalletAddress);

      const latestBlockhash = await connection.getLatestBlockhash();
      
      const transaction = new Transaction();
      transaction.feePayer = fromWalletAddress;
      transaction.recentBlockhash = latestBlockhash.blockhash;

      const keys = [
        { pubkey: fromTokenAccount, isSigner: false, isWritable: true },
        { pubkey: toTokenAccount, isSigner: false, isWritable: true },
        { pubkey: fromWalletAddress, isSigner: true, isWritable: false }
      ];

      const buffer = new ArrayBuffer(9);
      const view = new DataView(buffer);
      view.setUint8(0, 3);
      const totalLamports = amount * LAMPORTS_PER_SOL;
      if (Number.isSafeInteger(totalLamports)) {
        const high = (totalLamports / 2**32) | 0;
        const low = totalLamports & 0xFFFFFFFF;
        view.setUint32(1, low, true);   // Set low part
        view.setUint32(5, high, true);  // Set high part
      }

      const transferInstruction = new TransactionInstruction({
        keys: keys,
        programId: TOKEN_PROGRAM_ID,
        data: new Uint8Array(buffer)
      });

      transaction.add(transferInstruction);

      // Have the wallet sign the transaction
      const signedTransaction = await wallet.signTransaction(transaction);
    
      // Send the transaction
      const rawTransaction = signedTransaction.serialize();
      const signature = await connection.sendRawTransaction(rawTransaction);

      const strategy = {
        commitment: 'confirmed',
        confirmations: 1 // This can be adjusted based on how many confirmations you consider sufficient
      };

      const confirmation = await connection.confirmTransaction({signature, strategy});
    
      console.log("Transaction successful with signature:", signature);

      sendMessageToPlayCanvas('pay_success', signature);
    } catch (error) {
      console.error("Error during signing:", error);
      if (error instanceof Error) {
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
      }
      sendMessageToPlayCanvas('pay_failed', 'error');
    }
  };


  const fetchAndLogBalance = async () => {
    // Create a new connection to the Solana blockchain.
    const connection = new Connection(endpoint, 'confirmed');
    
    // Convert the public key string to a PublicKey object.
    const publicKey = wallet.publicKey;
    
    try {
      // Fetch the balance.
      const balance = await connection.getBalance(publicKey);
      
      // Log the balance.
      console.log(`Balance is ${balance} lamports (${balance / 1e9} SOL)`);
    } catch (error) {
      // If there's an error, log it.
      console.error('Error fetching balance:', error);
    }
  }




  











  return (
    <div className='App'>
      <iframe ref={iframeRef} src="/playcanvas/index.html" style={{ width: '100%', height: '100vh' }} frameBorder="0"></iframe>
      <button onClick={() => payToken(1)}>TEST PAY</button>
      <button onClick={() => fetchAndLogBalance()}>SEE TOKEN</button>
      </div>
    // <WalletContext.Provider value={{ transferToken }}>
    // </WalletContext.Provider>
  );
});

export default PlayCanvasApp;


