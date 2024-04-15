import React, { useMemo, createContext, useContext } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { getAssociatedTokenAddress, createTransferInstruction, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import {
  Connection,
  PublicKey,
  Transaction,
  sendAndConfirmTransaction,
} from '@solana/web3.js';

const WalletContext = createContext(null);

export const useWalletContext = () => useContext(WalletContext);

function OverlayComponent({ children }) {
  const endpoint = "https://red-late-lake.solana-mainnet.quiknode.pro/f88a154e7f97b1f789a0a1fd45c4ab48fa3f21ff/";
  //const connection = new Connection(endpoint, 'confirmed');
  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);

  const transferToken = async (wallet, toWalletAddress, tokenMintAddress, amount) => {
    const connection = new Connection(endpoint, 'finalized');
  
    // Get the associated token addresses for the sender and receiver
    const fromTokenAccount = await getAssociatedTokenAddress(tokenMintAddress, wallet.publicKey);
    const toTokenAccount = await getAssociatedTokenAddress(tokenMintAddress, toWalletAddress);
  
    // Create the transfer instruction
    const transferInstruction = createTransferInstruction(
      fromTokenAccount,
      toTokenAccount,
      wallet.publicKey,
      amount,
      [],
      TOKEN_PROGRAM_ID
    );
  
    // Create a transaction
    let transaction = new Transaction().add(transferInstruction);
  
    // Fetch the latest blockhash
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = wallet.publicKey;
  
    // Have the wallet sign the transaction
    const signedTransaction = await wallet.signTransaction(transaction);
  
    // Send the transaction
    const rawTransaction = signedTransaction.serialize();
    const signature = await connection.sendRawTransaction(rawTransaction, {
      skipPreflight: false,
      preflightCommitment: "finalized",
    });
  
    console.log("Transaction successful with signature:", signature);
  };
  

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <WalletContext.Provider value={{ transferToken }}>
            {children}
          </WalletContext.Provider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default OverlayComponent;