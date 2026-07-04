'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth.store';

const nav = [
  { href: '/dashboard', icon: '🌿', label: 'Overview' },
  { href: '/farm', icon: '🏡', label: 'Farm Profile' },
  { href: '/lab-tests', icon: '🔬', label: 'Lab Tests' },
  { href: '/pesticide-logs', icon: '🧪', label: 'Pesticide Logs' },
  { href: '/compliance', icon: '⚖️', label: 'Compliance' },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  return (
    <aside className="w-60 shrink-0 flex flex-col bg-white border-r border-neutral-100 h-full">
      <div className="h-16 flex items-center px-5 border-b border-neutral-100">
        <span className="text-2xl mr-2">🌱</span>
        <div>
          <p className="text-sm font-bold text-brand-900 leading-tight">CannaRoute</p>
          <p className="text-xs text-neutral-400">Grower Portal</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'sidebar-link',
              pathname === item.href || pathname.startsWith(`${item.href}/`)
                ? 'active bg-brand-900 text-white'
                : '',
            )}
          >
            <span className="text-lg">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-neutral-100">
        <div className="px-2 py-2">
          <p className="text-sm font-medium text-neutral-900 truncate">{user?.firstName} {user?.lastName}</p>
          <p className="text-xs text-neutral-400 truncate">{user?.email}</p>
        </div>
        <button
          onClick={logout}
          className="mt-1 w-full text-left px-3 py-2 text-sm text-neutral-500 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
