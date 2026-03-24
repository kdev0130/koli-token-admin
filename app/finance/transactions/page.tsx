'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function FinanceTransactions() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<any[]>([]);
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

    fetchTransactions(userData.id);
  }, [router]);

  const fetchTransactions = async (userId: string) => {
    try {
      const res = await fetch('/api/finance', {
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
      <h1 className="text-2xl font-display font-bold text-slate-100">All Transactions</h1>

      <div className="card">
        {transactions.length === 0 ? (
          <p className="text-slate-500 text-center py-8">No transactions yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-surface-border">
              <thead className="bg-surface-2/60">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Tx Hash</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">From</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">To</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="table-row-hover">
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-mono">{tx.txHash.slice(0, 8)}...</td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-mono">{tx.fromWallet?.slice(0, 8)}...</td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-mono">{tx.toWallet?.slice(0, 8)}...</td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium">{tx.amount.toLocaleString()}</td>
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
