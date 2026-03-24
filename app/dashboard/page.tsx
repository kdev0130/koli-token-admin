'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  const [wallet, setWallet] = useState<{ publicKey: string; balance: number } | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      router.push('/login');
      return;
    }

    const userData = JSON.parse(user);
    fetchWallet(userData.id);
    fetchTransactions(userData.id);
  }, [router]);

  const fetchWallet = async (userId: string) => {
    try {
      const res = await fetch('/api/wallet', {
        headers: { 'x-user-id': userId },
      });
      const data = await res.json();
      setWallet(data);
    } catch (error) {
      console.error('Failed to fetch wallet:', error);
    }
  };

  const fetchTransactions = async (userId: string) => {
    try {
      const res = await fetch('/api/transactions', {
        headers: { 'x-user-id': userId },
      });
      const data = await res.json();
      setTransactions(data.transactions || []);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
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
      <h1 className="text-2xl font-display font-bold text-slate-100">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-slate-300 mb-2">KOLI Balance</h3>
          <p className="text-4xl font-bold text-amber-400">{wallet?.balance?.toLocaleString() || 0}</p>
          <p className="text-sm text-slate-500 mt-2">≈ ₱{wallet?.balance?.toLocaleString() || 0} PHP</p>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-slate-300 mb-2">Wallet Address</h3>
          <p className="text-sm font-mono bg-surface-2 border border-surface-border p-2 rounded break-all text-slate-300">
            {wallet?.publicKey || 'Loading...'}
          </p>
          <p className="text-xs text-slate-500 mt-2">Share this address to receive KOLI tokens</p>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-slate-300 mb-4">Recent Transactions</h3>
        {transactions.length === 0 ? (
          <p className="text-slate-500 text-center py-8">No transactions yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-surface-border">
              <thead className="bg-surface-2/60">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="table-row-hover">
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{tx.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{Math.floor(tx.amount / 1e9).toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        tx.status === 'COMPLETED' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {new Date(tx.createdAt).toLocaleDateString()}
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
