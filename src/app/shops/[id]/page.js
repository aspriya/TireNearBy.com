import { getShop } from '@/lib/data';

export default function ShopDetail({ params }) {
  const shop = getShop(params.id);
  if (!shop) {
    return (
      <div className="max-w-3xl mx-auto py-12">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-800">Shop Not Found</h1>
        <p className="mt-4 text-sm text-zinc-500">The shop you are looking for does not exist or was removed.</p>
      </div>
    );
  }
  return (
    <div className="max-w-3xl mx-auto py-12 space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-800">{shop.name}</h1>
        <p className="text-sm text-zinc-500">{shop.address}</p>
        <p className="text-xs text-zinc-400">{shop.phone}</p>
      </header>
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-600">Inventory</h2>
        {shop.tires.length === 0 && <p className="text-xs text-zinc-500">No tires listed.</p>}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {shop.tires.map(t => (
            <div key={t.id} className="rounded-lg border border-zinc-200 bg-white p-4 text-xs flex flex-col gap-1 hover:border-emerald-300 transition">
              <div className="font-medium text-zinc-800">{t.brand} {t.model}</div>
              <div className="text-zinc-500">{t.size}</div>
              <div className="text-zinc-400">Code: {t.code}</div>
              <div className="mt-1 flex justify-between text-zinc-600">
                <span>${t.price}</span>
                <span className="text-zinc-500">Qty {t.quantity}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
