'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth.store';

const nav = [
  { href: '/dashboard', icon: '📊', label: 'Dashboard' },
  { href: '/users', icon: '👥', label: 'Users' },
  { href: '/dispensaries', icon: '🏪', label: 'Dispensaries' },
  { href: '/compliance', icon: '⚖️', label: 'Compliance Rules' },
  { href: '/health', icon: '🩺', label: 'System Health' },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  return (
    <aside className="w-60 shrink-0 flex flex-col bg-brand-950 h-full">
      <div className="h-16 flex items-center px-5 border-b border-brand-900">
        <span className="text-2xl mr-2">🌿</span>
        <div>
          <p className="text-sm font-bold text-white leading-tight">CannaRoute</p>
          <p className="text-xs text-brand-400">Admin Panel</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
              pathname === item.href || pathname.startsWith(`${item.href}/`)
                ? 'bg-white/10 text-white'
                : 'text-brand-300 hover:bg-white/5 hover:text-white',
            )}
          >
            <span className="text-lg">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-brand-900">
        <div className="px-2 py-1 mb-2">
          <p className="text-sm font-medium text-white truncate">{user?.firstName} {user?.lastName}</p>
          <p className="text-xs text-brand-400 truncate">{user?.email}</p>
        </div>
        <button
          onClick={logout}
          className="w-full text-left px-3 py-2 text-sm text-brand-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
