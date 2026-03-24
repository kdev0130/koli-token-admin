'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function BuyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    amount: '',
    paymentMethod: 'gcash',
    referenceNumber: '',
    notes: '',
  });

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      router.push('/login');
      return;
    }

    const userData = JSON.parse(user);
    fetchOrders(userData.id);
  }, [router]);

  const fetchOrders = async (userId: string) => {
    try {
      const res = await fetch('/api/buy', {
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
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/buy', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': user.id,
        },
        body: JSON.stringify({
          amount,
          paymentMethod: formData.paymentMethod,
          referenceNumber: formData.referenceNumber,
          notes: formData.notes,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error);
        return;
      }

      toast.success('Payment submitted! Waiting for approval.');
      setFormData({ amount: '', paymentMethod: 'gcash', referenceNumber: '', notes: '' });
      fetchOrders(user.id);
    } catch (error) {
      toast.error('Failed to submit payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-display font-bold text-slate-100">Buy KOLI Tokens</h1>

      <div className="card">
        <div className="bg-surface-2 border border-surface-border rounded-lg p-4 mb-6">
          <p className="text-sm text-slate-300">
            <strong>How it works:</strong> Transfer PHP to our payment channel, submit your payment details below, 
            and our team will verify and transfer KOLI tokens to your wallet.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Amount of KOLI to Buy
            </label>
            <input
              type="number"
              className="input-field"
              placeholder="Enter amount"
              min="1"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
            />
            <p className="text-sm text-slate-500 mt-1">
              ≈ ₱{formData.amount || 0} PHP (1 KOLI = 1 PHP)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Payment Method
            </label>
            <select
              className="input-field"
              value={formData.paymentMethod}
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
            >
              <option value="gcash">GCash</option>
              <option value="bank">Bank Transfer</option>
              <option value="paymaya">PayMaya</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Reference Number / Transaction ID
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="Enter reference number"
              value={formData.referenceNumber}
              onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Notes (Optional)
            </label>
            <textarea
              className="input-field"
              rows={2}
              placeholder="Any additional notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? 'Submitting...' : 'Submit Payment'}
          </button>
        </form>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-slate-200 mb-4">Your Buy Orders</h2>
        {orders.length === 0 ? (
          <p className="text-slate-500 text-center py-8">No buy orders yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-surface-border">
              <thead className="bg-surface-2/60">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Payment</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Reference</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {orders.map((order) => (
                  <tr key={order.id} className="table-row-hover">
                    <td className="px-6 py-4 whitespace-nowrap font-medium">{order.amount.toLocaleString()} KOLI</td>
                    <td className="px-6 py-4 whitespace-nowrap">{order.paymentMethod?.toUpperCase()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{order.referenceNumber}</td>
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
