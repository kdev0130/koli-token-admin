import { Connection, Keypair, Transaction, PublicKey } from '@solana/web3.js';
import { 
  getAssociatedTokenAddress,
  getAccount,
  createTransferInstruction, 
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
  createBurnInstruction,
  getOrCreateAssociatedTokenAccount,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID
} from '@solana/spl-token';
import { PrismaClient } from '@prisma/client';
import { getKeypairFromWallet } from './walletService';

const prisma = new PrismaClient();

const SOLANA_RPC = process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';
const TREASURY_PUBLIC_KEY = process.env.TREASURY_PUBLIC_KEY || '';
const MINT_PUBLIC_KEY = process.env.MINT_PUBLIC_KEY || '';

const connection = new Connection(SOLANA_RPC, 'confirmed');

export function getTreasuryKeypair(): Keypair | null {
  const treasuryPrivateKey = process.env.TREASURY_PRIVATE_KEY;
  if (!treasuryPrivateKey) return null;

  try {
    const decoded = Buffer.from(treasuryPrivateKey, 'base64').toString();
    const keyArray = JSON.parse(decoded);
    return Keypair.fromSecretKey(Uint8Array.from(keyArray));
  } catch {
    return null;
  }
}

export async function transferTokensWithKeypair(
  fromKeypair: Keypair,
  toPublicKey: string,
  amount: number,
  feePayerKeypair?: Keypair | null
): Promise<{ success: boolean; txHash?: string; error?: string }> {
  try {
    const mint = new PublicKey(MINT_PUBLIC_KEY);
    const fromWallet = fromKeypair.publicKey;
    const toWallet = new PublicKey(toPublicKey);
    const payer = feePayerKeypair ?? fromKeypair;

    const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      payer,
      mint,
      fromWallet
    );

    if (fromTokenAccount.amount < BigInt(amount)) {
      return { success: false, error: 'Insufficient balance' };
    }

    const toTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      payer,
      mint,
      toWallet
    );

    const transaction = new Transaction();
    transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    transaction.feePayer = payer.publicKey;
    transaction.add(
      createTransferInstruction(
        fromTokenAccount.address,
        toTokenAccount.address,
        fromWallet,
        amount
      )
    );

    const signers = payer.publicKey.equals(fromKeypair.publicKey)
      ? [fromKeypair]
      : [fromKeypair, payer];

    const txHash = await connection.sendTransaction(transaction, signers);
    await connection.confirmTransaction(txHash);

    await prisma.transaction.create({
      data: {
        txHash,
        fromWallet: fromWallet.toBase58(),
        toWallet: toPublicKey,
        amount,
        status: 'COMPLETED',
      },
    });

    return { success: true, txHash };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getTokenBalance(walletPublicKey: string): Promise<number> {
  try {
    const mint = new PublicKey(MINT_PUBLIC_KEY);
    const wallet = new PublicKey(walletPublicKey);
    const tokenAccount = await getAssociatedTokenAddress(mint, wallet);
    const account = await getAccount(connection, tokenAccount);
    return Number(account.amount);
  } catch (error) {
    return 0;
  }
}

export async function transferTokens(
  fromPublicKey: string,
  toPublicKey: string,
  amount: number
): Promise<{ success: boolean; txHash?: string; error?: string }> {
  console.log('=== Transfer Tokens ===');
  console.log('From:', fromPublicKey);
  console.log('To:', toPublicKey);
  console.log('Amount (lamports):', amount);
  
  try {
    const fromKeypair = await getKeypairFromWallet(fromPublicKey);
    if (!fromKeypair) {
      return { success: false, error: 'Sender wallet not found' };
    }

    const mint = new PublicKey(MINT_PUBLIC_KEY);
    const fromWallet = new PublicKey(fromPublicKey);
    const toWallet = new PublicKey(toPublicKey);

    console.log('Getting sender token account...');
    const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      fromKeypair,
      mint,
      fromWallet
    );
    console.log('Sender token account:', fromTokenAccount.address.toBase58());
    console.log('Sender balance:', fromTokenAccount.amount.toString());

    if (fromTokenAccount.amount < BigInt(amount)) {
      return { success: false, error: `Insufficient balance. Have: ${fromTokenAccount.amount}, Need: ${amount}` };
    }

    console.log('Getting receiver token account...');
    
    // For treasury transfers, we need special handling
    let toTokenAccount;
    if (toPublicKey === TREASURY_PUBLIC_KEY) {
      // Use treasury keypair for treasury token account
      const treasuryPrivateKey = process.env.TREASURY_PRIVATE_KEY;
      if (treasuryPrivateKey) {
        const decoded = Buffer.from(treasuryPrivateKey, 'base64').toString();
        const keyArray = JSON.parse(decoded);
        const treasuryKeypair = Keypair.fromSecretKey(Uint8Array.from(keyArray));
        
        toTokenAccount = await getOrCreateAssociatedTokenAccount(
          connection,
          treasuryKeypair,
          mint,
          toWallet
        );
      } else {
        toTokenAccount = await getOrCreateAssociatedTokenAccount(
          connection,
          fromKeypair,
          mint,
          toWallet
        );
      }
    } else {
      // Normal user-to-user transfer
      toTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        fromKeypair,
        mint,
        toWallet
      );
    }
    
    console.log('Receiver token account:', toTokenAccount.address.toBase58());

    console.log('Creating transfer transaction...');
    const transaction = new Transaction();
    transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    transaction.add(
      createTransferInstruction(
        fromTokenAccount.address,
        toTokenAccount.address,
        fromKeypair.publicKey,
        amount
      )
    );

    console.log('Sending transaction...');
    const txHash = await connection.sendTransaction(transaction, [fromKeypair]);
    console.log('Transaction sent:', txHash);
    
    await connection.confirmTransaction(txHash);
    console.log('Transaction confirmed!');

    await prisma.transaction.create({
      data: {
        txHash,
        fromWallet: fromPublicKey,
        toWallet: toPublicKey,
        amount,
        status: 'COMPLETED',
      },
    });

    return { success: true, txHash };
  } catch (error: any) {
    console.log('Transfer error:', error.message);
    return { success: false, error: error.message };
  }
}

export async function transferToTreasury(
  fromPublicKey: string,
  amount: number
): Promise<{ success: boolean; txHash?: string; error?: string }> {
  console.log('=== Transfer TO Treasury ===');
  console.log('From:', fromPublicKey);
  console.log('Amount (lamports):', amount);
  
  return transferTokens(fromPublicKey, TREASURY_PUBLIC_KEY, amount);
}

export async function transferFromTreasury(
  toPublicKey: string,
  amount: number
): Promise<{ success: boolean; txHash?: string; error?: string }> {
  console.log('=== Transfer FROM Treasury ===');
  console.log('To:', toPublicKey);
  console.log('Amount (lamports):', amount);
  
  try {
    const treasuryPrivateKey = process.env.TREASURY_PRIVATE_KEY;
    const treasuryPublicKey = process.env.TREASURY_PUBLIC_KEY;

    if (!treasuryPrivateKey || !treasuryPublicKey) {
      return { success: false, error: 'Treasury not configured' };
    }

    const decoded = Buffer.from(treasuryPrivateKey, 'base64').toString();
    const keyArray = JSON.parse(decoded);
    const treasuryKeypair = Keypair.fromSecretKey(Uint8Array.from(keyArray));

    const mint = new PublicKey(MINT_PUBLIC_KEY);
    const treasury = new PublicKey(treasuryPublicKey);
    const toWallet = new PublicKey(toPublicKey);

    console.log('Getting treasury token account...');
    const treasuryTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      treasuryKeypair,
      mint,
      treasury
    );
    console.log('Treasury balance:', treasuryTokenAccount.amount.toString());

    if (treasuryTokenAccount.amount < BigInt(amount)) {
      return { success: false, error: `Treasury has insufficient balance` };
    }

    console.log('Getting receiver token account...');
    const toTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      treasuryKeypair,
      mint,
      toWallet
    );

    const transaction = new Transaction();
    transaction.add(
      createTransferInstruction(
        treasuryTokenAccount.address,
        toTokenAccount.address,
        treasuryKeypair.publicKey,
        amount
      )
    );

    const txHash = await connection.sendTransaction(transaction, [treasuryKeypair]);
    await connection.confirmTransaction(txHash);

    await prisma.transaction.create({
      data: {
        txHash,
        fromWallet: treasuryPublicKey,
        toWallet: toPublicKey,
        amount,
        status: 'COMPLETED',
      },
    });

    return { success: true, txHash };
  } catch (error: any) {
    console.log('Transfer from treasury error:', error.message);
    return { success: false, error: error.message };
  }
}

export async function mintTokensToTreasury(amount: number): Promise<{ success: boolean; txHash?: string; error?: string }> {
  console.log('=== Mint Tokens to Treasury ===');
  console.log('Amount:', amount);
  
  try {
    const mintAddress = process.env.MINT_PUBLIC_KEY;
    const treasuryAddress = process.env.TREASURY_PUBLIC_KEY;
    const treasuryPrivateKey = process.env.TREASURY_PRIVATE_KEY;

    if (!mintAddress || !treasuryAddress || !treasuryPrivateKey) {
      return { success: false, error: 'Token not configured' };
    }

    const decoded = Buffer.from(treasuryPrivateKey, 'base64').toString();
    const keyArray = JSON.parse(decoded);
    const treasuryKeypair = Keypair.fromSecretKey(Uint8Array.from(keyArray));

    const mint = new PublicKey(mintAddress);
    const treasury = new PublicKey(treasuryAddress);

    const treasuryTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      treasuryKeypair,
      mint,
      treasury
    );

    const transaction = new Transaction();
    transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    transaction.add(
      createMintToInstruction(
        mint,
        treasuryTokenAccount.address,
        treasury,
        amount
      )
    );

    const txHash = await connection.sendTransaction(transaction, [treasuryKeypair]);
    await connection.confirmTransaction(txHash);

    return { success: true, txHash };
  } catch (error: any) {
    console.log('Mint error:', error.message);
    return { success: false, error: error.message };
  }
}

export async function burnTokens(
  fromPublicKey: string,
  amount: number
): Promise<{ success: boolean; txHash?: string; error?: string }> {
  try {
    const fromKeypair = await getKeypairFromWallet(fromPublicKey);
    if (!fromKeypair) {
      return { success: false, error: 'Wallet not found' };
    }

    const mint = new PublicKey(MINT_PUBLIC_KEY);
    const fromWallet = new PublicKey(fromPublicKey);

    const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      fromKeypair,
      mint,
      fromWallet
    );

    const transaction = new Transaction();
    transaction.add(
      createBurnInstruction(
        fromTokenAccount.address,
        mint,
        fromWallet,
        amount
      )
    );

    const txHash = await connection.sendTransaction(transaction, [fromKeypair]);
    await connection.confirmTransaction(txHash);

    return { success: true, txHash };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getTreasuryBalance(): Promise<number> {
  const treasuryAddress = process.env.TREASURY_PUBLIC_KEY;
  const mintAddress = process.env.MINT_PUBLIC_KEY;
  
  if (!treasuryAddress || !mintAddress) {
    return 0;
  }
  
  return getTokenBalance(treasuryAddress);
}
