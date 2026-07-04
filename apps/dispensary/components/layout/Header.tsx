'use client';

import { usePathname } from 'next/navigation';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/orders': 'Orders',
  '/inventory': 'Inventory',
  '/drivers': 'Drivers',
  '/compliance': 'Compliance',
  '/settings': 'Settings',
};

export function Header() {
  const pathname = usePathname();
  const title = pageTitles[pathname] ?? pageTitles[`/${pathname.split('/')[1]}`] ?? 'Dashboard';

  return (
    <header className="h-16 bg-white border-b border-neutral-100 flex items-center justify-between px-6 shrink-0">
      <h1 className="text-lg font-semibold text-neutral-900">{title}</h1>

      <div className="flex items-center gap-4">
        <span className="text-xs text-neutral-400">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </span>
        <div className="flex items-center gap-2 bg-green-50 text-green-700 text-xs font-medium px-3 py-1.5 rounded-full">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          Live
        </div>
      </div>
    </header>
  );
}
