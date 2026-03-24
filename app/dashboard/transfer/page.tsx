'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function TransferPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState(0);
  const [formData, setFormData] = useState({ toPublicKey: '', amount: '' });

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      router.push('/login');
      return;
    }

    const userData = JSON.parse(user);
    fetchWallet(userData.id);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!formData.toPublicKey || !formData.amount) {
      toast.error('Please fill in all fields');
      return;
    }

    const amount = parseInt(formData.amount);
    if (amount > balance) {
      toast.error('Insufficient balance');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/transfer', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': user.id,
        },
        body: JSON.stringify({
          toPublicKey: formData.toPublicKey,
          amount,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error);
        return;
      }

      toast.success('Transfer successful!');
      setFormData({ toPublicKey: '', amount: '' });
      fetchWallet(user.id);
    } catch (error) {
      toast.error('Transfer failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-display font-bold text-slate-100 mb-6">Transfer KOLI</h1>

      <div className="card mb-6">
        <p className="text-sm text-slate-500">Available Balance</p>
        <p className="text-3xl font-bold text-amber-400">{balance.toLocaleString()} KOLI</p>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Recipient Wallet Address
            </label>
            <input
              type="text"
              className="input-field font-mono text-sm"
              placeholder="Enter recipient's wallet address"
              value={formData.toPublicKey}
              onChange={(e) => setFormData({ ...formData, toPublicKey: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Amount (KOLI)
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
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? 'Processing...' : 'Transfer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
