'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function FinanceDashboard() {
  const router = useRouter();
  const [data, setData] = useState<{ balance: number; treasuryPublicKey: string; transactions: any[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [sellOrders, setSellOrders] = useState<any[]>([]);
  const [buyOrders, setBuyOrders] = useState<any[]>([]);
  const [kashCashouts, setKashCashouts] = useState<any[]>([]);
  const [cashoutReasons, setCashoutReasons] = useState<Record<string, string>>({});

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

    fetchFinanceData(userData.id);
    fetchPendingSellOrders(userData.id);
    fetchPendingBuyOrders(userData.id);
    fetchPendingKashCashouts(userData.id);
  }, [router]);

  useEffect(() => {
    const userRaw = localStorage.getItem('user');
    if (!userRaw) return;
    const userData = JSON.parse(userRaw);

    const wsUrl = process.env.NEXT_PUBLIC_REALTIME_WS_URL || 'ws://localhost:4001';
    const socket = new WebSocket(wsUrl);
    let refreshTimer: ReturnType<typeof setTimeout> | null = null;

    const triggerRefresh = () => {
      if (refreshTimer) clearTimeout(refreshTimer);
      refreshTimer = setTimeout(() => {
        fetchFinanceData(userData.id);
        fetchPendingSellOrders(userData.id);
        fetchPendingBuyOrders(userData.id);
        fetchPendingKashCashouts(userData.id);
      }, 200);
    };

    socket.addEventListener('message', triggerRefresh);
    socket.addEventListener('error', () => {
      // ignore realtime errors in UI
    });

    return () => {
      socket.removeEventListener('message', triggerRefresh);
      socket.close();
      if (refreshTimer) clearTimeout(refreshTimer);
    };
  }, []);

  const fetchFinanceData = async (userId: string) => {
    try {
      const res = await fetch('/api/finance', {
        headers: { 'x-user-id': userId },
      });
      const result = await res.json();
      setData(result);
    } catch (error) {
      console.error('Failed to fetch finance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingSellOrders = async (userId: string) => {
    try {
      const res = await fetch('/api/finance/sellOrders?pending=true', {
        headers: { 'x-user-id': userId },
      });
      const result = await res.json();
      setSellOrders(result.orders || []);
    } catch (error) {
      console.error('Failed to fetch sell orders:', error);
    }
  };

  const fetchPendingBuyOrders = async (userId: string) => {
    try {
      const res = await fetch('/api/finance/buyOrders?pending=true', {
        headers: { 'x-user-id': userId },
      });
      const result = await res.json();
      setBuyOrders(result.orders || []);
    } catch (error) {
      console.error('Failed to fetch buy orders:', error);
    }
  };

  const fetchPendingKashCashouts = async (userId: string) => {
    try {
      const res = await fetch('/api/finance/kashCashouts?pending=true', {
        headers: { 'x-user-id': userId },
      });
      const result = await res.json();
      if (!res.ok) {
        toast.error(result.error || 'Failed to load K-Kash cashouts');
        setKashCashouts([]);
        return;
      }
      setKashCashouts(result.cashouts || []);
    } catch (error) {
      console.error('Failed to fetch K-Kash cashouts:', error);
      toast.error('Failed to load K-Kash cashouts');
    }
  };

  const handleSellOrderAction = async (orderId: string, action: 'approve' | 'reject') => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    try {
      const res = await fetch('/api/finance/sellOrders', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': user.id,
        },
        body: JSON.stringify({ orderId, action }),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error);
        return;
      }

      toast.success(`Sell order ${action}d successfully!`);
      fetchPendingSellOrders(user.id);
      fetchFinanceData(user.id);
    } catch (error) {
      toast.error('Failed to process order');
    }
  };

  const handleBuyOrderAction = async (orderId: string, action: 'approve' | 'reject') => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    try {
      const res = await fetch('/api/finance/buyOrders', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': user.id,
        },
        body: JSON.stringify({ orderId, action }),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error);
        return;
      }

      toast.success(`Buy order ${action}d! Tokens transferred to user.`);
      fetchPendingBuyOrders(user.id);
      fetchFinanceData(user.id);
    } catch (error) {
      toast.error('Failed to process order');
    }
  };

  const handleKashCashoutAction = async (requestId: string, action: 'approve' | 'reject') => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const reason = cashoutReasons[requestId] || '';

    if (action === 'reject' && !reason.trim()) {
      toast.error('Rejection reason is required');
      return;
    }
    try {
      const res = await fetch('/api/finance/kashCashouts', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
        },
        body: JSON.stringify({ requestId, action, reason }),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error);
        return;
      }

      toast.success(`Cashout ${action}d successfully!`);
      fetchPendingKashCashouts(user.id);
      fetchFinanceData(user.id);
    } catch (error) {
      toast.error('Failed to process cashout');
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
      <h1 className="text-2xl font-display font-bold text-slate-100">Finance Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-slate-300 mb-2">Treasury Balance</h3>
          <p className="text-4xl font-bold text-amber-400">{data?.balance?.toLocaleString() || 0}</p>
          <p className="text-sm text-slate-500 mt-2">KOLI Tokens</p>
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold text-slate-300 mb-2">Treasury Wallet</h3>
          <p className="text-xs font-mono bg-surface-2 border border-surface-border p-2 rounded break-all text-slate-300">
            {data?.treasuryPublicKey || 'Loading...'}
          </p>
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold text-slate-300 mb-2">Pending Buy Orders</h3>
          <p className="text-4xl font-bold text-sky-400">{buyOrders.length}</p>
          <p className="text-sm text-slate-500 mt-2">PHP payments</p>
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold text-slate-300 mb-2">Pending Sell Orders</h3>
          <p className="text-4xl font-bold text-amber-400">{sellOrders.length}</p>
          <p className="text-sm text-slate-500 mt-2">Redemptions</p>
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold text-slate-300 mb-2">Pending K-Kash Cashouts</h3>
          <p className="text-4xl font-bold text-fuchsia-400">{kashCashouts.length}</p>
          <p className="text-sm text-slate-500 mt-2">Kash out requests</p>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-slate-300 mb-4">Pending K-Kash Cashouts</h3>
        {kashCashouts.length === 0 ? (
          <p className="text-slate-500 text-center py-8">No pending cashouts</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-surface-border">
              <thead className="bg-surface-2/60">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Channel</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Account</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Merchant</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Reason</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {kashCashouts.map((cashout) => (
                  <tr key={cashout.id} className="table-row-hover">
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="font-medium text-slate-200">{cashout.displayName || cashout.email}</div>
                      <div className="text-slate-500 text-xs">{cashout.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium">
                      {Number(cashout.amount || 0).toLocaleString()} KOLI
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="text-slate-200">{cashout.channelLabel}</div>
                      <div className="text-slate-500 text-xs">{cashout.channelType}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">
                      {cashout.accountNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {cashout.merchantName || '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <input
                        className="bg-surface-2 border border-surface-border rounded px-2 py-1 text-xs text-slate-200"
                        placeholder="Rejection reason"
                        value={cashoutReasons[cashout.id] || ''}
                        onChange={(event) =>
                          setCashoutReasons((prev) => ({ ...prev, [cashout.id]: event.target.value }))
                        }
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap space-x-2">
                      <button
                        onClick={() => handleKashCashoutAction(cashout.id, 'approve')}
                        className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded text-sm hover:bg-emerald-500/30"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleKashCashoutAction(cashout.id, 'reject')}
                        className="bg-red-500/20 text-red-400 px-3 py-1 rounded text-sm hover:bg-red-500/30"
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-slate-300 mb-4">Pending Buy Orders (PHP Payments)</h3>
        {buyOrders.length === 0 ? (
          <p className="text-slate-500 text-center py-8">No pending buy orders</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-surface-border">
              <thead className="bg-surface-2/60">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Amount (KOLI)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Payment</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Reference</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {buyOrders.map((order) => (
                  <tr key={order.id} className="table-row-hover">
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{order.user?.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium">{order.amount.toLocaleString()} KOLI</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{order.paymentMethod?.toUpperCase()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">{order.referenceNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap space-x-2">
                      <button
                        onClick={() => handleBuyOrderAction(order.id, 'approve')}
                        className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded text-sm hover:bg-emerald-500/30"
                      >
                        Approve & Send
                      </button>
                      <button
                        onClick={() => handleBuyOrderAction(order.id, 'reject')}
                        className="bg-red-500/20 text-red-400 px-3 py-1 rounded text-sm hover:bg-red-500/30"
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-slate-300 mb-4">Pending Sell Orders (Redemptions)</h3>
        {sellOrders.length === 0 ? (
          <p className="text-slate-500 text-center py-8">No pending sell orders</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-surface-border">
              <thead className="bg-surface-2/60">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Bank Details</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {sellOrders.map((order) => {
                  const bankDetails = JSON.parse(order.bankDetails || '{}');
                  return (
                    <tr key={order.id} className="table-row-hover">
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{order.user?.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium">{order.amount.toLocaleString()} KOLI</td>
                      <td className="px-6 py-4 text-sm">
                        <p>{bankDetails.bankName}</p>
                        <p className="text-slate-500">{bankDetails.accountNumber}</p>
                        <p className="text-slate-500">{bankDetails.accountName}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap space-x-2">
                        <button
                          onClick={() => handleSellOrderAction(order.id, 'approve')}
                          className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded text-sm hover:bg-emerald-500/30"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleSellOrderAction(order.id, 'reject')}
                          className="bg-red-500/20 text-red-400 px-3 py-1 rounded text-sm hover:bg-red-500/30"
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
