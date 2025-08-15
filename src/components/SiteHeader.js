"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const links = [
  { href: '/about', label: 'About' },
  { href: '/shops', label: 'Tire Shops' },
  { href: '/shops/register', label: 'Register Your Shop' }
];

export default function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="relative w-full after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-gradient-to-r after:from-transparent after:via-zinc-200 after:to-transparent">
      <div className="max-w-6xl mx-auto px-4 md:px-6 h-14 md:h-16 flex items-center gap-6">
  <Link href="/" className="group flex items-center gap-2 font-semibold tracking-tight text-zinc-900 text-base md:text-lg">
          <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[conic-gradient(at_30%_30%,#0d9488,#6366f1,#0d9488)] text-white shadow-sm ring-1 ring-inset ring-teal-400/40 group-hover:scale-105 transition-transform">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" className="drop-shadow">
              <circle cx="12" cy="12" r="9" stroke="white" strokeWidth="1.4" />
              <circle cx="12" cy="12" r="4" stroke="white" strokeWidth="1.4" />
              <path d="M12 3v3M21 12h-3M12 21v-3M6 12H3M17.3 6.7l-2.1 2.1M17.3 17.3l-2.1-2.1M6.7 17.3l2.1-2.1M6.7 6.7l2.1 2.1" stroke="white" strokeWidth="1.1" strokeLinecap="round" />
            </svg>
          </span>
          <span className="font-semibold leading-none tracking-tight whitespace-nowrap">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-600 via-cyan-600 to-indigo-600 group-hover:from-teal-500 group-hover:to-indigo-500 transition-colors">TireNear</span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-fuchsia-500 to-amber-500 group-hover:from-indigo-500 group-hover:to-amber-400 transition-colors">By</span>
            <span className="hidden sm:inline align-top ml-0.5 bg-clip-text text-transparent bg-gradient-to-r from-amber-500 via-rose-400 to-teal-500/80 opacity-80 group-hover:opacity-100 transition">.com</span>
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-1.5 text-sm ml-auto">
          {links.map(l => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`group relative px-4 py-2 rounded-xl font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/60 ${active ? 'text-zinc-900' : 'text-zinc-600 hover:text-zinc-900'}`}
              >
                <span className="relative z-10 flex items-center gap-1">
                  {l.label}
                </span>
                <span className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition bg-gradient-to-r from-zinc-100 via-white to-zinc-100 ${active ? '!opacity-100 ring-1 ring-inset ring-teal-500/30 bg-gradient-to-r from-teal-50 via-white to-teal-50' : ''}`}></span>
                {active && <span className="absolute -bottom-px left-3 right-3 h-px bg-gradient-to-r from-teal-500 via-cyan-500 to-indigo-500 rounded-full" />}
              </Link>
            );
          })}
        </nav>
        <button
          aria-label="Toggle Menu"
          onClick={() => setOpen(o => !o)}
          className="md:hidden ml-auto relative h-9 w-9 inline-flex items-center justify-center rounded-lg bg-white/70 backdrop-blur text-zinc-700 shadow-sm ring-1 ring-zinc-200 hover:ring-zinc-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
        >
          <div className="space-y-1.5">
            <span className={`block h-0.5 w-5 bg-current transition ${open ? 'translate-y-2 rotate-45' : ''}`}></span>
            <span className={`block h-0.5 w-5 bg-current transition ${open ? 'opacity-0' : ''}`}></span>
            <span className={`block h-0.5 w-5 bg-current transition ${open ? '-translate-y-2 -rotate-45' : ''}`}></span>
          </div>
        </button>
      </div>
      {/* Mobile panel */}
      <div className={`md:hidden absolute inset-x-0 top-full z-30 origin-top overflow-hidden px-4 transition-[max-height,opacity] duration-300 ${open ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="mt-1 rounded-2xl border border-zinc-200 bg-white/90 backdrop-blur shadow-lg p-2 flex flex-col">
          {links.map(l => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={`px-4 py-3 rounded-xl text-sm font-medium transition flex items-center justify-between ${active ? 'bg-emerald-50 text-emerald-700' : 'text-zinc-700 hover:bg-zinc-100/70 hover:text-zinc-900'}`}
              >
                {l.label}
                {active && <span className="h-2 w-2 rounded-full bg-emerald-500" />}
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}
