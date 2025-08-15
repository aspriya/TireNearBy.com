"use client";
import { useState } from 'react';
import Link from 'next/link';

export default function RegisterShopPage() {
  const [form, setForm] = useState({ name: '', address: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [created, setCreated] = useState(null);

  async function submit(e) {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      const res = await fetch('/api/shops', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setCreated(data.shop);
    } catch (e) { setError(e.message); } finally { setLoading(false); }
  }

  return (
  <div className="max-w-md mx-auto p-6 space-y-6">
  <Link href="/shops" className="text-xs text-zinc-600 hover:text-zinc-800">← Back to shops</Link>
        <h1 className="text-2xl font-bold tracking-tight">Register Shop</h1>
        <form onSubmit={submit} className="space-y-4">
        {['name','address','phone'].map(f => (
          <div key={f} className="flex flex-col gap-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-zinc-700">{f}</label>
            <input required value={form[f]} onChange={e=>setForm({...form,[f]:e.target.value})} className="px-3 py-2 rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white text-zinc-900 placeholder-zinc-400" />
          </div>
        ))}
        <button disabled={loading} className="w-full py-3 rounded-lg bg-emerald-600 text-white font-medium disabled:opacity-50">{loading ? 'Creating...' : 'Create Shop'}</button>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          {created && <p className="text-emerald-600 text-sm">Created shop #{created.id.slice(0,6)}</p>}
        </form>
  </div>
  );
}
