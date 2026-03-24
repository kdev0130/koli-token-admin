'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function FinanceMint() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState('');

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
  }, [router]);

  const handleMint = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const mintAmount = parseInt(amount);
    if (!mintAmount || mintAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/finance', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': user.id,
        },
        body: JSON.stringify({ amount: mintAmount }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error);
        return;
      }

      toast.success('Tokens minted successfully!');
      setAmount('');
    } catch (error) {
      toast.error('Minting failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-display font-bold text-slate-100 mb-6">Mint KOLI Tokens</h1>

      <div className="card">
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 mb-6">
          <p className="text-sm text-amber-300">
            <strong>Warning:</strong> Only mint tokens when necessary. All minted tokens will be added to the treasury wallet.
          </p>
        </div>

        <form onSubmit={handleMint} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Amount to Mint (KOLI)
            </label>
            <input
              type="number"
              className="input-field"
              placeholder="Enter amount"
              min="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? 'Minting...' : 'Mint Tokens'}
          </button>
        </form>
      </div>

      <div className="card mt-6">
        <h2 className="text-lg font-semibold text-slate-200 mb-4">Token Information</h2>
        <div className="space-y-2 text-sm text-slate-300">
          <p><strong>Token Name:</strong> KOLI</p>
          <p><strong>Total Supply:</strong> 1,500,000,000</p>
          <p><strong>Value:</strong> 1 KOLI = 1 PHP</p>
          <p><strong>Type:</strong> Closed-loop (non-tradable)</p>
        </div>
      </div>
    </div>
  );
}
