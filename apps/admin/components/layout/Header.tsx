'use client';

import { usePathname } from 'next/navigation';

const pageTitles: Record<string, string> = {
  '/dashboard':   'Platform Overview',
  '/users':       'Users',
  '/dispensaries':'Dispensaries',
  '/compliance':  'Compliance Rules',
  '/health':      'System Health',
};

export function Header() {
  const pathname = usePathname();
  const title = pageTitles[pathname] ?? pageTitles[`/${pathname.split('/')[1]}`] ?? 'Admin Panel';

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

        {/* Admin badge */}
        <div
          className="flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full"
          style={{
            backgroundColor: 'rgba(239,68,68,0.08)',
            color: '#dc2626',
            border: '1px solid rgba(239,68,68,0.18)',
          }}
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          Admin
        </div>
      </div>
    </header>
  );
}
