import { NextRequest, NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { connectToDatabase, prisma } from '@/utils/db';
import { getTreasuryBalance } from '@/services/tokenService';
import { requireFinanceUser } from '@/utils/financeGuard';
import { TOKEN_DECIMALS } from '@/services/kashService';

type KashTransactionWithAccount = Prisma.KashTransactionGetPayload<{ include: { account: true } }>;

function toDisplayAmount(rawAmount: bigint | number | null | undefined) {
  if (rawAmount === null || rawAmount === undefined) return 0;
  return Number(typeof rawAmount === 'bigint' ? Number(rawAmount) / TOKEN_DECIMALS : rawAmount / TOKEN_DECIMALS);
}

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    await requireFinanceUser(request);

    const [accounts, transactions, treasuryRawBalance] = await Promise.all([
      prisma.kashAccount.findMany({
        orderBy: [{ createdAt: 'desc' }],
      }),
      prisma.kashTransaction.findMany({
        include: {
          account: true,
        },
        orderBy: [{ createdAt: 'desc' }],
        take: 200,
      }),
      getTreasuryBalance(),
    ]);

    const users = accounts.map((account) => ({
      id: account.id,
      firebaseUid: account.firebaseUid,
      email: account.email,
      displayName: account.displayName,
      walletPublicKey: account.walletPublicKey,
      balance: toDisplayAmount(account.balanceSnapshot),
      status: account.status,
      createdAt: account.createdAt,
      lastLoginAt: account.lastLoginAt,
    }));

    const serializedTransactions = (transactions as KashTransactionWithAccount[]).map((transaction) => ({
      id: transaction.id,
      kashAccountId: transaction.kashAccountId,
      userEmail: transaction.account.email,
      userName: transaction.account.displayName || transaction.account.email,
      walletPublicKey: transaction.account.walletPublicKey,
      txHash: transaction.txHash,
      reference: transaction.reference,
      direction: transaction.direction,
      type: transaction.type,
      sourceApp: transaction.sourceApp,
      amount: toDisplayAmount(transaction.amount),
      balanceAfter: toDisplayAmount(transaction.balanceAfter),
      status: transaction.status,
      metadata: transaction.metadata,
      createdAt: transaction.createdAt,
    }));

    const totalUserBalance = users.reduce((sum: number, account) => sum + account.balance, 0);

    return NextResponse.json({
      summary: {
        totalUsers: users.length,
        totalTransactions: serializedTransactions.length,
        totalUserBalance,
        treasuryBalance: Math.floor(treasuryRawBalance / TOKEN_DECIMALS),
      },
      users,
      transactions: serializedTransactions,
    });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ error: error.message || 'Failed to load K-Kash finance data' }, { status: 500 });
  }
}
