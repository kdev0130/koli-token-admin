'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function SellPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState(0);
  const [orders, setOrders] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    amount: '',
    bankName: '',
    accountNumber: '',
    accountName: '',
  });

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      router.push('/login');
      return;
    }

    const userData = JSON.parse(user);
    fetchWallet(userData.id);
    fetchOrders(userData.id);
  }, [router]);

  const fetchWallet = async (userId: string) => {
    try {
      const res = await fetch('/api/wallet', {
        headers: { 'x-user-id': userId },
      });
      const data = await res.json();
      setBalance(data.balance || 0);
    } catch (error) {
      console.error('Failed to fetch wallet:', error);
    }
  };

  const fetchOrders = async (userId: string) => {
    try {
      const res = await fetch('/api/sell', {
        headers: { 'x-user-id': userId },
      });
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const amount = parseInt(formData.amount);
    if (amount > balance) {
      toast.error('Insufficient balance');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/sell', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': user.id,
        },
        body: JSON.stringify({
          amount,
          bankName: formData.bankName,
          accountNumber: formData.accountNumber,
          accountName: formData.accountName,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error);
        return;
      }

      toast.success('Sell order created!');
      setFormData({ amount: '', bankName: '', accountNumber: '', accountName: '' });
      fetchOrders(user.id);
      fetchWallet(user.id);
    } catch (error) {
      toast.error('Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-display font-bold text-slate-100">Sell KOLI</h1>

      <div className="card">
        <p className="text-sm text-slate-500">Available Balance</p>
        <p className="text-3xl font-bold text-amber-400">{balance.toLocaleString()} KOLI</p>
        <p className="text-sm text-slate-500 mt-1">≈ ₱{balance.toLocaleString()} PHP</p>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-slate-200 mb-4">Create Sell Order</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Amount (KOLI)
            </label>
            <input
              type="number"
              className="input-field"
              placeholder="Enter amount to sell"
              min="1"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Bank Name
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g., BDO"
                value={formData.bankName}
                onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Account Number
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="Enter account number"
                value={formData.accountNumber}
                onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Account Name
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="Enter account name"
              value={formData.accountName}
              onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? 'Processing...' : 'Create Sell Order'}
          </button>
        </form>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-slate-200 mb-4">Your Sell Orders</h2>
        {orders.length === 0 ? (
          <p className="text-slate-500 text-center py-8">No sell orders yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-surface-border">
              <thead className="bg-surface-2/60">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {orders.map((order) => (
                  <tr key={order.id} className="table-row-hover">
                    <td className="px-6 py-4 whitespace-nowrap font-medium">{order.amount.toLocaleString()} KOLI</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        order.status === 'PENDING' ? 'bg-amber-500/15 text-amber-400' :
                        order.status === 'APPROVED' ? 'bg-emerald-500/15 text-emerald-400' :
                        'bg-red-500/15 text-red-400'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {new Date(order.createdAt).toLocaleDateString()}
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
