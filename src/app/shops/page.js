import { listShops } from '@/lib/data';
import Link from 'next/link';


export const dynamic = 'force-dynamic';

export default function ShopsPage() {
  const shops = listShops();
  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto space-y-6 p-6">
      <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Registered Shops</h1>
          <Link href="/shops/register" className="inline-block text-sm px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">Register Shop</Link>
        </div>
        <ul className="space-y-4">
        {shops.map(s => (
          <li key={s.id} className="p-4 rounded-xl border border-zinc-200 bg-white flex flex-col gap-2 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between"><h2 className="font-semibold text-zinc-800">{s.name}</h2><span className="text-xs text-zinc-500">{s.tires.length} tires</span></div>
            <div className="text-xs text-zinc-600 space-y-1 leading-relaxed">
              <div>{s.address}</div>
              <div>{s.phone}</div>
            </div>
            {s.tires.length > 0 && (
              <div className="pt-2 border-t border-zinc-100 grid gap-1 text-xs">
                {s.tires.map(t => <div key={t.id} className="flex justify-between"><span>{t.brand} {t.model} {t.size}</span><span className="font-medium">${t.price}</span></div>)}
              </div>
            )}
          </li>
        ))}
    </ul>
  </div>
  );
}
