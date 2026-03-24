'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type KashUser = {
  id: string;
  firebaseUid: string;
  email: string;
  displayName: string | null;
  walletPublicKey: string;
  balance: number;
  status: string;
  createdAt: string;
  lastLoginAt: string | null;
};

type KashTransaction = {
  id: string;
  kashAccountId: string;
  userEmail: string;
  userName: string;
  walletPublicKey: string;
  txHash?: string | null;
  reference?: string | null;
  direction: string;
  type: string;
  sourceApp?: string | null;
  amount: number;
  balanceAfter: number;
  status: string;
  createdAt: string;
};

type KashResponse = {
  summary: {
    totalUsers: number;
    totalTransactions: number;
    totalUserBalance: number;
    treasuryBalance: number;
  };
  users: KashUser[];
  transactions: KashTransaction[];
};

export default function KashFinancePage() {
  const router = useRouter();
  const [data, setData] = useState<KashResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      router.push('/login');
      return;
    }

    const userData = JSON.parse(user);
    if (userData.role !== 'FINANCE') {
      router.push('/dashboard');
      return;
    }

    fetchKashData(userData.id);
  }, [router]);

  const fetchKashData = async (userId: string) => {
    try {
      const res = await fetch('/api/finance/kash', {
        headers: { 'x-user-id': userId },
      });
      const result = (await res.json()) as KashResponse;
      setData(result);
    } catch (error) {
      console.error('Failed to fetch K-Kash data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-slate-100">K-Kash Monitor</h1>
        <p className="text-sm text-slate-500 mt-1">Monitor linked K-Kash users, wallet balances, and treasury-backed credits.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-slate-300 mb-2">K-Kash Users</h3>
          <p className="text-4xl font-bold text-fuchsia-400">{data?.summary?.totalUsers ?? 0}</p>
          <p className="text-sm text-slate-500 mt-2">Linked accounts</p>
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold text-slate-300 mb-2">User Balances</h3>
          <p className="text-4xl font-bold text-emerald-400">{Math.floor(data?.summary?.totalUserBalance ?? 0).toLocaleString()}</p>
          <p className="text-sm text-slate-500 mt-2">KOLI across K-Kash</p>
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold text-slate-300 mb-2">Treasury Balance</h3>
          <p className="text-4xl font-bold text-amber-400">{Math.floor(data?.summary?.treasuryBalance ?? 0).toLocaleString()}</p>
          <p className="text-sm text-slate-500 mt-2">Available reserve</p>
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold text-slate-300 mb-2">K-Kash Transfers</h3>
          <p className="text-4xl font-bold text-sky-400">{data?.summary?.totalTransactions ?? 0}</p>
          <p className="text-sm text-slate-500 mt-2">Recent recorded entries</p>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-slate-300 mb-4">K-Kash Users</h3>
        {!data?.users?.length ? (
          <p className="text-slate-500 text-center py-8">No K-Kash users yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-surface-border">
              <thead className="bg-surface-2/60">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Firebase UID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Wallet</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Balance</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Last Login</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {(data?.users ?? []).map((user: KashUser) => (
                  <tr key={user.id} className="table-row-hover">
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="font-medium text-slate-200">{user.displayName || user.email}</div>
                      <div className="text-slate-500">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-slate-400">{user.firebaseUid.slice(0, 10)}...</td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-slate-400">{user.walletPublicKey.slice(0, 8)}...</td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-emerald-400">{Math.floor(user.balance).toLocaleString()} KOLI</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-slate-300 mb-4">Recent K-Kash Transactions</h3>
        {!data?.transactions?.length ? (
          <p className="text-slate-500 text-center py-8">No K-Kash transactions yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-surface-border">
              <thead className="bg-surface-2/60">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Balance After</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Tx Hash</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {(data?.transactions ?? []).map((transaction: KashTransaction) => (
                  <tr key={transaction.id} className="table-row-hover">
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="font-medium text-slate-200">{transaction.userName}</div>
                      <div className="text-slate-500">{transaction.userEmail}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                      {transaction.type}
                      <div className="text-xs text-slate-500">{transaction.sourceApp || transaction.direction}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-amber-400">{Math.floor(transaction.amount).toLocaleString()} KOLI</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-emerald-400">{Math.floor(transaction.balanceAfter || 0).toLocaleString()} KOLI</td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-slate-400">
                      {transaction.txHash ? `${transaction.txHash.slice(0, 10)}...` : '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {new Date(transaction.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
