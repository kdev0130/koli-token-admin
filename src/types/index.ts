export interface User {
  id: string;
  email: string;
  role: 'USER' | 'FINANCE';
  createdAt: Date;
  updatedAt: Date;
}

export interface Wallet {
  id: string;
  userId: string;
  publicKey: string;
  encryptedPrivateKey: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  id: string;
  txHash: string;
  fromWalletId?: string;
  toWalletId?: string;
  fromWallet?: string;
  toWallet?: string;
  amount: number;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  type: 'TRANSFER' | 'MINT' | 'BURN';
  createdAt: Date;
  updatedAt: Date;
}

export interface SellOrder {
  id: string;
  userId: string;
  amount: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  bankDetails: string;
  approvedBy?: string;
  createdAt: Date;
  updatedAt: Date;
  user?: User;
}

export interface BankDetails {
  bankName: string;
  accountNumber: string;
  accountName: string;
}

export interface ApiResponse<T = any> {
  success?: boolean;
  error?: string;
  data?: T;
}

export interface WalletInfo {
  publicKey: string;
  balance: number;
}

export interface TransferRequest {
  toPublicKey: string;
  amount: number;
}

export interface SellOrderRequest {
  amount: number;
  bankName: string;
  accountNumber: string;
  accountName: string;
}

export interface FinanceData {
  balance: number;
  treasuryPublicKey: string;
  transactions: Transaction[];
}
