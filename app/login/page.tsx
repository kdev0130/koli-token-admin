'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error);
        return;
      }

      document.cookie = `user=${encodeURIComponent(JSON.stringify(data.user))}; path=/; max-age=86400`;
      localStorage.setItem('user', JSON.stringify(data.user));
      toast.success('Login successful!');
      
      if (data.user.role === 'FINANCE') {
        router.push('/finance');
      } else {
        router.push('/dashboard');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface py-12 px-4">
      <div className="fixed inset-0 bg-grid-pattern bg-grid opacity-30 pointer-events-none" aria-hidden="true" />
      <div className="fixed inset-0 bg-amber-glow pointer-events-none" aria-hidden="true" />
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-display font-bold text-amber-400">KOLI</h1>
          <p className="text-slate-500 mt-2">Closed-loop Payment Token</p>
        </div>

        <div className="card relative z-10">
          <h2 className="text-2xl font-semibold mb-6 text-slate-100">Sign In</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Email
              </label>
              <input
                type="email"
                className="input-field"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Password
              </label>
              <input
                type="password"
                className="input-field"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="mt-4 text-center text-slate-500">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-amber-400 hover:underline">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
