import Link from 'next/link';

export default function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-10 border-t border-zinc-200 bg-white/60 backdrop-blur">
      <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-xs text-zinc-600">
        <div className="space-y-2">
          <h4 className="uppercase tracking-wide font-semibold text-zinc-800 text-[11px]">General</h4>
          <ul className="space-y-1">
            <li><Link href="/about" className="hover:text-zinc-900">About</Link></li>
            <li><Link href="/shops" className="hover:text-zinc-900">Tire Shops</Link></li>
            <li><Link href="/shops/register" className="hover:text-zinc-900">Register</Link></li>
          </ul>
        </div>
        <div className="space-y-2">
          <h4 className="uppercase tracking-wide font-semibold text-zinc-800 text-[11px]">Legal</h4>
          <ul className="space-y-1">
            <li><a href="#" className="hover:text-zinc-900">Terms & Conditions</a></li>
            <li><a href="#" className="hover:text-zinc-900">Privacy</a></li>
            <li><a href="#" className="hover:text-zinc-900">Cookies</a></li>
          </ul>
        </div>
        <div className="space-y-2">
          <h4 className="uppercase tracking-wide font-semibold text-zinc-800 text-[11px]">Social</h4>
          <ul className="space-y-1">
            <li><a href="#" className="hover:text-zinc-900">Facebook</a></li>
            <li><a href="#" className="hover:text-zinc-900">Instagram</a></li>
            <li><a href="#" className="hover:text-zinc-900">Twitter/X</a></li>
          </ul>
        </div>
        <div className="space-y-2">
          <h4 className="uppercase tracking-wide font-semibold text-zinc-800 text-[11px]">Contact</h4>
          <ul className="space-y-1">
            <li><a href="mailto:hello@tireneary.com" className="hover:text-zinc-900">hello@tireneary.com</a></li>
            <li>+1 (555) 010-0101</li>
            <li>Support: 24/7 beta</li>
          </ul>
        </div>
      </div>
  <div className="text-center text-[11px] text-zinc-500 pb-6">© {year} TireNearBy.com</div>
    </footer>
  );
}
