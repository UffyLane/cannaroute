'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth.store';

const navItems = [
  { href: '/dashboard', icon: '📊', label: 'Dashboard' },
  { href: '/orders', icon: '📋', label: 'Orders' },
  { href: '/inventory', icon: '📦', label: 'Inventory' },
  { href: '/drivers', icon: '🚗', label: 'Drivers' },
  { href: '/compliance', icon: '⚖️', label: 'Compliance' },
  { href: '/settings', icon: '⚙️', label: 'Settings' },
];

export function Sidebar() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  return (
    <aside className="w-64 shrink-0 flex flex-col bg-white border-r border-neutral-100 h-full">
      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-neutral-100">
        <span className="text-2xl mr-2">🌿</span>
        <div>
          <p className="text-sm font-bold text-brand-900 leading-tight">CannaRoute</p>
          <p className="text-xs text-neutral-400">Dispensary Portal</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'sidebar-link',
                isActive ? 'bg-brand-900 text-white' : 'text-neutral-600 hover:bg-brand-50 hover:text-brand-900',
              )}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="px-3 py-4 border-t border-neutral-100">
        <div className="flex items-center gap-3 px-2 py-2 rounded-xl">
          <div className="w-8 h-8 rounded-full bg-brand-900 flex items-center justify-center text-white text-sm font-bold shrink-0">
            {user?.firstName?.[0] ?? '?'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-neutral-900 truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-neutral-400 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="mt-2 w-full text-left px-3 py-2 text-sm text-neutral-500 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
