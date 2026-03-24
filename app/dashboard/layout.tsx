'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

interface UserData {
  id: string;
  email: string;
  role: string;
}

export default function DashboardLayout({ 
  children
}: { 
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = document.cookie.split('; ').find(row => row.startsWith('user='));
    if (!stored) {
      router.push('/login');
      return;
    }
    
    const userData: UserData = JSON.parse(decodeURIComponent(stored.split('=')[1]));
    
    setUser(userData);
    setLoading(false);
  }, [router]);

  const handleLogout = useCallback(() => {
    document.cookie = 'user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    router.push('/login');
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (!user) return null;

  const isFinance = user.role === 'FINANCE';
  
  const userNavItems = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/dashboard/transfer', label: 'Transfer' },
    { href: '/dashboard/buy', label: 'Buy KOLI' },
    { href: '/dashboard/sell', label: 'Sell KOLI' },
  ];

  const financeNavItems = [
    { href: '/finance', label: 'Dashboard' },
    { href: '/finance/transactions', label: 'Transactions' },
    { href: '/finance/mint', label: 'Mint Tokens' },
  ];

  const navItems = isFinance ? financeNavItems : userNavItems;

  return (
    <div className="min-h-screen bg-surface text-slate-200">
      <div className="fixed inset-0 bg-grid-pattern bg-grid opacity-30 pointer-events-none" aria-hidden="true" />
      <div className="fixed inset-0 bg-amber-glow pointer-events-none" aria-hidden="true" />

      <aside className="fixed left-0 top-0 h-full w-64 bg-surface-1 border-r border-surface-border z-40">
        <div className="px-6 py-5 border-b border-surface-border">
          <Link href={isFinance ? '/finance' : '/dashboard'} className="font-display font-bold text-xl text-amber-400">
            KOLI
          </Link>
          <p className="text-xs text-slate-500 mt-1">User Console</p>
        </div>

        <nav className="px-3 py-4 space-y-1">
          <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-widest text-slate-600 font-display">
            Navigation
          </p>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-3 py-2.5 rounded-lg text-sm border transition-colors ${
                pathname === item.href
                  ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                  : 'text-slate-400 border-transparent hover:bg-surface-2 hover:text-slate-200'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 px-3 py-4 border-t border-surface-border">
          <p className="px-3 text-xs text-slate-500 truncate mb-2">{user.email}</p>
          <button onClick={handleLogout} className="btn-secondary w-full text-sm">
            Logout
          </button>
        </div>
      </aside>

      <div className="pl-64 relative">
        <header className="h-16 bg-surface-1/80 backdrop-blur-sm border-b border-surface-border sticky top-0 z-30 px-6 flex items-center justify-between">
          <div>
            <h1 className="font-display text-lg text-slate-100">Dashboard</h1>
            <p className="text-xs text-slate-500">Wallet, transfers and orders</p>
          </div>
          <span className="text-xs text-slate-600">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </header>

        <main className="p-6 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
