'use client';

import { usePathname } from 'next/navigation';

const pageTitles: Record<string, string> = {
  '/dashboard':      'Overview',
  '/farm':           'Farm Profile',
  '/lab-tests':      'Lab Tests & COAs',
  '/pesticide-logs': 'Pesticide Logs',
  '/compliance':     'Compliance',
};

export function Header() {
  const pathname = usePathname();
  const title = pageTitles[pathname] ?? pageTitles[`/${pathname.split('/')[1]}`] ?? 'Overview';

  return (
    <header className="h-16 bg-white border-b border-neutral-100 flex items-center justify-between px-6 shrink-0">
      <h1 className="text-lg font-bold text-neutral-900">{title}</h1>

      <div className="flex items-center gap-3">
        <span className="text-xs text-neutral-400 hidden sm:block">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </span>

        {/* Notification placeholder */}
        <button className="w-9 h-9 rounded-xl border border-neutral-100 flex items-center justify-center text-neutral-400 hover:bg-neutral-50 transition-colors">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        </button>

        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-emerald-100">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Farm Portal
        </div>
      </div>
    </header>
  );
}
