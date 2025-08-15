"use client";
import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import Link from 'next/link';

const CameraClient = dynamic(() => import('../components/CameraCapture'), { ssr: false, loading: () => <div className="animate-pulse h-48 rounded-xl bg-zinc-200" /> });

export default function Home() {
  const [showScanner, setShowScanner] = useState(false);
  const [showNearby, setShowNearby] = useState(false);
  const [geoError, setGeoError] = useState(null);
  const [coords, setCoords] = useState(null);
  const [shops, setShops] = useState([]);

  // When we toggle showNearby, attempt geolocation once
  useEffect(() => {
    if (!showNearby) return;
    if (!navigator.geolocation) {
      setGeoError('Geolocation not supported');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const position = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setCoords(position);
      },
      (err) => setGeoError(err.message || 'Location denied'),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, [showNearby]);

  // Fetch shops (currently no geo filtering server-side; simulate ordering by name) when coords set or toggle on
  useEffect(() => {
    if (!showNearby) return;
    (async () => {
      try {
        const res = await fetch('/api/shops');
        const data = await res.json();
        let list = Array.isArray(data) ? data : [];
        // Sort by name temporarily; later by distance once backend provides
        list = list.sort((a,b)=>a.name.localeCompare(b.name)).slice(0,20);
        setShops(list);
      } catch (e) {
        setGeoError(e.message);
      }
    })();
  }, [showNearby, coords]);
  return (
    <div className="flex flex-col gap-16">
      {/* Full-bleed hero */}
      <section className="relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] overflow-hidden">
        <div className="relative flex flex-col items-center text-center px-6 md:px-10 pt-24 pb-24 md:pt-32 md:pb-32">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_15%,rgba(16,185,129,0.18),transparent_60%),radial-gradient(circle_at_70%_40%,rgba(124,58,237,0.12),transparent_65%),linear-gradient(to_bottom,rgba(255,255,255,0.55),transparent_45%)]" aria-hidden />
          <div className="relative max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/80 backdrop-blur px-4 py-1.5 ring-1 ring-emerald-400/30 shadow-sm text-[11px] font-medium tracking-wide text-emerald-700 uppercase">TireNearBy Intelligence</div>
            <h1 className="mt-7 text-4xl md:text-6xl font-bold leading-tight tracking-tight text-zinc-900">
              Your AI co‑pilot for <span className="bg-gradient-to-r from-emerald-600 via-violet-600 to-amber-500 bg-clip-text text-transparent">any tire problem</span>
            </h1>
            <p className="mt-6 text-base md:text-lg leading-relaxed text-zinc-600 max-w-2xl mx-auto">
              Scan a sidewall → instantly know the size & spec → contact nearby shops with confidence.
            </p>
            <ul className="mt-8 flex flex-wrap justify-center gap-2 text-[12px] font-medium text-zinc-600">
              {['Decode size codes fast','Be prepared before you call','Find trusted local shops','From slow wear to sudden flats'].map(b=> (
                <li key={b} className="inline-flex items-center gap-1 rounded-full bg-white/75 backdrop-blur px-4 py-1 ring-1 ring-zinc-200 hover:ring-emerald-400/40 transition"> 
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-emerald-600"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>{b}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-24 pointer-events-none bg-gradient-to-b from-transparent to-white" />
      </section>

      {/* Action cards & dynamic sections */}
      <section className="flex flex-col gap-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl mx-auto">
          <div className="rounded-xl border border-amber-200/70 bg-amber-50/70 p-4 flex flex-col gap-3 shadow-sm">
            <button onClick={()=>setShowScanner(s=>!s)} className="group inline-flex items-center justify-center gap-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium px-4 py-2 shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="opacity-90"><path d="M4 7V5a1 1 0 0 1 1-1h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M20 7V5a1 1 0 0 0-1-1h-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M4 17v2a1 1 0 0 0 1 1h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M20 17v2a1 1 0 0 1-1 1h-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><rect x="7" y="8" width="10" height="8" rx="2" stroke="currentColor" strokeWidth="2"/><path d="M10 12h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              {showScanner ? 'Hide Scanner' : 'Scan a Tire'}
            </button>
            <p className="text-[11px] leading-relaxed text-amber-800/80">{showScanner ? 'Scanner opened below – capture the tire sidewall.' : 'Tap to open your camera & aim at the tire sidewall code.'}</p>
          </div>
          <div className="rounded-xl border border-violet-200/70 bg-violet-50/70 p-4 flex flex-col gap-3 shadow-sm">
            <button onClick={()=>setShowNearby(s=>!s)} className="inline-flex items-center justify-center gap-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium px-4 py-2 shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 11h18M5 7h14l1 4-8 10-8-10 1-4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              {showNearby ? 'Hide Nearby' : 'Nearby Shops'}
            </button>
            <p className="text-[11px] leading-relaxed text-violet-800/80">Browse registered shops & compare inventory.</p>
          </div>
        </div>

        {showScanner && (
          <div className="w-full max-w-2xl mx-auto">
            <div className="relative group">
              <div className="absolute -inset-0.5 rounded-2xl bg-[conic-gradient(at_30%_30%,#fbbf24,#a855f7,#10b981,#fbbf24)] opacity-70 blur-sm group-hover:opacity-90 transition" aria-hidden />
              <div className="relative rounded-2xl bg-zinc-950/95 ring-1 ring-white/10 backdrop-blur-sm p-4 flex flex-col gap-4 shadow-2xl">
                <div className="flex items-center justify-between text-xs uppercase tracking-wide text-zinc-400 px-1">
                  <span className="flex items-center gap-1 font-semibold text-amber-400">Live Tire Scan</span>
                  <button onClick={()=>setShowScanner(false)} className="text-zinc-400 hover:text-zinc-200 transition">Close</button>
                </div>
                <div className="w-full">
                  <CameraClient />
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed px-1">Ensure the entire sidewall text is sharp & evenly lit. The AI will extract size, load & speed ratings plus wear indicators.</p>
              </div>
            </div>
          </div>
        )}

        {showNearby && (
          <div className="w-full max-w-2xl mx-auto space-y-4 text-left">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold tracking-wide text-zinc-700 uppercase">Nearby Shops</h3>
              {coords && (
                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-zinc-500 bg-zinc-100/70 border border-zinc-200 rounded-full px-2 py-1">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-emerald-600"><path d="M12 21s7-6.28 7-11.2A7 7 0 0 0 5 9.8C5 14.72 12 21 12 21Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><circle cx="12" cy="9.5" r="2.5" stroke="currentColor" strokeWidth="1.5"/></svg>
                  <span>You are here • {coords.lat.toFixed(3)}, {coords.lng.toFixed(3)}</span>
                </span>
              )}
            </div>
            {geoError && <p className="text-xs text-red-600">{geoError}</p>}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {shops.map(shop => (
                <Link key={shop.id} href={`/shops/${shop.id}`} className="group relative rounded-xl border border-zinc-200 bg-white p-4 flex flex-col gap-2 hover:border-violet-300 hover:shadow-md transition">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-semibold text-zinc-900 text-sm group-hover:text-violet-700 transition">{shop.name}</h4>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-violet-100 text-violet-700 border border-violet-200">Shop</span>
                  </div>
                  <p className="text-xs text-zinc-500 line-clamp-2">{shop.address}</p>
                  <p className="text-xs text-zinc-400">{shop.phone}</p>
                  <span className="mt-auto inline-flex items-center gap-1 text-[11px] font-medium text-violet-600 group-hover:gap-1.5 transition">View Details <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
                  <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-transparent group-hover:ring-violet-400/40" />
                </Link>
              ))}
              {shops.length === 0 && !geoError && (
                <div className="col-span-full">
                  <div className="relative overflow-hidden rounded-xl border border-dashed border-zinc-300 bg-white/60 p-6 flex flex-col items-center text-center gap-3">
                    <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_30%_20%,rgba(168,85,247,0.08),transparent_60%)]" />
                    <span className="text-3xl select-none">🛞</span>
                    <p className="text-sm font-medium text-zinc-700">No tire shops in range (yet)</p>
                    <p className="text-xs leading-relaxed text-zinc-500 max-w-sm">Try again in a moment, adjust your location permissions, or <a href="/shops/register" className="text-violet-600 hover:text-violet-700 font-medium">register a shop</a>. Your perfect set of tires might be a few blocks (or a refresh) away.</p>
                    <button onClick={()=>{setShowNearby(false); setTimeout(()=>setShowNearby(true),30);}} className="mt-1 inline-flex items-center gap-1 rounded-lg bg-zinc-900 text-white text-xs font-medium px-3 py-1.5 hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 transition">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M4 4v6h6M20 20v-6h-6M20 8A8 8 0 0 0 8 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      Refresh
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </section>
      <section className="space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {['Featured Tire Shop 1','Featured Tire Shop 2','Featured Tire Shop 3','Featured Tire Shop 4'].map((name,i)=>(
            <div key={name} className="h-40 rounded-md border border-zinc-200 bg-zinc-50 flex items-center justify-center text-sm text-zinc-600 font-medium tracking-tight hover:border-zinc-300">
              {name}
            </div>
          ))}
        </div>
        <div className="flex justify-center"><div className="h-px w-40 bg-[repeating-linear-gradient(to_right,transparent,transparent_6px,#999_6px,#999_8px)]" /></div>
      </section>
    </div>
  );
}
